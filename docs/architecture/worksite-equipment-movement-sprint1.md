# Sprint 1 - Mouvement equipement basique

S1-041 ajoute une trace locale simple des mouvements d'equipement dans le contexte du chantier, sans ouvrir de gestion de parc complete.

## Choix retenu

- creer un objet terrain local dedie `worksite_equipment_movement`
- garder seulement trois mouvements utiles :
  - `affecte au chantier`
  - `retire du chantier`
  - `signale comme endommage`
- conserver :
  - l'horodatage
  - l'auteur si disponible dans la session
  - le statut local de synchronisation

## Stockage

- le mouvement est stocke dans `local_records`
- une operation `create` est ajoutee a la queue locale
- l'equipement garde un statut simple derive du dernier mouvement connu

## Effet sur la fiche chantier

- chaque equipement peut recevoir une action courte
- les derniers mouvements restent consultables hors ligne
- le rendu reste mobile-first et peu charge
