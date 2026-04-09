import { CommonModule } from "@angular/common";
import { DestroyRef, Injectable, Component, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import type {
  InvoiceRecord,
  MembershipAccess,
  QuoteRecord,
  RegulatoryEvidenceRecord,
  WorksiteDocumentRecord,
  WorksiteProofRecord,
  WorksiteSignatureRecord,
} from "@conformeo/contracts";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, startWith } from "rxjs";

import { ApiClientError } from "./api-error";
import { canReadModule } from "./desktop-access.utils";
import { DesktopSessionStateService } from "./desktop-session-state.service";
import {
  downloadGeneratedWorksiteDocument,
  downloadInvoicePdf as downloadInvoicePdfFile,
  downloadQuotePdf as downloadQuotePdfFile,
  listInvoices,
  listQuotes,
  listRegulatoryEvidences,
  listWorksiteDocuments,
  listWorksiteProofs,
  listWorksiteSignatures,
} from "./organization-client";

type DocumentFamilyId = "worksite" | "proofs" | "signatures" | "regulation" | "commercial";
type DocumentFamilyFilter = "all" | DocumentFamilyId;
type DocumentHubItemKind =
  | "worksite_document"
  | "worksite_proof"
  | "worksite_signature"
  | "regulatory_evidence"
  | "billing_quote"
  | "billing_invoice";

type DesktopDocumentHubItem = {
  id: string;
  rawId: string;
  kind: DocumentHubItemKind;
  familyId: DocumentFamilyId;
  familyLabel: string;
  title: string;
  categoryLabel: string;
  dossierLabel: string;
  statusLabel: string;
  statusTone: CfmTone;
  actionLabel: string;
  actionRoute: string;
  actionDetail: string;
  detail: string;
  supportLabel: string | null;
  dateLabel: string | null;
  dateValue: number;
  priorityRank: number;
  isAttention: boolean;
  isReady: boolean;
  isRecent: boolean;
  canDownload: boolean;
};

type DesktopDocumentFamilyCard = {
  id: DocumentFamilyId;
  label: string;
  countLabel: string;
  detail: string;
  statusLabel: string;
  tone: CfmTone;
};

type DesktopDocumentHistoryEntry = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  support: string | null;
  tone: CfmTone;
  statusLabel: string;
};

type DocumentsHubVm = {
  totalCount: number;
  attentionCount: number;
  readyCount: number;
  recentCount: number;
  activeDossiersCount: number;
  introAction: {
    label: string;
    route: string;
    detail: string;
  } | null;
  treatmentTitle: string;
  treatmentTone: CfmTone;
  treatmentDetail: string;
  treatmentItems: DesktopDocumentHubItem[];
  familyCards: DesktopDocumentFamilyCard[];
  registerItems: DesktopDocumentHubItem[];
  selectedItem: DesktopDocumentHubItem | null;
  historyEntries: DesktopDocumentHistoryEntry[];
  usefulHints: string[];
};

type DocumentsWorkspaceState = {
  loading: boolean;
  errorMessage: string;
  noticeMessage: string;
  busyDocumentId: string | null;
  quotes: QuoteRecord[];
  invoices: InvoiceRecord[];
  worksiteDocuments: WorksiteDocumentRecord[];
  worksiteProofs: WorksiteProofRecord[];
  worksiteSignatures: WorksiteSignatureRecord[];
  regulatoryEvidences: RegulatoryEvidenceRecord[];
};

const INITIAL_STATE: DocumentsWorkspaceState = {
  loading: false,
  errorMessage: "",
  noticeMessage: "",
  busyDocumentId: null,
  quotes: [],
  invoices: [],
  worksiteDocuments: [],
  worksiteProofs: [],
  worksiteSignatures: [],
  regulatoryEvidences: [],
};

