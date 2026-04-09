import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent } from "@conformeo/ui";
import { combineLatest, map, startWith } from "rxjs";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";
import type { DesktopWorksiteEquipmentParkFilter, DesktopWorksiteEquipmentParkItem } from "./desktop-worksites.models";

@Component({
  selector: "cfm-desktop-worksite-equipment-park-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CfmButtonComponent,
    CfmEmptyStateComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <section class="park-page" *ngIf="vm$ | async as vm">
      <header class="park-header">
        <div class="park-title">
          <h3>Parc connu</h3>
          <p class="small">Lecture bureau simple des équipements déjà connus dans l’organisation, sans gestion de parc lourde.</p>
        </div>

        <div class="park-metrics">
          <span class="metric-pill">{{ vm.summary.totalLabel }}</span>
          <span class="metric-pill">{{ vm.summary.availableLabel }}</span>
          <span class="metric-pill">{{ vm.summary.assignedLabel }}</span>
          <span class="metric-pill">{{ vm.summary.attentionLabel }}</span>
        </div>
      </header>

      <div class="park-toolbar">
        <label class="compact-field">
          <span class="small">Affichage</span>
          <select [formControl]="filterControl">
            <option *ngFor="let option of filterOptions" [value]="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <div class="toolbar-meta">
          <strong>{{ vm.filteredLabel }}</strong>
          <span class="small">Les équipements non affectés ne sont plus cachés dans le flux chantier.</span>
        </div>
      </div>

      <section class="park-table" *ngIf="vm.items.length > 0; else emptyState">
        <div class="park-table-head">
          <span>Équipement</span>
          <span>État</span>
          <span>Affectation</span>
          <span>Dernier mouvement</span>
        </div>

        <article class="park-row" *ngFor="let item of vm.items; trackBy: trackByEquipment">
          <div class="park-cell park-cell--main">
            <strong>{{ item.name }}</strong>
            <span>{{ item.typeLabel }}</span>
          </div>

          <div class="park-cell park-cell--status">
            <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
          </div>

          <div class="park-cell">
            <div class="chips">
              <cfm-status-chip [label]="item.assignmentLabel" [tone]="item.assignmentTone" />
              <cfm-status-chip
                *ngIf="item.currentWorksiteStatusLabel && item.currentWorksiteStatusTone"
                [label]="item.currentWorksiteStatusLabel"
                [tone]="item.currentWorksiteStatusTone"
              />
            </div>
            <div class="assignment-link-block" *ngIf="item.currentWorksiteId; else availableState">
              <span class="small">Chantier courant</span>
              <a
                [routerLink]="['/app/chantiers', item.currentWorksiteId, 'equipements']"
                class="worksite-link"
              >
                {{ item.currentWorksiteName || "Chantier actuel" }}
              </a>
              <a
                [routerLink]="['/app/chantiers', item.currentWorksiteId, 'equipements']"
                class="worksite-action-link"
              >
                Voir le chantier
              </a>
            </div>
            <ng-template #availableState>
              <span class="small">Non affecté</span>
            </ng-template>
          </div>

          <div class="park-cell">
            <strong>{{ item.lastMovementLabel }}</strong>
            <span class="small">
              {{ item.lastMovementAtLabel || "Sans repère récent" }}
            </span>
            <span class="small" *ngIf="item.actorLabel">Acteur : {{ item.actorLabel }}</span>
          </div>
        </article>
      </section>
    </section>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Aucun équipement visible"
        description="Créez un équipement depuis une fiche chantier pour alimenter le parc connu de l’organisation."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: #17312b;
      }

      .park-page,
      .park-title,
      .park-cell,
      .toolbar-meta,
      .assignment-link-block {
        display: grid;
        gap: 0.3rem;
      }

      .park-page {
        gap: 0.72rem;
      }

      .park-header,
      .park-toolbar,
      .park-row,
      .park-table-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .park-header h3 {
        margin: 0;
      }

      .park-metrics,
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .metric-pill {
        display: inline-flex;
        align-items: center;
        min-height: 2rem;
        padding: 0.35rem 0.58rem;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.88);
        border: 1px solid rgba(23, 49, 43, 0.08);
      }

      .park-toolbar {
        align-items: end;
        padding: 0.52rem 0.62rem;
        border-radius: 12px;
        border: 1px solid rgba(23, 49, 43, 0.08);
        background: rgba(255, 255, 255, 0.9);
      }

      .compact-field {
        display: grid;
        gap: 0.25rem;
        min-width: 12rem;
      }

      .compact-field select {
        width: 100%;
        padding: 0.48rem 0.6rem;
        border-radius: 9px;
        border: 1px solid rgba(23, 49, 43, 0.12);
        background: #fff;
        color: #17312b;
        font: inherit;
      }

      .park-table {
        display: grid;
        gap: 0.55rem;
      }

      .park-table-head,
      .park-row {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(7rem, 0.9fr) minmax(0, 1.2fr) minmax(0, 1.25fr);
        gap: 0.75rem;
      }

      .park-table-head {
        padding: 0 0.3rem;
        color: rgba(23, 49, 43, 0.62);
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .park-row {
        align-items: start;
        padding: 0.72rem 0.78rem;
        border-radius: 12px;
        border: 1px solid rgba(23, 49, 43, 0.08);
        background: rgba(255, 255, 255, 0.92);
      }

      .park-cell--main strong {
        color: #102824;
      }

      .worksite-link {
        color: #23518b;
        text-decoration: none;
      }

      .worksite-link:hover {
        text-decoration: underline;
      }

      .worksite-action-link {
        width: fit-content;
        color: #17312b;
        text-decoration: none;
        font-size: 0.86rem;
        font-weight: 600;
      }

      .worksite-action-link:hover {
        text-decoration: underline;
      }

      @media (max-width: 1180px) {
        .park-header,
        .park-toolbar {
          display: grid;
          align-items: start;
        }

        .park-table-head {
          display: none;
        }

        .park-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopWorksiteEquipmentParkPageComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  readonly filterControl = new FormControl<DesktopWorksiteEquipmentParkFilter>("all", { nonNullable: true });
  readonly filterOptions: Array<{ value: DesktopWorksiteEquipmentParkFilter; label: string }> = [
    { value: "all", label: "Tous" },
    { value: "assigned", label: "Affectés" },
    { value: "available", label: "Non affectés" },
    { value: "attention", label: "Attention / indisponibles" },
  ];

  readonly vm$ = combineLatest([
    this.facade.equipmentParkItems$,
    this.facade.equipmentParkSummary$,
    this.filterControl.valueChanges.pipe(startWith(this.filterControl.getRawValue())),
  ]).pipe(
    map(([items, summary, filter]) => {
      const filteredItems = this.filterItems(items, filter);
      return {
        items: filteredItems,
        summary,
        filteredLabel:
          filter === "all"
            ? `${filteredItems.length} équipement${filteredItems.length > 1 ? "s" : ""} visible${filteredItems.length > 1 ? "s" : ""}`
            : `${filteredItems.length} résultat${filteredItems.length > 1 ? "s" : ""}`,
      };
    }),
  );

  private filterItems(
    items: DesktopWorksiteEquipmentParkItem[],
    filter: DesktopWorksiteEquipmentParkFilter,
  ): DesktopWorksiteEquipmentParkItem[] {
    switch (filter) {
      case "assigned":
        return items.filter((item) => item.isAssigned);
      case "available":
        return items.filter((item) => !item.isAssigned);
      case "attention":
        return items.filter((item) => item.needsAttention);
      default:
        return items;
    }
  }

  trackByEquipment(_index: number, item: DesktopWorksiteEquipmentParkItem): string {
    return item.id;
  }
}
