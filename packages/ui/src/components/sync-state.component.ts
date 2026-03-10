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
        display: grid;
        gap: 0.55rem;
        padding: 0.95rem 1rem;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 70%, transparent);
        background: color-mix(in srgb, var(--cfm-color-surface, #ffffff) 90%, transparent);
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
