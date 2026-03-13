# Réglementation Sprint 2 — Questionnaire de qualification court

Ce bloc ajoute un questionnaire très court pour affiner le profil réglementaire sans ouvrir un moteur expert.

## Questions retenues

Le questionnaire reste limité à trois points :

- accueil du public sur au moins un site
- stockage de produits ou matériels sensibles sur site
- interventions terrain à risque

Ces questions ont été retenues car elles améliorent directement la lecture du moteur simple déjà en place.

## Persistance

Les réponses sont stockées directement sur `organizations` :

- `receives_public`
- `stores_hazardous_products`
- `performs_high_risk_work`

Le choix reste volontairement simple :

- pas de sous-modèle de questionnaire
- pas de moteur de scoring
- pas de logique juridique lourde

## Impact sur le moteur simple

Le moteur réglementaire réutilise ces réponses pour :

- affiner les critères affichés dans le profil réglementaire
- signaler les informations encore à préciser
- améliorer la pertinence de certaines obligations V1

Exemples :

- accueil du public : rend les consignes et contacts d'urgence plus prioritaires à vérifier
- stockage sensible : peut faire apparaître les consignes de stockage même sans entrepôt dédié
- interventions à risque : renforce le besoin d'un DUERP et d'une organisation sécurité simple

## Surface desktop

Le questionnaire apparait comme une carte dédiée après l'initialisation du profil entreprise.

L'objectif UX est de rester :

- court
- non technique
- progressif
- non anxiogène
