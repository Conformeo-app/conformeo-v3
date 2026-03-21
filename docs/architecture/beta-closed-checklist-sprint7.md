# Sprint 7 — Check-list beta fermée

Objectif :
- préparer une première beta fermée simple et réaliste
- vérifier les points visibles les plus utiles avant test réel
- éviter un process QA lourd ou un suivi de recette complexe

## Format retenu

Usage conseillé :
- 1 ou 2 organisations de test réelles
- 2 à 5 utilisateurs maximum
- un passage court sur desktop, puis un passage terrain mobile si le module Chantier est concerné

Lecture attendue :
- cocher `OK` si le point est satisfaisant
- cocher `À revoir` si le point gêne la beta
- cocher `Non concerné` si le module ou le cas n'est pas activé

Règle simple avant ouverture :
- aucun point bloquant sur `accès`, `chantier`, `documents chantier`, `exports PDF`
- les écarts mineurs de wording ou de confort peuvent rester en observation

## Check-list

### 1. Accès et contexte

- [ ] `OK` / `À revoir` / `Non concerné` : la connexion desktop fonctionne sans message technique bloquant
- [ ] `OK` / `À revoir` / `Non concerné` : le changement d'organisation reste lisible et cohérent
- [ ] `OK` / `À revoir` / `Non concerné` : les modules activés / désactivés apparaissent correctement
- [ ] `OK` / `À revoir` / `Non concerné` : les messages d'erreur visibles restent compréhensibles

### 2. Cockpit desktop

- [ ] `OK` / `À revoir` / `Non concerné` : la vue d'ensemble donne une lecture utile sans surcharge
- [ ] `OK` / `À revoir` / `Non concerné` : les KPI affichés semblent cohérents avec les données visibles
- [ ] `OK` / `À revoir` / `Non concerné` : les alertes transverses sont compréhensibles
- [ ] `OK` / `À revoir` / `Non concerné` : la synthèse par module aide à comprendre rapidement la situation

### 3. Chantier

- [ ] `OK` / `À revoir` / `Non concerné` : la vue par chantier reste lisible et exploitable
- [ ] `OK` / `À revoir` / `Non concerné` : un chantier peut être préparé ou relu sans ambiguïté
- [ ] `OK` / `À revoir` / `Non concerné` : les statuts chantier (`planifié`, `en cours`, `bloqué`, `terminé`) restent cohérents
- [ ] `OK` / `À revoir` / `Non concerné` : les signaux utiles remontent bien dans la lecture chantier

### 4. Documents chantier

- [ ] `OK` / `À revoir` / `Non concerné` : les documents chantier liés au chantier sont faciles à retrouver
- [ ] `OK` / `À revoir` / `Non concerné` : les filtres légers suffisent pour retrouver le bon document
- [ ] `OK` / `À revoir` / `Non concerné` : la lecture `brouillon / finalisé` est claire
- [ ] `OK` / `À revoir` / `Non concerné` : la lecture `en préparation / prêt / à vérifier / archivé` reste compréhensible
- [ ] `OK` / `À revoir` / `Non concerné` : signature liée et preuves liées sont visibles sans navigation lourde

### 5. Exports PDF

- [ ] `OK` / `À revoir` / `Non concerné` : la fiche chantier PDF se génère correctement
- [ ] `OK` / `À revoir` / `Non concerné` : le plan de prévention simplifié PDF se génère correctement
- [ ] `OK` / `À revoir` / `Non concerné` : les PDF devis / facture restent générables
- [ ] `OK` / `À revoir` / `Non concerné` : les retours de téléchargement restent clairs pour l'utilisateur

### 6. Coordination légère

- [ ] `OK` / `À revoir` / `Non concerné` : une affectation simple peut être posée sur un chantier
- [ ] `OK` / `À revoir` / `Non concerné` : une affectation simple peut être posée sur un document chantier
- [ ] `OK` / `À revoir` / `Non concerné` : le suivi `à faire / en cours / fait` reste lisible
- [ ] `OK` / `À revoir` / `Non concerné` : les filtres par statut et par personne affectée sont suffisants
- [ ] `OK` / `À revoir` / `Non concerné` : la vue `À traiter` aide à retrouver les éléments utiles

### 7. Facturation

- [ ] `OK` / `À revoir` / `Non concerné` : la liste clients reste simple à parcourir
- [ ] `OK` / `À revoir` / `Non concerné` : devis et factures restent modifiables sans incohérence visible
- [ ] `OK` / `À revoir` / `Non concerné` : les statuts devis / facture restent compréhensibles
- [ ] `OK` / `À revoir` / `Non concerné` : les marqueurs de suivi (`suivi normal`, `à relancer`, `relancé`, `en attente client`) restent cohérents
- [ ] `OK` / `À revoir` / `Non concerné` : le lien chantier ↔ devis / facture reste lisible

### 8. Réglementation

- [ ] `OK` / `À revoir` / `Non concerné` : les obligations applicables restent lisibles
- [ ] `OK` / `À revoir` / `Non concerné` : les statuts de conformité (`à compléter`, `en cours`, `à vérifier`, `conforme`, `en retard`) restent cohérents
- [ ] `OK` / `À revoir` / `Non concerné` : le suivi sécurité bâtiment reste simple à comprendre
- [ ] `OK` / `À revoir` / `Non concerné` : l'export réglementaire PDF reste utilisable

### 9. Synchronisation visible

- [ ] `OK` / `À revoir` / `Non concerné` : les états `enregistré sur l'appareil`, `en attente de synchronisation`, `synchronisé`, `à vérifier` restent compréhensibles
- [ ] `OK` / `À revoir` / `Non concerné` : les retours après action locale rassurent l'utilisateur
- [ ] `OK` / `À revoir` / `Non concerné` : un chantier mobile n'affiche pas un état de synchro incohérent avec ses objets terrain
- [ ] `OK` / `À revoir` / `Non concerné` : les libellés visibles de synchro restent homogènes

### 10. Cohérence générale

- [ ] `OK` / `À revoir` / `Non concerné` : les statuts les plus visibles restent homogènes entre cockpit, chantier, documents et facturation
- [ ] `OK` / `À revoir` / `Non concerné` : les surfaces les plus fréquentes restent sobres et non anxiogènes
- [ ] `OK` / `À revoir` / `Non concerné` : aucune action courante ne donne l'impression d'un produit bloqué ou instable

## Sortie attendue de la beta fermée

À la fin du passage, relever seulement :
- les points bloquants réels avant ouverture pilote
- les 3 irritants UX les plus visibles
- les 3 parcours les plus rassurants à conserver tels quels

Ce qui reste volontairement hors périmètre :
- pas de plateforme QA
- pas de scoring détaillé
- pas de gestion d'anomalies intégrée
- pas de recette exhaustive par cas limite
