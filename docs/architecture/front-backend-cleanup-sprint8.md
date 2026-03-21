# Sprint 8 — Nettoyage ciblé des écarts front/backend

Objectif :
- corriger quelques écarts visibles sans ouvrir un chantier massif
- améliorer la cohérence d'usage réel en pilote
- garder des patchs simples et reviewables

## Cas traités

### 1. Chargement réglementation aligné sur l'activation module

Le desktop ne recharge plus le profil réglementaire, la sécurité bâtiment, le DUERP et les preuves si le module `reglementation` n'est pas activé.

Effet :
- moins d'appels API inutiles
- moins de risque de lecture incohérente entre modules actifs et données affichées

### 2. Disponibilité réelle du fichier sur les documents chantier

Les documents chantier remontent maintenant un indicateur léger `has_stored_file` avec la taille du fichier quand elle est connue.

Effet :
- la consultation desktop distingue mieux un document simplement référencé d'un document déjà récupérable de façon stable
- le téléchargement est plus lisible en usage réel

### 3. Mise à jour locale après téléchargement stabilisé

Quand un ancien document chantier est retéléchargé et stabilisé côté backend, le desktop reflète immédiatement cet état sans refresh global.

Effet :
- le retour utilisateur est plus cohérent
- la liste des documents chantier devient crédible sans recharge complète

## Ce que le ticket ne fait pas

- aucun filtrage serveur riche
- aucune GED
- aucune refonte de la vue chantier enrichie
- aucun backend massif pour toutes les lectures cockpit

## Résumé

Le ticket réduit quelques écarts concrets entre ce que le backend sait déjà faire et ce que le desktop montrait ou chargeait encore trop largement.
