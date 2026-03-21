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

Sprint 4 ouvre une première vue d'ensemble desktop :
- un dashboard global simple
- quelques KPI réellement utiles
- des alertes transverses simples issues des modules déjà actifs
- une liste d'actions à faire simple pour passer à l'opérationnel
- une priorité légère (`haute`, `moyenne`, `basse`) sur les actions
- un filtre par module (`Réglementation`, `Chantier`, `Facturation`)
- une synthèse par module plus explicite dans le cockpit, avec quelques repères utiles par domaine
- une vue simple par chantier
- une vue chantier enrichie avec contexte, points à traiter, documents liés et signal financier simple
- une vue simple par client
- depuis un chantier, les devis et factures liés restent visibles dans la lecture desktop

Sprint 5 ouvre un premier gain de temps transverse :
- une fiche chantier PDF simple générée depuis les données déjà présentes
- un plan de prévention simplifié PDF généré depuis le chantier et les contacts connus
- un ajustement léger du plan de prévention directement dans la vue chantier avant export
- un aperçu texte léger du plan de prévention avant téléchargement du PDF
- une action simple pour revenir au préremplissage initial du plan de prévention
- des documents chantier légers visibles comme explicitement rattachés au chantier
- un lien léger possible entre un document chantier et une signature existante du même chantier
- un lien léger possible entre un document chantier et une ou plusieurs preuves existantes du même chantier
- des actions directes simples depuis la consultation des documents chantier pour télécharger ou rouvrir un plan
- une lecture légère des signatures et preuves déjà liées, sans navigation documentaire lourde
- des filtres légers sur les documents chantier par chantier, type et statut
- un accès direct depuis la vue chantier du cockpit vers la zone documents chantier utile
- quelques métadonnées de lecture simples pour retrouver plus vite le bon document
- un statut simple `brouillon / finalisé` sur les documents chantier
- une consultation simple des documents chantier avec filtres légers par chantier, type et statut
- un préremplissage explicable des formulaires devis / facture depuis un chantier ou un client
- des actions rapides depuis le cockpit et la liste clients Facturation pour préparer un document sans ressaisie complète

Le desktop améliore aussi le wording des erreurs les plus visibles :
- chargement impossible ou indisponibilité temporaire
- échec d'export ou de téléchargement
- échec d'enregistrement ou de mise à jour
- problème réseau ou session expirée

Choix de conception :
- pas de framework global d'observabilité
- réutilisation du rendu d'erreur existant
- messages plus clairs sans masquer les erreurs réellement utiles

Le ressenti de fluidité desktop est aussi amélioré de manière ciblée :
- conservation du contenu visible pendant une actualisation déjà amorcée
- indication discrète d'actualisation au lieu d'un écran qui se vide
- feedback immédiat sur les exports et actions longues
- conservation de certains contextes ouverts quand les données existent toujours

Le wording des statuts visibles reste aussi harmonisé de manière ciblée :
- cockpit : `à traiter`, `à suivre`, `rien à signaler`
- cockpit client : `à suivre`, `suivi normal`, `à jour`
- documents chantier : `brouillon`, `finalisé`, `prêt`, `en préparation`, `à vérifier`, `archivé`, `signature liée`, `aucune signature liée`
- facturation : `suivi normal`, `à relancer`, `relancé`, `en attente client`

Sprint 7 ajoute une première coordination légère dans le desktop :
- sur les chantiers et les documents chantier déjà présents
- avec une affectation simple
- un commentaire court
- un suivi `à faire`, `en cours`, `fait`
- des filtres légers par suivi et par personne affectée
- une lecture simple `à traiter` pour retrouver plus vite les éléments coordonnés utiles
- une check-list beta fermée simple pour préparer un premier test réel sans process QA lourd
- une check-list de lancement pilote courte pour cadrer un premier usage réel
- un recueil de feedback simple via un panneau desktop prêt à copier dans le canal beta ou pilote habituel
- un support de présentation produit simple pour préparer une démo, une beta ou un pilote
- une lecture clarifiée du packaging produit autour d'un socle commun et de 3 modules activables
- sans task manager ni fil de discussion riche

Sprint 8 ouvre un premier chantier de finition desktop :
- harmonisation visuelle ciblée entre cockpit et modules
- cartes, panneaux, formulaires et actions plus cohérents
- états UI plus premium sur les écrans les plus montrés : chargement, succès, erreur, progression, aperçus et panneaux
- micro-interactions sobres mais visibles sur feedbacks, ouvertures de panneau, listes et zones d'action
- premier shell desktop structuré avec navigation modulaire et `router-outlet` principal
- routes dédiées `home`, `reglementation`, `chantier`, `chantier/documents`, `chantier/coordination` et `facturation`
- liens de navigation visibles selon les modules activés et redirection simple si un module n'est pas accessible
- inventaire clair des zones encore partiellement branchées aux APIs
- récupération plus stable des documents chantier déjà générés via leur `document_id`
- haut du cockpit désormais branché à une API légère pour les KPI, alertes et la synthèse par module
- nettoyage ciblé de quelques écarts restants : chargements réglementation mieux alignés et disponibilité fichier plus lisible sur les documents chantier

Sprint 9 poursuit la structuration desktop :
- shell bureau avec navigation modulaire et `router-outlet` principal
- garde d'accès selon les modules activés
- extraction progressive des grandes vues hors du gros `AppComponent`
- `Documents chantier` est désormais servi par un composant dédié sur `/app/chantier/documents`
