# Conformeo API

Socle FastAPI pour les contrats serveurs, les modèles PostgreSQL et les migrations.

Sprint 0 pose uniquement :
- le point d'entrée FastAPI minimal
- les modèles `Organization` et `User`
- le modèle `OrganizationMembership`
- le modèle `OrganizationModule`
- le modèle transverse `Document`
- le modèle `AuditLog`
- une authentification simple par email/mot de passe + bearer token
- un RBAC minimal `owner` / `admin` / `member`
- un bootstrap administrateur minimal pour une base vide
- un audit log minimal pour les actions critiques du socle
- les schémas de sortie de base
- les migrations SQL initiales

Les endpoints métiers, permissions et flux de synchronisation complets sont explicitement différés.

## Environnement

Copier `apps/api/.env.example` vers `apps/api/.env`, puis ajuster au besoin :
- `CONFORMEO_APP_ENV=development|staging|production`
- `CONFORMEO_DATABASE_URL`
- `CONFORMEO_AUTH_TOKEN_SECRET`
- `CONFORMEO_AUTH_ACCESS_TOKEN_TTL_MINUTES`
- `CONFORMEO_CORS_ALLOW_ORIGINS`

Le placeholder `development-only-change-me` n'est toléré qu'en `development`.

## Bootstrap administrateur

Le bootstrap Sprint 0 sert uniquement a initialiser une base vide avec :
- le premier `User` actif
- la premiere `Organization`
- le `OrganizationMembership` par defaut en role `owner`
- les lignes `organization_modules` pour les modules connus

Pre-requis :
- la base PostgreSQL est joignable via `CONFORMEO_DATABASE_URL`
- les tables Sprint 0 existent deja

Depuis la racine du monorepo :

```bash
pnpm bootstrap:admin -- \
  --email admin@conformeo.local \
  --password 'Secret123!' \
  --first-name Alice \
  --last-name Admin \
  --organization-name 'Conformeo Demo' \
  --enable-module reglementation
```

Comportement :
- la commande refuse de s'executer si la base contient deja un `User` ou une `Organization`
- si aucun module n'est passe avec `--enable-module`, les lignes sont creees mais restent desactivees

## Audit log minimal

Sprint 0 trace uniquement les ecritures critiques deja presentes dans le socle :
- `create` pendant le bootstrap administrateur
- `module_activation_change` lors du toggle d'un module

Lecture backend minimale :

```bash
GET /organizations/{organization_id}/audit-logs?limit=50
```

Chaque entree stocke l'auteur, la date, le type d'action, la cible et un petit payload `changes`.
