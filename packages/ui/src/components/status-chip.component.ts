import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import type { CfmTone } from "../types";

@Component({
  selector: "cfm-status-chip",
  standalone: true,
  template: `
    <span class="chip status-chip" [attr.data-tone]="tone" [attr.data-emphasis]="emphasis">{{ label }}</span>
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
        gap: 0.32rem;
        width: fit-content;
        padding: 0.28rem 0.62rem;
        border-radius: var(--cfm-radius-pill, 999px);
        font-size: 0.74rem;
        font-weight: var(--cfm-font-weight-medium, 500);
        letter-spacing: 0.01em;
        border: 0;
      }

      .chip::before {
        content: "";
        width: 0.34rem;
        height: 0.34rem;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.7;
      }

      .chip[data-tone="neutral"] {
        background: var(--cfm-color-calm-bg, #eef2f5);
        color: var(--cfm-color-calm-ink, #4b5c77);
      }

      .chip[data-tone="calm"] {
        background: color-mix(in srgb, var(--cfm-color-surface-muted, #f2f4f7) 88%, white);
        color: var(--cfm-color-copy-muted, #46464d);
      }

      .chip[data-tone="accent"] {
        background: var(--cfm-color-accent-bg, #f0ecff);
        color: var(--cfm-color-accent-ink, #5a45b8);
      }

      .chip[data-tone="progress"] {
        background: var(--cfm-color-info-bg, #e7eef8);
        color: var(--cfm-color-info-ink, #24518a);
      }

      .chip[data-tone="success"] {
        background: var(--cfm-color-success-bg, #edf8f1);
        color: var(--cfm-color-success-ink, #2f7a4f);
      }

      .chip[data-tone="warning"] {
        background: var(--cfm-color-warning-bg, #f8eee1);
        color: var(--cfm-color-warning-ink, #8c5f27);
      }

      .chip[data-tone="danger"] {
        background: var(--cfm-color-danger-bg, #fceeee);
        color: var(--cfm-color-danger-ink, #a65252);
      }

      .chip[data-emphasis="soft"] {
        background: rgba(255, 255, 255, 0.7);
        outline: 1px solid var(--cfm-color-outline-ghost, rgba(70, 70, 77, 0.2));
        outline-offset: -1px;
      }

      .chip[data-emphasis="soft"]::before {
        opacity: 0.55;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CfmStatusChipComponent {
  @Input({ required: true }) label!: string;
  @Input() tone: CfmTone = "neutral";
  @Input() emphasis: "default" | "soft" = "default";
}
