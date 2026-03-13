import { CommonModule } from "@angular/common";
import { Component, DoCheck } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type {
  ApplicableRegulatoryObligationRecord,
  AuditLogRecord,
  AuthSession,
  BillingFollowUpStatus,
  BillingCustomerRecord,
  BillingCustomerType,
  BillingLineItemInput,
  BuildingSafetyAlertRecord,
  BuildingSafetyItemRecord,
  BuildingSafetyItemStatus,
  BuildingSafetyItemType,
  ComplianceStatus,
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
import {
  createBillingCustomer,
  createBuildingSafetyItem,
  createDuerpEntry,
  createInvoice,
  createOrganizationSite,
  createQuote,
  createRegulatoryEvidence,
  duplicateQuoteToInvoice,
  downloadInvoicePdf,
  downloadQuotePdf,
  downloadRegulatoryExportPdf,
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
  updateQuoteWorksiteLink
} from "./organization-client";

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
type BillingDraftRecord<TPayload> = {
  updatedAt: string;
  payload: TPayload;
};

@Component({
  selector: "cfm-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CfmButtonComponent,
    CfmCardComponent,
    CfmEmptyStateComponent,
    CfmInputComponent,
    CfmStatusChipComponent
  ],
  template: `
    <main class="shell" [class.shell-workspace]="session">
      <cfm-card
        *ngIf="!session; else workspaceTemplate"
        class="desktop-card"
        eyebrow="Conformeo Desktop"
        title="Connexion"
        description="Accédez à l’espace bureau pour initialiser l’entreprise, préparer le périmètre réglementaire et gérer les premiers sites."
      >
        <form class="auth-form" (ngSubmit)="submitLogin()">
          <cfm-input
            [(ngModel)]="email"
            name="email"
            type="email"
            autocomplete="username"
            label="Email"
            placeholder="prenom.nom@entreprise.fr"
            required
          />

          <cfm-input
            [(ngModel)]="password"
            name="password"
            type="password"
            autocomplete="current-password"
            label="Mot de passe"
            placeholder="Mot de passe"
            required
          />

          <cfm-button type="submit" [disabled]="loading" [block]="true">
            {{ loading ? "Connexion..." : "Se connecter" }}
          </cfm-button>
        </form>

        <p class="feedback error" *ngIf="errorMessage">{{ errorMessage }}</p>
      </cfm-card>

      <ng-template #workspaceTemplate>
        <section class="workspace">
          <cfm-card
            class="desktop-card"
            eyebrow="Conformeo Desktop"
            title="Administration et fondation Réglementation"
            description="Un socle bureau progressif : contexte multi-organisation, activation des modules et premières informations utiles au périmètre réglementaire."
          >
            <div class="session-header" *ngIf="currentMembership as membership">
              <div>
                <p class="meta">Connecté en tant que {{ session?.user?.display_name }}</p>
                <h2>{{ membership.organization.name }}</h2>
                <p class="small">
                  Rôle actuel : <strong>{{ membership.membership.role_code }}</strong>
                </p>
              </div>

              <div class="session-actions">
                <label class="organization-switch" *ngIf="session && session.memberships.length > 1">
                  <span>Organisation</span>
                  <select [(ngModel)]="selectedOrganizationId" name="organizationId" (change)="changeOrganization()">
                    <option *ngFor="let item of session.memberships" [value]="item.organization.id">
                      {{ item.organization.name }}
                    </option>
                  </select>
                </label>

                <cfm-button type="button" variant="secondary" (click)="logout()">
                  Se déconnecter
                </cfm-button>
              </div>
            </div>

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

          <cfm-card
            *ngIf="organizationWorkspaceLoading"
            class="desktop-card"
            eyebrow="Réglementation"
            title="Chargement en cours"
            description="Le profil entreprise et les sites sont en train d’être chargés."
          />

          <cfm-card
            *ngIf="!organizationWorkspaceLoading && currentMembership && !isReglementationEnabled"
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

          <ng-container *ngIf="!organizationWorkspaceLoading && currentMembership && isReglementationEnabled">
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
                    {{ organizationProfileSaving ? "Initialisation..." : "Initialiser l’entreprise" }}
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
                    {{ organizationProfileSaving ? "Enregistrement..." : "Enregistrer le profil" }}
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
                    {{ organizationProfileSaving ? "Enregistrement..." : "Enregistrer le questionnaire" }}
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
                    {{ organizationSiteSaving ? "Création..." : "Ajouter le site" }}
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
                        ? "Mise à jour..."
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
                <p class="small">Aucune alerte simple détectée pour le filtre actuel.</p>
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
                        ? (isBuildingSafetyEditing ? "Enregistrement..." : "Ajout...")
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
                          ? "Mise à jour..."
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
                  {{ regulatoryExporting ? "Génération..." : "Exporter le PDF" }}
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
                        ? (duerpEditingId ? "Enregistrement..." : "Ajout...")
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
                          ? "Mise à jour..."
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
                    {{ regulatoryEvidenceSaving ? "Ajout..." : "Ajouter la pièce" }}
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

          <cfm-card
            *ngIf="!organizationWorkspaceLoading && currentMembership && !isFacturationEnabled"
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

          <ng-container *ngIf="!organizationWorkspaceLoading && currentMembership && isFacturationEnabled">
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
                        ? (isCustomerEditing ? "Enregistrement..." : "Ajout...")
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

                  <cfm-button
                    *ngIf="canManageOrganization"
                    type="button"
                    variant="secondary"
                    [disabled]="customerSaving"
                    (click)="startEditingCustomer(customer)"
                  >
                    Modifier
                  </cfm-button>
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
                      {{ quoteSaving ? "Ajout..." : "Créer le devis" }}
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
                      {{ quoteDuplicateBusyId === quote.id ? "Création..." : "Créer une facture" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quotePdfBusyId === quote.id"
                      (click)="exportQuotePdf(quote)"
                    >
                      {{ quotePdfBusyId === quote.id ? "Génération..." : "Exporter le PDF" }}
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
                          ? "Chargement..."
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
                        {{ quoteEditingSaving ? "Enregistrement..." : "Enregistrer les modifications" }}
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
                      {{ invoiceSaving ? "Ajout..." : "Créer la facture" }}
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
                      {{ invoicePdfBusyId === invoice.id ? "Génération..." : "Exporter le PDF" }}
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
                          ? "Chargement..."
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
                          {{ invoicePaymentBusyId === invoice.id ? "Enregistrement..." : "Valider le paiement" }}
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
                        {{ invoiceEditingSaving ? "Enregistrement..." : "Enregistrer les modifications" }}
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

          <p class="feedback error" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="feedback success" *ngIf="feedbackMessage && !errorMessage">{{ feedbackMessage }}</p>
        </section>
      </ng-template>
    </main>
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
      }

      .shell-workspace {
        place-items: start center;
        background:
          radial-gradient(circle at top left, rgba(201, 224, 215, 0.5), transparent 28%),
          linear-gradient(180deg, #f6f3eb 0%, #edf4f2 100%);
      }

      .workspace {
        width: min(1100px, 100%);
        display: grid;
        gap: 1.25rem;
      }

      .desktop-card {
        width: min(1100px, 100%);
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
        background: var(--cfm-color-surface);
        color: var(--cfm-color-ink);
      }

      textarea {
        resize: vertical;
        min-height: 6.5rem;
      }

      .session-header {
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
        align-items: start;
      }

      .session-actions {
        gap: 1rem;
        justify-items: end;
      }

      .meta,
      .small {
        margin-top: 0.45rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      article {
        padding: 1.25rem;
        border-radius: 20px;
        background: #f4f1ea;
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
        padding: 1rem 1.1rem;
        border-radius: 18px;
        background: #f4f6f1;
      }

      .obligation-detail {
        display: grid;
        gap: 1rem;
        margin-top: 1.25rem;
        padding: 1.1rem 1.2rem;
        border-radius: 20px;
        background: #eef3ef;
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
        padding: 1rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.55);
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
        padding: 1.5rem;
        border-radius: 24px;
        background: #eff4f5;
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
        padding: 1rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.55);
      }

      .form-actions {
        display: flex;
        align-items: end;
      }

      .inline-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .billing-item-actions {
        display: grid;
        gap: 0.75rem;
        justify-items: stretch;
        min-width: min(260px, 100%);
      }

      .compact-field {
        min-width: 180px;
      }

      .payment-form {
        display: grid;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.55);
      }

      .billing-history {
        display: grid;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.55);
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

      .feedback.error {
        color: #8a2d2d;
      }

      .feedback.success {
        color: #1f6a47;
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
        .billing-line-editor,
        .detail-grid {
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
export class AppComponent implements DoCheck {
  email = "";
  password = "";
  loading = false;
  errorMessage = "";
  feedbackMessage = "";
  session: AuthSession | null = null;
  accessToken = getStoredAccessToken();
  selectedOrganizationId = getStoredOrganizationId();
  organizationWorkspaceLoading = false;
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

  constructor() {
    if (this.accessToken) {
      void this.refreshSession(this.selectedOrganizationId);
    }
  }

  ngDoCheck(): void {
    this.persistBillingDraftsIfNeeded();
  }

  get currentMembership(): MembershipAccess | null {
    return this.session?.current_membership ?? null;
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

  get isReglementationEnabled(): boolean {
    return this.currentMembership?.enabled_modules.includes("reglementation") ?? false;
  }

  get isFacturationEnabled(): boolean {
    return this.currentMembership?.enabled_modules.includes("facturation") ?? false;
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

  async submitLogin(): Promise<void> {
    this.loading = true;
    this.errorMessage = "";
    this.feedbackMessage = "";

    try {
      const response = await login({
        email: this.email,
        password: this.password
      });
      this.accessToken = response.access_token;
      this.session = response.session;
      this.selectedOrganizationId = response.session.current_membership.organization.id;
      persistSession(response.access_token, response.session);
      await this.refreshOrganizationWorkspace();
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error);
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
    await this.refreshSession(this.selectedOrganizationId);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
    } finally {
      this.quoteSaving = false;
    }
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
      this.errorMessage = this.toErrorMessage(error);
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
    this.feedbackMessage = "";
    try {
      const { blob, fileName } = await downloadQuotePdf(this.accessToken, this.selectedOrganizationId, quote.id);
      this.downloadBlob(blob, fileName);
      this.feedbackMessage = "PDF devis généré.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
    this.feedbackMessage = "";
    try {
      const { blob, fileName } = await downloadInvoicePdf(this.accessToken, this.selectedOrganizationId, invoice.id);
      this.downloadBlob(blob, fileName);
      this.feedbackMessage = "PDF facture généré.";
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
    this.feedbackMessage = "";
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
      this.errorMessage = this.toErrorMessage(error);
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
      this.errorMessage = this.toErrorMessage(error);
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
    clearSession();
    this.accessToken = null;
    this.selectedOrganizationId = null;
    this.session = null;
    this.regulatoryExporting = false;
    this.organizationProfile = null;
    this.organizationSites = [];
    this.regulatoryProfile = null;
    this.selectedObligationId = null;
    this.billingCustomers = [];
    this.billingWorksites = [];
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
    this.resetInvoicePaymentForm();
    this.resetBuildingSafetyForm();
    this.resetDuerpForm();
    this.resetRegulatoryEvidenceForm();
    this.billingDraftsHydratedScope = null;
    this.refreshBillingDraftSnapshots();
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
        return "Archivée";
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

    this.loading = true;
    this.errorMessage = "";
    try {
      const session = await fetchSession(this.accessToken, organizationId);
      this.session = session;
      this.selectedOrganizationId = session.current_membership.organization.id;
      persistSession(this.accessToken, session);
      await this.refreshOrganizationWorkspace();
    } catch (error) {
      this.logout();
      this.errorMessage = this.toErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  private async refreshOrganizationWorkspace(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId) {
      this.organizationProfile = null;
      this.organizationSites = [];
      this.regulatoryProfile = null;
      this.billingCustomers = [];
      this.billingWorksites = [];
      this.quotes = [];
      this.invoices = [];
      this.buildingSafetyItems = [];
      this.buildingSafetyAlerts = [];
      this.duerpEntries = [];
      this.regulatoryEvidences = [];
      this.billingDraftsHydratedScope = null;
      this.refreshBillingDraftSnapshots();
      return;
    }

    this.organizationWorkspaceLoading = true;
    try {
      const billingEnabled = this.isFacturationEnabled;
      const billingCustomersPromise = billingEnabled
        ? listBillingCustomers(this.accessToken, this.selectedOrganizationId)
        : Promise.resolve([] as BillingCustomerRecord[]);
      const billingWorksitesPromise = billingEnabled
        ? listWorksites(this.accessToken, this.selectedOrganizationId)
        : Promise.resolve([] as WorksiteApiSummary[]);
      const quotesPromise = billingEnabled
        ? listQuotes(this.accessToken, this.selectedOrganizationId)
        : Promise.resolve([] as QuoteRecord[]);
      const invoicesPromise = billingEnabled
        ? listInvoices(this.accessToken, this.selectedOrganizationId)
        : Promise.resolve([] as InvoiceRecord[]);

      const [profile, sites, regulatoryProfile, customers, worksites, quotes, invoices, buildingSafetyItems, buildingSafetyAlerts, duerpEntries, regulatoryEvidences] = await Promise.all([
        fetchOrganizationProfile(this.accessToken, this.selectedOrganizationId),
        listOrganizationSites(this.accessToken, this.selectedOrganizationId),
        fetchOrganizationRegulatoryProfile(this.accessToken, this.selectedOrganizationId),
        billingCustomersPromise,
        billingWorksitesPromise,
        quotesPromise,
        invoicesPromise,
        listBuildingSafetyItems(this.accessToken, this.selectedOrganizationId),
        listBuildingSafetyAlerts(this.accessToken, this.selectedOrganizationId),
        listDuerpEntries(this.accessToken, this.selectedOrganizationId),
        listRegulatoryEvidences(this.accessToken, this.selectedOrganizationId)
      ]);
      this.organizationProfile = profile;
      this.organizationSites = this.sortSites(sites);
      this.regulatoryProfile = regulatoryProfile;
      this.billingCustomers = customers;
      this.billingWorksites = worksites;
      this.quotes = quotes;
      this.invoices = invoices;
      this.quoteEditingId = null;
      this.quoteEditingSaving = false;
      this.quoteFollowUpBusyId = null;
      this.invoiceEditingId = null;
      this.invoiceEditingSaving = false;
      this.invoiceFollowUpBusyId = null;
      this.quoteHistoryOpenId = null;
      this.quoteHistoryById = {};
      this.invoiceHistoryOpenId = null;
      this.invoiceHistoryById = {};
      this.hydrateBillingDraftsIfNeeded(billingEnabled);
      if (
        this.selectedObligationId
        && !regulatoryProfile.applicable_obligations.some((obligation) => obligation.id === this.selectedObligationId)
      ) {
        this.selectedObligationId = null;
      }
      if (!this.selectedObligationId) {
        this.selectedObligationId = regulatoryProfile.applicable_obligations[0]?.id ?? null;
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
      if (
        this.regulatoryEvidenceForm.linkKind === "obligation"
        && this.regulatoryProfile
        && !this.regulatoryProfile.applicable_obligations.some(
          (obligation) => obligation.id === this.regulatoryEvidenceForm.obligationId
        )
      ) {
        this.regulatoryEvidenceForm.obligationId =
          this.regulatoryProfile.applicable_obligations[0]?.id ?? "";
      }
      if (this.regulatoryEvidenceForm.linkKind === "site" && !this.regulatoryEvidenceForm.siteId) {
        this.regulatoryEvidenceForm.siteId = this.selectedSafetySiteId !== "all"
          ? this.selectedSafetySiteId
          : this.activeOrganizationSites[0]?.id ?? "";
      }
      this.applyProfileToForm(profile);
      this.handleSiteFilterChange();
      this.refreshBillingDraftSnapshots();
    } finally {
      this.organizationWorkspaceLoading = false;
    }
  }

  private async refreshRegulatoryProfile(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId) {
      this.regulatoryProfile = null;
      return;
    }

    this.regulatoryProfile = await fetchOrganizationRegulatoryProfile(
      this.accessToken,
      this.selectedOrganizationId
    );
  }

  private async refreshBuildingSafetyState(): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId) {
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

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  private toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
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
