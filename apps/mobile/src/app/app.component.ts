import { CommonModule } from "@angular/common";
import { Component, OnDestroy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { AuthSession, MembershipAccess } from "@conformeo/contracts";
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
import type {
  LocalDatabaseStatus,
  LocalFileReference,
  LocalRecord,
  LocalSyncOperation,
  LocalSyncOperationType
} from "./local-database.types";
import {
  getGlobalSyncStatusCopy,
  getOperationSyncStatusCopy,
  getRecordSyncStatusCopy,
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
          <ion-badge color="success">Sprint 0</ion-badge>
          <h1>Connexion mobile et contexte d'organisation</h1>
          <p>
            Cette surface Ionic prépare la connexion terrain, le choix d'organisation et la lecture du
            contexte d'accès sans encore ouvrir les flux métier.
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
                  <strong>Ops en queue</strong>
                  <span>{{ status.syncOperationCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>En attente</strong>
                  <span>{{ status.pendingSyncOperationCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>Échecs</strong>
                  <span>{{ status.failedSyncOperationCount }}</span>
                </div>
                <div class="database-stat">
                  <strong>Retry prêtes</strong>
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
                <strong>Queue locale de synchronisation</strong>
                <p class="supporting-copy">
                  Cette file locale prépare les futures opérations offline-first. Les écritures restent locales
                  mais chaque opération garde son type, son statut, ses tentatives et son dernier échec.
                </p>

                <form class="draft-form" (ngSubmit)="enqueueExampleOperation()">
                  <label>
                    <span>Type d'opération</span>
                    <select [(ngModel)]="queueOperationType" name="queueOperationType">
                      <option *ngFor="let operationType of supportedOperationTypes" [value]="operationType">
                        {{ operationType }}
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Record cible</span>
                    <input
                      [(ngModel)]="queueTargetRecordId"
                      name="queueTargetRecordId"
                      type="text"
                      placeholder="Laisser vide pour utiliser le dernier brouillon"
                    />
                  </label>

                  <ion-button expand="block" type="submit" [disabled]="syncQueueBusy">
                    {{ syncQueueBusy ? "Ajout..." : "Ajouter à la queue locale" }}
                  </ion-button>
                </form>

                <ul class="queue-list" *ngIf="localSyncOperations.length > 0">
                  <li *ngFor="let operation of localSyncOperations">
                    <ng-container *ngIf="getOperationSyncStatus(operation) as operationSyncStatus">
                      <div class="queue-meta">
                        <strong>{{ operation.operationType }} · {{ operation.entityName }}</strong>
                        <span>
                          {{ operationSyncStatus.label }} · tentative {{ operation.attempts }}/{{ operation.maxAttempts }}
                        </span>
                        <small>{{ operation.entityId }}</small>
                        <small>{{ operationSyncStatus.detail }}</small>
                        <small *ngIf="operation.nextAttemptAt">
                          prochain passage {{ operation.nextAttemptAt | date: "short" }}
                        </small>
                        <small *ngIf="operation.lastErrorMessage">
                          dernier souci : {{ operation.lastErrorMessage }}
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
                        Replanifier
                      </ion-button>

                      <ion-button
                        size="small"
                        fill="outline"
                        color="success"
                        [disabled]="syncQueueBusy || operation.status === 'completed'"
                        (click)="completeOperation(operation)"
                      >
                        Marquer synchronisée
                      </ion-button>
                    </div>
                  </li>
                </ul>

                <cfm-empty-state
                  *ngIf="localSyncOperations.length === 0"
                  title="Queue locale vide"
                  description="Aucune opération n’attend encore de synchronisation dans ce socle Sprint 0."
                />
              </div>

              <p class="feedback error" *ngIf="localDatabaseError">{{ localDatabaseError }}</p>
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
              description="Le mobile reste centré sur le contexte d’accès, les permissions utiles et les modules actifs."
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
          radial-gradient(circle at top, rgba(88, 165, 149, 0.22), transparent 34%),
          linear-gradient(180deg, #f4f1ea, #edf5f2);
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
        padding: 0.95rem;
        border: 1px solid #bfd3cf;
        border-radius: 18px;
        background: #fffdfa;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .quick-capture-card.is-active {
        border-color: #1d6d64;
        box-shadow: 0 0 0 2px rgba(29, 109, 100, 0.12);
        background: #f4faf8;
      }

      .quick-capture-card span,
      .quick-capture-card small,
      .quick-capture-note {
        color: #486863;
      }

      .quick-capture-detail {
        display: grid;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 18px;
        background: #f5faf8;
        border: 1px solid #d7e6e1;
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
        padding: 0.85rem 0.95rem;
        border-radius: 16px;
        background: #fffdfa;
        border: 1px solid #dbe8e3;
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
        background: #fffdfa;
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
        padding: 0.8rem 0.9rem;
        border-radius: 16px;
        background: #f1f8f5;
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
        padding: 0.9rem 0;
        border-bottom: 1px solid #dbe8e3;
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
        margin-top: 0.45rem;
      }

      .feedback {
        margin-top: 1rem;
      }

      .feedback.error {
        color: #8a2d2d;
      }
    `
  ]
})
export class AppComponent implements OnDestroy {
  email = "";
  password = "";
  loading = false;
  errorMessage = "";
  localDatabaseBusy = false;
  photoCaptureBusy = false;
  syncQueueBusy = false;
  localDatabaseError = "";
  draftTitle = "";
  draftBody = "";
  queueOperationType: LocalSyncOperationType = "update";
  queueTargetRecordId = "";
  localDatabaseStatus: LocalDatabaseStatus | null = null;
  localDrafts: LocalRecord[] = [];
  localPhotos: LocalFileReference[] = [];
  localSyncOperations: LocalSyncOperation[] = [];
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
  private readonly handleOnline = () => {
    this.isDeviceOnline = true;
  };
  private readonly handleOffline = () => {
    this.isDeviceOnline = false;
  };

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

  async submitLogin(): Promise<void> {
    this.loading = true;
    this.errorMessage = "";

    try {
      const response = await login({
        email: this.email,
        password: this.password
      });
      this.accessToken = response.access_token;
      this.session = response.session;
      this.selectedOrganizationId = response.session.current_membership.organization.id;
      persistSession(response.access_token, response.session);
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async changeOrganization(): Promise<void> {
    await this.refreshSession(this.selectedOrganizationId);
  }

  async saveLocalDraft(): Promise<void> {
    this.localDatabaseBusy = true;
    this.localDatabaseError = "";

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
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      this.syncQueueBusy = false;
    }
  }

  async simulateOperationFailure(operation: LocalSyncOperation): Promise<void> {
    this.syncQueueBusy = true;
    this.localDatabaseError = "";

    try {
      const inProgress = operation.status === "in_progress"
        ? operation
        : await mobileLocalDatabase.markSyncOperationInProgress(operation.operationId);
      await mobileLocalDatabase.markSyncOperationFailed(inProgress.operationId, {
        code: "demo_network",
        message: "Echec reseau local simule pour Sprint 0."
      });
      await this.refreshLocalDatabaseView();
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      this.syncQueueBusy = false;
    }
  }

  async requeueOperation(operation: LocalSyncOperation): Promise<void> {
    this.syncQueueBusy = true;
    this.localDatabaseError = "";

    try {
      await mobileLocalDatabase.requeueSyncOperation(operation.operationId);
      await this.refreshLocalDatabaseView();
    } catch (error) {
      this.localDatabaseError = this.toErrorMessage(error);
    } finally {
      this.syncQueueBusy = false;
    }
  }

  async completeOperation(operation: LocalSyncOperation): Promise<void> {
    this.syncQueueBusy = true;
    this.localDatabaseError = "";

    try {
      await mobileLocalDatabase.markSyncOperationCompleted(operation.operationId);
      await this.refreshLocalDatabaseView();
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

  getDraftSyncStatus(record: LocalRecord): SyncStatusCopy {
    return getRecordSyncStatusCopy(record, this.localSyncOperations);
  }

  getOperationSyncStatus(operation: LocalSyncOperation): SyncStatusCopy {
    return getOperationSyncStatusCopy(operation);
  }

  logout(): void {
    clearSession();
    this.accessToken = null;
    this.selectedOrganizationId = null;
    this.session = null;
    this.errorMessage = "";
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
    this.localDatabaseStatus = await mobileLocalDatabase.getStatus();
    this.localDrafts = await mobileLocalDatabase.listLocalRecords(
      "field_draft",
      this.currentMembership?.organization.id
    );
    this.localPhotos = await mobileLocalDatabase.listLocalFileReferences({
      organizationId: this.currentMembership?.organization.id,
      ownerEntityName: "document_draft",
      limit: 6
    });
    this.localSyncOperations = await mobileLocalDatabase.listSyncOperations({
      organizationId: this.currentMembership?.organization.id,
      limit: 12
    });
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
}
