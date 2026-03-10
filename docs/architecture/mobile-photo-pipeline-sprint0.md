# Pipeline photo local Sprint 0

## Objectif

Permettre une capture photo locale simple dans l'application mobile, avec stockage immediat sur l'appareil, horodatage conserve et miniature visible sans attendre de synchronisation distante.

## Choix retenu

- capture via un champ `input[type=file]` avec `accept="image/*"` et `capture="environment"`
- lecture locale via `FileReader`
- stockage persistant dans SQLite mobile via `local_file_references`
- miniature immediate affichee a partir de la data URL stockee localement

Ce choix reste volontairement simple :
- pas de plugin camera supplementaire
- pas de transport serveur
- pas de galerie complexe

## Structure locale

La photo capturee est stockee dans `local_file_references` avec :
- `file_id`
- `file_name`
- `document_type = photo`
- `source = mobile_capture`
- `local_uri`
- `mime_type`
- `size_bytes`
- `captured_at`

Une entree `document_draft` est aussi creee dans `local_records` pour rester coherente avec le futur modele transverse `Document`.

## Limites assumees

- l'image est stockee en data URL pour Sprint 0, ce qui privilegie la simplicite sur l'optimisation
- pas encore d'upload distant
- pas encore de compression, annotation ou galerie documentaire avancee
