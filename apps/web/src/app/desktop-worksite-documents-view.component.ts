import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, map, startWith } from "rxjs";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";
import type { DesktopWorksiteDetailVm, DesktopWorksiteDocumentItem } from "./desktop-worksites.models";

type DocumentTreatmentItem = {
  id: string;
  title: string;
  detail: string;
  statusLabel: string;
  tone: CfmTone;
};

type DocumentHistoryEntry = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  support: string | null;
  statusLabel: string | null;
  tone: CfmTone | null;
};

type DocumentWorkspaceVm = {
  detail: DesktopWorksiteDetailVm;
  documents: DesktopWorksiteDocumentItem[];
  selected: DesktopWorksiteDocumentItem | null;
  treatmentTitle: string;
  treatmentTone: CfmTone;
  treatmentDetail: string;
  treatmentActionLabel: string;
  treatmentActionRoute: string;
  treatmentItems: DocumentTreatmentItem[];
  keyDocuments: DesktopWorksiteDocumentItem[];
  historyEntries: DocumentHistoryEntry[];
  visibleCount: number;
  readyCount: number;
  draftCount: number;
  missingTraceCount: number;
  selectedActionLabel: string;
  selectedActionRoute: string;
  selectedActionDetail: string;
};

@Component({
  selector: "cfm-desktop-worksite-documents-view",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else emptyState">
      <ng-container *ngIf="vm.detail as worksite">
        <section class="document-workspace">
          <section class="document-stage">
            <section class="document-main">
              <article class="story-panel story-panel--priority">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Prioriser</span>
                    <h4>Documents à traiter</h4>
                    <p>Les pièces qui demandent encore une action, une preuve, une vérification ou un retour au chantier.</p>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="vm.treatmentTitle" [tone]="vm.treatmentTone" />
                </header>

                <div class="story-highlight">
                  <strong>{{ vm.treatmentTitle }}</strong>
                  <span>{{ vm.treatmentDetail }}</span>
                  <span>{{ worksite.issueSummaryLabel }}</span>
                </div>

                <div class="story-split">
                  <section class="story-block">
                    <h5>Pièces à traiter</h5>
                    <ul class="compact-list" *ngIf="vm.treatmentItems.length > 0; else noTreatmentItems">
                      <li *ngFor="let item of vm.treatmentItems; trackBy: trackByTreatmentItem">
                        <div class="list-copy">
                          <strong>{{ item.title }}</strong>
                          <span>{{ item.detail }}</span>
                        </div>
                        <cfm-status-chip class="status-chip" [label]="item.statusLabel" [tone]="item.tone" />
                      </li>
                    </ul>
                  </section>

                  <section class="story-block">
                    <h5>Action utile maintenant</h5>
                    <div class="action-callout">
                      <div class="section-copy">
                        <strong>{{ vm.treatmentActionLabel }}</strong>
                        <span>{{ vm.selectedActionDetail || worksite.primaryActionDetail }}</span>
                      </div>
                      <cfm-button type="button" size="sm" [routerLink]="vm.treatmentActionRoute">
                        Ouvrir
                      </cfm-button>
                    </div>
                    <p class="panel-note">
                      Le traitement documentaire reste lié au chantier : les preuves, la coordination et l’aperçu restent les sorties naturelles.
                    </p>
                  </section>
                </div>
              </article>

              <article class="story-panel story-panel--register">
                <header class="story-head story-head--register">
                  <div class="story-copy">
                    <span class="story-kicker">Registre</span>
                    <h4>Registre documentaire</h4>
                    <p>Une lecture de registre métier, filtrable, sans retomber dans un tableau froid ou une simple grille de fichiers.</p>
                  </div>

                  <form class="register-filters" [formGroup]="filterForm">
                    <label class="compact-field compact-field--search">
                      <span class="small">Recherche</span>
                      <input type="text" formControlName="search" placeholder="Type, fichier ou note" />
                    </label>

                    <label class="compact-field compact-field--status">
                      <span class="small">Préparation</span>
                      <select formControlName="lifecycle">
                        <option value="all">Tous</option>
                        <option value="draft">Brouillon</option>
                        <option value="finalized">Finalisé</option>
                      </select>
                    </label>
                  </form>
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ vm.visibleCount }} document{{ vm.visibleCount > 1 ? "s" : "" }} visible{{ vm.visibleCount > 1 ? "s" : "" }}</strong>
                  <span>{{ vm.readyCount }} prêt{{ vm.readyCount > 1 ? "s" : "" }} · {{ vm.draftCount }} brouillon{{ vm.draftCount > 1 ? "s" : "" }} · {{ vm.missingTraceCount }} à compléter</span>
                </div>

                <ng-container *ngIf="vm.documents.length > 0; else emptyList">
                  <button
                    *ngFor="let document of vm.documents; trackBy: trackByDocument"
                    type="button"
                    class="register-row"
                    [class.is-selected]="vm.selected?.id === document.id"
                    (click)="selectDocument(document.id)"
                  >
                    <div class="register-copy">
                      <span class="small">{{ document.typeLabel }}</span>
                      <strong>{{ document.title }}</strong>
                      <span>{{ document.fileName }}</span>
                      <span>{{ document.uploadedAtLabel ? "Généré le " + document.uploadedAtLabel : "Date non précisée" }}</span>
                    </div>

                    <div class="register-support">
                      <span>{{ document.linkedProofsSummary || "Aucune preuve liée" }}</span>
                      <span>{{ document.linkedSignatureLabel || "Aucune signature liée" }}</span>
                    </div>

                    <div class="register-status">
                      <cfm-status-chip [label]="document.lifecycleStatusLabel" [tone]="document.lifecycleStatusTone" />
                      <cfm-status-chip [label]="document.technicalStatusLabel" [tone]="document.technicalStatusTone" />
                    </div>
                  </button>
                </ng-container>
              </article>

              <article class="story-panel story-panel--follow-up">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Suivre</span>
                    <h4>Suivi / suite documentaire</h4>
                    <p>La fiche utile du document sélectionné, avec sa traçabilité et le prochain geste à faire.</p>
                  </div>
                  <cfm-status-chip
                    *ngIf="vm.selected"
                    class="status-chip"
                    [label]="vm.selected.technicalStatusLabel"
                    [tone]="vm.selected.technicalStatusTone"
                  />
                </header>

                <ng-container *ngIf="vm.selected as document; else emptyDetail">
                  <div class="story-highlight">
                    <strong>{{ document.title }}</strong>
                    <span>{{ document.typeLabel }} · {{ document.uploadedAtLabel || "Date non précisée" }}</span>
                    <span>{{ vm.selectedActionDetail }}</span>
                  </div>

                  <div class="story-split story-split--follow-up">
                    <section class="story-block">
                      <h5>Traçabilité</h5>
                      <ul class="compact-list">
                        <li>{{ document.fileName }}</li>
                        <li>{{ document.linkedProofsSummary || "Aucune preuve liée" }}</li>
                        <li>{{ document.linkedSignatureLabel || "Aucune signature liée" }}</li>
                      </ul>
                    </section>

                    <section class="story-block">
                      <h5>Suite utile</h5>
                      <ul class="compact-list">
                        <li>{{ vm.selectedActionLabel }}</li>
                        <li>{{ document.notes || "Aucune note documentaire" }}</li>
                        <li>{{ worksite.primaryActionLabel }} · {{ worksite.primaryActionDetail }}</li>
                      </ul>
                    </section>
                  </div>

                  <div class="story-actions">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      size="sm"
                      [disabled]="(facade.documentBusyId$ | async) === document.id"
                      (click)="facade.downloadDocument(document.id)"
                    >
                      {{ (facade.documentBusyId$ | async) === document.id ? "Téléchargement..." : "Télécharger" }}
                    </cfm-button>
                    <cfm-button type="button" size="sm" [routerLink]="vm.selectedActionRoute">
                      {{ vm.selectedActionLabel }}
                    </cfm-button>
                    <cfm-button type="button" variant="ghost" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'apercu']">
                      Revenir au chantier
                    </cfm-button>
                  </div>
                </ng-container>
              </article>
            </section>

            <aside class="document-rail">
              <article class="rail-panel rail-panel--key">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Documents clés</span>
                    <h4>Documents clés</h4>
                  </div>
                </header>

                <ul class="story-list" *ngIf="vm.keyDocuments.length > 0; else noKeyDocuments">
                  <li *ngFor="let document of vm.keyDocuments; trackBy: trackByDocument">
                    <div class="story-row-copy">
                      <span class="small">{{ document.typeLabel }}</span>
                      <strong>{{ document.title }}</strong>
                      <span>{{ document.uploadedAtLabel || "Date non précisée" }}</span>
                      <span>{{ document.linkedProofsSummary || "Sans preuve liée" }}</span>
                    </div>
                    <cfm-status-chip class="status-chip" [label]="document.technicalStatusLabel" [tone]="document.technicalStatusTone" />
                  </li>
                </ul>
              </article>

              <article class="rail-panel">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Historique documentaire</span>
                    <h4>Historique documentaire</h4>
                  </div>
                </header>

                <ul class="story-list" *ngIf="vm.historyEntries.length > 0; else noHistory">
                  <li *ngFor="let entry of vm.historyEntries; trackBy: trackByHistoryEntry">
                    <div class="story-row-copy">
                      <span class="small">{{ entry.eyebrow }}</span>
                      <strong>{{ entry.title }}</strong>
                      <span>{{ entry.detail }}</span>
                      <span *ngIf="entry.support">{{ entry.support }}</span>
                    </div>
                    <cfm-status-chip
                      *ngIf="entry.statusLabel && entry.tone"
                      class="status-chip"
                      [label]="entry.statusLabel"
                      [tone]="entry.tone"
                    />
                  </li>
                </ul>
              </article>

              <article class="rail-panel">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Repères utiles</span>
                    <h4>Repères utiles</h4>
                  </div>
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ worksite.documentsCountLabel }}</strong>
                  <span>{{ worksite.primarySignalDetail }}</span>
                </div>

                <ul class="rail-list">
                  <li>
                    <span class="small">Coordination</span>
                    <strong>{{ worksite.coordination.statusLabel }}</strong>
                    <span>{{ worksite.coordination.assigneeLabel }} · {{ worksite.coordination.coverageLabel }}</span>
                  </li>
                  <li>
                    <span class="small">Preuves</span>
                    <strong>{{ worksite.proofsCountLabel }}</strong>
                    <span>{{ worksite.signaturesCountLabel }}</span>
                  </li>
                  <li>
                    <span class="small">Chantier</span>
                    <strong>{{ worksite.globalStateLabel }}</strong>
                    <span>{{ worksite.primaryActionLabel }}</span>
                  </li>
                </ul>

                <div class="story-actions story-actions--rail">
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'preuves']">
                    Preuves
                  </cfm-button>
                  <cfm-button type="button" variant="ghost" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'coordination']">
                    Coordination
                  </cfm-button>
                </div>
              </article>
            </aside>
          </section>
        </section>
      </ng-container>
    </ng-container>

    <ng-template #noTreatmentItems>
      <ul class="compact-list">
        <li>La base documentaire est sous contrôle. Le prochain repère utile se joue plutôt côté preuves ou aperçu chantier.</li>
      </ul>
    </ng-template>

    <ng-template #emptyList>
      <section class="story-empty">
        <strong>Aucun document visible</strong>
        <p>Les documents chantier apparaîtront ici dès qu’une première pièce sera disponible.</p>
      </section>
    </ng-template>

    <ng-template #emptyDetail>
      <section class="story-empty">
        <strong>Aucun document sélectionné</strong>
        <p>Sélectionnez une ligne du registre pour ouvrir la lecture documentaire utile.</p>
      </section>
    </ng-template>

    <ng-template #noKeyDocuments>
      <section class="story-empty story-empty--compact">
        <strong>Aucun document clé identifié</strong>
        <p>Les pièces principales apparaîtront ici dès qu’elles seront disponibles.</p>
      </section>
    </ng-template>

    <ng-template #noHistory>
      <section class="story-empty story-empty--compact">
        <strong>Aucun historique documentaire</strong>
        <p>Les derniers ajouts ou vérifications remonteront ici dès qu’ils existeront.</p>
      </section>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Chargement des documents"
        description="Les documents chantier se préparent."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .document-workspace,
      .document-main,
      .document-rail,
      .story-panel,
      .rail-panel,
      .story-copy,
      .story-row-copy,
      .story-highlight,
      .story-block,
      .section-copy,
      .register-copy,
      .register-support,
      .story-empty,
      .rail-list li,
      .list-copy {
        display: grid;
        gap: 0.42rem;
      }

      .document-workspace {
        gap: 1rem;
      }

      .document-stage {
        display: grid;
        grid-template-columns: minmax(0, 1.56fr) minmax(21rem, 0.78fr);
        gap: 1rem 1.15rem;
        align-items: start;
      }

      .document-main {
        gap: 1rem;
      }

      .document-rail {
        gap: 0.9rem;
      }

      .story-panel,
      .rail-panel {
        padding: 1.28rem 1.34rem 1.24rem;
        border-radius: 30px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(242, 244, 247, 0.88));
        box-shadow: 0 18px 36px rgba(10, 17, 40, 0.04);
      }

      .story-panel--priority {
        background:
          radial-gradient(circle at top right, rgba(255, 222, 165, 0.14), transparent 26%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(242, 244, 247, 0.9));
      }

      .story-panel--register {
        background: linear-gradient(180deg, rgba(248, 249, 252, 0.98), rgba(240, 243, 248, 0.9));
      }

      .story-panel--follow-up,
      .rail-panel {
        background: linear-gradient(180deg, rgba(243, 245, 248, 0.92), rgba(248, 249, 252, 0.88));
        box-shadow: none;
      }

      .story-head,
      .rail-head,
      .story-actions,
      .register-filters,
      .action-callout,
      .register-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.9rem;
        flex-wrap: wrap;
      }

      .story-head--register {
        gap: 1rem 1.4rem;
      }

      .story-kicker {
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .story-copy h4 {
        margin: 0;
        font-family: var(--cfm-font-display);
        font-size: clamp(1.55rem, 2vw, 2rem);
        line-height: 1;
        letter-spacing: -0.03em;
      }

      .story-copy p,
      .story-copy span,
      .story-row-copy span,
      .story-highlight span,
      .section-copy span,
      .list-copy span,
      .register-copy span,
      .register-support span,
      .compact-list li,
      .rail-list li span,
      .panel-note,
      .story-empty p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        line-height: 1.55;
      }

      .story-highlight {
        padding: 1rem 1.05rem;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.56);
      }

      .story-highlight--quiet {
        background: rgba(255, 255, 255, 0.44);
      }

      .story-highlight strong,
      .story-row-copy strong,
      .story-block h5,
      .section-copy strong,
      .rail-list strong,
      .register-copy strong,
      .list-copy strong,
      .story-empty strong {
        color: var(--cfm-color-ink);
      }

      .story-highlight strong {
        font-weight: var(--cfm-font-weight-semibold, 600);
        font-size: 1.04rem;
      }

      .compact-list,
      .story-list,
      .rail-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .compact-list,
      .story-list,
      .rail-list {
        display: grid;
        gap: 0.62rem;
      }

      .compact-list li,
      .story-list li,
      .rail-list li {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.85rem;
        padding: 0.88rem 0.94rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.42);
      }

      .compact-list li {
        align-items: center;
      }

      .story-split {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .story-split--follow-up {
        align-items: start;
      }

      .story-block {
        padding: 0.12rem 0;
      }

      .story-block h5 {
        margin: 0 0 0.18rem;
        font-size: 0.92rem;
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .register-filters {
        align-items: end;
      }

      .compact-field {
        display: grid;
        gap: 0.24rem;
        min-width: 11rem;
      }

      .compact-field--search {
        min-width: min(20rem, 100%);
      }

      .compact-field input,
      .compact-field select {
        width: 100%;
        padding-top: 0.52rem;
      }

      .register-row {
        width: 100%;
        padding: 0.95rem 1rem;
        border: none;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.5);
        color: inherit;
        text-align: left;
        cursor: pointer;
      }

      .register-row:hover {
        background: rgba(255, 255, 255, 0.68);
      }

      .register-row.is-selected {
        background: color-mix(in srgb, var(--cfm-color-primary-soft) 76%, white);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cfm-color-primary-strong) 20%, transparent);
      }

      .register-copy {
        min-width: 0;
        flex: 1 1 18rem;
      }

      .register-support {
        min-width: 11rem;
        flex: 0 1 14rem;
      }

      .register-status {
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.45rem;
        align-items: center;
      }

      .action-callout {
        padding: 0.95rem 1rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.5);
      }

      .story-actions--rail {
        justify-content: flex-start;
      }

      .story-empty {
        padding: 0.2rem 0;
      }

      .story-empty--compact {
        padding: 0;
      }

      @media (max-width: 1180px) {
        .document-stage,
        .story-split {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 860px) {
        .story-head,
        .rail-head,
        .story-list li,
        .compact-list li,
        .register-row,
        .action-callout,
        .register-filters {
          display: grid;
        }

        .story-panel,
        .rail-panel {
          padding: 1.1rem 1.05rem 1.04rem;
          border-radius: 24px;
        }

        .compact-field,
        .compact-field--search {
          min-width: 0;
        }

        .register-status {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class DesktopWorksiteDocumentsViewComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly route = inject(ActivatedRoute);
  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    lifecycle: new FormControl<"all" | "draft" | "finalized">("all", { nonNullable: true }),
  });

  private readonly selectedDocumentId$ = new BehaviorSubject<string | null>(null);
  private readonly detail$ = this.facade.detail$(this.route.paramMap.pipe(map((params) => params.get("worksiteId"))));

  readonly vm$ = combineLatest([
    this.detail$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
    this.selectedDocumentId$,
  ]).pipe(
    map(([detail, filters, selectedDocumentId]) => {
      if (!detail) {
        return null;
      }

      const search = this.toSearchableText(filters.search);
      const documents = detail.documents.filter((document) => {
        const matchesSearch =
          search.length === 0
          || this.toSearchableText(`${document.title} ${document.fileName} ${document.notes ?? ""} ${document.typeLabel}`).includes(search);
        const matchesLifecycle =
          filters.lifecycle === "all"
          || document.lifecycleStatusLabel === (filters.lifecycle === "draft" ? "Brouillon" : "Finalisé");
        return matchesSearch && matchesLifecycle;
      });

      const selected = documents.find((document) => document.id === selectedDocumentId) ?? documents[0] ?? null;
      const selectedAction = this.buildSelectedAction(detail, selected);
      const draftCount = detail.documents.filter((document) => document.lifecycleStatusLabel === "Brouillon").length;
      const missingTraceCount = detail.documents.filter((document) => this.isDocumentMissingTrace(document)).length;
      const readyCount = detail.documents.filter((document) => this.isDocumentReady(document)).length;

      return {
        detail,
        documents,
        selected,
        draftCount,
        missingTraceCount,
        readyCount,
        visibleCount: documents.length,
        treatmentItems: this.buildTreatmentItems(detail.documents),
        keyDocuments: this.buildKeyDocuments(detail.documents),
        historyEntries: this.buildHistoryEntries(detail.documents),
        selectedActionLabel: selectedAction.label,
        selectedActionRoute: selectedAction.route,
        selectedActionDetail: selectedAction.detail,
        ...this.buildTreatmentVm(detail, detail.documents),
      } satisfies DocumentWorkspaceVm;
    }),
  );

  selectDocument(documentId: string): void {
    this.selectedDocumentId$.next(documentId);
  }

  trackByDocument(_index: number, document: DesktopWorksiteDocumentItem): string {
    return document.id;
  }

  trackByTreatmentItem(_index: number, item: DocumentTreatmentItem): string {
    return item.id;
  }

  trackByHistoryEntry(_index: number, entry: DocumentHistoryEntry): string {
    return entry.id;
  }

  private buildTreatmentVm(
    detail: DesktopWorksiteDetailVm,
    documents: DesktopWorksiteDocumentItem[],
  ): Omit<
    DocumentWorkspaceVm,
    | "detail"
    | "documents"
    | "selected"
    | "treatmentItems"
    | "keyDocuments"
    | "historyEntries"
    | "visibleCount"
    | "readyCount"
    | "draftCount"
    | "missingTraceCount"
    | "selectedActionLabel"
    | "selectedActionRoute"
    | "selectedActionDetail"
  > {
    const missingTraceCount = documents.filter((document) => this.isDocumentMissingTrace(document)).length;
    const draftCount = documents.filter((document) => document.lifecycleStatusLabel === "Brouillon").length;

    if (detail.blockingItems.length > 0) {
      return {
        treatmentTitle: "Blocage à lever",
        treatmentTone: "danger",
        treatmentDetail: `${detail.primarySignalLabel}. ${detail.primaryActionDetail}`,
        treatmentActionLabel: detail.primaryActionLabel,
        treatmentActionRoute: detail.primaryActionRoute,
      };
    }

    if (documents.length === 0) {
      return {
        treatmentTitle: "Documents à compléter",
        treatmentTone: "warning",
        treatmentDetail: "La base documentaire manque encore. Revenez au chantier pour poursuivre dans le bon ordre.",
        treatmentActionLabel: "Revenir au chantier",
        treatmentActionRoute: `/app/chantiers/${detail.id}/apercu`,
      };
    }

    if (missingTraceCount > 0) {
      return {
        treatmentTitle: missingTraceCount > 1 ? "Documents à compléter" : "Document à compléter",
        treatmentTone: "warning",
        treatmentDetail: "Les documents existent, mais il manque encore des preuves ou une signature pour fermer proprement la trace.",
        treatmentActionLabel: "Voir les preuves",
        treatmentActionRoute: `/app/chantiers/${detail.id}/preuves`,
      };
    }

    if (draftCount > 0) {
      return {
        treatmentTitle: draftCount > 1 ? "Documents à vérifier" : "Document à vérifier",
        treatmentTone: "progress",
        treatmentDetail: "Des documents sont présents, mais certains restent encore en brouillon ou à relire.",
        treatmentActionLabel: "Revenir au chantier",
        treatmentActionRoute: `/app/chantiers/${detail.id}/apercu`,
      };
    }

    return {
      treatmentTitle: "Documents sous contrôle",
      treatmentTone: "success",
      treatmentDetail: "Les documents utiles sont en place. Le bon réflexe est maintenant de revenir au chantier ou vérifier les preuves.",
      treatmentActionLabel: "Revenir au chantier",
      treatmentActionRoute: `/app/chantiers/${detail.id}/apercu`,
    };
  }

  private buildTreatmentItems(documents: DesktopWorksiteDocumentItem[]): DocumentTreatmentItem[] {
    return this.uniqueDocuments([
      ...documents.filter((document) => this.isDocumentMissingTrace(document)),
      ...documents.filter((document) => document.lifecycleStatusLabel === "Brouillon"),
      ...documents.filter((document) => document.technicalStatusTone !== "success"),
    ])
      .slice(0, 5)
      .map((document) => ({
        id: document.id,
        title: document.title,
        detail: this.getDocumentTreatmentDetail(document),
        statusLabel: this.isDocumentMissingTrace(document) ? "À compléter" : document.technicalStatusLabel,
        tone: this.isDocumentMissingTrace(document) ? "warning" : document.technicalStatusTone,
      }));
  }

  private buildKeyDocuments(documents: DesktopWorksiteDocumentItem[]): DesktopWorksiteDocumentItem[] {
    return [...documents]
      .sort((left, right) => this.scoreDocument(right) - this.scoreDocument(left))
      .slice(0, 3);
  }

  private buildHistoryEntries(documents: DesktopWorksiteDocumentItem[]): DocumentHistoryEntry[] {
    return documents.slice(0, 3).map((document, index) => ({
      id: document.id,
      eyebrow: index === 0 ? "Dernier ajout" : index === 1 ? "Pièce récente" : "Dernière vérification",
      title: document.title,
      detail: `${document.typeLabel} · ${document.uploadedAtLabel || "Date non précisée"}`,
      support: document.notes || document.linkedProofsSummary || document.linkedSignatureLabel,
      statusLabel: document.technicalStatusLabel,
      tone: document.technicalStatusTone,
    }));
  }

  private buildSelectedAction(
    detail: DesktopWorksiteDetailVm,
    document: DesktopWorksiteDocumentItem | null,
  ): { label: string; route: string; detail: string } {
    if (!document) {
      return {
        label: "Revenir au chantier",
        route: `/app/chantiers/${detail.id}/apercu`,
        detail: detail.primaryActionDetail,
      };
    }

    if (this.isDocumentMissingTrace(document)) {
      return {
        label: "Voir les preuves",
        route: `/app/chantiers/${detail.id}/preuves`,
        detail: "Le document existe, mais sa traçabilité reste incomplète.",
      };
    }

    if (document.lifecycleStatusLabel === "Brouillon") {
      return {
        label: "Revenir au chantier",
        route: `/app/chantiers/${detail.id}/apercu`,
        detail: "Le document demande encore une vérification avant d’être considéré comme finalisé.",
      };
    }

    return {
      label: "Coordination",
      route: `/app/chantiers/${detail.id}/coordination`,
      detail: "La pièce est en place. Le bon réflexe est maintenant de vérifier le cadrage terrain et la suite chantier.",
    };
  }

  private getDocumentTreatmentDetail(document: DesktopWorksiteDocumentItem): string {
    if (this.isDocumentMissingTrace(document)) {
      return "Preuve ou signature encore manquante pour fermer la trace.";
    }
    if (document.lifecycleStatusLabel === "Brouillon") {
      return "Le document existe mais reste encore en brouillon ou à relire.";
    }
    if (document.technicalStatusTone !== "success") {
      return "Le document est présent, mais son statut technique demande encore une vérification.";
    }
    return "Document prêt à être utilisé dans le chantier.";
  }

  private isDocumentMissingTrace(document: DesktopWorksiteDocumentItem): boolean {
    return !document.linkedProofsSummary || !document.linkedSignatureLabel;
  }

  private isDocumentReady(document: DesktopWorksiteDocumentItem): boolean {
    return document.lifecycleStatusLabel === "Finalisé" && document.technicalStatusTone === "success";
  }

  private scoreDocument(document: DesktopWorksiteDocumentItem): number {
    let score = 0;
    if (this.isDocumentReady(document)) {
      score += 4;
    }
    if (document.linkedProofsSummary) {
      score += 2;
    }
    if (document.linkedSignatureLabel) {
      score += 2;
    }
    if (document.lifecycleStatusLabel === "Finalisé") {
      score += 1;
    }
    return score;
  }

  private uniqueDocuments(documents: DesktopWorksiteDocumentItem[]): DesktopWorksiteDocumentItem[] {
    const seen = new Set<string>();
    return documents.filter((document) => {
      if (seen.has(document.id)) {
        return false;
      }
      seen.add(document.id);
      return true;
    });
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
