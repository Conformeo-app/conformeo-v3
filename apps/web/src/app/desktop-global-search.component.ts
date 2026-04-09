import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from "@angular/core";
import type { MembershipAccess } from "@conformeo/contracts";
import { Router } from "@angular/router";
import { CfmStatusChipComponent } from "@conformeo/ui";

import {
  DesktopGlobalSearchService,
  type DesktopGlobalSearchResult,
  type DesktopGlobalSearchSection,
} from "./desktop-global-search.service";

@Component({
  selector: "cfm-desktop-global-search",
  standalone: true,
  imports: [CommonModule, CfmStatusChipComponent],
  template: `
    <div class="desktop-global-search" [class.is-open]="panelOpen">
      <label class="desktop-global-search-field" aria-label="Recherche globale">
        <span class="desktop-global-search-prefix" aria-hidden="true">⌕</span>
        <input
          #searchInput
          type="search"
          [value]="query"
          [placeholder]="placeholder"
          autocomplete="off"
          spellcheck="false"
          (focus)="openPanel()"
          (input)="onQueryInput($event)"
          (keydown)="onInputKeydown($event)"
        />
        <button
          *ngIf="query.length > 0"
          type="button"
          class="desktop-global-search-clear"
          (click)="clearQuery()"
        >
          Effacer
        </button>
      </label>

      <section class="desktop-global-search-panel" *ngIf="panelOpen">
        <div class="desktop-global-search-state" *ngIf="query.trim().length < 2">
          <strong>Retrouver rapidement le bon objet métier</strong>
          <p>Chantier, client, devis, facture, document, équipement, site ou obligation.</p>
        </div>

        <div class="desktop-global-search-state" *ngIf="query.trim().length >= 2 && loading">
          <strong>Recherche en cours</strong>
          <p>Les résultats arrivent sans quitter votre page.</p>
        </div>

        <div class="desktop-global-search-state" *ngIf="query.trim().length >= 2 && !loading && errorMessage">
          <strong>Recherche indisponible</strong>
          <p>{{ errorMessage }}</p>
        </div>

        <ng-container *ngIf="query.trim().length >= 2 && !loading && !errorMessage">
          <div class="desktop-global-search-state" *ngIf="sections.length === 0">
            <strong>Aucun résultat</strong>
            <p>Aucun élément utile trouvé pour “{{ query.trim() }}”.</p>
          </div>

          <div class="desktop-global-search-results" *ngIf="sections.length > 0">
            <section
              class="desktop-global-search-section"
              *ngFor="let section of sections; trackBy: trackBySection"
            >
              <header class="desktop-global-search-section-head">
                <strong>{{ section.label }}</strong>
                <span>{{ section.items.length }} résultat{{ section.items.length > 1 ? "s" : "" }}</span>
              </header>

              <button
                *ngFor="let item of section.items; trackBy: trackByResult"
                type="button"
                class="desktop-global-search-result"
                (click)="openResult(item)"
              >
                <div class="desktop-global-search-result-copy">
                  <div class="desktop-global-search-result-topline">
                    <strong>{{ item.title }}</strong>
                    <cfm-status-chip [label]="item.kindLabel" [tone]="item.tone" />
                  </div>
                  <span class="desktop-global-search-result-detail">{{ item.detail }}</span>
                  <span
                    class="desktop-global-search-result-support"
                    *ngIf="item.supportLabel"
                  >
                    {{ item.supportLabel }}
                  </span>
                </div>
              </button>
            </section>
          </div>
        </ng-container>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .desktop-global-search {
        position: relative;
      }

      .desktop-global-search-field {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.56rem;
        min-height: 2.48rem;
        padding: 0 0.86rem 0 0.82rem;
        border-radius: 999px;
        background: #f4f4f1;
        outline: 1px solid rgba(22, 24, 34, 0.06);
        outline-offset: -1px;
        box-shadow: none;
      }

      .desktop-global-search.is-open .desktop-global-search-field {
        box-shadow: 0 10px 18px rgba(10, 17, 40, 0.05);
      }

      .desktop-global-search-prefix {
        font-size: 0.88rem;
        color: var(--cfm-color-copy-muted, #60758c);
        white-space: nowrap;
      }

      .desktop-global-search-field input {
        min-width: 0;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--cfm-color-ink, #161822);
        font-size: 0.92rem;
      }

      .desktop-global-search-field input::placeholder {
        color: color-mix(in srgb, var(--cfm-color-copy-muted, #60758c) 84%, white);
      }

      .desktop-global-search-field input:focus {
        outline: none;
      }

      .desktop-global-search-clear {
        border: 0;
        padding: 0;
        background: transparent;
        color: var(--cfm-color-copy-muted, #60758c);
        cursor: pointer;
        font-size: 0.76rem;
      }

      .desktop-global-search-panel {
        position: absolute;
        top: calc(100% + 0.45rem);
        left: 0;
        right: 0;
        z-index: 25;
        display: grid;
        gap: 0.8rem;
        max-height: min(32rem, calc(100vh - 11rem));
        overflow: auto;
        padding: 0.82rem;
        border-radius: 20px;
        background:
          radial-gradient(circle at top right, rgba(255, 222, 165, 0.12), transparent 24%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(242, 244, 247, 0.92));
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 90%, white);
        outline-offset: -1px;
        box-shadow: var(--cfm-shadow-overlay, 0 28px 44px rgba(10, 17, 40, 0.12));
      }

      .desktop-global-search-state,
      .desktop-global-search-section,
      .desktop-global-search-result-copy {
        display: grid;
        gap: 0.3rem;
      }

      .desktop-global-search-state p,
      .desktop-global-search-state strong {
        margin: 0;
      }

      .desktop-global-search-results {
        display: grid;
        gap: 0.95rem;
      }

      .desktop-global-search-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.6rem;
        padding: 0 0.15rem;
        color: var(--cfm-color-copy-muted, #60758c);
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .desktop-global-search-result {
        display: block;
        width: 100%;
        margin-top: 0.42rem;
        padding: 0.92rem 0.98rem;
        border: 0;
        border-radius: 20px;
        text-align: left;
        background:
          linear-gradient(180deg, rgba(248, 249, 252, 0.92), rgba(255, 255, 255, 0.86));
        cursor: pointer;
        transition:
          transform 140ms ease,
          background-color 140ms ease,
          box-shadow 140ms ease;
      }

      .desktop-global-search-result:hover {
        transform: translateY(-1px);
        box-shadow: var(--cfm-shadow-soft, 0 12px 22px rgba(10, 17, 40, 0.05));
      }

      .desktop-global-search-result-topline {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .desktop-global-search-result-detail {
        color: var(--cfm-color-copy, #2f3b4d);
      }

      .desktop-global-search-result-support {
        color: var(--cfm-color-copy-muted, #60758c);
        font-size: 0.9rem;
      }

      @media (max-width: 960px) {
        .desktop-global-search-field {
          grid-template-columns: 1fr auto;
          gap: 0.55rem;
          min-height: 3.6rem;
          padding-inline: 0.85rem;
        }

        .desktop-global-search-prefix {
          display: none;
        }
      }
    `,
  ],
})
export class DesktopGlobalSearchComponent {
  @Input() membership: MembershipAccess | null = null;
  @Input() placeholder = "Rechercher un document…";

