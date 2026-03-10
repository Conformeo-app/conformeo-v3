# Modèle de synchronisation Sprint 0

## Objectif

Formaliser un contrat de synchronisation minimal, compatible avec un produit mobile-first offline-first, sans implémenter dès maintenant la queue complète.

## Principes

- Le mobile est autorisé à travailler hors ligne sur les workflows terrain critiques.
- Le serveur reste la source canonique finale.
- Chaque enregistrement synchronisable porte une `version` entière incrémentée côté serveur.
- Les suppressions sont logiques via `deleted_at`.
- La synchronisation fonctionne par échange d'enveloppes de mutation et de curseurs de lecture.

## Entités concernées au Sprint 0

- `organizations`
- `organization_memberships`
- `users`

Le contrat est extensible à d'autres entités sans changer le protocole de base.

## Métadonnées minimales sur chaque enregistrement

- `id`
- `version`
- `created_at`
- `updated_at`
- `deleted_at`

Ces champs permettent :
- l'identification stable
- la détection de conflit
- la diffusion incrémentale des changements
- la suppression logique compatible offline

## Contrat de push

Le client prépare une `SyncMutationEnvelope` :
- `mutation_id` : identifiant idempotent de la mutation locale
- `entity_name` : type d'entité touchée
- `entity_id` : identifiant métier de l'enregistrement
- `operation` : `upsert` ou `delete`
- `base_version` : version connue localement au moment de l'édition
- `submitted_at` : horodatage local
- `submitted_by` : utilisateur à l'origine de la mutation
- `organization_id` : portée éventuelle
- `payload` : état sérialisé à appliquer

## Contrat de pull

Le client fournit :
- `device_id`
- `organization_id`
- `entities`
- `cursor`
- `limit`

Le serveur renvoie :
- une liste ordonnée d'items
- un `next_cursor` opaque
- un booléen `has_more`

## Règle de résolution de conflit Sprint 0

- Si `base_version` correspond à la version serveur courante, la mutation est appliquée et la version est incrémentée.
- Si `base_version` ne correspond pas, le serveur renvoie un état `conflict` avec un snapshot serveur.
- Aucune fusion automatique de champs n'est introduite au Sprint 0.

Cette décision privilégie la sûreté et la lisibilité avant l'optimisation.

## Ce qui n'est pas implémenté à ce stade

- queue locale
- table de checkpoints
- journal serveur de sync complet
- résolution interactive des conflits
- support pièces jointes

## Conséquence pour le sprint suivant

Le sprint suivant pourra implémenter la première brique opérationnelle de sync autour de trois éléments déjà cadrés :
- le format des enveloppes
- les versions de ligne
- les curseurs de lecture
