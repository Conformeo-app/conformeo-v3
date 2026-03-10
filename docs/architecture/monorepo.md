# Monorepo Sprint 0

## Objectif

Poser une structure de dépôt simple et stable pour démarrer Conforméo sans lancer trop de chantiers en parallèle.

## Structure retenue

```text
apps/
  api/         FastAPI + modèles PostgreSQL + migrations
  mobile/      future application Ionic/Capacitor/Angular
  web/         future application Angular desktop
packages/
  contracts/   contrats TypeScript partagés
docs/
  architecture/ documents de cadrage technique
tests/         vérifications structurelles Sprint 0
```

## Principes

- `apps/web` et `apps/mobile` sont réservés mais non bootstrapés en Sprint 0.
- `apps/api` contient le socle FastAPI minimal et les premiers modèles persistance.
- `packages/contracts` porte les contrats partagés de niveau Sprint 0.
- Les modèles métier restent petits et compatibles avec une montée en charge incrémentale.

## Décisions explicites

- Monorepo géré côté JavaScript par `pnpm`.
- Backend Python géré indépendamment via `apps/api/pyproject.toml`.
- Aucun générateur de code entre Python et TypeScript en Sprint 0.
- Les contrats partagés servent de référence de structure, en attendant un éventuel alignement automatisé plus tard.

## Ce qui est différé

- Bootstrap effectif Angular desktop.
- Bootstrap effectif Ionic/Capacitor mobile.
- CI, linting complet et outillage de build.
- Modules métier Réglementation, Chantier, Facturation.
- Modèle d'appartenance organisationnelle, rôles et permissions.
