# Réglementation Sprint 2 — Export PDF de base

Ce bloc ajoute un export PDF simple, lisible et directement partageable depuis le module Réglementation.

## Principe

L'export est généré côté API à partir des données déjà présentes :

- profil entreprise
- obligations applicables
- sécurité bâtiment
- DUERP simplifié
- pièces justificatives réglementaires

Le document reste volontairement sobre :

- pas de moteur de templates
- pas de variantes multiples
- pas de graphiques
- pas de reporting riche

## Endpoint

```bash
GET /organizations/{organization_id}/regulatory-export.pdf
```

Le point est en lecture seule et retourne directement un `application/pdf`.

## Contenu

Le PDF est structuré en sections courtes :

- identification entreprise
- résumé réglementaire
- obligations applicables
- sécurité bâtiment
- DUERP simplifié
- pièces justificatives

## Choix techniques

- génération PDF en Python sans dépendance externe supplémentaire
- rendu texte simple, déterministe et facile à tester
- bouton de téléchargement unique côté desktop Angular

Le but est d'obtenir un document utile en rendez-vous, contrôle simple ou partage interne, sans ouvrir un chantier documentaire plus large.
