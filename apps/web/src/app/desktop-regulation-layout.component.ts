import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CfmButtonComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";

import { DESKTOP_REGULATION_PAGE_CONTEXT } from "./desktop-regulation-page-context";

type RegulationSectionConfig = {
  lead: string;
  chipLabel: string;
  chipTone: CfmTone;
  primaryAction: { kind: "route"; label: string; route: string } | { kind: "export"; label: string };
};

@Component({
  selector: "cfm-desktop-regulation-layout",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, CfmButtonComponent, CfmStatusChipComponent],
  template: `
    <section class="cfm-reg-shell">
      <header class="cfm-editorial-hero cfm-reg-hero">
        <div class="cfm-reg-hero-copy">
          <span class="cfm-hero-kicker">Réglementation & veille</span>
          <h2 class="cfm-reg-hero-title">Réglementation & veille</h2>
          <div class="cfm-pill-row">
            <cfm-status-chip [label]="currentSection.chipLabel" [tone]="currentSection.chipTone" />
          </div>
          <p class="cfm-hero-lead">{{ currentSection.lead }}</p>
        </div>

        <div class="cfm-reg-hero-side">
          <cfm-button
            *ngIf="currentSection.primaryAction.kind === 'route'; else exportAction"
            type="button"
            size="sm"
            [routerLink]="[currentSection.primaryAction.route]"
          >
            {{ currentSection.primaryAction.label }}
          </cfm-button>

          <ng-template #exportAction>
            <cfm-button
              type="button"
              size="sm"
              [disabled]="!ctx.canExportReglementation || ctx.regulatoryExporting"
              (click)="ctx.exportRegulatoryPdf()"
            >
              {{ ctx.regulatoryExporting ? "Génération..." : currentSection.primaryAction.label }}
            </cfm-button>
          </ng-template>

          <section class="cfm-reg-kpis">
            <article class="cfm-reg-kpi">
              <span class="small">Score</span>
              <strong>{{ ctx.regulatoryComplianceScore }}/100</strong>
              <span>{{ ctx.regulatoryShowcaseSummary?.statusLabel || "Lecture actuelle" }}</span>
            </article>
            <article class="cfm-reg-kpi">
              <span class="small">Priorités</span>
              <strong>{{ ctx.regulatoryPriorityItems.length }}</strong>
              <span>point{{ ctx.regulatoryPriorityItems.length > 1 ? "s" : "" }} actif{{ ctx.regulatoryPriorityItems.length > 1 ? "s" : "" }}</span>
            </article>
            <article class="cfm-reg-kpi">
              <span class="small">Preuves</span>
              <strong>{{ ctx.regulatoryEvidenceAvailableCount }}</strong>
              <span>{{ ctx.regulatoryMissingProofCount }} à compléter</span>
            </article>
            <article class="cfm-reg-kpi">
              <span class="small">Sites</span>
              <strong>{{ ctx.regulatoryAllSites.length }}</strong>
              <span>{{ ctx.regulatoryIncompleteSitesCount }} à revoir</span>
            </article>
          </section>
        </div>
      </header>

      <nav class="cfm-soft-nav cfm-soft-nav--quiet regulation-subnav">
        <a routerLink="/app/reglementation/synthese" routerLinkActive="is-active" class="cfm-soft-nav__link">
          Synthèse
        </a>
        <a routerLink="/app/reglementation/obligations" routerLinkActive="is-active" class="cfm-soft-nav__link">
          Obligations
        </a>
        <a routerLink="/app/reglementation/preuves" routerLinkActive="is-active" class="cfm-soft-nav__link">
          Preuves
        </a>
        <a routerLink="/app/reglementation/sites" routerLinkActive="is-active" class="cfm-soft-nav__link">
          Sites
        </a>
        <a routerLink="/app/reglementation/exports" routerLinkActive="is-active" class="cfm-soft-nav__link">
          Exports
        </a>
      </nav>

      <router-outlet />
    </section>
  `,
  styles: [
    `
      .module-page {
        display: grid;
        gap: 1rem;
      }

      :host {
        display: block;
      }

      .regulation-subnav {
        align-self: start;
      }
    `,
  ],
})
export class DesktopRegulationLayoutComponent {
  readonly ctx = inject(DESKTOP_REGULATION_PAGE_CONTEXT);
  private readonly router = inject(Router);

  get currentSection(): RegulationSectionConfig {
    const path = this.router.url.split("?")[0] || "/app/reglementation/synthese";

    if (path.startsWith("/app/reglementation/obligations")) {
      return {
        lead: "Un registre réglementaire plus lisible pour prioriser, vérifier et agir sans s’enfermer dans une lecture administrative.",
        chipLabel: "Obligations",
        chipTone: "warning",
        primaryAction: { kind: "route", label: "Voir les preuves", route: "/app/reglementation/preuves" },
      };
    }

    if (path.startsWith("/app/reglementation/preuves")) {
      return {
        lead: "Les justificatifs utiles remontent dans un flux documentaire plus métier, avec les manques et la prochaine action clairement lisibles.",
        chipLabel: "Preuves",
        chipTone: "progress",
        primaryAction: { kind: "route", label: "Ouvrir Documents", route: "/app/documents" },
      };
    }

    if (path.startsWith("/app/reglementation/sites")) {
      return {
        lead: "Les sites, leurs alertes et leur niveau de préparation se lisent maintenant comme un workspace de suivi, pas comme une fiche technique dense.",
        chipLabel: "Sites",
        chipTone: "calm",
        primaryAction: { kind: "route", label: "Voir les obligations", route: "/app/reglementation/obligations" },
      };
    }

    if (path.startsWith("/app/reglementation/exports")) {
      return {
        lead: "Le dossier réglementaire regroupe ce qui est prêt, ce qui manque encore et l’export utile dans une lecture de remise claire.",
        chipLabel: "Dossier réglementaire",
        chipTone: "success",
        primaryAction: { kind: "export", label: "Exporter le dossier" },
      };
    }

    return {
      lead: "Une veille réglementaire plus claire, orientée priorités, preuves et sites à suivre, dans un seul workspace plus facile à scanner.",
      chipLabel: "Synthèse",
      chipTone: "calm",
      primaryAction: { kind: "route", label: "Voir les obligations", route: "/app/reglementation/obligations" },
    };
  }
}
