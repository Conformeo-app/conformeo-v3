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
        border-radius: 16px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(242, 244, 247, 0.84));
        outline: 1px solid var(--cfm-color-outline-ghost, rgba(70, 70, 77, 0.2));
        outline-offset: -1px;
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
        color: #4b5c77;
      }

      .sync-state[data-tone="progress"] {
        color: #24518a;
      }

      .sync-state[data-tone="success"] {
        color: #24653f;
      }

      .sync-state[data-tone="warning"] {
        color: #8c5f27;
      }

      .sync-state[data-tone="danger"] {
        color: #9f1818;
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
