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

Extensions documentaires légères sur le module Chantier :

```bash
GET /organizations/{organization_id}/worksite-documents
GET /organizations/{organization_id}/worksite-documents/{document_id}/download
GET /organizations/{organization_id}/worksites/{worksite_id}/summary.pdf
GET /organizations/{organization_id}/worksites/{worksite_id}/prevention-plan.pdf
POST /organizations/{organization_id}/worksites/{worksite_id}/prevention-plan.pdf
```

Ce bloc reste volontairement simple :
- les PDF chantier peuvent créer ou mettre à jour un `Document` léger explicitement rattaché au chantier
- le dernier PDF généré est désormais conservé sur ce `Document` pour une récupération plus stable
- les documents chantier générés peuvent être marqués `draft` ou `finalized`
- pas de GED
- pas de versioning documentaire riche

Sprint 8 ajoute un résumé cockpit léger :

```bash
GET /organizations/{organization_id}/cockpit-summary
```

Ce point couvre seulement :
- les KPI utiles de la vue d'ensemble
- les alertes simples
- la synthèse par module

Les vues cockpit plus détaillées restent volontairement assemblées côté desktop.

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

## Seed de demonstration local

Pour enrichir une organisation locale deja bootstrappee avec un petit jeu de donnees coherent pour :
- la home
- les sites et leur enrichissement
- le module Reglementation

Depuis la racine du monorepo :

```bash
pnpm seed:demo --organization-slug conformeo-dev
```

Ce seed met a jour l'organisation cible et injecte seulement :
- 3 sites de demonstration
- 2 elements securite batiment
- 1 entree DUERP
- 3 preuves reglementaires

Comportement :
- idempotent sur les noms et fichiers de demonstration connus
- rejouable sans recréer de volume inutile
- oriente demo locale, pas donnees de production

Pour nettoyer uniquement ce jeu de donnees :

```bash
pnpm seed:demo --organization-slug conformeo-dev --clean-only
```

Le champ d'etat d'enrichissement site reste purement metier :
- `location_enrichment_status`
- `location_enrichment_last_error_reason`

Le seed n'expose aucun payload fournisseur brut et n'ajoute pas de logique metier supplementaire.

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

## Documents métier simples

Sprint 5 ajoute un premier document transverse, sans moteur documentaire complexe :
- `GET /organizations/{organization_id}/worksites/{worksite_id}/summary.pdf`
- `GET /organizations/{organization_id}/worksites/{worksite_id}/prevention-plan.pdf`
- `POST /organizations/{organization_id}/worksites/{worksite_id}/prevention-plan.pdf`

Le PDF chantier réutilise :
- l'identification entreprise
- le résumé chantier
- les devis liés si `facturation` est activé
- les factures liées si `facturation` est activé

Le plan de prévention simplifié réutilise :
- l'entreprise intervenante
- le chantier
- le donneur d'ordre si le client Facturation correspondant est connu
- les contacts utiles disponibles
- un contexte d'intervention, des points de vigilance et des consignes simples

## Intégrations externes backend

Un premier socle d’intégration externe est maintenant exposé sous :

```bash
GET /api/external/company/search?q=
GET /api/external/company/{siren}
GET /api/external/establishment/{siret}
GET /api/external/geocode/search?q=
GET /api/external/geocode/reverse?lat=&lon=
GET /api/external/regulation/search?q=
GET /api/external/regulation/{id}
GET /api/external/site-risks?address=
GET /api/external/site-risks/geocode?lat=&lon=
```

Principes retenus :
- aucune route ne parle directement à un fournisseur externe
- chaque fournisseur est encapsulé dans `app/integrations/`
- les routes passent par des services métier dans `app/services/`
- les payloads exposés sont normalisés via `app/schemas/external.py`
- la provenance remonte via `ExternalSourceMeta`
- les réponses brutes des fournisseurs ne sont pas renvoyées au frontend

Fournisseurs phase 1 :
- Annuaire des Entreprises / SIRENE : recherche entreprise, détail SIREN, détail SIRET
- Géoplateforme : géocodage direct et inverse
- Légifrance : recherche générique et consultation de texte/article
- Géorisques : synthèse de risques site à partir d’un point ou d’une adresse

Phase 2 branche ce socle sur deux flux métier backend réels :

```bash
POST /organizations/{organization_id}/enrich-from-company-registry
POST /organizations/{organization_id}/sites/{site_id}/enrich-location
```

Comportement métier ajouté :
- enrichissement organisation à partir d'un `siren` ou d'un `siret`
- persistance d'un snapshot registre séparé des champs saisis manuellement
- préremplissage prudent de `legal_name` et `headquarters_address` si la valeur locale est vide
- conservation des champs manuels si un conflit local/externe est détecté
- normalisation d'adresse, géocodage et synthèse de risques sur les sites
- purge des données de géocodage/risques devenues obsolètes si l'adresse d'un site change
- auto-enrichissement site déclenché après `POST /organizations/{organization_id}/sites`
- auto-enrichissement site relancé après `PATCH /organizations/{organization_id}/sites/{site_id}` si l'adresse change réellement

Champs enrichis organisation :
- `registry_siren`
- `registry_headquarters_siret`
- `registry_company_name`
- `registry_activity_code`
- `registry_status`
- `registry_address`
- `registry_source_meta`
- `registry_last_synced_at`

Champs enrichis site :
- `normalized_address`
- `latitude`
- `longitude`
- `geocoding_score`
- `location_source_meta`
- `location_last_synced_at`
- `location_enrichment_status`
- `location_enrichment_attempted_at`
- `location_enrichment_last_error_reason`
- `site_risk_level`
- `site_risk_summary`
- `site_risk_items`
- `site_risk_source_meta`
- `site_risk_last_synced_at`

