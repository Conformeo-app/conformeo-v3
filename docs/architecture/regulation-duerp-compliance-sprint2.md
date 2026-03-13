# Réglementation Sprint 2 — DUERP, preuves et conformité simple

Ce bloc ajoute trois briques volontairement sobres pour préparer une conformité exploitable sans construire un outil HSE expert :

- un `DUERP` simplifié
- des `pièces justificatives` réglementaires rattachables
- un `statut de conformité` lisible

## DUERP simplifié

Le modèle `duerp_entries` porte une ligne de risque simple :

- `work_unit_name`
- `risk_label`
- `severity`
- `prevention_action`
- `site_id` optionnel
- `status` `active|archived`

Chaque ligne reste compréhensible pour un non-expert :

- une unité de travail
- un risque
- une gravité simple
- une action de prévention courte

Le but n'est pas de couvrir un DUERP expert complet ni une matrice détaillée.

## Pièces justificatives réglementaires

Les preuves réutilisent le modèle transverse `documents`.

Pour ce bloc Sprint 2 :

- aucun moteur GED n'est ajouté
- aucun stockage binaire avancé n'est ouvert
- la surface desktop manipule uniquement des métadonnées simples

Les rattachements pris en charge sont :

- `obligation`
- `site`
- `building_safety_item`
- `duerp_entry`

Convention retenue :

- les preuves réglementaires utilisent `source="regulation"`
- un rattachement à une obligation passe par `attached_to_entity_type="organization"` et `attached_to_field="regulatory_obligation:<id>"`

## Statut de conformité simple

Le statut est dérivé, pas saisi manuellement.

Vocabulaire retenu :

- `à compléter`
- `en cours`
- `conforme`
- `à vérifier`
- `en retard`

Logique simple :

- obligation sans base suffisante : `à compléter`
- base présente mais sans preuve associée : `en cours`
- preuve ou élément attendu présent : `conforme`
- échéance proche : `à vérifier`
- élément en retard : `en retard`

## Surface desktop

Le desktop Angular affiche :

- une carte `DUERP simplifié`
- une carte `Pièces justificatives et conformité`
- les statuts de conformité directement dans la liste des obligations

Le filtre par site déjà présent est réutilisé pour éviter un nouvel écran ou une navigation plus lourde.
