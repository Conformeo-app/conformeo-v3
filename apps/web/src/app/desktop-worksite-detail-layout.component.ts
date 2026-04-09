import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent } from "@conformeo/ui";
import { combineLatest, map } from "rxjs";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";

@Component({
  selector: "cfm-desktop-worksite-detail-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CfmButtonComponent,
    CfmEmptyStateComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <ng-container *ngIf="detail$ | async as worksite; else emptyState">
      <section class="detail-page">
        <header class="worksite-hero">
          <div class="hero-topline">
            <a routerLink="/app/chantiers/liste" class="back-link">Registre chantiers</a>
            <span class="hero-kicker">Digital Foreman’s Ledger</span>
          </div>

          <div class="hero-body">
            <div class="hero-copy">
              <div class="hero-badges">
                <cfm-status-chip [label]="worksite.statusLabel" [tone]="worksite.statusTone" />
                <cfm-status-chip [label]="worksite.globalStateLabel" [tone]="worksite.globalStateTone" />
                <cfm-status-chip [label]="worksite.closure.statusLabel" [tone]="worksite.closure.statusTone" />
              </div>

              <h1>{{ worksite.name }}</h1>
              <p class="hero-summary">{{ worksite.summary }}</p>

              <div class="hero-facts">
                <span>{{ worksite.temporalLabel }}</span>
                <span>{{ worksite.siteName || "Site à relier" }}</span>
                <span>{{ worksite.siteAddress || "Adresse à préciser" }}</span>
              </div>
            </div>

            <div class="hero-actions-panel">
              <span class="small">Action suivante</span>
              <strong>{{ worksite.primaryActionLabel }}</strong>
              <span>{{ worksite.primaryActionDetail }}</span>
              <div class="hero-actions">
                <cfm-button type="button" size="sm" [routerLink]="worksite.primaryActionRoute">
                  {{ worksite.primaryActionLabel }}
                </cfm-button>
                <cfm-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  [disabled]="(facade.summaryPdfBusyId$ | async) === worksite.id"
                  (click)="facade.downloadSummaryPdf(worksite.id)"
                >
                  {{ (facade.summaryPdfBusyId$ | async) === worksite.id ? "Génération..." : "Fiche PDF" }}
                </cfm-button>
              </div>
            </div>
          </div>
        </header>

        <nav class="detail-subnav">
          <a [routerLink]="['/app/chantiers', worksite.id, 'apercu']" routerLinkActive="is-active" class="detail-subnav-link">
            Aperçu
          </a>
          <a [routerLink]="['/app/chantiers', worksite.id, 'dossier']" routerLinkActive="is-active" class="detail-subnav-link">
            Dossier
          </a>
          <a [routerLink]="['/app/chantiers', worksite.id, 'documents']" routerLinkActive="is-active" class="detail-subnav-link">
            Documents
          </a>
          <a [routerLink]="['/app/chantiers', worksite.id, 'preuves']" routerLinkActive="is-active" class="detail-subnav-link">
            Preuves
          </a>
          <a [routerLink]="['/app/chantiers', worksite.id, 'coordination']" routerLinkActive="is-active" class="detail-subnav-link">
            Coordination
          </a>
          <a [routerLink]="['/app/chantiers', worksite.id, 'equipements']" routerLinkActive="is-active" class="detail-subnav-link">
            Équipements
          </a>
        </nav>

        <section class="detail-context-strip">
          <article class="context-item">
            <span class="small">Équipe chantier</span>
            <strong>{{ worksite.coordination.teamName }}</strong>
            <span>{{ worksite.coordination.assigneeLabel }} · {{ worksite.coordination.coverageLabel }}</span>
          </article>

          <article class="context-item">
            <span class="small">Intervention</span>
            <strong>{{ worksite.planning.nextInterventionLabel }}</strong>
            <span>{{ worksite.planning.nextInterventionStatusLabel }} · {{ worksite.planning.nextInterventionTimingLabel }}</span>
          </article>

          <article class="context-item">
            <span class="small">Documents & preuves</span>
            <strong>{{ worksite.documentsCountLabel }}</strong>
            <span>{{ worksite.proofsCountLabel }} · {{ worksite.signaturesCountLabel }}</span>
          </article>

          <article class="context-item">
            <span class="small">Remise client</span>
            <strong>{{ worksite.closure.statusLabel }}</strong>
            <span>{{ worksite.closure.summary }}</span>
          </article>
        </section>

        <section class="detail-content-stage">
          <router-outlet />
        </section>
      </section>
    </ng-container>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Chantier introuvable"
        description="Le chantier demandé n’est pas disponible ou n’est plus visible dans cette organisation."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .detail-page,
      .hero-copy,
      .hero-actions-panel,
      .context-item,
      .detail-content-stage {
        display: grid;
        gap: 0.5rem;
      }

      .detail-page {
        gap: 0.9rem;
      }

      .worksite-hero {
        display: grid;
        gap: 1.15rem;
        padding: 1.55rem 1.7rem 1.5rem 1.9rem;
        border-radius: 34px;
        background:
          radial-gradient(circle at 100% 0%, rgba(255, 222, 165, 0.2), transparent 22%),
          radial-gradient(circle at 14% 18%, rgba(39, 54, 103, 0.34), transparent 42%),
          linear-gradient(135deg, #0a1128 0%, #141a32 100%);
        color: var(--cfm-color-copy-on-dark);
        box-shadow: 0 20px 40px rgba(10, 17, 40, 0.06);
      }

      .hero-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
      }

      .back-link,
      .hero-kicker {
        text-decoration: none;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted-on-dark);
      }

      .back-link:hover {
        color: var(--cfm-color-copy-on-dark);
      }

      .hero-body {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(17rem, 0.68fr);
        gap: 1.35rem;
        align-items: end;
      }

      .hero-badges,
      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        align-items: center;
      }

      .hero-copy h1 {
        margin: 0;
        font-family: var(--cfm-font-display);
        font-size: clamp(3.3rem, 6.2vw, 5.3rem);
        line-height: 0.88;
        letter-spacing: -0.055em;
        color: var(--cfm-color-copy-on-dark);
      }

      .hero-summary {
        margin: 0;
        max-width: 42rem;
        color: var(--cfm-color-copy-muted-on-dark);
        font-size: 1rem;
        line-height: 1.6;
      }

      .hero-facts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 0.95rem;
        color: var(--cfm-color-copy-muted-on-dark);
        font-size: 0.86rem;
      }

      .hero-facts span {
        position: relative;
      }

      .hero-facts span + span::before {
        content: "·";
        position: absolute;
        left: -0.58rem;
        color: rgba(244, 246, 251, 0.34);
      }

      .hero-actions-panel {
        padding: 1rem 1.05rem;
        border-radius: 22px;
        background: rgba(248, 249, 252, 0.1);
        box-shadow: inset 0 0 0 1px rgba(244, 246, 251, 0.08);
      }

      .hero-actions-panel strong {
        color: var(--cfm-color-copy-on-dark);
        font-weight: var(--cfm-font-weight-semibold, 600);
        font-size: 1.04rem;
      }

      .hero-actions-panel span:not(.small) {
        color: var(--cfm-color-copy-muted-on-dark);
        line-height: 1.55;
      }

      .detail-subnav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        align-items: center;
        padding: 0.1rem 0;
      }

      .detail-subnav-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 2.05rem;
        padding: 0.32rem 0.68rem;
        border-radius: 999px;
        text-decoration: none;
        color: var(--cfm-color-copy-muted);
        background: transparent;
        transition:
          background-color 160ms ease,
          color 160ms ease;
      }

      .detail-subnav-link.is-active {
        color: var(--cfm-color-ink);
        background: rgba(255, 255, 255, 0.84);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cfm-color-outline-ghost) 44%, white);
      }

      .detail-context-strip {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem 1rem;
        padding: 0.15rem 0 0.2rem;
      }

      .context-item {
        gap: 0.14rem;
        padding: 0.05rem 0;
      }

      .context-item strong {
        color: var(--cfm-color-ink);
        font-weight: var(--cfm-font-weight-medium, 500);
      }

      @media (max-width: 1180px) {
        .hero-body,
        .detail-context-strip {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 860px) {
        .worksite-hero {
          padding: 1.25rem 1.15rem 1.2rem 1.22rem;
          border-radius: 26px;
        }

        .hero-topline {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class DesktopWorksiteDetailLayoutComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly worksiteId$ = this.route.paramMap.pipe(map((params) => params.get("worksiteId")));
  readonly detail$ = this.facade.detail$(this.worksiteId$);

  constructor() {
    combineLatest([this.worksiteId$, this.facade.listItems$, this.detail$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([worksiteId, items, detail]) => {
        if (!worksiteId || detail || items.length === 0) {
          return;
        }

        void this.router.navigate(["/app/chantiers", items[0].id, "apercu"], { replaceUrl: true });
      });
  }
}
