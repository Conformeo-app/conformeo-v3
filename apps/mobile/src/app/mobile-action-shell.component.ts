import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: "cfm-mobile-action-shell",
  standalone: true,
  template: `
    <section class="mobile-action-shell">
      <header class="hero">
        <div class="copy">
          <span class="kicker" *ngIf="kicker">{{ kicker }}</span>
          <h1>{{ title }}</h1>
          <p *ngIf="summary">{{ summary }}</p>
        </div>
        <div class="meta">
          <ng-content select="[cfmMobileHeroMeta]" />
        </div>
      </header>

      <div class="body">
        <ng-content />
      </div>

      <footer class="dock">
        <ng-content select="[cfmMobileDock]" />
      </footer>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .mobile-action-shell,
      .hero,
      .copy,
      .meta,
      .body,
      .dock {
        display: grid;
      }

      .mobile-action-shell {
        gap: 1rem;
        min-height: 100%;
      }

      .hero {
        gap: 0.75rem;
        padding: 1rem 1rem 0.4rem;
      }

      .copy {
        gap: 0.32rem;
      }

      .kicker {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--cfm-color-copy-muted);
      }

      h1,
      p {
        margin: 0;
      }

      h1 {
        font-family: var(--cfm-font-display);
        font-size: 1.8rem;
        line-height: 0.96;
        letter-spacing: -0.03em;
        color: var(--cfm-color-ink);
      }

      p {
        line-height: 1.45;
        color: var(--cfm-color-copy-muted);
      }

      .body {
        gap: 1rem;
        padding: 0 1rem 5.5rem;
      }

      .dock {
        position: sticky;
        bottom: 0;
        z-index: 5;
        grid-auto-flow: column;
        gap: 0.65rem;
        padding: 0.85rem 1rem calc(0.85rem + env(safe-area-inset-bottom));
        background: rgba(248, 249, 252, 0.82);
        backdrop-filter: blur(20px);
        box-shadow: var(--cfm-shadow-overlay);
      }

      .dock:empty {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileActionShellComponent {
  @Input() kicker = "";
  @Input({ required: true }) title!: string;
  @Input() summary = "";
}
