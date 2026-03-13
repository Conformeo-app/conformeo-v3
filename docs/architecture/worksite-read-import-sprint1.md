# Sprint 1 - Import read-only des chantiers

S1-004 remplace le catalogue local de démonstration par une lecture API légère des résumés chantier.

## Choix retenu

- endpoint FastAPI read-only minimal
- aucune écriture chantier distante
- aucune table chantier backend Sprint 1
- persistance mobile dans `local_records`

## Flux

1. le mobile appelle `GET /organizations/{organization_id}/worksites`
2. les résumés reçus sont persistés localement sous `worksite_summary`
3. la liste chantier lit ensuite uniquement le stockage local
4. hors réseau, les derniers résumés importés restent consultables

## Préparation hors ligne

La préparation hors ligne reste locale :

- elle marque un chantier comme prêt hors ligne
- elle fige une fiche essentielle locale sous `worksite_detail`
- elle ne pousse rien au serveur

## Limites assumées

- source backend transitoire et read-only
- pas encore de détail chantier serveur
- pas encore de sync serveur/mobile pour les écritures chantier
