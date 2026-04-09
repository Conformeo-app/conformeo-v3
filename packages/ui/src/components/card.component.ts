import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: "cfm-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <p class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
      <header class="header" *ngIf="title || description">
        <h2 *ngIf="title">{{ title }}</h2>
        <p class="description" *ngIf="description">{{ description }}</p>
      </header>
      <div class="content">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .card {
        position: relative;
        overflow: hidden;
        padding: 1.2rem 1.15rem 1.1rem 1.35rem;
        border-radius: var(--cfm-radius-panel, 8px);
        background: var(--cfm-gradient-panel, linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 249, 252, 0.92)));
        outline: 1px solid var(--cfm-color-outline-ghost, rgba(70, 70, 77, 0.2));
        outline-offset: -1px;
        box-shadow: var(--cfm-shadow-card, 0 18px 36px rgba(10, 17, 40, 0.04));
        transition:
          box-shadow 180ms ease,
          transform 180ms ease;
      }

      .card:hover {
        transform: translateY(-1px);
        box-shadow: var(--cfm-shadow-overlay, 0 20px 40px rgba(10, 17, 40, 0.06));
      }

      .card::before {
        content: "";
        position: absolute;
        left: 0;
        top: 1.1rem;
        bottom: 1.1rem;
        width: 4px;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(255, 222, 165, 0.98), rgba(255, 222, 165, 0.28));
        opacity: 0.92;
      }

      .eyebrow {
        margin: 0 0 0.55rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--cfm-color-copy-muted, #46464d);
      }

      .header {
        display: grid;
        gap: 0.4rem;
      }

      h2,
      .description {
        margin: 0;
      }

      h2 {
        font-family: var(--cfm-font-display, Georgia, serif);
        font-size: 1.3rem;
        line-height: 1.1;
        color: var(--cfm-color-ink, #1e2b3a);
        font-weight: 500;
      }

      .description {
        line-height: 1.45;
        color: var(--cfm-color-copy-muted, #4c6471);
      }

      .content {
        display: grid;
        gap: 0.8rem;
        margin-top: 0.72rem;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CfmCardComponent {
  @Input() eyebrow = "";
  @Input() title = "";
  @Input() description = "";
}