@Injectable()
class DesktopDocumentsFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionState = inject(DesktopSessionStateService);
  private readonly stateSubject = new BehaviorSubject<DocumentsWorkspaceState>(INITIAL_STATE);
  private lastLoadKey: string | null = null;

  readonly state$ = this.stateSubject.asObservable();
  readonly loading$ = this.state$.pipe(map((state) => state.loading));
  readonly errorMessage$ = this.state$.pipe(map((state) => state.errorMessage));
  readonly noticeMessage$ = this.state$.pipe(map((state) => state.noticeMessage));
  readonly busyDocumentId$ = this.state$.pipe(map((state) => state.busyDocumentId));

  constructor() {
    this.sessionState.snapshot$
      .pipe(
        map((snapshot) => ({
          accessToken: snapshot.accessToken,
          organizationId: snapshot.organizationId,
          membership: snapshot.session?.current_membership ?? null,
        })),
        distinctUntilChanged(
          (left, right) =>
            left.accessToken === right.accessToken
            && left.organizationId === right.organizationId
            && left.membership === right.membership,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ accessToken, organizationId, membership }) => {
        if (!accessToken || !organizationId) {
          this.lastLoadKey = null;
          this.stateSubject.next(INITIAL_STATE);
          return;
        }

        void this.loadWorkspace(accessToken, organizationId, membership);
      });
  }

  refresh(): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    const membership = this.sessionState.session?.current_membership ?? null;
    if (!accessToken || !organizationId) {
      return Promise.resolve();
    }
    this.lastLoadKey = null;
    return this.loadWorkspace(accessToken, organizationId, membership);
  }

  async downloadWorksiteDocument(documentId: string): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId) {
      return;
    }

    this.patchState({
      busyDocumentId: documentId,
      errorMessage: "",
      noticeMessage: "Document chantier en préparation.",
    });

    try {
      const { blob, fileName } = await downloadGeneratedWorksiteDocument(accessToken, organizationId, documentId);
      this.downloadBlob(blob, fileName);
      this.patchState({
        busyDocumentId: null,
        noticeMessage: "Document chantier téléchargé.",
      });
    } catch (error) {
      this.patchState({
        busyDocumentId: null,
        errorMessage: this.toErrorMessage(error, "export"),
        noticeMessage: "",
      });
    }
  }

  async downloadQuoteDocument(quoteId: string): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId) {
      return;
    }

    this.patchState({
      busyDocumentId: quoteId,
      errorMessage: "",
      noticeMessage: "Devis en préparation.",
    });

    try {
      const { blob, fileName } = await downloadQuotePdfFile(accessToken, organizationId, quoteId);
      this.downloadBlob(blob, fileName);
      this.patchState({
        busyDocumentId: null,
        noticeMessage: "Devis téléchargé.",
      });
    } catch (error) {
      this.patchState({
        busyDocumentId: null,
        errorMessage: this.toErrorMessage(error, "export"),
        noticeMessage: "",
      });
    }
  }

  async downloadInvoiceDocument(invoiceId: string): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId) {
      return;
    }

    this.patchState({
      busyDocumentId: invoiceId,
      errorMessage: "",
      noticeMessage: "Facture en préparation.",
    });

    try {
      const { blob, fileName } = await downloadInvoicePdfFile(accessToken, organizationId, invoiceId);
      this.downloadBlob(blob, fileName);
      this.patchState({
        busyDocumentId: null,
        noticeMessage: "Facture téléchargée.",
      });
    } catch (error) {
      this.patchState({
        busyDocumentId: null,
        errorMessage: this.toErrorMessage(error, "export"),
        noticeMessage: "",
      });
    }
  }

  private async loadWorkspace(
    accessToken: string,
    organizationId: string,
    membership: MembershipAccess | null,
  ): Promise<void> {
    const chantierEnabled = canReadModule(membership, "chantier");
    const facturationEnabled = canReadModule(membership, "facturation");
    const regulationEnabled = canReadModule(membership, "reglementation");
    const loadKey = `${organizationId}:${chantierEnabled}:${facturationEnabled}:${regulationEnabled}`;

    if (
      this.lastLoadKey === loadKey
      && (
        this.stateSubject.value.worksiteDocuments.length
        + this.stateSubject.value.worksiteProofs.length
        + this.stateSubject.value.worksiteSignatures.length
        + this.stateSubject.value.regulatoryEvidences.length
        + this.stateSubject.value.quotes.length
        + this.stateSubject.value.invoices.length
      ) > 0
    ) {
      return;
    }

    this.patchState({
      loading: true,
      errorMessage: "",
      noticeMessage: "",
    });

    try {
      const [
        quotes,
        invoices,
        worksiteDocuments,
        worksiteProofs,
        worksiteSignatures,
        regulatoryEvidences,
      ] = await Promise.all([
        facturationEnabled ? listQuotes(accessToken, organizationId) : Promise.resolve<QuoteRecord[]>([]),
        facturationEnabled ? listInvoices(accessToken, organizationId) : Promise.resolve<InvoiceRecord[]>([]),
        chantierEnabled ? listWorksiteDocuments(accessToken, organizationId) : Promise.resolve<WorksiteDocumentRecord[]>([]),
        chantierEnabled ? listWorksiteProofs(accessToken, organizationId) : Promise.resolve<WorksiteProofRecord[]>([]),
        chantierEnabled ? listWorksiteSignatures(accessToken, organizationId) : Promise.resolve<WorksiteSignatureRecord[]>([]),
        regulationEnabled ? listRegulatoryEvidences(accessToken, organizationId) : Promise.resolve<RegulatoryEvidenceRecord[]>([]),
      ]);

      this.lastLoadKey = loadKey;
      this.stateSubject.next({
        ...this.stateSubject.value,
        loading: false,
        errorMessage: "",
        noticeMessage: "",
        quotes,
        invoices,
        worksiteDocuments,
        worksiteProofs,
        worksiteSignatures,
        regulatoryEvidences,
      });
    } catch (error) {
      this.patchState({
        loading: false,
        errorMessage: this.toErrorMessage(error, "load"),
      });
    }
  }

  private patchState(patch: Partial<DocumentsWorkspaceState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...patch,
    });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  }

  private toErrorMessage(error: unknown, context: "load" | "export"): string {
    if (error instanceof ApiClientError) {
      if (error.status === 403) {
        return "Vous n’avez pas accès à cette action pour le moment.";
      }
      if (error.status !== null && error.status >= 500) {
        return context === "load"
          ? "Le hub Documents est temporairement indisponible."
          : "Le téléchargement n’a pas pu aboutir pour le moment.";
      }
      return error.detail || "L’action documentaire n’a pas pu aboutir.";
    }

    return context === "load"
      ? "Les données documentaires n’ont pas pu être chargées."
      : "Le téléchargement n’a pas pu aboutir.";
  }
}

