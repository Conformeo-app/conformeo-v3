# Sprint 1 - Photo preuve horodatée

S1-010 ajoute une capture photo preuve simple et locale depuis la fiche chantier mobile.

## Choix retenu

- capture depuis la fiche chantier
- rattachement obligatoire au chantier sélectionné
- enregistrement immédiat dans le stockage local
- miniature visible tout de suite
- horodatage automatique à la capture
- commentaire texte court stocké localement avec la preuve
- ajout d'une opération `upload_media` dans la queue locale

## Stockage local

La photo preuve repose sur le socle Sprint 0 déjà présent :

- métadonnées dans `local_records` sous `worksite_proof`
- fichier local dans `local_file_references`
- état d'envoi futur dans `local_sync_queue`

Les métadonnées restent cohérentes avec le modèle `Document` déjà posé :

- `attached_to_entity_type=worksite`
- `attached_to_entity_id`
- `document_type=photo_proof`
- `source=mobile_capture`
- `file_name`
- `mime_type`
- `size_bytes`
- `captured_at`
- `comment_text`

Le commentaire reste modifiable localement tant qu'il n'y a pas encore de transport distant réel.
Chaque mise à jour de commentaire enrichit la preuve locale et ajoute une opération `update` dans la
queue locale, sans bloquer l'usage hors ligne.

## UX

Le flux reste volontairement court :

1. ouvrir un chantier
2. prendre une photo preuve
3. voir immédiatement la miniature, l'horodatage et ajouter un commentaire court si besoin

Même sans réseau :

- la photo reste disponible localement
- le chantier affiche la preuve tout de suite
- la queue locale garde l'intention `upload_media` pour plus tard
