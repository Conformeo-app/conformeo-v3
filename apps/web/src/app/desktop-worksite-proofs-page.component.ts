import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, map, startWith } from "rxjs";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";
import type { DesktopWorksiteDetailVm } from "./desktop-worksites.models";

type ProofRegisterItem = {
  id: string;
  kind: "proof" | "signature";
  kindLabel: string;
  label: string;
  fileName: string;
  statusLabel: string;
  statusTone: CfmTone;
  uploadedAtLabel: string | null;
  notes: string | null;
  supportLabel: string;
};

type ProofWorkspaceVm = {
  detail: DesktopWorksiteDetailVm;
  items: ProofRegisterItem[];
  selected: ProofRegisterItem | null;
  treatmentTitle: string;
  treatmentTone: CfmTone;
  treatmentDetail: string;
  treatmentActionLabel: string;
  treatmentActionRoute: string;
};

@Component({
  selector: "cfm-desktop-worksite-proofs-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else emptyState">
      <section class="proof-workspace">
        <form class="proof-command-bar" [formGroup]="filterForm">
          <div class="command-title">
            <span class="command-kicker">Chantiers</span>
            <h3 class="page-title">Preuves chantier</h3>
            <div class="command-meta">
              <span class="meta-pill">{{ vm.items.length }} visible{{ vm.items.length > 1 ? 's' : '' }}</span>
              <span class="meta-pill">{{ vm.detail.proofsCountLabel }}</span>
              <span class="meta-pill meta-pill--info">{{ vm.detail.signaturesCountLabel }}</span>
            </div>
          </div>

          <div class="command-filters">
            <label class="compact-field compact-field--search">
              <span class="small">Recherche</span>
              <input type="text" formControlName="search" placeholder="Nom, fichier, commentaire" />
            </label>

            <label class="compact-field compact-field--status">
              <span class="small">Périmètre</span>
              <select formControlName="scope">
                <option value="all">Toutes</option>
                <option value="proof">Preuves</option>
                <option value="signature">Signatures</option>
              </select>
            </label>

            <div class="toolbar-actions">
              <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', vm.detail.id, 'apercu']">
                Revenir au chantier
              </cfm-button>
              <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', vm.detail.id, 'documents']">
                Documents
              </cfm-button>
              <cfm-button type="button" variant="ghost" size="sm" [routerLink]="['/app/chantiers', vm.detail.id, 'coordination']">
                Coordination
              </cfm-button>
            </div>
          </div>
        </form>

        <section class="proof-stage">
          <section class="register-pane">
            <div class="register-head" *ngIf="vm.items.length > 0">
              <span>Élément</span>
              <span>Type</span>
              <span>Statut</span>
              <span>Repère</span>
            </div>

            <ng-container *ngIf="vm.items.length > 0; else emptyList">
              <button
                *ngFor="let item of vm.items; trackBy: trackByItem"
                type="button"
                class="register-row"
                [class.is-selected]="vm.selected?.id === item.id"
              (click)="selectItem(item.id)"
            >
              <div class="register-cell register-cell--identity">
                  <strong class="record-primary proof-title">{{ item.label }}</strong>
                  <span class="record-meta subline">{{ item.fileName }}</span>
                </div>

                <div class="register-cell register-cell--type">
                  <cfm-status-chip [label]="item.kindLabel" tone="calm" />
                </div>

                <div class="register-cell register-cell--status">
                  <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                </div>

                <div class="register-cell register-cell--support">
                  <strong class="detail-copy">{{ item.supportLabel }}</strong>
                  <span class="comment-text">{{ item.notes || "Aucun commentaire" }}</span>
                </div>
              </button>
            </ng-container>
          </section>

          <aside class="proof-sheet">
            <section class="sheet-card">
              <div class="sheet-card-head">
                <h5 class="section-title">À traiter maintenant</h5>
                <cfm-status-chip [label]="vm.treatmentTitle" [tone]="vm.treatmentTone" />
              </div>

              <div class="sheet-summary detail-copy">
                <strong>{{ vm.treatmentTitle }}</strong>
                <span>{{ vm.treatmentDetail }}</span>
                <span>{{ vm.detail.issueSummaryLabel }}</span>
              </div>

              <div class="toolbar-actions">
                <cfm-button type="button" size="sm" [routerLink]="[vm.treatmentActionRoute]">
                  {{ vm.treatmentActionLabel }}
                </cfm-button>
                <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', vm.detail.id, 'apercu']">
                  Revenir au chantier
                </cfm-button>
              </div>
            </section>

            <ng-container *ngIf="vm.selected as item; else emptyDetail">
            <header class="sheet-header">
              <div class="sheet-title">
                <span class="sheet-number">{{ item.kindLabel }}</span>
                <h4 class="panel-title">{{ item.label }}</h4>
                <div class="chips">
                  <cfm-status-chip class="status-chip" [label]="item.kindLabel" tone="calm" />
                  <cfm-status-chip class="status-chip" [label]="item.statusLabel" [tone]="item.statusTone" />
                </div>
              </div>

                <div class="toolbar-actions">
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', vm.detail.id, 'documents']">
                    Voir les documents
                  </cfm-button>
                  <cfm-button type="button" size="sm" [routerLink]="['/app/chantiers', vm.detail.id, 'apercu']">
                    Revenir au chantier
                  </cfm-button>
                </div>
            </header>

              <section class="sheet-ribbon detail-copy">
                <article class="sheet-ribbon-cell">
                  <span class="small">Type</span>
                  <strong>{{ item.kindLabel }}</strong>
                </article>
                <article class="sheet-ribbon-cell">
                  <span class="small">Statut</span>
                  <strong>{{ item.statusLabel }}</strong>
                </article>
                <article class="sheet-ribbon-cell">
                  <span class="small">Date</span>
                  <strong>{{ item.uploadedAtLabel || "Non précisée" }}</strong>
                </article>
                <article class="sheet-ribbon-cell">
                  <span class="small">Chantier</span>
                  <strong>{{ vm.detail.name }}</strong>
                </article>
              </section>

              <section class="sheet-card">
                <div class="sheet-card-head">
                  <h5 class="section-title">Justificatif sélectionné</h5>
                </div>

                <div class="sheet-info-grid detail-copy">
                  <div class="info-line">
                    <span class="small">Fichier</span>
                    <strong>{{ item.fileName }}</strong>
                  </div>
                  <div class="info-line">
                    <span class="small">Signal</span>
                    <strong>{{ item.statusLabel }}</strong>
                  </div>
                  <div class="info-line">
                    <span class="small">Repère</span>
                    <strong>{{ item.supportLabel }}</strong>
                  </div>
                  <div class="info-line">
                    <span class="small">Commentaire</span>
                    <strong class="comment-text">{{ item.notes || "Aucun commentaire" }}</strong>
                  </div>
                </div>
              </section>

              <section class="sheet-card">
                <div class="sheet-card-head">
                  <h5 class="section-title">Où aller ensuite</h5>
                </div>

                <ul class="sheet-list detail-copy">
                  <li>
                    <span>Coordination</span>
                    <strong>{{ vm.detail.coordination.statusLabel }} · {{ vm.detail.coordination.assigneeLabel }}</strong>
                  </li>
                  <li>
                    <span>Documents</span>
                    <strong>{{ vm.detail.documentsCountLabel }}</strong>
                  </li>
                  <li>
                    <span>Action utile</span>
                    <strong>{{ vm.detail.primaryActionLabel }}</strong>
                  </li>
                  <li>
                    <span>Retour chantier</span>
                    <strong>Hub aperçu chantier</strong>
                  </li>
                </ul>
              </section>
            </ng-container>
          </aside>
        </section>
      </section>
    </ng-container>

    <ng-template #emptyList>
      <section class="compact-empty">
        <strong>Aucune preuve visible</strong>
        <p>Les preuves et signatures chantier apparaîtront ici dès qu’elles seront disponibles.</p>
      </section>
    </ng-template>

    <ng-template #emptyDetail>
      <section class="compact-empty compact-empty--detail">
        <strong>Aucune ligne sélectionnée</strong>
        <p>Sélectionnez une preuve ou une signature pour ouvrir son contexte.</p>
      </section>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Chargement des preuves"
        description="Les preuves chantier se préparent."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .proof-workspace,
      .command-title,
      .sheet-title,
      .compact-empty {
        display: grid;
        gap: 0.32rem;
      }

      .proof-workspace {
        gap: 0.65rem;
      }

      .proof-command-bar,
      .command-filters,
      .sheet-header,
      .toolbar-actions,
      .chips,
      .sheet-list li,
      .info-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
      }

      .proof-command-bar {
        padding: 0.54rem 0.68rem;
        border-radius: 12px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface);
      }

      .command-kicker,
      .register-head,
      .sheet-number {
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .command-title h3,
      .sheet-title h4,
      .sheet-card-head h5 {
        margin: 0;
        color: var(--cfm-color-ink);
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .command-meta,
      .toolbar-actions,
      .chips {
        display: inline-flex;
        align-items: center;
        gap: 0.42rem;
        flex-wrap: wrap;
      }

      .meta-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.24rem 0.48rem;
        border-radius: 9px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface-secondary);
        color: var(--cfm-color-primary-strong);
        font-size: 0.8rem;
        font-weight: var(--cfm-font-weight-regular, 400);
      }

      .meta-pill--info {
        background: var(--cfm-color-primary-soft);
      }

      .compact-field {
        display: grid;
        gap: 0.22rem;
        min-width: 11rem;
      }

      .compact-field--search {
        flex: 1 1 18rem;
      }

      .compact-field input,
      .compact-field select {
        width: 100%;
        padding: 0.46rem 0.58rem;
        border-radius: 9px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface-secondary);
        color: var(--cfm-color-ink);
        font: inherit;
      }

      .proof-stage {
        display: grid;
        grid-template-columns: minmax(21rem, 0.95fr) minmax(23rem, 1.05fr);
        gap: 0.65rem;
      }

      .register-pane,
      .proof-sheet,
      .sheet-ribbon,
      .sheet-card,
      .sheet-info-grid,
      .sheet-summary {
        display: grid;
        gap: 0.58rem;
        align-content: start;
      }

      .register-pane,
      .proof-sheet {
        min-height: 28rem;
        padding: 0.58rem 0.72rem;
        border-radius: 12px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface);
      }

      .register-head,
      .register-row {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) auto auto minmax(12rem, 1fr);
        gap: 0.7rem;
        align-items: center;
      }

      .register-head {
        padding: 0 0.16rem 0.4rem;
      }

      .register-row {
        width: 100%;
        padding: 0.58rem 0.18rem;
        border: none;
        border-top: 1px solid var(--cfm-color-border);
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }

      .register-row:hover {
        background: var(--cfm-color-surface-secondary);
      }

      .register-row.is-selected {
        background: var(--cfm-color-primary-soft);
        box-shadow: inset 3px 0 0 var(--cfm-color-primary);
      }

      .register-cell {
        display: grid;
        gap: 0.2rem;
      }

      .register-cell span,
      .sheet-ribbon-cell span:not(.small),
      .sheet-list span,
      .info-line span,
      .compact-empty p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        font-weight: var(--cfm-font-weight-light, 300);
      }

      .register-cell strong,
      .sheet-ribbon-cell strong,
      .sheet-list strong,
      .info-line strong,
      .compact-empty strong {
        color: var(--cfm-color-ink);
      }

      .register-cell strong,
      .sheet-ribbon-cell strong,
      .sheet-list strong,
      .info-line strong {
        font-weight: var(--cfm-font-weight-light, 300);
      }

      .register-cell--identity strong,
      .sheet-title h4,
      .compact-empty strong {
        font-weight: var(--cfm-font-weight-medium, 500);
      }

      .sheet-title h4,
      .compact-empty strong,
      .sheet-card-head h5 {
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .sheet-ribbon {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .sheet-ribbon-cell,
      .sheet-card,
      .compact-empty {
        padding: 0.56rem 0.62rem;
        border-radius: 11px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface-secondary);
      }

      .sheet-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sheet-info-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .sheet-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .sheet-list li,
      .info-line {
        padding-bottom: 0.42rem;
        border-bottom: 1px solid var(--cfm-color-border);
      }

      .sheet-list li:last-child,
      .info-line:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }

      .comment-text {
        overflow-wrap: break-word;
        word-break: normal;
      }

      .compact-empty--detail {
        min-height: 12rem;
        place-content: center;
      }

      @media (max-width: 1180px) {
        .proof-stage,
        .sheet-ribbon,
        .sheet-info-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 900px) {
        .proof-command-bar,
        .command-filters,
        .sheet-header,
        .register-head,
        .register-row {
          display: grid;
        }

        .compact-field {
          min-width: 0;
        }
      }
    `,
  ],
})
export class DesktopWorksiteProofsPageComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly route = inject(ActivatedRoute);
  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    scope: new FormControl<"all" | "proof" | "signature">("all", { nonNullable: true }),
  });

  private readonly selectedItemId$ = new BehaviorSubject<string | null>(null);
  private readonly detail$ = this.facade.detail$(this.route.paramMap.pipe(map((params) => params.get("worksiteId"))));

  readonly vm$ = combineLatest([
    this.detail$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
    this.selectedItemId$,
  ]).pipe(
    map(([detail, filters, selectedItemId]) => {
      if (!detail) {
        return null;
      }

      const search = this.toSearchableText(filters.search);
      const items: ProofRegisterItem[] = [
        ...detail.proofs.map((proof) => ({
          id: proof.id,
          kind: "proof" as const,
          kindLabel: "Preuve",
          label: proof.label,
          fileName: proof.fileName,
          statusLabel: proof.statusLabel,
          statusTone: proof.statusTone,
          uploadedAtLabel: proof.uploadedAtLabel,
          notes: proof.notes,
          supportLabel: proof.uploadedAtLabel ? `Ajoutée le ${proof.uploadedAtLabel}` : "Date non précisée",
        })),
        ...detail.signatures.map((signature) => ({
          id: signature.id,
          kind: "signature" as const,
          kindLabel: "Signature",
          label: signature.label,
          fileName: signature.fileName,
          statusLabel: signature.statusLabel,
          statusTone: signature.statusTone,
          uploadedAtLabel: signature.uploadedAtLabel,
          notes: null,
          supportLabel: signature.uploadedAtLabel ? `Ajoutée le ${signature.uploadedAtLabel}` : "Date non précisée",
        })),
      ].filter((item) => {
        const matchesScope = filters.scope === "all" || item.kind === filters.scope;
        const matchesSearch =
          search.length === 0
          || this.toSearchableText(`${item.label} ${item.fileName} ${item.notes ?? ""}`).includes(search);
        return matchesScope && matchesSearch;
      });

      const selected = items.find((item) => item.id === selectedItemId) ?? items[0] ?? null;
      return {
        detail,
        items,
        selected,
        ...this.buildTreatmentVm(detail, items),
      } satisfies ProofWorkspaceVm;
    }),
  );

  selectItem(itemId: string): void {
    this.selectedItemId$.next(itemId);
  }

  trackByItem(_index: number, item: ProofRegisterItem): string {
    return item.id;
  }

  private buildTreatmentVm(
    detail: DesktopWorksiteDetailVm,
    items: ProofRegisterItem[],
  ): Omit<ProofWorkspaceVm, "detail" | "items" | "selected"> {
    const proofCount = items.filter((item) => item.kind === "proof").length;
    const signatureCount = items.filter((item) => item.kind === "signature").length;

    if (detail.blockingItems.length > 0) {
      return {
        treatmentTitle: "Blocage à lever",
        treatmentTone: "danger",
        treatmentDetail: `${detail.primarySignalLabel}. ${detail.primaryActionDetail}`,
        treatmentActionLabel: detail.primaryActionLabel,
        treatmentActionRoute: detail.primaryActionRoute,
      };
    }

    if (items.length === 0) {
      return {
        treatmentTitle: "Preuves à compléter",
        treatmentTone: "warning",
        treatmentDetail: "Aucun justificatif terrain n’est encore visible. Revenez au chantier pour garder le bon enchaînement.",
        treatmentActionLabel: "Revenir au chantier",
        treatmentActionRoute: `/app/chantiers/${detail.id}/apercu`,
      };
    }

    if (proofCount === 0 || signatureCount === 0) {
      return {
        treatmentTitle: proofCount === 0 ? "Preuve à ajouter" : "Signature à ajouter",
        treatmentTone: "progress",
        treatmentDetail: "La trace terrain reste partielle. Relisez les documents liés avant de considérer le sujet bouclé.",
        treatmentActionLabel: "Voir les documents",
        treatmentActionRoute: `/app/chantiers/${detail.id}/documents`,
      };
    }

    return {
      treatmentTitle: "Preuves sous contrôle",
      treatmentTone: "success",
      treatmentDetail: "Les justificatifs essentiels sont visibles. Le bon réflexe est maintenant de revenir au chantier ou relire les documents liés.",
      treatmentActionLabel: "Revenir au chantier",
      treatmentActionRoute: `/app/chantiers/${detail.id}/apercu`,
    };
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
