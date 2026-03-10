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
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        width: fit-content;
        padding: 0.36rem 0.72rem;
        border-radius: var(--cfm-radius-pill, 999px);
        font-size: 0.82rem;
        font-weight: 700;
      }

      .chip[data-tone="neutral"] {
        background: #e9eeef;
        color: #3f5762;
      }

      .chip[data-tone="calm"] {
        background: #e6f2ef;
        color: #1e5d54;
      }

      .chip[data-tone="progress"] {
        background: #fff1d4;
        color: #8f5e00;
      }

      .chip[data-tone="success"] {
        background: #ddf4e6;
        color: #1d6a3d;
      }

      .chip[data-tone="warning"] {
        background: #fde2dc;
        color: #8a2d2d;
      }

      .chip[data-tone="danger"] {
        background: #f7d7d2;
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
