import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

import { DESKTOP_BILLING_PAGE_CONTEXT } from "./desktop-billing-page-context";
import { DesktopBillingFacade } from "./desktop-billing.facade";
import { DesktopBillingSecondarySectionService } from "./desktop-billing-secondary-section.service";

@Component({
  selector: "cfm-desktop-billing-layout",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  providers: [
    DesktopBillingFacade,
    DesktopBillingSecondarySectionService,
    {
      provide: DESKTOP_BILLING_PAGE_CONTEXT,
      useExisting: DesktopBillingFacade,
    },
  ],
  template: `
    <section class="cfm-billing-shell">
      <header class="cfm-billing-module-head">
        <div class="cfm-billing-module-head-copy">
          <h2 class="cfm-billing-module-head-title">Gestion de facturation</h2>
          <p>Centralisez vos flux financiers et gardez la bonne action sous la main.</p>
        </div>

        <div class="cfm-billing-module-head-actions">
          <button
            *ngIf="secondarySection.hasCurrent()"
            type="button"
            class="cfm-billing-module-cta cfm-billing-module-cta--utility"
            [class.is-open]="secondarySection.isCurrentOpen()"
            (click)="secondarySection.toggleCurrent()"
          >
            <span>Voir les</span>
            <strong>{{ secondarySection.currentLabel() }}</strong>
          </button>

          <a class="cfm-billing-module-cta" [routerLink]="['/app/facturation/devis']">
            <span>Créer un</span>
            <strong>devis</strong>
          </a>
          <a class="cfm-billing-module-cta cfm-billing-module-cta--primary" [routerLink]="['/app/facturation/factures']">
            <span>Créer une</span>
            <strong>facture</strong>
          </a>
        </div>
      </header>

      <router-outlet />
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .cfm-billing-shell {
        display: grid;
        gap: 1.55rem;
        padding-top: 0.5rem;
      }

      .cfm-billing-module-head,
      .cfm-billing-module-head-copy {
        display: grid;
      }

      .cfm-billing-module-head {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 1rem;
        align-items: end;
        padding: 0.26rem 0 0.08rem;
      }

      .cfm-billing-module-head-copy {
        gap: 0.26rem;
      }

      .cfm-billing-module-head-title {
        margin: 0;
        font-size: clamp(1.95rem, 2.9vw, 2.4rem);
        line-height: 0.96;
        letter-spacing: -0.05em;
      }

      .cfm-billing-module-head-copy p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        max-width: 34rem;
        line-height: 1.34;
      }

      .cfm-billing-module-head-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.72rem;
      }

      .cfm-billing-module-cta {
        display: grid;
        align-content: center;
        gap: 0.04rem;
        min-width: 8.2rem;
        min-height: 3.68rem;
        padding: 0.56rem 0.82rem 0.62rem;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.88);
        color: var(--cfm-color-ink, #161822);
        text-decoration: none;
        box-shadow: 0 14px 30px rgba(10, 17, 40, 0.05);
      }

      .cfm-billing-module-cta span {
        font-size: 0.74rem;
        color: var(--cfm-color-copy-muted, #60758c);
      }

      .cfm-billing-module-cta strong {
        font-size: 0.92rem;
        line-height: 1.1;
      }

      .cfm-billing-module-cta--primary {
        background: linear-gradient(180deg, #161c31 0%, #111728 100%);
        color: #f6f7fb;
      }

      .cfm-billing-module-cta--utility {
        min-width: 9.1rem;
        border: 1px solid rgba(22, 24, 34, 0.08);
        background: rgba(255, 255, 255, 0.72);
        box-shadow: none;
      }

      .cfm-billing-module-cta--utility.is-open {
        border-color: rgba(197, 155, 52, 0.34);
        background: rgba(247, 242, 227, 0.84);
      }

      .cfm-billing-module-cta--primary span {
        color: rgba(244, 246, 251, 0.68);
      }
      @media (max-width: 1180px) {
        .cfm-billing-module-head {
          grid-template-columns: 1fr;
        }

        .cfm-billing-module-head-actions {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class DesktopBillingLayoutComponent {
  readonly secondarySection = inject(DesktopBillingSecondarySectionService);
}
