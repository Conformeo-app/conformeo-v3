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
        display: grid;
        gap: 0.45rem;
        padding: 1rem 1.1rem;
        border-radius: 18px;
        border: 1px dashed var(--cfm-color-border, #bfd3cf);
        background: color-mix(in srgb, var(--cfm-color-surface, #ffffff) 88%, transparent);
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
