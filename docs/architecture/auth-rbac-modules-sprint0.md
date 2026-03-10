# Auth, RBAC et modules Sprint 0

## Objectif

Ajouter une couche d'authentification et d'autorisation minimale, cohérente avec le multi-organisation, sans basculer dans une architecture IAM complexe.

## Authentification retenue

- login simple par `email + password`
- token bearer signé côté API
- utilisateur éligible uniquement si `User.status = active`
- aucune SSO, MFA, reset password ou invitation détaillée au Sprint 0

## Multi-organisation

- le token authentifie l'utilisateur global
- l'organisation courante est résolue via le header `X-Conformeo-Organization-Id`
- sans header, l'API utilise le membership par défaut
- `GET /auth/me` renvoie toutes les appartenances et le contexte courant

## RBAC Sprint 0

Rôles reconnus :
- `owner`
- `admin`
- `member`

Permissions minimales :
- `organization:read`
- `organization:update`
- `users:read`
- `users:manage`
- `modules:read`
- `modules:manage`

## Activation des modules

Modules gérés au niveau organisation :
- `reglementation`
- `chantier`
- `facturation`

Leur état est stocké dans `organization_modules`.

## Compatibilité / limites

- le modèle prépare les futurs rôles fins mais n'implémente pas de RBAC avancé
- la création automatique des lignes `organization_modules` pour de nouvelles organisations devra être branchée au futur flux de création d'organisation
- l'initialisation du premier compte administrateur passe par un bootstrap CLI minimal sur base vide
- le front Sprint 0 ne fournit qu'une surface de connexion et de consultation minimale
