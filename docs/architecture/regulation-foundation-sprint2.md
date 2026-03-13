# Réglementation Sprint 2

Ce premier bloc Sprint 2 pose seulement la fondation bureau du module Réglementation :
- un onboarding entreprise très court
- un profil entreprise modifiable
- une structure simple de sites / bâtiments

## Principes retenus

- surface principale : desktop Angular
- langage simple, sans jargon réglementaire
- progression en deux temps : initialiser l'entreprise, puis compléter au fil de l'eau
- aucun moteur réglementaire V1 ouvert à ce stade

## S2-001 Onboarding entreprise

L'onboarding collecte uniquement les champs nécessaires pour démarrer :
- nom d'entreprise
- activité principale
- présence de salariés
- effectif
- email de contact

Quand ce minimum est rempli, `onboarding_completed_at` est enregistré sur l'organisation.

## S2-002 Profil entreprise

Le profil reste volontairement court et réutilise `organizations` au lieu d'ouvrir une table séparée :
- `activity_label`
- `employee_count`
- `has_employees`
- `contact_email`
- `contact_phone`
- `headquarters_address`
- `notes`

Ce choix garde le modèle simple tout en préparant le futur périmètre réglementaire.

## S2-003 Sites / bâtiments

Les sites sont portés par `organization_sites` avec un rattachement direct à l'organisation.

Champs retenus :
- `name`
- `address`
- `site_type`
- `status`

Valeurs de type simples :
- `site`
- `building`
- `office`
- `warehouse`

Statuts simples :
- `active`
- `archived`

## API minimale

Endpoints ajoutés :

```text
GET   /organizations/{organization_id}/profile
PATCH /organizations/{organization_id}/profile
GET   /organizations/{organization_id}/sites
POST  /organizations/{organization_id}/sites
PATCH /organizations/{organization_id}/sites/{site_id}
```

Le bloc reste volontairement read/write minimal :
- pas de workflow réglementaire
- pas de moteur d'obligations
- pas de structure multi-niveaux complexe pour les bâtiments

## UX desktop

Le bureau Angular montre trois zones très lisibles :
- activation du module Réglementation
- onboarding entreprise si l'initialisation n'est pas terminée
- profil entreprise et premiers sites une fois le module actif

L'objectif est de préparer la suite sans surcharger l'utilisateur.
