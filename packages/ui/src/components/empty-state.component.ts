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
        border-radius: 16px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(242, 244, 247, 0.78));
        outline: 1px solid var(--cfm-color-outline-ghost, rgba(70, 70, 77, 0.2));
        outline-offset: -1px;
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
          linear-gradient(135deg, rgba(10, 17, 40, 0.24), rgba(255, 222, 165, 0.42));
        box-shadow: var(--cfm-shadow-soft, 0 10px 20px rgba(10, 17, 40, 0.03));
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
