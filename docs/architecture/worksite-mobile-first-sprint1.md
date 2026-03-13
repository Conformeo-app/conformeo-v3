# Sprint 1 - Premier bloc chantier mobile

Ce premier bloc Sprint 1 ouvre seulement trois usages terrain sur mobile :

- voir une liste de chantiers
- ouvrir une fiche chantier essentielle
- préparer un chantier pour le hors ligne
- importer les résumés chantier depuis l'API en lecture seule

## Choix retenu

Le backend chantier complet et le transport distant d'écriture restent hors périmètre.

Pour garder un patch petit et cohérent avec le socle offline-first déjà posé :

- la liste chantier repose sur `local_records`
- les résumés sont stockés sous `worksite_summary`
- la fiche essentielle préparée hors ligne est stockée sous `worksite_detail`
- la préparation hors ligne ne passe pas par la queue locale d'écriture, car ce n'est pas une mutation à envoyer
- les résumés ne viennent plus d'un catalogue mobile hardcodé, mais d'un endpoint API read-only minimal

## Ce que voit l'utilisateur

Liste mobile :

- nom du chantier
- client
- adresse
- statut
- indicateur `prêt hors ligne` ou `à préparer`
- recherche locale simple

Fiche chantier essentielle :

- nom
- client
- adresse
- statut
- contacts utiles si déjà embarqués
- dernières preuves si déjà disponibles
- checklist du jour si déjà disponible

Préparation hors ligne :

- action claire `Préparer hors ligne`
- création locale du bundle essentiel
- indicateur visible avec date de préparation
- consultation sans réseau sur le même appareil

## Limites assumées

- pas de transport serveur chantier à ce stade
- pas de workflow métier complet
- pas de preuve photo métier liée au chantier dans ce ticket
- catalogue local de démonstration uniquement pour matérialiser le bloc Sprint 1
