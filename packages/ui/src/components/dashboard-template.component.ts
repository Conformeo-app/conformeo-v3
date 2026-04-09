import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "cfm-dashboard-template",
  standalone: true,
  template: `
    <section class="dashboard-template">
      <header class="hero">
        <div class="hero-main">
          <ng-content select="[cfmDashboardIntro]" />
        </div>
        <aside class="hero-metrics">
          <ng-content select="[cfmDashboardMetrics]" />
        </aside>
      </header>

      <section class="body">
        <div class="main">
          <ng-content select="[cfmDashboardMain]" />
        </div>
        <aside class="rail">
          <ng-content select="[cfmDashboardRail]" />
        </aside>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dashboard-template,
      .hero,
      .body,
      .hero-main,
      .hero-metrics,
      .main,
      .rail {
        display: grid;
      }

      .dashboard-template {
        gap: var(--cfm-space-lg, 1.5rem);
      }

      .hero {
        grid-template-columns: minmax(0, 1.55fr) minmax(19rem, 0.88fr);
        gap: var(--cfm-space-lg, 1.5rem);
        align-items: start;
      }

      .hero-main,
      .main,
      .rail {
        gap: var(--cfm-space-lg, 1.5rem);
      }

      .body {
        grid-template-columns: minmax(0, 1.45fr) minmax(20rem, 0.78fr);
        gap: var(--cfm-space-xl, 2rem);
        align-items: start;
      }

      @media (max-width: 1200px) {
        .hero,
        .body {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CfmDashboardTemplateComponent {}
