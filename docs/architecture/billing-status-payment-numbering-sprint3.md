# Billing Status Payment Numbering Sprint 3

Sprint 3 complète le socle Facturation avec trois briques simples :

- statuts lisibles pour les devis et factures
- paiement unique simple sur une facture
- numérotation courte et cohérente

## Statuts

### Devis

- `draft`
- `sent`
- `accepted`
- `declined`

Le statut reste purement opérationnel et lisible. Il n'y a pas de workflow commercial avancé.

### Factures

- `draft`
- `issued`
- `paid`
- `overdue`

`overdue` reste volontairement simple :
- il dépend de l'échéance
- il disparait si la facture est réglée

## Paiement simple

Le paiement reste limité à un seul enregistrement sur la facture :

- `paid_amount_cents`
- `paid_at`

Comportement retenu :
- si le montant payé couvre le total, la facture passe en `paid`
- sinon, elle reste `issued` ou `overdue` selon l'échéance

Il n'y a pas de paiements multiples, de ventilation ou de rapprochement comptable.

## Numérotation simple

Deux séquences simples et distinctes par organisation :

- devis : `DEV-0001`
- factures : `FAC-0001`

Le choix est volontairement minimal :
- lisible par l'utilisateur
- distinct entre devis et facture
- sans moteur de séquence avancé
