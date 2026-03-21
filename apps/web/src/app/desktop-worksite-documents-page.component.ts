import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  CfmButtonComponent,
  CfmCardComponent,
  CfmEmptyStateComponent,
  CfmStatusChipComponent,
} from "@conformeo/ui";

import { DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT } from "./desktop-worksite-documents-page-context";

@Component({
  selector: "cfm-desktop-worksite-documents-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CfmButtonComponent,
    CfmCardComponent,
    CfmEmptyStateComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <cfm-card
      *ngIf="ctx.shouldShowWorkspaceContent && ctx.currentMembership"
      class="desktop-card"
      eyebrow="Documents chantier"
      title="Documents chantier"
      description="Une vue dédiée pour retrouver, télécharger et relire plus facilement les documents déjà générés."
    >
      <section class="dashboard-actions" id="worksite-documents-section">
        <div class="dashboard-actions-header">
          <div class="dashboard-action-copy">
            <h3>Documents liés aux chantiers</h3>
            <p class="small">
              Filtrez par chantier, type, statut et suivi pour retrouver le bon document plus vite.
            </p>
          </div>

          <cfm-status-chip
            [label]="ctx.worksiteDocumentCountLabel"
            [tone]="ctx.filteredWorksiteDocumentItems.length > 0 ? 'calm' : 'neutral'"
          />
        </div>

        <ng-container *ngIf="ctx.isChantierEnabled; else standaloneDocumentsDisabled">
          <div class="inline-actions">
            <label class="compact-field" *ngIf="ctx.worksiteDocumentFilterOptions.length > 1">
              <span class="small">Chantier</span>
              <select [(ngModel)]="ctx.selectedWorksiteDocumentFilterId" name="standaloneWorksiteDocumentFilterId">
                <option value="all">Tous les chantiers</option>
                <option *ngFor="let worksite of ctx.worksiteDocumentFilterOptions" [value]="worksite.id">
                  {{ worksite.name }}
                </option>
              </select>
            </label>

            <label class="compact-field" *ngIf="ctx.worksiteDocumentTypeFilterOptions.length > 1">
              <span class="small">Type</span>
              <select [(ngModel)]="ctx.selectedWorksiteDocumentTypeFilter" name="standaloneWorksiteDocumentTypeFilter">
                <option value="all">Tous les types</option>
                <option *ngFor="let option of ctx.worksiteDocumentTypeFilterOptions" [value]="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="compact-field">
              <span class="small">Statut</span>
              <select
                [(ngModel)]="ctx.selectedWorksiteDocumentLifecycleFilter"
                name="standaloneWorksiteDocumentLifecycleFilter"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="finalized">Finalisé</option>
              </select>
            </label>

            <label class="compact-field">
              <span class="small">Suivi</span>
              <select [(ngModel)]="ctx.selectedCoordinationStatusFilter" name="standaloneWorksiteDocumentCoordinationStatusFilter">
                <option value="all">Tous les suivis</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Fait</option>
              </select>
            </label>

            <label class="compact-field">
              <span class="small">Affectation</span>
              <select [(ngModel)]="ctx.selectedCoordinationAssigneeFilter" name="standaloneWorksiteDocumentAssigneeFilter">
                <option value="all">Toutes les affectations</option>
                <option value="unassigned">Non affecté</option>
                <option *ngFor="let assignee of ctx.worksiteAssignees" [value]="assignee.user_id">
                  {{ ctx.getWorksiteAssigneeOptionLabel(assignee) }}
                </option>
              </select>
            </label>

            <cfm-button
              *ngIf="ctx.hasActiveWorksiteDocumentFilters"
              type="button"
              variant="secondary"
              (click)="ctx.resetWorksiteDocumentFilters()"
            >
              Réinitialiser les filtres
            </cfm-button>
          </div>

          <ul class="stack-list" *ngIf="ctx.filteredWorksiteDocumentItems.length > 0; else emptyStandaloneWorksiteDocuments">
            <li *ngFor="let document of ctx.filteredWorksiteDocumentItems">
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
                  *ngIf="ctx.canReadOrganization"
                  type="button"
                  variant="secondary"
                  [disabled]="ctx.isWorksiteDocumentDownloadBusy(document)"
                  (click)="ctx.downloadWorksiteDocument(document)"
                >
                  {{
                    ctx.isWorksiteDocumentDownloadBusy(document)
                      ? "Téléchargement en cours"
                      : ctx.getWorksiteDocumentActionLabel(document)
                  }}
                </cfm-button>

                <cfm-button
                  *ngIf="ctx.canAdjustWorksiteDocument(document)"
                  type="button"
                  variant="secondary"
                  [disabled]="ctx.worksitePreventionPlanPdfBusyId === document.worksiteId"
                  (click)="ctx.toggleWorksitePreventionPlanEditor(document.worksiteId)"
                >
                  {{
                    ctx.worksitePreventionPlanEditingId === document.worksiteId
                      ? "Fermer l'ajustement"
                      : "Ajuster le plan"
                  }}
                </cfm-button>

                <cfm-button
                  type="button"
                  variant="secondary"
                  (click)="ctx.toggleWorksiteDocumentDetails(document.id)"
                >
                  {{
                    ctx.selectedWorksiteDocumentDetailId === document.id
                      ? "Masquer les éléments liés"
                      : "Voir les éléments liés"
                  }}
                </cfm-button>
              </div>

              <section
                class="document-linked-panel"
                *ngIf="ctx.selectedWorksiteDocumentDetailId === document.id"
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

                <div class="detail-block" *ngIf="document.linkedSignature as signature; else noStandaloneLinkedSignature">
                  <span class="small">Signature liée</span>
                  <strong>{{ signature.label }}</strong>
                  <span *ngIf="signature.detail">{{ signature.detail }}</span>
                  <cfm-status-chip [label]="signature.statusLabel" [tone]="signature.statusTone" />
                </div>

                <ng-template #noStandaloneLinkedSignature>
                  <div class="detail-block">
                    <span class="small">Signature liée</span>
                    <span>Aucune signature liée.</span>
                  </div>
                </ng-template>

                <div class="detail-block">
                  <span class="small">Preuves liées</span>
                  <ul class="detail-list" *ngIf="document.linkedProofs.length > 0; else noStandaloneLinkedProofs">
                    <li *ngFor="let proof of document.linkedProofs">
                      <strong>{{ proof.label }}</strong>
                      <span *ngIf="proof.detail">{{ proof.detail }}</span>
                      <cfm-status-chip [label]="proof.statusLabel" [tone]="proof.statusTone" />
                    </li>
                  </ul>
                  <ng-template #noStandaloneLinkedProofs>
                    <span>Aucune preuve liée.</span>
                  </ng-template>
                </div>
              </section>
            </li>
          </ul>

          <ng-template #emptyStandaloneWorksiteDocuments>
            <cfm-empty-state
              title="Aucun document pour ce filtre"
              description="Ajustez les filtres ou générez un document chantier pour le retrouver ici."
            />
          </ng-template>
        </ng-container>

        <ng-template #standaloneDocumentsDisabled>
          <cfm-empty-state
            title="Module Chantier non activé"
            description="Activez le module Chantier pour afficher les documents chantier dans cette vue."
          />
        </ng-template>
      </section>
    </cfm-card>
  `,
})
export class DesktopWorksiteDocumentsPageComponent {
  readonly ctx = inject(DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT);
}
