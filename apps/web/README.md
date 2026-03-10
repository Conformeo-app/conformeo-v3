# Conformeo Web

Application desktop Angular pour l'administration, la réglementation et la facturation.

Squelette Angular minimal prêt pour Sprint 0.

Commandes utiles :
- `pnpm --filter @conformeo/web dev`
- `pnpm --filter @conformeo/web build`
- `pnpm --filter @conformeo/web typecheck`

Environnement :
- copier `apps/web/.env.example` vers `apps/web/.env`
- definir `CONFORMEO_APP_ENV=development|staging|production`
- definir `CONFORMEO_API_BASE_URL`

Les scripts web generent automatiquement `src/environments/generated-env.ts` avant `dev`, `build` et `typecheck`.

Sprint 0 utilise aussi `@conformeo/ui` pour partager quelques primitives Angular simples :
- `Button`
- `Input`
- `Card`
- `StatusChip`
- `EmptyState`
