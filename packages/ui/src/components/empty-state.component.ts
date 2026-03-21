import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: "cfm-empty-state",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="empty-state">
      <p class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
      <div class="actions">
        <ng-content select="[cfmEmptyAction]" />
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .empty-state {
        position: relative;
        display: grid;
        gap: 0.5rem;
        padding: 1.15rem 1.2rem 1.15rem 4rem;
        border-radius: 22px;
        border: 1px dashed color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 86%, transparent);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(245, 249, 249, 0.88));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
      }

      .empty-state::before {
        content: "";
        position: absolute;
        left: 1.15rem;
        top: 1.1rem;
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        background:
          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0) 48%),
          linear-gradient(135deg, rgba(29, 109, 100, 0.24), rgba(245, 188, 88, 0.32));
        box-shadow: 0 8px 16px rgba(18, 33, 42, 0.08);
      }

      .eyebrow,
      p {
        margin: 0;
        color: var(--cfm-color-copy-muted, #4c6471);
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.72rem;
      }

      strong {
        color: var(--cfm-color-ink, #10222b);
        font-size: 1rem;
      }

      p {
        line-height: 1.5;
      }

      .actions {
        margin-top: 0.35rem;
      }

      .actions:empty {
        display: none;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CfmEmptyStateComponent {
  @Input() eyebrow = "";
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
}
