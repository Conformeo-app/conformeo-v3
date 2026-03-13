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

Sprint 1 ajoute un flux chantier read-only minimal :

```bash
GET /organizations/{organization_id}/worksites
```

Ce point de lecture fournit seulement des résumés chantier pour alimenter le mobile et son stockage local hors ligne.

Sprint 2 ajoute une première fondation Réglementation :

```bash
GET   /organizations/{organization_id}/profile
PATCH /organizations/{organization_id}/profile
GET   /organizations/{organization_id}/sites
POST  /organizations/{organization_id}/sites
PATCH /organizations/{organization_id}/sites/{site_id}
```

Ce bloc reste volontairement simple :
- pas de moteur réglementaire expert
- uniquement un premier catalogue obligations V1
- pas de hiérarchie immobilière complexe
- uniquement le profil entreprise, les premiers sites/bâtiments et une lecture d'obligations explicable

Lecture réglementaire V1 ajoutée :

```bash
GET /organizations/{organization_id}/regulatory-profile
```

Ce point retourne :
- les critères simples pris en compte
- les informations encore manquantes
- la liste des obligations applicables

Suivi bâtiment V1 ajouté :

```bash
GET   /organizations/{organization_id}/building-safety-items
GET   /organizations/{organization_id}/building-safety-alerts
POST  /organizations/{organization_id}/building-safety-items
PATCH /organizations/{organization_id}/building-safety-items/{item_id}
```

Ce bloc couvre seulement :
- extincteurs
- DAE
- contrôles périodiques simples
- alertes d'échéance proche ou en retard

Conformité Sprint 2 ajoutée :

```bash
GET   /organizations/{organization_id}/duerp-entries
POST  /organizations/{organization_id}/duerp-entries
PATCH /organizations/{organization_id}/duerp-entries/{entry_id}
GET   /organizations/{organization_id}/regulatory-evidences
POST  /organizations/{organization_id}/regulatory-evidences
GET   /organizations/{organization_id}/regulatory-export.pdf
```

Ce bloc reste volontairement simple :
- DUERP ligne à ligne, sans matrice experte
- pièces justificatives gérées comme métadonnées documentaires simples
- statut de conformité dérivé, pas saisi manuellement
- export PDF textuel et lisible, sans moteur de template avancé

Sprint 3 ouvre un premier socle Facturation :

```bash
GET   /organizations/{organization_id}/customers
POST  /organizations/{organization_id}/customers
PATCH /organizations/{organization_id}/customers/{customer_id}
GET   /organizations/{organization_id}/quotes
POST  /organizations/{organization_id}/quotes
PATCH /organizations/{organization_id}/quotes/{quote_id}
PATCH /organizations/{organization_id}/quotes/{quote_id}/follow-up
POST  /organizations/{organization_id}/quotes/{quote_id}/duplicate-to-invoice
GET   /organizations/{organization_id}/invoices
POST  /organizations/{organization_id}/invoices
PATCH /organizations/{organization_id}/invoices/{invoice_id}
PATCH /organizations/{organization_id}/invoices/{invoice_id}/follow-up
```

Ce bloc couvre uniquement :
- clients simples avec informations essentielles
- devis simples avec lignes et total lisible
- factures simples avec lignes et total lisible
- aucun paiement complexe, PDF ou numérotation avancée

Extension Sprint 3 :
- statuts simples de devis et facture
- paiement simple sur facture
- numérotation courte `DEV-0001` / `FAC-0001`
- export PDF simple devis / facture
- rattachement simple d'un devis ou d'une facture à un chantier existant
- duplication simple d'un devis en facture
- edition legere d'un devis ou d'une facture existante
- marqueur de suivi leger sur devis et facture
- garde modulaire `facturation` sur tous les endpoints billing du desktop
- audit minimal des créations, changements de statut, paiements et liens chantier en facturation

Questionnaire de qualification Sprint 2 :
- il réutilise `PATCH /organizations/{organization_id}/profile`
- seules quelques réponses booléennes sont ajoutées au profil entreprise
- ces réponses affinent le moteur réglementaire simple sans créer un moteur expert

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

Pour les vues simples qui ont besoin d'un historique cible, cette lecture supporte aussi :
- `target_id`
- `target_type` repete

Exemple :

```bash
GET /organizations/{organization_id}/audit-logs?limit=10&target_id=<quote_id>&target_type=quote&target_type=quote_worksite_link
```
