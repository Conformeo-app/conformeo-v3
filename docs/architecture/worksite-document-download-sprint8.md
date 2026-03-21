# Sprint 8 — Récupération stable des documents chantier

Objectif :
- récupérer plus proprement un document chantier déjà généré
- éviter de dépendre uniquement d'une régénération immédiate
- rester léger, sans GED ni versioning riche

Choix retenu :
- conserver le dernier PDF généré directement sur l'objet `Document`
- exposer un téléchargement par `document_id`
- garder la régénération existante pour produire ou mettre à jour ce fichier

Ce que cela change :
- un document chantier déjà généré peut être retéléchargé via son enregistrement documentaire
- la récupération ne dépend plus systématiquement de la route de génération par chantier
- les nouveaux PDF chantier stockent :
  - le contenu binaire
  - la taille
  - un checksum
  - une clé de stockage légère

Compatibilité :
- les documents déjà générés avant ce ticket peuvent ne pas encore avoir de contenu stocké
- dans ce cas, un fallback de régénération simple est utilisé pour réamorcer un fichier récupérable

Ce que le ticket ne fait pas :
- aucune GED
- aucun historique multi-versions
- aucun moteur de recherche documentaire
- aucun stockage documentaire externe complexe
