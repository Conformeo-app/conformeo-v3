# Queue locale de synchronisation Sprint 0

## Objectif

Poser une file locale d'operations synchronisables pour preparer les workflows offline-first du terrain, sans implementer encore la synchronisation distante complete.

## Structure retenue

Table locale : `local_sync_queue`

Champs principaux :
- `operation_id`
- `organization_id`
- `entity_name`
- `entity_id`
- `operation_type`
- `status`
- `base_version`
- `payload`
- `attempts`
- `max_attempts`
- `next_attempt_at`
- `last_attempt_at`
- `failed_at`
- `last_error_code`
- `last_error_message`
- `created_at`
- `updated_at`

## Types d'operations Sprint 0

- `create`
- `update`
- `delete_soft`
- `upload_media`
- `status_change`

## Statuts locaux

- `pending`
- `in_progress`
- `failed`
- `completed`

## Retry et reprise

- une operation `pending` est relisible immediatement
- une operation `failed` peut redevenir eligible via `next_attempt_at`
- un backoff simple est applique localement apres echec
- une replanification manuelle reste possible

## Surface locale disponible

- ajout d'une operation dans la queue
- lecture de la queue locale
- lecture des operations retryables
- marquage `in_progress`
- enregistrement simple d'echec
- marquage `completed`
- replanification manuelle

## Exemple concret Sprint 0

La petite surface mobile de demonstration utilise `field_draft` comme entite locale minimale :
- la creation d'un brouillon ajoute automatiquement une operation `create`
- d'autres operations de queue peuvent etre ajoutees localement sur ce brouillon sans ouvrir de workflow metier complet

## Rendu UI Sprint 0

L'application mobile affiche maintenant l'etat de synchronisation a deux niveaux :
- un etat global derive de la queue locale
- un etat par brouillon local `field_draft`

Le wording reste volontairement non technique :
- `enregistre sur l'appareil`
- `en attente de synchronisation`
- `synchronise`
- `a verifier`

Les statuts affiches restent derives uniquement de la base locale et de la queue locale :
- `pending` ou `in_progress` rendent `en attente de synchronisation`
- `failed` rend `a verifier`
- `completed` sans autre operation restante sur la meme entite rend `synchronise`

L'absence de reseau n'empeche pas l'enregistrement local. L'UI rappelle simplement que les changements restent sur l'appareil jusqu'au prochain passage de synchronisation.

## Limites assumees

- pas encore de transport vers l'API
- pas encore de moteur automatique de pompage de queue
- pas encore de gestion complete des medias
- pas encore de resolution de conflit distante
