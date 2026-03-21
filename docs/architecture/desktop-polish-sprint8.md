# Sprint 8 — Finition visuelle desktop et inventaire API

Objectif :
- rendre le desktop plus cohérent et plus agréable sans refonte complète
- améliorer la lecture des cartes, panneaux, formulaires et actions
- identifier clairement les zones encore partiellement branchées aux APIs

## Harmonisation visuelle retenue

Le patch Sprint 8 reste volontairement ciblé :
- mêmes surfaces internes pour les sections cockpit et modules
- mêmes fonds légers pour les formulaires et panneaux de détail
- mêmes blocs de lecture pour les listes les plus visibles
- champs `select` et `textarea` plus lisibles au focus
- actions latérales mieux alignées dans les listes et cartes denses
- états de chargement, succès, erreur et progression relus comme de vrais blocs UI
- micro-interactions sobres sur l'ouverture des panneaux, les feedbacks et les cartes les plus visibles
- renforcement visible du langage visuel partagé desktop/mobile sur les cartes, chips et retours système

Zones priorisées :
- cockpit desktop
- vue chantier
- documents chantier
- facturation
- réglementation

Ce que le ticket ne fait pas :
- aucune refonte du design system
- aucun changement de navigation majeur
- aucune animation ou effet visuel lourd

## Renfort premium visible

Les zones les plus montrées en démo ont été poussées plus loin que le premier polish :
- cockpit : cartes KPI plus présentes, alertes et actions mieux encadrées
- chantier : panneaux de coordination, ajustement de plan et historiques plus lisibles
- documents chantier : lecture plus nette des panneaux liés, aperçus et actions
- formulaires clés : surfaces plus respirantes et meilleur focus visuel
- mobile : feedbacks, cartes rapides, cartes chantier et blocs d'information alignés sur le même ton

## Inventaire des branchements API restants

### Déjà branché

| Zone | État | Observation |
| --- | --- | --- |
| Authentification et changement d'organisation | Branché | `login`, `auth/me`, activation modules déjà reliés à l'API |
| Réglementation V1 | Branché | profil, questionnaire, sites, sécurité bâtiment, DUERP, preuves, export PDF |
| Facturation V1 | Branché | clients, devis, factures, statuts, paiement simple, PDF, historique |
| Documents chantier et coordination légère | Branché | liste, statuts, rattachements signature/preuves, coordination chantier/document |

### Partiellement branché

| Zone | État | Observation | Priorité |
| --- | --- | --- | --- |
| Cockpit global | Partiel | le haut du cockpit (`kpi`, `alertes`, `synthèse par module`) est désormais servi par `GET /cockpit-summary`, mais les actions et vues détaillées restent locales | Moyenne |
| Vue chantier enrichie | Partiel | la synthèse chantier assemble localement travaux, documents, facturation et coordination | Moyenne |
| Consultation documents chantier | Partiel | les métadonnées sont listées via l'API, le dernier PDF généré est récupérable par `document_id` et la disponibilité fichier remonte désormais au desktop, mais sans GED ni multi-versions | Moyenne |
| Plan de prévention avant export | Partiel | ajustements et aperçu texte restent locaux ; seul l'export PDF appelle l'API | Moyenne |
| Recherche et filtres desktop | Partiel | recherche client, filtres documents et filtres de coordination restent locaux, sans filtrage serveur | Basse |

### Manquant ou volontairement non branché

| Zone | État | Observation | Priorité |
| --- | --- | --- | --- |
| Recueil de feedback beta / pilote | Manquant volontaire | panneau desktop prêt à copier, mais aucune collecte API centralisée | Basse |
| Supports beta / pilote | Manquant volontaire | check-lists, packaging et support de présentation restent documentaires | Basse |

## Priorités de branchement recommandées

1. Stabiliser ensuite seulement une autre lecture cockpit si le pilote montre encore une latence ou une incohérence visible.
2. Ajouter une récupération exacte multi-versions seulement si le pilote demande autre chose que le dernier PDF généré.
3. Garder le recueil de feedback sans backend tant que le volume reste faible et manuel.

## Résumé

Le desktop est désormais visuellement plus homogène sur ses zones les plus visibles.

Côté API :
- le coeur métier est déjà branché
- le haut du cockpit est désormais branché via un résumé dédié, mais certaines lectures riches restent locales
- le desktop ne charge plus le bloc réglementation si le module n'est pas activé
- quelques zones documentaires ou beta restent volontairement légères
