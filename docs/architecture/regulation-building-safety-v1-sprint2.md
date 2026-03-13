# Sécurité bâtiment V1 Sprint 2

Ce bloc ajoute un suivi bâtiment très simple pour rendre la conformité plus concrète dans le desktop.

## Périmètre retenu

Le suivi V1 couvre seulement :
- extincteurs
- DAE
- contrôles périodiques simples

Chaque élément est rattaché à un `organization_site`.

## Modèle simple

Le modèle `building_safety_items` stocke :
- `organization_id`
- `site_id`
- `item_type`
- `name`
- `next_due_date`
- `last_checked_at`
- `status`
- `notes`

Le statut d'alerte affiché à l'utilisateur est dérivé :
- `ok`
- `due_soon`
- `overdue`
- `archived`

## Alertes simples

Les alertes restent volontairement lisibles :
- échéance proche : échéance dans les 30 jours
- élément en retard : échéance dépassée

Le wording desktop reste non technique :
- `À jour`
- `Échéance proche`
- `En retard`
- `Archivé`

## Vue par site / bâtiment

Le desktop propose :
- un filtre simple par site / bâtiment
- la liste des éléments concernés
- les alertes associées au filtre courant
- une édition légère d'un élément existant pour mettre à jour la prochaine échéance, le dernier contrôle et son statut simple

Cette vue par site reste volontairement légère et directe.

L'objectif est de donner une vue pratique, pas de construire une GMAO.

## API minimale

```text
GET   /organizations/{organization_id}/building-safety-items
GET   /organizations/{organization_id}/building-safety-alerts
POST  /organizations/{organization_id}/building-safety-items
PATCH /organizations/{organization_id}/building-safety-items/{item_id}
```

Le bloc reste volontairement limité :
- pas de maintenance complexe
- pas de workflow multi-étapes
- pas de tableau de bord avancé
