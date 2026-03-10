# Modele document / piece jointe Sprint 0

## Objectif

Poser un modele transverse unique pour representer un document ou une piece jointe, reutilisable plus tard par les modules Reglementation, Chantier et Facturation.

## Entite retenue

Entite : `Document`

Ce modele couvre :
- une piece jointe importee ou capturee
- un document genere plus tard par un module
- un rattachement simple a une entite metier

## Champs principaux

- `organization_id`
- `attached_to_entity_type`
- `attached_to_entity_id`
- `attached_to_field`
- `uploaded_by_user_id`
- `document_type`
- `source`
- `status`
- `file_name`
- `mime_type`
- `size_bytes`
- `storage_key`
- `checksum`
- `uploaded_at`
- `created_at`
- `updated_at`
- `deleted_at`

## Rattachement metier

Le rattachement reste generique :
- `attached_to_entity_type` identifie la famille d'entite, par exemple `chantier`, `equipment`, `invoice`
- `attached_to_entity_id` identifie l'entite cible
- `attached_to_field` permet plus tard de preciser un sous-emplacement logique si necessaire

Ce choix evite de figer trop tot des relations specifiques a un module.

## Statut Sprint 0

Statuts minimaux :
- `pending`
- `available`
- `failed`
- `archived`

Ils suffisent pour preparer un futur upload, un document disponible, un echec simple ou un archivage logique.

## Limites assumees

- pas de GED
- pas de moteur de stockage avance
- pas de versionning documentaire
- pas d'UI documentaire metier
- pas de permissions documentaires fines
