# Sprint 1 - Etat de synchronisation lisible

S1-051 rend l'etat de synchronisation des objets terrain plus visible et plus rassurant dans l'application mobile, sans ouvrir encore un transport serveur complet.

## Principe retenu

- garder le vocabulaire simple deja pose dans Sprint 0
- reutiliser une seule source de verite pour le wording mobile
- montrer l'etat a trois niveaux utiles :
  - chantier
  - objet terrain
  - lot terrain prepare

## Wording conserve

Les libelles restent strictement limites a :

- `enregistre sur l'appareil`
- `en attente de synchronisation`
- `synchronise`
- `a verifier`

L'utilisateur ne voit pas de termes techniques de file, mutation ou retry.

## Niveaux d'affichage

### Chantier

La fiche chantier affiche un resume clair :

- si un element est en echec local : `a verifier`
- si des elements sont prets a partir : `en attente de synchronisation`
- si tout ce qui est visible est stable localement : `synchronise`
- sinon : `enregistre sur l'appareil`

### Objet terrain

Chaque objet Sprint 1 garde le meme langage :

- `worksite_proof`
- `worksite_voice_note`
- `worksite_safety_checklist`
- `worksite_risk_report`
- `worksite_signature`
- `worksite_equipment_movement`

Le detail associe rappelle que l'objet reste bien disponible sur l'appareil, meme sans reseau.

### Lots prepares

La zone `Synchronisation terrain preparee` expose aussi un etat lisible :

- aucun lot : `enregistre sur l'appareil`
- lot pret ou en preparation : `en attente de synchronisation`
- lot en echec : `a verifier`

## Effet produit

- l'absence de reseau ne bloque pas les flux existants
- le rendu reste coherent entre preuves, notes, checklist, risques et signatures
- la structure reste directement reutilisable pour un futur executant de synchronisation distante

## Raffinement Sprint 6

Le wording visible est encore simplifie sur la surface mobile :

- la zone de suivi parle d'`actions locales a synchroniser` plutot que de queue technique
- les types d'action sont relus en langage simple : creation, mise a jour, retrait, media a envoyer, changement d'etat
- les entites brutes ne sont plus affichees telles quelles quand une lecture metier plus simple existe
- les derniers soucis reseau sont reformules de maniere plus utile pour l'utilisateur
- des retours courts confirment qu'une action reste bien enregistree sur l'appareil, en attente, synchronisee ou a verifier

## Controle Sprint 7

Le controle de coherence reste volontairement cible :

- le statut visible d'un chantier tient aussi compte des mouvements d'equipement encore en attente de synchronisation
- les retours apres action locale rappellent plus explicitement si l'element reste en attente de synchronisation
- la zone des actions locales garde un vocabulaire simple (`pret a envoyer`, `pret a relancer`, `tentative x sur y`) au lieu d'un langage plus technique

Le moteur de synchronisation ne change pas :

- aucun nouveau transport
- aucune file supplementaire
- aucun monitoring complexe
