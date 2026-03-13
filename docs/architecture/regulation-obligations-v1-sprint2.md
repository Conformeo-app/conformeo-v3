# Catalogue obligations V1 Sprint 2

Ce bloc ajoute une premiere lecture utile du perimetre reglementaire, sans chercher a construire un moteur juridique expert.

## Catalogue obligations V1

Le referentiel V1 est statique et code en dur dans l'API pour rester lisible et maintenable.

Chaque obligation porte :
- un identifiant stable
- un titre
- une description courte
- une categorie simple
- une priorite simple
- une `rule_key` qui reference la logique d'applicabilite

Catalogue initial :
- `reg-employees-register`
- `reg-employees-safety-organization`
- `reg-sites-emergency-contacts`
- `reg-buildings-periodic-checks`
- `reg-warehouse-storage-rules`

## Moteur simple

Le moteur simple lit :
- le profil entreprise
- les sites actifs

Criteres explicites retenus :
- presence de salaries
- effectif connu
- presence de sites actifs
- presence de locaux ou batiments
- presence d'un entrepot

Le moteur retourne :
- un statut de profil `ready` ou `to_complete`
- les informations encore manquantes pour affiner la lecture
- la liste des obligations applicables
- une explication courte par obligation

## API minimale

Lecture desktop :

```text
GET /organizations/{organization_id}/regulatory-profile
```

Le resultat alimente directement la liste des obligations de l'entreprise.

## UX desktop

Le desktop affiche :
- un resume de lecture
- les informations encore a completer si besoin
- les criteres pris en compte
- la liste des obligations applicables avec categorie, priorite et statut simple

Le wording reste volontairement non anxiogene :
- premiere lecture utile
- a preparer
- profil a completer

## Limites volontaires

- pas de moteur juridique expert
- pas de veille reglementaire
- pas de DUERP dans ce bloc
- pas de personnalisation avancée par secteur
