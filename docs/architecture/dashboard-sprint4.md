# Dashboard Sprint 4

Sprint 4 ajoute uniquement une vue d’ensemble desktop simple.

## Intention

- donner un point d’entrée clair à l’utilisateur
- faire ressortir quelques repères utiles sans reporting complexe
- montrer les priorités du moment avec un vocabulaire non technique
- aider l’utilisateur à savoir quoi faire ensuite, sans ouvrir un vrai task manager

## Choix retenus

- aucun backend d’analytics dédié
- le dashboard réutilise les données déjà chargées par le desktop :
  - `quotes`
  - `invoices`
  - `regulatoryProfile`
  - `buildingSafetyAlerts`
  - `worksites`
- les KPI restent volontairement peu nombreux et actionnables
- la liste d’actions est calculée côté desktop à partir des données déjà présentes
- aucun backend dashboard dédié n’est ajouté pour ce bloc

## KPI affichés

- devis en cours
- factures en attente
- réglementaire à vérifier
- chantiers nécessitant une action

Chaque carte reste courte :
- une valeur
- une phrase utile
- un statut simple

## Alertes transverses

Les alertes restent simples et priorisées :
- factures en retard
- devis à relancer
- sécurité bâtiment à traiter
- obligations à vérifier
- chantiers bloqués ou à préparer

Le but n’est pas de remplacer les modules, mais d’aider l’utilisateur à savoir où regarder en premier.

## Actions à faire

Le dashboard propose aussi une liste d’actions simple :
- factures à traiter ou à suivre
- devis à relancer ou à finaliser
- obligations à vérifier ou à préparer
- éléments sécurité bâtiment en retard ou proches d’échéance
- chantiers bloqués ou à préparer

Chaque action porte :
- un niveau simple `haute`, `moyenne` ou `basse`
- un module d’origine `Réglementation`, `Chantier` ou `Facturation`
- un libellé court et compréhensible

## Filtre par module

La liste d’actions peut être filtrée par module pour passer rapidement :
- de la vue globale
- à une lecture opérationnelle par domaine

Le filtre reste volontairement léger et ne crée pas de couche analytics ou de gestion de tâches dédiée.

## Lectures utiles

Sprint 4 ajoute aussi trois lectures sobres pour compléter le dashboard :

- une vue entreprise synthétique, regroupée par module actif
- la synthèse par module est ensuite rendue plus explicite avec quelques repères courts propres à :
  - Réglementation : obligations, sécurité bâtiment, DUERP
  - Chantier : actions terrain, documents chantier, éléments liés
  - Facturation : factures, devis, encaissement simple
- une vue par chantier, avec statut général et signaux simples déjà disponibles
- la vue chantier regroupe maintenant :
  - contexte opérationnel
  - points à traiter
  - documents liés
  - signal financier simple
- une vue par client, centrée sur l’activité commerciale et les suivis utiles
- depuis la vue chantier, les devis et factures déjà liés restent visibles sans ouvrir une couche documentaire

Ces vues restent :
- calculées côté desktop
- basées sur les données déjà chargées
- sans graphique complexe ni navigation supplémentaire
