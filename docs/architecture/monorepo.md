# Monorepo Sprint 0

## Objectif

Poser une structure de dépôt simple et stable pour démarrer Conforméo sans lancer trop de chantiers en parallèle.

## Structure retenue

```text
apps/
  api/         FastAPI + modèles PostgreSQL + migrations
  mobile/      squelette Ionic/Capacitor/Angular minimal
  web/         squelette Angular desktop minimal
packages/
  contracts/   contrats TypeScript partagés
  ui/          primitives UI Angular partagées
docs/
  architecture/ documents de cadrage technique
tests/         vérifications structurelles Sprint 0
```

## Principes

- `apps/web` contient désormais un squelette Angular minimal.
- `apps/mobile` contient désormais un squelette Ionic + Capacitor + Angular minimal.
- `apps/api` contient le socle FastAPI minimal et les premiers modèles persistance.
- `packages/contracts` porte les contrats partagés de niveau Sprint 0.
- `packages/ui` porte un design system Angular minimal partagé entre `web` et `mobile`.
- Les modèles métier restent petits et compatibles avec une montée en charge incrémentale.

## Décisions explicites

- Monorepo géré côté JavaScript par `pnpm`.
- Backend Python géré indépendamment via `apps/api/pyproject.toml`.
- Aucun générateur de code entre Python et TypeScript en Sprint 0.
- Les contrats partagés servent de référence de structure, en attendant un éventuel alignement automatisé plus tard.

## Ce qui est différé

- linting complet et outillage de build plus avancé.
- modules métier Réglementation, Chantier, Facturation.
- rôles fins, permissions et auth complète.

## CI Sprint 0

Une CI minimale existe maintenant pour vérifier le socle :
- contrats TypeScript
- typecheck et build `web`
- typecheck et build `mobile`
- `cap:sync` mobile
- vérifications Python et tests Sprint 0
