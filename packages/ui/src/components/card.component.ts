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
        padding: 1.6rem;
        border-radius: var(--cfm-radius-panel, 24px);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 250, 0.94)),
          color-mix(in srgb, var(--cfm-color-surface, #ffffff) 96%, transparent);
        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 72%, transparent);
        box-shadow:
          0 18px 44px rgba(18, 33, 42, 0.08),
          0 2px 0 rgba(255, 255, 255, 0.8) inset;
        transition:
          transform 180ms ease,
          box-shadow 180ms ease,
          border-color 180ms ease;
      }

      .card::before {
        content: "";
        position: absolute;
        inset: 0 0 auto;
        height: 4px;
        background: linear-gradient(90deg, rgba(29, 109, 100, 0.95), rgba(245, 188, 88, 0.72));
        opacity: 0.9;
      }

      .card:hover {
        transform: translateY(-2px);
        box-shadow:
          0 24px 58px rgba(18, 33, 42, 0.1),
          0 2px 0 rgba(255, 255, 255, 0.8) inset;
        border-color: color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 88%, #ffffff 12%);
      }

      .eyebrow {
        margin: 0 0 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--cfm-color-copy-muted, #4c6471);
      }

      .header {
        display: grid;
        gap: 0.55rem;
      }

      h2,
      .description {
        margin: 0;
      }

      h2 {
        font-size: 1.16rem;
        line-height: 1.25;
        color: var(--cfm-color-ink, #10222b);
      }

      .description {
        line-height: 1.6;
        color: var(--cfm-color-copy-muted, #4c6471);
      }

      .content {
        display: grid;
        gap: 1.05rem;
        margin-top: 1.1rem;
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
