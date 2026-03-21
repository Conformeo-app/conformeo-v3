import { CommonModule } from "@angular/common";
import { Component, DoCheck, TemplateRef, ViewChild, ViewEncapsulation, forwardRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet } from "@angular/router";
import type {
  ApplicableRegulatoryObligationRecord,
  AuditLogRecord,
  AuthSession,
  BillingFollowUpStatus,
  BillingCustomerRecord,
  BillingCustomerType,
  BillingLineItemInput,
  CockpitSummaryRecord,
  CockpitTone,
  BuildingSafetyAlertRecord,
  BuildingSafetyItemRecord,
  BuildingSafetyItemStatus,
  BuildingSafetyItemType,
  ComplianceStatus,
  DocumentLifecycleStatus,
  DuerpEntryRecord,
  DuerpSeverity,
  InvoiceRecord,
  InvoiceStatus,
  MembershipAccess,
  ModuleCode,
  OrganizationRegulatoryProfileRecord,
  OrganizationProfileUpdateRequest,
  OrganizationRecord,
  OrganizationSiteRecord,
  OrganizationSiteType,
  RegulatoryEvidenceLinkKind,
  RegulatoryEvidenceRecord,
  RegulatoryCriterionRecord,
  RegulatoryObligationCategory,
  RegulatoryObligationPriority,
  QuoteRecord,
  QuoteStatus,
  WorksiteApiSummary,
  WorksiteAssigneeRecord,
  WorksiteCoordinationRecord,
  WorksiteCoordinationStatus,
  WorksiteDocumentRecord,
  WorksiteProofRecord,
  WorksitePreventionPlanExportRequest,
  WorksiteSignatureRecord,
} from "@conformeo/contracts";
import {
  CfmButtonComponent,
  CfmCardComponent,
  CfmEmptyStateComponent,
  CfmInputComponent,
  CfmStatusChipComponent,
  type CfmTone
} from "@conformeo/ui";

import {
  clearSession,
  fetchSession,
  getStoredAccessToken,
  getStoredOrganizationId,
  login,
  persistSession,
  updateOrganizationModule
} from "./auth-client";
import { ApiClientError } from "./api-error";
import {
  createBillingCustomer,
  createBuildingSafetyItem,
  createDuerpEntry,
  createInvoice,
  createOrganizationSite,
  createQuote,
  createRegulatoryEvidence,
  duplicateQuoteToInvoice,
  downloadGeneratedWorksiteDocument,
  downloadInvoicePdf,
  downloadWorksitePreventionPlanPdf,
  downloadQuotePdf,
  downloadRegulatoryExportPdf,
  downloadWorksiteSummaryPdf,
  fetchCockpitSummary,
  fetchOrganizationProfile,
  fetchOrganizationRegulatoryProfile,
  listAuditLogs,
  listBillingCustomers,
  listBuildingSafetyAlerts,
  listBuildingSafetyItems,
  listDuerpEntries,
  listInvoices,
  listOrganizationSites,
  listQuotes,
  listRegulatoryEvidences,
  listWorksiteAssignees,
  listWorksiteDocuments,
  listWorksiteProofs,
  listWorksiteSignatures,
  listWorksites,
  recordInvoicePayment,
  updateBillingCustomer,
  updateBuildingSafetyItem,
  updateDuerpEntry,
  updateInvoice,
  updateInvoiceFollowUpStatus,
  updateInvoiceStatus,
  updateInvoiceWorksiteLink,
  updateOrganizationProfile,
  updateOrganizationSite,
  updateQuote,
  updateQuoteFollowUpStatus,
  updateQuoteStatus,
  updateQuoteWorksiteLink,
  updateWorksiteDocumentProofs,
  updateWorksiteCoordination,
  updateWorksiteDocumentCoordination,
  updateWorksiteDocumentSignature,
  updateWorksiteDocumentStatus
} from "./organization-client";
import {
  DESKTOP_SHELL_CONTEXT,
  type DesktopShellContext,
  type WorkspaceTemplateName,
} from "./desktop-shell-context";
import { DESKTOP_LOGIN_PAGE_CONTEXT } from "./desktop-login-page-context";
import { DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT } from "./desktop-worksite-documents-page-context";
import { generatedEnv } from "../environments/generated-env";

type HasEmployeesValue = "" | "yes" | "no";
type BillingLineForm = { description: string; quantity: string; unitPrice: string; };
type QuoteDraftForm = {
  customerId: string;
  worksiteId: string;
  title: string;
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  notes: string;
  lines: BillingLineForm[];
};
type InvoiceDraftForm = {
  customerId: string;
  worksiteId: string;
  title: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
  lines: BillingLineForm[];
};
type WorksitePreventionPlanForm = {
  usefulDate: string;
  interventionContext: string;
  vigilancePoints: string;
  measurePoints: string;
  additionalContact: string;
};
type WorksitePreventionPlanPreview = {
  companyName: string;
  worksiteName: string;
  worksiteAddress: string;
  clientName: string | null;
  usefulDateLabel: string | null;
  interventionContext: string;
  vigilancePoints: string[];
  measurePoints: string[];
  additionalContact: string | null;
};
type CoordinationDraftForm = {
  status: WorksiteCoordinationStatus;
  assigneeUserId: string;
  commentText: string;
};
type BillingDraftRecord<TPayload> = {
  updatedAt: string;
  payload: TPayload;
};
type DashboardKpiCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  statusLabel: string;
  tone: CfmTone;
};
type DashboardAlertItem = {
  id: string;
  title: string;
  description: string;
  moduleLabel: string;
  tone: CfmTone;
  priority: number;
};
type DashboardActionModule = "reglementation" | "chantier" | "facturation";
type DashboardActionModuleFilter = "all" | DashboardActionModule;
type DashboardActionPriority = "high" | "medium" | "low";
type CoordinationStatusFilter = "all" | WorksiteCoordinationStatus;
type CoordinationAssigneeFilter = "all" | "unassigned" | string;
type WorksiteDocumentLifecycleFilter = "all" | DocumentLifecycleStatus;
type BetaFeedbackCategory = "blocking" | "unclear" | "improvement" | "positive";
type BetaFeedbackArea =
  | "cockpit"
  | "worksite"
  | "worksite_document"
  | "facturation"
  | "reglementation"
  | "sync"
  | "other";
type DashboardActionItem = {
  id: string;
  module: DashboardActionModule;
  priority: DashboardActionPriority;
  title: string;
  description: string;
  context: string | null;
};
type DashboardPerspectiveCard = {
  id: string;
  label: string;
  headline: string;
  detail: string;
  highlights: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  statusLabel: string;
  tone: CfmTone;
};
type DashboardWorksiteOverviewItem = {
  id: string;
  name: string;
  summary: string;
  operationalSummary: string;
  taskSummary: string;
  coordination: DashboardCoordinationState;
  worksiteDocuments: DashboardWorksiteDocumentItem[];
  linkedQuotesSummary: string;
  linkedInvoicesSummary: string;
  linkedWorksiteDocumentsSummary: string;
  worksiteDocumentsCount: number;
  financialSummary: string | null;
  regulatorySummary: string | null;
  statusLabel: string;
  statusTone: CfmTone;
  signalLabel: string;
  signalTone: CfmTone;
};
type DashboardCoordinationState = {
  status: WorksiteCoordinationStatus;
  statusLabel: string;
  statusTone: CfmTone;
  assigneeUserId: string | null;
  assigneeDisplayName: string | null;
  assigneeLabel: string;
  commentText: string | null;
  commentSummary: string;
  updatedAtLabel: string | null;
};
type DashboardWorksiteDocumentItem = {
  id: string;
  title: string;
  documentType: string;
  fileName: string;
  worksiteId: string;
  worksiteName: string;
  lifecycleStatus: DocumentLifecycleStatus;
  lifecycleStatusLabel: string;
  lifecycleStatusTone: CfmTone;
  technicalStatusLabel: string;
  technicalStatusTone: CfmTone;
  typeLabel: string;
  proofCount: number;
  proofCountLabel: string;
  signatureStatusLabel: string;
  signatureStatusTone: CfmTone;
  linkedSignature: DashboardWorksiteLinkedAssetItem | null;
  linkedSignatureId: string | null;
  linkedSignatureLabel: string | null;
  linkedSignatureDetail: string | null;
  linkedProofs: DashboardWorksiteLinkedAssetItem[];
  linkedProofsSummary: string | null;
  hasStoredFile: boolean;
  fileAvailabilityLabel: string;
  fileAvailabilityTone: CfmTone;
  fileSizeLabel: string | null;
  uploadedAtValue: string | null;
  uploadedAtLabel: string | null;
  notes: string | null;
  coordination: DashboardCoordinationState;
};
type DashboardWorksiteLinkedAssetItem = {
  id: string;
  label: string;
  detail: string | null;
  statusLabel: string;
  statusTone: CfmTone;
};
type DashboardCoordinationTodoItem = {
  id: string;
  kind: "worksite" | "document";
  kindLabel: string;
  kindTone: CfmTone;
  title: string;
  description: string;
  context: string | null;
  status: WorksiteCoordinationStatus;
  statusLabel: string;
  statusTone: CfmTone;
  worksiteId: string;
  documentId: string | null;
};
type UserErrorContext = "generic" | "auth" | "load" | "save" | "update" | "export";
type DashboardCustomerOverviewItem = {
  id: string;
  name: string;
  summary: string;
  context: string;
  statusLabel: string;
  statusTone: CfmTone;
  signalLabel: string;
  signalTone: CfmTone;
};

@Component({
  selector: "cfm-root",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    CfmButtonComponent,
    CfmCardComponent,
    CfmEmptyStateComponent,
    CfmInputComponent,
    CfmStatusChipComponent
  ],
  providers: [
    {
      provide: DESKTOP_LOGIN_PAGE_CONTEXT,
      useExisting: forwardRef(() => AppComponent),
    },
    {
      provide: DESKTOP_SHELL_CONTEXT,
      useExisting: forwardRef(() => AppComponent),
    },
    {
      provide: DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT,
      useExisting: forwardRef(() => AppComponent),
    },
  ],
  template: `
    <router-outlet />

    <ng-template #homePageTemplate>
            <cfm-card
              *ngIf="shouldShowInitialWorkspaceLoading"
              class="desktop-card"
              eyebrow="Cockpit"
              title="Chargement du cockpit"
              description="Les repères entreprise, chantier et facturation sont en train d’être préparés."
            >
              <div class="loading-state-card">
                <div class="loading-state-skeleton" aria-hidden="true">
                  <div class="loading-state-hero"></div>
                  <div class="loading-state-grid">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div class="loading-state-lines">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div class="loading-state-copy">
                  <p class="loading-state-label">Mise à jour en cours</p>
                  <p class="small">Les repères arrivent sans bloquer votre lecture.</p>
                </div>
              </div>
            </cfm-card>

            <ng-template #homeAdministrationCardTemplate>
              <cfm-card
                class="desktop-card"
                eyebrow="Organisation"
                title="Organisation et modules"
                description="Les réglages d’organisation et les modules activés restent accessibles, sans prendre la place du cockpit."
              >
                <div class="grid" *ngIf="currentMembership as membership">
                  <article>
                    <h3>Permissions</h3>
                    <div class="chips">
                      <cfm-status-chip
                        *ngFor="let permission of membership.permissions"
                        [label]="permission"
                        tone="calm"
                      />
                    </div>
                  </article>

                  <article>
                    <h3>Organisations liées</h3>
                    <ul class="stack-list">
                      <li *ngFor="let item of session?.memberships">
                        <div class="list-copy">
                          <strong>{{ item.organization.name }}</strong>
                          <span>{{ item.membership.role_code }}</span>
                        </div>
                        <cfm-status-chip
                          [label]="item.membership.is_default ? 'Courante' : 'Liée'"
                          [tone]="item.membership.is_default ? 'success' : 'neutral'"
                        />
                      </li>
                    </ul>
                  </article>
                </div>

                <section class="modules" *ngIf="currentMembership as membership">
                  <div class="modules-header">
                    <div>
                      <h3>Modules de l'organisation</h3>
                      <p>
                        Activez les modules utiles pour ouvrir progressivement la réglementation et la facturation depuis l’espace bureau.
                      </p>
                    </div>
                  </div>

                  <ul class="module-list" *ngIf="membership.modules.length > 0; else emptyModules">
                    <li *ngFor="let module of membership.modules">
                      <div class="module-copy">
                        <strong>{{ module.module_code }}</strong>
                        <cfm-status-chip
                          [label]="module.is_enabled ? 'Activé' : 'Désactivé'"
                          [tone]="module.is_enabled ? 'success' : 'neutral'"
                        />
                      </div>

                      <label class="toggle">
                        <input
                          type="checkbox"
                          [checked]="module.is_enabled"
                          [disabled]="loading || !canManageModules"
                          (change)="toggleModule(module.module_code, $any($event.target).checked)"
                        />
                        <span>{{ module.is_enabled ? "On" : "Off" }}</span>
                      </label>
                    </li>
                  </ul>

                  <ng-template #emptyModules>
                    <cfm-empty-state
                      title="Aucun module configuré"
                      description="Cette organisation n’a encore aucun module activable dans le socle actuel."
                    />
                  </ng-template>
                </section>
              </cfm-card>
            </ng-template>

          <cfm-card
            *ngIf="currentMembership"
            class="desktop-card"
            eyebrow="S4-001 · S4-002 · S4-003"
            title="Vue d’ensemble"
            description="Quelques repères utiles pour savoir quoi traiter aujourd’hui, sans reporting complexe ni jargon métier."
          >
            <div class="card-header-actions">
              <div class="chips">
                <cfm-status-chip
                  [label]="dashboardKpis.length + ' repère' + (dashboardKpis.length > 1 ? 's' : '')"
                  [tone]="dashboardKpis.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="dashboardActions.length > 0 ? dashboardActions.length + ' action' + (dashboardActions.length > 1 ? 's' : '') : 'Aucune action simple'"
                  [tone]="dashboardActions.length > 0 ? 'progress' : 'success'"
                />
                <cfm-status-chip
                  [label]="dashboardAlerts.length > 0 ? dashboardAlerts.length + ' priorité' + (dashboardAlerts.length > 1 ? 's' : '') : 'Aucune alerte simple'"
                  [tone]="dashboardAlerts.length > 0 ? 'progress' : 'success'"
                />
              </div>
            </div>

            <div class="dashboard-grid" *ngIf="dashboardKpis.length > 0; else emptyDashboard">
              <article class="dashboard-kpi-card" *ngFor="let kpi of dashboardKpis">
                <p class="meta">{{ kpi.label }}</p>
                <strong class="dashboard-kpi-value">{{ kpi.value }}</strong>
                <span>{{ kpi.detail }}</span>
                <cfm-status-chip [label]="kpi.statusLabel" [tone]="kpi.tone" />
              </article>
            </div>

            <ng-template #emptyDashboard>
              <cfm-empty-state
                title="Aucun module actif pour le moment"
                description="Activez Réglementation, Chantier ou Facturation pour faire apparaître une vue d’ensemble utile."
              />
            </ng-template>

            <section class="dashboard-alerts">
              <h3>Priorités du moment</h3>

              <ul class="alert-list" *ngIf="dashboardAlerts.length > 0; else emptyDashboardAlerts">
                <li *ngFor="let alert of dashboardAlerts">
                  <div class="dashboard-alert-copy">
                    <strong>{{ alert.title }}</strong>
                    <span>{{ alert.description }}</span>
                  </div>
                  <cfm-status-chip [label]="alert.moduleLabel" [tone]="alert.tone" />
                </li>
              </ul>

              <ng-template #emptyDashboardAlerts>
                <p class="small">Aucune priorité simple détectée pour le moment.</p>
              </ng-template>
            </section>

            <section class="dashboard-actions">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Actions à faire</h3>
                  <p class="small">
                    Une vue courte pour passer du constat à l’action, sans créer un gestionnaire de tâches.
                  </p>
                </div>

                <label class="field compact-field dashboard-filter">
                  <span>Module</span>
                  <select [(ngModel)]="selectedDashboardActionModule" name="selectedDashboardActionModule">
                    <option value="all">Tous les modules</option>
                    <option value="reglementation">Réglementation</option>
                    <option value="chantier">Chantier</option>
                    <option value="facturation">Facturation</option>
                  </select>
                </label>
              </div>

              <div class="chips">
                <cfm-status-chip
                  [label]="dashboardActionCountLabel"
                  [tone]="filteredDashboardActions.length > 0 ? 'progress' : 'success'"
                />
              </div>

              <ul class="alert-list" *ngIf="filteredDashboardActions.length > 0; else emptyDashboardActions">
                <li *ngFor="let action of filteredDashboardActions">
                  <div class="dashboard-alert-copy">
                    <strong>{{ action.title }}</strong>
                    <span>{{ action.description }}</span>
                    <span *ngIf="action.context">{{ action.context }}</span>
                  </div>

                  <div class="chips">
                    <cfm-status-chip
                      [label]="getDashboardActionPriorityLabel(action.priority)"
                      [tone]="getDashboardActionPriorityTone(action.priority)"
                    />
                    <cfm-status-chip
                      [label]="getDashboardActionModuleLabel(action.module)"
                      [tone]="getDashboardActionModuleTone(action.module)"
                    />
                  </div>
                </li>
              </ul>

              <ng-template #emptyDashboardActions>
                <p class="small">
                  {{
                    selectedDashboardActionModule === "all"
                      ? "Aucune action simple détectée pour le moment."
                      : "Aucune action simple pour ce module."
                  }}
                </p>
              </ng-template>
            </section>
          </cfm-card>

          <cfm-card
            *ngIf="currentMembership"
            class="desktop-card"
            eyebrow="S4-020 · S4-021 · S4-022"
            title="Lectures utiles"
            description="Trois angles simples pour relire l’activité sans ouvrir de vue analytique complexe : entreprise, chantier et client."
          >
            <section class="dashboard-actions">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Synthèse par module</h3>
                  <p class="small">
                    Chaque module ressort avec quelques repères utiles pour comprendre plus vite où regarder.
                  </p>
                </div>
              </div>

              <div class="dashboard-grid" *ngIf="dashboardEnterpriseOverviewCards.length > 0; else emptyEnterpriseOverview">
                <article class="dashboard-kpi-card" *ngFor="let card of dashboardEnterpriseOverviewCards">
                  <p class="meta">{{ card.label }}</p>
                  <strong>{{ card.headline }}</strong>
                  <span>{{ card.detail }}</span>
                  <ul class="dashboard-module-highlights" *ngIf="card.highlights.length > 0">
                    <li *ngFor="let highlight of card.highlights">
                      <span class="meta">{{ highlight.label }}</span>
                      <strong>{{ highlight.value }}</strong>
                    </li>
                  </ul>
                  <cfm-status-chip [label]="card.statusLabel" [tone]="card.tone" />
                </article>
              </div>

              <ng-template #emptyEnterpriseOverview>
                <p class="small">Aucun module actif pour construire une lecture synthétique pour le moment.</p>
              </ng-template>
            </section>

            <section class="dashboard-actions">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>À traiter</h3>
                  <p class="small">
                    Une lecture courte pour retrouver vite les chantiers et documents encore en préparation.
                  </p>
                </div>

                <cfm-status-chip
                  [label]="coordinationTodoCountLabel"
                  [tone]="coordinationTodoItems.length > 0 ? 'progress' : 'success'"
                />
              </div>

              <ng-container *ngIf="isChantierEnabled; else chantierCoordinationDisabled">
                <div class="inline-actions">
                  <label class="compact-field">
                    <span class="small">Suivi</span>
                    <select [(ngModel)]="selectedCoordinationStatusFilter" name="selectedCoordinationStatusFilter">
                      <option value="all">Tous les suivis</option>
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Fait</option>
                    </select>
                  </label>

                  <label class="compact-field">
                    <span class="small">Affectation</span>
                    <select [(ngModel)]="selectedCoordinationAssigneeFilter" name="selectedCoordinationAssigneeFilter">
                      <option value="all">Toutes les affectations</option>
                      <option value="unassigned">Non affecté</option>
                      <option *ngFor="let assignee of worksiteAssignees" [value]="assignee.user_id">
                        {{ getWorksiteAssigneeOptionLabel(assignee) }}
                      </option>
                    </select>
                  </label>

                  <cfm-button
                    *ngIf="hasActiveCoordinationFilters"
                    type="button"
                    variant="secondary"
                    (click)="resetCoordinationFilters()"
                  >
                    Réinitialiser les filtres
                  </cfm-button>
                </div>

                <p class="small">
                  Ces filtres s'appliquent aussi à la vue chantier et aux documents chantier plus bas.
                </p>

                <ul class="alert-list" *ngIf="coordinationTodoItems.length > 0; else emptyCoordinationTodo">
                  <li *ngFor="let item of coordinationTodoItems">
                    <div class="dashboard-alert-copy">
                      <strong>{{ item.title }}</strong>
                      <span>{{ item.description }}</span>
                      <span *ngIf="item.context">{{ item.context }}</span>
                    </div>

                    <div class="billing-item-actions">
                      <div class="chips">
                        <cfm-status-chip [label]="item.kindLabel" [tone]="item.kindTone" />
                        <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                      </div>

                      <cfm-button
                        type="button"
                        variant="secondary"
                        (click)="openCoordinationTodoItem(item)"
                      >
                        {{ item.kind === "worksite" ? "Voir le chantier" : "Voir le document" }}
                      </cfm-button>
                    </div>
                  </li>
                </ul>

                <ng-template #emptyCoordinationTodo>
                  <cfm-empty-state
                    [title]="hasActiveCoordinationFilters ? 'Aucun résultat pour ces filtres' : 'Rien à coordonner pour le moment'"
                    [description]="
                      hasActiveCoordinationFilters
                        ? 'Ajustez les filtres pour élargir la lecture chantier.'
                        : 'Les chantiers et documents à traiter apparaitront ici.'
                    "
                  />
                </ng-template>
              </ng-container>

              <ng-template #chantierCoordinationDisabled>
                <cfm-empty-state
                  title="Module Chantier non activé"
                  description="Activez le module Chantier pour afficher cette lecture de coordination."
                />
              </ng-template>
            </section>

            <section class="dashboard-actions" id="worksite-overview-section">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Vue par chantier</h3>
                  <p class="small">
                    Les chantiers ressortent avec leur statut général, leurs signaux simples et les documents déjà liés.
                  </p>
                </div>

                <cfm-status-chip
                  [label]="worksiteOverviewCountLabel"
                  [tone]="filteredDashboardWorksiteOverviewItems.length > 0 ? 'calm' : 'neutral'"
                />
              </div>

              <ng-container *ngIf="isChantierEnabled; else chantierOverviewDisabled">
                <ul class="alert-list" *ngIf="filteredDashboardWorksiteOverviewItems.length > 0; else emptyWorksiteOverview">
                  <li *ngFor="let item of filteredDashboardWorksiteOverviewItems">
                    <div class="dashboard-alert-copy">
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.summary }}</span>
                      <span>{{ item.operationalSummary }}</span>
                      <span>{{ item.taskSummary }}</span>
                      <span>
                        Coordination : {{ item.coordination.statusLabel }} · {{ item.coordination.assigneeLabel }}
                      </span>
                      <span *ngIf="item.coordination.commentText">{{ item.coordination.commentSummary }}</span>
                      <span *ngIf="item.coordination.updatedAtLabel">
                        Dernier suivi : {{ item.coordination.updatedAtLabel }}
                      </span>
                      <span>{{ item.linkedWorksiteDocumentsSummary }}</span>
                      <span>{{ item.linkedQuotesSummary }}</span>
                      <span>{{ item.linkedInvoicesSummary }}</span>
                      <span *ngIf="item.financialSummary">{{ item.financialSummary }}</span>
                      <span *ngIf="item.regulatorySummary">{{ item.regulatorySummary }}</span>
                    </div>

                    <div class="billing-item-actions">
                      <div class="chips">
                        <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                        <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
                      </div>

                      <cfm-button
                        *ngIf="canManageOrganization && isFacturationEnabled && billingCustomers.length > 0"
                        type="button"
                        variant="secondary"
                        (click)="prepareQuoteFromWorksite(item.id)"
                      >
                        Préparer un devis
                      </cfm-button>

                      <cfm-button
                        *ngIf="canManageOrganization && isFacturationEnabled && billingCustomers.length > 0"
                        type="button"
                        variant="secondary"
                        (click)="prepareInvoiceFromWorksite(item.id)"
                      >
                        Préparer une facture
                      </cfm-button>

                      <cfm-button
                        *ngIf="canReadOrganization"
                        type="button"
                        variant="secondary"
                        [disabled]="worksiteDocumentPdfBusyId === item.id"
                        (click)="exportWorksiteSummaryPdf(item.id)"
                      >
                        {{ worksiteDocumentPdfBusyId === item.id ? "Génération en cours" : "Fiche chantier PDF" }}
                      </cfm-button>

                      <cfm-button
                        *ngIf="canReadOrganization"
                        type="button"
                        variant="secondary"
                        [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        (click)="toggleWorksitePreventionPlanEditor(item.id)"
                      >
                        {{
                          worksitePreventionPlanEditingId === item.id
                            ? "Fermer le plan"
                            : "Ajuster le plan"
                        }}
                      </cfm-button>

                      <cfm-button
                        *ngIf="item.worksiteDocumentsCount > 0"
                        type="button"
                        variant="secondary"
                        (click)="focusWorksiteDocuments(item.id)"
                      >
                        Voir les documents
                      </cfm-button>

                      <cfm-button
                        *ngIf="canReadOrganization"
                        type="button"
                        variant="secondary"
                        (click)="toggleWorksiteCoordination(item.id)"
                      >
                        {{
                          selectedWorksiteCoordinationId === item.id
                            ? "Masquer la coordination"
                            : "Coordination simple"
                        }}
                      </cfm-button>
                    </div>

                    <ul class="stack-list" *ngIf="item.worksiteDocuments.length > 0">
                      <li *ngFor="let document of item.worksiteDocuments">
                        <div class="list-copy">
                          <strong>{{ document.title }}</strong>
                          <span>{{ document.fileName }}</span>
                          <span *ngIf="document.uploadedAtLabel">
                            Dernière génération : {{ document.uploadedAtLabel }}
                          </span>
                          <span *ngIf="document.linkedSignatureLabel">
                            Signature liée : {{ document.linkedSignatureLabel }}
                            <ng-container *ngIf="document.linkedSignatureDetail">
                              · {{ document.linkedSignatureDetail }}
                            </ng-container>
                          </span>
                          <span *ngIf="document.linkedProofsSummary">
                            Preuves liées : {{ document.linkedProofsSummary }}
                          </span>
                          <span>
                            Coordination : {{ document.coordination.statusLabel }} ·
                            {{ document.coordination.assigneeLabel }}
                          </span>
                          <span *ngIf="document.coordination.commentText">
                            {{ document.coordination.commentSummary }}
                          </span>
                        </div>

                        <div class="billing-item-actions">
                          <div class="chips">
                            <cfm-status-chip
                              [label]="document.lifecycleStatusLabel"
                              [tone]="document.lifecycleStatusTone"
                            />
                          </div>

                          <label class="compact-field" *ngIf="canManageOrganization">
                            <span class="small">Statut du document</span>
                            <select
                              [ngModel]="document.lifecycleStatus"
                              [name]="'worksiteDocumentLifecycle' + document.id"
                              [disabled]="worksiteDocumentStatusBusyId === document.id"
                              (ngModelChange)="changeWorksiteDocumentLifecycleStatus(document.id, $event)"
                            >
                              <option value="draft">Brouillon</option>
                              <option value="finalized">Finalisé</option>
                            </select>
                          </label>

                          <label
                            class="compact-field"
                            *ngIf="canManageOrganization && getWorksiteSignatureOptions(document.worksiteId).length > 0"
                          >
                            <span class="small">Signature liée</span>
                            <select
                              [ngModel]="document.linkedSignatureId ?? ''"
                              [name]="'worksiteDocumentSignature' + document.id"
                              [disabled]="worksiteDocumentSignatureBusyId === document.id"
                              (ngModelChange)="changeWorksiteDocumentSignature(document.id, $event)"
                            >
                              <option value="">Aucune signature liée</option>
                              <option
                                *ngFor="let signature of getWorksiteSignatureOptions(document.worksiteId)"
                                [value]="signature.id"
                              >
                                {{ getWorksiteSignatureOptionLabel(signature) }}
                              </option>
                            </select>
                          </label>

                          <span
                            class="small"
                            *ngIf="canManageOrganization && getWorksiteSignatureOptions(document.worksiteId).length === 0"
                          >
                            Aucune signature chantier disponible pour ce chantier.
                          </span>

                          <div
                            class="inline-choice-list compact-field"
                            *ngIf="canManageOrganization && getWorksiteProofOptions(document.worksiteId).length > 0"
                          >
                            <span class="small">Preuves liées</span>
                            <label
                              class="inline-choice"
                              *ngFor="let proof of getWorksiteProofOptions(document.worksiteId)"
                            >
                              <input
                                type="checkbox"
                                [ngModel]="isWorksiteProofLinked(document, proof.id)"
                                [ngModelOptions]="{ standalone: true }"
                                [disabled]="worksiteDocumentProofBusyId === document.id"
                                (ngModelChange)="toggleWorksiteDocumentProof(document.id, proof.id, $event)"
                              />
                              <span>{{ getWorksiteProofOptionLabel(proof) }}</span>
                            </label>
                          </div>

                          <span
                            class="small"
                            *ngIf="canManageOrganization && getWorksiteProofOptions(document.worksiteId).length === 0"
                          >
                            Aucune preuve chantier disponible pour ce chantier.
                          </span>
                        </div>
                      </li>
                    </ul>

                    <section class="document-linked-panel" *ngIf="selectedWorksiteCoordinationId === item.id">
                      <div class="detail-grid">
                        <div class="detail-block">
                          <span class="small">Suivi</span>
                          <strong>{{ item.coordination.statusLabel }}</strong>
                          <cfm-status-chip
                            [label]="item.coordination.statusLabel"
                            [tone]="item.coordination.statusTone"
                          />
                        </div>

                        <div class="detail-block">
                          <span class="small">Affectation</span>
                          <strong>{{ item.coordination.assigneeLabel }}</strong>
                          <span *ngIf="item.coordination.updatedAtLabel">
                            Dernière mise à jour : {{ item.coordination.updatedAtLabel }}
                          </span>
                        </div>
                      </div>

                      <div class="detail-block">
                        <span class="small">Commentaire simple</span>
                        <span>
                          {{ item.coordination.commentText || "Aucun commentaire simple pour le moment." }}
                        </span>
                      </div>

                      <div class="detail-grid" *ngIf="canManageOrganization">
                        <label class="field compact-field">
                          <span>Suivi</span>
                          <select
                            [ngModel]="getWorksiteCoordinationDraft(item.id).status"
                            [name]="'worksiteCoordinationStatus' + item.id"
                            [disabled]="worksiteCoordinationBusyId === item.id"
                            (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { status: $event })"
                          >
                            <option value="todo">À faire</option>
                            <option value="in_progress">En cours</option>
                            <option value="done">Fait</option>
                          </select>
                        </label>

                        <label
                          class="field compact-field"
                          *ngIf="worksiteAssignees.length > 0; else noWorksiteAssignees"
                        >
                          <span>Affectation</span>
                          <select
                            [ngModel]="getWorksiteCoordinationDraft(item.id).assigneeUserId"
                            [name]="'worksiteCoordinationAssignee' + item.id"
                            [disabled]="worksiteCoordinationBusyId === item.id"
                            (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { assigneeUserId: $event })"
                          >
                            <option value="">Non affecté</option>
                            <option
                              *ngFor="let assignee of worksiteAssignees"
                              [value]="assignee.user_id"
                            >
                              {{ getWorksiteAssigneeOptionLabel(assignee) }}
                            </option>
                          </select>
                        </label>

                        <ng-template #noWorksiteAssignees>
                          <div class="detail-block">
                            <span class="small">Affectation</span>
                            <span>Aucun membre lisible pour affecter ce chantier.</span>
                          </div>
                        </ng-template>
                      </div>

                      <label class="field field-wide" *ngIf="canManageOrganization">
                        <span>Commentaire simple</span>
                        <textarea
                          [ngModel]="getWorksiteCoordinationDraft(item.id).commentText"
                          [name]="'worksiteCoordinationComment' + item.id"
                          rows="3"
                          placeholder="Ex. appeler le client avant l'intervention"
                          [disabled]="worksiteCoordinationBusyId === item.id"
                          (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { commentText: $event })"
                        ></textarea>
                      </label>

                      <div class="inline-actions" *ngIf="canManageOrganization">
                        <cfm-button
                          type="button"
                          [disabled]="worksiteCoordinationBusyId === item.id"
                          (click)="saveWorksiteCoordination(item)"
                        >
                          {{
                            worksiteCoordinationBusyId === item.id
                              ? "Enregistrement en cours"
                              : "Enregistrer"
                          }}
                        </cfm-button>
                      </div>
                    </section>

                    <form
                      class="document-adjustment-form"
                      *ngIf="worksitePreventionPlanEditingId === item.id"
                      (ngSubmit)="exportAdjustedWorksitePreventionPlanPdf(item.id)"
                    >
                      <p class="small field-wide">
                        Ajustez seulement ce qui est utile avant export. Le document reste prérempli et ne crée pas
                        de workflow supplémentaire.
                      </p>

                      <cfm-input
                        [(ngModel)]="worksitePreventionPlanForm.usefulDate"
                        [name]="'worksitePreventionDate' + item.id"
                        type="datetime-local"
                        label="Date utile"
                        [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                      />

                      <cfm-input
                        [(ngModel)]="worksitePreventionPlanForm.additionalContact"
                        [name]="'worksitePreventionContact' + item.id"
                        type="text"
                        label="Contact utile complémentaire"
                        placeholder="Ex. chef de site, standard, accueil"
                        [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                      />

                      <label class="field field-wide">
                        <span>Contexte d’intervention</span>
                        <textarea
                          [(ngModel)]="worksitePreventionPlanForm.interventionContext"
                          [name]="'worksitePreventionContext' + item.id"
                          rows="4"
                          placeholder="Contexte simple de l’intervention"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        ></textarea>
                      </label>

                      <label class="field field-wide">
                        <span>Points de vigilance</span>
                        <textarea
                          [(ngModel)]="worksitePreventionPlanForm.vigilancePoints"
                          [name]="'worksitePreventionVigilance' + item.id"
                          rows="5"
                          placeholder="Un point par ligne"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        ></textarea>
                      </label>

                      <label class="field field-wide">
                        <span>Mesures / consignes</span>
                        <textarea
                          [(ngModel)]="worksitePreventionPlanForm.measurePoints"
                          [name]="'worksitePreventionMeasures' + item.id"
                          rows="5"
                          placeholder="Une consigne par ligne"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        ></textarea>
                      </label>

                      <section class="document-preview field-wide" *ngIf="activeWorksitePreventionPlanPreview as preview">
                        <div class="document-preview-header">
                          <strong>Aperçu texte avant téléchargement</strong>
                          <p class="small">Relisez ici les éléments essentiels repris dans le PDF final.</p>
                        </div>

                        <div class="detail-grid">
                          <div class="detail-block">
                            <span class="small">Entreprise</span>
                            <strong>{{ preview.companyName }}</strong>
                          </div>

                          <div class="detail-block">
                            <span class="small">Date utile</span>
                            <strong>{{ preview.usefulDateLabel || "À préciser avant export" }}</strong>
                          </div>

                          <div class="detail-block">
                            <span class="small">Chantier</span>
                            <strong>{{ preview.worksiteName }}</strong>
                            <span>{{ preview.worksiteAddress }}</span>
                          </div>

                          <div class="detail-block">
                            <span class="small">Client / donneur d'ordre</span>
                            <strong>{{ preview.clientName || "À confirmer" }}</strong>
                            <span *ngIf="preview.additionalContact">
                              Contact utile complémentaire : {{ preview.additionalContact }}
                            </span>
                          </div>
                        </div>

                        <div class="detail-block">
                          <span class="small">Contexte d’intervention</span>
                          <span>{{ preview.interventionContext }}</span>
                        </div>

                        <div class="detail-grid">
                          <div class="detail-block">
                            <span class="small">Points de vigilance</span>
                            <ul class="detail-list" *ngIf="preview.vigilancePoints.length > 0; else noVigilancePreview">
                              <li *ngFor="let point of preview.vigilancePoints">{{ point }}</li>
                            </ul>
                            <ng-template #noVigilancePreview>
                              <span>Aucun point de vigilance saisi.</span>
                            </ng-template>
                          </div>

                          <div class="detail-block">
                            <span class="small">Mesures / consignes</span>
                            <ul class="detail-list" *ngIf="preview.measurePoints.length > 0; else noMeasuresPreview">
                              <li *ngFor="let point of preview.measurePoints">{{ point }}</li>
                            </ul>
                            <ng-template #noMeasuresPreview>
                              <span>Aucune mesure saisie.</span>
                            </ng-template>
                          </div>
                        </div>
                      </section>

                      <div class="form-actions inline-actions field-wide">
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id || !canResetWorksitePreventionPlanToInitial"
                          (click)="restoreInitialWorksitePreventionPlanForm()"
                        >
                          Revenir au préremplissage initial
                        </cfm-button>

                        <cfm-button
                          type="submit"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        >
                          {{
                            worksitePreventionPlanPdfBusyId === item.id
                              ? "Génération en cours"
                              : "Exporter le PDF"
                          }}
                        </cfm-button>

                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                          (click)="cancelWorksitePreventionPlanEditing()"
                        >
                          Annuler
                        </cfm-button>
                      </div>
                    </form>
                  </li>
                </ul>

                <ng-template #emptyWorksiteOverview>
                  <cfm-empty-state
                    [title]="hasActiveCoordinationFilters ? 'Aucun chantier pour ces filtres' : 'Aucun chantier à afficher'"
                    [description]="
                      hasActiveCoordinationFilters
                        ? 'Changez les filtres de coordination pour retrouver un chantier.'
                        : 'Les repères chantier apparaitront ici dès qu’ils seront disponibles.'
                    "
                  />
                </ng-template>
              </ng-container>

              <ng-template #chantierOverviewDisabled>
                <cfm-empty-state
                  title="Module Chantier non activé"
                  description="Activez le module Chantier pour afficher cette vue synthétique."
                />
              </ng-template>
            </section>

            <section class="dashboard-actions" id="worksite-documents-section">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Documents chantier</h3>
                  <p class="small">
                    Retrouvez rapidement les documents déjà générés pour un chantier, sans navigation documentaire
                    plus lourde.
                  </p>
                </div>

                <cfm-status-chip
                  [label]="worksiteDocumentCountLabel"
                  [tone]="filteredWorksiteDocumentItems.length > 0 ? 'calm' : 'neutral'"
                />
              </div>

              <ng-container *ngIf="isChantierEnabled; else chantierDocumentsDisabled">
                <div class="inline-actions">
                  <label class="compact-field" *ngIf="worksiteDocumentFilterOptions.length > 1">
                    <span class="small">Chantier</span>
                    <select [(ngModel)]="selectedWorksiteDocumentFilterId" name="worksiteDocumentFilterId">
                      <option value="all">Tous les chantiers</option>
                      <option *ngFor="let worksite of worksiteDocumentFilterOptions" [value]="worksite.id">
                        {{ worksite.name }}
                      </option>
                    </select>
                  </label>

                  <label class="compact-field" *ngIf="worksiteDocumentTypeFilterOptions.length > 1">
                    <span class="small">Type</span>
                    <select [(ngModel)]="selectedWorksiteDocumentTypeFilter" name="worksiteDocumentTypeFilter">
                      <option value="all">Tous les types</option>
                      <option *ngFor="let option of worksiteDocumentTypeFilterOptions" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <label class="compact-field">
                    <span class="small">Statut</span>
                    <select
                      [(ngModel)]="selectedWorksiteDocumentLifecycleFilter"
                      name="worksiteDocumentLifecycleFilter"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="draft">Brouillon</option>
                      <option value="finalized">Finalisé</option>
                    </select>
                  </label>

                  <label class="compact-field">
                    <span class="small">Suivi</span>
                    <select [(ngModel)]="selectedCoordinationStatusFilter" name="selectedCoordinationStatusFilterDocuments">
                      <option value="all">Tous les suivis</option>
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Fait</option>
                    </select>
                  </label>

                  <label class="compact-field">
                    <span class="small">Affectation</span>
                    <select [(ngModel)]="selectedCoordinationAssigneeFilter" name="selectedCoordinationAssigneeFilterDocuments">
                      <option value="all">Toutes les affectations</option>
                      <option value="unassigned">Non affecté</option>
                      <option *ngFor="let assignee of worksiteAssignees" [value]="assignee.user_id">
                        {{ getWorksiteAssigneeOptionLabel(assignee) }}
                      </option>
                    </select>
                  </label>

                  <cfm-button
                    *ngIf="hasActiveWorksiteDocumentFilters"
                    type="button"
                    variant="secondary"
                    (click)="resetWorksiteDocumentFilters()"
                  >
                    Réinitialiser les filtres
                  </cfm-button>
                </div>

                <ul class="stack-list" *ngIf="filteredWorksiteDocumentItems.length > 0; else emptyWorksiteDocuments">
                  <li *ngFor="let document of filteredWorksiteDocumentItems">
                    <div class="list-copy">
                      <strong>{{ document.title }}</strong>
                      <span>{{ document.worksiteName }} · {{ document.fileName }}</span>
                      <span>
                        Type : {{ document.typeLabel }} · Préparation : {{ document.lifecycleStatusLabel }} ·
                        {{ document.signatureStatusLabel }} · {{ document.proofCountLabel }}
                      </span>
                      <span>
                        Fichier : {{ document.fileAvailabilityLabel }}
                        <ng-container *ngIf="document.fileSizeLabel">
                          · {{ document.fileSizeLabel }}
                        </ng-container>
                      </span>
                      <span>
                        Coordination : {{ document.coordination.statusLabel }} ·
                        {{ document.coordination.assigneeLabel }}
                      </span>
                      <span *ngIf="document.coordination.commentText">{{ document.coordination.commentSummary }}</span>
                      <span *ngIf="document.uploadedAtLabel">
                        Dernière génération : {{ document.uploadedAtLabel }}
                      </span>
                      <span *ngIf="document.linkedSignatureLabel">
                        Signature liée : {{ document.linkedSignatureLabel }}
                        <ng-container *ngIf="document.linkedSignatureDetail">
                          · {{ document.linkedSignatureDetail }}
                        </ng-container>
                      </span>
                      <span *ngIf="document.linkedProofsSummary">
                        Preuves liées : {{ document.linkedProofsSummary }}
                      </span>
                      <span *ngIf="document.notes">{{ document.notes }}</span>
                    </div>

                    <div class="billing-item-actions">
                      <div class="chips">
                        <cfm-status-chip
                          [label]="document.lifecycleStatusLabel"
                          [tone]="document.lifecycleStatusTone"
                        />
                        <cfm-status-chip
                          [label]="document.technicalStatusLabel"
                          [tone]="document.technicalStatusTone"
                        />
                        <cfm-status-chip
                          [label]="document.fileAvailabilityLabel"
                          [tone]="document.fileAvailabilityTone"
                        />
                      </div>

                      <cfm-button
                        *ngIf="canReadOrganization"
                        type="button"
                        variant="secondary"
                        [disabled]="isWorksiteDocumentDownloadBusy(document)"
                        (click)="downloadWorksiteDocument(document)"
                      >
                        {{
                          isWorksiteDocumentDownloadBusy(document)
                            ? "Téléchargement en cours"
                            : getWorksiteDocumentActionLabel(document)
                        }}
                      </cfm-button>

                      <cfm-button
                        *ngIf="canAdjustWorksiteDocument(document)"
                        type="button"
                        variant="secondary"
                        [disabled]="worksitePreventionPlanPdfBusyId === document.worksiteId"
                        (click)="toggleWorksitePreventionPlanEditor(document.worksiteId)"
                      >
                        {{
                          worksitePreventionPlanEditingId === document.worksiteId
                            ? "Fermer l'ajustement"
                            : "Ajuster le plan"
                        }}
                      </cfm-button>

                      <cfm-button
                        type="button"
                        variant="secondary"
                        (click)="toggleWorksiteDocumentDetails(document.id)"
                      >
                        {{
                          selectedWorksiteDocumentDetailId === document.id
                            ? "Masquer les éléments liés"
                            : "Voir les éléments liés"
                        }}
                      </cfm-button>
                    </div>

                    <section
                      class="document-linked-panel"
                      *ngIf="selectedWorksiteDocumentDetailId === document.id"
                    >
                      <div class="detail-grid">
                        <div class="detail-block">
                          <span class="small">Suivi</span>
                          <strong>{{ document.coordination.statusLabel }}</strong>
                          <cfm-status-chip
                            [label]="document.coordination.statusLabel"
                            [tone]="document.coordination.statusTone"
                          />
                        </div>

                        <div class="detail-block">
                          <span class="small">Affectation</span>
                          <strong>{{ document.coordination.assigneeLabel }}</strong>
                          <span *ngIf="document.coordination.updatedAtLabel">
                            Dernière mise à jour : {{ document.coordination.updatedAtLabel }}
                          </span>
                        </div>
                      </div>

                      <div class="detail-block">
                        <span class="small">Commentaire simple</span>
                        <span>
                          {{ document.coordination.commentText || "Aucun commentaire simple pour le moment." }}
                        </span>
                      </div>

                      <div class="detail-grid" *ngIf="canManageOrganization">
                        <label class="field compact-field">
                          <span>Suivi</span>
                          <select
                            [ngModel]="getWorksiteDocumentCoordinationDraft(document.id).status"
                            [name]="'worksiteDocumentCoordinationStatus' + document.id"
                            [disabled]="worksiteDocumentCoordinationBusyId === document.id"
                            (ngModelChange)="updateWorksiteDocumentCoordinationDraft(document.id, { status: $event })"
                          >
                            <option value="todo">À faire</option>
                            <option value="in_progress">En cours</option>
                            <option value="done">Fait</option>
                          </select>
                        </label>

                        <label
                          class="field compact-field"
                          *ngIf="worksiteAssignees.length > 0; else noDocumentAssignees"
                        >
                          <span>Affectation</span>
                          <select
                            [ngModel]="getWorksiteDocumentCoordinationDraft(document.id).assigneeUserId"
                            [name]="'worksiteDocumentCoordinationAssignee' + document.id"
                            [disabled]="worksiteDocumentCoordinationBusyId === document.id"
                            (ngModelChange)="updateWorksiteDocumentCoordinationDraft(document.id, { assigneeUserId: $event })"
                          >
                            <option value="">Non affecté</option>
                            <option
                              *ngFor="let assignee of worksiteAssignees"
                              [value]="assignee.user_id"
                            >
                              {{ getWorksiteAssigneeOptionLabel(assignee) }}
                            </option>
                          </select>
                        </label>

                        <ng-template #noDocumentAssignees>
                          <div class="detail-block">
                            <span class="small">Affectation</span>
                            <span>Aucun membre lisible pour affecter ce document.</span>
                          </div>
                        </ng-template>
                      </div>

                      <label class="field field-wide" *ngIf="canManageOrganization">
                        <span>Commentaire simple</span>
                        <textarea
                          [ngModel]="getWorksiteDocumentCoordinationDraft(document.id).commentText"
                          [name]="'worksiteDocumentCoordinationComment' + document.id"
                          rows="3"
                          placeholder="Ex. relire avant envoi au client"
                          [disabled]="worksiteDocumentCoordinationBusyId === document.id"
                          (ngModelChange)="updateWorksiteDocumentCoordinationDraft(document.id, { commentText: $event })"
                        ></textarea>
                      </label>

                      <div class="inline-actions" *ngIf="canManageOrganization">
                        <cfm-button
                          type="button"
                          [disabled]="worksiteDocumentCoordinationBusyId === document.id"
                          (click)="saveWorksiteDocumentCoordination(document)"
                        >
                          {{
                            worksiteDocumentCoordinationBusyId === document.id
                              ? "Enregistrement en cours"
                              : "Enregistrer"
                          }}
                        </cfm-button>
                      </div>

                      <div class="detail-block" *ngIf="document.linkedSignature as signature; else noLinkedSignature">
                        <span class="small">Signature liée</span>
                        <strong>{{ signature.label }}</strong>
                        <span *ngIf="signature.detail">{{ signature.detail }}</span>
                        <cfm-status-chip [label]="signature.statusLabel" [tone]="signature.statusTone" />
                      </div>

                      <ng-template #noLinkedSignature>
                        <div class="detail-block">
                          <span class="small">Signature liée</span>
                          <span>Aucune signature liée.</span>
                        </div>
                      </ng-template>

                      <div class="detail-block">
                        <span class="small">Preuves liées</span>
                        <ul class="detail-list" *ngIf="document.linkedProofs.length > 0; else noLinkedProofs">
                          <li *ngFor="let proof of document.linkedProofs">
                            <strong>{{ proof.label }}</strong>
                            <span *ngIf="proof.detail">{{ proof.detail }}</span>
                            <cfm-status-chip [label]="proof.statusLabel" [tone]="proof.statusTone" />
                          </li>
                        </ul>
                        <ng-template #noLinkedProofs>
                          <span>Aucune preuve liée.</span>
                        </ng-template>
                      </div>
                    </section>
                  </li>
                </ul>

                <ng-template #emptyWorksiteDocuments>
                  <cfm-empty-state
                    title="Aucun document pour ce filtre"
                    description="Ajustez les filtres ou générez un document chantier pour le retrouver ici."
                  />
                </ng-template>
              </ng-container>

              <ng-template #chantierDocumentsDisabled>
                <cfm-empty-state
                  title="Module Chantier non activé"
                  description="Activez le module Chantier pour consulter les documents liés aux chantiers."
                />
              </ng-template>
            </section>

            <section class="dashboard-actions">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Vue par client</h3>
                  <p class="small">
                    Une lecture commerciale simple pour savoir quels clients demandent un suivi immédiat.
                  </p>
                </div>

                <cfm-status-chip
                  [label]="dashboardCustomerOverviewItems.length + ' client' + (dashboardCustomerOverviewItems.length > 1 ? 's' : '')"
                  [tone]="dashboardCustomerOverviewItems.length > 0 ? 'calm' : 'neutral'"
                />
              </div>

              <ng-container *ngIf="isFacturationEnabled; else customerOverviewDisabled">
                <ul class="alert-list" *ngIf="dashboardCustomerOverviewItems.length > 0; else emptyCustomerOverview">
                  <li *ngFor="let item of dashboardCustomerOverviewItems">
                    <div class="dashboard-alert-copy">
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.summary }}</span>
                      <span>{{ item.context }}</span>
                    </div>

                    <div class="billing-item-actions">
                      <div class="chips">
                        <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                        <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
                      </div>

                      <cfm-button
                        *ngIf="canManageOrganization && billingCustomers.length > 0"
                        type="button"
                        variant="secondary"
                        (click)="prepareQuoteFromCustomer(item.id)"
                      >
                        Préparer un devis
                      </cfm-button>

                      <cfm-button
                        *ngIf="canManageOrganization && billingCustomers.length > 0"
                        type="button"
                        variant="secondary"
                        (click)="prepareInvoiceFromCustomer(item.id)"
                      >
                        Préparer une facture
                      </cfm-button>
                    </div>
                  </li>
                </ul>

                <ng-template #emptyCustomerOverview>
                  <cfm-empty-state
                    title="Aucun client à suivre"
                    description="Les clients demandant un suivi apparaitront ici dès qu’un repère remonte."
                  />
                </ng-template>
              </ng-container>

              <ng-template #customerOverviewDisabled>
                <cfm-empty-state
                  title="Module Facturation non activé"
                  description="Activez le module Facturation pour afficher cette lecture client."
                />
              </ng-template>
            </section>
          </cfm-card>

          <ng-container *ngIf="currentMembership" [ngTemplateOutlet]="homeAdministrationCardTemplate"></ng-container>

          <cfm-card
            *ngIf="currentMembership"
            class="desktop-card"
            eyebrow="S7-021"
            title="Donner un retour"
            description="Un format court pour remonter un blocage, une incompréhension ou une amélioration sans outil de support dédié."
          >
            <form class="feedback-capture-form" (ngSubmit)="copyBetaFeedback()">
              <div class="inline-actions">
                <label class="field compact-field">
                  <span>Type de retour</span>
                  <select [(ngModel)]="betaFeedbackCategory" name="betaFeedbackCategory">
                    <option value="blocking">Bloquant</option>
                    <option value="unclear">Incompréhension</option>
                    <option value="improvement">Amélioration</option>
                    <option value="positive">Retour positif</option>
                  </select>
                </label>

                <label class="field compact-field">
                  <span>Zone concernée</span>
                  <select [(ngModel)]="betaFeedbackArea" name="betaFeedbackArea">
                    <option value="cockpit">Cockpit</option>
                    <option value="worksite">Chantier</option>
                    <option value="worksite_document">Documents chantier</option>
                    <option value="facturation">Facturation</option>
                    <option value="reglementation">Réglementation</option>
                    <option value="sync">Synchronisation visible</option>
                    <option value="other">Autre</option>
                  </select>
                </label>
              </div>

              <label class="field field-wide">
                <span>Message libre court</span>
                <textarea
                  [(ngModel)]="betaFeedbackMessageText"
                  name="betaFeedbackMessageText"
                  rows="4"
                  placeholder="Ex. Je ne comprends pas si le document chantier est prêt ou encore en préparation."
                ></textarea>
              </label>

              <p class="small">
                Le retour est préparé dans un format simple à coller ensuite dans votre canal beta ou pilote
                habituel.
              </p>

              <div class="form-actions inline-actions">
                <cfm-button type="submit" [disabled]="betaFeedbackCopyBusy || !canCopyBetaFeedback">
                  {{ betaFeedbackCopyBusy ? "Copie en cours" : "Copier le retour" }}
                </cfm-button>

                <cfm-button
                  type="button"
                  variant="secondary"
                  [disabled]="betaFeedbackCopyBusy || !hasBetaFeedbackDraft"
                  (click)="resetBetaFeedback()"
                >
                  Effacer
                </cfm-button>
              </div>
            </form>

            <p class="feedback error" *ngIf="betaFeedbackError">{{ betaFeedbackError }}</p>
            <p class="feedback success" *ngIf="betaFeedbackNotice && !betaFeedbackError">{{ betaFeedbackNotice }}</p>

            <section class="document-preview" *ngIf="hasBetaFeedbackDraft">
              <div class="document-preview-header">
                <strong>Aperçu du retour</strong>
                <span class="small">La date et l’organisation seront ajoutées lors de la copie.</span>
              </div>
              <pre class="feedback-preview-text">{{ betaFeedbackPreviewText }}</pre>
            </section>
          </cfm-card>
          </ng-template>

          <ng-template #reglementationPageTemplate>
          <cfm-card
            *ngIf="shouldShowInitialWorkspaceLoading"
            class="desktop-card"
            eyebrow="Réglementation"
            title="Chargement en cours"
            description="Le profil entreprise et les sites sont en train d’être chargés."
          >
            <div class="loading-state-card">
              <div class="loading-state-skeleton" aria-hidden="true">
                <div class="loading-state-hero"></div>
                <div class="loading-state-grid">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="loading-state-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="loading-state-copy">
                <p class="loading-state-label">Mise à jour en cours</p>
                <p class="small">Les données réglementaires restent en préparation.</p>
              </div>
            </div>
          </cfm-card>

          <cfm-card
            *ngIf="shouldShowWorkspaceContent && currentMembership && !isReglementationEnabled"
            class="desktop-card"
            eyebrow="Réglementation"
            title="Module non activé"
            description="Activez le module Réglementation pour initialiser l’entreprise et déclarer ses premiers sites."
          >
            <cfm-empty-state
              title="Rien d’autre à remplir pour le moment"
              description="Le parcours d’onboarding entreprise apparaitra ici dès que le module sera activé."
            />
          </cfm-card>

          <ng-container *ngIf="shouldShowWorkspaceContent && currentMembership && isReglementationEnabled">
            <cfm-card
              *ngIf="isOnboardingPending"
              class="desktop-card"
              eyebrow="S2-001"
              title="Onboarding entreprise"
              description="Quelques informations essentielles pour démarrer sans jargon réglementaire ni formulaire intimidant."
            >
              <div class="chips">
                <cfm-status-chip label="Étape 1 sur 2" tone="progress" />
                <cfm-status-chip label="Essentiel uniquement" tone="calm" />
              </div>

              <form class="profile-form" (ngSubmit)="completeOnboarding()">
                <cfm-input
                  [(ngModel)]="profileForm.name"
                  name="onboardingName"
                  type="text"
                  label="Nom de l’entreprise"
                  placeholder="Ex. Conforméo Services"
                  required
                />

                <cfm-input
                  [(ngModel)]="profileForm.activityLabel"
                  name="onboardingActivity"
                  type="text"
                  label="Activité principale"
                  placeholder="Ex. maintenance multitechnique"
                  required
                />

                <label class="field">
                  <span>Présence de salariés</span>
                  <select [(ngModel)]="profileForm.hasEmployees" name="onboardingHasEmployees" required>
                    <option value="">Choisir</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="profileForm.employeeCount"
                  name="onboardingEmployeeCount"
                  type="number"
                  label="Effectif"
                  placeholder="Ex. 12"
                />

                <cfm-input
                  [(ngModel)]="profileForm.contactEmail"
                  name="onboardingContactEmail"
                  type="email"
                  label="Email de contact"
                  placeholder="contact@entreprise.fr"
                  required
                />

                <div class="form-actions">
                  <cfm-button type="submit" [disabled]="organizationProfileSaving || !canSubmitOnboarding">
                    {{ organizationProfileSaving ? "Initialisation en cours" : "Initialiser l’entreprise" }}
                  </cfm-button>
                </div>
              </form>
            </cfm-card>

            <cfm-card
              class="desktop-card"
              eyebrow="S2-002"
              title="Profil entreprise"
              description="Un profil clair et exploitable, avec seulement les informations utiles au périmètre réglementaire V1."
            >
              <div class="chips" *ngIf="organizationProfile">
                <cfm-status-chip
                  [label]="isOnboardingPending ? 'Onboarding à finaliser' : 'Profil initialisé'"
                  [tone]="isOnboardingPending ? 'progress' : 'success'"
                />
                <cfm-status-chip
                  [label]="organizationProfile.has_employees === true ? 'Avec salariés' : organizationProfile.has_employees === false ? 'Sans salariés' : 'Salariés à préciser'"
                  [tone]="organizationProfile.has_employees === true ? 'success' : organizationProfile.has_employees === false ? 'calm' : 'warning'"
                />
              </div>

              <form class="profile-form" (ngSubmit)="saveProfile()" *ngIf="organizationProfile">
                <cfm-input
                  [(ngModel)]="profileForm.name"
                  name="profileName"
                  type="text"
                  label="Nom de l’entreprise"
                  placeholder="Nom affiché dans la plateforme"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="profileForm.legalName"
                  name="profileLegalName"
                  type="text"
                  label="Raison sociale"
                  placeholder="Ex. Conforméo SAS"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <cfm-input
                  [(ngModel)]="profileForm.activityLabel"
                  name="profileActivity"
                  type="text"
                  label="Activité"
                  placeholder="Ex. maintenance, exploitation, travaux"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <cfm-input
                  [(ngModel)]="profileForm.employeeCount"
                  name="profileEmployeeCount"
                  type="number"
                  label="Effectif"
                  placeholder="Ex. 12"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <label class="field">
                  <span>Présence de salariés</span>
                  <select
                    [(ngModel)]="profileForm.hasEmployees"
                    name="profileHasEmployees"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  >
                    <option value="">À préciser</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="profileForm.contactEmail"
                  name="profileContactEmail"
                  type="email"
                  label="Email de contact"
                  placeholder="contact@entreprise.fr"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <cfm-input
                  [(ngModel)]="profileForm.contactPhone"
                  name="profileContactPhone"
                  type="tel"
                  label="Téléphone"
                  placeholder="Ex. 04 78 00 00 00"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <label class="field field-wide">
                  <span>Adresse principale</span>
                  <textarea
                    [(ngModel)]="profileForm.headquartersAddress"
                    name="profileHeadquartersAddress"
                    rows="3"
                    placeholder="Adresse utile pour le périmètre réglementaire"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  ></textarea>
                </label>

                <label class="field field-wide">
                  <span>Informations utiles</span>
                  <textarea
                    [(ngModel)]="profileForm.notes"
                    name="profileNotes"
                    rows="4"
                    placeholder="Précisions utiles pour la suite du périmètre réglementaire"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  ></textarea>
                </label>

                <div class="form-actions">
                  <cfm-button type="submit" [disabled]="!canManageOrganization || organizationProfileSaving">
                    {{ organizationProfileSaving ? "Enregistrement en cours" : "Enregistrer le profil" }}
                  </cfm-button>
                </div>
              </form>
            </cfm-card>

            <cfm-card
              *ngIf="organizationProfile && !isOnboardingPending"
              class="desktop-card"
              eyebrow="S2-005"
              title="Questionnaire réglementaire court"
              description="Trois questions courtes pour affiner le profil réglementaire sans vous demander d'expertise juridique."
            >
              <div class="chips">
                <cfm-status-chip label="3 questions utiles" tone="calm" />
                <cfm-status-chip
                  [label]="isQualificationQuestionnaireComplete ? 'Questionnaire complété' : 'Questionnaire à compléter'"
                  [tone]="isQualificationQuestionnaireComplete ? 'success' : 'progress'"
                />
              </div>

              <p class="small">
                Ces réponses améliorent la lecture du périmètre réglementaire. Si vous laissez un point à préciser,
                le moteur reste volontairement prudent.
              </p>

              <form class="profile-form" (ngSubmit)="saveQualificationQuestionnaire()">
                <label class="field">
                  <span>Recevez-vous du public ou des clients sur au moins un site ?</span>
                  <select
                    [(ngModel)]="profileForm.receivesPublic"
                    name="qualificationReceivesPublic"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  >
                    <option value="">À préciser</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <label class="field">
                  <span>Stockez-vous des produits ou matériels sensibles sur site ?</span>
                  <select
                    [(ngModel)]="profileForm.storesHazardousProducts"
                    name="qualificationStoresHazardousProducts"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  >
                    <option value="">À préciser</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <label class="field">
                  <span>Réalisez-vous des interventions terrain à risque ?</span>
                  <select
                    [(ngModel)]="profileForm.performsHighRiskWork"
                    name="qualificationPerformsHighRiskWork"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  >
                    <option value="">À préciser</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <div class="form-actions">
                  <cfm-button type="submit" [disabled]="!canManageOrganization || organizationProfileSaving">
                    {{ organizationProfileSaving ? "Enregistrement en cours" : "Enregistrer le questionnaire" }}
                  </cfm-button>
                </div>
              </form>
            </cfm-card>

            <cfm-card
              class="desktop-card"
              eyebrow="S2-003"
              title="Sites et bâtiments"
              description="Une structure simple de sites rattachés à l’entreprise pour préparer le futur périmètre réglementaire."
            >
              <form class="site-form" (ngSubmit)="createSite()">
                <cfm-input
                  [(ngModel)]="siteForm.name"
                  name="siteName"
                  type="text"
                  label="Nom du site ou bâtiment"
                  placeholder="Ex. Siège Lyon Carnot"
                  [disabled]="!canManageOrganization || organizationSiteSaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="siteForm.address"
                  name="siteAddress"
                  type="text"
                  label="Adresse"
                  placeholder="Ex. 12 rue Carnot, 69002 Lyon"
                  [disabled]="!canManageOrganization || organizationSiteSaving"
                  required
                />

                <label class="field">
                  <span>Type</span>
                  <select
                    [(ngModel)]="siteForm.siteType"
                    name="siteType"
                    [disabled]="!canManageOrganization || organizationSiteSaving"
                  >
                    <option value="site">Site</option>
                    <option value="building">Bâtiment</option>
                    <option value="office">Bureau</option>
                    <option value="warehouse">Entrepôt</option>
                  </select>
                </label>

                <div class="form-actions">
                  <cfm-button type="submit" [disabled]="!canManageOrganization || organizationSiteSaving || !canCreateSite">
                    {{ organizationSiteSaving ? "Création en cours" : "Ajouter le site" }}
                  </cfm-button>
                </div>
              </form>

              <ul class="site-list" *ngIf="organizationSites.length > 0; else emptySites">
                <li *ngFor="let site of organizationSites">
                  <div class="site-copy">
                    <div class="site-heading">
                      <strong>{{ site.name }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getSiteTypeLabel(site.site_type)" tone="calm" />
                        <cfm-status-chip
                          [label]="site.status === 'active' ? 'Actif' : 'Archivé'"
                          [tone]="site.status === 'active' ? 'success' : 'neutral'"
                        />
                      </div>
                    </div>
                    <span>{{ site.address }}</span>
                  </div>

                  <cfm-button
                    *ngIf="canManageOrganization"
                    type="button"
                    variant="secondary"
                    [disabled]="organizationSiteStatusBusyId === site.id"
                    (click)="toggleSiteStatus(site)"
                  >
                    {{
                      organizationSiteStatusBusyId === site.id
                        ? "Mise à jour en cours"
                        : site.status === 'active'
                          ? "Archiver"
                          : "Réactiver"
                    }}
                  </cfm-button>
                </li>
              </ul>

              <ng-template #emptySites>
                <cfm-empty-state
                  title="Aucun site déclaré"
                  description="Ajoutez un premier site ou bâtiment pour structurer progressivement l’entreprise."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              class="desktop-card"
              eyebrow="S2-012 · S2-013 · S2-014"
              title="Sécurité bâtiment"
              description="Un suivi simple des extincteurs, DAE et contrôles périodiques, avec alertes claires et vue filtrée par site."
            >
              <div class="building-safety-header">
                <div class="chips">
                  <cfm-status-chip
                    [label]="getBuildingSafetySummaryLabel('overdue')"
                    [tone]="buildingSafetyOverdueCount > 0 ? 'warning' : 'neutral'"
                  />
                  <cfm-status-chip
                    [label]="getBuildingSafetySummaryLabel('due_soon')"
                    [tone]="buildingSafetyDueSoonCount > 0 ? 'progress' : 'neutral'"
                  />
                  <cfm-status-chip
                    [label]="getBuildingSafetySummaryLabel('ok')"
                    [tone]="buildingSafetyOkCount > 0 ? 'success' : 'neutral'"
                  />
                </div>

                <label class="organization-switch">
                  <span>Vue par site</span>
                  <select
                    [(ngModel)]="selectedSafetySiteId"
                    name="selectedSafetySiteId"
                    (change)="handleSiteFilterChange()"
                  >
                    <option value="all">Tous les sites</option>
                    <option *ngFor="let site of organizationSites" [value]="site.id">
                      {{ site.name }}
                    </option>
                  </select>
                </label>
              </div>

              <ul
                class="alert-list"
                *ngIf="filteredBuildingSafetyAlerts.length > 0; else noBuildingSafetyAlerts"
              >
                <li *ngFor="let alert of filteredBuildingSafetyAlerts">
                  <div class="list-copy">
                    <strong>{{ alert.item_name }}</strong>
                    <span>{{ alert.site_name }} · {{ alert.message }}</span>
                  </div>
                  <cfm-status-chip
                    [label]="alert.alert_type === 'overdue' ? 'En retard' : 'Échéance proche'"
                    [tone]="alert.alert_type === 'overdue' ? 'warning' : 'progress'"
                  />
                </li>
              </ul>

              <ng-template #noBuildingSafetyAlerts>
                <cfm-empty-state
                  title="Aucune alerte sur ce filtre"
                  description="Les alertes sécurité bâtiment apparaitront ici dès qu’un contrôle demande une action."
                />
              </ng-template>

              <form class="building-safety-form" (ngSubmit)="saveBuildingSafetyItem()">
                <label class="field">
                  <span>Site ou bâtiment</span>
                  <select
                    [(ngModel)]="buildingSafetyForm.siteId"
                    name="buildingSafetySiteId"
                    [disabled]="!canManageOrganization || buildingSafetySaving || isBuildingSafetyEditing"
                    required
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let site of activeOrganizationSites" [value]="site.id">
                      {{ site.name }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span>Élément</span>
                  <select
                    [(ngModel)]="buildingSafetyForm.itemType"
                    name="buildingSafetyItemType"
                    [disabled]="!canManageOrganization || buildingSafetySaving || isBuildingSafetyEditing"
                  >
                    <option value="fire_extinguisher">Extincteur</option>
                    <option value="dae">DAE</option>
                    <option value="periodic_check">Contrôle périodique</option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="buildingSafetyForm.name"
                  name="buildingSafetyName"
                  type="text"
                  label="Nom ou repère"
                  placeholder="Ex. Extincteur hall d’accueil"
                  [disabled]="!canManageOrganization || buildingSafetySaving || isBuildingSafetyEditing"
                  required
                />

                <cfm-input
                  [(ngModel)]="buildingSafetyForm.nextDueDate"
                  name="buildingSafetyNextDueDate"
                  type="date"
                  label="Prochaine échéance"
                  [disabled]="!canManageOrganization || buildingSafetySaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="buildingSafetyForm.lastCheckedAt"
                  name="buildingSafetyLastCheckedAt"
                  type="date"
                  label="Dernier contrôle"
                  [disabled]="!canManageOrganization || buildingSafetySaving"
                />

                <label class="field" *ngIf="isBuildingSafetyEditing">
                  <span>Statut</span>
                  <select
                    [(ngModel)]="buildingSafetyForm.status"
                    name="buildingSafetyStatus"
                    [disabled]="!canManageOrganization || buildingSafetySaving"
                  >
                    <option value="active">Actif</option>
                    <option value="archived">Archivé</option>
                  </select>
                </label>

                <label class="field field-wide">
                  <span>Note utile</span>
                  <textarea
                    [(ngModel)]="buildingSafetyForm.notes"
                    name="buildingSafetyNotes"
                    rows="3"
                    placeholder="Ex. vérification annuelle à anticiper avant l’été"
                    [disabled]="!canManageOrganization || buildingSafetySaving"
                  ></textarea>
                </label>

                <p class="small" *ngIf="isBuildingSafetyEditing">
                  Mettez à jour l’échéance ou le dernier contrôle sans changer le rattachement du site.
                </p>

                <div class="form-actions inline-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!canManageOrganization || buildingSafetySaving || !canCreateBuildingSafetyItem"
                  >
                    {{
                      buildingSafetySaving
                        ? (isBuildingSafetyEditing ? "Enregistrement en cours" : "Ajout en cours")
                        : (isBuildingSafetyEditing ? "Enregistrer les changements" : "Ajouter l’élément")
                    }}
                  </cfm-button>

                  <cfm-button
                    *ngIf="isBuildingSafetyEditing"
                    type="button"
                    variant="secondary"
                    [disabled]="buildingSafetySaving"
                    (click)="cancelBuildingSafetyEditing()"
                  >
                    Annuler
                  </cfm-button>
                </div>
              </form>

              <ul
                class="building-safety-list"
                *ngIf="filteredBuildingSafetyItems.length > 0; else emptyBuildingSafetyItems"
              >
                <li *ngFor="let item of filteredBuildingSafetyItems">
                  <div class="building-safety-copy">
                    <div class="site-heading">
                      <strong>{{ item.name }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getBuildingSafetyTypeLabel(item.item_type)" tone="calm" />
                        <cfm-status-chip
                          [label]="getBuildingSafetyAlertStatusLabel(item.alert_status)"
                          [tone]="getBuildingSafetyAlertStatusTone(item.alert_status)"
                        />
                        <cfm-status-chip
                          *ngIf="selectedSafetySiteId === 'all'"
                          [label]="item.site_name"
                          tone="neutral"
                        />
                      </div>
                    </div>
                    <span>Échéance : {{ item.next_due_date }}</span>
                    <span *ngIf="item.last_checked_at">Dernier contrôle : {{ item.last_checked_at }}</span>
                    <span *ngIf="item.notes">{{ item.notes }}</span>
                  </div>

                  <div class="inline-actions" *ngIf="canManageOrganization">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="buildingSafetySaving || buildingSafetyStatusBusyId === item.id"
                      (click)="startEditingBuildingSafetyItem(item)"
                    >
                      Modifier
                    </cfm-button>
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="buildingSafetySaving || buildingSafetyStatusBusyId === item.id"
                      (click)="toggleBuildingSafetyItemStatus(item)"
                    >
                      {{
                        buildingSafetyStatusBusyId === item.id
                          ? "Mise à jour en cours"
                          : item.status === 'active'
                            ? "Archiver"
                            : "Réactiver"
                      }}
                    </cfm-button>
                  </div>
                </li>
              </ul>

              <ng-template #emptyBuildingSafetyItems>
                <cfm-empty-state
                  title="Aucun élément sécurité déclaré"
                  description="Ajoutez un extincteur, un DAE ou un contrôle périodique pour commencer un suivi bâtiment très simple."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              class="desktop-card"
              eyebrow="S2-004 · S2-010 · S2-011"
              title="Obligations à préparer"
              description="Une première lecture utile du périmètre réglementaire, basée sur le profil entreprise et les sites déclarés. Ce n’est pas un avis juridique."
            >
              <div class="card-header-actions">
                <div class="chips" *ngIf="regulatoryProfile">
                  <cfm-status-chip
                    [label]="regulatoryProfile.profile_status === 'ready' ? 'Profil exploitable' : 'Profil à compléter'"
                    [tone]="regulatoryProfile.profile_status === 'ready' ? 'success' : 'progress'"
                  />
                  <cfm-status-chip
                    [label]="getObligationCountLabel()"
                    [tone]="(regulatoryProfile.applicable_obligations.length ?? 0) > 0 ? 'calm' : 'neutral'"
                  />
                </div>

                <cfm-button
                  type="button"
                  variant="secondary"
                  [disabled]="!canReadOrganization || regulatoryExporting"
                  (click)="exportRegulatoryPdf()"
                >
                  {{ regulatoryExporting ? "Génération en cours" : "Exporter le PDF" }}
                </cfm-button>
              </div>

              <p class="small" *ngIf="regulatoryProfile?.missing_profile_items?.length">
                Pour affiner cette lecture, complétez :
                {{ regulatoryProfile?.missing_profile_items?.join(", ") }}.
              </p>

              <div class="chips criteria-chips" *ngIf="regulatoryProfile">
                <cfm-status-chip
                  *ngFor="let criterion of regulatoryProfile.criteria"
                  [label]="criterion.summary"
                  [tone]="getCriterionTone(criterion.value)"
                />
              </div>

              <ul
                class="obligation-list"
                *ngIf="regulatoryProfile && regulatoryProfile.applicable_obligations.length > 0; else emptyObligations"
              >
                <li *ngFor="let obligation of regulatoryProfile.applicable_obligations">
                  <div class="obligation-copy">
                    <div class="obligation-heading">
                      <strong>{{ obligation.title }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getObligationCategoryLabel(obligation.category)" tone="calm" />
                        <cfm-status-chip
                          [label]="getObligationPriorityLabel(obligation.priority)"
                          [tone]="getObligationPriorityTone(obligation.priority)"
                        />
                        <cfm-status-chip
                          [label]="getComplianceStatusLabel(obligation.status)"
                          [tone]="getComplianceStatusTone(obligation.status)"
                        />
                      </div>
                    </div>
                    <span>{{ obligation.description }}</span>
                    <p class="small">{{ obligation.reason_summary }}</p>
                    <div class="inline-actions">
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="selectedObligationId === obligation.id"
                        (click)="openObligationDetail(obligation.id)"
                      >
                        {{ selectedObligationId === obligation.id ? "Fiche ouverte" : "Ouvrir la fiche" }}
                      </cfm-button>
                    </div>
                  </div>
                </li>
              </ul>

              <article class="obligation-detail" *ngIf="selectedRegulatoryObligation as selectedObligation">
                <div class="obligation-heading">
                  <div class="detail-copy">
                    <h3>{{ selectedObligation.title }}</h3>
                    <p>{{ selectedObligation.description }}</p>
                  </div>
                  <div class="chips">
                    <cfm-status-chip
                      [label]="getObligationPriorityLabel(selectedObligation.priority)"
                      [tone]="getObligationPriorityTone(selectedObligation.priority)"
                    />
                    <cfm-status-chip
                      [label]="getComplianceStatusLabel(selectedObligation.status)"
                      [tone]="getComplianceStatusTone(selectedObligation.status)"
                    />
                    <cfm-status-chip
                      [label]="selectedObligationEvidences.length + ' preuve' + (selectedObligationEvidences.length > 1 ? 's' : '')"
                      [tone]="selectedObligationEvidences.length > 0 ? 'success' : 'neutral'"
                    />
                  </div>
                </div>

                <div class="detail-grid">
                  <section class="detail-block">
                    <h3>Pourquoi elle s'applique</h3>
                    <p>{{ selectedObligation.reason_summary }}</p>
                    <ul class="detail-list" *ngIf="selectedObligationCriteria.length > 0">
                      <li *ngFor="let criterion of selectedObligationCriteria">{{ criterion.summary }}</li>
                    </ul>
                  </section>

                  <section class="detail-block">
                    <h3>Première action conseillée</h3>
                    <p>{{ getObligationFirstAction(selectedObligation, selectedObligationEvidences.length) }}</p>
                  </section>
                </div>

                <section class="detail-block">
                  <h3>Pièces déjà rattachées</h3>
                  <ul class="detail-list" *ngIf="selectedObligationEvidences.length > 0; else emptyObligationEvidences">
                    <li *ngFor="let evidence of selectedObligationEvidences">
                      <div class="detail-evidence-row">
                        <div class="detail-copy">
                          <strong>{{ evidence.file_name }}</strong>
                          <span>{{ evidence.document_type }} · {{ getDocumentStatusLabel(evidence.status) }}</span>
                          <span *ngIf="evidence.uploaded_at">Ajouté le {{ evidence.uploaded_at | date:'shortDate' }}</span>
                          <span *ngIf="evidence.notes">{{ evidence.notes }}</span>
                        </div>
                        <cfm-status-chip
                          [label]="getDocumentStatusLabel(evidence.status)"
                          [tone]="getDocumentStatusTone(evidence.status)"
                        />
                      </div>
                    </li>
                  </ul>

                  <ng-template #emptyObligationEvidences>
                    <p class="small">
                      Aucune pièce n'est encore rattachée directement à cette obligation.
                    </p>
                  </ng-template>
                </section>
              </article>

              <ng-template #emptyObligations>
                <cfm-empty-state
                  title="Aucune obligation V1 détectée pour l’instant"
                  description="Complétez le profil ou ajoutez un site pour affiner le premier périmètre réglementaire."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              class="desktop-card"
              eyebrow="S2-020"
              title="DUERP simplifié"
              description="Une base claire pour recenser quelques unités de travail, risques et actions de prévention sans jargon HSE."
            >
              <div class="chips">
                <cfm-status-chip
                  [label]="filteredDuerpEntries.length + ' risque' + (filteredDuerpEntries.length > 1 ? 's' : '')"
                  [tone]="filteredDuerpEntries.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="duerpEditingId ? 'Modification en cours' : 'Saisie progressive'"
                  [tone]="duerpEditingId ? 'progress' : 'neutral'"
                />
              </div>

              <form class="duerp-form" (ngSubmit)="saveDuerpEntry()">
                <label class="field">
                  <span>Site ou bâtiment</span>
                  <select
                    [(ngModel)]="duerpForm.siteId"
                    name="duerpSiteId"
                    [disabled]="!canManageOrganization || duerpSaving"
                  >
                    <option value="">Entreprise / transversal</option>
                    <option *ngFor="let site of activeOrganizationSites" [value]="site.id">
                      {{ site.name }}
                    </option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="duerpForm.workUnitName"
                  name="duerpWorkUnitName"
                  type="text"
                  label="Unité de travail"
                  placeholder="Ex. intervention en hauteur"
                  [disabled]="!canManageOrganization || duerpSaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="duerpForm.riskLabel"
                  name="duerpRiskLabel"
                  type="text"
                  label="Risque identifié"
                  placeholder="Ex. chute lors d’une maintenance"
                  [disabled]="!canManageOrganization || duerpSaving"
                  required
                />

                <label class="field">
                  <span>Gravité</span>
                  <select
                    [(ngModel)]="duerpForm.severity"
                    name="duerpSeverity"
                    [disabled]="!canManageOrganization || duerpSaving"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </label>

                <label class="field field-wide">
                  <span>Action de prévention</span>
                  <textarea
                    [(ngModel)]="duerpForm.preventionAction"
                    name="duerpPreventionAction"
                    rows="3"
                    placeholder="Ex. balisage, EPI, vérification avant intervention"
                    [disabled]="!canManageOrganization || duerpSaving"
                  ></textarea>
                </label>

                <div class="form-actions inline-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!canManageOrganization || duerpSaving || !canSaveDuerpEntry"
                  >
                    {{
                      duerpSaving
                        ? (duerpEditingId ? "Enregistrement en cours" : "Ajout en cours")
                        : (duerpEditingId ? "Enregistrer les changements" : "Ajouter le risque")
                    }}
                  </cfm-button>

                  <cfm-button
                    *ngIf="duerpEditingId"
                    type="button"
                    variant="secondary"
                    [disabled]="duerpSaving"
                    (click)="cancelDuerpEditing()"
                  >
                    Annuler
                  </cfm-button>
                </div>
              </form>

              <ul class="duerp-list" *ngIf="filteredDuerpEntries.length > 0; else emptyDuerpEntries">
                <li *ngFor="let entry of filteredDuerpEntries">
                  <div class="duerp-copy">
                    <div class="site-heading">
                      <strong>{{ entry.risk_label }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getDuerpSeverityLabel(entry.severity)" [tone]="getDuerpSeverityTone(entry.severity)" />
                        <cfm-status-chip [label]="entry.status === 'active' ? 'Actif' : 'Archivé'" [tone]="entry.status === 'active' ? 'success' : 'neutral'" />
                        <cfm-status-chip [label]="getComplianceStatusLabel(entry.compliance_status)" [tone]="getComplianceStatusTone(entry.compliance_status)" />
                        <cfm-status-chip
                          *ngIf="selectedSafetySiteId === 'all'"
                          [label]="entry.site_name ?? 'Entreprise'"
                          tone="neutral"
                        />
                      </div>
                    </div>
                    <span>Unité de travail : {{ entry.work_unit_name }}</span>
                    <span *ngIf="entry.prevention_action">Prévention : {{ entry.prevention_action }}</span>
                    <span *ngIf="entry.proof_count > 0">
                      {{ entry.proof_count }} pièce{{ entry.proof_count > 1 ? "s" : "" }} justificative{{ entry.proof_count > 1 ? "s" : "" }}
                    </span>
                  </div>

                  <div class="inline-actions" *ngIf="canManageOrganization">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="duerpStatusBusyId === entry.id"
                      (click)="startEditingDuerpEntry(entry)"
                    >
                      Modifier
                    </cfm-button>
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="duerpStatusBusyId === entry.id"
                      (click)="toggleDuerpEntryStatus(entry)"
                    >
                      {{
                        duerpStatusBusyId === entry.id
                          ? "Mise à jour en cours"
                          : entry.status === 'active'
                            ? "Archiver"
                            : "Réactiver"
                      }}
                    </cfm-button>
                  </div>
                </li>
              </ul>

              <ng-template #emptyDuerpEntries>
                <cfm-empty-state
                  title="Aucun risque DUERP saisi"
                  description="Ajoutez quelques risques simples pour constituer une première base DUERP exploitable."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              class="desktop-card"
              eyebrow="S2-021 · S2-022"
              title="Pièces justificatives et conformité"
              description="Ajoutez des preuves réglementaires simples et visualisez un statut de conformité lisible dans l’espace bureau."
            >
              <form class="evidence-form" (ngSubmit)="createEvidence()">
                <label class="field">
                  <span>Rattacher à</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.linkKind"
                    name="evidenceLinkKind"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="obligation">Obligation</option>
                    <option value="site">Site / bâtiment</option>
                    <option value="building_safety_item">Élément sécurité</option>
                    <option value="duerp_entry">Entrée DUERP</option>
                  </select>
                </label>

                <label class="field" *ngIf="regulatoryEvidenceForm.linkKind === 'obligation'">
                  <span>Obligation concernée</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.obligationId"
                    name="evidenceObligationId"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let obligation of regulatoryProfile?.applicable_obligations ?? []" [value]="obligation.id">
                      {{ obligation.title }}
                    </option>
                  </select>
                </label>

                <label class="field" *ngIf="regulatoryEvidenceForm.linkKind === 'site'">
                  <span>Site / bâtiment</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.siteId"
                    name="evidenceSiteId"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let site of activeOrganizationSites" [value]="site.id">
                      {{ site.name }}
                    </option>
                  </select>
                </label>

                <label class="field" *ngIf="regulatoryEvidenceForm.linkKind === 'building_safety_item'">
                  <span>Élément sécurité</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.buildingSafetyItemId"
                    name="evidenceBuildingSafetyItemId"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let item of selectableBuildingSafetyItems" [value]="item.id">
                      {{ item.name }}{{ item.site_name ? " · " + item.site_name : "" }}
                    </option>
                  </select>
                </label>

                <label class="field" *ngIf="regulatoryEvidenceForm.linkKind === 'duerp_entry'">
                  <span>Entrée DUERP</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.duerpEntryId"
                    name="evidenceDuerpEntryId"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let entry of selectableDuerpEntries" [value]="entry.id">
                      {{ entry.risk_label }}{{ entry.site_name ? " · " + entry.site_name : "" }}
                    </option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="regulatoryEvidenceForm.fileName"
                  name="evidenceFileName"
                  type="text"
                  label="Nom du justificatif"
                  placeholder="Ex. attestation controle-extincteur-2026.pdf"
                  [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="regulatoryEvidenceForm.documentType"
                  name="evidenceDocumentType"
                  type="text"
                  label="Type"
                  placeholder="Ex. attestation"
                  [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  required
                />

                <label class="field field-wide">
                  <span>Note utile</span>
                  <textarea
                    [(ngModel)]="regulatoryEvidenceForm.notes"
                    name="evidenceNotes"
                    rows="3"
                    placeholder="Ex. justificatif ajouté après le dernier contrôle"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  ></textarea>
                </label>

                <div class="form-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving || !canCreateRegulatoryEvidence"
                  >
                    {{ regulatoryEvidenceSaving ? "Ajout en cours" : "Ajouter la pièce" }}
                  </cfm-button>
                </div>
              </form>

              <ul class="evidence-list" *ngIf="filteredRegulatoryEvidences.length > 0; else emptyRegulatoryEvidences">
                <li *ngFor="let evidence of filteredRegulatoryEvidences">
                  <div class="duerp-copy">
                    <div class="site-heading">
                      <strong>{{ evidence.file_name }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getRegulatoryEvidenceLinkKindLabel(evidence.link_kind)" tone="calm" />
                        <cfm-status-chip label="Disponible" tone="success" />
                        <cfm-status-chip
                          *ngIf="selectedSafetySiteId === 'all' && evidence.site_id"
                          [label]="getSiteNameById(evidence.site_id)"
                          tone="neutral"
                        />
                      </div>
                    </div>
                    <span>Rattaché à : {{ evidence.link_label }}</span>
                    <span>Type : {{ evidence.document_type }}</span>
                    <span *ngIf="evidence.uploaded_at">Ajouté le {{ evidence.uploaded_at | date:'shortDate' }}</span>
                    <span *ngIf="evidence.notes">{{ evidence.notes }}</span>
                  </div>
                </li>
              </ul>

              <ng-template #emptyRegulatoryEvidences>
                <cfm-empty-state
                  title="Aucune pièce justificative"
                  description="Ajoutez une première preuve réglementaire simple pour compléter progressivement les obligations ou le DUERP."
                />
              </ng-template>
            </cfm-card>
          </ng-container>
          </ng-template>

          <ng-template #facturationPageTemplate>
          <cfm-card
            *ngIf="shouldShowWorkspaceContent && currentMembership && !isFacturationEnabled"
            class="desktop-card"
            eyebrow="Facturation"
            title="Module non activé"
            description="Activez le module Facturation pour créer vos premiers clients, devis et factures simples."
          >
            <cfm-empty-state
              title="Rien d’autre à remplir pour le moment"
              description="Le socle facturation apparaitra ici dès que le module sera activé."
            />
          </cfm-card>

          <ng-container *ngIf="shouldShowWorkspaceContent && currentMembership && isFacturationEnabled">
            <cfm-card
              class="desktop-card"
              eyebrow="S3-001"
              title="Clients"
              description="Un socle client simple pour démarrer rapidement sans base CRM ni configuration lourde."
            >
              <div class="chips">
                <cfm-status-chip
                  [label]="customerSearchCountLabel"
                  [tone]="billingCustomers.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="isCustomerEditing ? 'Modification en cours' : 'Création simple'"
                  [tone]="isCustomerEditing ? 'progress' : 'neutral'"
                />
              </div>

              <form class="customer-form" (ngSubmit)="saveCustomer()">
                <cfm-input
                  [(ngModel)]="customerForm.name"
                  name="customerName"
                  type="text"
                  label="Nom du client"
                  placeholder="Ex. Atelier Durand"
                  [disabled]="!canManageOrganization || customerSaving"
                  required
                />

                <label class="field">
                  <span>Type</span>
                  <select
                    [(ngModel)]="customerForm.customerType"
                    name="customerType"
                    [disabled]="!canManageOrganization || customerSaving"
                  >
                    <option value="company">Entreprise</option>
                    <option value="individual">Particulier</option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="customerForm.email"
                  name="customerEmail"
                  type="email"
                  label="Email"
                  placeholder="contact@client.fr"
                  [disabled]="!canManageOrganization || customerSaving"
                />

                <cfm-input
                  [(ngModel)]="customerForm.phone"
                  name="customerPhone"
                  type="text"
                  label="Téléphone"
                  placeholder="06 00 00 00 00"
                  [disabled]="!canManageOrganization || customerSaving"
                />

                <label class="field field-wide">
                  <span>Adresse</span>
                  <textarea
                    [(ngModel)]="customerForm.address"
                    name="customerAddress"
                    rows="3"
                    placeholder="Adresse utile pour les documents simples"
                    [disabled]="!canManageOrganization || customerSaving"
                  ></textarea>
                </label>

                <label class="field field-wide">
                  <span>Note courte</span>
                  <textarea
                    [(ngModel)]="customerForm.notes"
                    name="customerNotes"
                    rows="3"
                    placeholder="Ex. contact principal, info utile de facturation"
                    [disabled]="!canManageOrganization || customerSaving"
                  ></textarea>
                </label>

                <div class="form-actions inline-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!canManageOrganization || customerSaving || !canSaveCustomer"
                  >
                    {{
                      customerSaving
                        ? (isCustomerEditing ? "Enregistrement en cours" : "Ajout en cours")
                        : (isCustomerEditing ? "Enregistrer les changements" : "Ajouter le client")
                    }}
                  </cfm-button>

                  <cfm-button
                    *ngIf="isCustomerEditing"
                    type="button"
                    variant="secondary"
                    [disabled]="customerSaving"
                    (click)="cancelCustomerEditing()"
                  >
                    Annuler
                  </cfm-button>
                </div>
              </form>

              <cfm-input
                *ngIf="billingCustomers.length > 0"
                [(ngModel)]="customerSearchTerm"
                name="customerSearch"
                type="text"
                label="Recherche rapide client"
                placeholder="Nom, email ou téléphone"
              />

              <ul class="customer-list" *ngIf="filteredBillingCustomers.length > 0; else emptyCustomers">
                <li *ngFor="let customer of filteredBillingCustomers">
                  <div class="customer-copy">
                    <div class="site-heading">
                      <strong>{{ customer.name }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getCustomerTypeLabel(customer.customer_type)" tone="calm" />
                      </div>
                    </div>
                    <span *ngIf="customer.email">Email : {{ customer.email }}</span>
                    <span *ngIf="customer.phone">Téléphone : {{ customer.phone }}</span>
                    <span *ngIf="customer.address">{{ customer.address }}</span>
                    <span *ngIf="customer.notes">{{ customer.notes }}</span>
                  </div>

                  <div class="billing-item-actions" *ngIf="canManageOrganization">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="customerSaving"
                      (click)="startEditingCustomer(customer)"
                    >
                      Modifier
                    </cfm-button>

                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="customerSaving"
                      (click)="prepareQuoteFromCustomer(customer.id)"
                    >
                      Préparer un devis
                    </cfm-button>

                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="customerSaving"
                      (click)="prepareInvoiceFromCustomer(customer.id)"
                    >
                      Préparer une facture
                    </cfm-button>
                  </div>
                </li>
              </ul>

              <ng-template #emptyCustomers>
                <cfm-empty-state
                  [title]="billingCustomers.length === 0 ? 'Aucun client pour le moment' : 'Aucun client trouvé'"
                  [description]="billingCustomers.length === 0
                    ? 'Ajoutez un premier client avec les informations essentielles uniquement.'
                    : 'Essayez un nom, un email ou un téléphone plus court.'"
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              id="billing-quote-card"
              class="desktop-card"
              eyebrow="S3-002"
              title="Devis simple"
              description="Un devis léger, rattaché à un client, avec quelques lignes et un total lisible."
            >
              <div class="chips">
                <cfm-status-chip
                  [label]="quotes.length + ' devis'"
                  [tone]="quotes.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="'Total en préparation : ' + formatAmountCents(quoteFormTotalCents)"
                  [tone]="quoteFormTotalCents > 0 ? 'progress' : 'neutral'"
                />
                <cfm-status-chip
                  *ngIf="hasQuoteDraft"
                  label="Saisie conservée"
                  tone="calm"
                />
              </div>

              <ng-container *ngIf="billingCustomers.length > 0; else noCustomersForQuotes">
                <form class="billing-form" (ngSubmit)="saveQuote()">
                  <label class="field">
                    <span>Client</span>
                    <select
                      [(ngModel)]="quoteForm.customerId"
                      name="quoteCustomerId"
                      [disabled]="!canManageOrganization || quoteSaving"
                      required
                    >
                      <option value="">Choisir</option>
                      <option *ngFor="let customer of billingCustomers" [value]="customer.id">
                        {{ customer.name }}
                      </option>
                    </select>
                  </label>

                  <label class="field">
                    <span>Chantier lié</span>
                    <select
                      [(ngModel)]="quoteForm.worksiteId"
                      name="quoteWorksiteId"
                      [disabled]="!canManageOrganization || quoteSaving"
                    >
                      <option value="">Aucun chantier</option>
                      <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                        {{ worksite.name }}
                      </option>
                    </select>
                  </label>

                  <cfm-input
                    [(ngModel)]="quoteForm.title"
                    name="quoteTitle"
                    type="text"
                    label="Objet"
                    placeholder="Ex. Remise en état armoire électrique"
                    [disabled]="!canManageOrganization || quoteSaving"
                  />

                  <cfm-input
                    [(ngModel)]="quoteForm.issueDate"
                    name="quoteIssueDate"
                    type="date"
                    label="Date"
                    [disabled]="!canManageOrganization || quoteSaving"
                    required
                  />

                  <cfm-input
                    [(ngModel)]="quoteForm.validUntil"
                    name="quoteValidUntil"
                    type="date"
                    label="Valable jusqu'au"
                    [disabled]="!canManageOrganization || quoteSaving"
                  />

                  <label class="field">
                    <span>Statut</span>
                    <select
                      [(ngModel)]="quoteForm.status"
                      name="quoteStatus"
                      [disabled]="!canManageOrganization || quoteSaving"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="sent">Envoyé</option>
                    </select>
                  </label>

                  <label class="field field-wide">
                    <span>Note courte</span>
                    <textarea
                      [(ngModel)]="quoteForm.notes"
                      name="quoteNotes"
                      rows="3"
                      placeholder="Ex. portée du devis ou précaution utile"
                      [disabled]="!canManageOrganization || quoteSaving"
                    ></textarea>
                  </label>

                  <div class="billing-lines field-wide">
                    <div class="billing-line-header">
                      <h3>Lignes du devis</h3>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="!canManageOrganization || quoteSaving"
                        (click)="addQuoteLine()"
                      >
                        Ajouter une ligne
                      </cfm-button>
                    </div>

                    <div class="billing-line-editor" *ngFor="let line of quoteForm.lines; let lineIndex = index">
                      <cfm-input
                        [(ngModel)]="line.description"
                        [name]="'quoteLineDescription' + lineIndex"
                        type="text"
                        label="Description"
                        placeholder="Ex. Remplacement appareil"
                        [disabled]="!canManageOrganization || quoteSaving"
                      />
                      <cfm-input
                        [(ngModel)]="line.quantity"
                        [name]="'quoteLineQuantity' + lineIndex"
                        type="text"
                        label="Quantité"
                        placeholder="1"
                        [disabled]="!canManageOrganization || quoteSaving"
                      />
                      <cfm-input
                        [(ngModel)]="line.unitPrice"
                        [name]="'quoteLineUnitPrice' + lineIndex"
                        type="text"
                        label="Prix unitaire TTC (€)"
                        placeholder="120"
                        [disabled]="!canManageOrganization || quoteSaving"
                      />
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="!canManageOrganization || quoteSaving"
                        (click)="removeQuoteLine(lineIndex)"
                      >
                        Retirer
                      </cfm-button>
                    </div>
                  </div>

                  <p class="small field-wide">Total estimé : {{ formatAmountCents(quoteFormTotalCents) }}</p>

                  <div class="form-actions">
                    <cfm-button
                      type="submit"
                      [disabled]="!canManageOrganization || quoteSaving || !canCreateQuote"
                    >
                      {{ quoteSaving ? "Ajout en cours" : "Créer le devis" }}
                    </cfm-button>
                    <cfm-button
                      *ngIf="hasQuoteDraft"
                      type="button"
                      variant="secondary"
                      [disabled]="quoteSaving"
                      (click)="discardQuoteDraft()"
                    >
                      Effacer la saisie
                    </cfm-button>
                  </div>
                </form>
              </ng-container>

              <ng-template #noCustomersForQuotes>
                <cfm-empty-state
                  title="Ajoutez d'abord un client"
                  description="Le devis simple apparait dès qu'un premier client est disponible."
                />
              </ng-template>

              <ul class="billing-list" *ngIf="quotes.length > 0; else emptyQuotes">
                <li *ngFor="let quote of quotes">
                  <div class="duerp-copy">
                    <div class="site-heading">
                      <strong>{{ quote.title || ('Devis du ' + (quote.issue_date | date:'shortDate')) }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getQuoteStatusLabel(quote.status)" [tone]="getQuoteStatusTone(quote.status)" />
                        <cfm-status-chip
                          [label]="getBillingFollowUpStatusLabel(quote.follow_up_status)"
                          [tone]="getBillingFollowUpStatusTone(quote.follow_up_status)"
                        />
                        <cfm-status-chip [label]="quote.customer_name" tone="calm" />
                      </div>
                    </div>
                    <span *ngIf="quote.worksite_name">Chantier : {{ quote.worksite_name }}</span>
                    <span>Numéro : {{ quote.number }}</span>
                    <span>Émis le {{ quote.issue_date | date:'shortDate' }}</span>
                    <span *ngIf="quote.valid_until">Valable jusqu'au {{ quote.valid_until | date:'shortDate' }}</span>
                    <span>{{ quote.line_items.length }} ligne{{ quote.line_items.length > 1 ? "s" : "" }}</span>
                    <span>Total : {{ formatAmountCents(quote.total_amount_cents, quote.currency) }}</span>
                    <span *ngIf="quote.notes">{{ quote.notes }}</span>
                  </div>

                  <div class="billing-item-actions" *ngIf="canManageOrganization || canReadOrganization">
                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Chantier</span>
                      <select
                        [ngModel]="quote.worksite_id ?? ''"
                        [name]="'quoteWorksiteEdit' + quote.id"
                        [disabled]="quoteWorksiteBusyId === quote.id"
                        (ngModelChange)="changeQuoteWorksite(quote, $event)"
                      >
                        <option value="">Aucun chantier</option>
                        <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                          {{ worksite.name }}
                        </option>
                      </select>
                    </label>

                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Statut</span>
                      <select
                        [ngModel]="quote.status"
                        [name]="'quoteStatusEdit' + quote.id"
                        [disabled]="quoteStatusBusyId === quote.id"
                        (ngModelChange)="changeQuoteStatus(quote, $event)"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="sent">Envoyé</option>
                        <option value="accepted">Accepté</option>
                        <option value="declined">Refusé</option>
                      </select>
                    </label>

                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Suivi</span>
                      <select
                        [ngModel]="quote.follow_up_status"
                        [name]="'quoteFollowUpEdit' + quote.id"
                        [disabled]="quoteFollowUpBusyId === quote.id"
                        (ngModelChange)="changeQuoteFollowUpStatus(quote, $event)"
                      >
                        <option value="normal">Suivi normal</option>
                        <option value="to_follow_up">À relancer</option>
                        <option value="followed_up">Relancé</option>
                        <option value="waiting_customer">En attente client</option>
                      </select>
                    </label>

                    <cfm-button
                      *ngIf="canManageOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quoteEditingSaving"
                      (click)="quoteEditingId === quote.id ? cancelQuoteEditing() : startEditingQuote(quote)"
                    >
                      {{ quoteEditingId === quote.id ? "Annuler la modification" : "Modifier" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canManageOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quoteDuplicateBusyId === quote.id"
                      (click)="duplicateQuoteAsInvoice(quote)"
                    >
                      {{ quoteDuplicateBusyId === quote.id ? "Création en cours" : "Créer une facture" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quotePdfBusyId === quote.id"
                      (click)="exportQuotePdf(quote)"
                    >
                      {{ quotePdfBusyId === quote.id ? "Génération en cours" : "Exporter le PDF" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quoteHistoryBusyId === quote.id"
                      (click)="toggleQuoteHistory(quote)"
                    >
                      {{
                        quoteHistoryBusyId === quote.id
                          ? "Chargement en cours"
                          : (quoteHistoryOpenId === quote.id ? "Masquer l'historique" : "Voir l'historique")
                      }}
                    </cfm-button>
                  </div>

                  <div class="billing-history" *ngIf="quoteHistoryOpenId === quote.id">
                    <p class="small">Principaux événements</p>

                    <ul class="history-list" *ngIf="getQuoteHistory(quote.id).length > 0; else emptyQuoteHistory">
                      <li *ngFor="let log of getQuoteHistory(quote.id)">
                        <div class="history-copy">
                          <strong>{{ getBillingHistoryLabel(log) }}</strong>
                          <span>{{ log.occurred_at | date:'short' }}</span>
                          <span>{{ getBillingHistoryMeta(log) }}</span>
                        </div>
                      </li>
                    </ul>

                    <ng-template #emptyQuoteHistory>
                      <cfm-empty-state
                        title="Aucun événement à afficher"
                        description="L'historique simple du devis apparaitra ici dès qu'une action utile sera tracée."
                      />
                    </ng-template>
                  </div>

                  <form class="billing-form" *ngIf="quoteEditingId === quote.id" (ngSubmit)="saveQuoteEdit(quote)">
                    <label class="field">
                      <span>Client</span>
                      <select
                        [(ngModel)]="quoteEditForm.customerId"
                        [name]="'quoteEditCustomerId' + quote.id"
                        [disabled]="quoteEditingSaving"
                        required
                      >
                        <option value="">Choisir</option>
                        <option *ngFor="let customer of billingCustomers" [value]="customer.id">
                          {{ customer.name }}
                        </option>
                      </select>
                    </label>

                    <label class="field">
                      <span>Chantier lié</span>
                      <select
                        [(ngModel)]="quoteEditForm.worksiteId"
                        [name]="'quoteEditWorksiteId' + quote.id"
                        [disabled]="quoteEditingSaving"
                      >
                        <option value="">Aucun chantier</option>
                        <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                          {{ worksite.name }}
                        </option>
                      </select>
                    </label>

                    <cfm-input
                      [(ngModel)]="quoteEditForm.title"
                      [name]="'quoteEditTitle' + quote.id"
                      type="text"
                      label="Objet"
                      placeholder="Ex. Intervention ou prestation"
                      [disabled]="quoteEditingSaving"
                    />

                    <cfm-input
                      [(ngModel)]="quoteEditForm.issueDate"
                      [name]="'quoteEditIssueDate' + quote.id"
                      type="date"
                      label="Date"
                      [disabled]="quoteEditingSaving"
                      required
                    />

                    <cfm-input
                      [(ngModel)]="quoteEditForm.validUntil"
                      [name]="'quoteEditValidUntil' + quote.id"
                      type="date"
                      label="Validité"
                      [disabled]="quoteEditingSaving"
                    />

                    <label class="field field-wide">
                      <span>Note courte</span>
                      <textarea
                        [(ngModel)]="quoteEditForm.notes"
                        [name]="'quoteEditNotes' + quote.id"
                        rows="3"
                        placeholder="Ex. portée du devis ou précision utile"
                        [disabled]="quoteEditingSaving"
                      ></textarea>
                    </label>

                    <div class="billing-lines field-wide">
                      <div class="billing-line-header">
                        <h3>Lignes du devis</h3>
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="quoteEditingSaving"
                          (click)="addQuoteEditLine()"
                        >
                          Ajouter une ligne
                        </cfm-button>
                      </div>

                      <div class="billing-line-editor" *ngFor="let line of quoteEditForm.lines; let lineIndex = index">
                        <cfm-input
                          [(ngModel)]="line.description"
                          [name]="'quoteEditLineDescription' + quote.id + '-' + lineIndex"
                          type="text"
                          label="Description"
                          placeholder="Ex. Fourniture"
                          [disabled]="quoteEditingSaving"
                        />
                        <cfm-input
                          [(ngModel)]="line.quantity"
                          [name]="'quoteEditLineQuantity' + quote.id + '-' + lineIndex"
                          type="text"
                          label="Quantité"
                          placeholder="1"
                          [disabled]="quoteEditingSaving"
                        />
                        <cfm-input
                          [(ngModel)]="line.unitPrice"
                          [name]="'quoteEditLineUnitPrice' + quote.id + '-' + lineIndex"
                          type="text"
                          label="Prix unitaire TTC (€)"
                          placeholder="120"
                          [disabled]="quoteEditingSaving"
                        />
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="quoteEditingSaving"
                          (click)="removeQuoteEditLine(lineIndex)"
                        >
                          Retirer
                        </cfm-button>
                      </div>
                    </div>

                    <p class="small field-wide">
                      Total recalculé : {{ formatAmountCents(quoteEditFormTotalCents) }}
                    </p>

                    <div class="form-actions inline-actions">
                      <cfm-button
                        type="submit"
                        [disabled]="quoteEditingSaving || !canSaveQuoteEdit"
                      >
                        {{ quoteEditingSaving ? "Enregistrement en cours" : "Enregistrer les modifications" }}
                      </cfm-button>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="quoteEditingSaving"
                        (click)="cancelQuoteEditing()"
                      >
                        Annuler
                      </cfm-button>
                    </div>
                  </form>
                </li>
              </ul>

              <ng-template #emptyQuotes>
                <cfm-empty-state
                  title="Aucun devis pour le moment"
                  description="Créez un premier devis simple avec quelques lignes et un total lisible."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              id="billing-invoice-card"
              class="desktop-card"
              eyebrow="S3-003"
              title="Facture simple"
              description="Une facture légère, rattachée à un client, avec lignes simples et total clair."
            >
              <div class="chips">
                <cfm-status-chip
                  [label]="invoices.length + ' facture' + (invoices.length > 1 ? 's' : '')"
                  [tone]="invoices.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="'Total en préparation : ' + formatAmountCents(invoiceFormTotalCents)"
                  [tone]="invoiceFormTotalCents > 0 ? 'progress' : 'neutral'"
                />
                <cfm-status-chip
                  *ngIf="hasInvoiceDraft"
                  label="Saisie conservée"
                  tone="calm"
                />
              </div>

              <ng-container *ngIf="billingCustomers.length > 0; else noCustomersForInvoices">
                <form class="billing-form" (ngSubmit)="saveInvoice()">
                  <label class="field">
                    <span>Client</span>
                    <select
                      [(ngModel)]="invoiceForm.customerId"
                      name="invoiceCustomerId"
                      [disabled]="!canManageOrganization || invoiceSaving"
                      required
                    >
                      <option value="">Choisir</option>
                      <option *ngFor="let customer of billingCustomers" [value]="customer.id">
                        {{ customer.name }}
                      </option>
                    </select>
                  </label>

                  <label class="field">
                    <span>Chantier lié</span>
                    <select
                      [(ngModel)]="invoiceForm.worksiteId"
                      name="invoiceWorksiteId"
                      [disabled]="!canManageOrganization || invoiceSaving"
                    >
                      <option value="">Aucun chantier</option>
                      <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                        {{ worksite.name }}
                      </option>
                    </select>
                  </label>

                  <cfm-input
                    [(ngModel)]="invoiceForm.title"
                    name="invoiceTitle"
                    type="text"
                    label="Objet"
                    placeholder="Ex. Intervention de maintenance"
                    [disabled]="!canManageOrganization || invoiceSaving"
                  />

                  <cfm-input
                    [(ngModel)]="invoiceForm.issueDate"
                    name="invoiceIssueDate"
                    type="date"
                    label="Date"
                    [disabled]="!canManageOrganization || invoiceSaving"
                    required
                  />

                  <cfm-input
                    [(ngModel)]="invoiceForm.dueDate"
                    name="invoiceDueDate"
                    type="date"
                    label="Échéance"
                    [disabled]="!canManageOrganization || invoiceSaving"
                  />

                  <label class="field">
                    <span>Statut</span>
                    <select
                      [(ngModel)]="invoiceForm.status"
                      name="invoiceStatus"
                      [disabled]="!canManageOrganization || invoiceSaving"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="issued">Émise</option>
                    </select>
                  </label>

                  <label class="field field-wide">
                    <span>Note courte</span>
                    <textarea
                      [(ngModel)]="invoiceForm.notes"
                      name="invoiceNotes"
                      rows="3"
                      placeholder="Ex. information utile visible dans l'outil"
                      [disabled]="!canManageOrganization || invoiceSaving"
                    ></textarea>
                  </label>

                  <div class="billing-lines field-wide">
                    <div class="billing-line-header">
                      <h3>Lignes de la facture</h3>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="!canManageOrganization || invoiceSaving"
                        (click)="addInvoiceLine()"
                      >
                        Ajouter une ligne
                      </cfm-button>
                    </div>

                    <div class="billing-line-editor" *ngFor="let line of invoiceForm.lines; let lineIndex = index">
                      <cfm-input
                        [(ngModel)]="line.description"
                        [name]="'invoiceLineDescription' + lineIndex"
                        type="text"
                        label="Description"
                        placeholder="Ex. Dépannage sur site"
                        [disabled]="!canManageOrganization || invoiceSaving"
                      />
                      <cfm-input
                        [(ngModel)]="line.quantity"
                        [name]="'invoiceLineQuantity' + lineIndex"
                        type="text"
                        label="Quantité"
                        placeholder="1"
                        [disabled]="!canManageOrganization || invoiceSaving"
                      />
                      <cfm-input
                        [(ngModel)]="line.unitPrice"
                        [name]="'invoiceLineUnitPrice' + lineIndex"
                        type="text"
                        label="Prix unitaire TTC (€)"
                        placeholder="120"
                        [disabled]="!canManageOrganization || invoiceSaving"
                      />
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="!canManageOrganization || invoiceSaving"
                        (click)="removeInvoiceLine(lineIndex)"
                      >
                        Retirer
                      </cfm-button>
                    </div>
                  </div>

                  <p class="small field-wide">Total estimé : {{ formatAmountCents(invoiceFormTotalCents) }}</p>

                  <div class="form-actions">
                    <cfm-button
                      type="submit"
                      [disabled]="!canManageOrganization || invoiceSaving || !canCreateInvoice"
                    >
                      {{ invoiceSaving ? "Ajout en cours" : "Créer la facture" }}
                    </cfm-button>
                    <cfm-button
                      *ngIf="hasInvoiceDraft"
                      type="button"
                      variant="secondary"
                      [disabled]="invoiceSaving"
                      (click)="discardInvoiceDraft()"
                    >
                      Effacer la saisie
                    </cfm-button>
                  </div>
                </form>
              </ng-container>

              <ng-template #noCustomersForInvoices>
                <cfm-empty-state
                  title="Ajoutez d'abord un client"
                  description="La facture simple apparait dès qu'un premier client est disponible."
                />
              </ng-template>

              <ul class="billing-list" *ngIf="invoices.length > 0; else emptyInvoices">
                <li *ngFor="let invoice of invoices">
                  <div class="duerp-copy">
                    <div class="site-heading">
                      <strong>{{ invoice.title || ('Facture du ' + (invoice.issue_date | date:'shortDate')) }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getInvoiceStatusLabel(invoice.status)" [tone]="getInvoiceStatusTone(invoice.status)" />
                        <cfm-status-chip
                          [label]="getBillingFollowUpStatusLabel(invoice.follow_up_status)"
                          [tone]="getBillingFollowUpStatusTone(invoice.follow_up_status)"
                        />
                        <cfm-status-chip [label]="invoice.customer_name" tone="calm" />
                      </div>
                    </div>
                    <span *ngIf="invoice.worksite_name">Chantier : {{ invoice.worksite_name }}</span>
                    <span>Numéro : {{ invoice.number }}</span>
                    <span>Émise le {{ invoice.issue_date | date:'shortDate' }}</span>
                    <span *ngIf="invoice.due_date">Échéance : {{ invoice.due_date | date:'shortDate' }}</span>
                    <span>{{ invoice.line_items.length }} ligne{{ invoice.line_items.length > 1 ? "s" : "" }}</span>
                    <span>Total : {{ formatAmountCents(invoice.total_amount_cents, invoice.currency) }}</span>
                    <span *ngIf="invoice.paid_amount_cents > 0">
                      Réglé : {{ formatAmountCents(invoice.paid_amount_cents, invoice.currency) }}
                    </span>
                    <span *ngIf="invoice.outstanding_amount_cents > 0">
                      Reste dû : {{ formatAmountCents(invoice.outstanding_amount_cents, invoice.currency) }}
                    </span>
                    <span *ngIf="invoice.paid_at">Payée le {{ invoice.paid_at | date:'shortDate' }}</span>
                    <span *ngIf="invoice.notes">{{ invoice.notes }}</span>
                  </div>

                  <div class="billing-item-actions" *ngIf="canManageOrganization || canReadOrganization">
                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Chantier</span>
                      <select
                        [ngModel]="invoice.worksite_id ?? ''"
                        [name]="'invoiceWorksiteEdit' + invoice.id"
                        [disabled]="invoiceWorksiteBusyId === invoice.id"
                        (ngModelChange)="changeInvoiceWorksite(invoice, $event)"
                      >
                        <option value="">Aucun chantier</option>
                        <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                          {{ worksite.name }}
                        </option>
                      </select>
                    </label>

                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Statut</span>
                      <select
                        [ngModel]="invoice.status === 'draft' ? 'draft' : 'issued'"
                        [name]="'invoiceStatusEdit' + invoice.id"
                        [disabled]="invoiceStatusBusyId === invoice.id || invoice.status === 'paid'"
                        (ngModelChange)="changeInvoiceStatus(invoice, $event)"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="issued">Émise</option>
                      </select>
                    </label>

                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Suivi</span>
                      <select
                        [ngModel]="invoice.follow_up_status"
                        [name]="'invoiceFollowUpEdit' + invoice.id"
                        [disabled]="invoiceFollowUpBusyId === invoice.id"
                        (ngModelChange)="changeInvoiceFollowUpStatus(invoice, $event)"
                      >
                        <option value="normal">Suivi normal</option>
                        <option value="to_follow_up">À relancer</option>
                        <option value="followed_up">Relancé</option>
                        <option value="waiting_customer">En attente client</option>
                      </select>
                    </label>

                    <cfm-button
                      *ngIf="canManageOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="invoiceEditingSaving"
                      (click)="invoiceEditingId === invoice.id ? cancelInvoiceEditing() : startEditingInvoice(invoice)"
                    >
                      {{ invoiceEditingId === invoice.id ? "Annuler la modification" : "Modifier" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canManageOrganization && invoice.status !== 'paid'"
                      type="button"
                      variant="secondary"
                      [disabled]="invoicePaymentBusyId === invoice.id"
                      (click)="invoicePaymentId === invoice.id ? cancelInvoicePayment() : openInvoicePayment(invoice)"
                    >
                      {{ invoicePaymentId === invoice.id ? "Annuler le paiement" : "Enregistrer un paiement" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="invoicePdfBusyId === invoice.id"
                      (click)="exportInvoicePdf(invoice)"
                    >
                      {{ invoicePdfBusyId === invoice.id ? "Génération en cours" : "Exporter le PDF" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="invoiceHistoryBusyId === invoice.id"
                      (click)="toggleInvoiceHistory(invoice)"
                    >
                      {{
                        invoiceHistoryBusyId === invoice.id
                          ? "Chargement en cours"
                          : (invoiceHistoryOpenId === invoice.id ? "Masquer l'historique" : "Voir l'historique")
                      }}
                    </cfm-button>

                    <form
                      class="payment-form"
                      *ngIf="invoicePaymentId === invoice.id"
                      (ngSubmit)="saveInvoicePayment(invoice)"
                    >
                      <cfm-input
                        [(ngModel)]="invoicePaymentForm.paidAmount"
                        [name]="'invoicePaidAmount' + invoice.id"
                        type="text"
                        label="Montant payé (€)"
                        placeholder="Ex. 1200"
                        [disabled]="invoicePaymentBusyId === invoice.id"
                        required
                      />

                      <cfm-input
                        [(ngModel)]="invoicePaymentForm.paidAt"
                        [name]="'invoicePaidAt' + invoice.id"
                        type="date"
                        label="Date de paiement"
                        [disabled]="invoicePaymentBusyId === invoice.id"
                        required
                      />

                      <div class="inline-actions">
                        <cfm-button
                          type="submit"
                          [disabled]="invoicePaymentBusyId === invoice.id || !canSaveInvoicePayment(invoice)"
                        >
                          {{ invoicePaymentBusyId === invoice.id ? "Enregistrement en cours" : "Valider le paiement" }}
                        </cfm-button>
                      </div>
                    </form>
                  </div>

                  <div class="billing-history" *ngIf="invoiceHistoryOpenId === invoice.id">
                    <p class="small">Principaux événements</p>

                    <ul class="history-list" *ngIf="getInvoiceHistory(invoice.id).length > 0; else emptyInvoiceHistory">
                      <li *ngFor="let log of getInvoiceHistory(invoice.id)">
                        <div class="history-copy">
                          <strong>{{ getBillingHistoryLabel(log) }}</strong>
                          <span>{{ log.occurred_at | date:'short' }}</span>
                          <span>{{ getBillingHistoryMeta(log) }}</span>
                        </div>
                      </li>
                    </ul>

                    <ng-template #emptyInvoiceHistory>
                      <cfm-empty-state
                        title="Aucun événement à afficher"
                        description="L'historique simple de la facture apparaitra ici dès qu'une action utile sera tracée."
                      />
                    </ng-template>
                  </div>

                  <form class="billing-form" *ngIf="invoiceEditingId === invoice.id" (ngSubmit)="saveInvoiceEdit(invoice)">
                    <label class="field">
                      <span>Client</span>
                      <select
                        [(ngModel)]="invoiceEditForm.customerId"
                        [name]="'invoiceEditCustomerId' + invoice.id"
                        [disabled]="invoiceEditingSaving"
                        required
                      >
                        <option value="">Choisir</option>
                        <option *ngFor="let customer of billingCustomers" [value]="customer.id">
                          {{ customer.name }}
                        </option>
                      </select>
                    </label>

                    <label class="field">
                      <span>Chantier lié</span>
                      <select
                        [(ngModel)]="invoiceEditForm.worksiteId"
                        [name]="'invoiceEditWorksiteId' + invoice.id"
                        [disabled]="invoiceEditingSaving"
                      >
                        <option value="">Aucun chantier</option>
                        <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                          {{ worksite.name }}
                        </option>
                      </select>
                    </label>

                    <cfm-input
                      [(ngModel)]="invoiceEditForm.title"
                      [name]="'invoiceEditTitle' + invoice.id"
                      type="text"
                      label="Objet"
                      placeholder="Ex. Intervention ou prestation"
                      [disabled]="invoiceEditingSaving"
                    />

                    <cfm-input
                      [(ngModel)]="invoiceEditForm.issueDate"
                      [name]="'invoiceEditIssueDate' + invoice.id"
                      type="date"
                      label="Date"
                      [disabled]="invoiceEditingSaving"
                      required
                    />

                    <cfm-input
                      [(ngModel)]="invoiceEditForm.dueDate"
                      [name]="'invoiceEditDueDate' + invoice.id"
                      type="date"
                      label="Échéance"
                      [disabled]="invoiceEditingSaving"
                    />

                    <label class="field field-wide">
                      <span>Note courte</span>
                      <textarea
                        [(ngModel)]="invoiceEditForm.notes"
                        [name]="'invoiceEditNotes' + invoice.id"
                        rows="3"
                        placeholder="Ex. précision utile pour la facture"
                        [disabled]="invoiceEditingSaving"
                      ></textarea>
                    </label>

                    <div class="billing-lines field-wide">
                      <div class="billing-line-header">
                        <h3>Lignes de la facture</h3>
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="invoiceEditingSaving"
                          (click)="addInvoiceEditLine()"
                        >
                          Ajouter une ligne
                        </cfm-button>
                      </div>

                      <div class="billing-line-editor" *ngFor="let line of invoiceEditForm.lines; let lineIndex = index">
                        <cfm-input
                          [(ngModel)]="line.description"
                          [name]="'invoiceEditLineDescription' + invoice.id + '-' + lineIndex"
                          type="text"
                          label="Description"
                          placeholder="Ex. Intervention"
                          [disabled]="invoiceEditingSaving"
                        />
                        <cfm-input
                          [(ngModel)]="line.quantity"
                          [name]="'invoiceEditLineQuantity' + invoice.id + '-' + lineIndex"
                          type="text"
                          label="Quantité"
                          placeholder="1"
                          [disabled]="invoiceEditingSaving"
                        />
                        <cfm-input
                          [(ngModel)]="line.unitPrice"
                          [name]="'invoiceEditLineUnitPrice' + invoice.id + '-' + lineIndex"
                          type="text"
                          label="Prix unitaire TTC (€)"
                          placeholder="120"
                          [disabled]="invoiceEditingSaving"
                        />
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="invoiceEditingSaving"
                          (click)="removeInvoiceEditLine(lineIndex)"
                        >
                          Retirer
                        </cfm-button>
                      </div>
                    </div>

                    <p class="small field-wide">
                      Total recalculé : {{ formatAmountCents(invoiceEditFormTotalCents) }}
                    </p>

                    <div class="form-actions inline-actions">
                      <cfm-button
                        type="submit"
                        [disabled]="invoiceEditingSaving || !canSaveInvoiceEdit"
                      >
                        {{ invoiceEditingSaving ? "Enregistrement en cours" : "Enregistrer les modifications" }}
                      </cfm-button>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="invoiceEditingSaving"
                        (click)="cancelInvoiceEditing()"
                      >
                        Annuler
                      </cfm-button>
                    </div>
                  </form>
                </li>
              </ul>

              <ng-template #emptyInvoices>
                <cfm-empty-state
                  title="Aucune facture pour le moment"
                  description="Créez une première facture simple à partir d'un client déjà enregistré."
                />
              </ng-template>
            </cfm-card>
          </ng-container>
          </ng-template>

          <ng-template #coordinationPageTemplate>
            <cfm-card
              *ngIf="shouldShowWorkspaceContent && currentMembership"
              class="desktop-card"
              eyebrow="Coordination"
              title="À traiter"
              description="Une lecture simple des chantiers et documents encore ouverts, avec filtres légers par suivi et affectation."
            >
              <section class="dashboard-actions">
                <div class="dashboard-actions-header">
                  <div class="dashboard-action-copy">
                    <h3>Coordination légère</h3>
                    <p class="small">
                      Retrouvez vite ce qui reste à faire sans ouvrir un gestionnaire de tâches complet.
                    </p>
                  </div>

                  <cfm-status-chip
                    [label]="coordinationTodoCountLabel"
                    [tone]="coordinationTodoItems.length > 0 ? 'progress' : 'success'"
                  />
                </div>

                <ng-container *ngIf="isChantierEnabled; else standaloneCoordinationDisabled">
                  <div class="inline-actions">
                    <label class="compact-field">
                      <span class="small">Suivi</span>
                      <select [(ngModel)]="selectedCoordinationStatusFilter" name="coordinationPageStatusFilter">
                        <option value="all">Tous les suivis</option>
                        <option value="todo">À faire</option>
                        <option value="in_progress">En cours</option>
                        <option value="done">Fait</option>
                      </select>
                    </label>

                    <label class="compact-field">
                      <span class="small">Affectation</span>
                      <select [(ngModel)]="selectedCoordinationAssigneeFilter" name="coordinationPageAssigneeFilter">
                        <option value="all">Toutes les affectations</option>
                        <option value="unassigned">Non affecté</option>
                        <option *ngFor="let assignee of worksiteAssignees" [value]="assignee.user_id">
                          {{ getWorksiteAssigneeOptionLabel(assignee) }}
                        </option>
                      </select>
                    </label>

                    <cfm-button
                      *ngIf="hasActiveCoordinationFilters"
                      type="button"
                      variant="secondary"
                      (click)="resetCoordinationFilters()"
                    >
                      Réinitialiser les filtres
                    </cfm-button>
                  </div>

                  <ul class="alert-list" *ngIf="coordinationTodoItems.length > 0; else emptyStandaloneCoordinationTodo">
                    <li *ngFor="let item of coordinationTodoItems">
                      <div class="dashboard-alert-copy">
                        <strong>{{ item.title }}</strong>
                        <span>{{ item.description }}</span>
                        <span *ngIf="item.context">{{ item.context }}</span>
                      </div>

                      <div class="billing-item-actions">
                        <div class="chips">
                          <cfm-status-chip [label]="item.kindLabel" [tone]="item.kindTone" />
                          <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                        </div>

                        <cfm-button
                          type="button"
                          variant="secondary"
                          (click)="openCoordinationTodoItem(item)"
                        >
                          {{ item.kind === "worksite" ? "Voir le chantier" : "Voir le document" }}
                        </cfm-button>
                      </div>
                    </li>
                  </ul>

                  <ng-template #emptyStandaloneCoordinationTodo>
                    <p class="small">
                      {{
                        hasActiveCoordinationFilters
                          ? "Aucun élément coordonné ne correspond aux filtres."
                          : "Aucun chantier ni document coordonné à traiter pour le moment."
                      }}
                    </p>
                  </ng-template>
                </ng-container>

                <ng-template #standaloneCoordinationDisabled>
                  <cfm-empty-state
                    title="Module Chantier non activé"
                    description="Activez le module Chantier pour utiliser cette vue de coordination."
                  />
                </ng-template>
              </section>
            </cfm-card>
          </ng-template>

          <ng-template #chantierPageTemplate>
            <cfm-card
              *ngIf="shouldShowWorkspaceContent && currentMembership"
              class="desktop-card"
              eyebrow="Chantier"
              title="Vue chantier"
              description="Une lecture plus directe des chantiers, de leurs signaux et des actions utiles sans passer par le cockpit global."
            >
              <section class="dashboard-actions" id="worksite-overview-section">
                <div class="dashboard-actions-header">
                  <div class="dashboard-action-copy">
                    <h3>Chantiers</h3>
                    <p class="small">
                      Les chantiers ressortent avec leur statut général, leurs signaux simples et les actions utiles.
                    </p>
                  </div>

                  <cfm-status-chip
                    [label]="worksiteOverviewCountLabel"
                    [tone]="filteredDashboardWorksiteOverviewItems.length > 0 ? 'calm' : 'neutral'"
                  />
                </div>

                <ng-container *ngIf="isChantierEnabled; else standaloneWorksiteDisabled">
                  <ul class="alert-list" *ngIf="filteredDashboardWorksiteOverviewItems.length > 0; else emptyStandaloneWorksiteOverview">
                    <li *ngFor="let item of filteredDashboardWorksiteOverviewItems">
                      <div class="dashboard-alert-copy">
                        <strong>{{ item.name }}</strong>
                        <span>{{ item.summary }}</span>
                        <span>{{ item.operationalSummary }}</span>
                        <span>{{ item.taskSummary }}</span>
                        <span>
                          Coordination : {{ item.coordination.statusLabel }} · {{ item.coordination.assigneeLabel }}
                        </span>
                        <span *ngIf="item.coordination.commentText">{{ item.coordination.commentSummary }}</span>
                        <span *ngIf="item.coordination.updatedAtLabel">
                          Dernier suivi : {{ item.coordination.updatedAtLabel }}
                        </span>
                        <span>{{ item.linkedWorksiteDocumentsSummary }}</span>
                        <span>{{ item.linkedQuotesSummary }}</span>
                        <span>{{ item.linkedInvoicesSummary }}</span>
                        <span *ngIf="item.financialSummary">{{ item.financialSummary }}</span>
                      </div>

                      <div class="billing-item-actions">
                        <div class="chips">
                          <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                          <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
                        </div>

                        <cfm-button
                          *ngIf="canManageOrganization && isFacturationEnabled && billingCustomers.length > 0"
                          type="button"
                          variant="secondary"
                          (click)="prepareQuoteFromWorksite(item.id)"
                        >
                          Préparer un devis
                        </cfm-button>

                        <cfm-button
                          *ngIf="canManageOrganization && isFacturationEnabled && billingCustomers.length > 0"
                          type="button"
                          variant="secondary"
                          (click)="prepareInvoiceFromWorksite(item.id)"
                        >
                          Préparer une facture
                        </cfm-button>

                        <cfm-button
                          *ngIf="canReadOrganization"
                          type="button"
                          variant="secondary"
                          [disabled]="worksiteDocumentPdfBusyId === item.id"
                          (click)="exportWorksiteSummaryPdf(item.id)"
                        >
                          {{ worksiteDocumentPdfBusyId === item.id ? "Génération en cours" : "Fiche chantier PDF" }}
                        </cfm-button>

                        <cfm-button
                          *ngIf="canReadOrganization"
                          type="button"
                          variant="secondary"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                          (click)="toggleWorksitePreventionPlanEditor(item.id)"
                        >
                          {{
                            worksitePreventionPlanEditingId === item.id
                              ? "Fermer le plan"
                              : "Ajuster le plan"
                          }}
                        </cfm-button>

                        <cfm-button
                          *ngIf="item.worksiteDocumentsCount > 0"
                          type="button"
                          variant="secondary"
                          (click)="focusWorksiteDocuments(item.id)"
                        >
                          Voir les documents
                        </cfm-button>

                        <cfm-button
                          *ngIf="canReadOrganization"
                          type="button"
                          variant="secondary"
                          (click)="toggleWorksiteCoordination(item.id)"
                        >
                          {{
                            selectedWorksiteCoordinationId === item.id
                              ? "Masquer la coordination"
                              : "Coordination simple"
                          }}
                        </cfm-button>
                      </div>

                      <section class="document-linked-panel" *ngIf="selectedWorksiteCoordinationId === item.id">
                        <div class="detail-grid">
                          <div class="detail-block">
                            <span class="small">Suivi</span>
                            <strong>{{ item.coordination.statusLabel }}</strong>
                            <cfm-status-chip
                              [label]="item.coordination.statusLabel"
                              [tone]="item.coordination.statusTone"
                            />
                          </div>

                          <div class="detail-block">
                            <span class="small">Affectation</span>
                            <strong>{{ item.coordination.assigneeLabel }}</strong>
                            <span *ngIf="item.coordination.updatedAtLabel">
                              Dernière mise à jour : {{ item.coordination.updatedAtLabel }}
                            </span>
                          </div>
                        </div>

                        <div class="detail-block">
                          <span class="small">Commentaire simple</span>
                          <span>
                            {{ item.coordination.commentText || "Aucun commentaire simple pour le moment." }}
                          </span>
                        </div>

                        <div class="detail-grid" *ngIf="canManageOrganization">
                          <label class="field compact-field">
                            <span>Suivi</span>
                            <select
                              [ngModel]="getWorksiteCoordinationDraft(item.id).status"
                              [name]="'worksiteStandaloneCoordinationStatus' + item.id"
                              [disabled]="worksiteCoordinationBusyId === item.id"
                              (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { status: $event })"
                            >
                              <option value="todo">À faire</option>
                              <option value="in_progress">En cours</option>
                              <option value="done">Fait</option>
                            </select>
                          </label>

                          <label
                            class="field compact-field"
                            *ngIf="worksiteAssignees.length > 0; else noStandaloneWorksiteAssignees"
                          >
                            <span>Affectation</span>
                            <select
                              [ngModel]="getWorksiteCoordinationDraft(item.id).assigneeUserId"
                              [name]="'worksiteStandaloneCoordinationAssignee' + item.id"
                              [disabled]="worksiteCoordinationBusyId === item.id"
                              (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { assigneeUserId: $event })"
                            >
                              <option value="">Non affecté</option>
                              <option *ngFor="let assignee of worksiteAssignees" [value]="assignee.user_id">
                                {{ getWorksiteAssigneeOptionLabel(assignee) }}
                              </option>
                            </select>
                          </label>

                          <ng-template #noStandaloneWorksiteAssignees>
                            <div class="detail-block">
                              <span class="small">Affectation</span>
                              <span>Aucun membre lisible pour affecter ce chantier.</span>
                            </div>
                          </ng-template>
                        </div>

                        <label class="field field-wide" *ngIf="canManageOrganization">
                          <span>Commentaire simple</span>
                          <textarea
                            [ngModel]="getWorksiteCoordinationDraft(item.id).commentText"
                            [name]="'worksiteStandaloneCoordinationComment' + item.id"
                            rows="3"
                            placeholder="Ex. appeler le client avant l'intervention"
                            [disabled]="worksiteCoordinationBusyId === item.id"
                            (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { commentText: $event })"
                          ></textarea>
                        </label>

                        <div class="inline-actions" *ngIf="canManageOrganization">
                          <cfm-button
                            type="button"
                            [disabled]="worksiteCoordinationBusyId === item.id"
                            (click)="saveWorksiteCoordination(item)"
                          >
                            {{
                              worksiteCoordinationBusyId === item.id
                                ? "Enregistrement en cours"
                                : "Enregistrer"
                            }}
                          </cfm-button>
                        </div>
                      </section>
                    </li>
                  </ul>

                  <ng-template #emptyStandaloneWorksiteOverview>
                    <p class="small">
                      {{
                        hasActiveCoordinationFilters
                          ? "Aucun chantier ne correspond aux filtres de coordination."
                          : "Aucun chantier à afficher pour le moment."
                      }}
                    </p>
                  </ng-template>
                </ng-container>

                <ng-template #standaloneWorksiteDisabled>
                  <cfm-empty-state
                    title="Module Chantier non activé"
                    description="Activez le module Chantier pour afficher les chantiers dans cette vue."
                  />
                </ng-template>
              </section>
            </cfm-card>
          </ng-template>

    
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem;
        background:
          radial-gradient(circle at top, rgba(245, 188, 88, 0.16), transparent 22%),
          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);
      }

      .shell-workspace {
        place-items: start center;
        background:
          radial-gradient(circle at top left, rgba(201, 224, 215, 0.58), transparent 28%),
          radial-gradient(circle at top right, rgba(245, 188, 88, 0.2), transparent 24%),
          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);
      }

      .workspace {
        width: min(1100px, 100%);
        display: grid;
        gap: 1.4rem;
        padding-bottom: 2rem;
      }

      .app-shell {
        align-content: start;
      }

      .workspace-body,
      .workspace-page {
        display: grid;
        gap: 1.4rem;
      }

      .workspace-feedback-stack {
        width: min(1100px, 100%);
        display: grid;
        gap: 0.55rem;
        margin-top: 0.55rem;
        align-content: start;
      }

      .desktop-card {
        width: min(1100px, 100%);
        position: relative;
        isolation: isolate;
      }

      .auth-form,
      .modules,
      .session-header,
      .session-actions,
      .organization-switch,
      .customer-form,
      .billing-form,
      .profile-form,
      .site-form,
      .duerp-form,
      .evidence-form {
        display: grid;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      h2 {
        font-size: 1.75rem;
        color: var(--cfm-color-ink);
      }

      h3 {
        font-size: 1rem;
        color: var(--cfm-color-ink);
      }

      .auth-form,
      .customer-form,
      .billing-form,
      .profile-form,
      .site-form,
      .building-safety-form,
      .duerp-form,
      .evidence-form {
        gap: 1rem;
      }

      .meta,
      .small,
      .modules p,
      .feedback,
      .organization-switch span,
      .field span,
      .customer-copy span,
      .site-copy span,
      .building-safety-copy span,
      .duerp-copy span,
      .obligation-copy span {
        color: var(--cfm-color-copy-muted);
      }

      .organization-switch,
      .field {
        gap: 0.35rem;
        width: 100%;
      }

      .field {
        display: grid;
      }

      .field span {
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      .field-wide {
        grid-column: 1 / -1;
      }

      select,
      textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--cfm-color-border);
        border-radius: var(--cfm-radius-field);
        padding: 0.85rem 1rem;
        font: inherit;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 252, 0.94));
        color: var(--cfm-color-ink);
        transition:
          border-color 0.18s ease,
          box-shadow 0.18s ease,
          background-color 0.18s ease,
          transform 0.18s ease;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          0 10px 22px rgba(18, 33, 42, 0.04);
      }

      textarea {
        resize: vertical;
        min-height: 6.5rem;
      }

      select:focus,
      textarea:focus {
        outline: none;
        border-color: #8ba79a;
        background: #ffffff;
        box-shadow:
          0 0 0 4px rgba(139, 167, 154, 0.16),
          0 14px 30px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(15, 23, 42, 0.03);
        transform: translateY(-1px);
      }

      .session-header {
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 0.58rem;
        align-items: start;
      }

      .session-actions {
        gap: 0.55rem;
        justify-items: end;
        min-width: 0;
      }

      .workspace-shell-copy,
      .workspace-shell-actions {
        display: grid;
        gap: 0.38rem;
        min-width: 0;
      }

      .workspace-shell-meta {
        font-weight: 500;
        letter-spacing: 0.01em;
        line-height: 1.25;
      }

      .app-nav {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
        min-width: 0;
        margin-top: -0.24rem;
        padding: 0.28rem 0.38rem 0.34rem;
        border: 1px solid rgba(137, 160, 149, 0.12);
        border-radius: 1rem;
        background:
          linear-gradient(180deg, rgba(252, 253, 252, 0.94), rgba(246, 249, 247, 0.97));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          0 4px 10px rgba(18, 33, 42, 0.028);
      }

      .app-nav-link {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        padding: 0.18rem 0.22rem;
        border-radius: 999px;
        text-decoration: none;
        opacity: 0.96;
        transition:
          transform 0.16s ease,
          opacity 0.16s ease,
          background-color 0.16s ease,
          box-shadow 0.16s ease;
      }

      .app-nav-link:hover {
        transform: translateY(-1px);
        background: rgba(137, 160, 149, 0.09);
      }

      .app-nav-link.is-active {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.92);
        box-shadow:
          inset 0 0 0 1px rgba(137, 160, 149, 0.2),
          0 6px 14px rgba(18, 33, 42, 0.04);
      }

      .nav-icon-placeholder {
        display: none;
      }

      .meta,
      .small {
        margin-top: 0.16rem;
      }

      @media (max-width: 1280px) {
        .session-header {
          grid-template-columns: minmax(0, 1.18fr) minmax(280px, 0.82fr);
          gap: 0.5rem;
        }

        .workspace-shell-copy,
        .workspace-shell-actions {
          gap: 0.32rem;
        }

        .session-actions {
          gap: 0.46rem;
        }
      }

      @media (max-width: 1180px) {
        .session-header {
          grid-template-columns: minmax(0, 1fr);
          gap: 0.44rem;
        }

        .session-actions {
          justify-items: start;
          gap: 0.42rem;
        }

        .workspace-shell-copy,
        .workspace-shell-actions {
          gap: 0.28rem;
        }

        .app-nav {
          margin-top: -0.18rem;
          padding: 0.24rem 0.32rem 0.3rem;
        }
      }

      @media (max-width: 820px) {
        .app-nav {
          gap: 0.3rem;
          padding: 0.22rem 0.26rem 0.28rem;
        }

        .app-nav-link {
          padding: 0.14rem 0.18rem;
        }
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      article {
        position: relative;
        overflow: hidden;
        padding: 1.3rem;
        border-radius: 24px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(247, 243, 234, 0.84)),
          #f4f1ea;
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          0 16px 36px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease,
          border-color 0.18s ease;
      }

      article::before {
        content: "";
        position: absolute;
        inset: 0 0 auto;
        height: 3px;
        background: linear-gradient(90deg, rgba(29, 109, 100, 0.88), rgba(245, 188, 88, 0.72));
        opacity: 0.95;
      }

      article:hover {
        transform: translateY(-2px);
        box-shadow:
          0 22px 44px rgba(18, 33, 42, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.84);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .stack-list,
      .module-list,
      .customer-list,
      .site-list,
      .obligation-list,
      .alert-list,
      .building-safety-list,
      .billing-list,
      .duerp-list,
      .evidence-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .stack-list,
      .module-list,
      .customer-list,
      .site-list,
      .obligation-list,
      .alert-list,
      .building-safety-list,
      .billing-list,
      .duerp-list,
      .evidence-list {
        display: grid;
        gap: 0.85rem;
      }

      .stack-list li,
      .module-list li,
      .customer-list li,
      .site-list li,
      .alert-list li,
      .building-safety-list li,
      .billing-list li,
      .duerp-list li,
      .evidence-list li {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 1rem;
        position: relative;
        padding: 1.08rem 1.15rem;
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 250, 249, 0.78));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          0 12px 24px rgba(18, 33, 42, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease,
          border-color 0.18s ease;
      }

      .stack-list li:hover,
      .module-list li:hover,
      .customer-list li:hover,
      .site-list li:hover,
      .alert-list li:hover,
      .building-safety-list li:hover,
      .billing-list li:hover,
      .duerp-list li:hover,
      .evidence-list li:hover {
        transform: translateY(-1px);
        box-shadow:
          0 16px 30px rgba(18, 33, 42, 0.07),
          inset 0 1px 0 rgba(255, 255, 255, 0.82);
        border-color: rgba(29, 109, 100, 0.14);
      }

      .list-copy,
      .module-copy,
      .customer-copy,
      .site-copy,
      .building-safety-copy,
      .duerp-copy {
        display: grid;
        gap: 0.25rem;
      }

      .obligation-copy {
        display: grid;
        gap: 0.45rem;
        padding: 1.1rem 1.15rem;
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(244, 246, 241, 0.96), rgba(255, 255, 255, 0.86));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);
      }

      .obligation-detail {
        display: grid;
        gap: 1rem;
        margin-top: 1.25rem;
        padding: 1.2rem 1.25rem;
        border-radius: 24px;
        background:
          linear-gradient(180deg, rgba(238, 243, 239, 0.96), rgba(255, 255, 255, 0.8));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          0 16px 34px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        animation: panelReveal 180ms ease;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .detail-block,
      .detail-copy {
        display: grid;
        gap: 0.45rem;
      }

      .detail-block {
        padding: 1.05rem;
        border-radius: 20px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(250, 252, 252, 0.74));
        border: 1px solid rgba(15, 23, 42, 0.05);
      }

      .detail-list {
        list-style: disc;
        padding-left: 1.25rem;
        margin: 0;
        display: grid;
        gap: 0.45rem;
        color: var(--cfm-color-copy-muted);
      }

      .detail-evidence-row {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 1rem;
      }

      .list-copy span {
        color: var(--cfm-color-copy-muted);
      }

      .modules {
        gap: 1rem;
        padding: 1.42rem 1.48rem;
        border-radius: 28px;
        background:
          linear-gradient(180deg, rgba(245, 249, 249, 0.96), rgba(234, 241, 239, 0.94));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.82),
          0 18px 40px rgba(18, 33, 42, 0.06);
      }

      .modules-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }

      .card-header-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.05rem;
        margin: 1.15rem 0 1.35rem;
      }

      .dashboard-kpi-card,
      .dashboard-alert-copy {
        display: grid;
        gap: 0.35rem;
      }

      .dashboard-kpi-card {
        position: relative;
        overflow: hidden;
        padding: 1.08rem 1.12rem 1.12rem;
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 246, 241, 0.92));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          0 14px 28px rgba(18, 33, 42, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.84);
      }

      .dashboard-kpi-card::after {
        content: "";
        position: absolute;
        inset: auto 0 0;
        height: 48%;
        background: linear-gradient(180deg, transparent, rgba(29, 109, 100, 0.06));
        pointer-events: none;
      }

      .dashboard-module-highlights {
        list-style: none;
        padding: 0;
        margin: 0.2rem 0 0;
        display: grid;
        gap: 0.55rem;
      }

      .dashboard-module-highlights li {
        display: grid;
        gap: 0.15rem;
        padding-top: 0.55rem;
        border-top: 1px solid rgba(15, 23, 42, 0.08);
      }

      .dashboard-kpi-value {
        font-size: 2.15rem;
        line-height: 0.96;
        letter-spacing: -0.03em;
        color: var(--cfm-color-ink);
      }

      .dashboard-alerts {
        display: grid;
        gap: 0.9rem;
        padding: 1.08rem 1.15rem;
        border-radius: 24px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(246, 250, 249, 0.74));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 14px 28px rgba(18, 33, 42, 0.05);
      }

      .dashboard-actions {
        display: grid;
        gap: 0.9rem;
        margin-top: 1.35rem;
        padding: 1.08rem 1.15rem;
        border-radius: 24px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(246, 250, 249, 0.74));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 14px 28px rgba(18, 33, 42, 0.05);
      }

      .dashboard-actions-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: end;
        gap: 1rem;
      }

      .dashboard-action-copy {
        display: grid;
        gap: 0.35rem;
      }

      .dashboard-filter {
        max-width: 240px;
      }

      .dashboard-alert-copy span {
        line-height: 1.35;
      }

      .toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
      }

      .toggle input {
        width: auto;
      }

      .profile-form {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .auth-form,
      .customer-form,
      .billing-form,
      .profile-form,
      .site-form,
      .building-safety-form,
      .duerp-form,
      .evidence-form,
      .feedback-capture-form {
        padding: 1.1rem 1.15rem;
        border-radius: 24px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(247, 250, 249, 0.82));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          0 14px 32px rgba(18, 33, 42, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.84);
      }

      .customer-form {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: end;
        margin: 1.25rem 0;
      }

      .site-form {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: end;
        margin-bottom: 1rem;
      }

      .billing-form,
      .building-safety-form,
      .duerp-form,
      .evidence-form {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: end;
        margin: 1.25rem 0;
      }

      .billing-lines {
        display: grid;
        gap: 1rem;
      }

      .billing-line-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .billing-line-editor {
        display: grid;
        grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr)) auto;
        align-items: end;
        gap: 0.75rem;
        padding: 1.02rem;
        border-radius: 20px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 250, 249, 0.76));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.05);
      }

      .form-actions {
        display: flex;
        align-items: end;
      }

      .inline-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
      }

      .billing-item-actions {
        display: grid;
        gap: 0.8rem;
        justify-items: stretch;
        align-content: start;
        min-width: min(260px, 100%);
        padding: 0.15rem;
      }

      .compact-field {
        min-width: 180px;
        padding: 0.85rem 0.95rem;
        border-radius: 20px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 250, 249, 0.76));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.8),
          0 10px 22px rgba(18, 33, 42, 0.04);
      }

      .inline-choice-list {
        display: grid;
        gap: 0.5rem;
        padding: 0.9rem 1rem;
        border-radius: 20px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 250, 249, 0.78));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);
      }

      .inline-choice {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .inline-choice input {
        width: auto;
      }

      .document-linked-panel {
        display: grid;
        gap: 0.8rem;
        padding: 1.05rem;
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 245, 242, 0.82));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          0 16px 34px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.82);
        animation: panelReveal 180ms ease;
      }

      .payment-form {
        display: grid;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 20px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 250, 249, 0.76));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);
      }

      .document-adjustment-form {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
        padding: 1.08rem;
        margin-top: 0.9rem;
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(239, 245, 242, 0.84));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          0 18px 38px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.84);
        animation: panelReveal 180ms ease;
      }

      .document-preview,
      .document-preview-header {
        display: grid;
        gap: 0.65rem;
      }

      .feedback-capture-form {
        display: grid;
        gap: 1rem;
      }

      .document-preview {
        padding: 1.05rem;
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(238, 243, 239, 0.96), rgba(255, 255, 255, 0.82));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 12px 28px rgba(18, 33, 42, 0.05);
      }

      .feedback-preview-text {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        font: inherit;
        color: var(--cfm-color-copy-muted);
      }

      .billing-history {
        display: grid;
        gap: 0.75rem;
        padding: 1.04rem;
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 245, 242, 0.82));
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow:
          0 16px 34px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.82);
        animation: panelReveal 180ms ease;
      }

      .history-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.75rem;
      }

      .history-copy {
        display: grid;
        gap: 0.2rem;
      }

      .history-list li {
        padding: 0.9rem 0.95rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(15, 23, 42, 0.05);
        box-shadow: 0 10px 22px rgba(18, 33, 42, 0.04);
      }

      .site-heading {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }

      .obligation-heading {
        display: flex;
        flex-wrap: wrap;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .criteria-chips {
        margin: 1rem 0 1.2rem;
      }

      .building-safety-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: end;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .feedback {
        position: relative;
        display: grid;
        gap: 0.2rem;
        margin-top: 1rem;
        padding: 0.95rem 1rem 0.95rem 1.15rem;
        border-radius: 20px;
        border: 1px solid rgba(15, 23, 42, 0.06);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 250, 249, 0.84));
        box-shadow:
          0 14px 30px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.82);
        animation: feedbackPulse 220ms ease;
      }

      .workspace-feedback-stack .feedback {
        margin-top: 0;
      }

      .feedback::before {
        content: "";
        position: absolute;
        left: 0.8rem;
        top: 0.95rem;
        bottom: 0.95rem;
        width: 4px;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.24;
      }

      .feedback.error {
        color: #8a2d2d;
        border-color: rgba(138, 45, 45, 0.16);
        background:
          linear-gradient(180deg, rgba(254, 243, 241, 0.98), rgba(255, 255, 255, 0.88));
      }

      .feedback.success {
        color: #1f6a47;
        border-color: rgba(31, 106, 71, 0.16);
        background:
          linear-gradient(180deg, rgba(239, 250, 245, 0.98), rgba(255, 255, 255, 0.88));
      }

      .feedback.progress {
        color: #7c5b20;
        border-color: rgba(124, 91, 32, 0.18);
        background:
          linear-gradient(180deg, rgba(255, 247, 228, 0.98), rgba(255, 255, 255, 0.88));
      }

      .feedback-title,
      .feedback-body {
        margin: 0;
      }

      .feedback-title {
        font-size: 0.84rem;
        line-height: 1.2;
        font-weight: 700;
        letter-spacing: 0.01em;
      }

      .feedback-body {
        line-height: 1.4;
      }

      .loading-state-card {
        display: grid;
        gap: 0.85rem;
        padding: 0.15rem 0 0.2rem;
      }

      .loading-state-skeleton,
      .loading-state-copy {
        display: grid;
      }

      .loading-state-skeleton {
        gap: 1rem;
      }

      .loading-state-hero,
      .loading-state-grid span,
      .loading-state-lines span {
        display: block;
        border-radius: 999px;
        background:
          linear-gradient(90deg, rgba(255, 255, 255, 0.72), rgba(232, 239, 237, 0.96), rgba(255, 255, 255, 0.72));
        background-size: 220% 100%;
        animation: skeletonPulse 1.35s ease-in-out infinite;
      }

      .loading-state-hero {
        height: 1.1rem;
        width: min(320px, 72%);
      }

      .loading-state-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .loading-state-grid span {
        height: 5.6rem;
        border-radius: 22px;
      }

      .loading-state-lines {
        display: grid;
        gap: 0.7rem;
      }

      .loading-state-lines span {
        height: 0.95rem;
      }

      .loading-state-lines span:nth-child(2) {
        width: 88%;
      }

      .loading-state-lines span:nth-child(3) {
        width: 68%;
      }

      .loading-state-copy {
        gap: 0.24rem;
        max-width: 44ch;
      }

      .loading-state-label {
        margin: 0;
        font-size: 0.92rem;
        line-height: 1.25;
        font-weight: 650;
        color: #17312b;
      }

      @keyframes skeletonPulse {
        0% {
          background-position: 100% 50%;
        }

        100% {
          background-position: 0% 50%;
        }
      }

      @keyframes panelReveal {
        from {
          opacity: 0;
          transform: translateY(6px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes feedbackPulse {
        from {
          opacity: 0;
          transform: translateY(4px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      code {
        font-family: "SFMono-Regular", "Menlo", monospace;
        font-size: 0.92em;
      }

      @media (max-width: 900px) {
        .profile-form,
        .customer-form,
        .billing-form,
        .site-form,
        .building-safety-form,
        .duerp-form,
        .evidence-form,
        .document-adjustment-form,
        .billing-line-editor,
        .detail-grid,
        .loading-state-grid {
          grid-template-columns: 1fr;
        }

        .session-actions {
          justify-items: stretch;
        }

        .card-header-actions {
          align-items: stretch;
        }

        .site-list li,
        .customer-list li,
        .building-safety-list li,
        .billing-list li,
        .duerp-list li,
        .evidence-list li,
        .detail-evidence-row,
        .alert-list li,
        .module-list li,
        .stack-list li {
          flex-direction: column;
        }

        .billing-item-actions {
          min-width: 0;
          width: 100%;
        }
      }
    `
  ]
})
export class AppComponent implements DoCheck, DesktopShellContext {
  private static readonly REGULATORY_WORKSPACE_SEGMENT_LABELS = [
    "building-safety-alerts",
    "duerp-entries",
    "regulatory-evidences",
  ] as const;
  private static readonly DISABLE_BOOTSTRAP_SESSION_RESTORE = false;
  private static readonly DISABLE_DO_CHECK_PERSISTENCE = false;
  private static readonly WORKSPACE_LOADING_DISABLED = false;
  private static readonly WORKSPACE_DEBUG_ONLY_LABEL: string | null = null;
  private static readonly DISABLE_DEFERRED_WORKSPACE_SCROLL = false;
  private readonly router = inject(Router);
  email = "";
  password = "";
  loading = false;
  errorMessage = "";
  feedbackMessage = "";
  session: AuthSession | null = null;
  accessToken = getStoredAccessToken();
  selectedOrganizationId = getStoredOrganizationId();
  sessionRestoreInProgress = false;
  organizationWorkspaceLoading = false;
  private workspaceRefreshInFlight: Promise<void> | null = null;
  private workspaceRefreshScheduledHandle: ReturnType<typeof globalThis.setTimeout> | null = null;
  private workspaceRefreshScheduledOrganizationId: string | null = null;
  private workspaceRefreshScheduledReason: string | null = null;
  private workspaceHydratedOrganizationId: string | null = null;
  private workspaceSegmentIssues: Partial<Record<string, string>> = {};
  regulatoryExporting = false;
  organizationProfileSaving = false;
  organizationSiteSaving = false;
  organizationSiteStatusBusyId: string | null = null;
  organizationProfile: OrganizationRecord | null = null;
  organizationSites: OrganizationSiteRecord[] = [];
  regulatoryProfile: OrganizationRegulatoryProfileRecord | null = null;
  selectedObligationId: string | null = null;
  customerSaving = false;
  customerEditingId: string | null = null;
  customerSearchTerm = "";
  billingCustomers: BillingCustomerRecord[] = [];
  billingWorksites: WorksiteApiSummary[] = [];
  worksiteDocuments: WorksiteDocumentRecord[] = [];
  worksiteProofs: WorksiteProofRecord[] = [];
  worksiteSignatures: WorksiteSignatureRecord[] = [];
  worksiteAssignees: WorksiteAssigneeRecord[] = [];
  selectedWorksiteCoordinationId: string | null = null;
  selectedCoordinationStatusFilter: CoordinationStatusFilter = "all";
  selectedCoordinationAssigneeFilter: CoordinationAssigneeFilter = "all";
  selectedWorksiteDocumentFilterId = "all";
  selectedWorksiteDocumentTypeFilter = "all";
  selectedWorksiteDocumentLifecycleFilter: WorksiteDocumentLifecycleFilter = "all";
  selectedWorksiteDocumentDetailId: string | null = null;
  worksiteDocumentDownloadBusyId: string | null = null;
  worksiteDocumentPdfBusyId: string | null = null;
  worksiteCoordinationBusyId: string | null = null;
  worksiteDocumentCoordinationBusyId: string | null = null;
  worksiteDocumentStatusBusyId: string | null = null;
  worksiteDocumentProofBusyId: string | null = null;
  worksiteDocumentSignatureBusyId: string | null = null;
  worksitePreventionPlanPdfBusyId: string | null = null;
  worksitePreventionPlanEditingId: string | null = null;
  worksiteCoordinationDrafts: Record<string, CoordinationDraftForm> = {};
  worksiteDocumentCoordinationDrafts: Record<string, CoordinationDraftForm> = {};
  worksitePreventionPlanForm: WorksitePreventionPlanForm = {
    usefulDate: "",
    interventionContext: "",
    vigilancePoints: "",
    measurePoints: "",
    additionalContact: "",
  };
  private worksitePreventionPlanInitialForm: WorksitePreventionPlanForm | null = null;
  private billingDraftsHydratedScope: string | null = null;
  private quoteDraftSnapshot = "";
  private invoiceDraftSnapshot = "";
  quoteSaving = false;
  quoteEditingSaving = false;
  quoteEditingId: string | null = null;
  quoteStatusBusyId: string | null = null;
  quoteFollowUpBusyId: string | null = null;
  quoteWorksiteBusyId: string | null = null;
  quoteDuplicateBusyId: string | null = null;
  quotePdfBusyId: string | null = null;
  quoteHistoryBusyId: string | null = null;
  quoteHistoryOpenId: string | null = null;
  quoteHistoryById: Record<string, AuditLogRecord[]> = {};
  quotes: QuoteRecord[] = [];
  invoiceSaving = false;
  invoiceEditingSaving = false;
  invoiceEditingId: string | null = null;
  invoiceStatusBusyId: string | null = null;
  invoiceFollowUpBusyId: string | null = null;
  invoicePaymentBusyId: string | null = null;
  invoicePaymentId: string | null = null;
  invoiceWorksiteBusyId: string | null = null;
  invoicePdfBusyId: string | null = null;
  invoiceHistoryBusyId: string | null = null;
  invoiceHistoryOpenId: string | null = null;
  invoiceHistoryById: Record<string, AuditLogRecord[]> = {};
  invoices: InvoiceRecord[] = [];
  cockpitSummary: CockpitSummaryRecord | null = null;
  buildingSafetySaving = false;
  buildingSafetyStatusBusyId: string | null = null;
  buildingSafetyEditingId: string | null = null;
  buildingSafetyItems: BuildingSafetyItemRecord[] = [];
  buildingSafetyAlerts: BuildingSafetyAlertRecord[] = [];
  duerpSaving = false;
  duerpStatusBusyId: string | null = null;
  duerpEditingId: string | null = null;
  duerpEntries: DuerpEntryRecord[] = [];
  regulatoryEvidenceSaving = false;
  regulatoryEvidences: RegulatoryEvidenceRecord[] = [];
  selectedSafetySiteId = "all";
  selectedDashboardActionModule: DashboardActionModuleFilter = "all";
  betaFeedbackCategory: BetaFeedbackCategory = "improvement";
  betaFeedbackArea: BetaFeedbackArea = "cockpit";
  betaFeedbackMessageText = "";
  betaFeedbackNotice = "";
  betaFeedbackError = "";
  betaFeedbackCopyBusy = false;
  profileForm = {
    name: "",
    legalName: "",
    activityLabel: "",
    employeeCount: "",
    hasEmployees: "" as HasEmployeesValue,
    receivesPublic: "" as HasEmployeesValue,
    storesHazardousProducts: "" as HasEmployeesValue,
    performsHighRiskWork: "" as HasEmployeesValue,
    contactEmail: "",
    contactPhone: "",
    headquartersAddress: "",
    notes: ""
  };
  siteForm: {
    name: string;
    address: string;
    siteType: OrganizationSiteType;
  } = {
    name: "",
    address: "",
    siteType: "site"
  };
  customerForm: {
    name: string;
    customerType: BillingCustomerType;
    email: string;
    phone: string;
    address: string;
    notes: string;
  } = {
    name: "",
    customerType: "company",
    email: "",
    phone: "",
    address: "",
    notes: ""
  };
  quoteForm: {
    customerId: string;
    worksiteId: string;
    title: string;
    issueDate: string;
    validUntil: string;
    status: QuoteStatus;
    notes: string;
    lines: BillingLineForm[];
  } = {
    customerId: "",
    worksiteId: "",
    title: "",
    issueDate: this.getTodayDateValue(),
    validUntil: "",
    status: "draft",
    notes: "",
    lines: [this.createEmptyBillingLineForm()]
  };
  quoteEditForm: QuoteDraftForm = {
    customerId: "",
    worksiteId: "",
    title: "",
    issueDate: this.getTodayDateValue(),
    validUntil: "",
    status: "draft",
    notes: "",
    lines: [this.createEmptyBillingLineForm()]
  };
  invoiceForm: {
    customerId: string;
    worksiteId: string;
    title: string;
    issueDate: string;
    dueDate: string;
    status: InvoiceStatus;
    notes: string;
    lines: BillingLineForm[];
  } = {
    customerId: "",
    worksiteId: "",
    title: "",
    issueDate: this.getTodayDateValue(),
    dueDate: "",
    status: "draft",
    notes: "",
    lines: [this.createEmptyBillingLineForm()]
  };
  invoiceEditForm: InvoiceDraftForm = {
    customerId: "",
    worksiteId: "",
    title: "",
    issueDate: this.getTodayDateValue(),
    dueDate: "",
    status: "draft",
    notes: "",
    lines: [this.createEmptyBillingLineForm()]
  };
  invoicePaymentForm: {
    paidAmount: string;
    paidAt: string;
  } = {
    paidAmount: "",
    paidAt: this.getTodayDateValue()
  };
  buildingSafetyForm: {
    siteId: string;
    itemType: BuildingSafetyItemType;
    name: string;
    nextDueDate: string;
    lastCheckedAt: string;
    status: BuildingSafetyItemStatus;
    notes: string;
  } = {
    siteId: "",
    itemType: "fire_extinguisher",
    name: "",
    nextDueDate: "",
    lastCheckedAt: "",
    status: "active",
    notes: ""
  };
  duerpForm: {
    siteId: string;
    workUnitName: string;
    riskLabel: string;
    severity: DuerpSeverity;
    preventionAction: string;
  } = {
    siteId: "",
    workUnitName: "",
    riskLabel: "",
    severity: "medium",
    preventionAction: ""
  };
  regulatoryEvidenceForm: {
    linkKind: RegulatoryEvidenceLinkKind;
    obligationId: string;
    siteId: string;
    buildingSafetyItemId: string;
    duerpEntryId: string;
    fileName: string;
    documentType: string;
    notes: string;
  } = {
    linkKind: "obligation",
    obligationId: "",
    siteId: "",
    buildingSafetyItemId: "",
    duerpEntryId: "",
    fileName: "",
    documentType: "attestation",
    notes: ""
  };
  @ViewChild("homePageTemplate") private homePageTemplateRef?: TemplateRef<unknown>;
  @ViewChild("reglementationPageTemplate") private reglementationPageTemplateRef?: TemplateRef<unknown>;
  @ViewChild("chantierPageTemplate") private chantierPageTemplateRef?: TemplateRef<unknown>;
  @ViewChild("facturationPageTemplate") private facturationPageTemplateRef?: TemplateRef<unknown>;
  @ViewChild("coordinationPageTemplate") private coordinationPageTemplateRef?: TemplateRef<unknown>;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationCancel) {
        console.warn("[routing] navigation cancelled.", {
          url: event.url,
          reason: event.reason,
        });
      }
      if (event instanceof NavigationError) {
        console.error("[routing] navigation error.", {
          url: event.url,
          error: event.error,
        });
      }
      if (event instanceof NavigationEnd) {
        void this.handleRouteChange();
      }
    });

    void this.handleRouteChange();
  }

  getWorkspaceTemplate(name: WorkspaceTemplateName): TemplateRef<unknown> | null {
    switch (name) {
      case "home":
        return this.homePageTemplateRef ?? null;
      case "reglementation":
        return this.reglementationPageTemplateRef ?? null;
      case "chantier":
        return this.chantierPageTemplateRef ?? null;
      case "facturation":
        return this.facturationPageTemplateRef ?? null;
      case "coordination":
        return this.coordinationPageTemplateRef ?? null;
      default:
        return null;
    }
  }

  ngDoCheck(): void {
    if (AppComponent.DISABLE_DO_CHECK_PERSISTENCE) {
      return;
    }
    this.persistBillingDraftsIfNeeded();
  }

  get currentMembership(): MembershipAccess | null {
    return this.session?.current_membership ?? null;
  }

  get activeSessionModules(): ModuleCode[] {
    const membership = this.currentMembership;

    if (!membership) {
      return [];
    }

    const modulesFromEnabledList = membership.enabled_modules ?? [];
    const modulesFromRecords =
      membership.modules
        ?.filter((module) => module.is_enabled)
        .map((module) => module.module_code)
      ?? [];

    return Array.from(new Set([...modulesFromEnabledList, ...modulesFromRecords]));
  }

  get shouldRenderLoginScreen(): boolean {
    return this.isLoginRoutePath(this.router.url.split("#")[0] || "/login");
  }

  get canManageModules(): boolean {
    return this.currentMembership?.permissions.includes("modules:manage") ?? false;
  }

  get canManageOrganization(): boolean {
    return this.currentMembership?.permissions.includes("organization:update") ?? false;
  }

  get canReadOrganization(): boolean {
    return this.currentMembership?.permissions.includes("organization:read") ?? false;
  }

  get canReadUsers(): boolean {
    return this.currentMembership?.permissions.includes("users:read") ?? false;
  }

  get desktopNavigationItems(): Array<{ route: string; label: string; tone: CfmTone }> {
    const items: Array<{ route: string; label: string; tone: CfmTone }> = [
      { route: "/app/home", label: "Cockpit", tone: "calm" },
    ];

    if (this.isReglementationEnabled) {
      items.push({ route: "/app/reglementation", label: "Réglementation", tone: "progress" });
    }

    if (this.isChantierEnabled) {
      items.push({ route: "/app/chantier", label: "Chantier", tone: "calm" });
      items.push({ route: "/app/chantier/documents", label: "Documents", tone: "neutral" });
      items.push({ route: "/app/chantier/coordination", label: "Coordination", tone: "progress" });
    }

    if (this.isFacturationEnabled) {
      items.push({ route: "/app/facturation", label: "Facturation", tone: "calm" });
    }

    return items;
  }

  get isReglementationEnabled(): boolean {
    return this.activeSessionModules.includes("reglementation");
  }

  get isFacturationEnabled(): boolean {
    return this.activeSessionModules.includes("facturation");
  }

  get isChantierEnabled(): boolean {
    return this.activeSessionModules.includes("chantier");
  }

  get homeUsedModuleCodes(): ModuleCode[] {
    return this.activeSessionModules.filter((moduleCode) =>
      moduleCode === "reglementation" || moduleCode === "chantier" || moduleCode === "facturation"
    );
  }

  get isWorkspaceHydratedForCurrentOrganization(): boolean {
    return Boolean(
      this.selectedOrganizationId
      && this.workspaceHydratedOrganizationId === this.selectedOrganizationId
    );
  }

  get isReglementationDataPending(): boolean {
    return this.isModuleDataPending("reglementation");
  }

  get isReglementationDataDelayed(): boolean {
    return Boolean(
      this.isReglementationEnabled
      && this.regulatoryWorkspaceNotice
      && !this.regulatoryProfile
      && this.buildingSafetyItems.length === 0
      && this.buildingSafetyAlerts.length === 0
      && this.duerpEntries.length === 0
      && this.regulatoryEvidences.length === 0
    );
  }

  get regulatoryWorkspaceNotice(): string | null {
    if (!this.isReglementationEnabled) {
      return null;
    }

    const messages = AppComponent.REGULATORY_WORKSPACE_SEGMENT_LABELS
      .map((label) => this.workspaceSegmentIssues[label])
      .filter((message): message is string => Boolean(message));

    if (messages.length === 0) {
      return null;
    }

    return "Les données réglementaires mettent plus de temps à remonter. Le reste du cockpit reste disponible.";
  }

  get isFacturationDataPending(): boolean {
    return this.isModuleDataPending("facturation");
  }

  get isChantierDataPending(): boolean {
    return this.isModuleDataPending("chantier");
  }

  getModuleNavigationLabel(moduleCode: ModuleCode): string {
    switch (moduleCode) {
      case "reglementation":
        return "Réglementation";
      case "chantier":
        return "Chantier";
      case "facturation":
        return "Facturation";
    }
  }

  get hasWorkspaceContent(): boolean {
    return Boolean(
      this.cockpitSummary
      || this.organizationProfile
      || this.organizationSites.length > 0
      || this.regulatoryProfile
      || this.billingCustomers.length > 0
      || this.billingWorksites.length > 0
      || this.worksiteDocuments.length > 0
      || this.worksiteProofs.length > 0
      || this.worksiteSignatures.length > 0
      || this.quotes.length > 0
      || this.invoices.length > 0
      || this.buildingSafetyItems.length > 0
      || this.buildingSafetyAlerts.length > 0
      || this.duerpEntries.length > 0
      || this.regulatoryEvidences.length > 0
    );
  }

  get shouldShowWorkspaceContent(): boolean {
    return !this.organizationWorkspaceLoading || this.hasWorkspaceContent;
  }

  get shouldShowInitialWorkspaceLoading(): boolean {
    return this.organizationWorkspaceLoading && !this.hasWorkspaceContent;
  }

  get isWorkspaceRefreshing(): boolean {
    return this.organizationWorkspaceLoading && this.hasWorkspaceContent;
  }

  get hasBetaFeedbackDraft(): boolean {
    return this.betaFeedbackMessageText.trim().length > 0;
  }

  get canCopyBetaFeedback(): boolean {
    return this.hasBetaFeedbackDraft;
  }

  get betaFeedbackPreviewText(): string {
    return [
      "Retour beta Conforméo",
      `Type : ${this.getBetaFeedbackCategoryLabel(this.betaFeedbackCategory)}`,
      `Zone : ${this.getBetaFeedbackAreaLabel(this.betaFeedbackArea)}`,
      "",
      this.betaFeedbackMessageText.trim(),
    ].join("\n");
  }

  get isOnboardingPending(): boolean {
    return !this.organizationProfile?.onboarding_completed_at;
  }

  get isQualificationQuestionnaireComplete(): boolean {
    return Boolean(
      this.profileForm.receivesPublic
      && this.profileForm.storesHazardousProducts
      && this.profileForm.performsHighRiskWork
    );
  }

  get canSubmitOnboarding(): boolean {
    return Boolean(
      this.profileForm.name.trim()
      && this.profileForm.activityLabel.trim()
      && this.profileForm.contactEmail.trim()
      && this.profileForm.hasEmployees
    );
  }

  get canCreateSite(): boolean {
    return Boolean(this.siteForm.name.trim() && this.siteForm.address.trim());
  }

  get canSaveCustomer(): boolean {
    return Boolean(this.customerForm.name.trim());
  }

  get isCustomerEditing(): boolean {
    return this.customerEditingId !== null;
  }

  get filteredBillingCustomers(): BillingCustomerRecord[] {
    const query = this.toSearchableText(this.customerSearchTerm);
    if (!query) {
      return this.billingCustomers;
    }

    return this.billingCustomers.filter((customer) =>
      [customer.name, customer.email, customer.phone].some((value) =>
        this.toSearchableText(value).includes(query)
      )
    );
  }

  get customerSearchCountLabel(): string {
    const total = this.billingCustomers.length;
    const visible = this.filteredBillingCustomers.length;
    const label = total > 1 ? "clients" : "client";

    if (this.toSearchableText(this.customerSearchTerm)) {
      return `${visible} sur ${total} ${label}`;
    }

    return `${total} ${label}`;
  }

  get activeWorksitePreventionPlanPreview(): WorksitePreventionPlanPreview | null {
    if (!this.worksitePreventionPlanEditingId) {
      return null;
    }

    const worksite = this.billingWorksites.find((entry) => entry.id === this.worksitePreventionPlanEditingId);
    if (!worksite) {
      return null;
    }

    return this.buildWorksitePreventionPlanPreview(worksite);
  }

  getWorksiteAssigneeOptionLabel(assignee: WorksiteAssigneeRecord): string {
    return `${assignee.display_name} · ${assignee.role_code}`;
  }

  toggleWorksiteCoordination(worksiteId: string): void {
    this.selectedWorksiteCoordinationId =
      this.selectedWorksiteCoordinationId === worksiteId ? null : worksiteId;
  }

  getWorksiteCoordinationDraft(worksiteId: string): CoordinationDraftForm {
    const existingDraft = this.worksiteCoordinationDrafts[worksiteId];
    if (existingDraft) {
      return existingDraft;
    }

    const worksite = this.billingWorksites.find((entry) => entry.id === worksiteId);
    const draft = this.buildCoordinationDraft(worksite?.coordination ?? null);
    this.worksiteCoordinationDrafts = {
      ...this.worksiteCoordinationDrafts,
      [worksiteId]: draft,
    };
    return draft;
  }

  getWorksiteDocumentCoordinationDraft(documentId: string): CoordinationDraftForm {
    const existingDraft = this.worksiteDocumentCoordinationDrafts[documentId];
    if (existingDraft) {
      return existingDraft;
    }

    const document = this.worksiteDocuments.find((entry) => entry.id === documentId);
    const draft = this.buildCoordinationDraft(document?.coordination ?? null);
    this.worksiteDocumentCoordinationDrafts = {
      ...this.worksiteDocumentCoordinationDrafts,
      [documentId]: draft,
    };
    return draft;
  }

  updateWorksiteCoordinationDraft(
    worksiteId: string,
    patch: Partial<CoordinationDraftForm>,
  ): void {
    this.worksiteCoordinationDrafts = {
      ...this.worksiteCoordinationDrafts,
      [worksiteId]: {
        ...this.getWorksiteCoordinationDraft(worksiteId),
        ...patch,
      },
    };
  }

  updateWorksiteDocumentCoordinationDraft(
    documentId: string,
    patch: Partial<CoordinationDraftForm>,
  ): void {
    this.worksiteDocumentCoordinationDrafts = {
      ...this.worksiteDocumentCoordinationDrafts,
      [documentId]: {
        ...this.getWorksiteDocumentCoordinationDraft(documentId),
        ...patch,
      },
    };
  }

  private buildCoordinationDraft(coordination: WorksiteCoordinationRecord | null): CoordinationDraftForm {
    return {
      status: coordination?.status ?? "todo",
      assigneeUserId: coordination?.assignee_user_id ?? "",
      commentText: coordination?.comment_text ?? "",
    };
  }

  private buildDashboardCoordinationState(coordination: WorksiteCoordinationRecord): DashboardCoordinationState {
    const commentText = coordination.comment_text?.trim() ? coordination.comment_text.trim() : null;
    const updatedAtLabel = this.formatCompactDate(coordination.updated_at);
    return {
      status: coordination.status,
      statusLabel: this.getWorksiteCoordinationStatusLabel(coordination.status),
      statusTone: this.getWorksiteCoordinationStatusTone(coordination.status),
      assigneeUserId: coordination.assignee_user_id,
      assigneeDisplayName: coordination.assignee_display_name,
      assigneeLabel: coordination.assignee_display_name ?? "Non affecté",
      commentText,
      commentSummary:
        commentText
          ? `Commentaire : ${commentText}`
          : "Commentaire : aucun commentaire simple",
      updatedAtLabel,
    };
  }

  private mapDashboardWorksiteDocumentItem(document: WorksiteDocumentRecord): DashboardWorksiteDocumentItem {
    return {
      id: document.id,
      title: document.document_type_label,
      documentType: document.document_type,
      fileName: document.file_name,
      worksiteId: document.worksite_id,
      worksiteName: document.worksite_name,
      lifecycleStatus: document.lifecycle_status,
      lifecycleStatusLabel: this.getWorksiteDocumentLifecycleStatusLabel(document.lifecycle_status),
      lifecycleStatusTone: this.getWorksiteDocumentLifecycleStatusTone(document.lifecycle_status),
      technicalStatusLabel: this.getWorksiteDocumentTechnicalStatusLabel(document.status),
      technicalStatusTone: this.getWorksiteDocumentTechnicalStatusTone(document.status),
      typeLabel: document.document_type_label,
      proofCount: document.linked_proofs.length,
      proofCountLabel: this.getWorksiteDocumentProofCountLabel(document.linked_proofs.length),
      signatureStatusLabel: this.getWorksiteDocumentSignatureStatusLabel(document.linked_signature_id),
      signatureStatusTone: this.getWorksiteDocumentSignatureStatusTone(document.linked_signature_id),
      linkedSignature: this.mapLinkedWorksiteSignatureItem(document),
      linkedSignatureId: document.linked_signature_id,
      linkedSignatureLabel: document.linked_signature_label,
      linkedSignatureDetail: this.formatWorksiteLinkedSignatureDetail(document),
      linkedProofs: this.mapLinkedWorksiteProofItems(document),
      linkedProofsSummary: this.formatWorksiteLinkedProofsSummary(document),
      hasStoredFile: document.has_stored_file,
      fileAvailabilityLabel: this.getWorksiteDocumentFileAvailabilityLabel(document),
      fileAvailabilityTone: this.getWorksiteDocumentFileAvailabilityTone(document),
      fileSizeLabel: this.formatFileSize(document.size_bytes),
      uploadedAtValue: document.uploaded_at,
      uploadedAtLabel: this.formatCompactDate(document.uploaded_at),
      notes: document.notes,
      coordination: this.buildDashboardCoordinationState(document.coordination),
    };
  }

  private matchesCoordinationFilters(coordination: DashboardCoordinationState): boolean {
    return this.matchesCoordinationStatusFilter(coordination) && this.matchesCoordinationAssigneeFilter(coordination);
  }

  private matchesCoordinationStatusFilter(coordination: DashboardCoordinationState): boolean {
    return this.selectedCoordinationStatusFilter === "all"
      ? true
      : coordination.status === this.selectedCoordinationStatusFilter;
  }

  private matchesCoordinationAssigneeFilter(coordination: DashboardCoordinationState): boolean {
    if (this.selectedCoordinationAssigneeFilter === "all") {
      return true;
    }
    if (this.selectedCoordinationAssigneeFilter === "unassigned") {
      return !coordination.assigneeUserId;
    }
    return coordination.assigneeUserId === this.selectedCoordinationAssigneeFilter;
  }

  private isCoordinationPending(coordination: DashboardCoordinationState): boolean {
    return coordination.status === "todo" || coordination.status === "in_progress";
  }

  get worksiteDocumentFilterOptions(): WorksiteApiSummary[] {
    const worksiteIds = new Set(this.worksiteDocuments.map((document) => document.worksite_id));
    return this.billingWorksites
      .filter((worksite) => worksiteIds.has(worksite.id))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  get worksiteDocumentTypeFilterOptions(): Array<{ value: string; label: string }> {
    const byType = new Map<string, string>();
    for (const document of this.worksiteDocuments) {
      if (!byType.has(document.document_type)) {
        byType.set(document.document_type, document.document_type_label);
      }
    }
    return Array.from(byType.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }

  get filteredWorksiteDocumentItems(): DashboardWorksiteDocumentItem[] {
    const documents = this.worksiteDocuments
      .filter((document) =>
        this.selectedWorksiteDocumentFilterId === "all"
          ? true
          : document.worksite_id === this.selectedWorksiteDocumentFilterId
      )
      .filter((document) =>
        this.selectedWorksiteDocumentTypeFilter === "all"
          ? true
          : document.document_type === this.selectedWorksiteDocumentTypeFilter
      )
      .filter((document) =>
        this.selectedWorksiteDocumentLifecycleFilter === "all"
          ? true
          : document.lifecycle_status === this.selectedWorksiteDocumentLifecycleFilter
      );

    return documents
      .map((document) => this.mapDashboardWorksiteDocumentItem(document))
      .filter((document) => this.matchesCoordinationFilters(document.coordination))
      .sort((left, right) => (right.uploadedAtValue ?? "").localeCompare(left.uploadedAtValue ?? ""));
  }

  get filteredDashboardWorksiteOverviewItems(): DashboardWorksiteOverviewItem[] {
    return this.dashboardWorksiteOverviewItems.filter((item) => this.matchesCoordinationFilters(item.coordination));
  }

  get worksiteDocumentCountLabel(): string {
    const total = this.worksiteDocuments.length;
    const visible = this.filteredWorksiteDocumentItems.length;
    const label = total > 1 ? "documents" : "document";

    if (
      this.selectedWorksiteDocumentFilterId !== "all"
      || this.selectedWorksiteDocumentTypeFilter !== "all"
      || this.selectedWorksiteDocumentLifecycleFilter !== "all"
      || this.hasActiveCoordinationFilters
    ) {
      return `${visible} sur ${total} ${label}`;
    }

    return `${total} ${label}`;
  }

  get worksiteOverviewCountLabel(): string {
    const total = this.dashboardWorksiteOverviewItems.length;
    const visible = this.filteredDashboardWorksiteOverviewItems.length;
    const label = total > 1 ? "chantiers" : "chantier";

    if (this.isChantierDataPending && total === 0) {
      return "Lecture chantier en préparation";
    }

    if (this.hasActiveCoordinationFilters) {
      return `${visible} sur ${total} ${label}`;
    }

    return `${total} ${label}`;
  }

  get customerOverviewCountLabel(): string {
    const count = this.dashboardCustomerOverviewItems.length;
    const label = count > 1 ? "clients" : "client";

    if (this.isFacturationDataPending && count === 0) {
      return "Lecture client en préparation";
    }

    return `${count} ${label}`;
  }

  get hasActiveCoordinationFilters(): boolean {
    return this.selectedCoordinationStatusFilter !== "all" || this.selectedCoordinationAssigneeFilter !== "all";
  }

  get canResetWorksitePreventionPlanToInitial(): boolean {
    if (!this.worksitePreventionPlanInitialForm) {
      return false;
    }

    return JSON.stringify(this.worksitePreventionPlanForm) !== JSON.stringify(this.worksitePreventionPlanInitialForm);
  }

  getWorksiteSignatureOptions(worksiteId: string): WorksiteSignatureRecord[] {
    return this.worksiteSignatures
      .filter((signature) => signature.worksite_id === worksiteId)
      .sort((left, right) => (right.uploaded_at ?? "").localeCompare(left.uploaded_at ?? ""));
  }

  getWorksiteSignatureOptionLabel(signature: WorksiteSignatureRecord): string {
    const uploadedLabel = this.formatCompactDate(signature.uploaded_at);
    return uploadedLabel ? `${signature.file_name} · ${uploadedLabel}` : signature.file_name;
  }

  getWorksiteDocumentActionLabel(document: DashboardWorksiteDocumentItem): string {
    return this.isWorksitePreventionPlanDocumentType(document.documentType)
      ? "Télécharger"
      : "Télécharger";
  }

  get hasActiveWorksiteDocumentFilters(): boolean {
    return (
      this.selectedWorksiteDocumentFilterId !== "all"
      || this.selectedWorksiteDocumentTypeFilter !== "all"
      || this.selectedWorksiteDocumentLifecycleFilter !== "all"
      || this.hasActiveCoordinationFilters
    );
  }

  get coordinationTodoItems(): DashboardCoordinationTodoItem[] {
    const worksiteItems = this.filteredDashboardWorksiteOverviewItems
      .filter((item) => this.isCoordinationPending(item.coordination))
      .map((item) => ({
        id: `worksite-${item.id}`,
        kind: "worksite" as const,
        kindLabel: "Chantier",
        kindTone: "calm" as CfmTone,
        title: item.name,
        description: item.coordination.commentText ?? item.taskSummary,
        context: `Affectation : ${item.coordination.assigneeLabel}`,
        status: item.coordination.status,
        statusLabel: item.coordination.statusLabel,
        statusTone: item.coordination.statusTone,
        worksiteId: item.id,
        documentId: null,
      }));

    const documentItems = this.worksiteDocuments
      .map((document) => this.mapDashboardWorksiteDocumentItem(document))
      .filter((document) => this.matchesCoordinationFilters(document.coordination))
      .filter((document) => this.isCoordinationPending(document.coordination))
      .map((document) => ({
        id: `document-${document.id}`,
        kind: "document" as const,
        kindLabel: "Document",
        kindTone: "neutral" as CfmTone,
        title: `${document.title} · ${document.worksiteName}`,
        description:
          document.coordination.commentText
          ?? `${document.typeLabel} encore en préparation ou en suivi simple.`,
        context: `Affectation : ${document.coordination.assigneeLabel}`,
        status: document.coordination.status,
        statusLabel: document.coordination.statusLabel,
        statusTone: document.coordination.statusTone,
        worksiteId: document.worksiteId,
        documentId: document.id,
      }));

    return [...worksiteItems, ...documentItems].sort(
      (left, right) =>
        this.getCoordinationStatusRank(left.status) - this.getCoordinationStatusRank(right.status)
        || left.title.localeCompare(right.title)
    );
  }

  get coordinationTodoCountLabel(): string {
    const count = this.coordinationTodoItems.length;

    if (this.isChantierDataPending && count === 0) {
      return "Coordination en préparation";
    }

    return `${count} élément${count > 1 ? "s" : ""} à traiter`;
  }

  isWorksiteDocumentDownloadBusy(document: DashboardWorksiteDocumentItem): boolean {
    return this.worksiteDocumentDownloadBusyId === document.id;
  }

  canAdjustWorksiteDocument(document: DashboardWorksiteDocumentItem): boolean {
    return this.isWorksitePreventionPlanDocumentType(document.documentType) && this.canReadOrganization;
  }

  hasWorksiteDocumentLinkedItems(document: DashboardWorksiteDocumentItem): boolean {
    return document.linkedSignature !== null || document.linkedProofs.length > 0;
  }

  getWorksiteDocumentProofCountLabel(count: number): string {
    return count > 0
      ? `${count} preuve${count > 1 ? "s" : ""} liée${count > 1 ? "s" : ""}`
      : "Aucune preuve liée";
  }

  getWorksiteDocumentFileAvailabilityLabel(document: Pick<WorksiteDocumentRecord, "has_stored_file">): string {
    return document.has_stored_file ? "Fichier prêt" : "Fichier à stabiliser";
  }

  getWorksiteDocumentFileAvailabilityTone(document: Pick<WorksiteDocumentRecord, "has_stored_file">): CfmTone {
    return document.has_stored_file ? "success" : "progress";
  }

  formatFileSize(sizeBytes: number | null): string | null {
    if (!sizeBytes || sizeBytes <= 0) {
      return null;
    }
    if (sizeBytes >= 1024 * 1024) {
      return `${(sizeBytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
    }
    return `${Math.max(1, Math.round(sizeBytes / 1024))} Ko`;
  }

  getWorksiteProofOptions(worksiteId: string): WorksiteProofRecord[] {
    return this.worksiteProofs
      .filter((proof) => proof.worksite_id === worksiteId)
      .sort((left, right) => (right.uploaded_at ?? "").localeCompare(left.uploaded_at ?? ""));
  }

  getWorksiteProofOptionLabel(proof: WorksiteProofRecord): string {
    const uploadedLabel = this.formatCompactDate(proof.uploaded_at);
    return uploadedLabel ? `${proof.file_name} · ${uploadedLabel}` : proof.file_name;
  }

  resetWorksiteDocumentFilters(): void {
    this.selectedWorksiteDocumentFilterId = "all";
    this.selectedWorksiteDocumentTypeFilter = "all";
    this.selectedWorksiteDocumentLifecycleFilter = "all";
    this.selectedWorksiteDocumentDetailId = null;
    this.resetCoordinationFilters();
  }

  resetCoordinationFilters(): void {
    this.selectedCoordinationStatusFilter = "all";
    this.selectedCoordinationAssigneeFilter = "all";
  }

  focusWorksiteDocuments(worksiteId: string, documentType: string = "all"): void {
    this.selectedWorksiteDocumentFilterId = worksiteId;
    this.selectedWorksiteDocumentTypeFilter = documentType;
    this.selectedWorksiteDocumentLifecycleFilter = "all";
    this.selectedWorksiteDocumentDetailId = null;
    this.feedbackMessage = "Documents chantier filtrés sur la zone utile.";
    void this.navigateToWorkspaceRoute("/app/chantier/documents", "worksite-documents-section");
  }

  openCoordinationTodoItem(item: DashboardCoordinationTodoItem): void {
    if (item.kind === "worksite") {
      this.selectedWorksiteCoordinationId = item.worksiteId;
      this.feedbackMessage = "Chantier ouvert sur la coordination utile.";
      void this.navigateToWorkspaceRoute("/app/chantier", "worksite-overview-section");
      return;
    }

    if (item.documentId) {
      this.selectedWorksiteDocumentFilterId = item.worksiteId;
      this.selectedWorksiteDocumentTypeFilter = "all";
      this.selectedWorksiteDocumentLifecycleFilter = "all";
      this.selectedWorksiteDocumentDetailId = item.documentId;
      this.feedbackMessage = "Document chantier ouvert sur la zone utile.";
      void this.navigateToWorkspaceRoute("/app/chantier/documents", "worksite-documents-section");
    }
  }

  isWorksiteProofLinked(document: DashboardWorksiteDocumentItem, proofId: string): boolean {
    return document.linkedProofs.some((proof) => proof.id === proofId);
  }

  get localDashboardKpis(): DashboardKpiCard[] {
    const cards: DashboardKpiCard[] = [];

    if (this.isFacturationEnabled) {
      const facturationPending = this.isFacturationDataPending && this.quotes.length === 0 && this.invoices.length === 0;
      cards.push({
        id: "quotes-in-progress",
        label: "Devis en cours",
        value: facturationPending ? "Actif" : String(this.activeQuotesCount),
        detail:
          facturationPending
            ? "Le module Facturation est actif. Les premiers repères arrivent."
            : this.activeQuotesCount > 0
            ? "Brouillons et devis envoyés à suivre."
            : "Aucun devis en cours.",
        statusLabel:
          facturationPending
            ? "Préparation"
            : this.activeQuotesCount > 0
              ? "À suivre"
              : "À jour",
        tone:
          facturationPending
            ? "calm"
            : this.activeQuotesCount > 0
              ? "progress"
              : "success",
      });
      cards.push({
        id: "invoices-pending",
        label: "Factures en attente",
        value: facturationPending ? "Actif" : String(this.pendingInvoicesCount),
        detail:
          facturationPending
            ? "Les premières factures suivies apparaîtront après l’hydratation du workspace."
            : this.pendingInvoicesCount > 0
            ? this.overdueInvoicesCount > 0
              ? `${this.overdueInvoicesCount} en retard.`
              : "Reste à encaisser ou à suivre."
            : "Aucune facture en attente.",
        statusLabel:
          facturationPending
            ? "Préparation"
            : this.overdueInvoicesCount > 0
            ? "En retard"
            : this.pendingInvoicesCount > 0
              ? "En attente"
              : "À jour",
        tone:
          facturationPending
            ? "calm"
            : this.overdueInvoicesCount > 0
            ? "warning"
            : this.pendingInvoicesCount > 0
              ? "progress"
              : "success",
      });
    }

    if (this.isReglementationEnabled) {
      const regulationPending =
        this.isReglementationDataPending
        && !this.regulatoryProfile
        && this.buildingSafetyItems.length === 0
        && this.duerpEntries.length === 0;
      const regulationDelayed = !regulationPending && this.isReglementationDataDelayed;
      cards.push({
        id: "regulation-to-review",
        label: "Réglementaire à vérifier",
        value: regulationPending ? "Actif" : regulationDelayed ? "Partiel" : String(this.regulatoryActionCount),
        detail:
          regulationPending
            ? "Le module Réglementation est actif. Les premiers repères arrivent."
            : regulationDelayed
            ? "Les données réglementaires mettent plus de temps à remonter. Le reste du cockpit reste disponible."
            : this.regulatoryActionCount > 0
            ? "Obligations ou contrôles à revoir."
            : "Aucun point réglementaire prioritaire.",
        statusLabel:
          regulationPending
            ? "Préparation"
            : regulationDelayed
            ? "Remontée lente"
            : this.globalBuildingSafetyOverdueCount > 0 || this.overdueRegulatoryObligationCount > 0
            ? "À traiter"
            : this.regulatoryActionCount > 0
              ? "À vérifier"
              : "À jour",
        tone:
          regulationPending
            ? "calm"
            : regulationDelayed
            ? "progress"
            : this.globalBuildingSafetyOverdueCount > 0 || this.overdueRegulatoryObligationCount > 0
            ? "warning"
            : this.regulatoryActionCount > 0
              ? "progress"
              : "success",
      });
    }

    if (this.isChantierEnabled) {
      const chantierPending =
        this.isChantierDataPending
        && this.billingWorksites.length === 0
        && this.worksiteDocuments.length === 0
        && this.worksiteProofs.length === 0
        && this.worksiteSignatures.length === 0;
      cards.push({
        id: "worksites-needing-action",
        label: "Chantiers nécessitant une action",
        value: chantierPending ? "Actif" : String(this.worksitesNeedingActionCount),
        detail:
          chantierPending
            ? "Le module Chantier est actif. Les premiers repères arrivent."
            : this.worksitesNeedingActionCount > 0
            ? "Bloqués ou à préparer."
            : "Aucun chantier prioritaire.",
        statusLabel:
          chantierPending
            ? "Préparation"
            : this.blockedWorksitesCount > 0
            ? "Bloqués"
            : this.worksitesNeedingActionCount > 0
              ? "À préparer"
              : "À jour",
        tone:
          chantierPending
            ? "calm"
            : this.blockedWorksitesCount > 0
            ? "warning"
            : this.worksitesNeedingActionCount > 0
              ? "progress"
              : "success",
      });
    }

    return cards;
  }

  get localDashboardAlerts(): DashboardAlertItem[] {
    const alerts: DashboardAlertItem[] = [];

    if (this.isFacturationEnabled && this.overdueInvoicesCount > 0) {
      alerts.push({
        id: "billing-overdue-invoices",
        title: "Factures en retard",
        description: `${this.overdueInvoicesCount} facture${this.overdueInvoicesCount > 1 ? "s dépassent" : " dépasse"} l'échéance et demande${this.overdueInvoicesCount > 1 ? "nt" : ""} un suivi.`,
        moduleLabel: "Facturation",
        tone: "warning",
        priority: 1,
      });
    }

    if (this.isFacturationEnabled && this.quotesToFollowUpCount > 0) {
      alerts.push({
        id: "billing-quotes-follow-up",
        title: "Devis à relancer",
        description: `${this.quotesToFollowUpCount} devis ${this.quotesToFollowUpCount > 1 ? "sont marqués" : "est marqué"} à relancer.`,
        moduleLabel: "Facturation",
        tone: "progress",
        priority: 2,
      });
    }

    if (this.isReglementationEnabled && this.globalBuildingSafetyOverdueCount > 0) {
      alerts.push({
        id: "regulation-building-safety-overdue",
        title: "Sécurité bâtiment à traiter",
        description: `${this.globalBuildingSafetyOverdueCount} élément${this.globalBuildingSafetyOverdueCount > 1 ? "s" : ""} sécurité ${this.globalBuildingSafetyOverdueCount > 1 ? "sont en retard" : "est en retard"} de contrôle.`,
        moduleLabel: "Réglementation",
        tone: "warning",
        priority: 1,
      });
    }

    if (this.isReglementationEnabled && this.regulatoryObligationsToVerifyCount > 0) {
      alerts.push({
        id: "regulation-obligations-to-verify",
        title: "Obligations à vérifier",
        description: `${this.regulatoryObligationsToVerifyCount} obligation${this.regulatoryObligationsToVerifyCount > 1 ? "s demandent" : " demande"} une vérification simple.`,
        moduleLabel: "Réglementation",
        tone: "progress",
        priority: 2,
      });
    }

    if (this.isChantierEnabled && this.blockedWorksitesCount > 0) {
      alerts.push({
        id: "worksites-blocked",
        title: "Chantiers bloqués",
        description: `${this.blockedWorksitesCount} chantier${this.blockedWorksitesCount > 1 ? "s sont" : " est"} bloqué${this.blockedWorksitesCount > 1 ? "s" : ""} et nécessite${this.blockedWorksitesCount > 1 ? "nt" : ""} une action.`,
        moduleLabel: "Chantier",
        tone: "warning",
        priority: 1,
      });
    } else if (this.isChantierEnabled && this.plannedWorksitesCount > 0) {
      alerts.push({
        id: "worksites-planned",
        title: "Chantiers à préparer",
        description: `${this.plannedWorksitesCount} chantier${this.plannedWorksitesCount > 1 ? "s sont" : " est"} planifié${this.plannedWorksitesCount > 1 ? "s" : ""} et mérite${this.plannedWorksitesCount > 1 ? "nt" : ""} une préparation simple.`,
        moduleLabel: "Chantier",
        tone: "calm",
        priority: 3,
      });
    }

    return alerts
      .sort((left, right) => left.priority - right.priority || left.title.localeCompare(right.title))
      .slice(0, 6);
  }

  get dashboardKpis(): DashboardKpiCard[] {
    if (!this.cockpitSummary || this.cockpitSummary.kpis.length === 0) {
      return this.localDashboardKpis;
    }

    return this.cockpitSummary.kpis.map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      value: kpi.value,
      detail: kpi.detail,
      statusLabel: kpi.status_label,
      tone: this.mapCockpitTone(kpi.tone),
    }));
  }

  get dashboardAlerts(): DashboardAlertItem[] {
    if (!this.cockpitSummary || this.cockpitSummary.alerts.length === 0) {
      return this.localDashboardAlerts;
    }

    return this.cockpitSummary.alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      moduleLabel: alert.module_label,
      tone: this.mapCockpitTone(alert.tone),
      priority: alert.priority,
    }));
  }

  get dashboardEnterpriseOverviewCards(): DashboardPerspectiveCard[] {
    if (!this.cockpitSummary || this.cockpitSummary.module_cards.length === 0) {
      return this.localDashboardEnterpriseOverviewCards;
    }

    return this.cockpitSummary.module_cards.map((card) => ({
      id: card.id,
      label: card.label,
      headline: card.headline,
      detail: card.detail,
      highlights: card.highlights.map((highlight) => ({
        id: highlight.id,
        label: highlight.label,
        value: highlight.value,
      })),
      statusLabel: card.status_label,
      tone: this.mapCockpitTone(card.tone),
    }));
  }

  get dashboardActions(): DashboardActionItem[] {
    const actions: DashboardActionItem[] = [];

    if (this.isFacturationEnabled) {
      for (const invoice of this.invoices) {
        if (invoice.status === "overdue") {
          actions.push({
            id: `invoice-overdue-${invoice.id}`,
            module: "facturation",
            priority: "high",
            title: `Traiter la facture ${invoice.number}`,
            description: `${invoice.customer_name} • reste dû ${this.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)}.`,
            context: invoice.worksite_name ? `Chantier lié : ${invoice.worksite_name}` : null,
          });
        } else if (invoice.outstanding_amount_cents > 0 && invoice.status === "issued") {
          actions.push({
            id: `invoice-issued-${invoice.id}`,
            module: "facturation",
            priority: invoice.follow_up_status === "to_follow_up" ? "medium" : "low",
            title: `Suivre la facture ${invoice.number}`,
            description:
              invoice.follow_up_status === "to_follow_up"
                ? "Une relance simple est déjà identifiée."
                : `Paiement en attente de ${this.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)}.`,
            context: invoice.worksite_name ? `Chantier lié : ${invoice.worksite_name}` : null,
          });
        }
      }

      for (const quote of this.quotes) {
        if (quote.follow_up_status === "to_follow_up") {
          actions.push({
            id: `quote-follow-up-${quote.id}`,
            module: "facturation",
            priority: "medium",
            title: `Relancer le devis ${quote.number}`,
            description: `${quote.customer_name} attend un retour ou une prise de contact simple.`,
            context: quote.worksite_name ? `Chantier lié : ${quote.worksite_name}` : null,
          });
        } else if (quote.status === "draft") {
          actions.push({
            id: `quote-draft-${quote.id}`,
            module: "facturation",
            priority: "low",
            title: `Finaliser le devis ${quote.number}`,
            description: "Le devis est encore en brouillon et peut être envoyé quand il est prêt.",
            context: quote.worksite_name ? `Chantier lié : ${quote.worksite_name}` : null,
          });
        }
      }
    }

    if (this.isReglementationEnabled) {
      for (const alert of this.buildingSafetyAlerts) {
        actions.push({
          id: `building-safety-${alert.item_id}-${alert.alert_type}`,
          module: "reglementation",
          priority: alert.alert_type === "overdue" ? "high" : "medium",
          title:
            alert.alert_type === "overdue"
              ? `Mettre à jour ${alert.item_name}`
              : `Anticiper ${alert.item_name}`,
          description: alert.message,
          context: `Site : ${alert.site_name}`,
        });
      }

      for (const obligation of this.regulatoryProfile?.applicable_obligations ?? []) {
        if (obligation.status === "compliant") {
          continue;
        }

        const priority: DashboardActionPriority =
          obligation.status === "overdue"
            ? "high"
            : obligation.status === "to_verify"
              ? "medium"
              : "low";
        const titlePrefix =
          obligation.status === "overdue"
            ? "Traiter"
            : obligation.status === "to_verify"
              ? "Vérifier"
              : "Préparer";

        actions.push({
          id: `obligation-${obligation.id}`,
          module: "reglementation",
          priority,
          title: `${titlePrefix} ${obligation.title}`,
          description: obligation.reason_summary,
          context: `Priorité ${this.getObligationPriorityLabel(obligation.priority).toLowerCase()}`,
        });
      }
    }

    if (this.isChantierEnabled) {
      for (const worksite of this.billingWorksites) {
        if (worksite.status === "blocked") {
          actions.push({
            id: `worksite-blocked-${worksite.id}`,
            module: "chantier",
            priority: "high",
            title: `Débloquer le chantier ${worksite.name}`,
            description: "Le chantier est actuellement bloqué et demande une action terrain.",
            context: worksite.client_name ? `Client : ${worksite.client_name}` : null,
          });
        } else if (worksite.status === "planned") {
          actions.push({
            id: `worksite-planned-${worksite.id}`,
            module: "chantier",
            priority: "low",
            title: `Préparer le chantier ${worksite.name}`,
            description: "Le chantier est planifié et peut être préparé avant l’intervention.",
            context: worksite.client_name ? `Client : ${worksite.client_name}` : null,
          });
        }
      }
    }

    return actions.sort(
      (left, right) =>
        this.getDashboardActionPriorityRank(left.priority) - this.getDashboardActionPriorityRank(right.priority)
        || this.getDashboardActionModuleLabel(left.module).localeCompare(this.getDashboardActionModuleLabel(right.module))
        || left.title.localeCompare(right.title)
    );
  }

  get filteredDashboardActions(): DashboardActionItem[] {
    if (this.selectedDashboardActionModule === "all") {
      return this.dashboardActions;
    }
    return this.dashboardActions.filter((action) => action.module === this.selectedDashboardActionModule);
  }

  get dashboardActionCountLabel(): string {
    const visible = this.filteredDashboardActions.length;
    const total = this.dashboardActions.length;
    const actionLabel = visible > 1 ? "actions" : "action";

    if (
      total === 0
      && (
        this.homeUsedModuleCodes.some((moduleCode) => this.isModuleDataPending(moduleCode))
        || this.isReglementationDataDelayed
      )
    ) {
      return "Actions en préparation";
    }

    if (this.selectedDashboardActionModule === "all") {
      return `${visible} ${actionLabel}`;
    }

    return `${visible} ${actionLabel} · ${this.getDashboardActionModuleLabel(this.selectedDashboardActionModule)}`;
  }

  get localDashboardEnterpriseOverviewCards(): DashboardPerspectiveCard[] {
    const cards: DashboardPerspectiveCard[] = [];

    if (this.isReglementationEnabled) {
      const activeDuerpEntriesCount = this.activeDuerpEntries.length;
      const regulationPending =
        this.isReglementationDataPending
        && !this.regulatoryProfile
        && this.buildingSafetyItems.length === 0
        && this.duerpEntries.length === 0;
      const regulationDelayed = !regulationPending && this.isReglementationDataDelayed;
      cards.push({
        id: "enterprise-reglementation",
        label: "Réglementation",
        headline:
          regulationPending
            ? "Module actif"
            : regulationDelayed
            ? "Lecture partielle"
            : this.regulatoryActionCount > 0
            ? `${this.regulatoryActionCount} point${this.regulatoryActionCount > 1 ? "s" : ""} à revoir`
            : "Lecture apaisée",
        detail:
          regulationPending
            ? "Les premiers repères réglementaires arrivent. La session connaît déjà ce module."
            : regulationDelayed
            ? "Les données réglementaires mettent plus de temps à remonter. La lecture reste partielle sans bloquer le cockpit."
            : this.regulatoryActionCount > 0
            ? "Obligations, sécurité bâtiment et risques suivis ressortent dans une même lecture simple."
            : "Le module reste lisible avec des repères courts sur les obligations et la prévention.",
        highlights: [
          {
            id: "reglementation-obligations",
            label: "Obligations",
            value:
              regulationPending
                ? "Lecture en préparation"
                : regulationDelayed
                ? "Remontée plus lente"
                : this.regulatoryObligationsToVerifyCount > 0 || this.overdueRegulatoryObligationCount > 0
                ? `${this.regulatoryObligationsToVerifyCount} à vérifier${this.overdueRegulatoryObligationCount > 0 ? ` · ${this.overdueRegulatoryObligationCount} en retard` : ""}`
                : "Aucune obligation à reprendre"
          },
          {
            id: "reglementation-building-safety",
            label: "Sécurité bâtiment",
            value:
              regulationPending
                ? "Lecture en préparation"
                : regulationDelayed
                ? "Remontée plus lente"
                : this.buildingSafetyAlerts.length > 0 || this.globalBuildingSafetyOverdueCount > 0
                ? `${this.buildingSafetyAlerts.length} alerte${this.buildingSafetyAlerts.length > 1 ? "s" : ""}${this.globalBuildingSafetyOverdueCount > 0 ? ` · ${this.globalBuildingSafetyOverdueCount} contrôle${this.globalBuildingSafetyOverdueCount > 1 ? "s" : ""} en retard` : ""}`
                : "Aucun contrôle simple à revoir"
          },
          {
            id: "reglementation-duerp",
            label: "DUERP",
            value:
              regulationPending
                ? "Lecture en préparation"
                : regulationDelayed
                ? "Remontée plus lente"
                : activeDuerpEntriesCount > 0
                ? `${activeDuerpEntriesCount} risque${activeDuerpEntriesCount > 1 ? "s" : ""} suivi${activeDuerpEntriesCount > 1 ? "s" : ""}`
                : "Aucun risque suivi pour le moment"
          }
        ],
        statusLabel:
          regulationPending
            ? "Préparation"
            : regulationDelayed
            ? "Partiel"
            : this.globalBuildingSafetyOverdueCount > 0 || this.overdueRegulatoryObligationCount > 0
            ? "À traiter"
            : this.regulatoryActionCount > 0
              ? "À vérifier"
              : "À jour",
        tone:
          regulationPending
            ? "calm"
            : regulationDelayed
            ? "progress"
            : this.globalBuildingSafetyOverdueCount > 0 || this.overdueRegulatoryObligationCount > 0
            ? "warning"
            : this.regulatoryActionCount > 0
              ? "progress"
              : "success",
      });
    }

    if (this.isChantierEnabled) {
      const finalizedWorksiteDocumentsCount = this.worksiteDocuments.filter(
        (document) => document.lifecycle_status === "finalized"
      ).length;
      const chantierPending =
        this.isChantierDataPending
        && this.billingWorksites.length === 0
        && this.worksiteDocuments.length === 0
        && this.worksiteProofs.length === 0
        && this.worksiteSignatures.length === 0;
      const linkedWorksiteSignaturesCount = this.worksiteDocuments.filter(
        (document) => Boolean(document.linked_signature_id)
      ).length;
      const linkedWorksiteProofsCount = this.worksiteDocuments.reduce(
        (sum, document) => sum + document.linked_proofs.length,
        0
      );
      cards.push({
        id: "enterprise-chantier",
        label: "Chantier",
        headline:
          chantierPending
            ? "Module actif"
            : this.billingWorksites.length > 0
            ? `${this.billingWorksites.length} chantier${this.billingWorksites.length > 1 ? "s" : ""} suivi${this.billingWorksites.length > 1 ? "s" : ""}`
            : "Aucun chantier",
        detail:
          chantierPending
            ? "Les premiers repères chantier arrivent. La session connaît déjà ce module."
            : this.billingWorksites.length > 0
            ? "Statut terrain, documents chantier et repères liés restent regroupés ici."
            : "Le module chantier pourra remonter ici ses signaux utiles.",
        highlights: [
          {
            id: "chantier-worksites",
            label: "Actions terrain",
            value:
              chantierPending
                ? "Lecture en préparation"
                : this.worksitesNeedingActionCount > 0
                ? `${this.blockedWorksitesCount} bloqué${this.blockedWorksitesCount > 1 ? "s" : ""} · ${this.plannedWorksitesCount} à préparer`
                : "Aucun signal terrain prioritaire"
          },
          {
            id: "chantier-documents",
            label: "Documents chantier",
            value:
              chantierPending
                ? "Lecture en préparation"
                : this.worksiteDocuments.length > 0
                ? `${this.worksiteDocuments.length} généré${this.worksiteDocuments.length > 1 ? "s" : ""} · ${finalizedWorksiteDocumentsCount} finalisé${finalizedWorksiteDocumentsCount > 1 ? "s" : ""}`
                : "Aucun document chantier généré"
          },
          {
            id: "chantier-links",
            label: "Éléments liés",
            value:
              chantierPending
                ? "Lecture en préparation"
                : linkedWorksiteSignaturesCount > 0 || linkedWorksiteProofsCount > 0
                ? `${linkedWorksiteSignaturesCount} signature${linkedWorksiteSignaturesCount > 1 ? "s" : ""} · ${linkedWorksiteProofsCount} preuve${linkedWorksiteProofsCount > 1 ? "s" : ""}`
                : "Aucune signature ou preuve liée"
          }
        ],
        statusLabel:
          chantierPending
            ? "Préparation"
            : this.blockedWorksitesCount > 0
            ? "À traiter"
            : this.plannedWorksitesCount > 0
              ? "À préparer"
              : "À jour",
        tone:
          chantierPending
            ? "calm"
            : this.blockedWorksitesCount > 0
            ? "warning"
            : this.billingWorksites.length > 0 && this.plannedWorksitesCount > 0
              ? "progress"
              : "success",
      });
    }

    if (this.isFacturationEnabled) {
      const outstandingAmountCents = this.invoices.reduce(
        (sum, invoice) => sum + invoice.outstanding_amount_cents,
        0
      );
      const facturationPending =
        this.isFacturationDataPending
        && this.billingCustomers.length === 0
        && this.quotes.length === 0
        && this.invoices.length === 0;
      cards.push({
        id: "enterprise-facturation",
        label: "Facturation",
        headline:
          facturationPending
            ? "Module actif"
            : this.pendingInvoicesCount > 0
            ? `${this.pendingInvoicesCount} facture${this.pendingInvoicesCount > 1 ? "s" : ""} à suivre`
            : `${this.billingCustomers.length} client${this.billingCustomers.length > 1 ? "s" : ""} actif${this.billingCustomers.length > 1 ? "s" : ""}`,
        detail:
          facturationPending
            ? "Les premiers repères facturation arrivent. La session connaît déjà ce module."
            : this.pendingInvoicesCount > 0 || this.activeQuotesCount > 0 || this.quotesToFollowUpCount > 0
            ? "Devis, factures et suivis utiles sont regroupés dans une lecture rapide."
            : "Le module reste calme avec une lecture courte des clients et documents suivis.",
        highlights: [
          {
            id: "facturation-invoices",
            label: "Factures",
            value:
              facturationPending
                ? "Lecture en préparation"
                : this.pendingInvoicesCount > 0 || this.overdueInvoicesCount > 0
                ? `${this.pendingInvoicesCount} en attente${this.overdueInvoicesCount > 0 ? ` · ${this.overdueInvoicesCount} en retard` : ""}`
                : "Aucune facture à suivre"
          },
          {
            id: "facturation-quotes",
            label: "Devis",
            value:
              facturationPending
                ? "Lecture en préparation"
                : this.activeQuotesCount > 0 || this.quotesToFollowUpCount > 0
                ? `${this.activeQuotesCount} en cours${this.quotesToFollowUpCount > 0 ? ` · ${this.quotesToFollowUpCount} à relancer` : ""}`
                : "Aucun devis en cours"
          },
          {
            id: "facturation-cash",
            label: "Encaissement",
            value:
              facturationPending
                ? "Lecture en préparation"
                : outstandingAmountCents > 0
                ? `${this.formatAmountCents(outstandingAmountCents)} en attente`
                : `${this.billingCustomers.length} client${this.billingCustomers.length > 1 ? "s" : ""} suivi${this.billingCustomers.length > 1 ? "s" : ""}`
          }
        ],
        statusLabel:
          facturationPending
            ? "Préparation"
            : this.overdueInvoicesCount > 0
            ? "À traiter"
            : this.pendingInvoicesCount > 0 || this.quotesToFollowUpCount > 0
              ? "À suivre"
              : "À jour",
        tone:
          facturationPending
            ? "calm"
            : this.overdueInvoicesCount > 0
            ? "warning"
            : this.pendingInvoicesCount > 0 || this.quotesToFollowUpCount > 0
              ? "progress"
              : "success",
      });
    }

    return cards;
  }

  get dashboardWorksiteOverviewItems(): DashboardWorksiteOverviewItem[] {
    if (!this.isChantierEnabled) {
      return [];
    }

    return this.billingWorksites
      .map((worksite) => {
        const worksiteDocuments = this.worksiteDocuments.filter((document) => document.worksite_id === worksite.id);
        const worksiteQuotes = this.quotes.filter((quote) => quote.worksite_id === worksite.id);
        const worksiteInvoices = this.invoices.filter((invoice) => invoice.worksite_id === worksite.id);
        const overdueInvoices = worksiteInvoices.filter((invoice) => invoice.status === "overdue").length;
        const pendingInvoices = worksiteInvoices.filter((invoice) => invoice.outstanding_amount_cents > 0).length;
        const draftQuotes = worksiteQuotes.filter((quote) => quote.status === "draft").length;
        const quotesToFollowUp = worksiteQuotes.filter((quote) => quote.follow_up_status === "to_follow_up").length;
        const outstandingAmountCents = worksiteInvoices.reduce(
          (sum, invoice) => sum + invoice.outstanding_amount_cents,
          0
        );
        const plannedLabel = this.formatCompactDate(worksite.planned_for);
        const updatedLabel = this.formatCompactDate(worksite.updated_at);
        const linkedQuotesSummary = this.isFacturationEnabled
          ? this.formatDashboardDocumentSummary(
              "Devis liés",
              worksiteQuotes.map((quote) => `${quote.number} (${this.getQuoteStatusLabel(quote.status)})`),
              "aucun"
            )
          : "Devis liés : module Facturation non activé.";
        const linkedWorksiteDocumentsSummary = this.formatDashboardDocumentSummary(
          "Documents chantier",
          worksiteDocuments.map((document) => {
            const uploadedLabel = this.formatCompactDate(document.uploaded_at);
            const lifecycleLabel = this.getWorksiteDocumentLifecycleStatusLabel(document.lifecycle_status);
            return uploadedLabel
              ? `${document.document_type_label} (${lifecycleLabel}, ${uploadedLabel})`
              : `${document.document_type_label} (${lifecycleLabel})`;
          }),
          "aucun document généré"
        );
        const linkedInvoicesSummary = this.isFacturationEnabled
          ? this.formatDashboardDocumentSummary(
              "Factures liées",
              worksiteInvoices.map((invoice) => `${invoice.number} (${this.getInvoiceStatusLabel(invoice.status)})`),
              "aucune"
            )
          : "Factures liées : module Facturation non activé.";
        const taskParts: string[] = [];
        const financialParts: string[] = [];

        const signalLabel =
          worksite.status === "blocked" || overdueInvoices > 0
            ? "À traiter"
            : worksite.status === "planned" || pendingInvoices > 0 || draftQuotes > 0
              ? "À suivre"
              : "Rien à signaler";
        const signalTone: CfmTone =
          signalLabel === "À traiter"
            ? "warning"
            : signalLabel === "À suivre"
              ? "progress"
              : "success";
        const operationalParts = [worksite.client_name];

        if (worksite.address) {
          operationalParts.push(worksite.address);
        }

        if (worksite.status === "blocked") {
          taskParts.push("chantier bloqué");
        } else if (worksite.status === "planned") {
          taskParts.push("préparation avant intervention");
        }

        if (overdueInvoices > 0) {
          taskParts.push(`${overdueInvoices} facture${overdueInvoices > 1 ? "s" : ""} en retard`);
        } else if (pendingInvoices > 0) {
          taskParts.push(`${pendingInvoices} facture${pendingInvoices > 1 ? "s" : ""} à suivre`);
        }

        if (draftQuotes > 0) {
          taskParts.push(`${draftQuotes} devis en brouillon`);
        }

        if (quotesToFollowUp > 0) {
          taskParts.push(`${quotesToFollowUp} devis à relancer`);
        }

        if (pendingInvoices > 0) {
          financialParts.push(`${this.formatAmountCents(outstandingAmountCents)} en attente`);
        }

        if (overdueInvoices > 0) {
          financialParts.push(`${overdueInvoices} facture${overdueInvoices > 1 ? "s" : ""} en retard`);
        }

        if (quotesToFollowUp > 0) {
          financialParts.push(`${quotesToFollowUp} devis à relancer`);
        }

        return {
          id: worksite.id,
          name: worksite.name,
          summary:
            this.isFacturationEnabled
              ? `${operationalParts.join(" · ")} · ${worksiteQuotes.length} devis · ${worksiteInvoices.length} facture${worksiteInvoices.length > 1 ? "s" : ""}`
              : operationalParts.join(" · "),
          operationalSummary:
            plannedLabel
              ? `Prévu le ${plannedLabel}${updatedLabel ? ` · mis à jour le ${updatedLabel}` : ""}.`
              : updatedLabel
                ? `Mis à jour le ${updatedLabel}.`
                : "Lecture chantier disponible.",
          taskSummary:
            taskParts.length > 0
              ? `Points à traiter : ${taskParts.join(", ")}.`
              : "Points à traiter : aucun signal immédiat.",
          worksiteDocuments: worksiteDocuments.map((document) => this.mapDashboardWorksiteDocumentItem(document)),
          coordination: this.buildDashboardCoordinationState(worksite.coordination),
          linkedWorksiteDocumentsSummary,
          linkedQuotesSummary,
          linkedInvoicesSummary,
          worksiteDocumentsCount: worksiteDocuments.length,
          financialSummary:
            this.isFacturationEnabled
              ? financialParts.length > 0
                ? `Signal financier : ${financialParts.join(", ")}.`
                : "Signal financier : aucun point simple à remonter."
              : null,
          regulatorySummary: null,
          statusLabel: this.getWorksiteStatusLabel(worksite.status),
          statusTone: this.getWorksiteStatusTone(worksite.status),
          signalLabel,
          signalTone,
        };
      })
      .sort(
        (left, right) =>
          this.getDashboardOverviewSignalRank(left.signalLabel) - this.getDashboardOverviewSignalRank(right.signalLabel)
          || left.name.localeCompare(right.name)
      );
  }

  get dashboardCustomerOverviewItems(): DashboardCustomerOverviewItem[] {
    if (!this.isFacturationEnabled) {
      return [];
    }

    return this.billingCustomers
      .map((customer) => {
        const customerQuotes = this.quotes.filter((quote) => quote.customer_id === customer.id);
        const customerInvoices = this.invoices.filter((invoice) => invoice.customer_id === customer.id);
        const overdueInvoices = customerInvoices.filter((invoice) => invoice.status === "overdue").length;
        const pendingInvoices = customerInvoices.filter((invoice) => invoice.outstanding_amount_cents > 0).length;
        const quotesToFollowUp = customerQuotes.filter((quote) => quote.follow_up_status === "to_follow_up").length;
        const outstandingAmountCents = customerInvoices.reduce(
          (sum, invoice) => sum + invoice.outstanding_amount_cents,
          0
        );

        const signalLabel =
          overdueInvoices > 0
            ? "À traiter"
            : pendingInvoices > 0 || quotesToFollowUp > 0
              ? "À suivre"
              : "Rien à signaler";
        const signalTone: CfmTone =
          signalLabel === "À traiter"
            ? "warning"
            : signalLabel === "À suivre"
              ? "progress"
              : "success";
        const statusTone: CfmTone =
          overdueInvoices > 0
            ? "warning"
            : pendingInvoices > 0 || quotesToFollowUp > 0
              ? "progress"
              : "neutral";
        const contextParts: string[] = [];

        if (overdueInvoices > 0) {
          contextParts.push(`${overdueInvoices} facture${overdueInvoices > 1 ? "s" : ""} en retard.`);
        } else if (pendingInvoices > 0) {
          contextParts.push(`${this.formatAmountCents(outstandingAmountCents)} en attente.`);
        }

        if (quotesToFollowUp > 0) {
          contextParts.push(`${quotesToFollowUp} devis à relancer.`);
        }

        if (contextParts.length === 0) {
          contextParts.push("Suivi commercial à jour.");
        }

        return {
          id: customer.id,
          name: customer.name,
          summary:
            `${this.getCustomerTypeLabel(customer.customer_type)} · ${customerQuotes.length} devis · ${customerInvoices.length} facture${customerInvoices.length > 1 ? "s" : ""}`,
          context: contextParts.join(" "),
          statusLabel:
            pendingInvoices > 0 || quotesToFollowUp > 0
              ? "À suivre"
              : customerQuotes.length > 0 || customerInvoices.length > 0
                ? "Suivi normal"
                : "À jour",
          statusTone,
          signalLabel,
          signalTone,
        };
      })
      .sort(
        (left, right) =>
          this.getDashboardOverviewSignalRank(left.signalLabel) - this.getDashboardOverviewSignalRank(right.signalLabel)
          || left.name.localeCompare(right.name)
      );
  }

  get canCreateQuote(): boolean {
    return Boolean(this.quoteForm.customerId && this.hasValidBillingLines(this.quoteForm.lines));
  }

  get canSaveQuoteEdit(): boolean {
    return Boolean(this.quoteEditForm.customerId && this.hasValidBillingLines(this.quoteEditForm.lines));
  }

  get canCreateInvoice(): boolean {
    return Boolean(this.invoiceForm.customerId && this.hasValidBillingLines(this.invoiceForm.lines));
  }

  get canSaveInvoiceEdit(): boolean {
    return Boolean(this.invoiceEditForm.customerId && this.hasValidBillingLines(this.invoiceEditForm.lines));
  }

  get hasQuoteDraft(): boolean {
    return this.isMeaningfulQuoteDraft(this.quoteForm);
  }

  get hasInvoiceDraft(): boolean {
    return this.isMeaningfulInvoiceDraft(this.invoiceForm);
  }

  get quoteFormTotalCents(): number {
    return this.computeBillingFormTotalCents(this.quoteForm.lines);
  }

  get invoiceFormTotalCents(): number {
    return this.computeBillingFormTotalCents(this.invoiceForm.lines);
  }

  get quoteEditFormTotalCents(): number {
    return this.computeBillingFormTotalCents(this.quoteEditForm.lines);
  }

  get invoiceEditFormTotalCents(): number {
    return this.computeBillingFormTotalCents(this.invoiceEditForm.lines);
  }

  getQuoteHistory(quoteId: string): AuditLogRecord[] {
    return this.quoteHistoryById[quoteId] ?? [];
  }

  getInvoiceHistory(invoiceId: string): AuditLogRecord[] {
    return this.invoiceHistoryById[invoiceId] ?? [];
  }

  getBillingHistoryLabel(log: AuditLogRecord): string {
    if (log.target_type === "quote") {
      if (log.action_type === "create") {
        return "Devis créé";
      }
      if (log.action_type === "update") {
        const nextFollowUpStatus = this.getAuditChangeValue(log, "follow_up_status", "to");
        if (this.isBillingFollowUpStatus(nextFollowUpStatus)) {
          return `Suivi passé à ${this.getBillingFollowUpStatusLabel(nextFollowUpStatus)}`;
        }
      }
      if (log.action_type === "status_change") {
        const nextStatus = this.getAuditChangeValue(log, "status", "to");
        if (this.isQuoteStatus(nextStatus)) {
          return `Statut passé à ${this.getQuoteStatusLabel(nextStatus)}`;
        }
        return "Statut du devis mis à jour";
      }
      return "Devis mis à jour";
    }

    if (log.target_type === "quote_worksite_link") {
      const previousName = this.getAuditChangeValue(log, "worksite_name", "from");
      const nextName = this.getAuditChangeValue(log, "worksite_name", "to");
      if (typeof nextName === "string" && typeof previousName === "string" && previousName !== nextName) {
        return `Chantier lié mis à jour : ${nextName}`;
      }
      if (typeof nextName === "string") {
        return `Chantier lié : ${nextName}`;
      }
      return "Chantier retiré";
    }

    if (log.target_type === "invoice") {
      if (log.action_type === "create") {
        const sourceQuoteNumber = this.getAuditScalarValue(log, "source_quote_number");
        if (typeof sourceQuoteNumber === "string") {
          return `Facture créée depuis ${sourceQuoteNumber}`;
        }
        return "Facture créée";
      }
      if (log.action_type === "update") {
        const nextFollowUpStatus = this.getAuditChangeValue(log, "follow_up_status", "to");
        if (this.isBillingFollowUpStatus(nextFollowUpStatus)) {
          return `Suivi passé à ${this.getBillingFollowUpStatusLabel(nextFollowUpStatus)}`;
        }
      }
      if (log.action_type === "status_change") {
        const nextStatus = this.getAuditChangeValue(log, "status", "to");
        if (this.isInvoiceStatus(nextStatus)) {
          return `Statut passé à ${this.getInvoiceStatusLabel(nextStatus)}`;
        }
        return "Statut de la facture mis à jour";
      }
      return "Facture mise à jour";
    }

    if (log.target_type === "invoice_payment") {
      const paidAmountCents = this.getAuditChangeValue(log, "paid_amount_cents", "to");
      if (typeof paidAmountCents === "number") {
        return `Paiement enregistré : ${this.formatAmountCents(paidAmountCents)}`;
      }
      return "Paiement enregistré";
    }

    if (log.target_type === "invoice_worksite_link") {
      const previousName = this.getAuditChangeValue(log, "worksite_name", "from");
      const nextName = this.getAuditChangeValue(log, "worksite_name", "to");
      if (typeof nextName === "string" && typeof previousName === "string" && previousName !== nextName) {
        return `Chantier lié mis à jour : ${nextName}`;
      }
      if (typeof nextName === "string") {
        return `Chantier lié : ${nextName}`;
      }
      return "Chantier retiré";
    }

    return "Événement enregistré";
  }

  getBillingHistoryMeta(log: AuditLogRecord): string {
    if (log.target_display) {
      return `Par ${log.actor_label} • ${log.target_display}`;
    }
    return `Par ${log.actor_label}`;
  }

  get activeOrganizationSites(): OrganizationSiteRecord[] {
    return this.organizationSites.filter((site) => site.status === "active");
  }

  get canCreateBuildingSafetyItem(): boolean {
    return Boolean(
      this.buildingSafetyForm.siteId
      && this.buildingSafetyForm.name.trim()
      && this.buildingSafetyForm.nextDueDate
    );
  }

  get isBuildingSafetyEditing(): boolean {
    return this.buildingSafetyEditingId !== null;
  }

  get filteredBuildingSafetyItems(): BuildingSafetyItemRecord[] {
    if (this.selectedSafetySiteId === "all") {
      return this.buildingSafetyItems;
    }
    return this.buildingSafetyItems.filter((item) => item.site_id === this.selectedSafetySiteId);
  }

  get filteredBuildingSafetyAlerts(): BuildingSafetyAlertRecord[] {
    if (this.selectedSafetySiteId === "all") {
      return this.buildingSafetyAlerts;
    }
    return this.buildingSafetyAlerts.filter((item) => item.site_id === this.selectedSafetySiteId);
  }

  get canSaveDuerpEntry(): boolean {
    return Boolean(this.duerpForm.workUnitName.trim() && this.duerpForm.riskLabel.trim());
  }

  get filteredDuerpEntries(): DuerpEntryRecord[] {
    if (this.selectedSafetySiteId === "all") {
      return this.duerpEntries;
    }
    return this.duerpEntries.filter(
      (entry) => entry.site_id === null || entry.site_id === this.selectedSafetySiteId
    );
  }

  get activeBuildingSafetyItems(): BuildingSafetyItemRecord[] {
    return this.buildingSafetyItems.filter((item) => item.status === "active");
  }

  get selectableBuildingSafetyItems(): BuildingSafetyItemRecord[] {
    if (this.selectedSafetySiteId === "all") {
      return this.activeBuildingSafetyItems;
    }
    return this.activeBuildingSafetyItems.filter((item) => item.site_id === this.selectedSafetySiteId);
  }

  get activeDuerpEntries(): DuerpEntryRecord[] {
    return this.duerpEntries.filter((entry) => entry.status === "active");
  }

  get selectableDuerpEntries(): DuerpEntryRecord[] {
    if (this.selectedSafetySiteId === "all") {
      return this.activeDuerpEntries;
    }
    return this.activeDuerpEntries.filter(
      (entry) => entry.site_id === null || entry.site_id === this.selectedSafetySiteId
    );
  }

  get filteredRegulatoryEvidences(): RegulatoryEvidenceRecord[] {
    if (this.selectedSafetySiteId === "all") {
      return this.regulatoryEvidences;
    }
    return this.regulatoryEvidences.filter(
      (evidence) => evidence.site_id === null || evidence.site_id === this.selectedSafetySiteId
    );
  }

  get selectedRegulatoryObligation(): ApplicableRegulatoryObligationRecord | null {
    if (!this.regulatoryProfile || !this.selectedObligationId) {
      return null;
    }
    return this.regulatoryProfile.applicable_obligations.find(
      (obligation) => obligation.id === this.selectedObligationId
    ) ?? null;
  }

  get selectedObligationCriteria(): RegulatoryCriterionRecord[] {
    if (!this.regulatoryProfile || !this.selectedRegulatoryObligation) {
      return [];
    }
    return this.regulatoryProfile.criteria.filter((criterion) =>
      this.selectedRegulatoryObligation?.matched_criteria.includes(criterion.code)
    );
  }

  get selectedObligationEvidences(): RegulatoryEvidenceRecord[] {
    if (!this.selectedRegulatoryObligation) {
      return [];
    }
    return this.regulatoryEvidences.filter(
      (evidence) => evidence.obligation_id === this.selectedRegulatoryObligation?.id
    );
  }

  get canCreateRegulatoryEvidence(): boolean {
    if (!this.regulatoryEvidenceForm.fileName.trim() || !this.regulatoryEvidenceForm.documentType.trim()) {
      return false;
    }

    switch (this.regulatoryEvidenceForm.linkKind) {
      case "obligation":
        return Boolean(this.regulatoryEvidenceForm.obligationId);
      case "site":
        return Boolean(this.regulatoryEvidenceForm.siteId);
      case "building_safety_item":
        return Boolean(this.regulatoryEvidenceForm.buildingSafetyItemId);
      case "duerp_entry":
        return Boolean(this.regulatoryEvidenceForm.duerpEntryId);
    }
  }

  get buildingSafetyOverdueCount(): number {
    return this.filteredBuildingSafetyItems.filter((item) => item.alert_status === "overdue").length;
  }

  get buildingSafetyDueSoonCount(): number {
    return this.filteredBuildingSafetyItems.filter((item) => item.alert_status === "due_soon").length;
  }

  get buildingSafetyOkCount(): number {
    return this.filteredBuildingSafetyItems.filter((item) => item.alert_status === "ok").length;
  }

  get globalBuildingSafetyOverdueCount(): number {
    return this.buildingSafetyItems.filter((item) => item.alert_status === "overdue").length;
  }

  get activeQuotesCount(): number {
    return this.quotes.filter((quote) => quote.status === "draft" || quote.status === "sent").length;
  }

  get pendingInvoicesCount(): number {
    return this.invoices.filter((invoice) => invoice.outstanding_amount_cents > 0).length;
  }

  get overdueInvoicesCount(): number {
    return this.invoices.filter((invoice) => invoice.status === "overdue").length;
  }

  get quotesToFollowUpCount(): number {
    return this.quotes.filter((quote) => quote.follow_up_status === "to_follow_up").length;
  }

  get regulatoryObligationsToVerifyCount(): number {
    return (
      this.regulatoryProfile?.applicable_obligations.filter((obligation) => obligation.status === "to_verify").length
      ?? 0
    );
  }

  get overdueRegulatoryObligationCount(): number {
    return (
      this.regulatoryProfile?.applicable_obligations.filter((obligation) => obligation.status === "overdue").length
      ?? 0
    );
  }

  get regulatoryActionCount(): number {
    return this.regulatoryObligationsToVerifyCount + this.overdueRegulatoryObligationCount + this.buildingSafetyAlerts.length;
  }

  get blockedWorksitesCount(): number {
    return this.billingWorksites.filter((worksite) => worksite.status === "blocked").length;
  }

  get plannedWorksitesCount(): number {
    return this.billingWorksites.filter((worksite) => worksite.status === "planned").length;
  }

  get worksitesNeedingActionCount(): number {
    return this.blockedWorksitesCount + this.plannedWorksitesCount;
  }

  async submitLogin(): Promise<void> {
    this.loading = true;
    this.errorMessage = "";
    this.feedbackMessage = "";

    try {
      const response = await login({
        email: this.email,
        password: this.password
      });

      if (!response.access_token || !response.session?.current_membership?.organization?.id) {
        throw new Error("La réponse de connexion reçue est incomplète.");
      }

      const persistedSession = {
        accessToken: getStoredAccessToken(),
        organizationId: getStoredOrganizationId(),
      };

      if (
        persistedSession.accessToken !== response.access_token
        || persistedSession.organizationId !== response.session.current_membership.organization.id
      ) {
        throw new Error("La session n'a pas pu être confirmée dans le navigateur après la connexion.");
      }

      this.accessToken = response.access_token;
      this.session = response.session;
      this.selectedOrganizationId = response.session.current_membership.organization.id;
      this.loading = false;

      let navigationSucceeded = await this.router.navigateByUrl("/app/home");
      let finalPath = this.router.url.split("#")[0] || "/login";

      if (!navigationSucceeded || this.isLoginRoutePath(finalPath)) {
        console.warn("[auth] primary navigation did not leave login. Retrying.", {
          navigationSucceeded,
          currentUrl: this.router.url,
        });
        navigationSucceeded = await this.router.navigate(["/app", "home"], { replaceUrl: true });
        finalPath = this.router.url.split("#")[0] || "/login";
      }

      if (!navigationSucceeded || this.isLoginRoutePath(finalPath)) {
        throw new Error("La redirection après connexion n'a pas abouti.");
      }

    } catch (error) {
      console.error("[auth] login flow failed after POST /auth/login.", error);
      this.errorMessage = this.toErrorMessage(error, "auth");
    } finally {
      this.loading = false;
    }
  }

  async changeOrganization(): Promise<void> {
    if (this.customerEditingId) {
      this.cancelCustomerEditing();
    }
    if (this.buildingSafetyEditingId) {
      this.cancelBuildingSafetyEditing();
    }
    this.resetBetaFeedback();
    await this.refreshSession(this.selectedOrganizationId);
  }

  async copyBetaFeedback(): Promise<void> {
    if (!this.canCopyBetaFeedback) {
      return;
    }

    this.betaFeedbackCopyBusy = true;
    this.betaFeedbackError = "";
    this.betaFeedbackNotice = "";

    try {
      await this.copyTextToClipboard(this.buildBetaFeedbackPayload());
      this.betaFeedbackNotice = "Retour prêt à coller dans votre canal beta ou pilote.";
    } catch (error) {
      this.betaFeedbackError = "La copie automatique n'a pas abouti. Le texte reste visible ci-dessous.";
    } finally {
      this.betaFeedbackCopyBusy = false;
    }
  }

  resetBetaFeedback(): void {
    this.betaFeedbackCategory = "improvement";
    this.betaFeedbackArea = "cockpit";
    this.betaFeedbackMessageText = "";
    this.betaFeedbackNotice = "";
    this.betaFeedbackError = "";
  }

  async toggleModule(moduleCode: ModuleCode, nextValue: boolean): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageModules) {
      return;
    }

    this.loading = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateOrganizationModule(this.accessToken, this.selectedOrganizationId, moduleCode, nextValue);
      await this.refreshSession(this.selectedOrganizationId);
      this.feedbackMessage = "Modules mis à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.loading = false;
    }
  }

  async completeOnboarding(): Promise<void> {
    await this.saveProfile("Entreprise initialisée.");
  }

  async saveQualificationQuestionnaire(): Promise<void> {
    await this.saveProfile("Questionnaire réglementaire enregistré.");
  }

  async saveProfile(successMessage = "Profil entreprise enregistré."): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.organizationProfileSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      const profile = await updateOrganizationProfile(
        this.accessToken,
        this.selectedOrganizationId,
        this.buildProfilePayload()
      );
      this.organizationProfile = profile;
      this.applyProfileToForm(profile);
      await this.refreshSession(this.selectedOrganizationId);
      this.feedbackMessage = successMessage;
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.organizationProfileSaving = false;
    }
  }

  async createSite(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.organizationSiteSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await createOrganizationSite(this.accessToken, this.selectedOrganizationId, {
        name: this.siteForm.name.trim(),
        address: this.siteForm.address.trim(),
        site_type: this.siteForm.siteType
      });
      await this.refreshOrganizationWorkspace();
      this.siteForm = {
        name: "",
        address: "",
        siteType: "site"
      };
      this.feedbackMessage = "Site ajouté.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.organizationSiteSaving = false;
    }
  }

  startEditingCustomer(customer: BillingCustomerRecord): void {
    this.customerEditingId = customer.id;
    this.customerForm = {
      name: customer.name,
      customerType: customer.customer_type,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      notes: customer.notes ?? ""
    };
  }

  cancelCustomerEditing(): void {
    this.customerEditingId = null;
    this.resetCustomerForm();
  }

  async saveCustomer(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.customerSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      if (this.customerEditingId) {
        await updateBillingCustomer(this.accessToken, this.selectedOrganizationId, this.customerEditingId, {
          name: this.customerForm.name.trim(),
          customer_type: this.customerForm.customerType,
          email: this.normalizeOptionalText(this.customerForm.email),
          phone: this.normalizeOptionalText(this.customerForm.phone),
          address: this.normalizeOptionalText(this.customerForm.address),
          notes: this.normalizeOptionalText(this.customerForm.notes)
        });
      } else {
        await createBillingCustomer(this.accessToken, this.selectedOrganizationId, {
          name: this.customerForm.name.trim(),
          customer_type: this.customerForm.customerType,
          email: this.normalizeOptionalText(this.customerForm.email),
          phone: this.normalizeOptionalText(this.customerForm.phone),
          address: this.normalizeOptionalText(this.customerForm.address),
          notes: this.normalizeOptionalText(this.customerForm.notes)
        });
      }
      await this.refreshOrganizationWorkspace();
      const wasEditing = this.customerEditingId !== null;
      this.cancelCustomerEditing();
      this.feedbackMessage = wasEditing ? "Client mis à jour." : "Client ajouté.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.customerSaving = false;
    }
  }

  addQuoteLine(): void {
    this.quoteForm.lines = [...this.quoteForm.lines, this.createEmptyBillingLineForm()];
  }

  removeQuoteLine(index: number): void {
    if (this.quoteForm.lines.length === 1) {
      this.quoteForm.lines = [this.createEmptyBillingLineForm()];
      return;
    }
    this.quoteForm.lines = this.quoteForm.lines.filter((_, currentIndex) => currentIndex !== index);
  }

  startEditingQuote(quote: QuoteRecord): void {
    this.quoteEditingId = quote.id;
    this.quoteEditForm = this.buildQuoteFormFromRecord(quote);
  }

  cancelQuoteEditing(): void {
    this.quoteEditingId = null;
    this.quoteEditingSaving = false;
    this.quoteEditForm = this.createEmptyQuoteForm();
  }

  addQuoteEditLine(): void {
    this.quoteEditForm.lines = [...this.quoteEditForm.lines, this.createEmptyBillingLineForm()];
  }

  removeQuoteEditLine(index: number): void {
    if (this.quoteEditForm.lines.length === 1) {
      this.quoteEditForm.lines = [this.createEmptyBillingLineForm()];
      return;
    }
    this.quoteEditForm.lines = this.quoteEditForm.lines.filter((_, currentIndex) => currentIndex !== index);
  }

  async saveQuoteEdit(quote: QuoteRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.quoteEditingSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateQuote(this.accessToken, this.selectedOrganizationId, quote.id, {
        customer_id: this.quoteEditForm.customerId,
        worksite_id: this.quoteEditForm.worksiteId || null,
        title: this.normalizeOptionalText(this.quoteEditForm.title),
        issue_date: this.quoteEditForm.issueDate,
        valid_until: this.normalizeOptionalText(this.quoteEditForm.validUntil),
        line_items: this.buildBillingLineItemsPayload(this.quoteEditForm.lines),
        notes: this.normalizeOptionalText(this.quoteEditForm.notes),
      });
      await this.refreshOrganizationWorkspace();
      this.cancelQuoteEditing();
      this.feedbackMessage = "Devis mis à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.quoteEditingSaving = false;
    }
  }

  addInvoiceLine(): void {
    this.invoiceForm.lines = [...this.invoiceForm.lines, this.createEmptyBillingLineForm()];
  }

  removeInvoiceLine(index: number): void {
    if (this.invoiceForm.lines.length === 1) {
      this.invoiceForm.lines = [this.createEmptyBillingLineForm()];
      return;
    }
    this.invoiceForm.lines = this.invoiceForm.lines.filter((_, currentIndex) => currentIndex !== index);
  }

  startEditingInvoice(invoice: InvoiceRecord): void {
    this.invoiceEditingId = invoice.id;
    this.invoiceEditForm = this.buildInvoiceFormFromRecord(invoice);
  }

  cancelInvoiceEditing(): void {
    this.invoiceEditingId = null;
    this.invoiceEditingSaving = false;
    this.invoiceEditForm = this.createEmptyInvoiceForm();
  }

  addInvoiceEditLine(): void {
    this.invoiceEditForm.lines = [...this.invoiceEditForm.lines, this.createEmptyBillingLineForm()];
  }

  removeInvoiceEditLine(index: number): void {
    if (this.invoiceEditForm.lines.length === 1) {
      this.invoiceEditForm.lines = [this.createEmptyBillingLineForm()];
      return;
    }
    this.invoiceEditForm.lines = this.invoiceEditForm.lines.filter((_, currentIndex) => currentIndex !== index);
  }

  async saveInvoiceEdit(invoice: InvoiceRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.invoiceEditingSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateInvoice(this.accessToken, this.selectedOrganizationId, invoice.id, {
        customer_id: this.invoiceEditForm.customerId,
        worksite_id: this.invoiceEditForm.worksiteId || null,
        title: this.normalizeOptionalText(this.invoiceEditForm.title),
        issue_date: this.invoiceEditForm.issueDate,
        due_date: this.normalizeOptionalText(this.invoiceEditForm.dueDate),
        line_items: this.buildBillingLineItemsPayload(this.invoiceEditForm.lines),
        notes: this.normalizeOptionalText(this.invoiceEditForm.notes),
      });
      await this.refreshOrganizationWorkspace();
      this.cancelInvoiceEditing();
      this.feedbackMessage = "Facture mise à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.invoiceEditingSaving = false;
    }
  }

  discardQuoteDraft(): void {
    this.clearBillingDraft("quote");
    this.resetQuoteForm();
    this.refreshBillingDraftSnapshots();
    this.feedbackMessage = "Saisie du devis effacée.";
  }

  async saveQuote(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.quoteSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await createQuote(this.accessToken, this.selectedOrganizationId, {
        customer_id: this.quoteForm.customerId,
        worksite_id: this.quoteForm.worksiteId || null,
        title: this.normalizeOptionalText(this.quoteForm.title),
        issue_date: this.quoteForm.issueDate,
        valid_until: this.normalizeOptionalText(this.quoteForm.validUntil),
        status: this.quoteForm.status,
        currency: "EUR",
        line_items: this.buildBillingLineItemsPayload(this.quoteForm.lines),
        notes: this.normalizeOptionalText(this.quoteForm.notes)
      });
      this.clearBillingDraft("quote");
      await this.refreshOrganizationWorkspace();
      this.resetQuoteForm();
      this.refreshBillingDraftSnapshots();
      this.feedbackMessage = "Devis ajouté.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.quoteSaving = false;
    }
  }

  async exportWorksiteSummaryPdf(worksiteId: string): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    this.worksiteDocumentPdfBusyId = worksiteId;
    this.errorMessage = "";
    this.feedbackMessage = "Fiche chantier PDF en préparation.";
    try {
      const { blob, fileName } = await downloadWorksiteSummaryPdf(
        this.accessToken,
        this.selectedOrganizationId,
        worksiteId
      );
      this.downloadBlob(blob, fileName);
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Fiche chantier PDF générée.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "export");
    } finally {
      this.worksiteDocumentPdfBusyId = null;
    }
  }

  async exportWorksitePreventionPlanPdf(worksiteId: string): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    this.worksitePreventionPlanPdfBusyId = worksiteId;
    this.errorMessage = "";
    this.feedbackMessage = "Plan de prévention PDF en préparation.";
    try {
      const { blob, fileName } = await downloadWorksitePreventionPlanPdf(
        this.accessToken,
        this.selectedOrganizationId,
        worksiteId
      );
      this.downloadBlob(blob, fileName);
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Plan de prévention PDF généré.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "export");
    } finally {
      this.worksitePreventionPlanPdfBusyId = null;
    }
  }

  async downloadWorksiteDocument(document: DashboardWorksiteDocumentItem): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    this.worksiteDocumentDownloadBusyId = document.id;
    this.errorMessage = "";
    this.feedbackMessage = "Document chantier en préparation.";
    try {
      const { blob, fileName } = await downloadGeneratedWorksiteDocument(
        this.accessToken,
        this.selectedOrganizationId,
        document.id
      );
      this.downloadBlob(blob, fileName);
      this.markWorksiteDocumentAsStored(document.id, blob.size);
      this.feedbackMessage = "Document chantier téléchargé.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "export");
    } finally {
      this.worksiteDocumentDownloadBusyId = null;
    }
  }

  toggleWorksiteDocumentDetails(documentId: string): void {
    this.selectedWorksiteDocumentDetailId =
      this.selectedWorksiteDocumentDetailId === documentId ? null : documentId;
  }

  private markWorksiteDocumentAsStored(documentId: string, sizeBytes: number): void {
    this.worksiteDocuments = this.worksiteDocuments.map((document) =>
      document.id === documentId
        ? {
            ...document,
            has_stored_file: true,
            size_bytes: sizeBytes > 0 ? sizeBytes : document.size_bytes,
          }
        : document
    );
  }

  async saveWorksiteCoordination(item: DashboardWorksiteOverviewItem): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    const draft = this.getWorksiteCoordinationDraft(item.id);
    this.worksiteCoordinationBusyId = item.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateWorksiteCoordination(
        this.accessToken,
        this.selectedOrganizationId,
        item.id,
        {
          status: draft.status,
          assignee_user_id: draft.assigneeUserId || null,
          comment_text: this.normalizeOptionalText(draft.commentText),
        },
      );
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Coordination du chantier mise à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.worksiteCoordinationBusyId = null;
    }
  }

  async saveWorksiteDocumentCoordination(document: DashboardWorksiteDocumentItem): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    const draft = this.getWorksiteDocumentCoordinationDraft(document.id);
    this.worksiteDocumentCoordinationBusyId = document.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateWorksiteDocumentCoordination(
        this.accessToken,
        this.selectedOrganizationId,
        document.id,
        {
          status: draft.status,
          assignee_user_id: draft.assigneeUserId || null,
          comment_text: this.normalizeOptionalText(draft.commentText),
        },
      );
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Coordination du document mise à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.worksiteDocumentCoordinationBusyId = null;
    }
  }

  async changeWorksiteDocumentLifecycleStatus(
    documentId: string,
    lifecycleStatus: DocumentLifecycleStatus,
  ): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    const existingDocument = this.worksiteDocuments.find((document) => document.id === documentId);
    if (!existingDocument || existingDocument.lifecycle_status === lifecycleStatus) {
      return;
    }

    this.worksiteDocumentStatusBusyId = documentId;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateWorksiteDocumentStatus(
        this.accessToken,
        this.selectedOrganizationId,
        documentId,
        { lifecycle_status: lifecycleStatus },
      );
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage =
        lifecycleStatus === "finalized"
          ? "Document chantier marqué comme finalisé."
          : "Document chantier repassé en brouillon.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.worksiteDocumentStatusBusyId = null;
    }
  }

  async changeWorksiteDocumentSignature(
    documentId: string,
    signatureDocumentId: string,
  ): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    const existingDocument = this.worksiteDocuments.find((document) => document.id === documentId);
    const nextSignatureDocumentId = signatureDocumentId || null;
    if (!existingDocument || existingDocument.linked_signature_id === nextSignatureDocumentId) {
      return;
    }

    this.worksiteDocumentSignatureBusyId = documentId;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateWorksiteDocumentSignature(
        this.accessToken,
        this.selectedOrganizationId,
        documentId,
        { signature_document_id: nextSignatureDocumentId },
      );
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = nextSignatureDocumentId
        ? "Signature liée au document chantier."
        : "Lien vers la signature retiré du document chantier.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.worksiteDocumentSignatureBusyId = null;
    }
  }

  async toggleWorksiteDocumentProof(
    documentId: string,
    proofDocumentId: string,
    isLinked: boolean,
  ): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    const existingDocument = this.worksiteDocuments.find((document) => document.id === documentId);
    if (!existingDocument) {
      return;
    }

    const nextProofIds = isLinked
      ? [...existingDocument.linked_proofs.map((proof) => proof.id), proofDocumentId]
      : existingDocument.linked_proofs
          .map((proof) => proof.id)
          .filter((proofId) => proofId !== proofDocumentId);
    const normalizedNextProofIds = Array.from(new Set(nextProofIds));
    const currentProofIds = existingDocument.linked_proofs.map((proof) => proof.id);
    if (JSON.stringify(currentProofIds) === JSON.stringify(normalizedNextProofIds)) {
      return;
    }

    this.worksiteDocumentProofBusyId = documentId;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateWorksiteDocumentProofs(
        this.accessToken,
        this.selectedOrganizationId,
        documentId,
        { proof_document_ids: normalizedNextProofIds },
      );
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = isLinked
        ? "Preuve liée au document chantier."
        : "Lien vers la preuve retiré du document chantier.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.worksiteDocumentProofBusyId = null;
    }
  }

  toggleWorksitePreventionPlanEditor(worksiteId: string): void {
    if (this.worksitePreventionPlanEditingId === worksiteId) {
      this.cancelWorksitePreventionPlanEditing();
      return;
    }

    const worksite = this.billingWorksites.find((entry) => entry.id === worksiteId);
    if (!worksite) {
      return;
    }

    const initialForm = this.buildWorksitePreventionPlanForm(worksite);
    this.worksitePreventionPlanEditingId = worksiteId;
    this.worksitePreventionPlanInitialForm = this.cloneWorksitePreventionPlanForm(initialForm);
    this.worksitePreventionPlanForm = this.cloneWorksitePreventionPlanForm(initialForm);
    this.errorMessage = "";
    this.feedbackMessage = `Plan de prévention prêt à ajuster pour ${worksite.name}.`;
  }

  cancelWorksitePreventionPlanEditing(): void {
    this.worksitePreventionPlanEditingId = null;
    this.worksitePreventionPlanPdfBusyId = null;
    this.worksitePreventionPlanInitialForm = null;
    this.resetWorksitePreventionPlanForm();
  }

  restoreInitialWorksitePreventionPlanForm(): void {
    if (!this.worksitePreventionPlanInitialForm) {
      return;
    }

    this.worksitePreventionPlanForm = this.cloneWorksitePreventionPlanForm(this.worksitePreventionPlanInitialForm);
    this.errorMessage = "";
    this.feedbackMessage = "Préremplissage initial réappliqué.";
  }

  async exportAdjustedWorksitePreventionPlanPdf(worksiteId: string): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    this.worksitePreventionPlanPdfBusyId = worksiteId;
    this.errorMessage = "";
    this.feedbackMessage = "Plan de prévention PDF en préparation avec vos ajustements.";
    try {
      const payload: WorksitePreventionPlanExportRequest = {
        useful_date: this.normalizeOptionalText(this.worksitePreventionPlanForm.usefulDate),
        intervention_context: this.normalizeOptionalText(this.worksitePreventionPlanForm.interventionContext),
        vigilance_points: this.splitMultilineItems(this.worksitePreventionPlanForm.vigilancePoints),
        measure_points: this.splitMultilineItems(this.worksitePreventionPlanForm.measurePoints),
        additional_contact: this.normalizeOptionalText(this.worksitePreventionPlanForm.additionalContact),
      };
      const { blob, fileName } = await downloadWorksitePreventionPlanPdf(
        this.accessToken,
        this.selectedOrganizationId,
        worksiteId,
        payload
      );
      this.downloadBlob(blob, fileName);
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Plan de prévention simplifié généré avec les ajustements.";
      this.cancelWorksitePreventionPlanEditing();
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "export");
    } finally {
      this.worksitePreventionPlanPdfBusyId = null;
    }
  }

  prepareQuoteFromWorksite(worksiteId: string): void {
    const worksite = this.billingWorksites.find((entry) => entry.id === worksiteId);
    if (!worksite) {
      return;
    }

    const matchedCustomer = this.findBillingCustomerByName(worksite.client_name);
    this.quoteForm = {
      ...this.quoteForm,
      customerId: matchedCustomer?.id ?? "",
      worksiteId: worksite.id,
      title: this.quoteForm.title.trim() ? this.quoteForm.title : worksite.name,
    };
    this.errorMessage = "";
    this.feedbackMessage = matchedCustomer
      ? `Devis préparé depuis le chantier ${worksite.name}.`
      : `Devis préparé depuis le chantier ${worksite.name}. Client à confirmer manuellement.`;
    void this.navigateToWorkspaceRoute("/app/facturation", "billing-quote-card");
  }

  prepareInvoiceFromWorksite(worksiteId: string): void {
    const worksite = this.billingWorksites.find((entry) => entry.id === worksiteId);
    if (!worksite) {
      return;
    }

    const matchedCustomer = this.findBillingCustomerByName(worksite.client_name);
    this.invoiceForm = {
      ...this.invoiceForm,
      customerId: matchedCustomer?.id ?? "",
      worksiteId: worksite.id,
      title: this.invoiceForm.title.trim() ? this.invoiceForm.title : worksite.name,
    };
    this.errorMessage = "";
    this.feedbackMessage = matchedCustomer
      ? `Facture préparée depuis le chantier ${worksite.name}.`
      : `Facture préparée depuis le chantier ${worksite.name}. Client à confirmer manuellement.`;
    void this.navigateToWorkspaceRoute("/app/facturation", "billing-invoice-card");
  }

  prepareQuoteFromCustomer(customerId: string): void {
    const customer = this.billingCustomers.find((entry) => entry.id === customerId);
    if (!customer) {
      return;
    }

    const matchedWorksite = this.findSingleWorksiteForCustomer(customer.name);
    this.quoteForm = {
      ...this.quoteForm,
      customerId: customer.id,
      worksiteId: matchedWorksite?.id ?? "",
      title: this.quoteForm.title.trim() ? this.quoteForm.title : customer.name,
    };
    this.errorMessage = "";
    this.feedbackMessage = matchedWorksite
      ? `Devis préparé pour ${customer.name}, avec le chantier ${matchedWorksite.name}.`
      : `Devis préparé pour ${customer.name}. Aucun chantier repris automatiquement.`;
    void this.navigateToWorkspaceRoute("/app/facturation", "billing-quote-card");
  }

  prepareInvoiceFromCustomer(customerId: string): void {
    const customer = this.billingCustomers.find((entry) => entry.id === customerId);
    if (!customer) {
      return;
    }

    const matchedWorksite = this.findSingleWorksiteForCustomer(customer.name);
    this.invoiceForm = {
      ...this.invoiceForm,
      customerId: customer.id,
      worksiteId: matchedWorksite?.id ?? "",
      title: this.invoiceForm.title.trim() ? this.invoiceForm.title : customer.name,
    };
    this.errorMessage = "";
    this.feedbackMessage = matchedWorksite
      ? `Facture préparée pour ${customer.name}, avec le chantier ${matchedWorksite.name}.`
      : `Facture préparée pour ${customer.name}. Aucun chantier repris automatiquement.`;
    void this.navigateToWorkspaceRoute("/app/facturation", "billing-invoice-card");
  }

  async changeQuoteWorksite(quote: QuoteRecord, worksiteId: string): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.quoteWorksiteBusyId = quote.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateQuoteWorksiteLink(this.accessToken, this.selectedOrganizationId, quote.id, {
        worksite_id: worksiteId || null
      });
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Chantier du devis mis à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.quoteWorksiteBusyId = null;
    }
  }

  async exportQuotePdf(quote: QuoteRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    this.quotePdfBusyId = quote.id;
    this.errorMessage = "";
    this.feedbackMessage = "PDF devis en préparation.";
    try {
      const { blob, fileName } = await downloadQuotePdf(this.accessToken, this.selectedOrganizationId, quote.id);
      this.downloadBlob(blob, fileName);
      this.feedbackMessage = "PDF devis généré.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "export");
    } finally {
      this.quotePdfBusyId = null;
    }
  }

  async duplicateQuoteAsInvoice(quote: QuoteRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.quoteDuplicateBusyId = quote.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      const invoice = await duplicateQuoteToInvoice(this.accessToken, this.selectedOrganizationId, quote.id);
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = `Facture ${invoice.number} créée depuis le devis ${quote.number}.`;
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.quoteDuplicateBusyId = null;
    }
  }

  async toggleQuoteHistory(quote: QuoteRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    if (this.quoteHistoryOpenId === quote.id) {
      this.quoteHistoryOpenId = null;
      return;
    }

    this.quoteHistoryBusyId = quote.id;
    this.errorMessage = "";
    try {
      const logs = await listAuditLogs(this.accessToken, this.selectedOrganizationId, {
        limit: 10,
        targetId: quote.id,
        targetTypes: ["quote", "quote_worksite_link"],
      });
      this.quoteHistoryById = { ...this.quoteHistoryById, [quote.id]: logs };
      this.quoteHistoryOpenId = quote.id;
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "load");
    } finally {
      this.quoteHistoryBusyId = null;
    }
  }

  async changeQuoteStatus(quote: QuoteRecord, status: QuoteStatus): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }
    if (quote.status === status) {
      return;
    }

    this.quoteStatusBusyId = quote.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateQuoteStatus(this.accessToken, this.selectedOrganizationId, quote.id, { status });
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Statut du devis mis à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.quoteStatusBusyId = null;
    }
  }

  async changeQuoteFollowUpStatus(quote: QuoteRecord, followUpStatus: BillingFollowUpStatus): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }
    if (quote.follow_up_status === followUpStatus) {
      return;
    }

    this.quoteFollowUpBusyId = quote.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateQuoteFollowUpStatus(this.accessToken, this.selectedOrganizationId, quote.id, {
        follow_up_status: followUpStatus,
      });
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Suivi du devis mis à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.quoteFollowUpBusyId = null;
    }
  }

  discardInvoiceDraft(): void {
    this.clearBillingDraft("invoice");
    this.resetInvoiceForm();
    this.refreshBillingDraftSnapshots();
    this.feedbackMessage = "Saisie de la facture effacée.";
  }

  async saveInvoice(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.invoiceSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await createInvoice(this.accessToken, this.selectedOrganizationId, {
        customer_id: this.invoiceForm.customerId,
        worksite_id: this.invoiceForm.worksiteId || null,
        title: this.normalizeOptionalText(this.invoiceForm.title),
        issue_date: this.invoiceForm.issueDate,
        due_date: this.normalizeOptionalText(this.invoiceForm.dueDate),
        status: this.invoiceForm.status,
        currency: "EUR",
        line_items: this.buildBillingLineItemsPayload(this.invoiceForm.lines),
        notes: this.normalizeOptionalText(this.invoiceForm.notes)
      });
      this.clearBillingDraft("invoice");
      await this.refreshOrganizationWorkspace();
      this.resetInvoiceForm();
      this.refreshBillingDraftSnapshots();
      this.feedbackMessage = "Facture ajoutée.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.invoiceSaving = false;
    }
  }

  async changeInvoiceWorksite(invoice: InvoiceRecord, worksiteId: string): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.invoiceWorksiteBusyId = invoice.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateInvoiceWorksiteLink(this.accessToken, this.selectedOrganizationId, invoice.id, {
        worksite_id: worksiteId || null
      });
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Chantier de la facture mis à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.invoiceWorksiteBusyId = null;
    }
  }

  async exportInvoicePdf(invoice: InvoiceRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    this.invoicePdfBusyId = invoice.id;
    this.errorMessage = "";
    this.feedbackMessage = "PDF facture en préparation.";
    try {
      const { blob, fileName } = await downloadInvoicePdf(this.accessToken, this.selectedOrganizationId, invoice.id);
      this.downloadBlob(blob, fileName);
      this.feedbackMessage = "PDF facture généré.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "export");
    } finally {
      this.invoicePdfBusyId = null;
    }
  }

  async toggleInvoiceHistory(invoice: InvoiceRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    if (this.invoiceHistoryOpenId === invoice.id) {
      this.invoiceHistoryOpenId = null;
      return;
    }

    this.invoiceHistoryBusyId = invoice.id;
    this.errorMessage = "";
    try {
      const logs = await listAuditLogs(this.accessToken, this.selectedOrganizationId, {
        limit: 10,
        targetId: invoice.id,
        targetTypes: ["invoice", "invoice_payment", "invoice_worksite_link"],
      });
      this.invoiceHistoryById = { ...this.invoiceHistoryById, [invoice.id]: logs };
      this.invoiceHistoryOpenId = invoice.id;
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "load");
    } finally {
      this.invoiceHistoryBusyId = null;
    }
  }

  async changeInvoiceStatus(invoice: InvoiceRecord, status: "draft" | "issued"): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }
    if (invoice.status === status) {
      return;
    }

    this.invoiceStatusBusyId = invoice.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateInvoiceStatus(this.accessToken, this.selectedOrganizationId, invoice.id, { status });
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Statut de la facture mis à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.invoiceStatusBusyId = null;
    }
  }

  async changeInvoiceFollowUpStatus(invoice: InvoiceRecord, followUpStatus: BillingFollowUpStatus): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }
    if (invoice.follow_up_status === followUpStatus) {
      return;
    }

    this.invoiceFollowUpBusyId = invoice.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateInvoiceFollowUpStatus(this.accessToken, this.selectedOrganizationId, invoice.id, {
        follow_up_status: followUpStatus,
      });
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage = "Suivi de la facture mis à jour.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.invoiceFollowUpBusyId = null;
    }
  }

  openInvoicePayment(invoice: InvoiceRecord): void {
    this.invoicePaymentId = invoice.id;
    this.invoicePaymentForm = {
      paidAmount: (invoice.outstanding_amount_cents / 100).toFixed(2).replace(".", ","),
      paidAt: this.getTodayDateValue()
    };
  }

  cancelInvoicePayment(): void {
    this.invoicePaymentId = null;
    this.resetInvoicePaymentForm();
  }

  canSaveInvoicePayment(invoice: InvoiceRecord): boolean {
    const paidAmountCents = this.parseUnitPriceToCents(this.invoicePaymentForm.paidAmount);
    return Boolean(
      paidAmountCents !== null
      && paidAmountCents > 0
      && paidAmountCents <= invoice.total_amount_cents
      && this.invoicePaymentForm.paidAt
    );
  }

  async saveInvoicePayment(invoice: InvoiceRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    const paidAmountCents = this.parseUnitPriceToCents(this.invoicePaymentForm.paidAmount);
    if (paidAmountCents === null || !this.invoicePaymentForm.paidAt) {
      this.errorMessage = "Renseignez un montant payé et une date valides.";
      return;
    }

    this.invoicePaymentBusyId = invoice.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await recordInvoicePayment(this.accessToken, this.selectedOrganizationId, invoice.id, {
        paid_amount_cents: paidAmountCents,
        paid_at: this.invoicePaymentForm.paidAt
      });
      await this.refreshOrganizationWorkspace();
      this.cancelInvoicePayment();
      this.feedbackMessage = "Paiement enregistré.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.invoicePaymentBusyId = null;
    }
  }

  startEditingBuildingSafetyItem(item: BuildingSafetyItemRecord): void {
    this.buildingSafetyEditingId = item.id;
    this.buildingSafetyForm = {
      siteId: item.site_id,
      itemType: item.item_type,
      name: item.name,
      nextDueDate: item.next_due_date,
      lastCheckedAt: item.last_checked_at ?? "",
      status: item.status,
      notes: item.notes ?? ""
    };
  }

  cancelBuildingSafetyEditing(): void {
    this.buildingSafetyEditingId = null;
    this.resetBuildingSafetyForm();
  }

  async saveBuildingSafetyItem(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.buildingSafetySaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      if (this.buildingSafetyEditingId) {
        await updateBuildingSafetyItem(this.accessToken, this.selectedOrganizationId, this.buildingSafetyEditingId, {
          next_due_date: this.buildingSafetyForm.nextDueDate,
          last_checked_at: this.normalizeOptionalText(this.buildingSafetyForm.lastCheckedAt),
          status: this.buildingSafetyForm.status,
          notes: this.normalizeOptionalText(this.buildingSafetyForm.notes)
        });
      } else {
        await createBuildingSafetyItem(this.accessToken, this.selectedOrganizationId, {
          site_id: this.buildingSafetyForm.siteId,
          item_type: this.buildingSafetyForm.itemType,
          name: this.buildingSafetyForm.name.trim(),
          next_due_date: this.buildingSafetyForm.nextDueDate,
          last_checked_at: this.normalizeOptionalText(this.buildingSafetyForm.lastCheckedAt),
          notes: this.normalizeOptionalText(this.buildingSafetyForm.notes)
        });
      }
      await this.refreshOrganizationWorkspace();
      const wasEditing = this.buildingSafetyEditingId !== null;
      this.cancelBuildingSafetyEditing();
      this.feedbackMessage = wasEditing ? "Élément sécurité mis à jour." : "Élément sécurité ajouté.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.buildingSafetySaving = false;
    }
  }

  async toggleBuildingSafetyItemStatus(item: BuildingSafetyItemRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.buildingSafetyStatusBusyId = item.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateBuildingSafetyItem(this.accessToken, this.selectedOrganizationId, item.id, {
        status: item.status === "active" ? "archived" : "active"
      });
      await this.refreshOrganizationWorkspace();
      if (this.buildingSafetyEditingId === item.id) {
        this.cancelBuildingSafetyEditing();
      }
      this.feedbackMessage = item.status === "active" ? "Élément archivé." : "Élément réactivé.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.buildingSafetyStatusBusyId = null;
    }
  }

  startEditingDuerpEntry(entry: DuerpEntryRecord): void {
    this.duerpEditingId = entry.id;
    this.duerpForm = {
      siteId: entry.site_id ?? "",
      workUnitName: entry.work_unit_name,
      riskLabel: entry.risk_label,
      severity: entry.severity,
      preventionAction: entry.prevention_action ?? ""
    };
  }

  cancelDuerpEditing(): void {
    this.duerpEditingId = null;
    this.resetDuerpForm();
  }

  async saveDuerpEntry(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.duerpSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      if (this.duerpEditingId) {
        await updateDuerpEntry(this.accessToken, this.selectedOrganizationId, this.duerpEditingId, {
          site_id: this.duerpForm.siteId || undefined,
          work_unit_name: this.duerpForm.workUnitName.trim(),
          risk_label: this.duerpForm.riskLabel.trim(),
          severity: this.duerpForm.severity,
          prevention_action: this.normalizeOptionalText(this.duerpForm.preventionAction)
        });
      } else {
        await createDuerpEntry(this.accessToken, this.selectedOrganizationId, {
          site_id: this.duerpForm.siteId || null,
          work_unit_name: this.duerpForm.workUnitName.trim(),
          risk_label: this.duerpForm.riskLabel.trim(),
          severity: this.duerpForm.severity,
          prevention_action: this.normalizeOptionalText(this.duerpForm.preventionAction)
        });
      }
      await this.refreshOrganizationWorkspace();
      const wasEditing = this.duerpEditingId !== null;
      this.cancelDuerpEditing();
      this.feedbackMessage = wasEditing ? "Entrée DUERP mise à jour." : "Entrée DUERP ajoutée.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.duerpSaving = false;
    }
  }

  async toggleDuerpEntryStatus(entry: DuerpEntryRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.duerpStatusBusyId = entry.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await updateDuerpEntry(this.accessToken, this.selectedOrganizationId, entry.id, {
        status: entry.status === "active" ? "archived" : "active"
      });
      await this.refreshOrganizationWorkspace();
      if (this.duerpEditingId === entry.id) {
        this.cancelDuerpEditing();
      }
      this.feedbackMessage = entry.status === "active" ? "Entrée DUERP archivée." : "Entrée DUERP réactivée.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.duerpStatusBusyId = null;
    }
  }

  async createEvidence(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.regulatoryEvidenceSaving = true;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      await createRegulatoryEvidence(this.accessToken, this.selectedOrganizationId, {
        link_kind: this.regulatoryEvidenceForm.linkKind,
        obligation_id:
          this.regulatoryEvidenceForm.linkKind === "obligation"
            ? this.regulatoryEvidenceForm.obligationId
            : null,
        site_id:
          this.regulatoryEvidenceForm.linkKind === "site"
            ? this.regulatoryEvidenceForm.siteId
            : null,
        building_safety_item_id:
          this.regulatoryEvidenceForm.linkKind === "building_safety_item"
            ? this.regulatoryEvidenceForm.buildingSafetyItemId
            : null,
        duerp_entry_id:
          this.regulatoryEvidenceForm.linkKind === "duerp_entry"
            ? this.regulatoryEvidenceForm.duerpEntryId
            : null,
        file_name: this.regulatoryEvidenceForm.fileName.trim(),
        document_type: this.regulatoryEvidenceForm.documentType.trim(),
        notes: this.normalizeOptionalText(this.regulatoryEvidenceForm.notes)
      });
      await this.refreshOrganizationWorkspace();
      this.resetRegulatoryEvidenceForm();
      this.feedbackMessage = "Pièce justificative ajoutée.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "save");
    } finally {
      this.regulatoryEvidenceSaving = false;
    }
  }

  async exportRegulatoryPdf(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
      return;
    }

    this.regulatoryExporting = true;
    this.errorMessage = "";
    this.feedbackMessage = "Export réglementaire PDF en préparation.";
    try {
      const { blob, fileName } = await downloadRegulatoryExportPdf(this.accessToken, this.selectedOrganizationId);
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(objectUrl);
      this.feedbackMessage = "PDF réglementaire généré.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "export");
    } finally {
      this.regulatoryExporting = false;
    }
  }

  async toggleSiteStatus(site: OrganizationSiteRecord): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
      return;
    }

    this.organizationSiteStatusBusyId = site.id;
    this.errorMessage = "";
    this.feedbackMessage = "";
    try {
      const updatedSite = await updateOrganizationSite(
        this.accessToken,
        this.selectedOrganizationId,
        site.id,
        {
          status: site.status === "active" ? "archived" : "active"
        }
      );
      await this.refreshOrganizationWorkspace();
      this.feedbackMessage =
        updatedSite.status === "active" ? "Site réactivé." : "Site archivé.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error, "update");
    } finally {
      this.organizationSiteStatusBusyId = null;
    }
  }

  handleSiteFilterChange(): void {
    if (!this.buildingSafetyEditingId && this.selectedSafetySiteId !== "all") {
      this.buildingSafetyForm.siteId = this.selectedSafetySiteId;
    }
    if (!this.duerpEditingId) {
      this.duerpForm.siteId = this.selectedSafetySiteId !== "all" ? this.selectedSafetySiteId : this.duerpForm.siteId;
    }
    if (this.selectedSafetySiteId !== "all") {
      if (
        this.regulatoryEvidenceForm.linkKind === "site"
        && this.regulatoryEvidenceForm.siteId !== this.selectedSafetySiteId
      ) {
        this.regulatoryEvidenceForm.siteId = this.selectedSafetySiteId;
      }
      if (
        this.regulatoryEvidenceForm.linkKind === "building_safety_item"
        && this.regulatoryEvidenceForm.buildingSafetyItemId
        && !this.selectableBuildingSafetyItems.some((item) => item.id === this.regulatoryEvidenceForm.buildingSafetyItemId)
      ) {
        this.regulatoryEvidenceForm.buildingSafetyItemId = "";
      }
      if (
        this.regulatoryEvidenceForm.linkKind === "duerp_entry"
        && this.regulatoryEvidenceForm.duerpEntryId
        && !this.selectableDuerpEntries.some((entry) => entry.id === this.regulatoryEvidenceForm.duerpEntryId)
      ) {
        this.regulatoryEvidenceForm.duerpEntryId = "";
      }
    }
  }

  logout(): void {
    this.clearAuthenticatedState(true, "logout");
    void this.router.navigateByUrl("/login");
  }

  getSiteTypeLabel(siteType: OrganizationSiteType): string {
    switch (siteType) {
      case "site":
        return "Site";
      case "building":
        return "Bâtiment";
      case "office":
        return "Bureau";
      case "warehouse":
        return "Entrepôt";
    }
  }

  getSiteNameById(siteId: string | null): string {
    if (!siteId) {
      return "Entreprise";
    }
    return this.organizationSites.find((site) => site.id === siteId)?.name ?? "Site";
  }

  getBillingWorksiteNameById(worksiteId: string | null): string {
    if (!worksiteId) {
      return "Aucun chantier lié";
    }
    return this.billingWorksites.find((worksite) => worksite.id === worksiteId)?.name ?? "Chantier";
  }

  getCustomerTypeLabel(customerType: BillingCustomerType): string {
    switch (customerType) {
      case "company":
        return "Entreprise";
      case "individual":
        return "Particulier";
    }
  }

  getWorksiteStatusLabel(status: WorksiteApiSummary["status"]): string {
    switch (status) {
      case "planned":
        return "Planifié";
      case "in_progress":
        return "En cours";
      case "blocked":
        return "Bloqué";
      case "completed":
        return "Terminé";
    }
  }

  getWorksiteStatusTone(status: WorksiteApiSummary["status"]): CfmTone {
    switch (status) {
      case "planned":
        return "calm";
      case "in_progress":
        return "progress";
      case "blocked":
        return "warning";
      case "completed":
        return "success";
    }
  }

  getWorksiteDocumentLifecycleStatusLabel(status: DocumentLifecycleStatus): string {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "finalized":
        return "Finalisé";
    }
  }

  getWorksiteDocumentLifecycleStatusTone(status: DocumentLifecycleStatus): CfmTone {
    switch (status) {
      case "draft":
        return "progress";
      case "finalized":
        return "success";
    }
  }

  getWorksiteDocumentTechnicalStatusLabel(status: RegulatoryEvidenceRecord["status"]): string {
    switch (status) {
      case "pending":
        return "En préparation";
      case "available":
        return "Prêt";
      case "failed":
        return "À vérifier";
      case "archived":
        return "Archivé";
    }
  }

  getWorksiteDocumentTechnicalStatusTone(status: RegulatoryEvidenceRecord["status"]): CfmTone {
    switch (status) {
      case "pending":
        return "calm";
      case "available":
        return "success";
      case "failed":
        return "warning";
      case "archived":
        return "neutral";
    }
  }

  getWorksiteCoordinationStatusLabel(status: WorksiteCoordinationStatus): string {
    switch (status) {
      case "todo":
        return "À faire";
      case "in_progress":
        return "En cours";
      case "done":
        return "Fait";
    }
  }

  getWorksiteCoordinationStatusTone(status: WorksiteCoordinationStatus): CfmTone {
    switch (status) {
      case "todo":
        return "warning";
      case "in_progress":
        return "progress";
      case "done":
        return "success";
    }
  }

  getWorksiteDocumentSignatureStatusLabel(signatureId: string | null): string {
    return signatureId ? "Signature liée" : "Aucune signature liée";
  }

  getWorksiteDocumentSignatureStatusTone(signatureId: string | null): CfmTone {
    return signatureId ? "success" : "neutral";
  }

  isWorksiteSummaryDocumentType(documentType: string): boolean {
    return documentType === "worksite_summary_pdf";
  }

  isWorksitePreventionPlanDocumentType(documentType: string): boolean {
    return documentType === "worksite_prevention_plan_pdf";
  }

  formatWorksiteLinkedSignatureDetail(document: WorksiteDocumentRecord): string | null {
    if (!document.linked_signature_label) {
      return null;
    }

    const uploadedLabel = this.formatCompactDate(document.linked_signature_uploaded_at);
    if (uploadedLabel) {
      return `Signature du ${uploadedLabel}`;
    }

    if (document.linked_signature_file_name && document.linked_signature_file_name !== document.linked_signature_label) {
      return document.linked_signature_file_name;
    }

    return "Signature chantier liée";
  }

  mapLinkedWorksiteSignatureItem(document: WorksiteDocumentRecord): DashboardWorksiteLinkedAssetItem | null {
    if (!document.linked_signature_id || !document.linked_signature_label) {
      return null;
    }

    const linkedSignature = this.worksiteSignatures.find((signature) => signature.id === document.linked_signature_id);
    const status = linkedSignature?.status ?? "available";
    return {
      id: document.linked_signature_id,
      label: document.linked_signature_label,
      detail: this.formatWorksiteLinkedSignatureDetail(document),
      statusLabel: this.getWorksiteDocumentTechnicalStatusLabel(status),
      statusTone: this.getWorksiteDocumentTechnicalStatusTone(status),
    };
  }

  mapLinkedWorksiteProofItems(document: WorksiteDocumentRecord): DashboardWorksiteLinkedAssetItem[] {
    return document.linked_proofs.map((proof) => ({
      id: proof.id,
      label: proof.label,
      detail: this.formatWorksiteProofDetail(proof),
      statusLabel: this.getWorksiteDocumentTechnicalStatusLabel(proof.status),
      statusTone: this.getWorksiteDocumentTechnicalStatusTone(proof.status),
    }));
  }

  formatWorksiteLinkedProofsSummary(document: WorksiteDocumentRecord): string | null {
    if (document.linked_proofs.length === 0) {
      return null;
    }

    const labels = document.linked_proofs.map((proof) => proof.label);
    if (labels.length === 1) {
      return labels[0];
    }

    return `${labels.length} preuves liées : ${labels.join(", ")}`;
  }

  formatWorksiteProofDetail(proof: WorksiteProofRecord): string | null {
    const uploadedLabel = this.formatCompactDate(proof.uploaded_at);
    if (proof.notes && uploadedLabel) {
      return `${uploadedLabel} · ${proof.notes}`;
    }
    if (proof.notes) {
      return proof.notes;
    }
    return uploadedLabel;
  }

  getQuoteStatusLabel(status: QuoteStatus): string {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "sent":
        return "Envoyé";
      case "accepted":
        return "Accepté";
      case "declined":
        return "Refusé";
    }
  }

  getQuoteStatusTone(status: QuoteStatus): CfmTone {
    switch (status) {
      case "draft":
        return "neutral";
      case "sent":
        return "progress";
      case "accepted":
        return "success";
      case "declined":
        return "warning";
    }
  }

  getInvoiceStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "issued":
        return "Émise";
      case "paid":
        return "Payée";
      case "overdue":
        return "En retard";
    }
  }

  getInvoiceStatusTone(status: InvoiceStatus): CfmTone {
    switch (status) {
      case "draft":
        return "neutral";
      case "issued":
        return "progress";
      case "paid":
        return "success";
      case "overdue":
        return "warning";
    }
  }

  getBillingFollowUpStatusLabel(status: BillingFollowUpStatus): string {
    switch (status) {
      case "normal":
        return "Suivi normal";
      case "to_follow_up":
        return "À relancer";
      case "followed_up":
        return "Relancé";
      case "waiting_customer":
        return "En attente client";
    }
  }

  getBillingFollowUpStatusTone(status: BillingFollowUpStatus): CfmTone {
    switch (status) {
      case "normal":
        return "neutral";
      case "to_follow_up":
        return "warning";
      case "followed_up":
        return "progress";
      case "waiting_customer":
        return "calm";
    }
  }

  getDashboardActionPriorityLabel(priority: DashboardActionPriority): string {
    switch (priority) {
      case "high":
        return "Haute";
      case "medium":
        return "Moyenne";
      case "low":
        return "Basse";
    }
  }

  getDashboardActionPriorityTone(priority: DashboardActionPriority): CfmTone {
    switch (priority) {
      case "high":
        return "warning";
      case "medium":
        return "progress";
      case "low":
        return "neutral";
    }
  }

  getDashboardActionModuleLabel(module: DashboardActionModule): string {
    switch (module) {
      case "reglementation":
        return "Réglementation";
      case "chantier":
        return "Chantier";
      case "facturation":
        return "Facturation";
    }
  }

  getDashboardActionModuleTone(module: DashboardActionModule): CfmTone {
    switch (module) {
      case "reglementation":
        return "calm";
      case "chantier":
        return "progress";
      case "facturation":
        return "neutral";
    }
  }

  getBetaFeedbackCategoryLabel(category: BetaFeedbackCategory): string {
    switch (category) {
      case "blocking":
        return "Bloquant";
      case "unclear":
        return "Incompréhension";
      case "improvement":
        return "Amélioration";
      case "positive":
        return "Retour positif";
    }
  }

  getBetaFeedbackAreaLabel(area: BetaFeedbackArea): string {
    switch (area) {
      case "cockpit":
        return "Cockpit";
      case "worksite":
        return "Chantier";
      case "worksite_document":
        return "Documents chantier";
      case "facturation":
        return "Facturation";
      case "reglementation":
        return "Réglementation";
      case "sync":
        return "Synchronisation visible";
      case "other":
        return "Autre";
    }
  }

  private getDashboardActionPriorityRank(priority: DashboardActionPriority): number {
    switch (priority) {
      case "high":
        return 1;
      case "medium":
        return 2;
      case "low":
        return 3;
    }
  }

  private getDashboardOverviewSignalRank(label: string): number {
    switch (label) {
      case "À traiter":
        return 1;
      case "À suivre":
        return 2;
      default:
        return 3;
    }
  }

  private getCoordinationStatusRank(status: WorksiteCoordinationStatus): number {
    switch (status) {
      case "todo":
        return 1;
      case "in_progress":
        return 2;
      case "done":
        return 3;
    }
  }

  private formatDashboardDocumentSummary(label: string, entries: string[], emptyWord: string): string {
    if (entries.length === 0) {
      return `${label} : ${emptyWord}.`;
    }

    const preview = entries.slice(0, 2).join(", ");
    const remaining = entries.length - 2;

    if (remaining > 0) {
      return `${label} : ${preview} + ${remaining} autre${remaining > 1 ? "s" : ""}.`;
    }

    return `${label} : ${preview}.`;
  }

  private formatCompactDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  formatAmountCents(amountCents: number, currency = "EUR"): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amountCents / 100);
  }

  private getAuditChangeValue(
    log: AuditLogRecord,
    field: string,
    side: "from" | "to"
  ): unknown {
    const entry = log.changes?.[field];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return null;
    }
    return (entry as Record<string, unknown>)[side] ?? null;
  }

  private getAuditScalarValue(log: AuditLogRecord, field: string): unknown {
    return log.changes?.[field] ?? null;
  }

  private isQuoteStatus(value: unknown): value is QuoteStatus {
    return value === "draft" || value === "sent" || value === "accepted" || value === "declined";
  }

  private isInvoiceStatus(value: unknown): value is InvoiceStatus {
    return value === "draft" || value === "issued" || value === "paid" || value === "overdue";
  }

  private isBillingFollowUpStatus(value: unknown): value is BillingFollowUpStatus {
    return (
      value === "normal"
      || value === "to_follow_up"
      || value === "followed_up"
      || value === "waiting_customer"
    );
  }

  private mapCockpitTone(tone: CockpitTone): CfmTone {
    return tone;
  }

  getBuildingSafetyTypeLabel(itemType: BuildingSafetyItemType): string {
    switch (itemType) {
      case "fire_extinguisher":
        return "Extincteur";
      case "dae":
        return "DAE";
      case "periodic_check":
        return "Contrôle périodique";
    }
  }

  getBuildingSafetyAlertStatusLabel(alertStatus: BuildingSafetyItemRecord["alert_status"]): string {
    switch (alertStatus) {
      case "ok":
        return "À jour";
      case "due_soon":
        return "Échéance proche";
      case "overdue":
        return "En retard";
      case "archived":
        return "Archivé";
    }
  }

  getBuildingSafetyAlertStatusTone(alertStatus: BuildingSafetyItemRecord["alert_status"]): CfmTone {
    switch (alertStatus) {
      case "ok":
        return "success";
      case "due_soon":
        return "progress";
      case "overdue":
        return "warning";
      case "archived":
        return "neutral";
    }
  }

  getBuildingSafetySummaryLabel(kind: "overdue" | "due_soon" | "ok"): string {
    const count =
      kind === "overdue"
        ? this.buildingSafetyOverdueCount
        : kind === "due_soon"
          ? this.buildingSafetyDueSoonCount
          : this.buildingSafetyOkCount;

    if (kind === "overdue") {
      return `${count} en retard`;
    }
    if (kind === "due_soon") {
      return `${count} échéance${count > 1 ? "s" : ""} proche${count > 1 ? "s" : ""}`;
    }
    return `${count} à jour`;
  }

  getObligationCountLabel(): string {
    const count = this.regulatoryProfile?.applicable_obligations.length ?? 0;
    return `${count} obligation${count > 1 ? "s" : ""} détectée${count > 1 ? "s" : ""}`;
  }

  openObligationDetail(obligationId: string): void {
    this.selectedObligationId = obligationId;
  }

  getObligationCategoryLabel(category: RegulatoryObligationCategory): string {
    switch (category) {
      case "company":
        return "Entreprise";
      case "employees":
        return "Salariés";
      case "safety":
        return "Sécurité";
      case "buildings":
        return "Bâtiments";
    }
  }

  getObligationPriorityLabel(priority: RegulatoryObligationPriority): string {
    switch (priority) {
      case "high":
        return "Priorité haute";
      case "medium":
        return "Priorité moyenne";
      case "low":
        return "Priorité basse";
    }
  }

  getObligationPriorityTone(priority: RegulatoryObligationPriority): CfmTone {
    switch (priority) {
      case "high":
        return "warning";
      case "medium":
        return "progress";
      case "low":
        return "neutral";
    }
  }

  getComplianceStatusLabel(status: ComplianceStatus): string {
    switch (status) {
      case "to_complete":
        return "À compléter";
      case "in_progress":
        return "En cours";
      case "compliant":
        return "Conforme";
      case "to_verify":
        return "À vérifier";
      case "overdue":
        return "En retard";
    }
  }

  getComplianceStatusTone(status: ComplianceStatus): CfmTone {
    switch (status) {
      case "to_complete":
        return "calm";
      case "in_progress":
        return "progress";
      case "compliant":
        return "success";
      case "to_verify":
        return "warning";
      case "overdue":
        return "warning";
    }
  }

  getDocumentStatusLabel(status: RegulatoryEvidenceRecord["status"]): string {
    switch (status) {
      case "pending":
        return "À compléter";
      case "available":
        return "Disponible";
      case "failed":
        return "À vérifier";
      case "archived":
        return "Archivé";
    }
  }

  getDocumentStatusTone(status: RegulatoryEvidenceRecord["status"]): CfmTone {
    switch (status) {
      case "pending":
        return "progress";
      case "available":
        return "success";
      case "failed":
        return "warning";
      case "archived":
        return "neutral";
    }
  }

  getObligationFirstAction(
    obligation: ApplicableRegulatoryObligationRecord,
    evidenceCount: number
  ): string {
    if (evidenceCount > 0 && obligation.status === "compliant") {
      return "Gardez cette pièce à jour et vérifiez simplement qu'elle reste valable pour le prochain contrôle.";
    }

    switch (obligation.id) {
      case "reg-employees-register":
        return "Préparez un modèle de registre du personnel et identifiez qui le mettra à jour dans l'entreprise.";
      case "reg-employees-safety-organization":
        return "Rassemblez les consignes d'accueil sécurité, le contact interne utile et la première preuve associée.";
      case "reg-sites-emergency-contacts":
        return "Listez les contacts d'urgence et le point de rassemblement pour chaque site actif.";
      case "reg-buildings-periodic-checks":
        return "Recensez les vérifications périodiques à suivre sur vos bâtiments et ajoutez une première preuve de contrôle.";
      case "reg-warehouse-storage-rules":
        return "Identifiez les zones de stockage sensibles et formalisez une première consigne simple de rangement ou de stockage.";
    }

    return "Commencez par rassembler une première preuve simple et clarifier qui suit ce sujet dans l'entreprise.";
  }

  getDuerpSeverityLabel(severity: DuerpSeverity): string {
    switch (severity) {
      case "low":
        return "Gravité faible";
      case "medium":
        return "Gravité moyenne";
      case "high":
        return "Gravité haute";
    }
  }

  getDuerpSeverityTone(severity: DuerpSeverity): CfmTone {
    switch (severity) {
      case "low":
        return "neutral";
      case "medium":
        return "progress";
      case "high":
        return "warning";
    }
  }

  getRegulatoryEvidenceLinkKindLabel(kind: RegulatoryEvidenceLinkKind): string {
    switch (kind) {
      case "obligation":
        return "Obligation";
      case "site":
        return "Site";
      case "building_safety_item":
        return "Sécurité bâtiment";
      case "duerp_entry":
        return "DUERP";
    }
  }

  getCriterionTone(value: boolean | number | null): CfmTone {
    if (value === null) {
      return "progress";
    }
    if (typeof value === "number") {
      return value > 0 ? "success" : "neutral";
    }
    return value ? "success" : "neutral";
  }

  private async refreshSession(organizationId?: string | null): Promise<void> {
    if (!this.accessToken) {
      return;
    }

    if (AppComponent.DISABLE_BOOTSTRAP_SESSION_RESTORE) {
      return;
    }

    this.sessionRestoreInProgress = true;
    this.errorMessage = "";
    try {
      const session = await fetchSession(this.accessToken, organizationId);
      this.session = session;
      this.selectedOrganizationId = session.current_membership.organization.id;
      persistSession(this.accessToken, session);
      await this.ensureAccessibleWorkspaceRoute();
    } catch (error) {
      const nextErrorMessage = this.toErrorMessage(error, "load");
      this.errorMessage = nextErrorMessage;

      const shouldClearAuth =
        error instanceof ApiClientError
        && (error.status === 401 || error.status === 403);

      if (shouldClearAuth) {
        this.clearAuthenticatedState(true, `session refresh failed with ${error.status}`);
      }

      if (shouldClearAuth && !this.shouldRenderLoginScreen) {
        await this.router.navigateByUrl("/login");
      }
    } finally {
      this.sessionRestoreInProgress = false;
    }
  }

  private clearScheduledWorkspaceRefresh(): void {
    if (this.workspaceRefreshScheduledHandle !== null) {
      globalThis.clearTimeout(this.workspaceRefreshScheduledHandle);
      this.workspaceRefreshScheduledHandle = null;
    }
    this.workspaceRefreshScheduledOrganizationId = null;
    this.workspaceRefreshScheduledReason = null;
  }

  private scheduleWorkspaceRefresh(reason: string): void {
    if (AppComponent.WORKSPACE_LOADING_DISABLED) {
      return;
    }

    const currentPath = this.router.url.split("#")[0] || "/login";
    const organizationId = this.selectedOrganizationId;

    if (!this.session || !organizationId || !this.isShellRoutePath(currentPath)) {
      return;
    }

    if (this.workspaceHydratedOrganizationId === organizationId && this.hasWorkspaceContent) {
      return;
    }

    if (this.workspaceRefreshInFlight) {
      return;
    }

    if (this.workspaceRefreshScheduledOrganizationId === organizationId) {
      return;
    }

    this.clearScheduledWorkspaceRefresh();
    this.workspaceRefreshScheduledOrganizationId = organizationId;
    this.workspaceRefreshScheduledReason = reason;

    this.workspaceRefreshScheduledHandle = globalThis.setTimeout(() => {
      const scheduledReason = this.workspaceRefreshScheduledReason ?? reason;
      const scheduledOrganizationId = this.workspaceRefreshScheduledOrganizationId;
      this.clearScheduledWorkspaceRefresh();

      const activePath = this.router.url.split("#")[0] || "/login";
      if (
        !scheduledOrganizationId
        || !this.session
        || !this.selectedOrganizationId
        || this.selectedOrganizationId !== scheduledOrganizationId
        || !this.isShellRoutePath(activePath)
      ) {
        return;
      }

      void this.refreshOrganizationWorkspaceSafely(scheduledReason, scheduledOrganizationId);
    }, 0);
  }

  private async resolveWorkspaceRequest<T>(label: string, requestFactory: () => Promise<T>, fallbackValue: T): Promise<T> {
    try {
      const payload = await requestFactory();
      this.clearWorkspaceSegmentIssue(label);
      return payload;
    } catch (error) {
      this.setWorkspaceSegmentIssue(label, this.toWorkspaceSegmentIssueMessage(label, error));
      console.warn("[workspace] segment failed.", {
        label,
        organizationId: this.selectedOrganizationId,
        errorName: error instanceof Error ? error.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return fallbackValue;
    }
  }

  private async refreshOrganizationWorkspace(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId) {
      this.workspaceHydratedOrganizationId = null;
      this.workspaceSegmentIssues = {};
      this.resetWorkspaceState();
      return;
    }

    if (AppComponent.WORKSPACE_LOADING_DISABLED) {
      this.workspaceHydratedOrganizationId = null;
      this.workspaceSegmentIssues = {};
      this.organizationWorkspaceLoading = false;
      this.resetWorkspaceState();
      return;
    }

    if (this.workspaceHydratedOrganizationId !== this.selectedOrganizationId) {
      this.workspaceSegmentIssues = {};
    }
    this.organizationWorkspaceLoading = true;
    try {
      const billingEnabled = this.isFacturationEnabled;
      const chantierEnabled = this.isChantierEnabled;
      const regulationEnabled = this.isReglementationEnabled;
      if (!regulationEnabled) {
        this.clearWorkspaceSegmentIssue("building-safety-alerts");
        this.clearWorkspaceSegmentIssue("duerp-entries");
        this.clearWorkspaceSegmentIssue("regulatory-evidences");
      }
      const runWorkspaceRequest = <T>(label: string, requestFactory: () => Promise<T>, fallbackValue: T): Promise<T> =>
        this.resolveWorkspaceRequest(label, requestFactory, fallbackValue);
      const shouldLoadWorksites = billingEnabled || chantierEnabled;
      const cockpitSummary = this.canReadOrganization
        ? await runWorkspaceRequest(
            "cockpit-summary",
            () => fetchCockpitSummary(this.accessToken!, this.selectedOrganizationId!),
            null as CockpitSummaryRecord | null
          )
        : null;
      this.cockpitSummary = cockpitSummary;

      const profile = await runWorkspaceRequest(
        "organization-profile",
        () => fetchOrganizationProfile(this.accessToken!, this.selectedOrganizationId!),
        this.currentMembership?.organization ?? null
      );
      const sites = await runWorkspaceRequest(
        "organization-sites",
        () => listOrganizationSites(this.accessToken!, this.selectedOrganizationId!),
        [] as OrganizationSiteRecord[]
      );
      const regulatoryProfile = regulationEnabled
        ? await runWorkspaceRequest(
            "regulatory-profile",
            () => fetchOrganizationRegulatoryProfile(this.accessToken!, this.selectedOrganizationId!),
            null as OrganizationRegulatoryProfileRecord | null
          )
        : null as OrganizationRegulatoryProfileRecord | null;
      const buildingSafetyItems = regulationEnabled
        ? await runWorkspaceRequest(
            "building-safety-items",
            () => listBuildingSafetyItems(this.accessToken!, this.selectedOrganizationId!),
            [] as BuildingSafetyItemRecord[]
          )
        : [] as BuildingSafetyItemRecord[];
      const buildingSafetyAlerts = regulationEnabled
        ? await runWorkspaceRequest(
            "building-safety-alerts",
            () => listBuildingSafetyAlerts(this.accessToken!, this.selectedOrganizationId!),
            [] as BuildingSafetyAlertRecord[]
          )
        : [] as BuildingSafetyAlertRecord[];
      const duerpEntries = regulationEnabled
        ? await runWorkspaceRequest(
            "duerp-entries",
            () => listDuerpEntries(this.accessToken!, this.selectedOrganizationId!),
            [] as DuerpEntryRecord[]
          )
        : [] as DuerpEntryRecord[];
      const regulatoryEvidences = regulationEnabled
        ? await runWorkspaceRequest(
            "regulatory-evidences",
            () => listRegulatoryEvidences(this.accessToken!, this.selectedOrganizationId!),
            [] as RegulatoryEvidenceRecord[]
          )
        : [] as RegulatoryEvidenceRecord[];
      const customers = billingEnabled
        ? await runWorkspaceRequest(
            "billing-customers",
            () => listBillingCustomers(this.accessToken!, this.selectedOrganizationId!),
            [] as BillingCustomerRecord[]
          )
        : [] as BillingCustomerRecord[];
      const worksites = shouldLoadWorksites
        ? await runWorkspaceRequest(
            "worksites",
            () => listWorksites(this.accessToken!, this.selectedOrganizationId!),
            [] as WorksiteApiSummary[]
          )
        : [] as WorksiteApiSummary[];
      const worksiteDocuments = chantierEnabled
        ? await runWorkspaceRequest(
            "worksite-documents",
            () => listWorksiteDocuments(this.accessToken!, this.selectedOrganizationId!),
            [] as WorksiteDocumentRecord[]
          )
        : [] as WorksiteDocumentRecord[];
      const worksiteProofs = chantierEnabled
        ? await runWorkspaceRequest(
            "worksite-proofs",
            () => listWorksiteProofs(this.accessToken!, this.selectedOrganizationId!),
            [] as WorksiteProofRecord[]
          )
        : [] as WorksiteProofRecord[];
      const worksiteSignatures = chantierEnabled
        ? await runWorkspaceRequest(
            "worksite-signatures",
            () => listWorksiteSignatures(this.accessToken!, this.selectedOrganizationId!),
            [] as WorksiteSignatureRecord[]
          )
        : [] as WorksiteSignatureRecord[];
      const worksiteAssignees = chantierEnabled && this.canReadUsers
        ? await runWorkspaceRequest(
            "worksite-assignees",
            () => listWorksiteAssignees(this.accessToken!, this.selectedOrganizationId!),
            [] as WorksiteAssigneeRecord[]
          )
        : [] as WorksiteAssigneeRecord[];
      const quotes = billingEnabled
        ? await runWorkspaceRequest(
            "quotes",
            () => listQuotes(this.accessToken!, this.selectedOrganizationId!),
            [] as QuoteRecord[]
          )
        : [] as QuoteRecord[];
      const invoices = billingEnabled
        ? await runWorkspaceRequest(
            "invoices",
            () => listInvoices(this.accessToken!, this.selectedOrganizationId!),
            [] as InvoiceRecord[]
          )
        : [] as InvoiceRecord[];
      this.organizationProfile = profile;
      this.organizationSites = this.sortSites(sites);
      this.regulatoryProfile = regulatoryProfile;
      this.billingCustomers = customers;
      this.billingWorksites = worksites;
      this.worksiteDocuments = worksiteDocuments;
      this.worksiteProofs = worksiteProofs;
      this.worksiteSignatures = worksiteSignatures;
      this.worksiteAssignees = worksiteAssignees;
      if (
        this.selectedCoordinationAssigneeFilter !== "all"
        && this.selectedCoordinationAssigneeFilter !== "unassigned"
        && !worksiteAssignees.some((assignee) => assignee.user_id === this.selectedCoordinationAssigneeFilter)
      ) {
        this.selectedCoordinationAssigneeFilter = "all";
      }
      this.worksiteCoordinationDrafts = chantierEnabled
        ? Object.fromEntries(
            worksites.map((worksite) => [worksite.id, this.buildCoordinationDraft(worksite.coordination)])
          )
        : {};
      this.worksiteDocumentCoordinationDrafts = chantierEnabled
        ? Object.fromEntries(
            worksiteDocuments.map((document) => [document.id, this.buildCoordinationDraft(document.coordination)])
          )
        : {};
      if (
        this.selectedWorksiteCoordinationId
        && !worksites.some((worksite) => worksite.id === this.selectedWorksiteCoordinationId)
      ) {
        this.selectedWorksiteCoordinationId = null;
      }
      if (!chantierEnabled) {
        this.selectedWorksiteCoordinationId = null;
        this.selectedCoordinationStatusFilter = "all";
        this.selectedCoordinationAssigneeFilter = "all";
      }
      if (
        this.selectedWorksiteDocumentDetailId
        && !this.worksiteDocuments.some((document) => document.id === this.selectedWorksiteDocumentDetailId)
      ) {
        this.selectedWorksiteDocumentDetailId = null;
      }
      if (
        this.selectedWorksiteDocumentFilterId !== "all"
        && !worksites.some((worksite) => worksite.id === this.selectedWorksiteDocumentFilterId)
      ) {
        this.selectedWorksiteDocumentFilterId = "all";
      }
      this.worksiteDocumentDownloadBusyId = null;
      this.worksiteDocumentPdfBusyId = null;
      this.worksiteCoordinationBusyId = null;
      this.worksiteDocumentCoordinationBusyId = null;
      this.worksiteDocumentStatusBusyId = null;
      this.worksitePreventionPlanPdfBusyId = null;
      if (
        this.worksitePreventionPlanEditingId
        && !worksites.some((worksite) => worksite.id === this.worksitePreventionPlanEditingId)
      ) {
        this.cancelWorksitePreventionPlanEditing();
      }
      this.quotes = quotes;
      this.invoices = invoices;
      this.quoteEditingId = null;
      this.quoteEditingSaving = false;
      this.quoteFollowUpBusyId = null;
      this.invoiceEditingId = null;
      this.invoiceEditingSaving = false;
      this.invoiceFollowUpBusyId = null;
      if (this.quoteHistoryOpenId && !quotes.some((quote) => quote.id === this.quoteHistoryOpenId)) {
        this.quoteHistoryOpenId = null;
      }
      this.quoteHistoryById = Object.fromEntries(
        Object.entries(this.quoteHistoryById).filter(([quoteId]) => quotes.some((quote) => quote.id === quoteId))
      );
      if (this.invoiceHistoryOpenId && !invoices.some((invoice) => invoice.id === this.invoiceHistoryOpenId)) {
        this.invoiceHistoryOpenId = null;
      }
      this.invoiceHistoryById = Object.fromEntries(
        Object.entries(this.invoiceHistoryById).filter(([invoiceId]) => invoices.some((invoice) => invoice.id === invoiceId))
      );
      this.hydrateBillingDraftsIfNeeded(billingEnabled);
      if (!regulationEnabled) {
        this.selectedObligationId = null;
      } else {
        if (
          this.selectedObligationId
          && !regulatoryProfile?.applicable_obligations.some((obligation) => obligation.id === this.selectedObligationId)
        ) {
          this.selectedObligationId = null;
        }
        if (!this.selectedObligationId) {
          this.selectedObligationId = regulatoryProfile?.applicable_obligations[0]?.id ?? null;
        }
      }
      this.buildingSafetyItems = buildingSafetyItems;
      this.buildingSafetyAlerts = buildingSafetyAlerts;
      this.duerpEntries = duerpEntries;
      this.regulatoryEvidences = regulatoryEvidences;
      if (
        this.selectedSafetySiteId !== "all"
        && !this.organizationSites.some((site) => site.id === this.selectedSafetySiteId)
      ) {
        this.selectedSafetySiteId = "all";
      }
      if (!this.buildingSafetyForm.siteId) {
        this.buildingSafetyForm.siteId = this.activeOrganizationSites[0]?.id ?? "";
      }
      if (!this.buildingSafetyEditingId && this.selectedSafetySiteId !== "all") {
        this.buildingSafetyForm.siteId = this.selectedSafetySiteId;
      }
      if (!this.duerpEditingId) {
        this.resetDuerpForm();
      }
      if (
        this.customerEditingId
        && !this.billingCustomers.some((customer) => customer.id === this.customerEditingId)
      ) {
        this.cancelCustomerEditing();
      }
      if (!billingEnabled) {
        this.cancelCustomerEditing();
        this.cancelInvoicePayment();
        this.resetQuoteForm();
        this.resetInvoiceForm();
      }
      if (!this.quoteForm.customerId || !this.billingCustomers.some((customer) => customer.id === this.quoteForm.customerId)) {
        this.quoteForm.customerId = this.billingCustomers[0]?.id ?? "";
      }
      if (this.quoteForm.worksiteId && !this.billingWorksites.some((worksite) => worksite.id === this.quoteForm.worksiteId)) {
        this.quoteForm.worksiteId = "";
      }
      if (!this.invoiceForm.customerId || !this.billingCustomers.some((customer) => customer.id === this.invoiceForm.customerId)) {
        this.invoiceForm.customerId = this.billingCustomers[0]?.id ?? "";
      }
      if (this.invoiceForm.worksiteId && !this.billingWorksites.some((worksite) => worksite.id === this.invoiceForm.worksiteId)) {
        this.invoiceForm.worksiteId = "";
      }
      if (this.invoicePaymentId && !this.invoices.some((invoice) => invoice.id === this.invoicePaymentId)) {
        this.cancelInvoicePayment();
      }
      if (!regulationEnabled) {
        this.resetRegulatoryEvidenceForm();
      } else if (
        this.regulatoryEvidenceForm.linkKind === "obligation"
        && this.regulatoryProfile
        && !this.regulatoryProfile.applicable_obligations.some(
          (obligation) => obligation.id === this.regulatoryEvidenceForm.obligationId
        )
      ) {
        this.regulatoryEvidenceForm.obligationId =
          this.regulatoryProfile.applicable_obligations[0]?.id ?? "";
      }
      if (regulationEnabled && this.regulatoryEvidenceForm.linkKind === "site" && !this.regulatoryEvidenceForm.siteId) {
        this.regulatoryEvidenceForm.siteId = this.selectedSafetySiteId !== "all"
          ? this.selectedSafetySiteId
          : this.activeOrganizationSites[0]?.id ?? "";
      }
      if (profile) {
        this.applyProfileToForm(profile);
      }
      this.workspaceHydratedOrganizationId = this.selectedOrganizationId;
      this.handleSiteFilterChange();
      this.refreshBillingDraftSnapshots();
    } finally {
      this.organizationWorkspaceLoading = false;
    }
  }

  private async refreshOrganizationWorkspaceSafely(reason: string, organizationId: string | null = this.selectedOrganizationId): Promise<void> {
    if (this.workspaceRefreshInFlight) {
      return this.workspaceRefreshInFlight;
    }

    let refreshPromise: Promise<void> | null = null;
    refreshPromise = (async () => {
      try {
        await this.refreshOrganizationWorkspace();
      } catch (error) {
        this.errorMessage = this.toErrorMessage(error, "load");
      } finally {
        if (this.workspaceRefreshInFlight === refreshPromise) {
          this.workspaceRefreshInFlight = null;
        }
      }
    })();

    this.workspaceRefreshInFlight = refreshPromise;
    return refreshPromise;
  }

  private async refreshRegulatoryProfile(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.isReglementationEnabled) {
      this.regulatoryProfile = null;
      return;
    }

    this.regulatoryProfile = await fetchOrganizationRegulatoryProfile(
      this.accessToken,
      this.selectedOrganizationId
    );
  }

  private async refreshBuildingSafetyState(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.isReglementationEnabled) {
      this.buildingSafetyItems = [];
      this.buildingSafetyAlerts = [];
      return;
    }

    const [items, alerts] = await Promise.all([
      listBuildingSafetyItems(this.accessToken, this.selectedOrganizationId),
      listBuildingSafetyAlerts(this.accessToken, this.selectedOrganizationId)
    ]);
    this.buildingSafetyItems = items;
    this.buildingSafetyAlerts = alerts;
  }

  private applyProfileToForm(profile: OrganizationRecord): void {
    this.profileForm = {
      name: profile.name ?? "",
      legalName: profile.legal_name ?? "",
      activityLabel: profile.activity_label ?? "",
      employeeCount:
        typeof profile.employee_count === "number" ? String(profile.employee_count) : "",
      hasEmployees:
        profile.has_employees === true ? "yes" : profile.has_employees === false ? "no" : "",
      receivesPublic:
        profile.receives_public === true ? "yes" : profile.receives_public === false ? "no" : "",
      storesHazardousProducts:
        profile.stores_hazardous_products === true
          ? "yes"
          : profile.stores_hazardous_products === false
            ? "no"
            : "",
      performsHighRiskWork:
        profile.performs_high_risk_work === true
          ? "yes"
          : profile.performs_high_risk_work === false
            ? "no"
            : "",
      contactEmail: profile.contact_email ?? "",
      contactPhone: profile.contact_phone ?? "",
      headquartersAddress: profile.headquarters_address ?? "",
      notes: profile.notes ?? ""
    };
  }

  private buildProfilePayload(): OrganizationProfileUpdateRequest {
    const employeeCount = this.profileForm.employeeCount.trim().length > 0
      ? Number(this.profileForm.employeeCount)
      : null;

    return {
      name: this.profileForm.name.trim(),
      legal_name: this.normalizeOptionalText(this.profileForm.legalName),
      activity_label: this.normalizeOptionalText(this.profileForm.activityLabel),
      employee_count: Number.isFinite(employeeCount ?? NaN) ? employeeCount : null,
      has_employees:
        this.profileForm.hasEmployees === "yes"
          ? true
          : this.profileForm.hasEmployees === "no"
            ? false
            : null,
      receives_public:
        this.profileForm.receivesPublic === "yes"
          ? true
          : this.profileForm.receivesPublic === "no"
            ? false
            : null,
      stores_hazardous_products:
        this.profileForm.storesHazardousProducts === "yes"
          ? true
          : this.profileForm.storesHazardousProducts === "no"
            ? false
            : null,
      performs_high_risk_work:
        this.profileForm.performsHighRiskWork === "yes"
          ? true
          : this.profileForm.performsHighRiskWork === "no"
            ? false
            : null,
      contact_email: this.normalizeOptionalText(this.profileForm.contactEmail),
      contact_phone: this.normalizeOptionalText(this.profileForm.contactPhone),
      headquarters_address: this.normalizeOptionalText(this.profileForm.headquartersAddress),
      notes: this.normalizeOptionalText(this.profileForm.notes)
    };
  }

  private sortSites(sites: OrganizationSiteRecord[]): OrganizationSiteRecord[] {
    return [...sites].sort((left, right) => {
      if (left.status !== right.status) {
        return left.status.localeCompare(right.status);
      }
      return left.name.localeCompare(right.name);
    });
  }

  private normalizeOptionalText(value: string): string | null {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private persistBillingDraftsIfNeeded(): void {
    const hydrationScope = this.getBillingDraftHydrationScope();
    if (!hydrationScope || this.billingDraftsHydratedScope !== hydrationScope) {
      return;
    }

    const quoteDraft = this.buildQuoteDraftPayload();
    const nextQuoteSnapshot = JSON.stringify(quoteDraft);
    if (nextQuoteSnapshot !== this.quoteDraftSnapshot) {
      this.quoteDraftSnapshot = nextQuoteSnapshot;
      if (this.isMeaningfulQuoteDraft(quoteDraft)) {
        this.saveBillingDraft("quote", quoteDraft);
      } else {
        this.clearBillingDraft("quote");
      }
    }

    const invoiceDraft = this.buildInvoiceDraftPayload();
    const nextInvoiceSnapshot = JSON.stringify(invoiceDraft);
    if (nextInvoiceSnapshot !== this.invoiceDraftSnapshot) {
      this.invoiceDraftSnapshot = nextInvoiceSnapshot;
      if (this.isMeaningfulInvoiceDraft(invoiceDraft)) {
        this.saveBillingDraft("invoice", invoiceDraft);
      } else {
        this.clearBillingDraft("invoice");
      }
    }
  }

  private refreshBillingDraftSnapshots(): void {
    this.quoteDraftSnapshot = JSON.stringify(this.buildQuoteDraftPayload());
    this.invoiceDraftSnapshot = JSON.stringify(this.buildInvoiceDraftPayload());
  }

  private hydrateBillingDraftsIfNeeded(billingEnabled: boolean): void {
    if (!billingEnabled) {
      this.billingDraftsHydratedScope = null;
      return;
    }

    const hydrationScope = this.getBillingDraftHydrationScope();
    if (!hydrationScope || hydrationScope === this.billingDraftsHydratedScope) {
      return;
    }

    this.restoreQuoteDraft();
    this.restoreInvoiceDraft();
    this.billingDraftsHydratedScope = hydrationScope;
  }

  private getBillingDraftHydrationScope(): string | null {
    const scope = this.getBillingDraftScopeKey();
    if (!scope || !this.isFacturationEnabled) {
      return null;
    }
    return `${scope}:${this.billingCustomers.length}:${this.billingWorksites.length}`;
  }

  private getBillingDraftScopeKey(): string | null {
    const userId = this.session?.user?.id ?? null;
    if (!userId || !this.selectedOrganizationId) {
      return null;
    }
    return `${userId}:${this.selectedOrganizationId}`;
  }

  private getBillingDraftStorageKey(kind: "quote" | "invoice"): string | null {
    const scope = this.getBillingDraftScopeKey();
    return scope ? `conformeo.billing.${kind}.draft.${scope}` : null;
  }

  private getBillingDraftStorage(): Storage | null {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private readBillingDraft<TPayload>(kind: "quote" | "invoice"): BillingDraftRecord<TPayload> | null {
    const storage = this.getBillingDraftStorage();
    const storageKey = this.getBillingDraftStorageKey(kind);
    if (!storage || !storageKey) {
      return null;
    }

    const rawValue = storage.getItem(storageKey);
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as BillingDraftRecord<TPayload>;
      if (!parsed || typeof parsed !== "object" || !("payload" in parsed)) {
        return null;
      }
      return parsed;
    } catch {
      storage.removeItem(storageKey);
      return null;
    }
  }

  private saveBillingDraft(kind: "quote" | "invoice", payload: QuoteDraftForm | InvoiceDraftForm): void {
    const storage = this.getBillingDraftStorage();
    const storageKey = this.getBillingDraftStorageKey(kind);
    if (!storage || !storageKey) {
      return;
    }

    const record: BillingDraftRecord<typeof payload> = {
      updatedAt: new Date().toISOString(),
      payload,
    };
    storage.setItem(storageKey, JSON.stringify(record));
  }

  private clearBillingDraft(kind: "quote" | "invoice"): void {
    const storage = this.getBillingDraftStorage();
    const storageKey = this.getBillingDraftStorageKey(kind);
    if (!storage || !storageKey) {
      return;
    }
    storage.removeItem(storageKey);
  }

  private buildQuoteDraftPayload(): QuoteDraftForm {
    return {
      customerId: this.quoteForm.customerId,
      worksiteId: this.quoteForm.worksiteId,
      title: this.quoteForm.title,
      issueDate: this.quoteForm.issueDate,
      validUntil: this.quoteForm.validUntil,
      status: this.quoteForm.status,
      notes: this.quoteForm.notes,
      lines: this.cloneBillingLines(this.quoteForm.lines),
    };
  }

  private buildInvoiceDraftPayload(): InvoiceDraftForm {
    return {
      customerId: this.invoiceForm.customerId,
      worksiteId: this.invoiceForm.worksiteId,
      title: this.invoiceForm.title,
      issueDate: this.invoiceForm.issueDate,
      dueDate: this.invoiceForm.dueDate,
      status: this.invoiceForm.status,
      notes: this.invoiceForm.notes,
      lines: this.cloneBillingLines(this.invoiceForm.lines),
    };
  }

  private restoreQuoteDraft(): void {
    const record = this.readBillingDraft<QuoteDraftForm>("quote");
    if (!record) {
      return;
    }
    this.quoteForm = this.sanitizeQuoteDraft(record.payload);
  }

  private restoreInvoiceDraft(): void {
    const record = this.readBillingDraft<InvoiceDraftForm>("invoice");
    if (!record) {
      return;
    }
    this.invoiceForm = this.sanitizeInvoiceDraft(record.payload);
  }

  private sanitizeQuoteDraft(payload: Partial<QuoteDraftForm> | null | undefined): QuoteDraftForm {
    return {
      customerId: this.hasBillingCustomer(payload?.customerId) ? payload?.customerId ?? "" : this.billingCustomers[0]?.id ?? "",
      worksiteId: this.hasBillingWorksite(payload?.worksiteId) ? payload?.worksiteId ?? "" : "",
      title: payload?.title ?? "",
      issueDate: payload?.issueDate || this.getTodayDateValue(),
      validUntil: payload?.validUntil ?? "",
      status: payload?.status === "sent" ? "sent" : "draft",
      notes: payload?.notes ?? "",
      lines: this.sanitizeBillingLines(payload?.lines),
    };
  }

  private sanitizeInvoiceDraft(payload: Partial<InvoiceDraftForm> | null | undefined): InvoiceDraftForm {
    return {
      customerId: this.hasBillingCustomer(payload?.customerId) ? payload?.customerId ?? "" : this.billingCustomers[0]?.id ?? "",
      worksiteId: this.hasBillingWorksite(payload?.worksiteId) ? payload?.worksiteId ?? "" : "",
      title: payload?.title ?? "",
      issueDate: payload?.issueDate || this.getTodayDateValue(),
      dueDate: payload?.dueDate ?? "",
      status: payload?.status === "issued" ? "issued" : "draft",
      notes: payload?.notes ?? "",
      lines: this.sanitizeBillingLines(payload?.lines),
    };
  }

  private sanitizeBillingLines(lines: BillingLineForm[] | null | undefined): BillingLineForm[] {
    if (!Array.isArray(lines) || lines.length === 0) {
      return [this.createEmptyBillingLineForm()];
    }

    const normalizedLines = lines.map((line) => ({
      description: typeof line?.description === "string" ? line.description : "",
      quantity: typeof line?.quantity === "string" ? line.quantity : "",
      unitPrice: typeof line?.unitPrice === "string" ? line.unitPrice : "",
    }));

    return normalizedLines.length > 0 ? normalizedLines : [this.createEmptyBillingLineForm()];
  }

  private cloneBillingLines(lines: BillingLineForm[]): BillingLineForm[] {
    return lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    }));
  }

  private isMeaningfulQuoteDraft(draft: QuoteDraftForm): boolean {
    const defaultCustomerId = this.billingCustomers[0]?.id ?? "";
    return Boolean(
      draft.worksiteId
      || draft.title.trim()
      || draft.validUntil
      || draft.status !== "draft"
      || draft.notes.trim()
      || (draft.customerId && draft.customerId !== defaultCustomerId)
      || draft.lines.some((line) => this.isMeaningfulBillingLine(line))
    );
  }

  private isMeaningfulInvoiceDraft(draft: InvoiceDraftForm): boolean {
    const defaultCustomerId = this.billingCustomers[0]?.id ?? "";
    return Boolean(
      draft.worksiteId
      || draft.title.trim()
      || draft.dueDate
      || draft.status !== "draft"
      || draft.notes.trim()
      || (draft.customerId && draft.customerId !== defaultCustomerId)
      || draft.lines.some((line) => this.isMeaningfulBillingLine(line))
    );
  }

  private isMeaningfulBillingLine(line: BillingLineForm): boolean {
    return Boolean(line.description.trim() || line.quantity.trim() || line.unitPrice.trim());
  }

  private hasBillingCustomer(customerId: string | null | undefined): boolean {
    return Boolean(customerId && this.billingCustomers.some((customer) => customer.id === customerId));
  }

  private hasBillingWorksite(worksiteId: string | null | undefined): boolean {
    return Boolean(worksiteId && this.billingWorksites.some((worksite) => worksite.id === worksiteId));
  }

  private findBillingCustomerByName(name: string | null | undefined): BillingCustomerRecord | null {
    const query = this.toSearchableText(name);
    if (!query) {
      return null;
    }

    return this.billingCustomers.find((customer) => this.toSearchableText(customer.name) === query) ?? null;
  }

  private findSingleWorksiteForCustomer(customerName: string | null | undefined): WorksiteApiSummary | null {
    const query = this.toSearchableText(customerName);
    if (!query) {
      return null;
    }

    const matchingWorksites = this.billingWorksites.filter(
      (worksite) => this.toSearchableText(worksite.client_name) === query
    );
    return matchingWorksites.length === 1 ? matchingWorksites[0] : null;
  }

  private buildWorksitePreventionPlanForm(worksite: WorksiteApiSummary): WorksitePreventionPlanForm {
    const matchedCustomer = this.findBillingCustomerByName(worksite.client_name);
    const usefulDate = this.toDateTimeLocalValue(worksite.planned_for);

    return {
      usefulDate,
      interventionContext: this.buildDefaultWorksitePreventionContext(
        worksite,
        matchedCustomer,
        this.formatDateTimeForHumans(usefulDate)
      ),
      vigilancePoints: this.buildDefaultWorksiteVigilancePoints(worksite, matchedCustomer).join("\n"),
      measurePoints: this.buildDefaultWorksiteMeasurePoints(
        worksite,
        matchedCustomer,
        this.formatDateTimeForHumans(usefulDate)
      ).join("\n"),
      additionalContact: "",
    };
  }

  private cloneWorksitePreventionPlanForm(form: WorksitePreventionPlanForm): WorksitePreventionPlanForm {
    return {
      usefulDate: form.usefulDate,
      interventionContext: form.interventionContext,
      vigilancePoints: form.vigilancePoints,
      measurePoints: form.measurePoints,
      additionalContact: form.additionalContact,
    };
  }

  private buildWorksitePreventionPlanPreview(worksite: WorksiteApiSummary): WorksitePreventionPlanPreview {
    return {
      companyName:
        this.normalizeOptionalText(this.organizationProfile?.legal_name ?? "")
        ?? this.normalizeOptionalText(this.organizationProfile?.name ?? "")
        ?? this.currentMembership?.organization.name
        ?? "Entreprise",
      worksiteName: worksite.name,
      worksiteAddress: worksite.address,
      clientName: this.normalizeOptionalText(worksite.client_name),
      usefulDateLabel: this.formatDateTimeForHumans(this.worksitePreventionPlanForm.usefulDate),
      interventionContext:
        this.normalizeOptionalText(this.worksitePreventionPlanForm.interventionContext)
        ?? "Contexte à compléter avant export.",
      vigilancePoints: this.splitMultilineItems(this.worksitePreventionPlanForm.vigilancePoints),
      measurePoints: this.splitMultilineItems(this.worksitePreventionPlanForm.measurePoints),
      additionalContact: this.normalizeOptionalText(this.worksitePreventionPlanForm.additionalContact),
    };
  }

  private buildDefaultWorksitePreventionContext(
    worksite: WorksiteApiSummary,
    customer: BillingCustomerRecord | null,
    usefulDateLabel: string | null,
  ): string {
    const customerName = customer?.name || worksite.client_name;
    const parts = [
      `Intervention préparée sur le chantier ${worksite.name}`,
      `pour ${customerName}`,
      `à l'adresse ${worksite.address}`,
    ];
    if (usefulDateLabel) {
      parts.push(`avec un repère de date au ${usefulDateLabel}`);
    }
    return `${parts.join(" ")}.`;
  }

  private buildDefaultWorksiteVigilancePoints(
    worksite: WorksiteApiSummary,
    customer: BillingCustomerRecord | null,
  ): string[] {
    const points = [
      "Accès au site, accueil et zones d'intervention à confirmer avant le démarrage.",
      "Coactivité possible avec occupants, clients ou autres prestataires présents sur place.",
      "Circulation, manutention et balisage autour de la zone de travail à préparer simplement.",
    ];

    if (worksite.status === "blocked") {
      points.push("Un point bloquant est déjà remonté sur ce chantier et doit être levé avant intervention.");
    } else if (worksite.status === "in_progress") {
      points.push("Le chantier est déjà en cours et demande une coordination simple avec les intervenants présents.");
    } else if (worksite.status === "planned") {
      points.push("Les accès, badges ou autorisations utiles peuvent être vérifiés avant l'arrivée sur site.");
    }

    if (customer && (customer.email || customer.phone)) {
      points.push("Un contact donneur d'ordre est disponible et peut être confirmé avant intervention.");
    }

    return points;
  }

  private buildDefaultWorksiteMeasurePoints(
    worksite: WorksiteApiSummary,
    customer: BillingCustomerRecord | null,
    usefulDateLabel: string | null,
  ): string[] {
    const points = [
      "Présenter l'intervention et le périmètre concerné au contact du site avant de commencer.",
      "Vérifier les accès, les autorisations et les équipements de protection utiles à l'intervention.",
      "Baliser la zone de travail et maintenir un cheminement sûr pour les tiers.",
      "Arrêter l'intervention et faire remonter tout risque non prévu ou toute consigne contradictoire.",
    ];

    if (usefulDateLabel) {
      points.push(`Confirmer simplement l'accueil et l'accès au chantier pour la date utile du ${usefulDateLabel}.`);
    }
    if (customer && (customer.email || customer.phone)) {
      points.push("Utiliser les coordonnées disponibles pour confirmer l'accueil avant l'arrivée sur site.");
    }

    return points;
  }

  private splitMultilineItems(value: string): string[] {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  private toDateTimeLocalValue(value: string | null): string {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private formatDateTimeForHumans(value: string | null): string | null {
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  private scrollToDesktopSection(sectionId: string): void {
    globalThis.document?.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  private async navigateToWorkspaceRoute(route: string, sectionId?: string): Promise<void> {
    await this.router.navigateByUrl(sectionId ? `${route}#${sectionId}` : route);
    if (sectionId && !AppComponent.DISABLE_DEFERRED_WORKSPACE_SCROLL) {
      globalThis.setTimeout(() => this.scrollToDesktopSection(sectionId), 30);
    }
  }

  private async handleRouteChange(): Promise<void> {
    let currentPath = this.router.url.split("#")[0] || "/login";
    const storedAccessToken = getStoredAccessToken();
    const storedOrganizationId = getStoredOrganizationId();

    if (!storedAccessToken && (this.accessToken || this.session)) {
      console.warn("[auth] in-memory session detected without persisted token. Clearing shell state.", {
        currentPath,
        hadAccessTokenInMemory: Boolean(this.accessToken),
        hadSessionInMemory: Boolean(this.session),
      });
      this.clearAuthenticatedState(false);
    } else {
      this.accessToken = storedAccessToken;
      this.selectedOrganizationId = storedOrganizationId;
    }

    if (this.isLoginRoutePath(currentPath)) {
      this.clearScheduledWorkspaceRefresh();
      this.organizationWorkspaceLoading = false;
      return;
    }

    if (!this.isShellRoutePath(currentPath)) {
      this.clearScheduledWorkspaceRefresh();
      return;
    }

    if (!this.accessToken) {
      console.warn("[auth] protected shell route requested without persisted token. Redirecting to login.", {
        currentPath,
      });
      await this.router.navigate(["/login"], { replaceUrl: true });
      return;
    }

    if (!this.session && !this.sessionRestoreInProgress) {
      if (AppComponent.DISABLE_BOOTSTRAP_SESSION_RESTORE) {
        this.organizationWorkspaceLoading = false;
        await this.ensureAccessibleWorkspaceRoute();
        return;
      }

      await this.refreshSession(this.selectedOrganizationId);
      currentPath = this.router.url.split("#")[0] || "/login";
      if (!this.session || !this.isShellRoutePath(currentPath)) {
        return;
      }
    }

    if (this.session) {
      if (AppComponent.WORKSPACE_LOADING_DISABLED) {
        this.organizationWorkspaceLoading = false;
        await this.ensureAccessibleWorkspaceRoute();
        return;
      }

      if (!this.organizationWorkspaceLoading && !this.isWorkspaceHydratedForCurrentOrganization) {
        this.scheduleWorkspaceRefresh("route change");
      }
      await this.ensureAccessibleWorkspaceRoute();
    }
  }

  private resetWorkspaceState(): void {
    this.cockpitSummary = null;
    this.organizationProfile = null;
    this.organizationSites = [];
    this.regulatoryProfile = null;
    this.billingCustomers = [];
    this.billingWorksites = [];
    this.worksiteDocuments = [];
    this.worksiteProofs = [];
    this.worksiteSignatures = [];
    this.worksiteAssignees = [];
    this.selectedWorksiteCoordinationId = null;
    this.selectedCoordinationStatusFilter = "all";
    this.selectedCoordinationAssigneeFilter = "all";
    this.selectedWorksiteDocumentFilterId = "all";
    this.selectedWorksiteDocumentTypeFilter = "all";
    this.selectedWorksiteDocumentLifecycleFilter = "all";
    this.selectedWorksiteDocumentDetailId = null;
    this.worksiteDocumentDownloadBusyId = null;
    this.worksiteDocumentPdfBusyId = null;
    this.worksiteCoordinationBusyId = null;
    this.worksiteDocumentCoordinationBusyId = null;
    this.worksiteDocumentStatusBusyId = null;
    this.worksiteDocumentProofBusyId = null;
    this.worksiteDocumentSignatureBusyId = null;
    this.worksitePreventionPlanPdfBusyId = null;
    this.worksitePreventionPlanEditingId = null;
    this.worksiteCoordinationDrafts = {};
    this.worksiteDocumentCoordinationDrafts = {};
    this.quotes = [];
    this.invoices = [];
    this.buildingSafetyItems = [];
    this.buildingSafetyAlerts = [];
    this.duerpEntries = [];
    this.regulatoryEvidences = [];
    this.billingDraftsHydratedScope = null;
    this.refreshBillingDraftSnapshots();
  }

  private clearWorkspaceSegmentIssue(label: string): void {
    if (!(label in this.workspaceSegmentIssues)) {
      return;
    }

    const remainingIssues = { ...this.workspaceSegmentIssues };
    delete remainingIssues[label];
    this.workspaceSegmentIssues = remainingIssues;
  }

  private setWorkspaceSegmentIssue(label: string, message: string | null): void {
    if (!message) {
      this.clearWorkspaceSegmentIssue(label);
      return;
    }

    this.workspaceSegmentIssues = {
      ...this.workspaceSegmentIssues,
      [label]: message,
    };
  }

  private toWorkspaceSegmentIssueMessage(label: string, error: unknown): string | null {
    if (
      label !== "building-safety-alerts"
      && label !== "duerp-entries"
      && label !== "regulatory-evidences"
    ) {
      return null;
    }

    if (error instanceof ApiClientError) {
      if (error.status === 408 || error.status === 0 || (error.status !== null && error.status >= 500)) {
        return "Les données réglementaires mettent plus de temps à remonter. Le reste du cockpit reste disponible.";
      }
      return error.detail;
    }

    return "Les données réglementaires mettent plus de temps à remonter. Le reste du cockpit reste disponible.";
  }

  private async ensureAccessibleWorkspaceRoute(): Promise<void> {
    const currentPath = this.router.url.split("#")[0] || "/app/home";
    const nextPath =
      currentPath === "/" || !currentPath.startsWith("/app/")
        ? "/app/home"
        : currentPath.startsWith("/app/reglementation") && !this.isReglementationEnabled
          ? "/app/home"
          : currentPath.startsWith("/app/facturation") && !this.isFacturationEnabled
            ? "/app/home"
            : currentPath.startsWith("/app/chantier") && !this.isChantierEnabled
              ? "/app/home"
              : currentPath;

    if (nextPath !== currentPath) {
      await this.router.navigateByUrl(nextPath);
    }
  }

  private isLoginRoutePath(path: string): boolean {
    return !path.startsWith("/app/");
  }

  private isShellRoutePath(path: string): boolean {
    return path.startsWith("/app/");
  }

  private clearAuthenticatedState(clearStoredSession: boolean = true, reason = "app state reset"): void {
    if (clearStoredSession) {
      clearSession(reason);
    }

    this.clearScheduledWorkspaceRefresh();
    this.workspaceHydratedOrganizationId = null;
    this.workspaceSegmentIssues = {};
    this.accessToken = null;
    this.selectedOrganizationId = null;
    this.session = null;
    this.loading = false;
    this.organizationWorkspaceLoading = false;
    this.sessionRestoreInProgress = false;
    this.resetBetaFeedback();
    this.regulatoryExporting = false;
    this.cockpitSummary = null;
    this.organizationProfile = null;
    this.organizationSites = [];
    this.regulatoryProfile = null;
    this.selectedObligationId = null;
    this.billingCustomers = [];
    this.billingWorksites = [];
    this.worksiteDocuments = [];
    this.worksiteProofs = [];
    this.worksiteSignatures = [];
    this.worksiteAssignees = [];
    this.selectedWorksiteCoordinationId = null;
    this.selectedCoordinationStatusFilter = "all";
    this.selectedCoordinationAssigneeFilter = "all";
    this.selectedWorksiteDocumentFilterId = "all";
    this.selectedWorksiteDocumentTypeFilter = "all";
    this.selectedWorksiteDocumentLifecycleFilter = "all";
    this.selectedWorksiteDocumentDetailId = null;
    this.worksiteDocumentDownloadBusyId = null;
    this.worksiteDocumentPdfBusyId = null;
    this.worksiteCoordinationBusyId = null;
    this.worksiteDocumentCoordinationBusyId = null;
    this.worksiteDocumentStatusBusyId = null;
    this.worksiteDocumentProofBusyId = null;
    this.worksiteDocumentSignatureBusyId = null;
    this.worksitePreventionPlanPdfBusyId = null;
    this.worksitePreventionPlanEditingId = null;
    this.worksiteCoordinationDrafts = {};
    this.worksiteDocumentCoordinationDrafts = {};
    this.quotes = [];
    this.invoices = [];
    this.quoteEditingId = null;
    this.quoteEditingSaving = false;
    this.quoteStatusBusyId = null;
    this.quoteFollowUpBusyId = null;
    this.quoteWorksiteBusyId = null;
    this.quoteDuplicateBusyId = null;
    this.quotePdfBusyId = null;
    this.quoteHistoryBusyId = null;
    this.quoteHistoryOpenId = null;
    this.quoteHistoryById = {};
    this.invoiceEditingId = null;
    this.invoiceEditingSaving = false;
    this.invoiceStatusBusyId = null;
    this.invoiceFollowUpBusyId = null;
    this.invoicePaymentBusyId = null;
    this.invoicePaymentId = null;
    this.invoiceWorksiteBusyId = null;
    this.invoicePdfBusyId = null;
    this.invoiceHistoryBusyId = null;
    this.invoiceHistoryOpenId = null;
    this.invoiceHistoryById = {};
    this.buildingSafetyItems = [];
    this.buildingSafetyAlerts = [];
    this.duerpEntries = [];
    this.regulatoryEvidences = [];
    this.buildingSafetyEditingId = null;
    this.duerpEditingId = null;
    this.selectedSafetySiteId = "all";
    this.errorMessage = "";
    this.feedbackMessage = "";
    this.resetCustomerForm();
    this.resetQuoteForm();
    this.resetInvoiceForm();
    this.resetWorksitePreventionPlanForm();
    this.resetInvoicePaymentForm();
    this.resetBuildingSafetyForm();
    this.resetDuerpForm();
    this.resetRegulatoryEvidenceForm();
    this.billingDraftsHydratedScope = null;
    this.refreshBillingDraftSnapshots();
  }

  private isModuleDataPending(moduleCode: ModuleCode): boolean {
    return this.activeSessionModules.includes(moduleCode) && !this.isWorkspaceHydratedForCurrentOrganization;
  }

  private buildBetaFeedbackPayload(): string {
    const organizationName = this.currentMembership?.organization.name ?? "Organisation à préciser";
    const authorLabel =
      this.session?.user.display_name
      || this.session?.user.email
      || "Utilisateur à préciser";
    const capturedAt = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    return [
      "Retour beta Conforméo",
      `Organisation : ${organizationName}`,
      `Auteur : ${authorLabel}`,
      `Date : ${capturedAt}`,
      `Type : ${this.getBetaFeedbackCategoryLabel(this.betaFeedbackCategory)}`,
      `Zone : ${this.getBetaFeedbackAreaLabel(this.betaFeedbackArea)}`,
      "",
      "Message :",
      this.betaFeedbackMessageText.trim(),
    ].join("\n");
  }

  private async copyTextToClipboard(value: string): Promise<void> {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(value);
      return;
    }

    const documentRef = globalThis.document;
    if (!documentRef) {
      throw new Error("clipboard_unavailable");
    }

    const textarea = documentRef.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    documentRef.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = documentRef.execCommand("copy");
    documentRef.body.removeChild(textarea);

    if (!success) {
      throw new Error("clipboard_unavailable");
    }
  }

  private toErrorMessage(error: unknown, context: UserErrorContext = "generic"): string {
    if (error instanceof ApiClientError) {
      return this.toApiClientErrorMessage(error, context);
    }

    if (error instanceof Error) {
      if (this.isLikelyNetworkErrorMessage(error.message)) {
        return this.getNetworkErrorMessage(context);
      }
      if (this.isUserFacingErrorMessage(error.message)) {
        return error.message;
      }
    }

    return this.getDefaultErrorMessage(context);
  }

  private toApiClientErrorMessage(error: ApiClientError, context: UserErrorContext): string {
    const detail = error.detail.trim();
    const normalizedDetail = detail.toLowerCase();

    if (normalizedDetail.includes("not authenticated") || normalizedDetail.includes("invalid token")) {
      return "Votre session a expiré. Reconnectez-vous pour continuer.";
    }

    if (
      normalizedDetail.includes("invalid credentials")
      || normalizedDetail.includes("incorrect email")
      || normalizedDetail.includes("incorrect password")
    ) {
      return "Connexion refusée. Vérifiez votre email et votre mot de passe.";
    }

    if (
      normalizedDetail.includes("module")
      && (normalizedDetail.includes("disabled") || normalizedDetail.includes("not enabled"))
    ) {
      return "Ce module n'est pas activé pour cette organisation.";
    }

    switch (error.status) {
      case 400:
      case 409:
      case 422:
        return this.isUserFacingErrorMessage(detail)
          ? detail
          : this.getValidationErrorMessage(context);
      case 401:
        return context === "auth"
          ? "Connexion refusée. Vérifiez votre email et votre mot de passe."
          : "Votre session a expiré. Reconnectez-vous pour continuer.";
      case 403:
        return "Vous n'avez pas accès à cette action pour le moment.";
      case 404:
        return context === "load"
          ? "Les données demandées ne sont plus disponibles. Rechargez l'espace puis réessayez."
          : "L'élément demandé est introuvable ou n'est plus disponible.";
      default:
        if (typeof error.status === "number" && error.status >= 500) {
          return this.getTemporaryUnavailableMessage(context);
        }
        return this.isUserFacingErrorMessage(detail)
          ? detail
          : this.getDefaultErrorMessage(context);
    }
  }

  private isLikelyNetworkErrorMessage(message: string): boolean {
    const normalized = message.toLowerCase();
    return (
      normalized.includes("failed to fetch")
      || normalized.includes("networkerror")
      || normalized.includes("load failed")
      || normalized.includes("network request failed")
      || normalized.includes("fetch failed")
    );
  }

  private isUserFacingErrorMessage(message: string): boolean {
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > 220) {
      return false;
    }

    return ![
      "traceback",
      "sqlalchemy",
      "asyncpg",
      "internal server error",
      "exception",
      "stack",
      "syntaxerror",
      "typeerror",
      "referenceerror",
      "constraint",
      "violates",
      "enum",
      "uuid",
      "failed to fetch",
      "networkerror",
      "fetch failed",
    ].some((token) => trimmed.toLowerCase().includes(token));
  }

  private getDefaultErrorMessage(context: UserErrorContext): string {
    switch (context) {
      case "auth":
        return "Connexion impossible pour le moment. Réessayez dans un instant.";
      case "load":
        return "Les données n'ont pas pu être chargées pour le moment. Réessayez dans un instant.";
      case "save":
        return "L'enregistrement n'a pas pu être confirmé. Réessayez dans un instant.";
      case "update":
        return "La mise à jour n'a pas pu être enregistrée. Réessayez dans un instant.";
      case "export":
        return "Le document n'a pas pu être préparé pour le moment. Réessayez dans un instant.";
      default:
        return "Une erreur est survenue. Réessayez dans un instant.";
    }
  }

  private getValidationErrorMessage(context: UserErrorContext): string {
    switch (context) {
      case "save":
      case "update":
        return "Vérifiez les informations saisies puis réessayez.";
      case "export":
        return "Le document n'a pas pu être préparé avec ces informations. Vérifiez les champs puis réessayez.";
      case "auth":
        return "Connexion refusée. Vérifiez vos identifiants puis réessayez.";
      default:
        return "Vérifiez les informations puis réessayez.";
    }
  }

  private getNetworkErrorMessage(context: UserErrorContext): string {
    switch (context) {
      case "load":
        return "Impossible de charger les données pour le moment. Vérifiez la connexion puis réessayez.";
      case "save":
      case "update":
        return "La connexion a été interrompue. Vérifiez le réseau puis réessayez.";
      case "export":
        return "Le téléchargement n'a pas abouti. Vérifiez la connexion puis réessayez.";
      case "auth":
        return "Connexion impossible pour le moment. Vérifiez la connexion puis réessayez.";
      default:
        return "Connexion impossible pour le moment. Vérifiez le réseau puis réessayez.";
    }
  }

  private getTemporaryUnavailableMessage(context: UserErrorContext): string {
    switch (context) {
      case "load":
        return "Les données ne sont pas disponibles pour le moment. Réessayez dans un instant.";
      case "save":
      case "update":
        return "L'action n'a pas pu être enregistrée pour le moment. Réessayez dans un instant.";
      case "export":
        return "Le document n'a pas pu être généré pour le moment. Réessayez dans un instant.";
      case "auth":
        return "Le service de connexion est temporairement indisponible. Réessayez dans un instant.";
      default:
        return "Le service est temporairement indisponible. Réessayez dans un instant.";
    }
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  }

  private getTodayDateValue(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private createEmptyQuoteForm(): QuoteDraftForm {
    return {
      customerId: this.billingCustomers[0]?.id ?? "",
      worksiteId: "",
      title: "",
      issueDate: this.getTodayDateValue(),
      validUntil: "",
      status: "draft",
      notes: "",
      lines: [this.createEmptyBillingLineForm()],
    };
  }

  private createEmptyInvoiceForm(): InvoiceDraftForm {
    return {
      customerId: this.billingCustomers[0]?.id ?? "",
      worksiteId: "",
      title: "",
      issueDate: this.getTodayDateValue(),
      dueDate: "",
      status: "draft",
      notes: "",
      lines: [this.createEmptyBillingLineForm()],
    };
  }

  private createEmptyWorksitePreventionPlanForm(): WorksitePreventionPlanForm {
    return {
      usefulDate: "",
      interventionContext: "",
      vigilancePoints: "",
      measurePoints: "",
      additionalContact: "",
    };
  }

  private buildQuoteFormFromRecord(quote: QuoteRecord): QuoteDraftForm {
    return {
      customerId: this.hasBillingCustomer(quote.customer_id) ? quote.customer_id : this.billingCustomers[0]?.id ?? "",
      worksiteId: this.hasBillingWorksite(quote.worksite_id) ? quote.worksite_id ?? "" : "",
      title: quote.title ?? "",
      issueDate: quote.issue_date,
      validUntil: quote.valid_until ?? "",
      status: quote.status,
      notes: quote.notes ?? "",
      lines: quote.line_items.map((line) => ({
        description: line.description,
        quantity: String(line.quantity),
        unitPrice: (line.unit_price_cents / 100).toFixed(2).replace(".", ","),
      })),
    };
  }

  private buildInvoiceFormFromRecord(invoice: InvoiceRecord): InvoiceDraftForm {
    return {
      customerId: this.hasBillingCustomer(invoice.customer_id) ? invoice.customer_id : this.billingCustomers[0]?.id ?? "",
      worksiteId: this.hasBillingWorksite(invoice.worksite_id) ? invoice.worksite_id ?? "" : "",
      title: invoice.title ?? "",
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date ?? "",
      status: invoice.status === "draft" ? "draft" : "issued",
      notes: invoice.notes ?? "",
      lines: invoice.line_items.map((line) => ({
        description: line.description,
        quantity: String(line.quantity),
        unitPrice: (line.unit_price_cents / 100).toFixed(2).replace(".", ","),
      })),
    };
  }

  private createEmptyBillingLineForm(): BillingLineForm {
    return {
      description: "",
      quantity: "1",
      unitPrice: "",
    };
  }

  private parseBillingQuantity(value: string): number | null {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private parseUnitPriceToCents(value: string): number | null {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return Math.round(parsed * 100);
  }

  private hasValidBillingLines(lines: BillingLineForm[]): boolean {
    return lines.some((line) => {
      return Boolean(
        line.description.trim()
        && this.parseBillingQuantity(line.quantity) !== null
        && this.parseUnitPriceToCents(line.unitPrice) !== null
      );
    });
  }

  private computeBillingFormTotalCents(lines: BillingLineForm[]): number {
    return lines.reduce((total, line) => {
      const quantity = this.parseBillingQuantity(line.quantity);
      const unitPriceCents = this.parseUnitPriceToCents(line.unitPrice);
      if (!line.description.trim() || quantity === null || unitPriceCents === null) {
        return total;
      }
      return total + Math.round(quantity * unitPriceCents);
    }, 0);
  }

  private buildBillingLineItemsPayload(lines: BillingLineForm[]): BillingLineItemInput[] {
    const payload = lines
      .map((line) => {
        const quantity = this.parseBillingQuantity(line.quantity);
        const unitPriceCents = this.parseUnitPriceToCents(line.unitPrice);
        if (!line.description.trim() || quantity === null || unitPriceCents === null) {
          return null;
        }
        return {
          description: line.description.trim(),
          quantity,
          unit_price_cents: unitPriceCents,
        };
      })
      .filter((line): line is BillingLineItemInput => line !== null);

    if (payload.length === 0) {
      throw new Error("Ajoutez au moins une ligne valide.");
    }
    return payload;
  }

  private resetCustomerForm(): void {
    this.customerForm = {
      name: "",
      customerType: "company",
      email: "",
      phone: "",
      address: "",
      notes: ""
    };
  }

  private resetQuoteForm(): void {
    this.quoteForm = this.createEmptyQuoteForm();
  }

  private resetInvoiceForm(): void {
    this.invoiceForm = this.createEmptyInvoiceForm();
  }

  private resetWorksitePreventionPlanForm(): void {
    this.worksitePreventionPlanForm = this.createEmptyWorksitePreventionPlanForm();
    this.worksitePreventionPlanInitialForm = null;
  }

  private resetInvoicePaymentForm(): void {
    this.invoicePaymentForm = {
      paidAmount: "",
      paidAt: this.getTodayDateValue()
    };
  }

  private resetDuerpForm(): void {
    this.duerpForm = {
      siteId: this.selectedSafetySiteId !== "all" ? this.selectedSafetySiteId : "",
      workUnitName: "",
      riskLabel: "",
      severity: "medium",
      preventionAction: ""
    };
  }

  private resetBuildingSafetyForm(): void {
    this.buildingSafetyForm = {
      siteId: this.selectedSafetySiteId !== "all"
        ? this.selectedSafetySiteId
        : this.activeOrganizationSites[0]?.id ?? "",
      itemType: "fire_extinguisher",
      name: "",
      nextDueDate: "",
      lastCheckedAt: "",
      status: "active",
      notes: ""
    };
  }

  private resetRegulatoryEvidenceForm(): void {
    this.regulatoryEvidenceForm = {
      linkKind: "obligation",
      obligationId: this.regulatoryProfile?.applicable_obligations[0]?.id ?? "",
      siteId: this.selectedSafetySiteId !== "all" ? this.selectedSafetySiteId : "",
      buildingSafetyItemId: "",
      duerpEntryId: "",
      fileName: "",
      documentType: "attestation",
      notes: ""
    };
  }
}
