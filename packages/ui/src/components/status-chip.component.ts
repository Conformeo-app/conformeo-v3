import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import type { CfmTone } from "../types";

@Component({
  selector: "cfm-status-chip",
  standalone: true,
  template: `
    <span class="chip" [attr.data-tone]="tone">{{ label }}</span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .chip {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        width: fit-content;
        padding: 0.38rem 0.78rem;
        border-radius: var(--cfm-radius-pill, 999px);
        font-size: 0.82rem;
        font-weight: 700;
        border: 1px solid rgba(16, 34, 43, 0.05);
        box-shadow:
          0 6px 16px rgba(18, 33, 42, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.72);
      }

      .chip::before {
        content: "";
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.7;
      }

      .chip[data-tone="neutral"] {
        background: linear-gradient(180deg, #f2f5f6, #e9eeef);
        color: #3f5762;
      }

      .chip[data-tone="calm"] {
        background: linear-gradient(180deg, #edf8f5, #e6f2ef);
        color: #1e5d54;
      }

      .chip[data-tone="progress"] {
        background: linear-gradient(180deg, #fff6e1, #fff1d4);
        color: #8f5e00;
      }

      .chip[data-tone="success"] {
        background: linear-gradient(180deg, #e8f8ee, #ddf4e6);
        color: #1d6a3d;
      }

      .chip[data-tone="warning"] {
        background: linear-gradient(180deg, #fee9e3, #fde2dc);
        color: #8a2d2d;
      }

      .chip[data-tone="danger"] {
        background: linear-gradient(180deg, #fbe2dc, #f7d7d2);
        color: #8e2f23;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CfmStatusChipComponent {
  @Input({ required: true }) label!: string;
  @Input() tone: CfmTone = "neutral";
}
