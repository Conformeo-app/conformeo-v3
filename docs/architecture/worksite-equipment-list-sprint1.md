# Sprint 1 - Liste d'equipements liee au chantier

S1-040 ajoute une liste simple d'equipements utiles dans la fiche chantier mobile, sans ouvrir un backend equipement complexe ni une logique de maintenance.

## Choix retenu

- rester sur une source read-only legere cote mobile
- persister la liste dans `worksite_detail` pour la consultation hors ligne
- limiter chaque equipement a trois informations utiles sur le terrain :
  - nom
  - type
  - statut simple

## Statuts gardes volontairement simples

- `pret`
- `a verifier`
- `indisponible`

Le but est d'aider la consultation terrain, pas de lancer une GMAO.

## Effet sur la fiche chantier

- la liste apparait dans une zone `Equipements utiles`
- elle reste lisible sur telephone
- elle reste disponible sans reseau une fois le chantier present localement
- elle ne passe pas par la queue locale, car il n'y a pas d'ecriture metier dans ce ticket
