# Modèle multi-organisation Sprint 0

## Objectif

Préparer une base multi-organisation simple et additive, sans ouvrir un chantier RBAC complet.

## Décisions retenues

- `User` reste une identité globale à la plateforme.
- `Organization` reste une entité indépendante.
- le rattachement se fait via `organization_memberships`
- un utilisateur peut avoir plusieurs memberships
- un seul membership actif peut être marqué `is_default` par utilisateur
- `role_code` reste volontairement simple pour préparer les futurs rôles sans figer un RBAC complet

## Pourquoi ce choix

- on évite de recoller artificiellement `User` à une seule organisation
- on prépare proprement le multi-tenant
- on garde une migration additive et facile à relire
- on pourra faire évoluer `role_code` vers un vrai modèle de rôles/permissions plus tard

## Limites assumées

- pas d'auth complète
- pas de permissions fines
- pas de table `roles`
- pas de gestion détaillée des invitations
