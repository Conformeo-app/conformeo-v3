import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CfmEmptyStateComponent } from "@conformeo/ui";

import { DESKTOP_ADMIN_PAGE_CONTEXT } from "./desktop-admin-page-context";
import { DesktopAdminFacade } from "./desktop-admin.facade";

@Component({
  selector: "cfm-desktop-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, CfmEmptyStateComponent],
  providers: [
    DesktopAdminFacade,
    {
      provide: DESKTOP_ADMIN_PAGE_CONTEXT,
      useExisting: DesktopAdminFacade,
    },
  ],
  template: `
    <section class="module-page" *ngIf="ctx.canAccessAdministration; else lockedState">
      <header class="module-header-strip">
        <div class="module-title-block">
          <span class="small">Administration</span>
          <h2>Organisation & accès</h2>
        </div>

        <div class="module-metric-row">
          <article class="module-metric-pill">
            <strong>{{ ctx.memberCount }}</strong>
            <span>utilisateurs</span>
          </article>
          <article class="module-metric-pill">
            <strong>{{ ctx.teamCount }}</strong>
            <span>équipes</span>
          </article>
          <article class="module-metric-pill">
            <strong>{{ ctx.enabledModuleCount }}</strong>
            <span>modules actifs</span>
          </article>
        </div>
      </header>

      <nav class="module-subnav cfm-soft-nav cfm-soft-nav--quiet">
        <a
          *ngFor="let item of ctx.adminNavigationItems"
          [routerLink]="item.route"
          routerLinkActive="is-active"
          class="module-subnav-link cfm-soft-nav__link"
        >
          {{ item.label }}
        </a>
      </nav>

      <router-outlet />
    </section>

    <ng-template #lockedState>
      <cfm-empty-state
        title="Administration indisponible"
        description="Votre rôle actuel ne donne pas accès à la zone administration."
      />
    </ng-template>
  `,
  styles: [
    `
      .module-page {
        display: grid;
        gap: 1rem;
      }

      .module-header-strip {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1rem 1rem 1.25rem;
        border-radius: 20px;
        background:
          radial-gradient(circle at top right, rgba(255, 222, 165, 0.12), transparent 26%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(242, 244, 247, 0.8));
        box-shadow: var(--cfm-shadow-soft);
      }

      .module-title-block,
      .module-metric-pill {
        display: grid;
        gap: 0.15rem;
      }

      .module-title-block h2 {
        margin: 0;
        font-size: 1.7rem;
        line-height: 0.96;
        letter-spacing: -0.04em;
        color: var(--cfm-color-ink, #1e2b3a);
      }

      .module-metric-row,
      .module-subnav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .module-metric-row {
        justify-content: flex-end;
      }

      .module-metric-pill {
        min-width: 6.4rem;
        padding: 0.7rem 0.8rem;
        border-radius: 16px;
        background: var(--cfm-color-surface-muted, #eef4fb);
      }

      @media (max-width: 1180px) {
        .module-header-strip {
          grid-template-columns: 1fr;
        }

        .module-metric-row {
          justify-content: start;
        }
      }
    `,
  ],
})
export class DesktopAdminLayoutComponent {
  readonly ctx = inject(DESKTOP_ADMIN_PAGE_CONTEXT);
}
