import { CommonModule } from "@angular/common";
import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { CfmButtonComponent } from "@conformeo/ui";

@Component({
  selector: "cfm-desktop-detail-drawer",
  standalone: true,
  imports: [CommonModule, CfmButtonComponent],
  template: `
    <ng-container *ngIf="open">
      <div class="drawer-backdrop" (click)="requestClose()"></div>

      <aside class="drawer-panel" role="dialog" aria-modal="true" [attr.aria-label]="title" (click)="$event.stopPropagation()">
        <header class="drawer-header">
          <div class="drawer-copy">
            <strong>{{ title }}</strong>
            <p class="small" *ngIf="subtitle">{{ subtitle }}</p>
          </div>

          <cfm-button type="button" variant="ghost" size="sm" (click)="requestClose()">
            Fermer
          </cfm-button>
        </header>

        <div class="drawer-body">
          <ng-content />
        </div>
      </aside>
    </ng-container>
  `,
  styles: [
    `
      .drawer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(12, 28, 25, 0.38);
        z-index: 40;
      }

      .drawer-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: min(32rem, calc(100vw - 2rem));
        height: 100vh;
        z-index: 41;
        background: #f6faf7;
        border-left: 1px solid rgba(23, 49, 43, 0.1);
        box-shadow: -18px 0 32px rgba(12, 28, 25, 0.1);
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
      }

      .drawer-header,
      .drawer-copy,
      .drawer-body {
        display: grid;
        gap: 0.5rem;
      }

      .drawer-header {
        padding: 0.82rem 0.88rem 0.76rem;
        border-bottom: 1px solid rgba(23, 49, 43, 0.08);
      }

      .drawer-body {
        padding: 0.88rem;
        overflow: auto;
        align-content: start;
      }
    `,
  ],
})
export class DesktopDetailDrawerComponent {
  @Input() open = false;
  @Input() title = "";
  @Input() subtitle: string | null = null;
  @Output() readonly closed = new EventEmitter<void>();

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.open) {
      this.requestClose();
    }
  }

  requestClose(): void {
    this.closed.emit();
  }
}
