# Strategie d'environnement Sprint 0

## Objectif

Poser une gestion simple, explicite et coherente des variables d'environnement pour :
- `apps/api`
- `apps/web`
- `apps/mobile`

Sprint 0 ne met pas en place d'infra avancee. On reste sur des fichiers `.env` locaux non committes et des fichiers `.env.example` versionnes.

## Convention de nommage

Toutes les variables exposees par le projet utilisent le prefixe `CONFORMEO_`.

Variable partagee :
- `CONFORMEO_APP_ENV` avec une valeur parmi `development`, `staging`, `production`

## API

Fichier attendu :
- `apps/api/.env`

Fichier versionne :
- `apps/api/.env.example`

Variables attendues :
- `CONFORMEO_APP_ENV`
- `CONFORMEO_DATABASE_URL`
- `CONFORMEO_AUTH_TOKEN_SECRET`
- `CONFORMEO_AUTH_ACCESS_TOKEN_TTL_MINUTES`
- `CONFORMEO_CORS_ALLOW_ORIGINS`

Comportement :
- l'API lit `.env` a la racine puis `apps/api/.env`
- `CONFORMEO_AUTH_TOKEN_SECRET` utilise un placeholder de developpement uniquement
- en `staging` et `production`, ce placeholder est refuse

## Web et mobile

Fichiers attendus :
- `apps/web/.env`
- `apps/mobile/.env`

Fichiers versionnes :
- `apps/web/.env.example`
- `apps/mobile/.env.example`

Variables attendues :
- `CONFORMEO_APP_ENV`
- `CONFORMEO_API_BASE_URL`

Comportement :
- un petit script `scripts/generate-frontend-env.mjs` lit le `.env` de l'app
- ce script genere `src/environments/generated-env.ts`
- les scripts `dev`, `build`, `typecheck` et `cap:sync` executent cette generation avant Angular / Capacitor

## Distinction dev / staging / prod

La distinction reste volontairement simple :
- `development` pour les postes locaux et tests manuels
- `staging` pour un environnement de validation partage
- `production` pour l'environnement reel

Le changement d'environnement se fait en modifiant `CONFORMEO_APP_ENV` et les URLs / secrets associes dans le `.env` de l'app concernee.

## Regles de securite Sprint 0

- aucun vrai secret ne doit etre committe
- les fichiers `.env` reels restent ignores par git
- les frontends ne portent pas de secret
- seules des valeurs non sensibles de configuration frontend sont generees dans `generated-env.ts`