  @ViewChild("searchInput")
  private searchInput?: ElementRef<HTMLInputElement>;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly searchService = inject(DesktopGlobalSearchService);

  query = "";
  sections: DesktopGlobalSearchSection[] = [];
  loading = false;
  panelOpen = false;
  errorMessage = "";

  private debounceId: ReturnType<typeof setTimeout> | null = null;
  private activeSearchId = 0;

  openPanel(): void {
    this.panelOpen = true;
  }

  clearQuery(): void {
    this.query = "";
    this.sections = [];
    this.loading = false;
    this.errorMessage = "";
    this.activeSearchId += 1;
    if (this.debounceId !== null) {
      globalThis.clearTimeout(this.debounceId);
      this.debounceId = null;
    }
    this.searchInput?.nativeElement.focus();
  }

  onQueryInput(event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    const nextValue = (input?.value ?? "").toString();
    this.query = nextValue;
    this.panelOpen = true;
    this.errorMessage = "";

    if (this.debounceId !== null) {
      globalThis.clearTimeout(this.debounceId);
      this.debounceId = null;
    }

    const normalizedQuery = this.query.trim();
    if (normalizedQuery.length < 2) {
      this.loading = false;
      this.sections = [];
      this.activeSearchId += 1;
      return;
    }

    this.loading = true;
    const searchId = ++this.activeSearchId;

    this.debounceId = globalThis.setTimeout(() => {
      void this.runSearch(searchId);
    }, 160);
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.closePanel();
      return;
    }

    if (event.key === "Enter") {
      const firstMatch = this.sections[0]?.items[0];
      if (!firstMatch) {
        return;
      }
      event.preventDefault();
      this.openResult(firstMatch);
    }
  }

  async openResult(item: DesktopGlobalSearchResult): Promise<void> {
    this.closePanel();
    await this.router.navigateByUrl(item.route);
  }

  trackBySection(_index: number, section: DesktopGlobalSearchSection): string {
    return section.id;
  }

  trackByResult(_index: number, item: DesktopGlobalSearchResult): string {
    return item.id;
  }

  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: Event): void {
    const target = event.target;
    if (target instanceof Node && !this.host.nativeElement.contains(target)) {
      this.closePanel();
    }
  }

  private async runSearch(searchId: number): Promise<void> {
    try {
      const nextSections = await this.searchService.search(this.query, this.membership);
      if (searchId !== this.activeSearchId) {
        return;
      }
      this.sections = nextSections;
    } catch {
      if (searchId !== this.activeSearchId) {
        return;
      }
      this.sections = [];
      this.errorMessage = "Les résultats ne peuvent pas être chargés pour le moment.";
    } finally {
      if (searchId === this.activeSearchId) {
        this.loading = false;
      }
    }
  }

  private closePanel(): void {
    this.panelOpen = false;
  }
}
