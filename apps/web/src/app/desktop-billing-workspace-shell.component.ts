import { CommonModule, NgClass } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import type { FormGroup } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "cfm-desktop-billing-workspace-shell",
  standalone: true,
  imports: [CommonModule, NgClass, ReactiveFormsModule],
  template: `
    <section class="billing-home">
      <section class="billing-home-kpis" [attr.aria-label]="kpiAriaLabel || null">
        <ng-content select="[billingWorkspaceKpi]"></ng-content>
      </section>

      <section class="billing-home-stage">
        <section class="billing-home-main">
          <section class="billing-home-ledger" [formGroup]="formGroup">
            <div class="billing-home-toolbar">
              <ng-content select="[billingWorkspaceFilter]"></ng-content>
            </div>

            <div class="billing-home-register-head" [ngClass]="registerHeadClass" *ngIf="showRegisterHead">
              <ng-content select="[billingWorkspaceRegisterHead]"></ng-content>
            </div>

            <div class="billing-home-register">
              <ng-content select="[billingWorkspaceRegisterBody]"></ng-content>
            </div>
          </section>
        </section>

        <aside class="billing-home-rail cfm-billing-sticky-rail">
          <ng-content select="[billingWorkspaceRail]"></ng-content>
        </aside>
      </section>

      <section #secondaryStack class="cfm-billing-secondary-stack" *ngIf="hasSecondary && secondaryOpen">
        <ng-content select="[billingWorkspaceSecondary]"></ng-content>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .billing-home,
      .billing-home-stage,
      .billing-home-main,
      .billing-home-rail,
      .billing-home-ledger,
      .billing-home-register,
      .billing-home-kpis {
        display: grid;
      }

      .billing-home,
      .billing-home-main,
      .billing-home-rail {
        gap: 1.02rem;
      }

      .billing-home {
        gap: 1.18rem;
      }

      .billing-home-kpis {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.72rem;
        margin-top: 0.16rem;
        margin-bottom: 0;
      }

      .billing-home-stage {
        display: grid;
        grid-template-columns: minmax(0, 1.82fr) minmax(16.8rem, 0.7fr);
        gap: 1.32rem;
        align-items: start;
      }

      .billing-home-ledger {
        gap: 0;
        padding: 0.9rem 1rem 0.34rem;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 24px 40px rgba(10, 17, 40, 0.04);
      }

      .billing-home-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.72rem;
        align-items: center;
        padding: 0.18rem 0.34rem 1.08rem;
      }

      .billing-home-register-head {
        display: grid;
        gap: 0.96rem;
        align-items: center;
        padding: 0.38rem 0.78rem 0.82rem;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
        border-bottom: 1px solid rgba(22, 24, 34, 0.08);
      }

      .billing-home-register-head--overview {
        grid-template-columns: minmax(0, 0.82fr) minmax(0, 0.98fr) minmax(0, 0.72fr) minmax(0, 0.62fr) minmax(0, 0.72fr);
        align-items: center;
      }

      .billing-home-register {
        gap: 0;
      }

      .billing-home-rail {
        min-width: 0;
        align-self: start;
      }

      .cfm-billing-secondary-stack {
        scroll-margin-top: 7rem;
      }

      @media (max-width: 1220px) {
        .billing-home-kpis,
        .billing-home-stage {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopBillingWorkspaceShellComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() kpiAriaLabel: string | null = null;
  @Input() registerHeadClass = "";
  @Input() showRegisterHead = true;
  @Input() hasSecondary = false;
  @Input() secondaryOpen = false;

  @ViewChild("secondaryStack")
  set secondaryStackRef(ref: ElementRef<HTMLElement> | undefined) {
    if (!ref || !this.secondaryOpen) {
      return;
    }

    setTimeout(() => {
      ref.nativeElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
}
