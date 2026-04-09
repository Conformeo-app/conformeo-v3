import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "cfm-detail-template",
  standalone: true,
  template: `
    <section class="detail-template">
      <header class="hero">
        <div class="lead">
          <ng-content select="[cfmDetailLead]" />
        </div>
        <aside class="meta">
          <ng-content select="[cfmDetailMeta]" />
        </aside>
      </header>

      <section class="body">
        <div class="main">
          <ng-content select="[cfmDetailMain]" />
        </div>
        <aside class="rail">
          <ng-content select="[cfmDetailRail]" />
        </aside>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .detail-template,
      .hero,
      .body,
      .lead,
      .meta,
      .main,
      .rail {
        display: grid;
      }

      .detail-template {
        gap: var(--cfm-space-lg, 1.5rem);
      }

      .hero {
        grid-template-columns: minmax(0, 1.42fr) minmax(18rem, 0.72fr);
        gap: var(--cfm-space-xl, 2rem);
        align-items: start;
      }

      .body {
        grid-template-columns: minmax(0, 1.4fr) minmax(19rem, 0.8fr);
        gap: var(--cfm-space-xl, 2rem);
        align-items: start;
      }

      .lead,
      .meta,
      .main,
      .rail {
        gap: var(--cfm-space-lg, 1.5rem);
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
export class CfmDetailTemplateComponent {}
