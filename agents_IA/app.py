import os
import re
import requests
import streamlit as st
import gspread
from google.oauth2.service_account import Credentials
from crewai import Agent, Task, Crew, Process, LLM
from crewai_tools import SerperDevTool

# --- 1. CONFIGURATION DES ACCÈS (À REMPLIR) ---

# Configuration Google Sheets (DEV)
# Assure-toi d'avoir le fichier 'credentials.json' dans le même dossier
GOOGLE_SHEETS_NAME = "Ma_Feuille_De_Veille_BTP" # Nom exact du fichier Sheets
SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]

# Configuration Airtable (PROD)
AIRTABLE_API_KEY = "ton_token_pat_airtable"
AIRTABLE_BASE_ID = "ton_base_id"
AIRTABLE_TABLE_NAME = "Veille_Reglementaire"

# Configuration Serper
os.environ["SERPER_API_KEY"] = "aadb1db95ef37c695e32cddd9ea2862b297e7235" 

# --- 2. INTERFACE STREAMLIT ---
st.set_page_config(page_title="HSE BTP - Dev & Prod", page_icon="🏗️", layout="wide")

st.sidebar.title("📑 Sommaire HSE")
sujet_utilisateur = st.sidebar.radio(
    "Domaines réglementaires :",
    [
        "Règles générales d'installation de chantier",
        "Normes Sécurité et Prévention Incendie",
        "Le PPSPS (Plan Particulier de Sécurité)",
        "Le PDP (Plan de Prévention)",
        "Le DUERP (Document Unique d'Évaluation des Risques)",
        "Certifications obligatoires"
    ]
)

st.title(f"👷‍♂️ Analyse : {sujet_utilisateur}")

# --- 3. LOGIQUE CREW AI ---
if st.button("🏗️ Lancer l'analyse réglementaire"):
    with st.spinner("Les agents travaillent..."):
        llm_local = LLM(model="ollama/mistral", base_url="http://localhost:11434")
        outil_recherche = SerperDevTool(country="fr", locale="fr", n_results=10)

        chercheur = Agent(
            role="Juriste HSE BTP",
            goal=f"Trouver définition et obligations pour {sujet_utilisateur} en France.",
            backstory="Expert juridique spécialisé dans le Code du Travail et les normes de chantier.",
            tools=[outil_recherche],
            llm=llm_local,
            verbose=True
        )

        vulgarisateur = Agent(
            role="Consultant Prévention",
            goal="Rédiger un rappel général et un tableau d'obligations en français.",
            backstory="Formateur en sécurité qui rend les textes de loi actionnables.",
            llm=llm_local,
            verbose=True
        )

        tache_recherche = Task(
            description=f"Chercher la définition et les règles strictes pour : {sujet_utilisateur}.",
            expected_output="Liste structurée en français avec définitions et sources.",
            agent=chercheur
        )

        tache_redaction = Task(
            description="Structurer le document avec : ### 📖 Rappel Général et ### 📋 Tableau des Obligations.",
            expected_output="Document Markdown complet en français.",
            agent=vulgarisateur
        )

        equipe = Crew(agents=[chercheur, vulgarisateur], tasks=[tache_recherche, tache_redaction], process=Process.sequential)
        resultat = equipe.kickoff()
        
        st.session_state['dernier_resultat'] = resultat.raw
        st.success("Analyse terminée !")

# --- 4. AFFICHAGE ET EXPORT ---
if 'dernier_resultat' in st.session_state:
    st.markdown(st.session_state['dernier_resultat'])
    st.markdown("---")
    
    col_dev, col_prod = st.columns(2)

    # --- BOUTON DEV : GOOGLE SHEETS (GSPREAD) ---
    with col_dev:
        st.subheader("🛠️ Mode DEV")
        if st.button("Exporter vers Google Sheets", use_container_width=True):
            try:
                # 1. Connexion gspread
                creds = Credentials.from_service_account_file("credentials.json", scopes=SCOPES)
                client = gspread.authorize(creds)
                spreadsheet = client.open(GOOGLE_SHEETS_NAME)
                
                # 2. Gestion des onglets : On crée un onglet par sujet (max 30 caractères pour Google Sheets)
                nom_onglet = sujet_utilisateur[:30] 
                
                try:
                    # On essaie d'ouvrir l'onglet du sujet
                    sheet = spreadsheet.worksheet(nom_onglet)
                except gspread.exceptions.WorksheetNotFound:
                    # S'il n'existe pas, on le crée avec des en-têtes !
                    sheet = spreadsheet.add_worksheet(title=nom_onglet, rows="100", cols="10")
                    sheet.append_row(["Date / Contexte", "Élément / Action", "Détails", "Source"]) 
                
                # 3. Découpage "intelligent" du tableau Markdown de l'IA
                contenu_brut = st.session_state['dernier_resultat']
                lignes_a_inserer = []
                
                # On parcourt chaque ligne du résultat de l'IA
                for ligne in contenu_brut.split('\n'):
                    ligne = ligne.strip()
                    
                    # Si la ligne ressemble à une ligne de tableau (commence par | et n'est pas une ligne de séparation ---)
                    if ligne.startswith('|') and not re.match(r'^\|[- :|]+\|$', ligne):
                        
                        # On ignore la ligne d'en-tête générée par l'IA si elle contient des mots clés classiques
                        if "Obligation" not in ligne and "Objet" not in ligne:
                            
                            # On découpe les colonnes en enlevant les '|'
                            colonnes_propres = [cellule.strip() for cellule in ligne.strip('|').split('|')]
                            
                            # On prépare la ligne finale : Le sujet + les colonnes de l'IA
                            lignes_a_inserer.append([sujet_utilisateur] + colonnes_propres)
                
                # 4. Envoi des lignes découpées vers le Google Sheets
                if lignes_a_inserer:
                    sheet.append_rows(lignes_a_inserer)
                    st.success(f"✅ Lignes ajoutées proprement dans l'onglet : {nom_onglet}")
                else:
                    # Plan de secours : si l'IA a mal fait son tableau, on met le texte brut
                    sheet.append_row([sujet_utilisateur, "Texte brut complet", contenu_brut])
                    st.warning("Le format n'était pas un tableau parfait, le texte a été inséré en brut.")
                    
            except Exception as e:
                st.error(f"Erreur gspread : {e}")