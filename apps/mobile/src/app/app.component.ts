import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type {
  AuthSession,
  MembershipAccess,
  WorksiteEquipment,
  WorksiteEquipmentMovement,
  WorksiteEquipmentMovementType,
  WorksiteEquipmentStatus,
  WorksiteEssentialDetail,
  WorksiteSafetyChecklist,
  WorksiteSafetyChecklistAnswer,
  WorksiteProofSummary,
  WorksiteRiskReport,
  WorksiteRiskSeverity,
  WorksiteRiskType,
  WorksiteVoiceNoteSummary,
  WorksiteSignatureSummary,
  WorksiteSummary
} from "@conformeo/contracts";
import {
  CfmButtonComponent,
  CfmCardComponent,
  CfmEmptyStateComponent,
  CfmInputComponent,
  CfmStatusChipComponent,
  CfmSyncStateComponent
} from "@conformeo/ui";
import {
  IonApp,
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";

import {
  clearSession,
  fetchSession,
  getStoredAccessToken,
  getStoredOrganizationId,
  login,
  persistSession
} from "./auth-client";
import { mobileLocalDatabase } from "./local-database";
import { fetchWorksiteSummaries } from "./worksite-client";
import type {
  LocalDatabaseStatus,
  LocalFileReference,
  LocalRecord,
  PreparedWorksiteSyncBatch,
  PreparedWorksiteSyncItem,
  LocalSyncOperation,
  LocalSyncOperationType
} from "./local-database.types";
import {
  getGlobalSyncStatusCopy,
  getOperationSyncStatusCopy,
  getPreparedWorksiteSyncBatchStatusCopy,
  getPreparedWorksiteSyncItemStatusCopy,
  getRecordSyncStatusCopy,
  getTerrainObjectSyncStatusCopy,
  getWorksiteSyncStatusCopy,
  type SyncStatusCopy
} from "./sync-status";
import {
  QUICK_CAPTURE_PATTERNS,
  type QuickCapturePattern,
  type QuickCapturePatternKey
} from "./quick-capture-pattern";

@Component({
  selector: "cfm-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonApp,
    IonBadge,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CfmButtonComponent,
    CfmCardComponent,
    CfmEmptyStateComponent,
    CfmInputComponent,
    CfmStatusChipComponent,
    CfmSyncStateComponent
  ],
  template: `
    <ion-app>
      <ion-header translucent="true">
        <ion-toolbar>
          <ion-title>Conformeo</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content fullscreen="true">
        <section class="shell">
          <ion-badge color="success">Sprint 1</ion-badge>
          <h1>Chantiers terrain et préparation hors ligne</h1>
          <p>
            Cette surface Ionic garde le socle Sprint 0 en place et ouvre un premier bloc Chantier
            simple sur mobile : voir ses chantiers, ouvrir une fiche essentielle et préparer un chantier
            pour le hors ligne.
          </p>

          <cfm-card
            class="section-card"
            eyebrow="Pattern UX"
            title="Capture rapide terrain"
            description="Un flux court et réutilisable pour photo, note, checklist, signature et signalement, sans dépasser 3 étapes quand ce n’est pas nécessaire."
          >
            <div class="quick-capture-overview">
              <cfm-status-chip label="Flux en 2 à 3 étapes" tone="progress" />
              <cfm-status-chip label="Toujours enregistré sur l’appareil" tone="success" />
            </div>

            <div class="quick-capture-grid">
              <button
                *ngFor="let pattern of quickCapturePatterns"
                type="button"
                class="quick-capture-card"
                [class.is-active]="pattern.key === selectedQuickCaptureKey"
                (click)="selectedQuickCaptureKey = pattern.key"
              >
                <strong>{{ pattern.title }}</strong>
                <span>{{ pattern.summary }}</span>
                <small>{{ pattern.primaryActionLabel }}</small>
              </button>
            </div>

            <div class="quick-capture-detail" *ngIf="selectedQuickCapturePattern as pattern">
              <div class="quick-capture-meta">
                <cfm-status-chip [label]="'Flux en ' + pattern.stepCount + ' étapes'" tone="calm" />
                <cfm-status-chip [label]="pattern.localOutcome" tone="neutral" />
              </div>

              <ol class="quick-capture-steps">
                <li *ngFor="let step of pattern.steps; index as index">
                  <strong>Étape {{ index + 1 }}</strong>
                  <span>{{ step }}</span>
                </li>
              </ol>

              <p class="quick-capture-note">{{ pattern.offlineNote }}</p>
            </div>
          </cfm-card>

          <cfm-card
            class="section-card"
            eyebrow="Base locale mobile"
            title="SQLite prêt pour le terrain"
            description="Le stockage local persistant est initialisé dès l'ouverture de l'application pour préparer les futurs brouillons terrain, références de preuves et données offline-first."
          >

              <div class="sync-overview" *ngIf="globalSyncStatus as syncStatus">
                <cfm-sync-state
                  [label]="syncStatus.label"
                  [detail]="syncStatus.detail"
                  [tone]="syncStatus.tone"
                  [note]="isDeviceOnline ? 'Connexion disponible.' : 'Pas de réseau : vous pouvez continuer, tout reste enregistré sur l’appareil.'"
                />
              </div>

              <div class="database-grid" *ngIf="localDatabaseStatus as status">
                <div class="database-stat">
                  <strong>Moteur</strong>
                  <span>{{ status.storageEngine }}</span>
                </div>
                <div class="database-stat">
                  <strong>Plateforme</strong>
                  <span>{{ status.platform }}</span>
                </div>
                <div class="database-stat">
                  <strong>Schéma</strong>
                  <span>v{{ status.schemaVersion }}</span>
                </div>
                <div class="database-stat">
                  <strong>Enregistrements</strong>
                  <span>{{ status.recordCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>Fichiers référencés</strong>
                  <span>{{ status.fileReferenceCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>Actions locales suivies</strong>
                  <span>{{ status.syncOperationCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>Prêtes à envoyer</strong>
                  <span>{{ status.pendingSyncOperationCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>À vérifier</strong>
                  <span>{{ status.failedSyncOperationCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>Prêtes à relancer</strong>
                  <span>{{ status.retryableSyncOperationCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>Dernière migration</strong>
                  <span>{{ status.lastMigrationAt ? (status.lastMigrationAt | date: "short") : "n/a" }}</span>
                </div>
              </div>

              <form class="draft-form" (ngSubmit)="saveLocalDraft()">
                <cfm-input
                  [(ngModel)]="draftTitle"
                  name="draftTitle"
                  type="text"
                  label="Titre du brouillon local"
                  placeholder="Exemple : relevé terrain hors ligne"
                  required
                />

                <label>
                  <span>Contenu</span>
                  <textarea
                    [(ngModel)]="draftBody"
                    name="draftBody"
                    rows="4"
                    placeholder="Ce brouillon reste dans la base locale de l'app."
                    required
                  ></textarea>
                </label>

                <cfm-button type="submit" [disabled]="localDatabaseBusy" [block]="true">
                  {{ localDatabaseBusy ? "Enregistrement..." : "Enregistrer en local" }}
                </cfm-button>
              </form>

              <div class="module-block" *ngIf="localDrafts.length > 0">
                <strong>Brouillons locaux persistés</strong>
                <ul class="draft-list">
                  <li *ngFor="let draft of localDrafts">
                    <ng-container *ngIf="getDraftSyncStatus(draft) as draftSyncStatus">
                      <div class="draft-heading">
                        <strong>{{ readDraftTitle(draft) }}</strong>
                        <cfm-status-chip
                          class="sync-pill-inline"
                          [label]="draftSyncStatus.label"
                          [tone]="draftSyncStatus.tone"
                        />
                      </div>
                      <span>{{ draft.organizationId ?? "hors organisation" }}</span>
                      <small>{{ draftSyncStatus.detail }}</small>
                      <small>{{ draft.updatedAt | date: "short" }}</small>
                    </ng-container>
                  </li>
                </ul>
              </div>

              <cfm-empty-state
                *ngIf="localDrafts.length === 0"
                title="Aucun brouillon local"
                description="Enregistre un premier brouillon pour valider le stockage local du terrain."
              />

              <div class="photo-section">
                <strong>Capture photo locale</strong>
                <p class="supporting-copy">
                  La photo est enregistrée immédiatement sur l'appareil avec son horodatage. La miniature reste
                  visible sans attendre de réseau ni d'envoi serveur.
                </p>

                <label class="photo-picker">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    [disabled]="photoCaptureBusy"
                    (change)="handlePhotoCapture($event)"
                  />
                  <span>{{ photoCaptureBusy ? "Enregistrement de la photo..." : "Prendre ou choisir une photo" }}</span>
                </label>

                <ul class="photo-list" *ngIf="localPhotos.length > 0">
                  <li *ngFor="let photo of localPhotos">
                    <img class="photo-thumbnail" [src]="photo.localUri" [alt]="photo.fileName" />
                    <div class="photo-meta">
                      <strong>{{ photo.fileName }}</strong>
                      <span>enregistrée sur l'appareil</span>
                      <small>
                        prise {{ (photo.capturedAt ?? photo.createdAt) | date: "short" }}
                      </small>
                      <small *ngIf="photo.sizeBytes !== null">{{ formatFileSize(photo.sizeBytes) }}</small>
                    </div>
                  </li>
                </ul>

                <cfm-empty-state
                  *ngIf="localPhotos.length === 0"
                  title="Aucune photo locale"
                  description="Prends une première photo pour vérifier le stockage local immédiat et la miniature."
                />
              </div>

              <div class="queue-section">
                <strong>Actions locales à synchroniser</strong>
                <p class="supporting-copy">
                  Les actions restent d'abord sur l’appareil. Cette zone aide à comprendre ce qui est prêt,
                  déjà traité ou à vérifier avant le prochain envoi.
                </p>

                <div class="module-block" *ngIf="preparedWorksiteSyncBatch as preparedBatch">
                  <strong>Préparation chantier déjà prête</strong>
                  <div class="worksite-sync-overview">
                    <cfm-sync-state
                      title="Lots terrain prêts localement"
                      [label]="getPreparedWorksiteSyncBatchStatus(preparedBatch).label"
                      [detail]="getPreparedWorksiteSyncBatchStatus(preparedBatch).detail"
                      [tone]="getPreparedWorksiteSyncBatchStatus(preparedBatch).tone"
                      [note]="isDeviceOnline ? 'Le prochain envoi utilisera ces lots déjà préparés.' : 'Pas de réseau : ces lots restent bien préparés sur l’appareil.'"
                    />
                  </div>
                  <div class="worksite-sync-summary">
                    <cfm-status-chip
                      [label]="preparedBatch.preparedItemCount + ' lot(s) prêt(s)'"
                      [tone]="preparedBatch.preparedItemCount > 0 ? 'progress' : 'neutral'"
                    />
                    <cfm-status-chip
                      [label]="preparedBatch.sourceOperationCount + ' action(s) locale(s) d’origine'"
                      tone="calm"
                    />
                    <cfm-status-chip
                      *ngIf="preparedBatch.deduplicatedOperationCount > 0"
                      [label]="preparedBatch.deduplicatedOperationCount + ' doublon(s) évité(s)'"
                      tone="success"
                    />
                  </div>

                  <ul class="queue-list" *ngIf="preparedBatch.items.length > 0; else noPreparedWorksiteSync">
                    <li *ngFor="let item of preparedBatch.items">
                      <ng-container *ngIf="getPreparedWorksiteSyncItemStatus(item) as itemSyncStatus">
                        <div class="queue-meta">
                          <strong>{{ getPreparedWorksiteSyncItemTitle(item) }}</strong>
                          <div class="worksite-risk-chips">
                            <cfm-status-chip [label]="itemSyncStatus.label" [tone]="itemSyncStatus.tone" />
                            <cfm-status-chip [label]="getPreparedWorksiteSyncItemKindLabel(item)" tone="calm" />
                          </div>
                          <small>{{ item.sourceOperationCount }} opération(s) locale(s) regroupée(s)</small>
                          <small *ngIf="item.fileName">{{ item.fileName }}</small>
                          <small>{{ itemSyncStatus.detail }}</small>
                        </div>
                      </ng-container>
                    </li>
                  </ul>
                  <ng-template #noPreparedWorksiteSync>
                    <cfm-empty-state
                      title="Aucun lot terrain préparé"
                      description="Les objets terrain déjà capturés apparaîtront ici sous une forme consolidée, prête pour la future synchronisation distante."
                    />
                  </ng-template>
                </div>

                <form class="draft-form" (ngSubmit)="enqueueExampleOperation()">
                  <label>
                    <span>Type d’action locale</span>
                    <select [(ngModel)]="queueOperationType" name="queueOperationType">
                      <option *ngFor="let operationType of supportedOperationTypes" [value]="operationType">
                        {{ getLocalSyncOperationTypeLabel(operationType) }}
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Élément concerné</span>
                    <input
                      [(ngModel)]="queueTargetRecordId"
                      name="queueTargetRecordId"
                      type="text"
                      placeholder="Laisser vide pour reprendre le dernier brouillon"
                    />
                  </label>

                  <ion-button expand="block" type="submit" [disabled]="syncQueueBusy">
                    {{ syncQueueBusy ? "Ajout..." : "Ajouter une action locale" }}
                  </ion-button>
                </form>

                <ul class="queue-list" *ngIf="localSyncOperations.length > 0">
                  <li *ngFor="let operation of localSyncOperations">
                    <ng-container *ngIf="getOperationSyncStatus(operation) as operationSyncStatus">
                      <div class="queue-meta">
                        <strong>{{ getLocalSyncOperationTitle(operation) }}</strong>
                        <span>
                          {{ operationSyncStatus.label }} · {{ getLocalSyncOperationAttemptLabel(operation) }}
                        </span>
                        <small>Repère local : {{ operation.entityId }}</small>
                        <small>{{ operationSyncStatus.detail }}</small>
                        <small *ngIf="operation.nextAttemptAt">
                          nouvel essai possible {{ operation.nextAttemptAt | date: "short" }}
                        </small>
                        <small *ngIf="formatLocalSyncIssueMessage(operation.lastErrorMessage) as issueMessage">
                          point à vérifier : {{ issueMessage }}
                        </small>
                      </div>
                    </ng-container>

                    <div class="queue-actions">
                      <ion-button
                        size="small"
                        fill="outline"
                        color="warning"
                        [disabled]="syncQueueBusy || operation.status === 'completed'"
                        (click)="simulateOperationFailure(operation)"
                      >
                        Simuler échec
                      </ion-button>

                      <ion-button
                        size="small"
                        fill="outline"
                        [disabled]="syncQueueBusy || operation.status !== 'failed'"
                        (click)="requeueOperation(operation)"
                      >
                        Relancer
                      </ion-button>

                      <ion-button
                        size="small"
                        fill="outline"
                        color="success"
                        [disabled]="syncQueueBusy || operation.status === 'completed'"
                        (click)="completeOperation(operation)"
                      >
                        Marquer comme synchronisée
                      </ion-button>
                    </div>
                  </li>
                </ul>

                <cfm-empty-state
                  *ngIf="localSyncOperations.length === 0"
                  title="Aucune action locale à synchroniser"
                  description="Aucune action locale n’attend encore de synchronisation pour le moment."
                />
              </div>

              <p class="feedback error" *ngIf="localDatabaseError">{{ localDatabaseError }}</p>
              <p class="feedback success" *ngIf="localDatabaseFeedback && !localDatabaseError">{{ localDatabaseFeedback }}</p>
          </cfm-card>

          <cfm-card
            *ngIf="!session; else mobileSessionTemplate"
            class="section-card"
            eyebrow="Connexion mobile"
            title="Se connecter"
            description="Prépare l’accès mobile à l’organisation et le contexte hors ligne."
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
          </cfm-card>

          <ng-template #mobileSessionTemplate>
            <cfm-card
              *ngIf="currentMembership as membership"
              class="section-card"
              eyebrow="Contexte d'organisation"
              [title]="membership.organization.name"
              description="Le mobile reste centré sur l’accès utile, les modules actifs et le premier bloc chantier hors ligne."
            >
                <p class="meta">Connecté en tant que {{ session?.user?.display_name }}</p>
                <p class="role">Rôle : {{ membership.membership.role_code }}</p>

                <label class="organization-switch" *ngIf="session && session.memberships.length > 1">
                  <span>Organisation</span>
                  <select [(ngModel)]="selectedOrganizationId" name="organizationId" (change)="changeOrganization()">
                    <option *ngFor="let item of session.memberships" [value]="item.organization.id">
                      {{ item.organization.name }}
                    </option>
                  </select>
                </label>

                <div class="chips">
                  <cfm-status-chip
                    *ngFor="let permission of membership.permissions"
                    [label]="permission"
                    tone="calm"
                  />
                </div>

                <div class="module-block">
                  <strong>Modules actifs</strong>
                  <ul>
                    <li *ngFor="let module of membership.modules">
                      <span>{{ module.module_code }}</span>
                      <cfm-status-chip
                        [label]="module.is_enabled ? 'activé' : 'désactivé'"
                        [tone]="module.is_enabled ? 'success' : 'neutral'"
                      />
                    </li>
                  </ul>
                </div>

                <cfm-button variant="secondary" [block]="true" (click)="logout()">
                  Se déconnecter
                </cfm-button>
            </cfm-card>

            <cfm-card
              *ngIf="currentMembership"
              class="section-card"
              eyebrow="Chantier"
              title="Mes chantiers"
              description="Les chantiers déjà présents sur l’appareil restent consultables sans réseau. Prépare un chantier pour embarquer sa fiche essentielle."
            >
              <cfm-input
                [(ngModel)]="worksiteSearch"
                name="worksiteSearch"
                type="search"
                label="Rechercher un chantier"
                placeholder="Nom, client ou adresse"
                hint="Recherche locale simple, sans réseau."
              />

              <div class="worksite-toolbar">
                <cfm-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  [disabled]="worksiteImportBusy || !session"
                  (click)="refreshWorksiteSummariesFromApi()"
                >
                  {{ worksiteImportBusy ? "Import..." : "Actualiser depuis l’API" }}
                </cfm-button>
                <small *ngIf="worksiteLastImportedAt">
                  dernier import {{ worksiteLastImportedAt | date: "short" }}
                </small>
                <small *ngIf="!worksiteLastImportedAt">
                  aucun import API enregistré sur cet appareil
                </small>
              </div>

              <div class="worksite-list" *ngIf="filteredWorksiteSummaries.length > 0">
                <button
                  *ngFor="let worksite of filteredWorksiteSummaries"
                  type="button"
                  class="worksite-list-item"
                  [class.is-active]="worksite.id === selectedWorksiteId"
                  (click)="selectWorksite(worksite.id)"
                >
                  <div class="worksite-list-heading">
                    <strong>{{ worksite.name }}</strong>
                    <cfm-status-chip
                      [label]="getWorksiteOfflineLabel(worksite)"
                      [tone]="worksite.is_offline_ready ? 'success' : 'progress'"
                    />
                  </div>
                  <span>{{ worksite.client_name }}</span>
                  <small>{{ worksite.address }}</small>
                  <div class="worksite-list-meta">
                    <cfm-status-chip [label]="getWorksiteStatusLabel(worksite.status)" [tone]="getWorksiteStatusTone(worksite.status)" />
                    <small *ngIf="worksite.offline_prepared_at">
                      prêt le {{ worksite.offline_prepared_at | date: "short" }}
                    </small>
                    <small *ngIf="!worksite.offline_prepared_at">
                      consultation locale disponible
                    </small>
                  </div>
                </button>
              </div>

              <cfm-empty-state
                *ngIf="filteredWorksiteSummaries.length === 0"
                title="Aucun chantier trouvé"
                description="Importe les chantiers depuis l’API ou ajuste la recherche pour retrouver un chantier déjà présent sur l’appareil."
              />
            </cfm-card>

            <cfm-card
              *ngIf="displayedWorksiteDetail as worksiteDetail; else noWorksiteSelected"
              class="section-card"
              eyebrow="Fiche chantier"
              [title]="worksiteDetail.name"
              description="Une fiche courte, lisible sur téléphone, avec juste l’essentiel pour travailler sereinement sur le terrain."
            >
              <div class="worksite-header">
                <div>
                  <strong>{{ worksiteDetail.client_name }}</strong>
                  <p class="worksite-address">{{ worksiteDetail.address }}</p>
                </div>
                <div class="worksite-header-chips">
                  <cfm-status-chip
                    [label]="getWorksiteStatusLabel(worksiteDetail.status)"
                    [tone]="getWorksiteStatusTone(worksiteDetail.status)"
                  />
                  <cfm-status-chip
                    [label]="getWorksiteOfflineLabel(worksiteDetail)"
                    [tone]="worksiteDetail.is_offline_ready ? 'success' : 'progress'"
                  />
                </div>
              </div>

              <div class="worksite-sync-overview">
                <cfm-sync-state
                  title="Synchronisation de ce chantier"
                  [label]="getWorksiteSyncStatus(worksiteDetail).label"
                  [detail]="getWorksiteSyncStatus(worksiteDetail).detail"
                  [tone]="getWorksiteSyncStatus(worksiteDetail).tone"
                  [note]="worksiteDetail.is_offline_ready ? 'Ce chantier reste consultable sans réseau sur cet appareil.' : 'Même sans réseau, ce qui est déjà capturé reste bien enregistré sur l’appareil.'"
                />
              </div>

              <div class="worksite-info-grid">
                <div class="worksite-info-block">
                  <strong>Adresse</strong>
                  <span>{{ worksiteDetail.address }}</span>
                </div>
                <div class="worksite-info-block">
                  <strong>Client</strong>
                  <span>{{ worksiteDetail.client_name }}</span>
                </div>
                <div class="worksite-info-block">
                  <strong>Passage prévu</strong>
                  <span>{{ worksiteDetail.planned_for ? (worksiteDetail.planned_for | date: "short") : "à confirmer" }}</span>
                </div>
                <div class="worksite-info-block">
                  <strong>Hors ligne</strong>
                  <span>
                    {{ worksiteDetail.is_offline_ready ? "Consultable sans réseau sur cet appareil" : "Préparation recommandée avant déplacement" }}
                  </span>
                </div>
              </div>

              <div class="worksite-section">
                <div class="worksite-section-heading">
                  <strong>Contacts utiles</strong>
                  <small *ngIf="worksiteDetail.contacts.length > 0">{{ worksiteDetail.contacts.length }} contact(s)</small>
                </div>

                <ul class="worksite-detail-list" *ngIf="worksiteDetail.contacts.length > 0; else offlineContactsEmpty">
                  <li *ngFor="let contact of worksiteDetail.contacts">
                    <strong>{{ contact.name }}</strong>
                    <span>{{ contact.role }}</span>
                    <small>{{ contact.phone ?? "numéro à confirmer" }}</small>
                  </li>
                </ul>
                <ng-template #offlineContactsEmpty>
                  <cfm-empty-state
                    title="Contacts non préparés"
                    description="Prépare ce chantier hors ligne pour embarquer les contacts utiles sur l’appareil."
                  />
                </ng-template>
              </div>

              <div class="worksite-section">
                <div class="worksite-section-heading">
                  <strong>Équipements utiles</strong>
                  <small *ngIf="worksiteDetail.equipments.length > 0">{{ worksiteDetail.equipments.length }} équipement(s)</small>
                </div>

                <ul class="worksite-detail-list" *ngIf="worksiteDetail.equipments.length > 0; else worksiteEquipmentsEmpty">
                  <li *ngFor="let equipment of worksiteDetail.equipments" class="worksite-equipment-item">
                    <div class="worksite-list-heading">
                      <strong>{{ equipment.name }}</strong>
                      <cfm-status-chip
                        [label]="getWorksiteEquipmentStatusLabel(equipment.status)"
                        [tone]="getWorksiteEquipmentStatusTone(equipment.status)"
                      />
                    </div>
                    <span>{{ equipment.type }}</span>
                    <div class="worksite-safety-answers">
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [disabled]="worksiteEquipmentMovementBusyId === equipment.id"
                        (click)="recordWorksiteEquipmentMovement(worksiteDetail.id, equipment, 'assigned_to_worksite')"
                      >
                        Affecté
                      </button>
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [disabled]="worksiteEquipmentMovementBusyId === equipment.id"
                        (click)="recordWorksiteEquipmentMovement(worksiteDetail.id, equipment, 'removed_from_worksite')"
                      >
                        Retiré
                      </button>
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [disabled]="worksiteEquipmentMovementBusyId === equipment.id"
                        (click)="recordWorksiteEquipmentMovement(worksiteDetail.id, equipment, 'marked_damaged')"
                      >
                        Endommagé
                      </button>
                    </div>
                    <ng-container *ngIf="getLatestEquipmentMovement(worksiteDetail, equipment.id) as lastMovement">
                      <div class="worksite-risk-chips">
                        <cfm-status-chip
                          [label]="getEquipmentMovementSyncStatus(lastMovement).label"
                          [tone]="getEquipmentMovementSyncStatus(lastMovement).tone"
                        />
                      </div>
                      <small>{{ getEquipmentMovementTypeLabel(lastMovement.movement_type) }}</small>
                      <small class="worksite-sync-detail">
                        {{ lastMovement.captured_at ? (lastMovement.captured_at | date: "short") : "horodatage à confirmer" }}
                        <span *ngIf="lastMovement.actor_display_name"> · {{ lastMovement.actor_display_name }}</span>
                      </small>
                    </ng-container>
                  </li>
                </ul>
                <ng-template #worksiteEquipmentsEmpty>
                  <cfm-empty-state
                    title="Aucun équipement disponible"
                    description="Les équipements utiles apparaitront ici pour ce chantier quand ils seront embarqués localement."
                  />
                </ng-template>
              </div>

              <div class="worksite-section">
                <div class="worksite-section-heading">
                  <strong>Derniers mouvements d’équipement</strong>
                  <small *ngIf="worksiteDetail.recent_equipment_movements.length > 0">horodatés localement</small>
                </div>

                <ul class="worksite-detail-list" *ngIf="worksiteDetail.recent_equipment_movements.length > 0; else worksiteEquipmentMovementsEmpty">
                  <li *ngFor="let movement of worksiteDetail.recent_equipment_movements" class="worksite-equipment-item">
                    <div class="worksite-list-heading">
                      <strong>{{ movement.equipment_name }}</strong>
                      <cfm-status-chip
                        [label]="getEquipmentMovementSyncStatus(movement).label"
                        [tone]="getEquipmentMovementSyncStatus(movement).tone"
                      />
                    </div>
                    <span>{{ getEquipmentMovementTypeLabel(movement.movement_type) }}</span>
                    <small>
                      {{ movement.captured_at ? (movement.captured_at | date: "short") : "horodatage à confirmer" }}
                      <span *ngIf="movement.actor_display_name"> · {{ movement.actor_display_name }}</span>
                    </small>
                    <small class="worksite-sync-detail">{{ getEquipmentMovementSyncStatus(movement).detail }}</small>
                  </li>
                </ul>
                <ng-template #worksiteEquipmentMovementsEmpty>
                  <cfm-empty-state
                    title="Aucun mouvement local"
                    description="Enregistre un premier mouvement simple pour garder une trace locale de l’équipement sur ce chantier."
                  />
                </ng-template>
              </div>

              <div class="worksite-section">
                <div class="worksite-section-heading">
                  <strong>Dernières preuves</strong>
                  <small *ngIf="worksiteDetail.recent_proofs.length > 0">si déjà disponibles</small>
                </div>

                <label class="photo-picker worksite-proof-picker">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    [disabled]="worksiteProofCaptureBusy"
                    (change)="handleWorksiteProofCapture($event, worksiteDetail.id)"
                  />
                  <span>
                    {{
                      worksiteProofCaptureBusy
                        ? "Enregistrement de la preuve..."
                        : "Prendre une photo preuve"
                    }}
                  </span>
                </label>
                <small class="worksite-proof-note">
                  La photo est liée automatiquement à ce chantier, reste enregistrée sur l’appareil même sans
                  réseau, et peut recevoir un commentaire court modifiable localement.
                </small>

                <ul class="worksite-detail-list" *ngIf="worksiteDetail.recent_proofs.length > 0; else offlineProofsEmpty">
                  <li *ngFor="let proof of worksiteDetail.recent_proofs" class="worksite-proof-item">
                    <img
                      *ngIf="proof.thumbnail_local_uri"
                      class="worksite-proof-thumbnail"
                      [src]="proof.thumbnail_local_uri"
                      [alt]="proof.file_name ?? proof.label"
                    />
                    <div class="worksite-proof-meta">
                      <strong>{{ proof.file_name ?? proof.label }}</strong>
                      <span>{{ proof.captured_at ? (proof.captured_at | date: "short") : "horodatage à confirmer" }}</span>
                      <cfm-status-chip
                        [label]="getProofSyncStatus(proof).label"
                        [tone]="getProofSyncStatus(proof).tone"
                      />
                      <small class="worksite-sync-detail">{{ getProofSyncStatus(proof).detail }}</small>
                      <small *ngIf="proof.comment_text" class="worksite-proof-comment-preview">
                        {{ proof.comment_text }}
                      </small>
                      <div class="worksite-proof-comment-editor">
                        <cfm-input
                          [ngModel]="getWorksiteProofCommentDraft(proof)"
                          (ngModelChange)="setWorksiteProofCommentDraft(proof.id, $event)"
                          [name]="'worksiteProofComment-' + proof.id"
                          type="text"
                          [label]="proof.comment_text ? 'Modifier le commentaire' : 'Ajouter un commentaire court'"
                          placeholder="Ex. accès arrière, façade nord"
                        />
                        <cfm-button
                          type="button"
                          size="sm"
                          variant="secondary"
                          [disabled]="worksiteProofCommentBusyId === proof.id || !hasPendingProofCommentChange(proof)"
                          (click)="saveWorksiteProofComment(proof)"
                        >
                          {{
                            worksiteProofCommentBusyId === proof.id
                              ? "Enregistrement..."
                              : proof.comment_text
                                ? "Mettre à jour le commentaire"
                                : "Ajouter le commentaire"
                          }}
                        </cfm-button>
                      </div>
                    </div>
                  </li>
                </ul>
                <ng-template #offlineProofsEmpty>
                  <cfm-empty-state
                    title="Aucune preuve locale"
                    description="Prends une première photo preuve pour la voir immédiatement dans ce chantier, même sans réseau."
                  />
                </ng-template>
              </div>

              <div class="worksite-section">
                <div class="worksite-section-heading">
                  <strong>Checklist du jour</strong>
                  <small *ngIf="worksiteDetail.checklist_today.length > 0">structure simple</small>
                </div>

                <ul class="worksite-detail-list" *ngIf="worksiteDetail.checklist_today.length > 0; else offlineChecklistEmpty">
                  <li *ngFor="let item of worksiteDetail.checklist_today">
                    <strong>{{ item.label }}</strong>
                    <small>{{ getChecklistStatusLabel(item.status) }}</small>
                  </li>
                </ul>
                <ng-template #offlineChecklistEmpty>
                  <cfm-empty-state
                    title="Checklist non préparée"
                    description="Prépare ce chantier hors ligne pour embarquer la checklist du jour déjà disponible."
                  />
                </ng-template>
              </div>

              <div class="worksite-section" *ngIf="worksiteSafetyChecklistDraft as safetyChecklist">
                <div class="worksite-section-heading">
                  <strong>Checklist sécurité</strong>
                  <small>4 points rapides</small>
                </div>

                <div class="worksite-safety-summary">
                  <cfm-status-chip
                    [label]="getSafetyChecklistStatusLabel(safetyChecklist.status)"
                    [tone]="getSafetyChecklistStatusTone(safetyChecklist.status)"
                  />
                  <cfm-status-chip
                    [label]="getSafetyChecklistSyncStatus(safetyChecklist).label"
                    [tone]="getSafetyChecklistSyncStatus(safetyChecklist).tone"
                  />
                  <small>
                    {{ getAnsweredSafetyChecklistCount(safetyChecklist) }}/{{ safetyChecklist.items.length }} point(s) renseigné(s)
                  </small>
                </div>
                <small class="worksite-sync-detail">
                  {{ getSafetyChecklistSyncStatus(safetyChecklist).detail }}
                </small>

                <ul class="worksite-safety-list">
                  <li *ngFor="let item of safetyChecklist.items" class="worksite-safety-item">
                    <strong>{{ item.label }}</strong>
                    <div class="worksite-safety-answers">
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [class.is-active]="item.answer === 'yes'"
                        (click)="setSafetyChecklistAnswer(item.id, 'yes')"
                      >
                        Oui
                      </button>
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [class.is-active]="item.answer === 'no'"
                        (click)="setSafetyChecklistAnswer(item.id, 'no')"
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [class.is-active]="item.answer === 'na'"
                        (click)="setSafetyChecklistAnswer(item.id, 'na')"
                      >
                        N/A
                      </button>
                    </div>
                  </li>
                </ul>

                <label class="worksite-safety-comment">
                  <span>Commentaire optionnel</span>
                  <textarea
                    [ngModel]="safetyChecklist.comment_text ?? ''"
                    (ngModelChange)="setSafetyChecklistComment($event)"
                    name="worksiteSafetyChecklistComment"
                    rows="3"
                    placeholder="Si besoin, précise un point de vigilance."
                  ></textarea>
                </label>

                <div class="worksite-safety-actions">
                  <cfm-button
                    type="button"
                    variant="secondary"
                    [disabled]="worksiteSafetyChecklistBusy"
                    (click)="saveSafetyChecklist('draft')"
                  >
                    {{ worksiteSafetyChecklistBusy ? "Enregistrement..." : "Enregistrer le brouillon" }}
                  </cfm-button>
                  <cfm-button
                    type="button"
                    [disabled]="worksiteSafetyChecklistBusy || !canValidateSafetyChecklist(safetyChecklist)"
                    (click)="saveSafetyChecklist('validated')"
                  >
                    {{ worksiteSafetyChecklistBusy ? "Enregistrement..." : "Valider la checklist" }}
                  </cfm-button>
                </div>
                <small class="worksite-proof-note">
                  La checklist reste disponible sur l’appareil même sans réseau. La validation demande seulement que tous les points aient une réponse.
                </small>
              </div>

              <div class="worksite-section">
                <div class="worksite-section-heading">
                  <strong>Signalement de risque</strong>
                  <small>court et local</small>
                </div>

                <div class="worksite-risk-form">
                  <label>
                    <span>Type de risque</span>
                    <select [(ngModel)]="worksiteRiskType" name="worksiteRiskType">
                      <option *ngFor="let riskType of worksiteRiskTypes" [ngValue]="riskType">
                        {{ getRiskTypeLabel(riskType) }}
                      </option>
                    </select>
                  </label>

                  <div class="worksite-risk-severity">
                    <span>Gravité</span>
                    <div class="worksite-safety-answers">
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [class.is-active]="worksiteRiskSeverity === 'low'"
                        (click)="worksiteRiskSeverity = 'low'"
                      >
                        Faible
                      </button>
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [class.is-active]="worksiteRiskSeverity === 'medium'"
                        (click)="worksiteRiskSeverity = 'medium'"
                      >
                        Moyenne
                      </button>
                      <button
                        type="button"
                        class="worksite-safety-answer"
                        [class.is-active]="worksiteRiskSeverity === 'high'"
                        (click)="worksiteRiskSeverity = 'high'"
                      >
                        Haute
                      </button>
                    </div>
                  </div>

                  <label class="worksite-safety-comment">
                    <span>Note courte</span>
                    <textarea
                      [(ngModel)]="worksiteRiskNote"
                      name="worksiteRiskNote"
                      rows="3"
                      placeholder="Ex. sol glissant à l’entrée arrière"
                    ></textarea>
                  </label>

                  <label class="photo-picker worksite-proof-picker">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      [disabled]="worksiteRiskReportBusy"
                      (change)="handleWorksiteRiskPhotoSelection($event)"
                    />
                    <span>
                      {{
                        worksiteRiskReportBusy
                          ? "Préparation du signalement..."
                          : worksiteRiskPhotoDraft
                            ? "Changer la photo optionnelle"
                            : "Ajouter une photo optionnelle"
                      }}
                    </span>
                  </label>

                  <div class="worksite-risk-photo-draft" *ngIf="worksiteRiskPhotoDraft as photoDraft">
                    <img
                      class="worksite-risk-photo-preview"
                      [src]="photoDraft.localUri"
                      [alt]="photoDraft.fileName"
                    />
                    <div class="worksite-proof-meta">
                      <strong>{{ photoDraft.fileName }}</strong>
                      <small>Cette photo restera liée au signalement sur l’appareil.</small>
                      <cfm-button
                        type="button"
                        size="sm"
                        variant="secondary"
                        [disabled]="worksiteRiskReportBusy"
                        (click)="clearWorksiteRiskPhotoDraft()"
                      >
                        Retirer la photo
                      </cfm-button>
                    </div>
                  </div>

                  <cfm-button
                    type="button"
                    [disabled]="worksiteRiskReportBusy || !canSaveWorksiteRiskReport()"
                    (click)="saveWorksiteRiskReport()"
                  >
                    {{
                      worksiteRiskReportBusy
                        ? "Enregistrement..."
                        : "Enregistrer le signalement"
                    }}
                  </cfm-button>
                </div>

                <small class="worksite-proof-note">
                  Le signalement reste disponible sur l’appareil et peut embarquer une photo légère si besoin.
                </small>

                <ul class="worksite-detail-list" *ngIf="worksiteDetail.risk_reports.length > 0; else offlineRiskReportsEmpty">
                  <li *ngFor="let report of worksiteDetail.risk_reports" class="worksite-risk-item">
                    <img
                      *ngIf="report.photo_thumbnail_local_uri"
                      class="worksite-risk-photo-preview"
                      [src]="report.photo_thumbnail_local_uri"
                      [alt]="report.photo_file_name ?? getRiskTypeLabel(report.risk_type)"
                    />
                    <div class="worksite-proof-meta">
                      <strong>{{ getRiskTypeLabel(report.risk_type) }}</strong>
                      <div class="worksite-risk-chips">
                        <cfm-status-chip
                          [label]="getRiskSeverityLabel(report.severity)"
                          [tone]="getRiskSeverityTone(report.severity)"
                        />
                        <cfm-status-chip
                          [label]="getRiskReportSyncStatus(report).label"
                          [tone]="getRiskReportSyncStatus(report).tone"
                        />
                      </div>
                      <span>{{ report.captured_at ? (report.captured_at | date: "short") : "horodatage à confirmer" }}</span>
                      <small class="worksite-sync-detail">{{ getRiskReportSyncStatus(report).detail }}</small>
                      <small *ngIf="report.note_text">{{ report.note_text }}</small>
                      <small *ngIf="report.photo_file_name">Photo : {{ report.photo_file_name }}</small>
                    </div>
                  </li>
                </ul>
                <ng-template #offlineRiskReportsEmpty>
                  <cfm-empty-state
                    title="Aucun signalement local"
                    description="Ajoute un premier risque depuis ce chantier pour le garder visible immédiatement, même sans réseau."
                  />
                </ng-template>
              </div>

              <div class="worksite-section">
                <div class="worksite-section-heading">
                  <strong>Signature simple</strong>
                  <small>geste terrain rapide</small>
                </div>

                <div class="worksite-signature-form">
                  <canvas
                    #worksiteSignatureCanvas
                    class="worksite-signature-pad"
                    (pointerdown)="startWorksiteSignatureStroke($event, worksiteSignatureCanvas)"
                    (pointermove)="moveWorksiteSignatureStroke($event, worksiteSignatureCanvas)"
                    (pointerup)="endWorksiteSignatureStroke($event, worksiteSignatureCanvas)"
                    (pointerleave)="endWorksiteSignatureStroke($event, worksiteSignatureCanvas)"
                    (pointercancel)="endWorksiteSignatureStroke($event, worksiteSignatureCanvas)"
                  ></canvas>

                  <div class="worksite-signature-actions">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="worksiteSignatureCaptureBusy"
                      (click)="clearWorksiteSignatureCanvas(worksiteSignatureCanvas)"
                    >
                      Effacer
                    </cfm-button>
                    <cfm-button
                      type="button"
                      [disabled]="worksiteSignatureCaptureBusy || !canSaveWorksiteSignature()"
                      (click)="saveWorksiteSignature(worksiteDetail.id, worksiteSignatureCanvas)"
                    >
                      {{
                        worksiteSignatureCaptureBusy
                          ? "Enregistrement..."
                          : "Enregistrer la signature"
                      }}
                    </cfm-button>
                  </div>
                </div>

                <small class="worksite-proof-note">
                  La signature reste liée à ce chantier sur l’appareil, même sans réseau.
                </small>

                <ul class="worksite-detail-list" *ngIf="worksiteDetail.recent_signatures.length > 0; else offlineSignaturesEmpty">
                  <li *ngFor="let signature of worksiteDetail.recent_signatures" class="worksite-signature-item">
                    <img
                      *ngIf="signature.signature_local_uri"
                      class="worksite-signature-preview"
                      [src]="signature.signature_local_uri"
                      [alt]="signature.file_name ?? signature.label"
                    />
                    <div class="worksite-proof-meta">
                      <strong>{{ signature.file_name ?? signature.label }}</strong>
                      <span>{{ signature.captured_at ? (signature.captured_at | date: "short") : "horodatage à confirmer" }}</span>
                      <cfm-status-chip
                        [label]="getSignatureSyncStatus(signature).label"
                        [tone]="getSignatureSyncStatus(signature).tone"
                      />
                      <small class="worksite-sync-detail">{{ getSignatureSyncStatus(signature).detail }}</small>
                    </div>
                  </li>
                </ul>
                <ng-template #offlineSignaturesEmpty>
                  <cfm-empty-state
                    title="Aucune signature locale"
                    description="Trace une première signature simple pour la retrouver immédiatement dans ce chantier, même sans réseau."
                  />
                </ng-template>
              </div>

              <div class="worksite-section">
                <div class="worksite-section-heading">
                  <strong>Notes vocales</strong>
                  <small *ngIf="worksiteDetail.recent_voice_notes.length > 0">consultables hors ligne</small>
                </div>

                <label class="photo-picker worksite-proof-picker">
                  <input
                    type="file"
                    accept="audio/*"
                    capture
                    [disabled]="worksiteVoiceNoteCaptureBusy"
                    (change)="handleWorksiteVoiceNoteCapture($event, worksiteDetail.id)"
                  />
                  <span>
                    {{
                      worksiteVoiceNoteCaptureBusy
                        ? "Enregistrement de la note..."
                        : "Enregistrer une note vocale"
                    }}
                  </span>
                </label>
                <small class="worksite-proof-note">
                  La note vocale reste liée à ce chantier, enregistrée sur l’appareil et relisible même sans réseau.
                </small>

                <ul class="worksite-detail-list" *ngIf="worksiteDetail.recent_voice_notes.length > 0; else offlineVoiceNotesEmpty">
                  <li *ngFor="let voiceNote of worksiteDetail.recent_voice_notes" class="worksite-voice-note-item">
                    <div class="worksite-proof-meta">
                      <strong>{{ voiceNote.file_name ?? voiceNote.label }}</strong>
                      <span>
                        {{
                          voiceNote.captured_at
                            ? (voiceNote.captured_at | date: "short")
                            : "horodatage à confirmer"
                        }}
                      </span>
                      <small *ngIf="voiceNote.duration_seconds">
                        Durée : {{ formatDuration(voiceNote.duration_seconds) }}
                      </small>
                      <cfm-status-chip
                        [label]="getVoiceNoteSyncStatus(voiceNote).label"
                        [tone]="getVoiceNoteSyncStatus(voiceNote).tone"
                      />
                      <small class="worksite-sync-detail">{{ getVoiceNoteSyncStatus(voiceNote).detail }}</small>
                      <audio
                        *ngIf="voiceNote.playback_local_uri"
                        class="worksite-voice-note-player"
                        controls
                        preload="none"
                        [src]="voiceNote.playback_local_uri"
                      ></audio>
                    </div>
                  </li>
                </ul>
                <ng-template #offlineVoiceNotesEmpty>
                  <cfm-empty-state
                    title="Aucune note vocale locale"
                    description="Enregistre une première note vocale pour la relire immédiatement sur ce chantier, même sans réseau."
                  />
                </ng-template>
              </div>

              <div class="worksite-offline-actions">
                <cfm-button
                  type="button"
                  [block]="true"
                  [disabled]="preparingWorksiteId === worksiteDetail.id"
                  (click)="prepareWorksiteOffline(worksiteDetail.id)"
                >
                  {{
                    preparingWorksiteId === worksiteDetail.id
                      ? "Préparation..."
                      : worksiteDetail.is_offline_ready
                        ? "Actualiser la préparation hors ligne"
                        : "Préparer hors ligne"
                  }}
                </cfm-button>

                <p class="worksite-offline-note">
                  {{
                    worksiteDetail.is_offline_ready
                      ? "Ce chantier reste consultable sans réseau sur cet appareil."
                      : "Une fois préparé, ce chantier garde sa fiche essentielle même sans réseau."
                  }}
                </p>
              </div>

              <p class="feedback error" *ngIf="worksiteError">{{ worksiteError }}</p>
              <p class="feedback success" *ngIf="worksiteFeedback && !worksiteError">{{ worksiteFeedback }}</p>
            </cfm-card>

            <ng-template #noWorksiteSelected>
              <cfm-card class="section-card" eyebrow="Fiche chantier" title="Aucun chantier sélectionné">
                <cfm-empty-state
                  title="Choisis un chantier"
                  description="Sélectionne un chantier dans la liste pour ouvrir sa fiche essentielle et le préparer hors ligne."
                />
              </cfm-card>
            </ng-template>
          </ng-template>

          <p class="feedback error" *ngIf="errorMessage">{{ errorMessage }}</p>
        </section>
      </ion-content>
    </ion-app>
  `,
  styles: [
    `
      .shell {
        min-height: 100%;
        padding: calc(2rem + env(safe-area-inset-top)) 1rem 2rem;
        background:
          radial-gradient(circle at top, rgba(88, 165, 149, 0.24), transparent 34%),
          radial-gradient(circle at top right, rgba(245, 188, 88, 0.18), transparent 24%),
          linear-gradient(180deg, #f7f2e9, #edf5f2);
      }

      .auth-form,
      .organization-switch,
      .draft-form {
        display: grid;
      }

      ion-badge {
        margin-bottom: 1rem;
      }

      h1,
      p {
        margin: 0;
      }

      h1 {
        font-size: 2rem;
        line-height: 1.05;
        color: #10312f;
      }

      p {
        margin-top: 0.85rem;
        line-height: 1.6;
        color: #325a56;
      }

      .supporting-copy {
        margin-top: 0.5rem;
      }

      .section-card {
        margin-top: 1.5rem;
        position: relative;
      }

      .quick-capture-overview,
      .quick-capture-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .quick-capture-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
      }

      .quick-capture-card {
        display: grid;
        gap: 0.3rem;
        padding: 1rem;
        border: 1px solid #bfd3cf;
        border-radius: 20px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 251, 250, 0.84));
        box-shadow:
          0 14px 28px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.84);
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition:
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease,
          background-color 140ms ease;
      }

      .quick-capture-card.is-active {
        border-color: #1d6d64;
        box-shadow:
          0 0 0 3px rgba(29, 109, 100, 0.12),
          0 16px 32px rgba(18, 33, 42, 0.08);
        background: linear-gradient(180deg, #f7fdfb, #eef8f4);
        transform: translateY(-1px);
      }

      .quick-capture-card span,
      .quick-capture-card small,
      .quick-capture-note {
        color: #486863;
      }

      .quick-capture-detail {
        display: grid;
        gap: 0.75rem;
        padding: 1.05rem;
        border-radius: 20px;
        background:
          linear-gradient(180deg, rgba(245, 250, 248, 0.96), rgba(255, 255, 255, 0.86));
        border: 1px solid #d7e6e1;
        box-shadow: 0 14px 28px rgba(18, 33, 42, 0.05);
      }

      .quick-capture-steps {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.65rem;
      }

      .quick-capture-steps li {
        display: grid;
        gap: 0.2rem;
        padding: 0.92rem 1rem;
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 252, 252, 0.9));
        border: 1px solid #dbe8e3;
        box-shadow: 0 10px 22px rgba(18, 33, 42, 0.04);
      }

      .quick-capture-steps span {
        color: #486863;
      }

      .auth-form {
        gap: 0.9rem;
      }

      label span,
      .meta,
      .role,
      .feedback {
        color: #486863;
      }

      label span {
        display: block;
        margin-bottom: 0.35rem;
      }

      textarea,
      select {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #bfd3cf;
        border-radius: 14px;
        padding: 0.85rem 0.95rem;
        font: inherit;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 252, 252, 0.92));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          0 8px 20px rgba(18, 33, 42, 0.04);
      }

      textarea {
        resize: vertical;
        min-height: 7rem;
      }

      h2 {
        margin: 0.35rem 0 0;
        color: #153733;
      }

      .organization-switch {
        gap: 0.35rem;
        margin-top: 1rem;
      }

      .database-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .database-stat {
        display: grid;
        gap: 0.2rem;
        padding: 0.9rem 0.95rem;
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(241, 248, 245, 0.96), rgba(255, 255, 255, 0.88));
        border: 1px solid rgba(191, 211, 207, 0.72);
        box-shadow:
          0 12px 24px rgba(18, 33, 42, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.82);
      }

      .database-stat strong {
        color: #10312f;
        font-size: 0.82rem;
      }

      .database-stat span {
        color: #486863;
        font-size: 0.92rem;
      }

      .draft-form {
        gap: 0.9rem;
        margin-top: 1rem;
      }

      .worksite-list {
        display: grid;
        gap: 0.75rem;
      }

      .worksite-toolbar {
        display: grid;
        gap: 0.55rem;
      }

      .worksite-toolbar small {
        color: #486863;
      }

      .worksite-list-item {
        display: grid;
        gap: 0.3rem;
        width: 100%;
        padding: 1.02rem;
        border: 1px solid #d5e3df;
        border-radius: 20px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 251, 250, 0.9));
        box-shadow:
          0 14px 28px rgba(18, 33, 42, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.84);
        text-align: left;
        font: inherit;
        cursor: pointer;
        transition:
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease,
          background-color 140ms ease;
      }

      .worksite-list-item.is-active {
        border-color: #1d6d64;
        box-shadow:
          0 0 0 3px rgba(29, 109, 100, 0.12),
          0 18px 36px rgba(18, 33, 42, 0.08);
        background: linear-gradient(180deg, #f7fdfb, #eef8f4);
        transform: translateY(-1px);
      }

      .worksite-list-item span,
      .worksite-list-item small,
      .worksite-address,
      .worksite-info-block span,
      .worksite-section-heading small,
      .worksite-detail-list span,
      .worksite-detail-list small,
      .worksite-offline-note {
        color: #486863;
      }

      .worksite-list-heading,
      .worksite-header,
      .worksite-section-heading {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 0.75rem;
      }

      .worksite-list-meta,
      .worksite-header-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .worksite-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
      }

      .worksite-sync-overview {
        margin-top: 0.9rem;
      }

      .worksite-info-block {
        display: grid;
        gap: 0.25rem;
        padding: 0.95rem;
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(241, 248, 245, 0.96), rgba(255, 255, 255, 0.88));
        border: 1px solid rgba(191, 211, 207, 0.7);
        box-shadow: 0 10px 22px rgba(18, 33, 42, 0.04);
      }

      .worksite-section {
        display: grid;
        gap: 0.75rem;
      }

      .worksite-detail-list {
        list-style: none;
        padding-left: 0;
        margin: 0;
        display: grid;
        gap: 0.65rem;
      }

      .worksite-detail-list li {
        display: grid;
        gap: 0.15rem;
        padding: 0.95rem 1rem;
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 252, 252, 0.9));
        border: 1px solid #dbe8e3;
        box-shadow: 0 10px 22px rgba(18, 33, 42, 0.04);
      }

      .worksite-equipment-item {
        gap: 0.35rem;
      }

      .worksite-offline-actions {
        display: grid;
        gap: 0.75rem;
      }

      .worksite-proof-picker {
        margin-top: 0;
      }

      .worksite-proof-note {
        margin-top: 0;
        color: #486863;
      }

      .worksite-proof-item {
        grid-template-columns: 88px minmax(0, 1fr);
        align-items: start;
      }

      .worksite-proof-thumbnail {
        width: 88px;
        height: 88px;
        object-fit: cover;
        border-radius: 16px;
        background: #e8f0ed;
      }

      .worksite-proof-meta {
        display: grid;
        gap: 0.25rem;
      }

      .worksite-proof-comment-preview {
        line-height: 1.45;
      }

      .worksite-sync-detail {
        color: #486863;
        line-height: 1.45;
      }

      .worksite-proof-comment-editor {
        display: grid;
        gap: 0.6rem;
        margin-top: 0.4rem;
      }

      .worksite-safety-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .worksite-safety-summary small {
        color: #486863;
      }

      .worksite-safety-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.7rem;
      }

      .worksite-safety-item {
        display: grid;
        gap: 0.7rem;
        padding: 0.95rem 1rem;
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 252, 252, 0.9));
        border: 1px solid #dbe8e3;
        box-shadow: 0 10px 22px rgba(18, 33, 42, 0.04);
      }

      .worksite-safety-answers {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.5rem;
      }

      .worksite-safety-answer {
        border: 1px solid #bfd3cf;
        border-radius: 999px;
        background: #ffffff;
        padding: 0.7rem 0.85rem;
        font: inherit;
        font-weight: 600;
        color: #10312f;
      }

      .worksite-safety-answer.is-active {
        border-color: #1d6d64;
        background: #e7f5f1;
        color: #124b45;
      }

      .worksite-safety-comment {
        display: grid;
        gap: 0.4rem;
      }

      .worksite-safety-actions {
        display: grid;
        gap: 0.6rem;
      }

      .worksite-risk-form {
        display: grid;
        gap: 0.75rem;
      }

      .worksite-risk-severity {
        display: grid;
        gap: 0.4rem;
      }

      .worksite-risk-photo-draft {
        display: grid;
        gap: 0.75rem;
        padding: 0.9rem 0.95rem;
        border-radius: 16px;
        background: #fffdfa;
        border: 1px solid #dbe8e3;
      }

      .worksite-risk-photo-preview {
        width: 100%;
        max-width: 160px;
        height: auto;
        object-fit: cover;
        border-radius: 16px;
        background: #e8f0ed;
      }

      .worksite-risk-item {
        gap: 0.75rem;
      }

      .worksite-risk-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .worksite-signature-form {
        display: grid;
        gap: 0.75rem;
      }

      .worksite-signature-pad {
        display: block;
        width: 100%;
        height: 180px;
        border-radius: 16px;
        border: 1px dashed #9ebeb8;
        background: #fffdfa;
        touch-action: none;
      }

      .worksite-signature-actions {
        display: grid;
        gap: 0.6rem;
      }

      .worksite-signature-item {
        gap: 0.75rem;
      }

      .worksite-signature-preview {
        width: 100%;
        max-width: 220px;
        height: auto;
        border-radius: 16px;
        background: #fffdfa;
        border: 1px solid #dbe8e3;
      }

      .worksite-voice-note-item {
        align-items: start;
      }

      .worksite-voice-note-player {
        width: 100%;
        margin-top: 0.35rem;
      }

      .sync-pill-inline {
        margin-left: auto;
      }

      .queue-section {
        margin-top: 1.25rem;
      }

      .photo-section {
        margin-top: 1.25rem;
      }

      .photo-picker {
        position: relative;
        display: block;
        margin-top: 1rem;
      }

      .photo-picker input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        padding: 0;
        border: 0;
      }

      .photo-picker span {
        display: block;
        padding: 0.9rem 1rem;
        border-radius: 16px;
        border: 1px dashed #9ebeb8;
        background: #fffdfa;
        color: #164843;
        text-align: center;
        font-weight: 600;
      }

      .photo-list {
        list-style: none;
        padding-left: 0;
      }

      .photo-list li {
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr);
        gap: 0.85rem;
        align-items: start;
        padding: 0.9rem 0;
        border-bottom: 1px solid #dbe8e3;
      }

      .photo-list li:last-child {
        border-bottom: none;
      }

      .photo-thumbnail {
        width: 96px;
        height: 96px;
        object-fit: cover;
        border-radius: 18px;
        background: #e8f0ed;
      }

      .photo-meta {
        display: grid;
        gap: 0.15rem;
      }

      .photo-meta span,
      .photo-meta small {
        color: #486863;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-top: 1rem;
      }

      .module-block {
        margin-top: 1rem;
      }

      .worksite-sync-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.75rem;
      }

      ul {
        padding-left: 1.1rem;
        margin: 0.75rem 0 0;
      }

      .module-block ul li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .draft-list {
        list-style: none;
        padding-left: 0;
      }

      .draft-list li {
        display: grid;
        gap: 0.15rem;
        padding: 0.8rem 0;
        border-bottom: 1px solid #dbe8e3;
      }

      .draft-heading {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .draft-list li:last-child {
        border-bottom: none;
      }

      .draft-list span,
      .draft-list small {
        color: #486863;
      }

      .queue-list {
        list-style: none;
        padding-left: 0;
      }

      .queue-list li {
        padding: 0.92rem 0.95rem;
        border-bottom: none;
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 251, 250, 0.9));
        border: 1px solid #dbe8e3;
        box-shadow: 0 10px 22px rgba(18, 33, 42, 0.04);
      }

      .queue-list li:last-child {
        border-bottom: none;
      }

      .queue-meta {
        display: grid;
        gap: 0.2rem;
      }

      .queue-meta span,
      .queue-meta small {
        color: #486863;
      }

      .queue-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.75rem;
      }

      li + li {
        margin-top: 0.55rem;
      }

      .feedback {
        position: relative;
        display: grid;
        gap: 0.2rem;
        margin-top: 1rem;
        padding: 0.92rem 0.95rem 0.92rem 1.15rem;
        border-radius: 18px;
        border: 1px solid rgba(15, 23, 42, 0.06);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 249, 0.86));
        box-shadow:
          0 14px 28px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.82);
        animation: mobileFeedbackPulse 220ms ease;
      }

      .feedback::before {
        content: "";
        position: absolute;
        left: 0.78rem;
        top: 0.9rem;
        bottom: 0.9rem;
        width: 4px;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.24;
      }

      .feedback.error {
        color: #8a2d2d;
        background:
          linear-gradient(180deg, rgba(254, 243, 241, 0.98), rgba(255, 255, 255, 0.88));
      }

      .feedback.success {
        color: #1f6a47;
        background:
          linear-gradient(180deg, rgba(239, 250, 245, 0.98), rgba(255, 255, 255, 0.88));
      }

      @keyframes mobileFeedbackPulse {
        from {
          opacity: 0;
          transform: translateY(4px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
})
export class AppComponent implements OnDestroy {
  private readonly defaultWorksiteRiskType: WorksiteRiskType = "slip";
  private readonly defaultWorksiteRiskSeverity: WorksiteRiskSeverity = "medium";
  email = "";
  password = "";
  loading = false;
  errorMessage = "";
  localDatabaseBusy = false;
  photoCaptureBusy = false;
  worksiteProofCaptureBusy = false;
  worksiteVoiceNoteCaptureBusy = false;
  worksiteRiskReportBusy = false;
  worksiteSignatureCaptureBusy = false;
  worksiteEquipmentMovementBusyId: string | null = null;
  syncQueueBusy = false;
  localDatabaseError = "";
  localDatabaseFeedback = "";
  draftTitle = "";
  draftBody = "";
  queueOperationType: LocalSyncOperationType = "update";
  queueTargetRecordId = "";
  worksiteSearch = "";
  worksiteProofCommentDrafts: Record<string, string> = {};
  worksiteSafetyChecklistDraft: WorksiteSafetyChecklist | null = null;
  worksiteRiskType: WorksiteRiskType = this.defaultWorksiteRiskType;
  worksiteRiskSeverity: WorksiteRiskSeverity = this.defaultWorksiteRiskSeverity;
  worksiteRiskNote = "";
  worksiteRiskPhotoDraft: {
    fileName: string;
    localUri: string;
    mimeType: string | null;
    sizeBytes: number | null;
  } | null = null;
  worksiteSignatureHasStroke = false;
  worksiteSignatureDrawing = false;
  localDatabaseStatus: LocalDatabaseStatus | null = null;
  localDrafts: LocalRecord[] = [];
  localPhotos: LocalFileReference[] = [];
  localSyncOperations: LocalSyncOperation[] = [];
  preparedWorksiteSyncBatch: PreparedWorksiteSyncBatch | null = null;
  worksiteSummaries: WorksiteSummary[] = [];
  selectedWorksiteId: string | null = null;
  selectedWorksiteDetail: WorksiteEssentialDetail | null = null;
  preparingWorksiteId: string | null = null;
  worksiteProofCommentBusyId: string | null = null;
  worksiteSafetyChecklistBusy = false;
  worksiteImportBusy = false;
  worksiteLastImportedAt: string | null = null;
  worksiteError = "";
  worksiteFeedback = "";
  session: AuthSession | null = null;
  accessToken = getStoredAccessToken();
  selectedOrganizationId = getStoredOrganizationId();
  selectedQuickCaptureKey: QuickCapturePatternKey = "photo";
  isDeviceOnline = typeof navigator === "undefined" ? true : navigator.onLine;
  readonly quickCapturePatterns = QUICK_CAPTURE_PATTERNS;
  readonly supportedOperationTypes: LocalSyncOperationType[] = [
    "create",
    "update",
    "delete_soft",
    "upload_media",
    "status_change"
  ];
  readonly worksiteRiskTypes: WorksiteRiskType[] = [
    "slip",
    "fall",
    "electrical",
    "traffic",
    "other"
  ];
  private readonly handleOnline = () => {
    this.isDeviceOnline = true;
  };
  private readonly handleOffline = () => {
    this.isDeviceOnline = false;
  };
  private worksiteSignatureCanvasElement: HTMLCanvasElement | null = null;

  @ViewChild("worksiteSignatureCanvas")
  set worksiteSignatureCanvasRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this.worksiteSignatureCanvasElement = value?.nativeElement ?? null;
    this.resetVisibleWorksiteSignatureCanvas();
  }

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
    void this.initializeLocalDatabase();
    if (this.accessToken) {
      void this.refreshSession(this.selectedOrganizationId);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
  }

  get currentMembership(): MembershipAccess | null {
    return this.session?.current_membership ?? null;
  }

  get selectedQuickCapturePattern(): QuickCapturePattern {
    return this.quickCapturePatterns.find((pattern) => pattern.key === this.selectedQuickCaptureKey)
      ?? this.quickCapturePatterns[0];
  }

  get globalSyncStatus(): SyncStatusCopy {
    return getGlobalSyncStatusCopy(this.localDatabaseStatus, this.isDeviceOnline);
  }

  get filteredWorksiteSummaries(): WorksiteSummary[] {
    const search = this.worksiteSearch.trim().toLowerCase();
    if (!search) {
      return this.worksiteSummaries;
    }

    return this.worksiteSummaries.filter((worksite) =>
      [worksite.name, worksite.client_name, worksite.address].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }

  get displayedWorksiteDetail(): WorksiteEssentialDetail | null {
    if (!this.selectedWorksiteDetail) {
      return null;
    }

    if (!this.worksiteSearch.trim()) {
      return this.selectedWorksiteDetail;
    }

    return this.filteredWorksiteSummaries.some(
      (worksite) => worksite.id === this.selectedWorksiteDetail?.id
    )
      ? this.selectedWorksiteDetail
      : null;
  }

  async submitLogin(): Promise<void> {
    this.loading = true;
    this.errorMessage = "";
    this.localDatabaseFeedback = "";
    this.worksiteFeedback = "";

    try {
      const response = await login({
        email: this.email,
        password: this.password
      });
      this.accessToken = response.access_token;
      this.session = response.session;
      this.selectedOrganizationId = response.session.current_membership.organization.id;
      persistSession(response.access_token, response.session);
      await this.refreshLocalDatabaseView();
      await this.refreshWorksiteSummariesFromApi({ silentIfOffline: true });
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async changeOrganization(): Promise<void> {
    this.localDatabaseFeedback = "";
    this.worksiteFeedback = "";
    await this.refreshSession(this.selectedOrganizationId);
  }

  async saveLocalDraft(): Promise<void> {
    this.localDatabaseBusy = true;
    this.localDatabaseError = "";
    this.localDatabaseFeedback = "";

    try {
      const recordId = `draft-${Date.now()}`;
      const organizationId = this.currentMembership?.organization.id ?? null;
      const payload = {
        title: this.draftTitle.trim(),
        body: this.draftBody.trim(),
        source: "mobile_sprint0"
      };
      await mobileLocalDatabase.upsertLocalRecord({
        entityName: "field_draft",
        recordId,
        organizationId,
        syncStatus: "local_only",
        payload
      });
      await mobileLocalDatabase.enqueueSyncOperation({
        organizationId,
        entityName: "field_draft",
        entityId: recordId,
        operationType: "create",
        baseVersion: 0,
        payload
      });
      this.draftTitle = "";
      this.draftBody = "";
      await this.refreshLocalDatabaseView();
      this.localDatabaseFeedback = "Brouillon enregistré sur l’appareil et en attente de synchronisation.";
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      this.localDatabaseBusy = false;
    }
  }

  async handlePhotoCapture(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    this.photoCaptureBusy = true;
    this.localDatabaseError = "";
    this.localDatabaseFeedback = "";

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Le fichier sélectionné n'est pas une image.");
      }

      const organizationId = this.currentMembership?.organization.id ?? null;
      const capturedAt = new Date().toISOString();
      const fileId = this.createLocalId("photo");
      const fileName = file.name && file.name.length > 0 ? file.name : `${fileId}.jpg`;
      const localUri = await this.readFileAsDataUrl(file);

      await mobileLocalDatabase.upsertLocalRecord({
        entityName: "document_draft",
        recordId: fileId,
        organizationId,
        syncStatus: "local_only",
        payload: {
          attached_to_entity_type: "photo_capture_demo",
          attached_to_entity_id: fileId,
          attached_to_field: "image",
          document_type: "photo",
          source: "mobile_capture",
          status: "available",
          file_name: fileName,
          mime_type: file.type || "image/jpeg",
          size_bytes: file.size || null,
          uploaded_at: capturedAt,
          captured_at: capturedAt
        }
      });

      await mobileLocalDatabase.upsertLocalFileReference({
        fileId,
        organizationId,
        ownerEntityName: "document_draft",
        ownerRecordId: fileId,
        fileName,
        documentType: "photo",
        source: "mobile_capture",
        localUri,
        mimeType: file.type || "image/jpeg",
        sizeBytes: file.size || null,
        capturedAt
      });

      await this.refreshLocalDatabaseView();
      this.localDatabaseFeedback = "Photo enregistrée sur l’appareil.";
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      if (input) {
        input.value = "";
      }
      this.photoCaptureBusy = false;
    }
  }

  async enqueueExampleOperation(): Promise<void> {
    this.syncQueueBusy = true;
    this.localDatabaseError = "";
    this.localDatabaseFeedback = "";

    try {
      const targetRecordId = await this.resolveQueueTargetRecordId();
      const organizationId = this.currentMembership?.organization.id ?? null;
      const payload = this.buildQueuePayload(this.queueOperationType, targetRecordId);

      if (this.queueOperationType === "create") {
        await mobileLocalDatabase.upsertLocalRecord({
          entityName: "field_draft",
          recordId: targetRecordId,
          organizationId,
          syncStatus: "pending_sync",
          payload
        });
      } else if (this.localDrafts.some((draft) => draft.recordId === targetRecordId)) {
        const existing = await mobileLocalDatabase.getLocalRecord("field_draft", targetRecordId);
        if (existing) {
          await mobileLocalDatabase.upsertLocalRecord({
            entityName: existing.entityName,
            recordId: existing.recordId,
            organizationId: existing.organizationId,
            syncStatus: "pending_sync",
            version: existing.version,
            payload: {
              ...existing.payload,
              lastQueuedOperation: this.queueOperationType
            },
            deletedAt:
              this.queueOperationType === "delete_soft" ? new Date().toISOString() : existing.deletedAt
          });
        }
      }

      await mobileLocalDatabase.enqueueSyncOperation({
        organizationId,
        entityName: "field_draft",
        entityId: targetRecordId,
        operationType: this.queueOperationType,
        payload
      });
      this.queueTargetRecordId = "";
      await this.refreshLocalDatabaseView();
      this.localDatabaseFeedback = "Action locale enregistrée. Elle reste en attente de synchronisation.";
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      this.syncQueueBusy = false;
    }
  }

  async simulateOperationFailure(operation: LocalSyncOperation): Promise<void> {
    this.syncQueueBusy = true;
    this.localDatabaseError = "";
    this.localDatabaseFeedback = "";

    try {
      const inProgress = operation.status === "in_progress"
        ? operation
        : await mobileLocalDatabase.markSyncOperationInProgress(operation.operationId);
      await mobileLocalDatabase.markSyncOperationFailed(inProgress.operationId, {
        code: "demo_network",
        message: "Echec reseau local simule pour Sprint 0."
      });
      await this.refreshLocalDatabaseView();
      this.localDatabaseFeedback = "Action locale conservée sur l’appareil, mais à vérifier avant le prochain envoi.";
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      this.syncQueueBusy = false;
    }
  }

  async requeueOperation(operation: LocalSyncOperation): Promise<void> {
    this.syncQueueBusy = true;
    this.localDatabaseError = "";
    this.localDatabaseFeedback = "";

    try {
      await mobileLocalDatabase.requeueSyncOperation(operation.operationId);
      await this.refreshLocalDatabaseView();
      this.localDatabaseFeedback = "Action locale remise en attente de synchronisation.";
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      this.syncQueueBusy = false;
    }
  }

  async completeOperation(operation: LocalSyncOperation): Promise<void> {
    this.syncQueueBusy = true;
    this.localDatabaseError = "";
    this.localDatabaseFeedback = "";

    try {
      await mobileLocalDatabase.markSyncOperationCompleted(operation.operationId);
      await this.refreshLocalDatabaseView();
      this.localDatabaseFeedback = "Action locale marquée comme synchronisée pour le moment.";
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      this.syncQueueBusy = false;
    }
  }

  readDraftTitle(record: LocalRecord): string {
    const title = record.payload.title;
    return typeof title === "string" && title.length > 0 ? title : record.recordId;
  }

  formatFileSize(sizeBytes: number): string {
    if (sizeBytes < 1024) {
      return `${sizeBytes} o`;
    }
    if (sizeBytes < 1024 * 1024) {
      return `${Math.round(sizeBytes / 102.4) / 10} Ko`;
    }
    return `${Math.round(sizeBytes / 104857.6) / 10} Mo`;
  }

  formatDuration(durationSeconds: number | null): string {
    if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return "durée à confirmer";
    }

    const totalSeconds = Math.round(durationSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  getDraftSyncStatus(record: LocalRecord): SyncStatusCopy {
    return getRecordSyncStatusCopy(record, this.localSyncOperations);
  }

  getOperationSyncStatus(operation: LocalSyncOperation): SyncStatusCopy {
    return getOperationSyncStatusCopy(operation);
  }

  getLocalSyncOperationTypeLabel(operationType: LocalSyncOperationType): string {
    switch (operationType) {
      case "create":
        return "Création locale";
      case "update":
        return "Mise à jour locale";
      case "delete_soft":
        return "Retrait local";
      case "upload_media":
        return "Média à envoyer";
      case "status_change":
        return "Changement d’état";
    }
  }

  getLocalSyncEntityLabel(entityName: string): string {
    switch (entityName) {
      case "field_draft":
        return "Brouillon terrain";
      case "document_draft":
        return "Document local";
      case "worksite_equipment_movement":
        return "Mouvement équipement";
      case "worksite_proof":
        return "Photo preuve";
      case "worksite_voice_note":
        return "Note vocale";
      case "worksite_safety_checklist":
        return "Checklist sécurité";
      case "worksite_risk_report":
        return "Signalement de risque";
      case "worksite_signature":
        return "Signature simple";
      default:
        return entityName;
    }
  }

  getLocalSyncOperationTitle(operation: LocalSyncOperation): string {
    return `${this.getLocalSyncEntityLabel(operation.entityName)} · ${this.getLocalSyncOperationTypeLabel(operation.operationType)}`;
  }

  getLocalSyncOperationAttemptLabel(operation: LocalSyncOperation): string {
    return `tentative ${operation.attempts} sur ${operation.maxAttempts}`;
  }

  formatLocalSyncIssueMessage(message: string | null): string | null {
    if (!message) {
      return null;
    }

    const normalized = message.toLowerCase();
    if (normalized.includes("reseau") || normalized.includes("network")) {
      return "La dernière tentative a été interrompue. Une nouvelle tentative peut repartir.";
    }

    if (normalized.includes("timeout")) {
      return "La dernière tentative a pris trop de temps. Une nouvelle tentative peut repartir.";
    }

    return message;
  }

  getWorksiteSyncStatus(worksite: WorksiteEssentialDetail): SyncStatusCopy {
    return getWorksiteSyncStatusCopy(
      worksite,
      this.localSyncOperations,
      this.preparedWorksiteSyncBatch,
      this.isDeviceOnline
    );
  }

  getPreparedWorksiteSyncBatchStatus(batch: PreparedWorksiteSyncBatch): SyncStatusCopy {
    return getPreparedWorksiteSyncBatchStatusCopy(batch);
  }

  getPreparedWorksiteSyncItemStatus(item: PreparedWorksiteSyncItem): SyncStatusCopy {
    return getPreparedWorksiteSyncItemStatusCopy(item);
  }

  getPreparedWorksiteSyncItemTitle(item: PreparedWorksiteSyncItem): string {
    return `${this.getPreparedWorksiteSyncEntityLabel(item.entityName)} · ${this.getPreparedWorksiteSyncItemKindLabel(item)}`;
  }

  getPreparedWorksiteSyncItemKindLabel(item: PreparedWorksiteSyncItem): string {
    if (item.kind === "media_upload") {
      return "média à envoyer";
    }
    return item.mutationOperation === "delete" ? "suppression" : "mise à jour";
  }

  getPreparedWorksiteSyncEntityLabel(entityName: PreparedWorksiteSyncItem["entityName"]): string {
    switch (entityName) {
      case "worksite_equipment_movement":
        return "Mouvement équipement";
      case "worksite_proof":
        return "Photo preuve";
      case "worksite_voice_note":
        return "Note vocale";
      case "worksite_safety_checklist":
        return "Checklist sécurité";
      case "worksite_risk_report":
        return "Signalement de risque";
      case "worksite_signature":
        return "Signature simple";
    }
  }

  getWorksiteStatusLabel(status: WorksiteSummary["status"]): string {
    switch (status) {
      case "planned":
        return "prévu";
      case "in_progress":
        return "en cours";
      case "blocked":
        return "à débloquer";
      case "completed":
        return "terminé";
    }
  }

  getWorksiteStatusTone(status: WorksiteSummary["status"]): "calm" | "progress" | "warning" | "success" {
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

  getWorksiteOfflineLabel(worksite: Pick<WorksiteSummary, "is_offline_ready">): string {
    return worksite.is_offline_ready ? "prêt hors ligne" : "à préparer";
  }

  getWorksiteEquipmentStatusLabel(status: WorksiteEquipmentStatus): string {
    switch (status) {
      case "ready":
        return "prêt";
      case "attention":
        return "à vérifier";
      case "unavailable":
        return "indisponible";
    }
  }

  getWorksiteEquipmentStatusTone(
    status: WorksiteEquipmentStatus
  ): "success" | "warning" | "danger" {
    switch (status) {
      case "ready":
        return "success";
      case "attention":
        return "warning";
      case "unavailable":
        return "danger";
    }
  }

  getEquipmentMovementTypeLabel(type: WorksiteEquipmentMovementType): string {
    switch (type) {
      case "assigned_to_worksite":
        return "Affecté au chantier";
      case "removed_from_worksite":
        return "Retiré du chantier";
      case "marked_damaged":
        return "Signalé comme endommagé";
    }
  }

  getEquipmentMovementSyncStatus(movement: WorksiteEquipmentMovement): SyncStatusCopy {
    return getTerrainObjectSyncStatusCopy(
      movement.sync_status,
      this.getRelatedSyncOperations("worksite_equipment_movement", movement.id)
    );
  }

  getLatestEquipmentMovement(
    worksite: WorksiteEssentialDetail,
    equipmentId: string
  ): WorksiteEquipmentMovement | null {
    return worksite.recent_equipment_movements.find(
      (movement) => movement.equipment_id === equipmentId
    ) ?? null;
  }

  getProofSyncStatus(proof: WorksiteProofSummary): SyncStatusCopy {
    return getTerrainObjectSyncStatusCopy(
      proof.sync_status,
      this.getRelatedSyncOperations("worksite_proof", proof.id)
    );
  }

  getVoiceNoteSyncStatus(voiceNote: WorksiteVoiceNoteSummary): SyncStatusCopy {
    return getTerrainObjectSyncStatusCopy(
      voiceNote.sync_status,
      this.getRelatedSyncOperations("worksite_voice_note", voiceNote.id)
    );
  }

  getSignatureSyncStatus(signature: WorksiteSignatureSummary): SyncStatusCopy {
    return getTerrainObjectSyncStatusCopy(
      signature.sync_status,
      this.getRelatedSyncOperations("worksite_signature", signature.id)
    );
  }

  getRiskTypeLabel(type: WorksiteRiskType): string {
    switch (type) {
      case "slip":
        return "Glissade ou chute de plain-pied";
      case "fall":
        return "Chute de hauteur";
      case "electrical":
        return "Risque électrique";
      case "traffic":
        return "Circulation ou engin";
      case "other":
        return "Autre risque";
    }
  }

  getRiskSeverityLabel(severity: WorksiteRiskSeverity): string {
    switch (severity) {
      case "low":
        return "gravité faible";
      case "medium":
        return "gravité moyenne";
      case "high":
        return "gravité haute";
    }
  }

  getRiskSeverityTone(
    severity: WorksiteRiskSeverity
  ): "calm" | "warning" | "danger" {
    switch (severity) {
      case "low":
        return "calm";
      case "medium":
        return "warning";
      case "high":
        return "danger";
    }
  }

  getRiskReportSyncStatus(report: WorksiteRiskReport): SyncStatusCopy {
    return getTerrainObjectSyncStatusCopy(
      report.sync_status,
      this.getRelatedSyncOperations("worksite_risk_report", report.id)
    );
  }

  getSafetyChecklistStatusLabel(status: WorksiteSafetyChecklist["status"]): string {
    return status === "validated" ? "validé" : "brouillon";
  }

  getSafetyChecklistStatusTone(
    status: WorksiteSafetyChecklist["status"]
  ): "calm" | "success" {
    return status === "validated" ? "success" : "calm";
  }

  getSafetyChecklistSyncStatus(checklist: WorksiteSafetyChecklist): SyncStatusCopy {
    return getTerrainObjectSyncStatusCopy(
      checklist.sync_status,
      this.getRelatedSyncOperations("worksite_safety_checklist", checklist.id)
    );
  }

  private getRelatedSyncOperations(entityName: string, entityId: string): LocalSyncOperation[] {
    return this.localSyncOperations.filter(
      (operation) => operation.entityName === entityName && operation.entityId === entityId
    );
  }

  getAnsweredSafetyChecklistCount(checklist: WorksiteSafetyChecklist): number {
    return checklist.items.filter((item) => item.answer !== null).length;
  }

  canValidateSafetyChecklist(checklist: WorksiteSafetyChecklist): boolean {
    return checklist.items.every((item) => item.answer !== null);
  }

  setSafetyChecklistAnswer(
    itemId: string,
    answer: WorksiteSafetyChecklistAnswer
  ): void {
    if (!this.worksiteSafetyChecklistDraft) {
      return;
    }

    this.worksiteSafetyChecklistDraft = {
      ...this.worksiteSafetyChecklistDraft,
      status:
        this.worksiteSafetyChecklistDraft.status === "validated"
          ? "draft"
          : this.worksiteSafetyChecklistDraft.status,
      items: this.worksiteSafetyChecklistDraft.items.map((item) =>
        item.id === itemId ? { ...item, answer } : item
      )
    };
  }

  setSafetyChecklistComment(value: string): void {
    if (!this.worksiteSafetyChecklistDraft) {
      return;
    }

    this.worksiteSafetyChecklistDraft = {
      ...this.worksiteSafetyChecklistDraft,
      status:
        this.worksiteSafetyChecklistDraft.status === "validated"
          ? "draft"
          : this.worksiteSafetyChecklistDraft.status,
      comment_text: value.trim().length > 0 ? value : ""
    };
  }

  getWorksiteProofCommentDraft(proof: WorksiteProofSummary): string {
    return this.worksiteProofCommentDrafts[proof.id] ?? proof.comment_text ?? "";
  }

  setWorksiteProofCommentDraft(proofId: string, value: string): void {
    this.worksiteProofCommentDrafts = {
      ...this.worksiteProofCommentDrafts,
      [proofId]: value
    };
  }

  hasPendingProofCommentChange(proof: WorksiteProofSummary): boolean {
    return this.normalizeProofComment(this.getWorksiteProofCommentDraft(proof))
      !== this.normalizeProofComment(proof.comment_text ?? "");
  }

  canSaveWorksiteSignature(): boolean {
    return Boolean(this.selectedWorksiteId && this.worksiteSignatureHasStroke);
  }

  canSaveWorksiteRiskReport(): boolean {
    return Boolean(this.selectedWorksiteId && this.worksiteRiskNote.trim().length > 0);
  }

  getChecklistStatusLabel(status: WorksiteEssentialDetail["checklist_today"][number]["status"]): string {
    switch (status) {
      case "todo":
        return "à faire";
      case "done":
        return "fait";
      case "attention":
        return "à vérifier";
    }
  }

  async selectWorksite(worksiteId: string): Promise<void> {
    this.selectedWorksiteId = worksiteId;
    this.worksiteError = "";
    this.worksiteFeedback = "";
    this.resetWorksiteSignatureDraft();
    this.resetWorksiteRiskDraft();
    await this.refreshSelectedWorksiteDetail();
  }

  async prepareWorksiteOffline(worksiteId: string): Promise<void> {
    const organizationId = this.currentMembership?.organization.id ?? null;
    this.preparingWorksiteId = worksiteId;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      await mobileLocalDatabase.prepareWorksiteForOffline(organizationId, worksiteId);
      await this.refreshLocalDatabaseView();
      this.worksiteFeedback = "Chantier prêt hors ligne sur cet appareil.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      this.preparingWorksiteId = null;
    }
  }

  async recordWorksiteEquipmentMovement(
    worksiteId: string,
    equipment: WorksiteEquipment,
    movementType: WorksiteEquipmentMovementType
  ): Promise<void> {
    const organizationId = this.currentMembership?.organization.id ?? null;
    if (!organizationId) {
      this.worksiteError = "Aucune organisation sélectionnée pour enregistrer ce mouvement d’équipement.";
      return;
    }

    this.worksiteEquipmentMovementBusyId = equipment.id;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      await mobileLocalDatabase.createWorksiteEquipmentMovement({
        organizationId,
        worksiteId,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentType: equipment.type,
        movementType,
        capturedAt: new Date().toISOString(),
        actorUserId: this.session?.user.id ?? null,
        actorDisplayName:
          this.session?.user.display_name
          || this.session?.user.email
          || null
      });
      await this.refreshLocalDatabaseView();
      this.worksiteFeedback = "Mouvement enregistré sur l’appareil et en attente de synchronisation.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      this.worksiteEquipmentMovementBusyId = null;
    }
  }

  async handleWorksiteProofCapture(event: Event, worksiteId: string): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    this.worksiteProofCaptureBusy = true;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Le fichier sélectionné n'est pas une image.");
      }

      const organizationId = this.currentMembership?.organization.id ?? null;
      const capturedAt = new Date().toISOString();
      const fileName = file.name && file.name.length > 0 ? file.name : `preuve-${Date.now()}.jpg`;
      const localUri = await this.readFileAsDataUrl(file);

      await mobileLocalDatabase.captureWorksiteProof({
        organizationId,
        worksiteId,
        fileName,
        localUri,
        mimeType: file.type || "image/jpeg",
        sizeBytes: file.size || null,
        capturedAt
      });
      await this.refreshLocalDatabaseView();
      this.worksiteFeedback = "Preuve enregistrée sur l’appareil et en attente de synchronisation.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      if (input) {
        input.value = "";
      }
      this.worksiteProofCaptureBusy = false;
    }
  }

  async handleWorksiteVoiceNoteCapture(event: Event, worksiteId: string): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    this.worksiteVoiceNoteCaptureBusy = true;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      if (file.type && !file.type.startsWith("audio/")) {
        throw new Error("Le fichier sélectionné n'est pas un enregistrement audio.");
      }

      const organizationId = this.currentMembership?.organization.id ?? null;
      const capturedAt = new Date().toISOString();
      const fileName = file.name && file.name.length > 0 ? file.name : `note-vocale-${Date.now()}.webm`;
      const localUri = await this.readFileAsDataUrl(file);

      await mobileLocalDatabase.captureWorksiteVoiceNote({
        organizationId,
        worksiteId,
        fileName,
        localUri,
        mimeType: file.type || "audio/webm",
        sizeBytes: file.size || null,
        capturedAt,
        durationSeconds: await this.readAudioDuration(localUri)
      });
      await this.refreshLocalDatabaseView();
      this.worksiteFeedback = "Note vocale enregistrée sur l’appareil et en attente de synchronisation.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      if (input) {
        input.value = "";
      }
      this.worksiteVoiceNoteCaptureBusy = false;
    }
  }

  startWorksiteSignatureStroke(event: PointerEvent, canvas: HTMLCanvasElement): void {
    this.prepareSignatureCanvas(canvas);
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const point = this.getSignatureCanvasPoint(event, canvas);
    this.worksiteSignatureDrawing = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    this.worksiteSignatureHasStroke = true;
  }

  moveWorksiteSignatureStroke(event: PointerEvent, canvas: HTMLCanvasElement): void {
    if (!this.worksiteSignatureDrawing) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const point = this.getSignatureCanvasPoint(event, canvas);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  endWorksiteSignatureStroke(event: PointerEvent, canvas: HTMLCanvasElement): void {
    if (!this.worksiteSignatureDrawing) {
      return;
    }

    this.worksiteSignatureDrawing = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    const context = canvas.getContext("2d");
    context?.closePath();
  }

  clearWorksiteSignatureCanvas(canvas: HTMLCanvasElement): void {
    this.prepareSignatureCanvas(canvas, true);
    this.worksiteSignatureHasStroke = false;
    this.worksiteSignatureDrawing = false;
  }

  async saveWorksiteSignature(
    worksiteId: string,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    const organizationId = this.currentMembership?.organization.id ?? null;
    if (!organizationId) {
      this.worksiteError = "Aucune organisation sélectionnée pour enregistrer cette signature.";
      return;
    }

    if (!this.canSaveWorksiteSignature()) {
      this.worksiteError = "Trace une signature avant de l’enregistrer.";
      return;
    }

    this.worksiteSignatureCaptureBusy = true;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      this.prepareSignatureCanvas(canvas);
      const capturedAt = new Date().toISOString();
      const localUri = canvas.toDataURL("image/png");
      await mobileLocalDatabase.captureWorksiteSignature({
        organizationId,
        worksiteId,
        fileName: `signature-${capturedAt.replace(/[:.]/g, "-")}.png`,
        localUri,
        mimeType: "image/png",
        sizeBytes: this.estimateDataUrlSize(localUri),
        capturedAt
      });
      this.clearWorksiteSignatureCanvas(canvas);
      await this.refreshLocalDatabaseView();
      this.worksiteFeedback = "Signature enregistrée sur l’appareil et en attente de synchronisation.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      this.worksiteSignatureCaptureBusy = false;
    }
  }

  async handleWorksiteRiskPhotoSelection(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    this.worksiteRiskReportBusy = true;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Le fichier sélectionné n'est pas une image.");
      }

      this.worksiteRiskPhotoDraft = {
        fileName: file.name && file.name.length > 0 ? file.name : `signalement-${Date.now()}.jpg`,
        localUri: await this.readFileAsDataUrl(file),
        mimeType: file.type || "image/jpeg",
        sizeBytes: file.size || null
      };
      this.worksiteFeedback = "Photo liée au signalement prête sur l’appareil.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      if (input) {
        input.value = "";
      }
      this.worksiteRiskReportBusy = false;
    }
  }

  clearWorksiteRiskPhotoDraft(): void {
    this.worksiteRiskPhotoDraft = null;
  }

  async saveWorksiteProofComment(proof: WorksiteProofSummary): Promise<void> {
    const organizationId = this.currentMembership?.organization.id ?? null;
    if (!organizationId) {
      this.worksiteError = "Aucune organisation sélectionnée pour enregistrer ce commentaire.";
      return;
    }

    this.worksiteProofCommentBusyId = proof.id;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      const updatedProof = await mobileLocalDatabase.updateWorksiteProofComment({
        organizationId,
        proofId: proof.id,
        commentText: this.getWorksiteProofCommentDraft(proof)
      });
      this.worksiteProofCommentDrafts = {
        ...this.worksiteProofCommentDrafts,
        [proof.id]: updatedProof.comment_text ?? ""
      };
      await this.refreshLocalDatabaseView();
      this.worksiteFeedback = "Commentaire enregistré sur l’appareil et en attente de synchronisation.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      this.worksiteProofCommentBusyId = null;
    }
  }

  async saveWorksiteRiskReport(): Promise<void> {
    const organizationId = this.currentMembership?.organization.id ?? null;
    if (!organizationId || !this.selectedWorksiteId) {
      this.worksiteError = "Aucun chantier sélectionné pour enregistrer ce signalement.";
      return;
    }

    if (!this.canSaveWorksiteRiskReport()) {
      this.worksiteError = "Ajoute au moins une note courte pour enregistrer ce signalement.";
      return;
    }

    this.worksiteRiskReportBusy = true;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      await mobileLocalDatabase.createWorksiteRiskReport({
        organizationId,
        worksiteId: this.selectedWorksiteId,
        riskType: this.worksiteRiskType,
        severity: this.worksiteRiskSeverity,
        noteText: this.worksiteRiskNote,
        capturedAt: new Date().toISOString(),
        photoFileName: this.worksiteRiskPhotoDraft?.fileName ?? null,
        photoLocalUri: this.worksiteRiskPhotoDraft?.localUri ?? null,
        photoMimeType: this.worksiteRiskPhotoDraft?.mimeType ?? null,
        photoSizeBytes: this.worksiteRiskPhotoDraft?.sizeBytes ?? null
      });
      this.resetWorksiteRiskDraft();
      await this.refreshLocalDatabaseView();
      this.worksiteFeedback = "Signalement enregistré sur l’appareil et en attente de synchronisation.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      this.worksiteRiskReportBusy = false;
    }
  }

  async saveSafetyChecklist(targetStatus: WorksiteSafetyChecklist["status"]): Promise<void> {
    const organizationId = this.currentMembership?.organization.id ?? null;
    const draft = this.worksiteSafetyChecklistDraft;
    if (!organizationId || !this.selectedWorksiteId || !draft) {
      this.worksiteError = "Aucun chantier sélectionné pour enregistrer la checklist sécurité.";
      return;
    }

    if (targetStatus === "validated" && !this.canValidateSafetyChecklist(draft)) {
      this.worksiteError = "Réponds aux points de sécurité avant de valider la checklist.";
      return;
    }

    this.worksiteSafetyChecklistBusy = true;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      const updatedChecklist = await mobileLocalDatabase.saveWorksiteSafetyChecklist({
        organizationId,
        worksiteId: this.selectedWorksiteId,
        status: targetStatus,
        commentText: draft.comment_text,
        items: draft.items
      });
      this.worksiteSafetyChecklistDraft = updatedChecklist;
      await this.refreshLocalDatabaseView();
      this.worksiteFeedback =
        targetStatus === "validated"
          ? "Checklist validée sur l’appareil et en attente de synchronisation."
          : "Checklist enregistrée sur l’appareil et en attente de synchronisation.";
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      this.worksiteSafetyChecklistBusy = false;
    }
  }

  async refreshWorksiteSummariesFromApi(options: { silentIfOffline?: boolean } = {}): Promise<void> {
    if (!this.accessToken || !this.currentMembership?.organization.id) {
      return;
    }

    if (!this.isDeviceOnline) {
      if (!options.silentIfOffline) {
        this.worksiteError = "Pas de réseau : les chantiers déjà importés restent consultables sur l’appareil.";
      }
      return;
    }

    this.worksiteImportBusy = true;
    this.worksiteError = "";
    this.worksiteFeedback = "";

    try {
      const organizationId = this.currentMembership.organization.id;
      const summaries = await fetchWorksiteSummaries(this.accessToken, organizationId);
      await mobileLocalDatabase.importWorksiteSummaries(organizationId, summaries);
      await this.refreshLocalDatabaseView();
      if (!options.silentIfOffline) {
        this.worksiteFeedback = "Chantiers mis à jour sur l’appareil et synchronisés pour le moment.";
      }
    } catch (error) {
      this.worksiteError = this.toErrorMessage(error);
    } finally {
      this.worksiteImportBusy = false;
    }
  }

  logout(): void {
    clearSession();
    this.accessToken = null;
    this.selectedOrganizationId = null;
    this.session = null;
    this.errorMessage = "";
    this.worksiteSummaries = [];
    this.selectedWorksiteId = null;
    this.selectedWorksiteDetail = null;
    this.worksiteProofCommentDrafts = {};
    this.worksiteSafetyChecklistDraft = null;
    this.preparedWorksiteSyncBatch = null;
    this.resetWorksiteSignatureDraft();
    this.resetWorksiteRiskDraft();
    this.worksiteLastImportedAt = null;
    this.worksiteError = "";
    this.localDatabaseFeedback = "";
    this.worksiteFeedback = "";
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
      await this.refreshLocalDatabaseView();
      await this.refreshWorksiteSummariesFromApi({ silentIfOffline: true });
    } catch (error) {
      this.logout();
      this.errorMessage = this.toErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  private async initializeLocalDatabase(): Promise<void> {
    try {
      await mobileLocalDatabase.initialize();
      await this.refreshLocalDatabaseView();
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    }
  }

  private async refreshLocalDatabaseView(): Promise<void> {
    const organizationId = this.currentMembership?.organization.id ?? null;

    this.localDatabaseStatus = await mobileLocalDatabase.getStatus();
    this.localDrafts = await mobileLocalDatabase.listLocalRecords("field_draft", organizationId);
    this.localPhotos = await mobileLocalDatabase.listLocalFileReferences({
      organizationId,
      ownerEntityName: "document_draft",
      limit: 6
    });
    this.localSyncOperations = await mobileLocalDatabase.listSyncOperations({
      organizationId,
      limit: 12
    });
    this.preparedWorksiteSyncBatch = await mobileLocalDatabase.buildPreparedWorksiteSyncBatch(
      organizationId,
      12
    );
    this.worksiteSummaries = await mobileLocalDatabase.listWorksiteSummaries(organizationId);
    this.worksiteLastImportedAt = await mobileLocalDatabase.getWorksiteLastImportAt(organizationId);

    if (this.worksiteSummaries.length === 0) {
      this.selectedWorksiteId = null;
      this.selectedWorksiteDetail = null;
      this.worksiteProofCommentDrafts = {};
      this.worksiteSafetyChecklistDraft = null;
      this.resetWorksiteSignatureDraft();
      this.resetWorksiteRiskDraft();
      return;
    }

    if (!this.selectedWorksiteId || !this.worksiteSummaries.some((worksite) => worksite.id === this.selectedWorksiteId)) {
      this.selectedWorksiteId = this.worksiteSummaries[0]?.id ?? null;
      this.resetWorksiteSignatureDraft();
      this.resetWorksiteRiskDraft();
    }

    await this.refreshSelectedWorksiteDetail();
  }

  private async refreshSelectedWorksiteDetail(): Promise<void> {
    const organizationId = this.currentMembership?.organization.id ?? null;
    if (!organizationId || !this.selectedWorksiteId) {
      this.selectedWorksiteDetail = null;
      this.worksiteProofCommentDrafts = {};
      this.worksiteSafetyChecklistDraft = null;
      this.resetWorksiteSignatureDraft();
      this.resetWorksiteRiskDraft();
      return;
    }

    this.selectedWorksiteDetail = await mobileLocalDatabase.getWorksiteEssentialDetail(
      organizationId,
      this.selectedWorksiteId
    );
    this.syncWorksiteProofCommentDrafts(this.selectedWorksiteDetail);
    this.worksiteSafetyChecklistDraft = this.selectedWorksiteDetail?.safety_checklist ?? null;
  }

  private syncWorksiteProofCommentDrafts(detail: WorksiteEssentialDetail | null): void {
    const nextDrafts: Record<string, string> = {};

    for (const proof of detail?.recent_proofs ?? []) {
      nextDrafts[proof.id] = this.worksiteProofCommentDrafts[proof.id] ?? proof.comment_text ?? "";
    }

    this.worksiteProofCommentDrafts = nextDrafts;
  }

  private resetWorksiteSignatureDraft(): void {
    this.worksiteSignatureHasStroke = false;
    this.worksiteSignatureDrawing = false;
    this.resetVisibleWorksiteSignatureCanvas();
  }

  private resetWorksiteRiskDraft(): void {
    this.worksiteRiskType = this.defaultWorksiteRiskType;
    this.worksiteRiskSeverity = this.defaultWorksiteRiskSeverity;
    this.worksiteRiskNote = "";
    this.worksiteRiskPhotoDraft = null;
  }

  private normalizeProofComment(value: string): string {
    return value.trim();
  }

  private prepareSignatureCanvas(
    canvas: HTMLCanvasElement,
    forceClear = false
  ): void {
    const displayWidth = Math.max(Math.floor(canvas.clientWidth), 280);
    const displayHeight = Math.max(Math.floor(canvas.clientHeight), 180);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      forceClear = true;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.5;
    context.strokeStyle = "#10312f";

    if (forceClear) {
      context.fillStyle = "#fffdfa";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  private getSignatureCanvasPoint(
    event: PointerEvent,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  private estimateDataUrlSize(dataUrl: string): number | null {
    const commaIndex = dataUrl.indexOf(",");
    if (commaIndex < 0) {
      return null;
    }

    const base64Length = dataUrl.slice(commaIndex + 1).length;
    return Math.floor((base64Length * 3) / 4);
  }

  private resetVisibleWorksiteSignatureCanvas(): void {
    if (this.worksiteSignatureCanvasElement) {
      this.prepareSignatureCanvas(this.worksiteSignatureCanvasElement, true);
    }
  }

  private async resolveQueueTargetRecordId(): Promise<string> {
    if (this.queueTargetRecordId.trim().length > 0) {
      return this.queueTargetRecordId.trim();
    }

    if (this.queueOperationType === "create") {
      return `draft-${Date.now()}`;
    }

    const latestDraft = this.localDrafts[0];
    if (latestDraft) {
      return latestDraft.recordId;
    }

    throw new Error(
      "Crée d'abord un brouillon local pour tester cette opération de synchronisation."
    );
  }

  private buildQueuePayload(
    operationType: LocalSyncOperationType,
    targetRecordId: string
  ): Record<string, unknown> {
    switch (operationType) {
      case "create":
        return {
          title: `Brouillon ${targetRecordId}`,
          body: "Creation locale preparee pour la future synchronisation distante.",
          source: "sync_queue_demo"
        };
      case "update":
        return {
          patch: {
            title: `Brouillon ${targetRecordId} modifie`
          }
        };
      case "delete_soft":
        return {
          deleted_at: new Date().toISOString()
        };
      case "upload_media":
        return {
          file_id: `media-${Date.now()}`,
          local_uri: "file://demo/offline-media.jpg",
          mime_type: "image/jpeg"
        };
      case "status_change":
        return {
          field: "status",
          from: "draft",
          to: "ready_for_sync"
        };
    }
  }

  private toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
  }

  private createLocalId(prefix: string): string {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("La lecture locale de la photo a échoué."));
      };
      reader.onerror = () => reject(new Error("La lecture locale de la photo a échoué."));
      reader.readAsDataURL(file);
    });
  }

  private readAudioDuration(localUri: string): Promise<number | null> {
    if (typeof Audio === "undefined") {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        resolve(Number.isFinite(audio.duration) ? audio.duration : null);
      };
      audio.onerror = () => resolve(null);
      audio.src = localUri;
    });
  }
}
