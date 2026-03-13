# Conformeo Web

Application desktop Angular pour l'administration, la réglementation et la facturation.

Sprint 2 ouvre un premier bloc Réglementation très simple sur la surface bureau :
- onboarding entreprise
- profil entreprise
- questionnaire réglementaire court
- sites / bâtiments rattachés à l'organisation
- première lecture des obligations applicables
- premier suivi sécurité bâtiment avec alertes simples
- DUERP simplifié
- pièces justificatives réglementaires simples
- statut de conformité lisible
- export PDF réglementaire de base

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

Le desktop actuel reste volontairement léger :
- connexion
- contexte multi-organisation
- activation des modules
- fondation Réglementation V1 sans moteur réglementaire complet
- questionnaire court pour affiner le profil réglementaire
- lecture simple des obligations à partir du profil et des sites
- fiche obligation simple avec raison d'applicabilité, preuves rattachées et première action conseillée
- suivi simple des extincteurs, DAE et contrôles périodiques par site
- mise à jour légère d'un élément sécurité existant pour l'échéance et le dernier contrôle
- DUERP simplifié avec risques, gravité et action de prévention
- rattachement de preuves réglementaires via métadonnées simples
- export PDF simple et directement partageable depuis le desktop

Sprint 3 ouvre aussi le premier socle Facturation sur desktop :
- clients simples
- devis simples
- factures simples

Le périmètre reste volontairement léger :
- pas de paiements multiples ou complexes
- pas de PDF de devis/facture
- pas de numérotation avancée
- pas de comptabilité complète

Sprint 3 ajoute seulement :
- des statuts lisibles sur devis et facture
- un paiement simple sur facture
- une numérotation simple et distincte
- l'export PDF simple des devis et factures
- le lien chantier ↔ devis / facture
- une visibilité conditionnée à l'activation du module `facturation`
- une recherche rapide client par nom, email ou téléphone côté desktop
- des brouillons locaux légers sur devis et facture pour reprendre une saisie en cours
- un historique simple sur devis et facture pour revoir les événements utiles sans ouvrir une timeline experte
- une duplication simple d'un devis en facture pour éviter la ressaisie
- une édition légère d'un devis ou d'une facture existante pour ajuster les éléments utiles sans recréer le document
- un marqueur de suivi léger sur devis et facture pour garder une lecture commerciale simple (`suivi normal`, `à relancer`, `relancé`, `en attente client`)
