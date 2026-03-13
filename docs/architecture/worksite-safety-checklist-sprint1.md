# Sprint 1 - Checklist sécurité simple

S1-020 ajoute une checklist sécurité courte et locale dans la fiche chantier mobile.

## Choix retenu

- une seule checklist sécurité simple par chantier pour Sprint 1
- 4 points fixes, pensés pour être remplis vite sur téléphone
- réponses `oui`, `non` ou `N/A`
- commentaire global optionnel
- statut local `brouillon` ou `validé`

## Stockage local

La checklist repose sur les briques déjà présentes :

- métadonnées dans `local_records` sous `worksite_safety_checklist`
- statut de synchronisation futur dans `local_sync_queue`

Chaque enregistrement garde :

- `worksite_id`
- `status`
- `comment_text`
- `items`
- `updated_at`

## Synchronisation locale

Sans transport serveur pour l'instant :

- premier enregistrement : opération `create`
- modification de réponses ou commentaire : opération `update`
- passage en `validé` ou retour en `brouillon` : opération `status_change`

La checklist reste lisible et modifiable même sans réseau.

## UX

Le flux reste court :

1. ouvrir un chantier
2. répondre aux 4 points
3. enregistrer en brouillon ou valider

La validation demande seulement que tous les points aient une réponse.
