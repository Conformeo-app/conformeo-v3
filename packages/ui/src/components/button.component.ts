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
        gap: 0.5rem;
        border: 0;
        border-radius: var(--cfm-radius-pill, 999px);
        padding: 0.92rem 1.28rem;
        font: inherit;
        font-weight: 700;
        letter-spacing: 0.01em;
        cursor: pointer;
        box-shadow:
          0 10px 24px rgba(18, 33, 42, 0.08),
          0 1px 0 rgba(255, 255, 255, 0.32) inset;
        transition:
          transform 140ms ease,
          opacity 140ms ease,
          background-color 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease;
      }

      .button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow:
          0 14px 30px rgba(18, 33, 42, 0.12),
          0 1px 0 rgba(255, 255, 255, 0.36) inset;
      }

      .button:active:not(:disabled) {
        transform: translateY(0);
      }

      .button[data-size="sm"] {
        padding: 0.65rem 0.95rem;
        font-size: 0.92rem;
      }

      .button[data-block] {
        width: 100%;
      }

      .button[data-variant="primary"] {
        color: #ffffff;
        background:
          linear-gradient(135deg, color-mix(in srgb, var(--cfm-color-primary, #1d6d64) 94%, #ffffff 6%), #154f49);
      }

      .button[data-variant="secondary"] {
        color: var(--cfm-color-ink, #18323e);
        background: linear-gradient(180deg, #ffffff, var(--cfm-color-surface-muted, #d9e4e7));
        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 78%, transparent);
      }

      .button[data-variant="ghost"] {
        color: var(--cfm-color-primary, #1d6d64);
        background: rgba(255, 255, 255, 0.52);
        border: 1px solid var(--cfm-color-border, #bfd3cf);
      }

      .button[data-variant="danger"] {
        color: #ffffff;
        background: linear-gradient(135deg, var(--cfm-color-danger, #b03d2e), #8a2d2d);
      }

      .button:disabled {
        opacity: 0.64;
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
