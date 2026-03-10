# PROMPT_MASTER.md — Conforméo / Codex

Tu travailles sur le projet **Conforméo**.

## Contexte produit
Conforméo est une plateforme modulaire pour entreprises terrain, avec 3 modules :
1. Réglementation
2. Chantier
3. Facturation

## Vision produit
- 1 seule plateforme, pas 3 logiciels séparés
- Desktop = administration, conformité, facturation, pilotage
- Mobile = device terrain principal
- Tablet = device confort, jamais indispensable
- PWA = canal secondaire uniquement, jamais le cœur des workflows chantier
- Offline-first pour tous les workflows critiques terrain
- Produit simple pour non-experts
- Puissant en profondeur, simple en surface
- Pas d’effet usine à gaz
- Pas de logique ERP lourde
- L’IA, si présente, reste discrète, optionnelle et non bloquante

## Stack officielle
- Desktop frontend: Angular
- Mobile frontend: Ionic + Capacitor + Angular
- Tablet: same mobile app with tablet-adapted layouts
- PWA: optional secondary access mode only
- Backend: FastAPI
- Database: PostgreSQL
- Repository: monorepo

## Contraintes produit
- Le terrain doit fonctionner avec un simple téléphone, sans réseau garanti
- Les actions critiques terrain ne doivent jamais être bloquées par l’absence de réseau
- Les documents et preuves doivent rester rattachables aux entités métier
- Le produit doit rester compréhensible par une personne non spécialiste
- Les parcours mobile et desktop peuvent partager la logique métier mais pas forcément la même UX

## Architecture cible
- Monorepo avec apps séparées pour web, mobile et API
- Shared packages for types, contracts, utilities and UI primitives where relevant
- Domaines principaux :
  - organizations
  - users
  - roles / permissions
  - modules activation
  - chantier
  - preuves
  - documents
  - équipements
  - réglementation
  - sécurité bâtiment
  - DUERP
  - clients
  - devis
  - factures
  - paiements
  - audit log
  - sync queue

## Règles de travail
- Commence par lire le code existant et résumer ta compréhension
- Propose ensuite un plan court
- Ne fais pas de gros refactor inutile
- Respecte les conventions existantes
- Garde les changements petits et relisibles
- Mets à jour types, validations, migrations et tests si nécessaire
- Si quelque chose manque pour bien faire, signale-le explicitement
- Si une hypothèse est prise, rends-la visible
- Si une partie ne peut pas être terminée proprement, arrête-toi à un point stable et explique pourquoi

## Contraintes spécifiques front
- Ne propose pas une stratégie PWA-only
- Les workflows critiques chantier doivent cibler l’app mobile Ionic/Capacitor en priorité
- Les flows bureau doivent cibler Angular web
- La tablette est une extension ergonomique de l’app mobile, pas une app séparée
- Réutilise les types, contrats et utilitaires partagés quand c’est pertinent
- Garde une UX distincte entre bureau et terrain même si la logique métier est partagée

## Définition de fini
Avant de conclure, tu dois :
1. Vérifier les critères d’acceptation de la tâche
2. Exécuter les commandes de vérification pertinentes
3. Lister les fichiers modifiés
4. Résumer ce qui a été fait
5. Indiquer les limites restantes
6. Proposer la prochaine plus petite étape logique

## Important
- Ne construis pas plus que demandé
- Reste strictement dans le périmètre de la tâche
- Priorise robustesse, lisibilité et cohérence produit
- Si plusieurs solutions sont possibles, choisis la plus simple qui satisfait les critères
