# Sprint 1 - Signalement de risque

S1-021 ajoute un signalement de risque tres court et local depuis la fiche chantier mobile.

## Choix retenu

- creation depuis la fiche chantier
- rattachement obligatoire au chantier selectionne
- 3 champs minimum : type, gravite simple, note courte
- photo optionnelle en reutilisant le pipeline photo local deja en place
- ajout d'une operation `create` dans la queue locale
- ajout d'une operation `upload_media` seulement si une photo est jointe

## Stockage local

Le signalement repose sur le socle Sprint 0 et Sprint 1 deja present :

- metadonnees dans `local_records` sous `worksite_risk_report`
- photo optionnelle dans `local_file_references`
- etat d'envoi futur dans `local_sync_queue`

Chaque signalement garde au minimum :

- `worksite_id`
- `risk_type`
- `severity`
- `note_text`
- `captured_at`
- `photo_file_name` si une photo est jointe

## UX

Le flux reste volontairement court :

1. ouvrir un chantier
2. choisir un type de risque, une gravite et saisir une note courte
3. ajouter une photo si besoin puis enregistrer

Même sans reseau :

- le signalement reste visible dans le chantier
- la photo optionnelle reste disponible sur l'appareil
- la queue locale garde l'intention de synchronisation pour plus tard
