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
        padding: 0.9rem 1.2rem;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: transform 120ms ease, opacity 120ms ease, background-color 120ms ease;
      }

      .button:hover:not(:disabled) {
        transform: translateY(-1px);
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
        background: var(--cfm-color-primary, #1d6d64);
      }

      .button[data-variant="secondary"] {
        color: var(--cfm-color-ink, #18323e);
        background: var(--cfm-color-surface-muted, #d9e4e7);
      }

      .button[data-variant="ghost"] {
        color: var(--cfm-color-primary, #1d6d64);
        background: transparent;
        border: 1px solid var(--cfm-color-border, #bfd3cf);
      }

      .button[data-variant="danger"] {
        color: #ffffff;
        background: var(--cfm-color-danger, #b03d2e);
      }

      .button:disabled {
        opacity: 0.6;
        cursor: wait;
        transform: none;
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
