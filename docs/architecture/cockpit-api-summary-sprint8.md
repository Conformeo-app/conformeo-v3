# Sprint 8 — Branchement API complémentaire cockpit

Objectif :
- stabiliser la lecture la plus sensible du cockpit sans créer un backend analytique riche
- réduire la dépendance du desktop à plusieurs agrégations locales pour les premiers repères visibles
- garder un périmètre léger et crédible en pilote

## Choix retenu

Le ticket branche uniquement un résumé cockpit simple via :

```bash
GET /organizations/{organization_id}/cockpit-summary
```

Ce point retourne seulement :
- les KPI de la vue d'ensemble
- les alertes simples
- la synthèse par module

Les sections plus profondes restent locales :
- actions à faire
- vue par chantier
- vue par client
- filtres et lectures détaillées

## Pourquoi ce périmètre

Cette zone est la plus visible au chargement du cockpit.

La brancher côté API améliore :
- la stabilité de lecture des repères hauts
- la cohérence des calculs entre modules
- le ressenti de chargement, car le desktop peut afficher un premier résumé sans attendre toutes les listes détaillées

Ce ticket ne fait pas :
- aucun dashboard analytique riche
- aucun historique cockpit
- aucune navigation supplémentaire

## Résumé

Le cockpit garde sa lecture simple.

Le haut du cockpit est maintenant mieux branché au backend, tandis que le reste du cockpit continue d'assembler localement les vues plus détaillées tant que cela reste suffisant pour le pilote.
