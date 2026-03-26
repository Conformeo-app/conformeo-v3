import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CfmButtonComponent, CfmCardComponent, CfmStatusChipComponent, } from "@conformeo/ui";
import { DESKTOP_SHELL_CONTEXT } from "./desktop-shell-context";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _c0 = () => ({ exact: true });
function DesktopShellComponent_div_3_cfm_status_chip_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 20);
} if (rf & 2) {
    const moduleCode_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("label", ctx_r2.ctx.getModuleNavigationLabel(moduleCode_r2));
} }
function DesktopShellComponent_div_3_cfm_status_chip_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 21);
} }
function DesktopShellComponent_div_3_ng_container_8_option_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 25);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    i0.ɵɵproperty("value", item_r5.organization.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", item_r5.organization.name, " ");
} }
function DesktopShellComponent_div_3_ng_container_8_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "label", 22)(2, "span");
    i0.ɵɵtext(3, "Organisation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "select", 23);
    i0.ɵɵtwoWayListener("ngModelChange", function DesktopShellComponent_div_3_ng_container_8_Template_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.ctx.selectedOrganizationId, $event) || (ctx_r2.ctx.selectedOrganizationId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("change", function DesktopShellComponent_div_3_ng_container_8_Template_select_change_4_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.ctx.changeOrganization()); });
    i0.ɵɵtemplate(5, DesktopShellComponent_div_3_ng_container_8_option_5_Template, 2, 2, "option", 24);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.ctx.selectedOrganizationId);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r2.ctx.session.memberships);
} }
function DesktopShellComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 11)(1, "div", 12)(2, "p", 13);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 14);
    i0.ɵɵtemplate(5, DesktopShellComponent_div_3_cfm_status_chip_5_Template, 1, 1, "cfm-status-chip", 15)(6, DesktopShellComponent_div_3_cfm_status_chip_6_Template, 1, 0, "cfm-status-chip", 16);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 17);
    i0.ɵɵtemplate(8, DesktopShellComponent_div_3_ng_container_8_Template, 6, 2, "ng-container", 18);
    i0.ɵɵelementStart(9, "cfm-button", 19);
    i0.ɵɵlistener("click", function DesktopShellComponent_div_3_Template_cfm_button_click_9_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.ctx.logout()); });
    i0.ɵɵtext(10, " Se d\u00E9connecter ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const membership_r6 = ctx.ngIf;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", ctx_r2.ctx.session == null ? null : ctx_r2.ctx.session.user == null ? null : ctx_r2.ctx.session.user.display_name, " \u00B7 ", membership_r6.membership.role_code, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", membership_r6.enabled_modules);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", membership_r6.enabled_modules.length === 0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.session && ctx_r2.ctx.session.memberships.length > 1);
} }
function DesktopShellComponent_a_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 26);
    i0.ɵɵelement(1, "span", 27)(2, "cfm-status-chip", 28);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r7 = ctx.$implicit;
    i0.ɵɵproperty("routerLink", item_r7.route)("routerLinkActiveOptions", i0.ɵɵpureFunction0(4, _c0));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", item_r7.label)("tone", item_r7.tone);
} }
function DesktopShellComponent_section_7_cfm_status_chip_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 36);
} }
function DesktopShellComponent_section_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 29)(1, "div", 30)(2, "p", 31);
    i0.ɵɵtext(3, "Zone active");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "strong", 32);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 33);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 34);
    i0.ɵɵelement(9, "cfm-status-chip", 28);
    i0.ɵɵtemplate(10, DesktopShellComponent_section_7_cfm_status_chip_10_Template, 1, 0, "cfm-status-chip", 35);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const context_r8 = ctx.ngIf;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(context_r8.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(context_r8.description);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", context_r8.moduleLabel)("tone", context_r8.tone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.isWorkspaceRefreshing);
} }
function DesktopShellComponent_div_9_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41)(1, "span", 42);
    i0.ɵɵtext(2, "Action indisponible");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 43);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.ctx.errorMessage);
} }
function DesktopShellComponent_div_9_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 42);
    i0.ɵɵtext(2, "Mise \u00E0 jour en cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 43);
    i0.ɵɵtext(4, "Les donn\u00E9es restent visibles pendant l\u2019actualisation.");
    i0.ɵɵelementEnd()();
} }
function DesktopShellComponent_div_9_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 45)(1, "span", 42);
    i0.ɵɵtext(2, "Action termin\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 43);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.ctx.feedbackMessage);
} }
function DesktopShellComponent_div_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 37);
    i0.ɵɵtemplate(1, DesktopShellComponent_div_9_div_1_Template, 5, 1, "div", 38)(2, DesktopShellComponent_div_9_div_2_Template, 5, 0, "div", 39)(3, DesktopShellComponent_div_9_div_3_Template, 5, 1, "div", 40);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.errorMessage);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.isWorkspaceRefreshing && !ctx_r2.ctx.errorMessage);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.feedbackMessage && !ctx_r2.ctx.errorMessage);
} }
export class DesktopShellComponent {
    ctx = inject(DESKTOP_SHELL_CONTEXT);
    router = inject(Router);
    get workspaceContext() {
        const url = this.router.url;
        if (url.startsWith("/app/reglementation")) {
            return {
                title: "Copilote conformité",
                description: "Situation, priorités, preuves et sujets à traiter dans un même workspace.",
                moduleLabel: "Réglementation",
                tone: "progress",
            };
        }
        if (url.startsWith("/app/chantier/documents")) {
            return {
                title: "Documents chantier",
                description: "Pièces, signatures et exports utiles au suivi terrain.",
                moduleLabel: "Chantier",
                tone: "calm",
            };
        }
        if (url.startsWith("/app/chantier/coordination")) {
            return {
                title: "Coordination",
                description: "Lecture simple des actions à traiter entre terrain, documents et affectations.",
                moduleLabel: "Chantier",
                tone: "progress",
            };
        }
        if (url.startsWith("/app/chantier")) {
            return {
                title: "Suivi chantier",
                description: "Sites, documents et coordination légère pour avancer sans se disperser.",
                moduleLabel: "Chantier",
                tone: "calm",
            };
        }
        if (url.startsWith("/app/facturation")) {
            return {
                title: "Pilotage facturation",
                description: "Clients, devis, factures et suivi d’exploitation dans une même zone de travail.",
                moduleLabel: "Facturation",
                tone: "calm",
            };
        }
        return {
            title: "Cockpit quotidien",
            description: "Synthèse, sites et actions utiles pour garder une lecture simple du workspace.",
            moduleLabel: "Cockpit",
            tone: "success",
        };
    }
    static ɵfac = function DesktopShellComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DesktopShellComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DesktopShellComponent, selectors: [["cfm-desktop-shell"]], standalone: true, features: [i0.ɵɵStandaloneFeature], decls: 12, vars: 5, consts: [[1, "shell", "shell-workspace"], [1, "workspace", "app-shell"], ["eyebrow", "Conformeo Desktop", "description", "Bureau", 1, "desktop-card", "app-shell-header-card", 3, "title"], ["class", "session-header", 4, "ngIf"], [1, "workspace-overview-bar"], [1, "app-nav"], ["class", "app-nav-link", "routerLinkActive", "is-active", 3, "routerLink", "routerLinkActiveOptions", 4, "ngFor", "ngForOf"], ["class", "workspace-context-panel", 4, "ngIf"], [1, "workspace-main-column"], ["class", "workspace-feedback-stack", 4, "ngIf"], [1, "workspace-body", "workspace-content-surface"], [1, "session-header"], [1, "workspace-shell-copy"], [1, "meta", "workspace-shell-meta"], [1, "chips"], ["tone", "success", 3, "label", 4, "ngFor", "ngForOf"], ["label", "Aucun module actif", "tone", "neutral", 4, "ngIf"], [1, "session-actions", "workspace-shell-actions"], [4, "ngIf"], ["type", "button", "variant", "secondary", 3, "click"], ["tone", "success", 3, "label"], ["label", "Aucun module actif", "tone", "neutral"], [1, "organization-switch"], ["name", "organizationId", 3, "ngModelChange", "change", "ngModel"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"], ["routerLinkActive", "is-active", 1, "app-nav-link", 3, "routerLink", "routerLinkActiveOptions"], ["aria-hidden", "true", 1, "nav-icon-placeholder"], [3, "label", "tone"], [1, "workspace-context-panel"], [1, "workspace-context-copy"], [1, "meta", "workspace-context-kicker"], [1, "workspace-context-title"], [1, "small"], [1, "chips", "workspace-context-chips"], ["label", "Mise \u00E0 jour en cours", "tone", "progress", 4, "ngIf"], ["label", "Mise \u00E0 jour en cours", "tone", "progress"], [1, "workspace-feedback-stack"], ["class", "feedback error", 4, "ngIf"], ["class", "feedback progress", 4, "ngIf"], ["class", "feedback success", 4, "ngIf"], [1, "feedback", "error"], [1, "feedback-title"], [1, "feedback-body"], [1, "feedback", "progress"], [1, "feedback", "success"]], template: function DesktopShellComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "section", 1)(2, "cfm-card", 2);
            i0.ɵɵtemplate(3, DesktopShellComponent_div_3_Template, 11, 5, "div", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "section", 4)(5, "nav", 5);
            i0.ɵɵtemplate(6, DesktopShellComponent_a_6_Template, 3, 5, "a", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(7, DesktopShellComponent_section_7_Template, 11, 5, "section", 7);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "div", 8);
            i0.ɵɵtemplate(9, DesktopShellComponent_div_9_Template, 4, 3, "div", 9);
            i0.ɵɵelementStart(10, "section", 10);
            i0.ɵɵelement(11, "router-outlet");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("title", (tmp_0_0 = ctx.ctx.currentMembership == null ? null : ctx.ctx.currentMembership.organization == null ? null : ctx.ctx.currentMembership.organization.name) !== null && tmp_0_0 !== undefined ? tmp_0_0 : "Conform\u00E9o");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.ctx.currentMembership);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngForOf", ctx.ctx.desktopNavigationItems);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.workspaceContext);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.ctx.errorMessage || ctx.ctx.isWorkspaceRefreshing || ctx.ctx.feedbackMessage);
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, FormsModule, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.SelectControlValueAccessor, i2.NgControlStatus, i2.NgModel, RouterLink,
            RouterLinkActive,
            RouterOutlet,
            CfmButtonComponent,
            CfmCardComponent,
            CfmStatusChipComponent], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DesktopShellComponent, [{
        type: Component,
        args: [{
                selector: "cfm-desktop-shell",
                standalone: true,
                imports: [
                    CommonModule,
                    FormsModule,
                    RouterLink,
                    RouterLinkActive,
                    RouterOutlet,
                    CfmButtonComponent,
                    CfmCardComponent,
                    CfmStatusChipComponent,
                ],
                template: `
    <main class="shell shell-workspace">
      <section class="workspace app-shell">
        <cfm-card
          class="desktop-card app-shell-header-card"
          eyebrow="Conformeo Desktop"
          [title]="ctx.currentMembership?.organization?.name ?? 'Conforméo'"
          description="Bureau"
        >
          <div class="session-header" *ngIf="ctx.currentMembership as membership">
            <div class="workspace-shell-copy">
              <p class="meta workspace-shell-meta">
                {{ ctx.session?.user?.display_name }} · {{ membership.membership.role_code }}
              </p>
              <div class="chips">
                <cfm-status-chip
                  *ngFor="let moduleCode of membership.enabled_modules"
                  [label]="ctx.getModuleNavigationLabel(moduleCode)"
                  tone="success"
                />
                <cfm-status-chip
                  *ngIf="membership.enabled_modules.length === 0"
                  label="Aucun module actif"
                  tone="neutral"
                />
              </div>
            </div>

            <div class="session-actions workspace-shell-actions">
              <ng-container *ngIf="ctx.session && ctx.session.memberships.length > 1">
                <label class="organization-switch">
                  <span>Organisation</span>
                  <select
                    [(ngModel)]="ctx.selectedOrganizationId"
                    name="organizationId"
                    (change)="ctx.changeOrganization()"
                  >
                    <option *ngFor="let item of ctx.session.memberships" [value]="item.organization.id">
                      {{ item.organization.name }}
                    </option>
                  </select>
                </label>
              </ng-container>

              <cfm-button type="button" variant="secondary" (click)="ctx.logout()">
                Se déconnecter
              </cfm-button>
            </div>
          </div>
        </cfm-card>

        <section class="workspace-overview-bar">
          <nav class="app-nav">
            <a
              *ngFor="let item of ctx.desktopNavigationItems"
              class="app-nav-link"
              [routerLink]="item.route"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              <span class="nav-icon-placeholder" aria-hidden="true"></span>
              <cfm-status-chip [label]="item.label" [tone]="item.tone" />
            </a>
          </nav>

          <section class="workspace-context-panel" *ngIf="workspaceContext as context">
            <div class="workspace-context-copy">
              <p class="meta workspace-context-kicker">Zone active</p>
              <strong class="workspace-context-title">{{ context.title }}</strong>
              <p class="small">{{ context.description }}</p>
            </div>

            <div class="chips workspace-context-chips">
              <cfm-status-chip [label]="context.moduleLabel" [tone]="context.tone" />
              <cfm-status-chip
                *ngIf="ctx.isWorkspaceRefreshing"
                label="Mise à jour en cours"
                tone="progress"
              />
            </div>
          </section>
        </section>

        <div class="workspace-main-column">
          <div class="workspace-feedback-stack" *ngIf="ctx.errorMessage || ctx.isWorkspaceRefreshing || ctx.feedbackMessage">
            <div class="feedback error" *ngIf="ctx.errorMessage">
              <span class="feedback-title">Action indisponible</span>
              <span class="feedback-body">{{ ctx.errorMessage }}</span>
            </div>
            <div class="feedback progress" *ngIf="ctx.isWorkspaceRefreshing && !ctx.errorMessage">
              <span class="feedback-title">Mise à jour en cours</span>
              <span class="feedback-body">Les données restent visibles pendant l’actualisation.</span>
            </div>
            <div class="feedback success" *ngIf="ctx.feedbackMessage && !ctx.errorMessage">
              <span class="feedback-title">Action terminée</span>
              <span class="feedback-body">{{ ctx.feedbackMessage }}</span>
            </div>
          </div>

          <section class="workspace-body workspace-content-surface">
            <router-outlet />
          </section>
        </div>
      </section>
    </main>
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DesktopShellComponent, { className: "DesktopShellComponent" }); })();
