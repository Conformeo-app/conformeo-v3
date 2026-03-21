## Sprint 7 — Coordination légère

Ce bloc ajoute une première coordination simple autour de deux objets déjà visibles dans le desktop :
- le chantier
- le document chantier

Le périmètre reste volontairement court :
- une affectation simple vers un membre existant de l'organisation
- un commentaire court
- un suivi `a faire / en cours / fait`
- des filtres légers par statut et par personne affectée
- une vue courte `a traiter` dans le cockpit desktop

Choix de conception :
- aucun task manager
- aucun fil de discussion riche
- aucune notification complexe
- aucune hiérarchie d'affectation

Implémentation retenue :
- persistance légère dans `worksite_coordination_items`
- un seul enregistrement de coordination par cible
- deux cibles seulement :
  - `worksite`
  - `worksite_document`
- lecture enrichie directement dans les payloads `worksites` et `worksite-documents`
- filtres et vue `a traiter` calculés côté desktop, sans backend analytique supplémentaire
- filtres partagés par `suivi` et `personne affectée` pour garder une lecture cohérente entre `Vue par chantier` et `Documents chantier`
- section desktop `À traiter` limitée aux éléments encore en `à faire` ou `en cours`, pour éviter une vue de pilotage trop lourde

Endpoints utiles :
- `GET /organizations/{organization_id}/worksite-assignees`
- `PATCH /organizations/{organization_id}/worksites/{worksite_id}/coordination`
- `PATCH /organizations/{organization_id}/worksite-documents/{document_id}/coordination`

Compatibilité :
- aucun changement sur le moteur chantier existant
- aucun impact sur la génération PDF
- aucun impact sur le lien document -> signature / preuves
