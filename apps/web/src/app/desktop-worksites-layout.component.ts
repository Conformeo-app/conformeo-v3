import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CfmButtonComponent } from "@conformeo/ui";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";

@Component({
  selector: "cfm-desktop-worksites-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CfmButtonComponent,
  ],
  providers: [DesktopWorksitesFacade],
  template: `
    <section class="worksites-module-page" [class.worksites-module-page--detail]="isWorksiteDetailRoute">
      <ng-container *ngIf="!isWorksiteDetailRoute">
        <header class="module-header-strip cfm-editorial-hero cfm-editorial-hero--calm" *ngIf="facade.moduleSummary$ | async as summary">
          <div class="module-title-block">
            <span class="module-kicker">Digital Foreman’s Ledger</span>
            <h2>Chantiers</h2>
            <p class="module-lead">
              Coordination, interventions, preuves et remise client dans une lecture chantier plus claire et plus haut de gamme.
            </p>
            <div class="module-context-line">
              <span>{{ facade.currentOrganizationName }}</span>
              <span>{{ summary.totalLabel }}</span>
              <span class="is-danger">{{ summary.blockedLabel }}</span>
              <span class="is-warning">{{ summary.nowLabel }}</span>
            </div>
          </div>

          <div class="module-action-row">
            <cfm-button *ngIf="facade.canActOnChantiers" type="button" size="sm" routerLink="/app/chantiers/nouveau">
              Nouveau chantier
            </cfm-button>
          </div>
        </header>
      </ng-container>

      <nav class="module-subnav cfm-soft-nav cfm-soft-nav--quiet">
        <a routerLink="/app/chantiers/liste" routerLinkActive="is-active" class="module-subnav-link cfm-soft-nav__link">
          Liste
        </a>
        <a
          *ngIf="facade.canActOnChantiers"
          routerLink="/app/chantiers/nouveau"
          routerLinkActive="is-active"
          class="module-subnav-link cfm-soft-nav__link"
        >
          Nouveau
        </a>
        <a routerLink="/app/chantiers/parc" routerLinkActive="is-active" class="module-subnav-link cfm-soft-nav__link">
          Parc connu
        </a>
      </nav>

      <section class="module-feedback-stack" *ngIf="(facade.error$ | async) || (facade.notice$ | async) || (facade.loading$ | async)">
        <div class="feedback error" *ngIf="facade.error$ | async as errorMessage">
          <div class="feedback-copy">
            <strong>Action indisponible</strong>
            <span>{{ errorMessage }}</span>
          </div>
          <cfm-button
            *ngIf="facade.isWorkspaceReady"
            type="button"
            variant="secondary"
            size="sm"
            (click)="retryWorkspace()"
          >
            Réessayer
          </cfm-button>
        </div>
        <div class="feedback progress" *ngIf="(facade.loading$ | async) && !(facade.error$ | async)">
          <strong>Chargement en cours</strong>
          <span>Les données chantier se mettent à jour.</span>
        </div>
        <div class="feedback success" *ngIf="(facade.notice$ | async) as noticeMessage">
          <strong>Action terminée</strong>
          <span>{{ noticeMessage }}</span>
        </div>
      </section>

      <router-outlet />
    </section>
  `,
  styles: [
    `
      .worksites-module-page {
        display: grid;
        gap: 1.15rem;
      }

      .module-header-strip {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.85rem 1rem;
        align-items: start;
      }

      .module-title-block {
        display: grid;
        gap: 0.18rem;
      }

      .module-title-block h2 {
        margin: 0;
        font-size: clamp(1.7rem, 3vw, 2.45rem);
        line-height: 0.98;
        letter-spacing: -0.05em;
        color: var(--cfm-color-ink, #1e2b3a);
      }

      .module-kicker {
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .module-lead {
        margin: 0;
        max-width: 34rem;
        color: var(--cfm-color-copy-muted);
        line-height: 1.48;
      }

      .module-context,
      .module-action-row,
      .module-subnav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        align-items: center;
      }

      .module-action-row {
        justify-content: flex-end;
      }

      .module-subnav {
        align-items: center;
      }

      .module-context-line {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 0.8rem;
        align-items: center;
        color: var(--cfm-color-copy-muted);
        font-size: 0.84rem;
      }

      .module-context-line span {
        position: relative;
      }

      .module-context-line span + span::before {
        content: "·";
        position: absolute;
        left: -0.5rem;
        color: color-mix(in srgb, var(--cfm-color-copy-muted) 70%, white);
      }

      .module-context-line .is-danger {
        color: var(--cfm-color-danger-ink);
      }

      .module-context-line .is-warning {
        color: var(--cfm-color-warning-ink);
      }

      .module-feedback-stack {
        display: grid;
        gap: 0.7rem;
      }

      .feedback {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
        padding: 0.95rem 1rem;
        border-radius: 20px;
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 78%, white);
        outline-offset: -1px;
      }

      .feedback-copy {
        display: grid;
        gap: 0.2rem;
      }

      .feedback.error {
        background: var(--cfm-color-danger-bg, #fceeee);
        color: var(--cfm-color-danger-ink, #a65252);
      }

      .feedback.progress {
        background: var(--cfm-color-info-bg, #eaf2ff);
        color: var(--cfm-color-info-ink, #2c5fb8);
      }

      .feedback.success {
        background: var(--cfm-color-success-bg, #edf8f1);
        color: var(--cfm-color-success-ink, #2f7a4f);
      }

      @media (max-width: 1180px) {
        .module-header-strip {
          grid-template-columns: 1fr;
        }

        .module-action-row {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class DesktopWorksitesLayoutComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly router = inject(Router);

  get isWorksiteDetailRoute(): boolean {
    const url = this.router.url.split("?")[0];
    return /^\/app\/chantiers\/(?!liste(?:\/|$)|nouveau(?:\/|$)|parc(?:\/|$))[^/]+\/.+/.test(url);
  }

  retryWorkspace(): void {
    void this.facade.refresh();
  }
}
