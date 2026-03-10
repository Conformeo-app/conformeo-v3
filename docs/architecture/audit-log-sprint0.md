# Audit log Sprint 0

## Objectif

Tracer les actions critiques du socle Sprint 0 avec un mécanisme explicite, simple a relire et facile a etendre.

## Structure retenue

Chaque entree d'audit stocke :
- l'organisation concernee si connue
- l'auteur via `actor_user_id` ou `actor_label`
- le type d'action
- la cible via `target_type` + `target_id`
- un `target_display` lisible
- un petit payload `changes`
- la date via `occurred_at`

## Actions reconnues

- `create`
- `update`
- `soft_delete`
- `status_change`
- `module_activation_change`

## Traces branchees au Sprint 0

- bootstrap administrateur minimal :
  - creation de la premiere organisation
  - creation du premier utilisateur actif
  - creation du membership par defaut
  - creation des `organization_modules`
- activation / desactivation d'un module d'organisation

## Lecture minimale

Le backend expose `GET /organizations/{organization_id}/audit-logs?limit=50`.

- acces minimal : permission `organization:read`
- resultat trie du plus recent au plus ancien
- usage cible Sprint 0 : verification backend et support administratif

## Limites assumees

- pas d'ecran front dedie
- pas de diff riche ou de replay
- les futurs flux `update`, `soft_delete` et `status_change` devront appeler explicitement le helper d'audit quand ils seront implementes
