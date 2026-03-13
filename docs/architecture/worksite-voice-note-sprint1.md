# Sprint 1 - Note vocale chantier

S1-012 ajoute une note vocale chantier simple et locale depuis la fiche chantier mobile.

## Choix retenu

- enregistrement depuis la fiche chantier
- rattachement obligatoire au chantier sélectionné
- stockage immédiat dans le socle local existant
- lecture locale via le lecteur audio natif du navigateur ou de la WebView
- ajout d'une opération `upload_media` dans la queue locale

## Stockage local

La note vocale repose sur les briques déjà présentes :

- métadonnées dans `local_records` sous `worksite_voice_note`
- fichier local dans `local_file_references`
- état d'envoi futur dans `local_sync_queue`

Les métadonnées restent alignées avec le modèle `Document` déjà posé :

- `attached_to_entity_type=worksite`
- `attached_to_entity_id`
- `attached_to_field=voice_note`
- `document_type=voice_note`
- `source=mobile_capture`
- `file_name`
- `mime_type`
- `size_bytes`
- `captured_at`
- `duration_seconds`

## UX

Le flux reste volontairement court :

1. ouvrir un chantier
2. enregistrer une note vocale
3. relire immédiatement la note sur l'appareil

Même sans réseau :

- la note vocale reste disponible localement
- le chantier l'affiche tout de suite
- la queue locale garde l'intention `upload_media` pour plus tard

Cette version Sprint 1 ne met pas encore en place de transport serveur, de transcription ni de galerie média avancée.
