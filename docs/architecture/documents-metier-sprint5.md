# Sprint 5 — Documents métier simples

Ce bloc Sprint 5 ajoute un premier gain de temps transverse, sans moteur d'automatisation complexe.

## Document métier livré

Premier document généré :
- `Fiche chantier PDF`
- `Plan de prévention simplifié PDF`
- `Document chantier léger` explicitement rattaché au chantier après génération

Source de données réutilisée :
- résumé chantier desktop
- devis liés au chantier
- factures liées au chantier
- informations entreprise déjà connues

Choix de conception :
- document textuel simple, immédiatement partageable
- aucune variante de template
- aucun stockage serveur du PDF généré
- si `facturation` n'est pas activé, la fiche reste générable mais n'affiche pas les documents financiers
- le plan de prévention reste un modèle simple, non expert, à relire avant intervention

## Plan de prévention simplifié

Contenu prérempli quand c'est possible :
- entreprise intervenante
- chantier
- donneur d'ordre
- date utile
- contacts disponibles
- contexte d'intervention simple
- points de vigilance simples
- mesures ou consignes simples

Règles de préremplissage :
- le donneur d'ordre reprend le client Facturation uniquement si le nom correspond exactement au nom déjà connu sur le chantier
- sinon le document garde le nom du client chantier et laisse les coordonnées à compléter
- les points de vigilance et consignes restent génériques, sobres et assumés comme un modèle simple

## Ajustement léger avant export

Le plan de prévention peut être ajusté juste avant export :
- date utile
- contexte d'intervention
- points de vigilance
- mesures / consignes
- contact utile complémentaire

Choix de conception :
- panneau inline dans la vue chantier
- pas de sauvegarde longue durée
- pas de workflow multi-étapes
- export direct du PDF final avec les valeurs ajustées
- aperçu texte léger dans le même panneau avant téléchargement
- action simple pour revenir au préremplissage initial
- pas de prévisualisation PDF ni de viewer embarqué

## Rattachement document -> chantier

Le rattachement reste volontairement léger :
- réutilisation du modèle transverse `Document`
- lien explicite `attached_to_entity_type = worksite`
- un enregistrement léger est mis à jour lors de la génération d'une fiche chantier PDF
- un enregistrement léger est mis à jour lors de la génération d'un plan de prévention PDF
- aucun stockage binaire serveur supplémentaire
- aucune GED, aucun versioning riche

## Statut brouillon / finalisé

Les documents chantier générés portent un statut métier simple :
- `brouillon`
- `finalisé`

Choix de conception :
- statut distinct du statut technique de disponibilité du document
- lecture et bascule légère directement dans la vue chantier
- aucun workflow multi-étapes
- aucune validation ou signature légale

## Consultation simple des documents chantier

La consultation reste volontairement légère :
- une section dédiée `Documents chantier` dans le desktop
- des filtres légers par chantier, type et statut `brouillon / finalisé`
- une lecture directe du type de document, du nom de fichier, de la date utile de génération, des statuts et des liens utiles
- aucune navigation multi-niveaux
- aucune recherche documentaire avancée

## Rattachement document -> signature

Le lien avec la signature reste lui aussi volontairement léger :
- réutilisation du modèle transverse `Document` quand il représente déjà une signature chantier
- ajout d'un lien explicite entre un document chantier généré et une signature existante du même chantier
- lecture simple de la signature liée dans la vue chantier et dans la consultation documentaire
- modification légère via un sélecteur simple côté desktop
- aucun moteur de signature avancé, aucune certification et aucun workflow juridique

## Rattachement document -> preuves

Le lien avec les preuves terrain suit la même logique légère :
- réutilisation du modèle transverse `Document` quand il représente déjà une preuve chantier
- ajout d'une liste explicite de preuves déjà existantes sur le document chantier
- lecture directe des preuves liées dans la vue chantier et dans la consultation documentaire
- modification légère par sélection simple des preuves du même chantier
- aucune GED, aucune navigation documentaire avancée, aucune logique de preuve experte

## Exploitation légère des documents chantier

La consultation desktop devient plus directement exploitable :
- un bouton simple de téléchargement rapide par document
- pour les plans de prévention, un accès direct à l'ajustement léger déjà existant
- un panneau court `voir les éléments liés` pour relire signature et preuves sans navigation lourde
- le téléchargement rapide réutilise la génération PDF existante, sans stockage documentaire supplémentaire
- des filtres légers par chantier, type et statut `brouillon / finalisé`
- un accès direct depuis la vue chantier du cockpit vers la section `Documents chantier`
- quelques métadonnées de lecture utiles : type, dernière génération, statut, présence de signature et nombre de preuves

## Préremplissage utile

Le préremplissage reste volontairement explicable :
- depuis un chantier, un devis ou une facture reprend le chantier courant
- si le nom client du chantier correspond exactement à un client existant, ce client est repris
- depuis un client, un devis ou une facture reprend ce client
- si un seul chantier correspond clairement à ce client, il est repris

Règle importante :
- pas d'inférence large, pas de matching flou opaque, pas de comportement "magique"

## Actions rapides

Actions ajoutées :
- depuis la vue chantier du cockpit :
  - `Préparer un devis`
  - `Préparer une facture`
  - `Fiche chantier PDF`
  - `Ajuster le plan`
- depuis la vue client du cockpit :
  - `Préparer un devis`
  - `Préparer une facture`
- depuis la liste clients Facturation :
  - `Préparer un devis`
  - `Préparer une facture`

Effet recherché :
- réduire la ressaisie
- garder une lecture claire
- transformer des vues passives en points d'entrée utiles
