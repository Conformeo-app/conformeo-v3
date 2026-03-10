# Pattern UX Capture Rapide Sprint 0

## Objectif

Définir un pattern mobile-first unique pour les actions terrain courtes, afin d’éviter des micro-flux différents pour chaque futur module.

## Règle principale

- viser `2` ou `3` étapes maximum
- garder un seul objectif utile par écran
- enregistrer localement le plus tôt possible
- montrer un retour simple et rassurant après l’action

## Structure standard

### Étape 1. Capturer

- ouvrir directement l’action demandée
- demander le minimum d’information nécessaire
- éviter les champs secondaires au premier passage

### Étape 2. Vérifier

- étape optionnelle si la donnée est déjà évidente
- ne montrer qu’un contrôle rapide : miniature, résumé, niveau d’attention, signature tracée

### Étape 3. Enregistrer

- confirmer localement sur l’appareil
- afficher un wording simple
- laisser la synchronisation pour plus tard

## Structure UI recommandée

- une ligne d’actions courtes clairement identifiées
- une surface principale unique pour l’action en cours
- un bloc de confirmation très court avec état local visible

## Déclinaisons Sprint 0

- `photo` : capturer, vérifier la miniature, enregistrer
- `note` : saisir, enregistrer
- `checklist` : cocher, relire le résumé, enregistrer
- `signature` : signer, confirmer, enregistrer
- `signalement` : décrire, choisir un niveau simple, enregistrer

## Ce qui est différé

- formulaires métier complets
- routage multi-écrans riche
- automatisations métier
- synchronisation distante