@Component({
  selector: "cfm-desktop-documents-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CfmButtonComponent,
    CfmEmptyStateComponent,
    CfmStatusChipComponent,
  ],
  providers: [DesktopDocumentsFacade],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else loadingState">
      <section class="documents-page" *ngIf="vm.totalCount > 0 || (loading$ | async); else emptyState">
        <header class="documents-intro cfm-editorial-hero cfm-editorial-hero--calm">
          <div class="documents-intro-copy">
            <span class="cfm-hero-kicker">Documents</span>
            <h3>Workspace documentaire</h3>
            <p class="cfm-hero-lead">
              Repères immédiats, dossiers utiles et registre documentaire commun entre chantier, conformité et pièces commerciales.
            </p>
          </div>

          <div class="documents-intro-action" *ngIf="vm.introAction as action">
            <cfm-button type="button" size="sm" [routerLink]="action.route">
              {{ action.label }}
            </cfm-button>
            <span>{{ action.detail }}</span>
          </div>
        </header>

        <section class="documents-feedback-stack" *ngIf="(errorMessage$ | async) || (noticeMessage$ | async)">
          <div class="feedback error" *ngIf="errorMessage$ | async as errorMessage">
            <strong>Documents indisponibles</strong>
            <span>{{ errorMessage }}</span>
          </div>
          <div class="feedback success" *ngIf="noticeMessage$ | async as noticeMessage">
            <strong>Action terminée</strong>
            <span>{{ noticeMessage }}</span>
          </div>
        </section>

        <section class="documents-overview cfm-metric-band cfm-metric-band--quiet">
          <article class="cfm-metric-tile">
            <span class="small">À traiter</span>
            <strong>{{ vm.attentionCount }}</strong>
            <span>document{{ vm.attentionCount > 1 ? "s" : "" }} demandant une action</span>
          </article>
          <article class="cfm-metric-tile">
            <span class="small">Prêts</span>
            <strong>{{ vm.readyCount }}</strong>
            <span>document{{ vm.readyCount > 1 ? "s" : "" }} prêt{{ vm.readyCount > 1 ? "s" : "" }}</span>
          </article>
          <article class="cfm-metric-tile">
            <span class="small">Récents</span>
            <strong>{{ vm.recentCount }}</strong>
            <span>ajout{{ vm.recentCount > 1 ? "s" : "" }} récent{{ vm.recentCount > 1 ? "s" : "" }}</span>
          </article>
          <article class="cfm-metric-tile">
            <span class="small">Dossiers actifs</span>
            <strong>{{ vm.activeDossiersCount }}</strong>
            <span>famille{{ vm.activeDossiersCount > 1 ? "s" : "" }} ou dossiers utiles</span>
          </article>
        </section>

        <section class="documents-stage">
          <section class="documents-main">
            <article class="documents-panel cfm-tonal-panel cfm-tonal-panel--flat">
              <header class="panel-head">
                <div class="panel-copy">
                  <span class="panel-kicker">Prioriser</span>
                  <h4>Documents à traiter</h4>
                  <p>Les pièces qui demandent encore une action, une vérification ou une sortie vers le bon écran métier.</p>
                </div>
                <cfm-status-chip [label]="vm.treatmentTitle" [tone]="vm.treatmentTone" />
              </header>

              <div class="panel-highlight">
                <strong>{{ vm.treatmentTitle }}</strong>
                <span>{{ vm.treatmentDetail }}</span>
              </div>

              <ul class="priority-list" *ngIf="vm.treatmentItems.length > 0; else noTreatmentItems">
                <li *ngFor="let item of vm.treatmentItems; trackBy: trackByDocumentItem">
                  <button type="button" class="priority-row" (click)="selectItem(item.id)">
                    <div class="priority-copy">
                      <span class="small">{{ item.familyLabel }}</span>
                      <strong>{{ item.title }}</strong>
                      <span>{{ item.detail }}</span>
                    </div>
                    <div class="priority-meta">
                      <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                      <span>{{ item.actionLabel }}</span>
                    </div>
                  </button>
                </li>
              </ul>
            </article>

            <article class="documents-panel cfm-tonal-panel cfm-tonal-panel--flat">
              <header class="panel-head">
                <div class="panel-copy">
                  <span class="panel-kicker">Bibliothèque / dossiers</span>
                  <h4>Familles documentaires</h4>
                  <p>Un repérage simple des grandes familles actives avant d’entrer dans le registre.</p>
                </div>
              </header>

              <div class="family-grid">
                <button
                  *ngFor="let family of vm.familyCards; trackBy: trackByFamilyCard"
                  type="button"
                  class="family-card"
                  [class.is-active]="filterForm.controls.family.value === family.id"
                  (click)="applyFamilyFilter(family.id)"
                >
                  <div class="family-card-copy">
                    <strong>{{ family.label }}</strong>
                    <span>{{ family.countLabel }}</span>
                    <span>{{ family.detail }}</span>
                  </div>
                  <cfm-status-chip [label]="family.statusLabel" [tone]="family.tone" />
                </button>
              </div>
            </article>

            <article class="documents-panel cfm-tonal-panel cfm-tonal-panel--flat">
              <header class="panel-head panel-head--register">
                <div class="panel-copy">
                  <span class="panel-kicker">Registre</span>
                  <h4>Registre documentaire</h4>
                  <p>Un registre lisible, plus structuré qu’un tableau froid, avec statut, famille, date et geste utile.</p>
                </div>

                <form class="register-filters" [formGroup]="filterForm">
                  <label class="compact-field compact-field--search">
                    <span class="small">Recherche</span>
                    <input type="text" formControlName="search" placeholder="Nom, type, chantier, note" />
                  </label>

                  <label class="compact-field compact-field--family">
                    <span class="small">Famille</span>
                    <select formControlName="family">
                      <option value="all">Toutes</option>
                      <option value="worksite">Chantier</option>
                      <option value="commercial">Documents commerciaux</option>
                      <option value="proofs">Preuves terrain</option>
                      <option value="signatures">Signatures</option>
                      <option value="regulation">Conformité</option>
                    </select>
                  </label>
                </form>
              </header>

              <div class="panel-highlight panel-highlight--quiet">
                <strong>{{ vm.registerItems.length }} document{{ vm.registerItems.length > 1 ? "s" : "" }} visible{{ vm.registerItems.length > 1 ? "s" : "" }}</strong>
                <span>Le registre central garde la main, le rail droit n’est qu’un appui.</span>
              </div>

              <div class="register-list" *ngIf="vm.registerItems.length > 0; else noRegisterItems">
                <button
                  *ngFor="let item of vm.registerItems; trackBy: trackByDocumentItem"
                  type="button"
                  class="register-row"
                  [class.is-selected]="vm.selectedItem?.id === item.id"
                  (click)="selectItem(item.id)"
                >
                  <div class="register-copy">
                    <span class="small">{{ item.familyLabel }} · {{ item.categoryLabel }}</span>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.dossierLabel }}</span>
                  </div>

                  <div class="register-support">
                    <span>{{ item.dateLabel || "Date non précisée" }}</span>
                    <span>{{ item.supportLabel || item.actionDetail }}</span>
                  </div>

                  <div class="register-meta">
                    <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                    <span>{{ item.actionLabel }}</span>
                  </div>
                </button>
              </div>
            </article>
          </section>

          <aside class="documents-rail">
            <article class="rail-panel cfm-tonal-panel cfm-tonal-panel--quiet" *ngIf="vm.selectedItem as item">
              <header class="panel-head">
                <div class="panel-copy">
                  <span class="panel-kicker">Aperçu document</span>
                  <h4>Aperçu document</h4>
                </div>
                <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
              </header>

              <div class="rail-highlight">
                <strong>{{ item.title }}</strong>
                <span>{{ item.familyLabel }} · {{ item.categoryLabel }}</span>
                <span>{{ item.dossierLabel }}</span>
              </div>

              <ul class="rail-list">
                <li>{{ item.dateLabel || "Date non précisée" }}</li>
                <li>{{ item.supportLabel || item.actionDetail }}</li>
                <li>{{ item.actionDetail }}</li>
              </ul>

              <div class="rail-actions">
                <cfm-button type="button" size="sm" [routerLink]="item.actionRoute">
                  {{ item.actionLabel }}
                </cfm-button>
                <cfm-button
                  *ngIf="item.canDownload"
                  type="button"
                  variant="secondary"
                  size="sm"
                  [disabled]="(busyDocumentId$ | async) === item.rawId"
                  (click)="downloadItem(item)"
                >
                  {{ (busyDocumentId$ | async) === item.rawId ? "Téléchargement..." : "Télécharger" }}
                </cfm-button>
              </div>
            </article>

            <article class="rail-panel cfm-tonal-panel cfm-tonal-panel--quiet">
              <header class="panel-head">
                <div class="panel-copy">
                  <span class="panel-kicker">Historique documentaire</span>
                  <h4>Historique court</h4>
                </div>
              </header>

              <ul class="rail-story-list" *ngIf="vm.historyEntries.length > 0; else noHistory">
                <li *ngFor="let entry of vm.historyEntries; trackBy: trackByHistoryEntry">
                  <div class="story-row-copy">
                    <span class="small">{{ entry.eyebrow }}</span>
                    <strong>{{ entry.title }}</strong>
                    <span>{{ entry.detail }}</span>
                    <span *ngIf="entry.support">{{ entry.support }}</span>
                  </div>
                  <cfm-status-chip [label]="entry.statusLabel" [tone]="entry.tone" />
                </li>
              </ul>
            </article>

            <article class="rail-panel cfm-tonal-panel cfm-tonal-panel--quiet">
              <header class="panel-head">
                <div class="panel-copy">
                  <span class="panel-kicker">Repères utiles</span>
                  <h4>Repères utiles</h4>
                </div>
              </header>

              <ul class="rail-list">
                <li *ngFor="let hint of vm.usefulHints; trackBy: trackByHint">{{ hint }}</li>
              </ul>
            </article>
          </aside>
        </section>
      </section>
    </ng-container>

    <ng-template #loadingState>
      <cfm-empty-state
        title="Chargement du hub Documents"
        description="Les repères documentaires sont en préparation."
      />
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Aucun document disponible"
        description="Le hub Documents s’alimentera dès qu’un document chantier, une preuve, une signature, une pièce réglementaire, un devis ou une facture existera."
      />
    </ng-template>

    <ng-template #noTreatmentItems>
      <div class="empty-inline">
        <strong>Aucun document prioritaire</strong>
        <p>Le registre documentaire est sous contrôle pour le moment.</p>
      </div>
    </ng-template>

    <ng-template #noRegisterItems>
      <div class="empty-inline">
        <strong>Aucun document visible</strong>
        <p>Adaptez la recherche ou la famille active.</p>
      </div>
    </ng-template>

    <ng-template #noHistory>
      <div class="empty-inline empty-inline--rail">
        <strong>Aucun historique récent</strong>
        <p>Les derniers ajouts apparaîtront ici.</p>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .documents-page,
      .documents-intro-copy,
      .documents-intro-action,
      .documents-main,
      .documents-rail,
      .panel-copy,
      .family-card-copy,
      .register-copy,
      .register-support,
      .priority-copy,
      .story-row-copy,
      .empty-inline {
        display: grid;
        gap: 0.32rem;
      }

      .documents-page,
      .documents-stage,
      .documents-feedback-stack {
        display: grid;
        gap: 1rem;
      }

      .documents-intro {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: end;
        gap: 1rem;
      }

      .documents-intro-copy h3 {
        margin: 0;
        font-size: clamp(2rem, 3vw, 2.7rem);
        line-height: 0.96;
        letter-spacing: -0.05em;
      }

      .documents-intro-action {
        max-width: 18rem;
        justify-items: start;
        color: var(--cfm-color-copy-muted);
      }

      .documents-overview {
        margin-top: -0.15rem;
      }

      .documents-stage {
        grid-template-columns: minmax(0, 1.65fr) minmax(18rem, 0.78fr);
        align-items: start;
      }

      .documents-panel,
      .rail-panel {
        display: grid;
        gap: 0.95rem;
      }

      .panel-head,
      .panel-head--register,
      .rail-actions {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.85rem;
      }

      .panel-head--register {
        flex-wrap: wrap;
      }

      .panel-kicker {
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .panel-copy h4,
      .rail-panel h4 {
        margin: 0;
        font-size: 1.4rem;
        line-height: 1.02;
        letter-spacing: -0.03em;
      }

      .panel-copy p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        line-height: 1.5;
      }

      .panel-highlight,
      .rail-highlight {
        display: grid;
        gap: 0.2rem;
        padding: 0.95rem 1rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.56);
      }

      .panel-highlight--quiet {
        background: rgba(248, 249, 252, 0.72);
      }

      .panel-highlight strong,
      .rail-highlight strong {
        color: var(--cfm-color-ink);
      }

      .panel-highlight span,
      .rail-highlight span {
        color: var(--cfm-color-copy-muted);
      }

      .priority-list,
      .register-list,
      .rail-story-list,
      .rail-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .priority-list,
      .register-list,
      .rail-story-list {
        display: grid;
        gap: 0.65rem;
      }

      .priority-row,
      .register-row,
      .family-card {
        width: 100%;
        border: 0;
        text-align: left;
        cursor: pointer;
      }

      .priority-row,
      .register-row {
        display: grid;
        align-items: center;
        gap: 0.8rem;
        padding: 0.95rem 1rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.58);
        transition:
          transform 140ms ease,
          background-color 140ms ease,
          box-shadow 140ms ease;
      }

      .priority-row {
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .register-row {
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto;
      }

      .priority-row:hover,
      .register-row:hover,
      .family-card:hover {
        transform: translateY(-1px);
        box-shadow: var(--cfm-shadow-soft, 0 12px 22px rgba(10, 17, 40, 0.05));
      }

      .register-row.is-selected,
      .family-card.is-active {
        background: rgba(255, 255, 255, 0.86);
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 78%, white);
        outline-offset: -1px;
      }

      .priority-meta,
      .register-meta {
        display: grid;
        gap: 0.28rem;
        justify-items: end;
        color: var(--cfm-color-copy-muted);
      }

      .family-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
        gap: 0.75rem;
      }

      .family-card {
        display: grid;
        gap: 0.75rem;
        align-content: start;
        padding: 0.95rem 1rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.56);
      }

      .family-card-copy span {
        color: var(--cfm-color-copy-muted);
      }

      .register-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.9rem;
        align-items: end;
      }

      .compact-field {
        display: grid;
        gap: 0.3rem;
      }

      .compact-field--search {
        min-width: min(18rem, 52vw);
      }

      .compact-field--family {
        min-width: 10rem;
      }

      .rail-list {
        display: grid;
        gap: 0.55rem;
        color: var(--cfm-color-copy);
      }

      .rail-story-list li {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.85rem 0;
      }

      .story-row-copy span {
        color: var(--cfm-color-copy-muted);
      }

      .feedback {
        display: grid;
        gap: 0.2rem;
        padding: 0.85rem 1rem;
        border-radius: 18px;
      }

      .feedback.error {
        background: var(--cfm-color-danger-bg, #fceeee);
        color: var(--cfm-color-danger-ink, #a65252);
      }

      .feedback.success {
        background: var(--cfm-color-success-bg, #edf8f1);
        color: var(--cfm-color-success-ink, #2f7a4f);
      }

      .empty-inline strong,
      .empty-inline p {
        margin: 0;
      }

      .empty-inline p {
        color: var(--cfm-color-copy-muted);
      }

      .empty-inline--rail {
        padding: 0.2rem 0;
      }

      @media (max-width: 1180px) {
        .documents-intro,
        .documents-stage {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 820px) {
        .register-row {
          grid-template-columns: 1fr;
        }

        .priority-row {
          grid-template-columns: 1fr;
        }

        .priority-meta,
        .register-meta {
          justify-items: start;
        }

        .register-filters {
          width: 100%;
        }

        .compact-field--search,
        .compact-field--family {
          min-width: 100%;
        }
      }
    `,
  ],
})
export class DesktopDocumentsPageComponent {
  readonly facade = inject(DesktopDocumentsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly selectedItemIdSubject = new BehaviorSubject<string | null>(null);

  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    family: new FormControl<DocumentFamilyFilter>("all", { nonNullable: true }),
  });

  readonly loading$ = this.facade.loading$;
  readonly errorMessage$ = this.facade.errorMessage$;
  readonly noticeMessage$ = this.facade.noticeMessage$;
  readonly busyDocumentId$ = this.facade.busyDocumentId$;

  readonly vm$ = combineLatest([
    this.facade.state$,
    this.filterForm.controls.search.valueChanges.pipe(startWith(this.filterForm.controls.search.value)),
    this.filterForm.controls.family.valueChanges.pipe(startWith(this.filterForm.controls.family.value)),
    this.selectedItemIdSubject.asObservable().pipe(startWith(this.selectedItemIdSubject.value)),
    this.route.queryParamMap.pipe(startWith(this.route.snapshot.queryParamMap)),
  ]).pipe(
    map(([state, search, family, selectedItemId, queryParams]) =>
      this.buildVm(
        state,
        search,
        family,
        selectedItemId,
        queryParams.get("focus"),
        queryParams.get("kind"),
      ),
    ),
  );

  applyFamilyFilter(familyId: DocumentFamilyId): void {
    const current = this.filterForm.controls.family.value;
    this.filterForm.controls.family.setValue(current === familyId ? "all" : familyId);
  }

  selectItem(itemId: string): void {
    this.selectedItemIdSubject.next(itemId);
  }

  async downloadItem(item: DesktopDocumentHubItem): Promise<void> {
    switch (item.kind) {
      case "billing_quote":
        await this.facade.downloadQuoteDocument(item.rawId);
        break;
      case "billing_invoice":
        await this.facade.downloadInvoiceDocument(item.rawId);
        break;
      case "worksite_document":
        await this.facade.downloadWorksiteDocument(item.rawId);
        break;
      default:
        break;
    }
  }

  trackByDocumentItem(_index: number, item: DesktopDocumentHubItem): string {
    return item.id;
  }

  trackByFamilyCard(_index: number, item: DesktopDocumentFamilyCard): string {
    return item.id;
  }

  trackByHistoryEntry(_index: number, item: DesktopDocumentHistoryEntry): string {
    return item.id;
  }

  trackByHint(_index: number, hint: string): string {
    return hint;
  }

  private buildVm(
    state: DocumentsWorkspaceState,
    searchValue: string,
    familyFilter: DocumentFamilyFilter,
    selectedItemId: string | null,
    focusedId: string | null,
    focusedKind: string | null,
  ): DocumentsHubVm {
    const allItems = [
      ...state.quotes.map((quote) => this.mapQuote(quote)),
      ...state.invoices.map((invoice) => this.mapInvoice(invoice)),
      ...state.worksiteDocuments.map((document) => this.mapWorksiteDocument(document)),
      ...state.worksiteProofs.map((proof) => this.mapWorksiteProof(proof)),
      ...state.worksiteSignatures.map((signature) => this.mapWorksiteSignature(signature)),
      ...state.regulatoryEvidences.map((evidence) => this.mapRegulatoryEvidence(evidence)),
    ].sort((left, right) => right.dateValue - left.dateValue);

    const query = this.normalize(searchValue);
    const registerItems = allItems.filter((item) => {
      if (familyFilter !== "all" && item.familyId !== familyFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return this.matchesQuery(item, query);
    });

    const selectedItem =
      this.resolveFocusedItem(registerItems, allItems, selectedItemId, focusedId, focusedKind)
      ?? registerItems[0]
      ?? allItems[0]
      ?? null;

    if (selectedItem && this.selectedItemIdSubject.value !== selectedItem.id) {
      this.selectedItemIdSubject.next(selectedItem.id);
    }

    const attentionItems = allItems
      .filter((item) => item.isAttention)
      .sort((left, right) => left.priorityRank - right.priorityRank || right.dateValue - left.dateValue);
    const readyItems = allItems.filter((item) => item.isReady);
    const recentItems = allItems.filter((item) => item.isRecent);
    const activeDossiersCount = this.countActiveDossiers(allItems);
    const treatmentItems = attentionItems.slice(0, 4);
    const introAction = treatmentItems[0]
      ? {
          label: treatmentItems[0].actionLabel,
          route: treatmentItems[0].actionRoute,
          detail: treatmentItems[0].actionDetail,
        }
      : selectedItem
        ? {
            label: selectedItem.actionLabel,
            route: selectedItem.actionRoute,
            detail: selectedItem.actionDetail,
          }
        : null;

    const familyCards = this.buildFamilyCards(allItems);
    const historyEntries = allItems.slice(0, 4).map((item, index) => ({
      id: item.id,
      eyebrow: index === 0 ? "Dernier ajout" : index === 1 ? "Pièce récente" : index === 2 ? "Dernière mise à jour" : "Dernier repère",
      title: item.title,
      detail: `${item.familyLabel} · ${item.dateLabel || "Date non précisée"}`,
      support: item.supportLabel,
      tone: item.statusTone,
      statusLabel: item.statusLabel,
    }));

    const usefulHints = this.buildUsefulHints(attentionItems.length, readyItems.length, activeDossiersCount, familyFilter);
    const treatmentVm = this.buildTreatmentVm(allItems, attentionItems);

    return {
      totalCount: allItems.length,
      attentionCount: attentionItems.length,
      readyCount: readyItems.length,
      recentCount: recentItems.length,
      activeDossiersCount,
      introAction,
      treatmentTitle: treatmentVm.title,
      treatmentTone: treatmentVm.tone,
      treatmentDetail: treatmentVm.detail,
      treatmentItems,
      familyCards,
      registerItems,
      selectedItem,
      historyEntries,
      usefulHints,
    };
  }

  private buildTreatmentVm(
    allItems: DesktopDocumentHubItem[],
    attentionItems: DesktopDocumentHubItem[],
  ): { title: string; tone: CfmTone; detail: string } {
    if (allItems.length === 0) {
      return {
        title: "Aucun document disponible",
        tone: "neutral",
        detail: "Le hub Documents s’alimentera dès qu’une pièce existera dans un module métier.",
      };
    }

    if (attentionItems.length === 0) {
      return {
        title: "Documents sous contrôle",
        tone: "success",
        detail: "Les pièces utiles sont en place. Le registre sert surtout à retrouver rapidement le bon document.",
      };
    }

    const criticalCount = attentionItems.filter((item) => item.statusTone === "danger").length;
    if (criticalCount > 0) {
      return {
        title: "Blocages documentaires",
        tone: "danger",
        detail: `${criticalCount} pièce${criticalCount > 1 ? "s" : ""} demande${criticalCount > 1 ? "nt" : ""} une régularisation forte avant de pouvoir avancer proprement.`,
      };
    }

    return {
      title: "Documents à traiter",
      tone: "warning",
      detail: "Les pièces sont présentes mais certaines demandent encore une preuve, une signature, une vérification ou une mise à disposition.",
    };
  }

  private buildFamilyCards(items: DesktopDocumentHubItem[]): DesktopDocumentFamilyCard[] {
    const families: DocumentFamilyId[] = ["worksite", "commercial", "proofs", "signatures", "regulation"];
    const cards: Array<DesktopDocumentFamilyCard | null> = families.map((familyId) => {
        const familyItems = items.filter((item) => item.familyId === familyId);
        if (familyItems.length === 0) {
          return null;
        }
        const attentionCount = familyItems.filter((item) => item.isAttention).length;
        const readyCount = familyItems.filter((item) => item.isReady).length;
        return {
          id: familyId,
          label: familyItems[0]?.familyLabel ?? familyId,
          countLabel: `${familyItems.length} document${familyItems.length > 1 ? "s" : ""}`,
          detail:
            attentionCount > 0
              ? `${attentionCount} à traiter · ${readyCount} prêt${readyCount > 1 ? "s" : ""}`
              : `${readyCount} prêt${readyCount > 1 ? "s" : ""} · sous contrôle`,
          statusLabel:
            attentionCount > 0
              ? "À traiter"
              : "Sous contrôle",
          tone: attentionCount > 0 ? "warning" : "success",
        } satisfies DesktopDocumentFamilyCard;
      });
    return cards.filter((family) => family !== null);
  }

  private buildUsefulHints(
    attentionCount: number,
    readyCount: number,
    activeDossiersCount: number,
    familyFilter: DocumentFamilyFilter,
  ): string[] {
    return [
      attentionCount > 0
        ? `${attentionCount} document${attentionCount > 1 ? "s" : ""} demande${attentionCount > 1 ? "nt" : ""} encore une action utile.`
        : "Aucun signal documentaire urgent pour le moment.",
      `${readyCount} pièce${readyCount > 1 ? "s" : ""} est ou sont déjà prête${readyCount > 1 ? "s" : ""} à être utilisée${readyCount > 1 ? "s" : ""}.`,
      `${activeDossiersCount} dossier${activeDossiersCount > 1 ? "s" : ""} ou famille${activeDossiersCount > 1 ? "s" : ""} active${activeDossiersCount > 1 ? "s" : ""}.`,
      familyFilter === "all"
        ? "La recherche globale complète ce hub pour retrouver directement un chantier, une pièce, un devis ou une facture."
        : `Le registre est filtré sur ${this.getFamilyFilterLabel(familyFilter)}.`,
    ];
  }

  private resolveFocusedItem(
    visibleItems: DesktopDocumentHubItem[],
    allItems: DesktopDocumentHubItem[],
    selectedItemId: string | null,
    focusedId: string | null,
    focusedKind: string | null,
  ): DesktopDocumentHubItem | null {
    const explicitSelection = selectedItemId
      ? visibleItems.find((item) => item.id === selectedItemId)
      : null;
    if (explicitSelection) {
      return explicitSelection;
    }

    if (focusedId) {
      const focused = allItems.find(
        (item) =>
          item.rawId === focusedId
          && (!focusedKind || item.kind === focusedKind),
      );
      if (focused) {
        return focused;
      }
    }

    return null;
  }

  private countActiveDossiers(items: DesktopDocumentHubItem[]): number {
    const dossierKeys = new Set<string>();
    items.forEach((item) => {
      if (item.familyId === "regulation") {
        dossierKeys.add("regulation");
        return;
      }
      if (item.familyId === "commercial") {
        dossierKeys.add(`commercial:${item.dossierLabel}`);
        return;
      }
      dossierKeys.add(`${item.familyId}:${item.dossierLabel}`);
    });
    return dossierKeys.size;
  }

  private mapQuote(quote: QuoteRecord): DesktopDocumentHubItem {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validUntilTime = this.toTimestamp(quote.valid_until);
    const isExpired = validUntilTime > 0 && validUntilTime < today.getTime();

    let statusLabel = "Envoyé";
    let statusTone: CfmTone = "progress";
    let actionLabel = "Voir le devis";
    let actionDetail = "Le devis peut être consulté dans le cycle commercial.";
    let isAttention = false;
    let isReady = true;
    let priorityRank = 55;

    if (quote.status === "draft") {
      statusLabel = "Prêt à envoyer";
      statusTone = "warning";
      actionLabel = "Envoyer le devis";
      actionDetail = "Le devis existe déjà comme document commercial, mais il doit encore être envoyé.";
      isAttention = true;
      isReady = false;
      priorityRank = 18;
    } else if (quote.status === "accepted") {
      statusLabel = "À convertir";
      statusTone = "accent";
      actionLabel = "Créer une facture";
      actionDetail = "Le devis est accepté. La prochaine action utile est de le convertir en facture.";
      isAttention = true;
      isReady = true;
      priorityRank = 4;
    } else if (quote.status === "declined") {
      statusLabel = "Suivi terminé";
      statusTone = "neutral";
      actionLabel = "Voir le devis";
      actionDetail = "Le devis est refusé. Il reste consultable dans l'historique commercial.";
      isAttention = false;
      isReady = true;
      priorityRank = 90;
    } else if (quote.follow_up_status === "to_follow_up" || isExpired) {
      statusLabel = "À relancer";
      statusTone = "warning";
      actionLabel = "Relancer";
      actionDetail = isExpired
        ? "La validité du devis est dépassée. La relance commerciale est maintenant le geste utile."
        : "Le devis est envoyé mais appelle une relance claire.";
      isAttention = true;
      isReady = true;
      priorityRank = 12;
    } else if (quote.follow_up_status === "followed_up") {
      statusLabel = "Relancé";
      statusTone = "progress";
      actionLabel = "Voir le devis";
      actionDetail = "Le devis a déjà été relancé. Le prochain repère utile reste dans Facturation.";
      isAttention = false;
      isReady = true;
      priorityRank = 50;
    } else if (quote.follow_up_status === "waiting_customer") {
      statusLabel = "En attente client";
      statusTone = "calm";
      actionLabel = "Voir le devis";
      actionDetail = "Le document commercial est en attente de retour client.";
      isAttention = false;
      isReady = true;
      priorityRank = 60;
    }

    return {
      id: `billing-quote:${quote.id}`,
      rawId: quote.id,
      kind: "billing_quote",
      familyId: "commercial",
      familyLabel: "Documents commerciaux",
      title: quote.number,
      categoryLabel: "Devis",
      dossierLabel: quote.customer_name,
      statusLabel,
      statusTone,
      actionLabel,
      actionRoute: "/app/facturation/devis",
      actionDetail,
      detail: quote.title || quote.notes || "Document commercial du cycle devis.",
      supportLabel: [quote.worksite_name, this.formatAmountCents(quote.total_amount_cents, quote.currency)].filter(Boolean).join(" · "),
      dateLabel: this.formatDateTime(quote.valid_until ?? quote.issue_date),
      dateValue: this.toTimestamp(quote.valid_until ?? quote.issue_date),
      priorityRank,
      isAttention,
      isReady,
      isRecent: this.isRecent(quote.updated_at ?? quote.issue_date),
      canDownload: true,
    };
  }

  private mapInvoice(invoice: InvoiceRecord): DesktopDocumentHubItem {
    const hasPartialPayment = invoice.paid_amount_cents > 0 && invoice.outstanding_amount_cents > 0;

    let statusLabel = "Paiement attendu";
    let statusTone: CfmTone = "progress";
    let actionLabel = "Voir la facture";
    let actionDetail = "La facture est ouverte dans le cycle commercial.";
    let isAttention = false;
    let isReady = true;
    let priorityRank = 58;

    if (invoice.status === "draft") {
      statusLabel = "À émettre";
      statusTone = "warning";
      actionLabel = "Émettre";
      actionDetail = "La facture existe déjà comme document commercial, mais elle doit encore être émise.";
      isAttention = true;
      isReady = false;
      priorityRank = 10;
    } else if (invoice.status === "paid" || invoice.outstanding_amount_cents === 0) {
      statusLabel = "Soldée";
      statusTone = "success";
      actionLabel = "Voir la facture";
      actionDetail = "La facture est soldée et reste disponible comme pièce commerciale de référence.";
      isAttention = false;
      isReady = true;
      priorityRank = 92;
    } else if (invoice.status === "overdue") {
      statusLabel = hasPartialPayment ? "Partiellement réglée" : "En retard";
      statusTone = "danger";
      actionLabel = "Relancer";
      actionDetail = hasPartialPayment
        ? "Un solde reste dû malgré un premier règlement. La facture demande maintenant un suivi actif."
        : "L'échéance est dépassée. La facture appelle une relance commerciale forte.";
      isAttention = true;
      isReady = true;
      priorityRank = 0;
    } else if (hasPartialPayment) {
      statusLabel = "Partiellement réglée";
      statusTone = "warning";
      actionLabel = "Enregistrer un paiement";
      actionDetail = "Une partie du règlement est reçue, mais un solde reste encore à encaisser.";
      isAttention = true;
      isReady = true;
      priorityRank = 14;
    } else if (invoice.follow_up_status === "to_follow_up") {
      statusLabel = "Paiement attendu";
      statusTone = "warning";
      actionLabel = "Relancer";
      actionDetail = "La facture est émise et déjà signalée en relance.";
      isAttention = true;
      isReady = true;
      priorityRank = 16;
    } else if (invoice.follow_up_status === "followed_up") {
      statusLabel = "Paiement attendu";
      statusTone = "progress";
      actionLabel = "Voir la facture";
      actionDetail = "La relance a déjà été faite. Le prochain repère utile reste le règlement.";
      isAttention = false;
      isReady = true;
      priorityRank = 56;
    } else if (invoice.follow_up_status === "waiting_customer") {
      statusLabel = "Paiement attendu";
      statusTone = "calm";
      actionLabel = "Enregistrer un paiement";
      actionDetail = "La facture reste en attente de retour client ou de règlement.";
      isAttention = false;
      isReady = true;
      priorityRank = 62;
    }

    const paymentLabel = hasPartialPayment
      ? `Payé ${this.formatAmountCents(invoice.paid_amount_cents, invoice.currency)} · reste ${this.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)}`
      : invoice.outstanding_amount_cents > 0
        ? `Reste dû ${this.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)}`
        : "Réglée en totalité";

    return {
      id: `billing-invoice:${invoice.id}`,
      rawId: invoice.id,
      kind: "billing_invoice",
      familyId: "commercial",
      familyLabel: "Documents commerciaux",
      title: invoice.number,
      categoryLabel: "Facture",
      dossierLabel: invoice.customer_name,
      statusLabel,
      statusTone,
      actionLabel,
      actionRoute: "/app/facturation/factures",
      actionDetail,
      detail: invoice.title || invoice.notes || "Document commercial du cycle facture.",
      supportLabel: [invoice.worksite_name, paymentLabel].filter(Boolean).join(" · "),
      dateLabel: this.formatDateTime(invoice.due_date ?? invoice.issue_date),
      dateValue: this.toTimestamp(invoice.due_date ?? invoice.issue_date),
      priorityRank,
      isAttention,
      isReady,
      isRecent: this.isRecent(invoice.updated_at ?? invoice.issue_date),
      canDownload: true,
    };
  }

  private mapWorksiteDocument(document: WorksiteDocumentRecord): DesktopDocumentHubItem {
    const missingTrace = document.linked_proofs.length === 0 || !document.linked_signature_id;
    const isReady = document.lifecycle_status === "finalized" && document.status === "available" && !missingTrace;
    const status =
      missingTrace
        ? { label: "À compléter", tone: "warning" as CfmTone }
        : document.status === "failed"
          ? { label: "Échec", tone: "danger" as CfmTone }
          : document.lifecycle_status === "draft"
            ? { label: "Brouillon", tone: "progress" as CfmTone }
            : isReady
              ? { label: "Prêt", tone: "success" as CfmTone }
              : { label: "À vérifier", tone: "warning" as CfmTone };

    return {
      id: `worksite-document:${document.id}`,
      rawId: document.id,
      kind: "worksite_document",
      familyId: "worksite",
      familyLabel: "Chantier",
      title: document.document_type_label,
      categoryLabel: document.file_name,
      dossierLabel: document.worksite_name,
      statusLabel: status.label,
      statusTone: status.tone,
      actionLabel: missingTrace ? "Voir les preuves" : "Voir les documents",
      actionRoute: `/app/chantiers/${document.worksite_id}/${missingTrace ? "preuves" : "documents"}`,
      actionDetail:
        missingTrace
          ? "La pièce existe, mais il manque encore une preuve ou une signature."
          : document.lifecycle_status === "draft"
            ? "Le document doit encore être vérifié dans son chantier."
            : "La pièce peut être ouverte dans le registre documentaire du chantier.",
      detail: document.notes || document.file_name,
      supportLabel:
        document.linked_proofs.length > 0 && document.linked_signature_label
          ? `${document.linked_proofs.length} preuve${document.linked_proofs.length > 1 ? "s" : ""} · ${document.linked_signature_label}`
          : document.notes || "Trace documentaire à compléter",
      dateLabel: this.formatDateTime(document.uploaded_at ?? document.updated_at),
      dateValue: this.toTimestamp(document.uploaded_at ?? document.updated_at),
      priorityRank:
        status.tone === "danger"
          ? 2
          : missingTrace
            ? 24
            : document.lifecycle_status === "draft"
              ? 28
              : isReady
                ? 82
                : 36,
      isAttention: !isReady,
      isReady,
      isRecent: this.isRecent(document.uploaded_at ?? document.updated_at),
      canDownload: true,
    };
  }

  private mapWorksiteProof(proof: WorksiteProofRecord): DesktopDocumentHubItem {
    const status = this.mapDocumentStatus(proof.status);
    return {
      id: `worksite-proof:${proof.id}`,
      rawId: proof.id,
      kind: "worksite_proof",
      familyId: "proofs",
      familyLabel: "Preuves terrain",
      title: proof.label,
      categoryLabel: "Preuve",
      dossierLabel: proof.worksite_name,
      statusLabel: status.label,
      statusTone: status.tone,
      actionLabel: "Voir les preuves",
      actionRoute: `/app/chantiers/${proof.worksite_id}/preuves`,
      actionDetail: status.tone === "success" ? "La preuve est disponible dans le chantier." : "La preuve reste à vérifier dans le chantier.",
      detail: proof.file_name,
      supportLabel: proof.notes || null,
      dateLabel: this.formatDateTime(proof.uploaded_at ?? proof.updated_at),
      dateValue: this.toTimestamp(proof.uploaded_at ?? proof.updated_at),
      priorityRank: status.tone === "danger" ? 6 : status.tone === "warning" ? 32 : 84,
      isAttention: status.tone !== "success",
      isReady: status.tone === "success",
      isRecent: this.isRecent(proof.uploaded_at ?? proof.updated_at),
      canDownload: false,
    };
  }

  private mapWorksiteSignature(signature: WorksiteSignatureRecord): DesktopDocumentHubItem {
    const status = this.mapDocumentStatus(signature.status);
    return {
      id: `worksite-signature:${signature.id}`,
      rawId: signature.id,
      kind: "worksite_signature",
      familyId: "signatures",
      familyLabel: "Signatures",
      title: signature.label,
      categoryLabel: "Signature",
      dossierLabel: signature.worksite_name,
      statusLabel: status.label,
      statusTone: status.tone,
      actionLabel: "Voir les preuves",
      actionRoute: `/app/chantiers/${signature.worksite_id}/preuves`,
      actionDetail: status.tone === "success" ? "La signature est en place dans le chantier." : "La signature reste à vérifier ou à compléter.",
      detail: signature.file_name,
      supportLabel: null,
      dateLabel: this.formatDateTime(signature.uploaded_at ?? signature.updated_at),
      dateValue: this.toTimestamp(signature.uploaded_at ?? signature.updated_at),
      priorityRank: status.tone === "danger" ? 8 : status.tone === "warning" ? 34 : 86,
      isAttention: status.tone !== "success",
      isReady: status.tone === "success",
      isRecent: this.isRecent(signature.uploaded_at ?? signature.updated_at),
      canDownload: false,
    };
  }

  private mapRegulatoryEvidence(evidence: RegulatoryEvidenceRecord): DesktopDocumentHubItem {
    const status = this.mapDocumentStatus(evidence.status);
    return {
      id: `regulatory-evidence:${evidence.id}`,
      rawId: evidence.id,
      kind: "regulatory_evidence",
      familyId: "regulation",
      familyLabel: "Conformité",
      title: evidence.file_name,
      categoryLabel: evidence.document_type,
      dossierLabel: evidence.link_label,
      statusLabel: status.label,
      statusTone: status.tone,
      actionLabel: "Voir les preuves",
      actionRoute: "/app/reglementation/preuves",
      actionDetail: status.tone === "success" ? "La pièce est disponible côté réglementation." : "La pièce reste à régulariser côté réglementation.",
      detail: evidence.document_type,
      supportLabel: evidence.notes || null,
      dateLabel: this.formatDateTime(evidence.uploaded_at ?? evidence.updated_at),
      dateValue: this.toTimestamp(evidence.uploaded_at ?? evidence.updated_at),
      priorityRank: status.tone === "danger" ? 7 : status.tone === "warning" ? 30 : 88,
      isAttention: status.tone !== "success",
      isReady: status.tone === "success",
      isRecent: this.isRecent(evidence.uploaded_at ?? evidence.updated_at),
      canDownload: false,
    };
  }

  private mapDocumentStatus(status: "pending" | "available" | "failed" | "archived"): { label: string; tone: CfmTone } {
    switch (status) {
      case "available":
        return { label: "Disponible", tone: "success" };
      case "failed":
        return { label: "Échec", tone: "danger" };
      case "archived":
        return { label: "Archivée", tone: "neutral" };
      default:
        return { label: "À vérifier", tone: "warning" };
    }
  }

  private matchesQuery(item: DesktopDocumentHubItem, query: string): boolean {
    return [
      item.title,
      item.categoryLabel,
      item.familyLabel,
      item.dossierLabel,
      item.detail,
      item.supportLabel,
      item.statusLabel,
    ]
      .map((value) => this.normalize(value))
      .some((value) => value.includes(query));
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  private isRecent(value: string | null | undefined): boolean {
    const timestamp = this.toTimestamp(value);
    if (!timestamp) {
      return false;
    }
    return Date.now() - timestamp <= 1000 * 60 * 60 * 24 * 21;
  }

  private toTimestamp(value: string | null | undefined): number {
    if (!value) {
      return 0;
    }
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private formatDateTime(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  private formatAmountCents(amountCents: number, currency: string): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountCents / 100);
  }

  private getFamilyFilterLabel(family: DocumentFamilyFilter): string {
    switch (family) {
      case "worksite":
        return "Chantier";
      case "commercial":
        return "Documents commerciaux";
      case "proofs":
        return "Preuves terrain";
      case "signatures":
        return "Signatures";
      case "regulation":
        return "Conformité";
      default:
        return "Toutes les familles";
    }
  }
}
