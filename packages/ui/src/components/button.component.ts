import { CommonModule } from "@angular/common";
import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from "@angular/core";

import type { CfmButtonVariant } from "../types";

@Component({
  selector: "cfm-button",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="button"
      [attr.type]="type"
      [attr.data-variant]="variant"
      [attr.data-size]="size"
      [attr.data-block]="block ? '' : null"
      [disabled]="disabled"
    >
      <ng-content />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      :host([data-block]) {
        display: block;
      }

      .button {
        width: auto;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 0.34rem;
        border: 0;
        border-radius: var(--cfm-radius-pill, 9px);
        padding: 0.72rem 1rem;
        font: inherit;
        font-weight: var(--cfm-font-weight-medium, 500);
        letter-spacing: 0.01em;
        cursor: pointer;
        box-shadow: none;
        transition:
          opacity 140ms ease,
          background-color 140ms ease,
          color 140ms ease,
          transform 140ms ease;
      }

      .button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .button:active:not(:disabled) {
        transform: translateY(0);
      }

      .button[data-size="sm"] {
        padding: 0.55rem 0.8rem;
        font-size: 0.84rem;
      }

      .button[data-block] {
        width: 100%;
      }

      .button[data-variant="primary"] {
        color: #ffffff;
        background: var(--cfm-gradient-primary, linear-gradient(135deg, #0a1128 0%, #141a32 100%));
        box-shadow: var(--cfm-shadow-soft, 0 10px 20px rgba(10, 17, 40, 0.03));
      }

      .button[data-variant="secondary"] {
        color: var(--cfm-color-secondary-ink, #53340c);
        background: var(--cfm-gradient-brass, linear-gradient(135deg, #ffe9bc 0%, #ffdea5 100%));
        box-shadow: var(--cfm-shadow-soft, 0 10px 20px rgba(10, 17, 40, 0.03));
      }

      .button[data-variant="ghost"] {
        color: var(--cfm-color-primary, #0a1128);
        background: rgba(255, 255, 255, 0.58);
        outline: 1px solid var(--cfm-color-outline-ghost, rgba(70, 70, 77, 0.2));
        outline-offset: -1px;
      }

      .button[data-variant="danger"] {
        color: #ffffff;
        background: linear-gradient(135deg, color-mix(in srgb, var(--cfm-color-danger, #ba1a1a) 92%, #0a1128), var(--cfm-color-danger, #ba1a1a));
        box-shadow: var(--cfm-shadow-soft, 0 10px 20px rgba(10, 17, 40, 0.03));
      }

      .button:disabled {
        opacity: 0.55;
        cursor: wait;
        transform: none;
        box-shadow: none;
      }
    `
  ],
  host: {
    "[attr.data-block]": "block ? '' : null"
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CfmButtonComponent {
  @Input() variant: CfmButtonVariant = "primary";
  @Input() size: "sm" | "md" = "md";
  @Input() type: "button" | "submit" | "reset" = "button";
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) block = false;
}
