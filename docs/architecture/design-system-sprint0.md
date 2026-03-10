# Design System Sprint 0

## Objectif

Poser un socle UI partagé très léger entre `apps/web` et `apps/mobile`, sans lancer une refonte graphique complète ni une librairie de composants ambitieuse.

## Structure retenue

```text
packages/ui/
  src/
    components/
      button.component.ts
      card.component.ts
      empty-state.component.ts
      input.component.ts
      status-chip.component.ts
      sync-state.component.ts
    styles/
      tokens.css
    index.ts
```

## Primitives Sprint 0

- `CfmButtonComponent`
- `CfmInputComponent`
- `CfmCardComponent`
- `CfmStatusChipComponent`
- `CfmEmptyStateComponent`
- `CfmSyncStateComponent`

## Décisions

- Les composants sont des composants standalone Angular.
- Les styles partagés reposent sur quelques variables CSS simples dans `tokens.css`.
- `apps/web` et `apps/mobile` importent ce socle sans couche de build dédiée.
- Les composants couvrent les besoins immédiats du socle Sprint 0, pas toutes les variantes futures.

## Ce qui est volontairement différé

- theming avancé
- librairie de documentation interactive
- catalogue complet de variantes
- composants métier
