# CI minimale Sprint 0

## Objectif

Verifier automatiquement le socle du monorepo sur chaque `push` et `pull_request`, sans introduire de pipeline complexe.

## Workflow retenu

Fichier :
- `.github/workflows/ci.yml`

Choix :
- un seul job GitHub Actions
- installation Node.js, pnpm et Python
- installation des dependances du front et de l'API
- execution d'un script racine unique `pnpm ci`

## Verifications lancees

Le script `pnpm ci` execute :
- `pnpm check:contracts`
- `pnpm typecheck:web`
- `pnpm typecheck:mobile`
- `pnpm build:web`
- `pnpm build:mobile`
- `pnpm check:mobile:cap`
- `pnpm check:python`
- `pnpm test:python`

## Limites assumees

- pas de pipeline multi-job
- pas de cache Python specifique
- pas de lint dedie tant que le repo ne porte pas encore une configuration ESLint ou Ruff stabilisee
