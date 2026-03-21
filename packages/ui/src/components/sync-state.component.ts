import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { CfmStatusChipComponent } from "./status-chip.component";
import type { CfmTone } from "../types";

@Component({
  selector: "cfm-sync-state",
  standalone: true,
  imports: [CommonModule, CfmStatusChipComponent],
  template: `
    <section class="sync-state" [attr.data-tone]="tone">
      <cfm-status-chip [label]="label" [tone]="tone" />
      <div class="copy">
        <strong>{{ title }}</strong>
        <p>{{ detail }}</p>
        <small *ngIf="note">{{ note }}</small>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .sync-state {
        position: relative;
        display: grid;
        gap: 0.6rem;
        padding: 1rem 1.05rem 1rem 1.15rem;
        border-radius: 22px;
        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 70%, transparent);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(245, 249, 249, 0.9));
        box-shadow:
          0 14px 30px rgba(18, 33, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.84);
      }

      .sync-state::before {
        content: "";
        position: absolute;
        left: 0;
        top: 1rem;
        bottom: 1rem;
        width: 4px;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.24;
      }

      .sync-state[data-tone="neutral"] {
        color: #3f5762;
      }

      .sync-state[data-tone="calm"] {
        color: #1e5d54;
      }

      .sync-state[data-tone="progress"] {
        color: #8f5e00;
      }

      .sync-state[data-tone="success"] {
        color: #1d6a3d;
      }

      .sync-state[data-tone="warning"],
      .sync-state[data-tone="danger"] {
        color: #8a2d2d;
      }

      .copy {
        display: grid;
        gap: 0.3rem;
      }

      strong,
      p,
      small {
        margin: 0;
      }

      strong {
        color: var(--cfm-color-ink, #10222b);
      }

      p,
      small {
        color: var(--cfm-color-copy-muted, #4c6471);
        line-height: 1.5;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CfmSyncStateComponent {
  @Input() title = "État de synchronisation";
  @Input({ required: true }) label!: string;
  @Input({ required: true }) detail!: string;
  @Input() note = "";
  @Input() tone: CfmTone = "calm";
}