Statuts métier de l'auto-enrichissement site :
- `enriched` : géocodage et synthèse de risques disponibles
- `partial` : géocodage disponible, mais résultat ambigu ou synthèse de risques indisponible
- `no_match` : aucune adresse exploitable n'a été trouvée
- `failed` : une erreur fournisseur a empêché l'enrichissement automatique, sans bloquer la création ou la mise à jour du site

Code métier complémentaire :
- `location_enrichment_last_error_reason`
- ce champ stocke un code court de lecture produit/support
- ce n'est pas un message technique brut fournisseur

Valeurs possibles :
- `provider_unavailable`
- `provider_response_invalid`
- `no_geocode_match`
- `ambiguous_address`
- `risk_provider_unavailable`

Règles de mapping :
- `enriched` -> `location_enrichment_last_error_reason = null`
- `no_match` -> `no_geocode_match`
- `partial` avec géocodage ambigu -> `ambiguous_address`
- `partial` avec risques indisponibles -> `risk_provider_unavailable`
- `failed` sur indisponibilité fournisseur -> `provider_unavailable`
- `failed` sur payload/réponse invalide -> `provider_response_invalid`

Quand utiliser encore le endpoint manuel :
- relancer un site resté en `no_match`
- relancer un site resté en `partial`
- relancer un site resté en `failed`
- relancer après correction manuelle de l'adresse

Comportement en cas d'échec externe :
- si l'annuaire entreprise est indisponible, l'enrichissement organisation retourne une erreur backend propre sans modifier le profil
- si le géocodage site échoue, le site reste intact et l'enrichissement retourne un statut `no_match`
- si la synthèse Géorisques échoue, le géocodage est conservé et l'enrichissement retourne un statut `partial`
- si le provider externe tombe pendant l'auto-enrichissement site, le flux principal `create/update` reste réussi et le site passe en `failed`
- aucune réponse brute fournisseur n'est exposée au domaine métier ou au frontend

Variables d’environnement à renseigner :
- `CONFORMEO_EXTERNAL_INTEGRATIONS_ENABLED`
- `CONFORMEO_EXTERNAL_PROVIDER_MAX_RETRIES`
- `CONFORMEO_EXTERNAL_PROVIDER_USER_AGENT`
- `CONFORMEO_EXTERNAL_CACHE_ENABLED`
- `CONFORMEO_EXTERNAL_COMPANY_CACHE_TTL_SECONDS`
- `CONFORMEO_EXTERNAL_GEOCODE_CACHE_TTL_SECONDS`
- `CONFORMEO_EXTERNAL_REGULATION_CACHE_TTL_SECONDS`
- `CONFORMEO_EXTERNAL_SITE_RISKS_CACHE_TTL_SECONDS`
- `CONFORMEO_EXTERNAL_ANNUAIRE_ENTREPRISES_*`
- `CONFORMEO_EXTERNAL_GEOPLATEFORME_*`
- `CONFORMEO_EXTERNAL_LEGIFRANCE_*`
- `CONFORMEO_EXTERNAL_GEORISQUES_*`

Notes de configuration :
- Légifrance passe par PISTE avec OAuth2 ; il faut renseigner `CLIENT_ID`, `CLIENT_SECRET` et, si besoin, pointer vers les URLs sandbox PISTE.
- Géorisques v2 nécessite un jeton Bearer dédié.
- Annuaire des Entreprises et le géocodage Géoplateforme sont publics, sans secret applicatif.

Ajouter un nouveau fournisseur :
1. créer un provider dans `app/integrations/`
2. mapper la réponse brute vers des schémas internes propres
3. exposer son usage via un service dans `app/services/`
4. ajouter une route fine dans `app/api/routes/external.py`
5. couvrir mapping, erreurs et endpoint dans `tests/`

Résilience mise en place :
- timeout explicite par fournisseur
- retries bornés
- cache TTL simple, optionnel
- erreurs fournisseur normalisées
- fallback `503` / `502` propre sans crash global

Le `POST` permet seulement un ajustement léger avant export :
- date utile
- contexte
- points de vigilance
- mesures / consignes
- contact utile complémentaire

Le document reste volontairement simple :
- structure textuelle
- stockage léger du dernier PDF généré uniquement pour les documents chantier
- aucun template avancé

Les documents chantier générés sont aussi relus de manière légère :
- `GET /organizations/{organization_id}/worksite-documents`
- `PATCH /organizations/{organization_id}/worksite-documents/{document_id}/status`
- `GET /organizations/{organization_id}/worksite-signatures`
- `PATCH /organizations/{organization_id}/worksite-documents/{document_id}/signature`
- `GET /organizations/{organization_id}/worksite-proofs`
- `PATCH /organizations/{organization_id}/worksite-documents/{document_id}/proofs`

Le lien `document chantier -> signature` reste volontairement simple :
- uniquement vers une signature déjà existante
- uniquement si elle appartient au même chantier
- aucune logique de certification ou de signature électronique avancée

Le lien `document chantier -> preuves` reste tout aussi léger :
- uniquement vers des preuves déjà existantes
- uniquement si elles appartiennent au même chantier
- plusieurs preuves peuvent être liées
- aucune GED ni logique de preuve avancée

Sprint 7 ajoute une coordination simple sur les objets chantier déjà visibles :
- `GET /organizations/{organization_id}/worksite-assignees`
- `PATCH /organizations/{organization_id}/worksites/{worksite_id}/coordination`
- `PATCH /organizations/{organization_id}/worksite-documents/{document_id}/coordination`

Ce bloc couvre uniquement :
- une affectation simple vers un membre existant
- un commentaire court
- un suivi `a faire / en cours / fait`
- aucune logique de task manager ou de workflow complexe
