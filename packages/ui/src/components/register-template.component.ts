import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "cfm-register-template",
  standalone: true,
  template: `
    <section class="register-template">
      <header class="header">
        <div class="lead">
          <ng-content select="[cfmRegisterLead]" />
        </div>
        <aside class="actions">
          <ng-content select="[cfmRegisterActions]" />
        </aside>
      </header>

      <section class="body">
        <div class="register">
          <ng-content select="[cfmRegisterMain]" />
        </div>
        <aside class="panel">
          <ng-content select="[cfmRegisterDetail]" />
        </aside>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .register-template,
      .header,
      .body,
      .lead,
      .actions,
      .register,
      .panel {
        display: grid;
      }

      .register-template {
        gap: var(--cfm-space-lg, 1.5rem);
      }

      .header {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: var(--cfm-space-lg, 1.5rem);
        align-items: start;
      }

      .body {
        grid-template-columns: minmax(0, 1.5fr) minmax(21rem, 0.82fr);
        gap: var(--cfm-space-xl, 2rem);
        align-items: start;
      }

      .lead,
      .actions,
      .register,
      .panel {
        gap: var(--cfm-space-lg, 1.5rem);
      }

      @media (max-width: 1200px) {
        .header,
        .body {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CfmRegisterTemplateComponent {}
