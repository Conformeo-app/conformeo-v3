# Base locale mobile Sprint 0

## Objectif

Poser une base locale persistante pour l'application mobile afin de preparer les usages offline-first sans encore implementer la queue de synchronisation.

## Choix retenu

- moteur principal : SQLite via `@capacitor-community/sqlite`
- stockage natif persistant sur iOS / Android
- support web de developpement via `jeep-sqlite` + `sql.js`

Ce choix reste coherent avec un produit mobile-first terrain :
- persistance robuste apres fermeture de l'app
- requetes SQL simples et predictibles
- bonne base pour futures donnees chantier, references de preuves et queue de sync

## Structure locale Sprint 0

Tables posees :
- `local_settings`
  - metadonnees locales simples
- `local_records`
  - stockage generique JSON par `entity_name` + `record_id`
  - colonnes `organization_id`, `sync_status`, `version`, `deleted_at`
- `local_file_references`
  - references locales de fichiers pour preparer les futures preuves terrain
  - enrichies en Sprint 0 avec `file_name`, `document_type`, `source` et `captured_at` pour la capture photo locale
- `local_schema_migrations`
  - historique d'application des migrations locales

## Strategie de migration

- la base locale embarque un tableau ordonne de migrations applicatives
- au demarrage, l'app compare les versions deja appliquees dans `local_schema_migrations`
- les migrations manquantes sont executees transactionnellement

Cette strategie reste simple :
- pas d'outil externe
- pas de refactor global
- lecture facile en revue

## Surface Sprint 0

- initialisation de la base au lancement de l'app mobile
- lecture / ecriture locale via un helper dedie
- persistance web explicite via `saveToStore`
- petite surface de verification dans l'app pour enregistrer des brouillons locaux
- capture photo locale avec miniature immediate et horodatage conserve

## Limites assumees

- la queue locale est maintenant posee separement, mais sans transport distant
- pas encore de tables metier chantier
- pas encore de gestion binaire complete des preuves
- pas encore de politique de nettoyage local
