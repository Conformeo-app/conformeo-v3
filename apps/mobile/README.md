# Conformeo Mobile

Application mobile Ionic + Capacitor + Angular pour les workflows terrain.

Squelette Ionic + Capacitor + Angular minimal prêt pour Sprint 0.

Commandes utiles :
- `pnpm --filter @conformeo/mobile dev`
- `pnpm --filter @conformeo/mobile build`
- `pnpm --filter @conformeo/mobile typecheck`
- `pnpm --filter @conformeo/mobile cap:sync`

Environnement :
- copier `apps/mobile/.env.example` vers `apps/mobile/.env`
- definir `CONFORMEO_APP_ENV=development|staging|production`
- definir `CONFORMEO_API_BASE_URL`

Les scripts mobile generent automatiquement `src/environments/generated-env.ts` avant `dev`, `build`, `typecheck` et `cap:sync`.

Sprint 0 pose aussi une base locale mobile via SQLite :
- SQLite natif via `@capacitor-community/sqlite` sur iOS / Android
- `jeep-sqlite` + `sql.js` pour le web de dev
- tables locales génériques pour `settings`, `records` et références de fichiers
- capture photo locale avec miniature immédiate et horodatage conservé
- une queue locale d'opérations synchronisables avec statuts et retry simple
- migrations locales explicites côté app
- un état de synchronisation visible avec un wording simple au niveau global et sur les brouillons locaux
- un pattern UX de capture rapide documenté pour photo, note, checklist, signature et signalement

La surface UI actuelle expose seulement une démonstration de lecture / écriture locale et de queue locale pour valider le socle offline-first, sans ouvrir encore les workflows chantier ni la synchronisation distante.

Sprint 1 ouvre un premier bloc Chantier mobile :
- liste locale de chantiers
- fiche chantier essentielle
- action `Préparer hors ligne` qui embarque les données utiles du chantier sur l'appareil
- consultation des chantiers déjà disponibles sans réseau
- import read-only des résumés chantier depuis l'API avec persistance locale
- liste d'équipements utiles liée au chantier, consultable hors ligne avec nom, type et statut simple
- mouvements simples d'équipement enregistrés localement avec horodatage, auteur et statut de synchronisation
- capture de photo preuve horodatée, liée à un chantier, stockée immédiatement sur l'appareil
- commentaire texte court sur photo preuve, stocké localement et modifiable sur l'appareil
- note vocale chantier enregistrée localement, relisible hors ligne et suivie par l'état local de synchronisation
- checklist sécurité simple liée au chantier, remplissable hors ligne avec statut brouillon ou validé
- signalement de risque chantier, stocké localement avec type, note courte, gravité simple et photo optionnelle
- signature simple tactile, liée au chantier, stockée localement et visible immédiatement sur l'appareil
- préparation locale consolidée des synchronisations terrain pour preuves, notes, checklist, signalements et signatures
- état de synchronisation lisible et harmonisé au niveau chantier, objet terrain et lot préparé

Sprint 0 utilise aussi `@conformeo/ui` pour partager quelques primitives Angular simples :
- `Button`
- `Input`
- `Card`
- `StatusChip`
- `EmptyState`
- `SyncState`
