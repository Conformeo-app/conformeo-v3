# Fiche obligation simple Sprint 2

Ce bloc ajoute une lecture detaillee mais legere d'une obligation deja detectee par le moteur reglementaire simple.

## Objectif

Permettre a un non-expert de comprendre rapidement :
- pourquoi l'obligation s'applique
- quelles pieces sont deja rattachees directement
- quelle premiere action concrete peut etre preparee

## Choix retenu

La fiche obligation reste dans la carte `Obligations a preparer` du desktop.

Elle ne cree pas :
- de nouvelle route desktop
- de workflow reglementaire complet
- de logique juridique experte

Le detail s'appuie uniquement sur les donnees deja presentes :
- `reason_summary`
- `matched_criteria`
- les pieces justificatives liees a l'obligation
- le statut simple de conformite

## Contenu affiche

La fiche montre :
- le titre
- la description courte
- la priorite simple
- le statut simple
- la raison d'applicabilite
- les criteres qui ont declenche l'obligation
- les pieces deja rattachees directement
- une premiere action conseillee simple

## Limites volontaires

Le bloc reste volontairement limite :
- pas d'assignation
- pas de validation multi-etapes
- pas de moteur juridique detaille
- pas de vue experte surchargee
