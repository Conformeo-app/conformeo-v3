import { CommonModule } from "@angular/common";
import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { CfmButtonComponent } from "@conformeo/ui";

@Component({
  selector: "cfm-desktop-modal-shell",
  standalone: true,
  imports: [CommonModule, CfmButtonComponent],
  template: `
    <ng-container *ngIf="open">
      <div class="modal-backdrop" (click)="requestClose()"></div>

      <section class="modal-panel" role="dialog" aria-modal="true" [attr.aria-label]="title" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="modal-copy">
            <strong>{{ title }}</strong>
            <p class="small" *ngIf="description">{{ description }}</p>
          </div>

          <cfm-button type="button" variant="ghost" size="sm" (click)="requestClose()">
            Fermer
          </cfm-button>
        </header>

        <div class="modal-body">
          <ng-content />
        </div>
      </section>
    </ng-container>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(12, 28, 25, 0.38);
        z-index: 50;
      }

      .modal-panel {
        position: fixed;
        inset: 50% auto auto 50%;
        transform: translate(-50%, -50%);
        width: min(36rem, calc(100vw - 2rem));
        max-height: calc(100vh - 3rem);
        z-index: 51;
        background: #f6faf7;
        border: 1px solid rgba(23, 49, 43, 0.1);
        border-radius: 16px;
        box-shadow: 0 18px 36px rgba(12, 28, 25, 0.13);
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
      }

      .modal-header,
      .modal-copy,
      .modal-body {
        display: grid;
        gap: 0.5rem;
      }

      .modal-header {
        padding: 0.82rem 0.88rem 0.76rem;
        border-bottom: 1px solid rgba(23, 49, 43, 0.08);
      }

      .modal-body {
        padding: 0.88rem;
        overflow: auto;
        align-content: start;
      }
    `,
  ],
})
export class DesktopModalShellComponent {
  @Input() open = false;
  @Input() title = "";
  @Input() description: string | null = null;
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
