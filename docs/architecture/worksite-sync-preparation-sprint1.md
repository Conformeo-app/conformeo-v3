# Sprint 1 - Synchronisation locale des preuves terrain

S1-050 consolide la preparation locale des objets terrain deja captures, sans ouvrir encore un transport serveur complet.

## Choix retenu

- garder la queue locale generique existante
- ajouter une couche de preparation locale dediee aux objets terrain
- reutiliser intelligemment les operations deja en queue pour eviter les doublons evidents
- produire des lots locaux dedoublonnes, lisibles et reutilisables plus tard par un vrai transport distant

## Objets couverts

- `worksite_proof`
- `worksite_voice_note`
- `worksite_safety_checklist`
- `worksite_risk_report`
- `worksite_signature`
- `worksite_equipment_movement`

## Consolidation locale

La preparation locale suit deux principes simples :

- pour une meme entite terrain, les operations locales mergeables (`create`, `update`, `status_change`) reutilisent l'operation active deja presente au lieu d'empiler des doublons
- les operations `upload_media` reutilisent aussi l'entree active deja presente pour cette meme entite

Cela garde une queue plus lisible quand l'utilisateur modifie plusieurs fois un meme objet local avant toute synchronisation distante.

## Lot prepare

Une vue locale dediee produit ensuite des lots terrain dedoublonnes :

- un lot `mutation` pour les metadonnees de l'entite
- un lot `media_upload` si un fichier doit partir plus tard

Chaque lot garde :

- l'entite cible
- la liste des operations source regroupees
- le payload courant local le plus pertinent
- le statut local consolide (`pending`, `in_progress`, `failed`)

## Effet sur les statuts

- les statuts utilisateur restent inchanges : `enregistre sur l'appareil`, `en attente de synchronisation`, `synchronise`, `a verifier`
- les doublons sont evites au moment de preparer la queue locale, sans bloquer les usages hors ligne
- la structure reste directement branchable sur un futur executant de synchro distante
