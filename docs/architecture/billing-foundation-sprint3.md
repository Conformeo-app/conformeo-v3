# Facturation Foundation Sprint 3

Sprint 3 pose uniquement un socle simple et rapidement exploitable pour la facturation desktop.

## Périmètre

- `BillingCustomer`
- `Quote`
- `Invoice`

Le but est de permettre :
- la création et la lecture de clients
- la création et la lecture de devis simples
- la création et la lecture de factures simples

Le bloc ne couvre pas :
- paiements
- PDF de devis ou facture
- numérotation avancée
- relances
- comptabilité

## Choix de modélisation

- Les clients sont rattachés à `Organization`.
- Les devis et factures sont rattachés à un client et à l'organisation.
- Les lignes sont stockées en JSON simple (`description`, `quantity`, `unit_price_cents`, `line_total_cents`).
- Les totaux sont calculés côté backend pour garder un comportement déterministe.

## Statuts

- `QuoteStatus`: `draft`, `sent`
- `InvoiceStatus`: `draft`, `issued`

Ces statuts restent volontairement minimaux pour Sprint 3.

## Surface desktop

Le desktop expose trois cartes simples :
- `Clients`
- `Devis simple`
- `Facture simple`

## Activation modulaire

- Le socle Facturation reste strictement derrière le module `facturation`.
- Si le module est désactivé pour une organisation, le desktop masque les cartes Facturation et l'API refuse les endpoints `customers`, `quotes`, `invoices` et leurs actions associées.

## Audit minimal

Le module réutilise le socle d'audit existant pour tracer :
- création et mise à jour de client
- création de devis et facture
- changement de statut
- paiement simple
- rattachement chantier quand il change

L'interface reste sobre :
- quelques champs essentiels
- lignes ajoutables/retraitables
- total immédiatement lisible
- liste de lecture simple
- recherche rapide locale sur les clients (`nom`, puis aussi `email` et `téléphone` quand c'est utile)
- brouillons locaux légers sur devis et facture, conservés sur l'appareil courant puis effacés à la validation ou sur action explicite
- historique simple sur devis et facture, dérivé de l'audit log existant pour afficher seulement les événements utiles (`création`, `changement de statut`, `paiement`, `lien chantier`)
- duplication simple d'un devis en facture, en reprenant le client, les lignes, le chantier lié et le total sans ressaisie
- édition légère d'un devis ou d'une facture existante, directement dans la liste desktop, pour ajuster le client, les lignes, le chantier lié, les dates utiles et la note sans recréer le document
- marqueur de suivi léger sur devis et facture (`suivi normal`, `à relancer`, `relancé`, `en attente client`) pour aider la lecture commerciale sans ouvrir un CRM

## Évolutions prévues plus tard

- PDF de devis et facture
- numérotation simple
- paiements et statut de règlement
- relances
