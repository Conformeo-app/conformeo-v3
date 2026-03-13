# Sprint 1 - Signature simple

S1-030 ajoute une signature tactile simple depuis la fiche chantier mobile.

## Choix retenu

- capture tactile simple sur un canvas local
- rattachement obligatoire au chantier selectionne
- enregistrement immediat sur l'appareil au format image
- ajout d'une operation `create` puis `upload_media` dans la queue locale
- aucune signature electronique avancee ni workflow juridique

## Stockage local

La signature repose sur le socle deja present :

- metadonnees dans `local_records` sous `worksite_signature`
- image locale dans `local_file_references`
- etat d'envoi futur dans `local_sync_queue`

Les metadonnees gardees sont volontairement simples :

- `attached_to_entity_type=worksite`
- `attached_to_entity_id`
- `attached_to_field=signature`
- `document_type=signature`
- `file_name`
- `captured_at`

## UX

Le flux reste court :

1. ouvrir un chantier
2. tracer la signature au doigt
3. enregistrer la signature

Même sans reseau :

- la signature reste visible dans le chantier
- elle reste stockee sur l'appareil
- la queue locale garde l'intention d'envoi pour plus tard
