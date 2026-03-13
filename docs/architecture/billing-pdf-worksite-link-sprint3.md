# Billing PDF Worksite Link Sprint 3

Sprint 3 complète le socle Facturation avec :

- export PDF simple des devis
- export PDF simple des factures
- rattachement d'un devis ou d'une facture à un chantier existant

## PDF devis

Le PDF devis reste volontairement simple :

- entreprise
- client
- numéro
- statut
- chantier lié si présent
- lignes
- total

Il s'agit d'un PDF textuel lisible et partageable, sans moteur de template avancé.

## PDF facture

Le PDF facture reprend le même principe avec, en plus :

- échéance
- montant réglé
- reste dû
- date de paiement si disponible

## Lien chantier

Les devis et factures portent un `worksite_id` optionnel.

Le rattachement :
- utilise la source chantier read-only déjà existante
- ne crée pas encore de modèle chantier persistant côté facturation
- reste modifiable simplement

Le nom du chantier est résolu à la lecture pour garder le socle léger.
