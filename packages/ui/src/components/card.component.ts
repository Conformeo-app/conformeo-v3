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
        padding: 1.5rem;
        border-radius: var(--cfm-radius-panel, 24px);
        background: color-mix(in srgb, var(--cfm-color-surface, #ffffff) 92%, transparent);
        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 65%, transparent);
        box-shadow: var(--cfm-shadow-card, 0 20px 60px rgba(18, 33, 42, 0.08));
      }

      .eyebrow {
        margin: 0 0 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.74rem;
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
        font-size: 1.1rem;
        color: var(--cfm-color-ink, #10222b);
      }

      .description {
        line-height: 1.55;
        color: var(--cfm-color-copy-muted, #4c6471);
      }

      .content {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
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
