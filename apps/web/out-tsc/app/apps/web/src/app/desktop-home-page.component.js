import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CfmButtonComponent, CfmCardComponent, CfmInputComponent, CfmStatusChipComponent, } from "@conformeo/ui";
import { DESKTOP_SHELL_CONTEXT } from "./desktop-shell-context";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
function DesktopHomePageComponent_div_12_article_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 33)(1, "p", 12);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "cfm-status-chip", 15);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const kpi_r1 = ctx.$implicit;
    i0.ɵɵclassProp("dashboard-kpi-card--attention", kpi_r1.tone === "warning" || kpi_r1.tone === "critical");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(kpi_r1.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(kpi_r1.value);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(kpi_r1.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", kpi_r1.statusLabel)("tone", kpi_r1.tone);
} }
function DesktopHomePageComponent_div_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 31);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_div_12_article_1_Template, 8, 7, "article", 32);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.ctx.dashboardKpis);
} }
function DesktopHomePageComponent_ng_template_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "p", 35);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 12);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("empty-copy--loading", ctx_r1.ctx.isWorkspaceRefreshing);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Mise \u00E0 jour en cours" : "Aucun rep\u00E8re pour le moment", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Les rep\u00E8res du cockpit arrivent." : "Le cockpit affichera ici les points utiles \u00E0 suivre.", " ");
} }
function DesktopHomePageComponent_ul_19_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 38)(1, "div", 39)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 13);
    i0.ɵɵelement(7, "cfm-status-chip", 15);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const alert_r3 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(alert_r3.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(alert_r3.description);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", alert_r3.moduleLabel)("tone", alert_r3.tone);
} }
function DesktopHomePageComponent_ul_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 36);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_ul_19_li_1_Template, 8, 4, "li", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.ctx.dashboardAlerts);
} }
function DesktopHomePageComponent_ng_template_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "p", 35);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 12);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("empty-copy--loading", ctx_r1.ctx.isWorkspaceRefreshing);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Mise \u00E0 jour en cours" : "Aucune priorit\u00E9 critique", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Les alertes utiles se pr\u00E9parent." : "Rien d\u2019urgent pour le moment.", " ");
} }
function DesktopHomePageComponent_div_23_article_1_div_7_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 47)(1, "span", 12);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong", 48);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const highlight_r4 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(highlight_r4.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(highlight_r4.value);
} }
function DesktopHomePageComponent_div_23_article_1_div_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 45);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_div_23_article_1_div_7_div_1_Template, 5, 2, "div", 46);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const card_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", card_r5.highlights);
} }
function DesktopHomePageComponent_div_23_article_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 42)(1, "p", 12);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong", 43);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, DesktopHomePageComponent_div_23_article_1_div_7_Template, 2, 1, "div", 44);
    i0.ɵɵelement(8, "cfm-status-chip", 15);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const card_r5 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(card_r5.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(card_r5.headline);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(card_r5.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", card_r5.highlights.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", card_r5.statusLabel)("tone", card_r5.tone);
} }
function DesktopHomePageComponent_div_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_div_23_article_1_Template, 9, 6, "article", 41);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.ctx.dashboardEnterpriseOverviewCards);
} }
function DesktopHomePageComponent_ng_template_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "p", 35);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 12);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("empty-copy--loading", ctx_r1.ctx.isWorkspaceRefreshing);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Mise \u00E0 jour en cours" : "Aucun rep\u00E8re par module", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Les modules se mettent \u00E0 jour." : "La vue d\u2019ensemble apparaitra ici d\u00E8s qu\u2019un rep\u00E8re remonte.", " ");
} }
function DesktopHomePageComponent_section_28_cfm_button_9_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 54);
    i0.ɵɵlistener("click", function DesktopHomePageComponent_section_28_cfm_button_9_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.ctx.openHomeSiteQuickCreate()); });
    i0.ɵɵtext(1, " Ajouter un site ");
    i0.ɵɵelementEnd();
} }
function DesktopHomePageComponent_section_28_form_10_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 55);
    i0.ɵɵlistener("ngSubmit", function DesktopHomePageComponent_section_28_form_10_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.ctx.createSite()); });
    i0.ɵɵelementStart(1, "cfm-input", 56);
    i0.ɵɵtwoWayListener("ngModelChange", function DesktopHomePageComponent_section_28_form_10_Template_cfm_input_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.ctx.siteForm.name, $event) || (ctx_r1.ctx.siteForm.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "cfm-input", 57);
    i0.ɵɵtwoWayListener("ngModelChange", function DesktopHomePageComponent_section_28_form_10_Template_cfm_input_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.ctx.siteForm.address, $event) || (ctx_r1.ctx.siteForm.address = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 58)(4, "cfm-button", 59);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "cfm-button", 60);
    i0.ɵɵlistener("click", function DesktopHomePageComponent_section_28_form_10_Template_cfm_button_click_6_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.ctx.closeHomeSiteQuickCreate()); });
    i0.ɵɵtext(7, " Annuler ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.ctx.siteForm.name);
    i0.ɵɵproperty("disabled", ctx_r1.ctx.organizationSiteSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.ctx.siteForm.address);
    i0.ɵɵproperty("disabled", ctx_r1.ctx.organizationSiteSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.ctx.organizationSiteSaving || !ctx_r1.ctx.canCreateSite);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.organizationSiteSaving ? "Cr\u00E9ation en cours" : "Cr\u00E9er le site", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.ctx.organizationSiteSaving);
} }
function DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 12);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re tentative : ", i0.ɵɵpipeBind2(2, 1, site_r8.location_enrichment_attempted_at, "dd/MM/yyyy HH:mm"), " ");
} }
function DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_p_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const enrichment_r9 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(enrichment_r9.reasonLabel);
} }
function DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_p_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Adresse reconnue : ", site_r8.normalized_address, "");
} }
function DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_p_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(site_r8.site_risk_summary);
} }
function DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_cfm_button_18_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 72);
    i0.ɵɵlistener("click", function DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_cfm_button_18_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const site_r8 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.ctx.relaunchSiteEnrichment(site_r8)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const enrichment_r9 = i0.ɵɵnextContext().ngIf;
    const site_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("variant", enrichment_r9.showRetryAsPrimary ? "secondary" : "ghost")("disabled", ctx_r1.ctx.organizationSiteEnrichmentBusyId === site_r8.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.organizationSiteEnrichmentBusyId === site_r8.id ? "Relance en cours" : enrichment_r9.retryLabel, " ");
} }
function DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 65)(2, "div", 66)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 13);
    i0.ɵɵelement(6, "cfm-status-chip", 67);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 68)(10, "div", 69);
    i0.ɵɵelement(11, "cfm-status-chip", 15);
    i0.ɵɵtemplate(12, DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_span_12_Template, 3, 4, "span", 70);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "p");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_p_15_Template, 2, 1, "p", 70)(16, DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_p_16_Template, 2, 1, "p", 70)(17, DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_p_17_Template, 2, 1, "p", 70);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(18, DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_cfm_button_18_Template, 2, 3, "cfm-button", 71);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const enrichment_r9 = ctx.ngIf;
    const site_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(site_r8.name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r1.ctx.getSiteTypeLabel(site_r8.site_type));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(site_r8.address);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", enrichment_r9.label)("tone", enrichment_r9.tone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", site_r8.location_enrichment_attempted_at);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(enrichment_r9.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", enrichment_r9.reasonLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", site_r8.normalized_address);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", site_r8.site_risk_summary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.ctx.canManageOrganization);
} }
function DesktopHomePageComponent_section_28_ul_11_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 63);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_section_28_ul_11_li_1_ng_container_1_Template, 19, 11, "ng-container", 64);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r8 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.ctx.getSiteEnrichmentUiState(site_r8));
} }
function DesktopHomePageComponent_section_28_ul_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 61);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_section_28_ul_11_li_1_Template, 2, 1, "li", 62);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.ctx.organizationSites);
} }
function DesktopHomePageComponent_section_28_ng_template_12_div_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74)(1, "p", 35);
    i0.ɵɵtext(2, "Aucun site enregistr\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 12);
    i0.ɵɵtext(4, "Ajoutez un premier site pour lancer automatiquement l\u2019enrichissement.");
    i0.ɵɵelementEnd()();
} }
function DesktopHomePageComponent_section_28_ng_template_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, DesktopHomePageComponent_section_28_ng_template_12_div_0_Template, 5, 0, "div", 73);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("ngIf", !ctx_r1.ctx.homeSiteQuickCreateOpen);
} }
function DesktopHomePageComponent_section_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 49)(1, "div", 50)(2, "div", 11)(3, "h3");
    i0.ɵɵtext(4, "Sites d\u2019entreprise");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 12);
    i0.ɵɵtext(6, " Ajoutez un site pour lancer l\u2019enrichissement d\u2019adresse et de risques sans ouvrir le module chantier. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 13);
    i0.ɵɵelement(8, "cfm-status-chip", 15);
    i0.ɵɵtemplate(9, DesktopHomePageComponent_section_28_cfm_button_9_Template, 2, 0, "cfm-button", 51);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(10, DesktopHomePageComponent_section_28_form_10_Template, 8, 7, "form", 52)(11, DesktopHomePageComponent_section_28_ul_11_Template, 2, 1, "ul", 53)(12, DesktopHomePageComponent_section_28_ng_template_12_Template, 1, 1, "ng-template", null, 6, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const emptyHomeSites_r11 = i0.ɵɵreference(13);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("label", ctx_r1.ctx.organizationSites.length > 0 ? ctx_r1.ctx.organizationSites.length + " site" + (ctx_r1.ctx.organizationSites.length > 1 ? "s" : "") : "Aucun site")("tone", ctx_r1.ctx.organizationSites.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.ctx.canManageOrganization && !ctx_r1.ctx.homeSiteQuickCreateOpen);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.ctx.canManageOrganization && ctx_r1.ctx.homeSiteQuickCreateOpen);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.ctx.organizationSites.length > 0)("ngIfElse", emptyHomeSites_r11);
} }
function DesktopHomePageComponent_ul_37_li_1_p_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r12.financialSummary);
} }
function DesktopHomePageComponent_ul_37_li_1_p_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r12.regulatorySummary);
} }
function DesktopHomePageComponent_ul_37_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 38)(1, "div", 75)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "p");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(12, DesktopHomePageComponent_ul_37_li_1_p_12_Template, 2, 1, "p", 64)(13, DesktopHomePageComponent_ul_37_li_1_p_13_Template, 2, 1, "p", 64);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div", 13);
    i0.ɵɵelement(15, "cfm-status-chip", 15)(16, "cfm-status-chip", 15);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r12 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r12.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r12.summary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r12.operationalSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r12.taskSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r12.linkedWorksiteDocumentsSummary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r12.financialSummary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r12.regulatorySummary);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", item_r12.statusLabel)("tone", item_r12.statusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r12.signalLabel)("tone", item_r12.signalTone);
} }
function DesktopHomePageComponent_ul_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 36);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_ul_37_li_1_Template, 17, 11, "li", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.ctx.filteredDashboardWorksiteOverviewItems);
} }
function DesktopHomePageComponent_ng_template_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "p", 35);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 12);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("empty-copy--loading", ctx_r1.ctx.isWorkspaceRefreshing);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Mise \u00E0 jour en cours" : "Aucun chantier \u00E0 suivre", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Les rep\u00E8res chantier se mettent \u00E0 jour." : "Aucun point terrain ne demande d\u2019action.", " ");
} }
function DesktopHomePageComponent_ul_51_li_1_p_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r13.context);
} }
function DesktopHomePageComponent_ul_51_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 38)(1, "div", 39)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, DesktopHomePageComponent_ul_51_li_1_p_6_Template, 2, 1, "p", 64);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 13);
    i0.ɵɵelement(8, "cfm-status-chip", 15)(9, "cfm-status-chip", 15);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r13 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r13.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r13.description);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r13.context);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", item_r13.kindLabel)("tone", item_r13.kindTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r13.statusLabel)("tone", item_r13.statusTone);
} }
function DesktopHomePageComponent_ul_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 36);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_ul_51_li_1_Template, 10, 7, "li", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.ctx.coordinationTodoItems);
} }
function DesktopHomePageComponent_ng_template_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "p", 35);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 12);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("empty-copy--loading", ctx_r1.ctx.isWorkspaceRefreshing);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Mise \u00E0 jour en cours" : "Aucun point \u00E0 traiter", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Le suivi quotidien se pr\u00E9pare." : "Rien d\u2019urgent c\u00F4t\u00E9 coordination.", " ");
} }
function DesktopHomePageComponent_ul_63_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 38)(1, "div", 39)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 13);
    i0.ɵɵelement(9, "cfm-status-chip", 15)(10, "cfm-status-chip", 15);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r14 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r14.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r14.summary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r14.context);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", item_r14.statusLabel)("tone", item_r14.statusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r14.signalLabel)("tone", item_r14.signalTone);
} }
function DesktopHomePageComponent_ul_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 36);
    i0.ɵɵtemplate(1, DesktopHomePageComponent_ul_63_li_1_Template, 11, 7, "li", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.ctx.dashboardCustomerOverviewItems);
} }
function DesktopHomePageComponent_ng_template_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "p", 35);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 12);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("empty-copy--loading", ctx_r1.ctx.isWorkspaceRefreshing);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Mise \u00E0 jour en cours" : "Aucun client \u00E0 suivre", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.ctx.isWorkspaceRefreshing ? "Les rep\u00E8res client se mettent \u00E0 jour." : "Aucun suivi client prioritaire pour le moment.", " ");
} }
export class DesktopHomePageComponent {
    ctx = inject(DESKTOP_SHELL_CONTEXT);
    static ɵfac = function DesktopHomePageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DesktopHomePageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DesktopHomePageComponent, selectors: [["cfm-desktop-home-page"]], standalone: true, features: [i0.ɵɵStandaloneFeature], decls: 66, vars: 25, consts: [["emptyKpis", ""], ["emptyAlerts", ""], ["emptyOverview", ""], ["emptyWorksites", ""], ["emptyCoordination", ""], ["emptyCustomers", ""], ["emptyHomeSites", ""], [1, "workspace-body", "home-workspace"], [1, "home-overview-layout"], ["eyebrow", "Cockpit", "title", "Pilotage du jour", "description", "Les points \u00E0 surveiller maintenant.", 1, "desktop-card", "home-section-card", "home-section-card--kpis"], [1, "hero-line"], [1, "hero-copy"], [1, "small"], [1, "hero-chips"], [1, "hero-chip-primary"], [3, "label", "tone"], [1, "hero-chip-secondary"], ["class", "dashboard-grid dashboard-grid--kpis", 4, "ngIf", "ngIfElse"], [1, "home-overview-rail"], ["eyebrow", "Priorit\u00E9s", "title", "Actions prioritaires", "description", "Ce qui demande une action maintenant.", 1, "desktop-card", "home-section-card", "home-section-card--alerts"], ["class", "alert-list", 4, "ngIf", "ngIfElse"], ["eyebrow", "Vue d\u2019ensemble", "title", "Rep\u00E8res par module", "description", "Lecture rapide des modules.", 1, "desktop-card", "home-section-card", "home-section-card--overview"], ["class", "dashboard-grid dashboard-grid--overview", 4, "ngIf", "ngIfElse"], [1, "home-activity-layout"], ["eyebrow", "Chantiers", "title", "Chantiers \u00E0 suivre", "description", "Les points utiles pour d\u00E9cider vite.", 1, "desktop-card", "home-section-card", "home-section-card--worksites"], ["class", "home-site-entry", 4, "ngIf"], [1, "home-worksite-overview-header"], ["eyebrow", "Suivi", "title", "Suivi quotidien", "description", "Clients et coordination sans surcharge.", 1, "desktop-card", "home-section-card", "home-section-card--other"], [1, "other-grid"], [1, "dashboard-kpi-card", "other-section"], [1, "other-section-header"], [1, "dashboard-grid", "dashboard-grid--kpis"], ["class", "dashboard-kpi-card", 3, "dashboard-kpi-card--attention", 4, "ngFor", "ngForOf"], [1, "dashboard-kpi-card"], [1, "empty-copy"], [1, "state-title"], [1, "alert-list"], ["class", "alert-item", 4, "ngFor", "ngForOf"], [1, "alert-item"], [1, "alert-copy"], [1, "dashboard-grid", "dashboard-grid--overview"], ["class", "dashboard-kpi-card dashboard-overview-card", 4, "ngFor", "ngForOf"], [1, "dashboard-kpi-card", "dashboard-overview-card"], [1, "overview-headline"], ["class", "overview-highlights", 4, "ngIf"], [1, "overview-highlights"], ["class", "overview-highlight", 4, "ngFor", "ngForOf"], [1, "overview-highlight"], [1, "overview-highlight-value"], [1, "home-site-entry"], [1, "home-site-entry-header"], ["type", "button", "variant", "secondary", "size", "sm", 3, "click", 4, "ngIf"], ["class", "home-site-form", 3, "ngSubmit", 4, "ngIf"], ["class", "alert-list home-site-list", 4, "ngIf", "ngIfElse"], ["type", "button", "variant", "secondary", "size", "sm", 3, "click"], [1, "home-site-form", 3, "ngSubmit"], ["name", "homeSiteName", "type", "text", "label", "Nom du site", "placeholder", "Ex. Atelier Lyon Nord", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "homeSiteAddress", "type", "text", "label", "Adresse utile", "placeholder", "Ex. 12 rue Carnot, 69002 Lyon", "required", "", 3, "ngModelChange", "ngModel", "disabled"], [1, "home-site-form-actions"], ["type", "submit", 3, "disabled"], ["type", "button", "variant", "ghost", 3, "click", "disabled"], [1, "alert-list", "home-site-list"], ["class", "alert-item home-site-item", 4, "ngFor", "ngForOf"], [1, "alert-item", "home-site-item"], [4, "ngIf"], [1, "alert-copy", "home-site-copy"], [1, "home-site-heading"], ["tone", "calm", 3, "label"], [1, "home-site-enrichment"], [1, "home-site-enrichment-header"], ["class", "small", 4, "ngIf"], ["type", "button", "size", "sm", "class", "home-site-action", 3, "variant", "disabled", "click", 4, "ngIf"], ["type", "button", "size", "sm", 1, "home-site-action", 3, "click", "variant", "disabled"], ["class", "empty-copy home-site-empty", 4, "ngIf"], [1, "empty-copy", "home-site-empty"], [1, "alert-copy", "worksite-copy"]], template: function DesktopHomePageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 7)(1, "div", 8)(2, "cfm-card", 9)(3, "div", 10)(4, "div", 11)(5, "p", 12);
            i0.ɵɵtext(6, " Priorit\u00E9s, alertes et modules \u00E0 suivre. ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "div", 13)(8, "div", 14);
            i0.ɵɵelement(9, "cfm-status-chip", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "div", 16);
            i0.ɵɵelement(11, "cfm-status-chip", 15);
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(12, DesktopHomePageComponent_div_12_Template, 2, 1, "div", 17)(13, DesktopHomePageComponent_ng_template_13_Template, 5, 4, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "div", 18)(16, "cfm-card", 19)(17, "div", 13);
            i0.ɵɵelement(18, "cfm-status-chip", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(19, DesktopHomePageComponent_ul_19_Template, 2, 1, "ul", 20)(20, DesktopHomePageComponent_ng_template_20_Template, 5, 4, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "cfm-card", 21);
            i0.ɵɵtemplate(23, DesktopHomePageComponent_div_23_Template, 2, 1, "div", 22)(24, DesktopHomePageComponent_ng_template_24_Template, 5, 4, "ng-template", null, 2, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(26, "div", 23)(27, "cfm-card", 24);
            i0.ɵɵtemplate(28, DesktopHomePageComponent_section_28_Template, 14, 6, "section", 25);
            i0.ɵɵelementStart(29, "div", 26)(30, "div", 11)(31, "h3");
            i0.ɵɵtext(32, "Chantiers \u00E0 suivre");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "p", 12);
            i0.ɵɵtext(34, " Les points utiles pour d\u00E9cider vite. ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(35, "div", 13);
            i0.ɵɵelement(36, "cfm-status-chip", 15);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(37, DesktopHomePageComponent_ul_37_Template, 2, 1, "ul", 20)(38, DesktopHomePageComponent_ng_template_38_Template, 5, 4, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(40, "cfm-card", 27)(41, "div", 28)(42, "section", 29)(43, "div", 30)(44, "div", 11)(45, "h3");
            i0.ɵɵtext(46, "\u00C0 traiter");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "p", 12);
            i0.ɵɵtext(48, " Ce qui demande une action rapide. ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(49, "div", 13);
            i0.ɵɵelement(50, "cfm-status-chip", 15);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(51, DesktopHomePageComponent_ul_51_Template, 2, 1, "ul", 20)(52, DesktopHomePageComponent_ng_template_52_Template, 5, 4, "ng-template", null, 4, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(54, "section", 29)(55, "div", 30)(56, "div", 11)(57, "h3");
            i0.ɵɵtext(58, "Vue par client");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(59, "p", 12);
            i0.ɵɵtext(60, " Les clients qui demandent un suivi. ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(61, "div", 13);
            i0.ɵɵelement(62, "cfm-status-chip", 15);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(63, DesktopHomePageComponent_ul_63_Template, 2, 1, "ul", 20)(64, DesktopHomePageComponent_ng_template_64_Template, 5, 4, "ng-template", null, 5, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            const emptyKpis_r15 = i0.ɵɵreference(14);
            const emptyAlerts_r16 = i0.ɵɵreference(21);
            const emptyOverview_r17 = i0.ɵɵreference(25);
            const emptyWorksites_r18 = i0.ɵɵreference(39);
            const emptyCoordination_r19 = i0.ɵɵreference(53);
            const emptyCustomers_r20 = i0.ɵɵreference(65);
            i0.ɵɵadvance(9);
            i0.ɵɵproperty("label", ctx.ctx.isWorkspaceRefreshing ? "Mise \u00E0 jour en cours" : "Workspace pr\u00EAt")("tone", ctx.ctx.isWorkspaceRefreshing ? "progress" : "success");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("label", ctx.ctx.dashboardKpis.length + " rep\u00E8re" + (ctx.ctx.dashboardKpis.length > 1 ? "s" : ""))("tone", ctx.ctx.dashboardKpis.length > 0 ? "calm" : "neutral");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.ctx.dashboardKpis.length > 0)("ngIfElse", emptyKpis_r15);
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("label", ctx.ctx.dashboardAlerts.length > 0 ? ctx.ctx.dashboardAlerts.length + " priorit\u00E9" + (ctx.ctx.dashboardAlerts.length > 1 ? "s" : "") : "Aucune alerte simple")("tone", ctx.ctx.dashboardAlerts.length > 0 ? "progress" : "success");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.ctx.dashboardAlerts.length > 0)("ngIfElse", emptyAlerts_r16);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngIf", ctx.ctx.dashboardEnterpriseOverviewCards.length > 0)("ngIfElse", emptyOverview_r17);
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("ngIf", ctx.ctx.canManageOrganization || ctx.ctx.organizationSites.length > 0);
            i0.ɵɵadvance(8);
            i0.ɵɵproperty("label", ctx.ctx.worksiteOverviewCountLabel)("tone", ctx.ctx.filteredDashboardWorksiteOverviewItems.length > 0 ? "calm" : "neutral");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.ctx.filteredDashboardWorksiteOverviewItems.length > 0)("ngIfElse", emptyWorksites_r18);
            i0.ɵɵadvance(13);
            i0.ɵɵproperty("label", ctx.ctx.coordinationTodoCountLabel)("tone", ctx.ctx.coordinationTodoItems.length > 0 ? "progress" : "success");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.ctx.coordinationTodoItems.length > 0)("ngIfElse", emptyCoordination_r19);
            i0.ɵɵadvance(11);
            i0.ɵɵproperty("label", ctx.ctx.customerOverviewCountLabel)("tone", ctx.ctx.dashboardCustomerOverviewItems.length > 0 ? "calm" : "neutral");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.ctx.dashboardCustomerOverviewItems.length > 0)("ngIfElse", emptyCustomers_r20);
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, i1.DatePipe, FormsModule, i2.ɵNgNoValidate, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.NgModel, i2.NgForm, CfmButtonComponent,
            CfmCardComponent,
            CfmInputComponent,
            CfmStatusChipComponent], styles: ["[_nghost-%COMP%] {\n        display: block;\n        color: #17312b;\n      }\n\n      cfm-card.desktop-card[_ngcontent-%COMP%] {\n        display: block;\n      }\n\n      .workspace-body[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 1.25rem;\n        min-width: 0;\n      }\n\n      .home-workspace[_ngcontent-%COMP%], \n   .home-overview-layout[_ngcontent-%COMP%], \n   .home-overview-rail[_ngcontent-%COMP%], \n   .home-activity-layout[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 1.25rem;\n        min-width: 0;\n      }\n\n      .home-overview-layout[_ngcontent-%COMP%] {\n        grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);\n        align-items: start;\n      }\n\n      .home-overview-rail[_ngcontent-%COMP%], \n   .home-activity-layout[_ngcontent-%COMP%] {\n        align-items: start;\n      }\n\n      .home-activity-layout[_ngcontent-%COMP%] {\n        grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);\n      }\n\n      .home-section-card[_ngcontent-%COMP%] {\n        height: 100%;\n      }\n\n      .hero-line[_ngcontent-%COMP%], \n   .other-section-header[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 0.85rem;\n        min-width: 0;\n      }\n\n      .hero-line[_ngcontent-%COMP%] {\n        margin-bottom: 0.9rem;\n        padding-bottom: 0.15rem;\n        border-bottom: 1px solid rgba(33, 68, 49, 0.08);\n      }\n\n      .hero-copy[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.25rem;\n        min-width: 0;\n      }\n\n      .hero-copy[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n        margin: 0;\n        font-size: 1.02rem;\n        line-height: 1.2;\n        font-weight: 650;\n        color: #17312b;\n      }\n\n      .hero-copy[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n   .empty-copy[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n        margin: 0;\n      }\n\n      .hero-chips[_ngcontent-%COMP%] {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.45rem;\n        justify-content: flex-end;\n        min-width: 0;\n      }\n\n      .hero-chips[_ngcontent-%COMP%]   cfm-status-chip[_ngcontent-%COMP%] {\n        max-width: 100%;\n      }\n\n      .hero-chip-primary[_ngcontent-%COMP%], \n   .hero-chip-secondary[_ngcontent-%COMP%] {\n        display: inline-flex;\n      }\n\n      .hero-chip-secondary[_ngcontent-%COMP%] {\n        opacity: 0.78;\n      }\n\n      .dashboard-grid[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 1rem;\n        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));\n        min-width: 0;\n      }\n\n      .dashboard-grid--overview[_ngcontent-%COMP%] {\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n      }\n\n      .other-grid[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 1rem;\n        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));\n        min-width: 0;\n      }\n\n      .home-site-entry[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.9rem;\n        margin-bottom: 1rem;\n        padding-bottom: 1rem;\n        border-bottom: 1px solid rgba(33, 68, 49, 0.08);\n      }\n\n      .home-site-entry-header[_ngcontent-%COMP%], \n   .home-worksite-overview-header[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 0.85rem;\n        min-width: 0;\n      }\n\n      .home-site-form[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.8rem;\n        padding: 0.95rem 1rem;\n        border-radius: 1rem;\n        border: 1px solid rgba(33, 68, 49, 0.12);\n        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 246, 0.9));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 10px 22px rgba(18, 33, 42, 0.04);\n      }\n\n      .home-site-form-actions[_ngcontent-%COMP%] {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 0.65rem;\n      }\n\n      .alert-list[_ngcontent-%COMP%] {\n        list-style: none;\n        margin: 0;\n        padding: 0;\n        display: grid;\n        gap: 0.85rem;\n      }\n\n      .dashboard-kpi-card[_ngcontent-%COMP%], \n   .alert-item[_ngcontent-%COMP%], \n   .empty-copy[_ngcontent-%COMP%] {\n        border-radius: 1rem;\n        border: 1px solid rgba(33, 68, 49, 0.12);\n        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 246, 0.9));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 10px 22px rgba(18, 33, 42, 0.04);\n        min-width: 0;\n      }\n\n      .dashboard-kpi-card[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.65rem;\n        padding: 1rem 1.05rem;\n      }\n\n      .alert-item[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 1rem;\n        padding: 0.95rem 1rem;\n      }\n\n      .alert-copy[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.3rem;\n        min-width: 0;\n      }\n\n      .other-section[_ngcontent-%COMP%] {\n        align-content: start;\n      }\n\n      .home-site-list[_ngcontent-%COMP%] {\n        gap: 0.75rem;\n      }\n\n      .home-site-item[_ngcontent-%COMP%] {\n        align-items: flex-start;\n      }\n\n      .home-site-copy[_ngcontent-%COMP%] {\n        gap: 0.32rem;\n      }\n\n      .home-site-heading[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 0.75rem;\n        min-width: 0;\n      }\n\n      .home-site-enrichment[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.24rem;\n        margin-top: 0.12rem;\n      }\n\n      .home-site-enrichment-header[_ngcontent-%COMP%] {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.45rem;\n      }\n\n      .home-site-action[_ngcontent-%COMP%] {\n        align-self: flex-start;\n      }\n\n      .worksite-copy[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n        line-height: 1.35;\n        overflow-wrap: anywhere;\n      }\n\n      .dashboard-kpi-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n   .dashboard-kpi-card[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n   .alert-copy[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n   .alert-copy[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n        margin: 0;\n      }\n\n      .dashboard-kpi-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n   .alert-copy[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n        color: #415349;\n        line-height: 1.4;\n      }\n\n      .dashboard-kpi-card[_ngcontent-%COMP%]    > .small[_ngcontent-%COMP%], \n   .overview-highlight[_ngcontent-%COMP%]   .small[_ngcontent-%COMP%] {\n        font-weight: 600;\n        letter-spacing: 0.01em;\n        color: #52635a;\n      }\n\n      .alert-copy[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n        font-size: 0.98rem;\n        line-height: 1.25;\n        color: #17312b;\n      }\n\n      .dashboard-kpi-card[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%]:not(.overview-headline) {\n        font-size: 1.65rem;\n        line-height: 1.05;\n        letter-spacing: -0.02em;\n        color: #17312b;\n      }\n\n      .dashboard-kpi-card--attention[_ngcontent-%COMP%] {\n        border-color: rgba(186, 131, 34, 0.28);\n        background: linear-gradient(180deg, rgba(255, 252, 245, 0.97), rgba(247, 243, 232, 0.92));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.94),\n          0 12px 24px rgba(120, 84, 24, 0.08);\n      }\n\n      .dashboard-kpi-card--attention[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%] {\n        color: #7a4a1f;\n      }\n\n      .overview-highlights[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.65rem;\n        grid-template-columns: minmax(0, 1fr);\n        min-width: 0;\n      }\n\n      .overview-highlight[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.25rem;\n        padding: 0.7rem 0.75rem;\n        border-radius: 0.85rem;\n        background: rgba(33, 68, 49, 0.04);\n        border: 1px solid rgba(33, 68, 49, 0.08);\n        min-width: 0;\n      }\n\n      .overview-highlight[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n   .overview-highlight[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n        margin: 0;\n      }\n\n      .dashboard-overview-card[_ngcontent-%COMP%] {\n        gap: 0.55rem;\n      }\n\n      .dashboard-overview-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n        line-height: 1.4;\n        word-break: normal;\n        overflow-wrap: break-word;\n        hyphens: auto;\n      }\n\n      .dashboard-overview-card[_ngcontent-%COMP%]    > .overview-headline[_ngcontent-%COMP%] {\n        font-size: 1.08rem;\n        line-height: 1.25;\n        color: #17312b;\n        word-break: normal;\n        overflow-wrap: break-word;\n        hyphens: auto;\n      }\n\n      .overview-highlight[_ngcontent-%COMP%]   .small[_ngcontent-%COMP%] {\n        line-height: 1.2;\n      }\n\n      .overview-highlight-value[_ngcontent-%COMP%] {\n        font-size: 0.9rem;\n        line-height: 1.25;\n        word-break: normal;\n        overflow-wrap: break-word;\n        hyphens: auto;\n      }\n\n      .empty-copy[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.28rem;\n        padding: 0.94rem 1rem;\n        border-style: dashed;\n        align-content: start;\n      }\n\n      .empty-copy--loading[_ngcontent-%COMP%] {\n        border-color: rgba(168, 131, 60, 0.2);\n        background: linear-gradient(180deg, rgba(255, 249, 238, 0.96), rgba(255, 255, 255, 0.9));\n      }\n\n      .state-title[_ngcontent-%COMP%] {\n        margin: 0;\n        font-size: 0.92rem;\n        line-height: 1.25;\n        font-weight: 650;\n        color: #17312b;\n      }\n\n      .empty-copy--loading[_ngcontent-%COMP%]   .state-title[_ngcontent-%COMP%] {\n        color: #6c5422;\n      }\n\n      .small[_ngcontent-%COMP%] {\n        font-size: 0.84rem;\n        line-height: 1.35;\n        color: #617166;\n      }\n\n      .empty-copy[_ngcontent-%COMP%]   .small[_ngcontent-%COMP%] {\n        max-width: 44ch;\n      }\n\n      @media (max-width: 1280px) {\n        .dashboard-grid--overview[_ngcontent-%COMP%] {\n          grid-template-columns: repeat(2, minmax(0, 1fr));\n        }\n\n        .dashboard-grid--overview[_ngcontent-%COMP%]    > .dashboard-overview-card[_ngcontent-%COMP%]:last-child:nth-child(odd) {\n          grid-column: 1 / -1;\n        }\n      }\n\n      @media (max-width: 1180px) {\n        .workspace-body[_ngcontent-%COMP%] {\n          gap: 1.15rem;\n        }\n\n        .home-workspace[_ngcontent-%COMP%], \n   .home-overview-layout[_ngcontent-%COMP%], \n   .home-overview-rail[_ngcontent-%COMP%], \n   .home-activity-layout[_ngcontent-%COMP%] {\n          gap: 1.15rem;\n        }\n\n        .home-overview-layout[_ngcontent-%COMP%], \n   .home-activity-layout[_ngcontent-%COMP%] {\n          grid-template-columns: 1fr;\n        }\n\n        .dashboard-grid--kpis[_ngcontent-%COMP%] {\n          grid-template-columns: repeat(2, minmax(0, 1fr));\n        }\n\n        .other-grid[_ngcontent-%COMP%] {\n          grid-template-columns: 1fr;\n        }\n      }\n\n      @media (max-width: 1024px) {\n        .hero-line[_ngcontent-%COMP%], \n   .other-section-header[_ngcontent-%COMP%], \n   .home-site-entry-header[_ngcontent-%COMP%], \n   .home-worksite-overview-header[_ngcontent-%COMP%] {\n          flex-direction: column;\n        }\n\n        .hero-chips[_ngcontent-%COMP%] {\n          justify-content: flex-start;\n        }\n\n        .alert-item[_ngcontent-%COMP%], \n   .home-site-form-actions[_ngcontent-%COMP%] {\n          flex-direction: column;\n        }\n      }\n\n      @media (max-width: 820px) {\n        .dashboard-grid--kpis[_ngcontent-%COMP%], \n   .dashboard-grid--overview[_ngcontent-%COMP%] {\n          grid-template-columns: 1fr;\n        }\n\n        .dashboard-kpi-card[_ngcontent-%COMP%], \n   .alert-item[_ngcontent-%COMP%], \n   .empty-copy[_ngcontent-%COMP%] {\n          padding: 0.95rem;\n        }\n\n        .home-section-card--worksites[_ngcontent-%COMP%]   .alert-list[_ngcontent-%COMP%], \n   .home-section-card--other[_ngcontent-%COMP%]   .alert-list[_ngcontent-%COMP%] {\n          gap: 0.7rem;\n        }\n\n        .home-section-card--worksites[_ngcontent-%COMP%]   .alert-item[_ngcontent-%COMP%], \n   .home-section-card--other[_ngcontent-%COMP%]   .alert-item[_ngcontent-%COMP%] {\n          gap: 0.72rem;\n          padding: 0.82rem 0.88rem;\n        }\n\n        .home-site-form[_ngcontent-%COMP%] {\n          padding: 0.88rem 0.9rem;\n        }\n\n        .home-section-card--other[_ngcontent-%COMP%]   .dashboard-kpi-card[_ngcontent-%COMP%] {\n          gap: 0.55rem;\n          padding: 0.86rem 0.9rem;\n        }\n\n        .home-section-card--worksites[_ngcontent-%COMP%]   .hero-chips[_ngcontent-%COMP%], \n   .home-section-card--other[_ngcontent-%COMP%]   .hero-chips[_ngcontent-%COMP%] {\n          gap: 0.32rem;\n        }\n\n        .home-section-card--worksites[_ngcontent-%COMP%]   .alert-copy[_ngcontent-%COMP%], \n   .home-section-card--other[_ngcontent-%COMP%]   .alert-copy[_ngcontent-%COMP%], \n   .home-section-card--other[_ngcontent-%COMP%]   .hero-copy[_ngcontent-%COMP%] {\n          gap: 0.22rem;\n        }\n\n        .home-site-entry[_ngcontent-%COMP%] {\n          gap: 0.82rem;\n          margin-bottom: 0.9rem;\n          padding-bottom: 0.9rem;\n        }\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DesktopHomePageComponent, [{
        type: Component,
        args: [{ selector: "cfm-desktop-home-page", standalone: true, imports: [
                    CommonModule,
                    FormsModule,
                    CfmButtonComponent,
                    CfmCardComponent,
                    CfmInputComponent,
                    CfmStatusChipComponent,
                ], template: `
    <section class="workspace-body home-workspace">
      <div class="home-overview-layout">
        <cfm-card
          class="desktop-card home-section-card home-section-card--kpis"
          eyebrow="Cockpit"
          title="Pilotage du jour"
          description="Les points à surveiller maintenant."
        >
        <div class="hero-line">
          <div class="hero-copy">
            <p class="small">
              Priorités, alertes et modules à suivre.
            </p>
          </div>

          <div class="hero-chips">
            <div class="hero-chip-primary">
              <cfm-status-chip
                [label]="ctx.isWorkspaceRefreshing ? 'Mise à jour en cours' : 'Workspace prêt'"
                [tone]="ctx.isWorkspaceRefreshing ? 'progress' : 'success'"
              />
            </div>
            <div class="hero-chip-secondary">
              <cfm-status-chip
                [label]="ctx.dashboardKpis.length + ' repère' + (ctx.dashboardKpis.length > 1 ? 's' : '')"
                [tone]="ctx.dashboardKpis.length > 0 ? 'calm' : 'neutral'"
              />
            </div>
          </div>
        </div>

        <div class="dashboard-grid dashboard-grid--kpis" *ngIf="ctx.dashboardKpis.length > 0; else emptyKpis">
          <article
            class="dashboard-kpi-card"
            *ngFor="let kpi of ctx.dashboardKpis"
            [class.dashboard-kpi-card--attention]="kpi.tone === 'warning' || kpi.tone === 'critical'"
          >
            <p class="small">{{ kpi.label }}</p>
            <strong>{{ kpi.value }}</strong>
            <p>{{ kpi.detail }}</p>
            <cfm-status-chip [label]="kpi.statusLabel" [tone]="kpi.tone" />
          </article>
        </div>

        <ng-template #emptyKpis>
          <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
            <p class="state-title">
              {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun repère pour le moment" }}
            </p>
            <p class="small">
              {{
                ctx.isWorkspaceRefreshing
                  ? "Les repères du cockpit arrivent."
                  : "Le cockpit affichera ici les points utiles à suivre."
              }}
            </p>
          </div>
        </ng-template>
        </cfm-card>

        <div class="home-overview-rail">
          <cfm-card
            class="desktop-card home-section-card home-section-card--alerts"
            eyebrow="Priorités"
            title="Actions prioritaires"
            description="Ce qui demande une action maintenant."
          >
        <div class="hero-chips">
          <cfm-status-chip
            [label]="ctx.dashboardAlerts.length > 0
              ? ctx.dashboardAlerts.length + ' priorité' + (ctx.dashboardAlerts.length > 1 ? 's' : '')
              : 'Aucune alerte simple'"
            [tone]="ctx.dashboardAlerts.length > 0 ? 'progress' : 'success'"
          />
        </div>

        <ul class="alert-list" *ngIf="ctx.dashboardAlerts.length > 0; else emptyAlerts">
          <li class="alert-item" *ngFor="let alert of ctx.dashboardAlerts">
            <div class="alert-copy">
              <strong>{{ alert.title }}</strong>
              <p>{{ alert.description }}</p>
            </div>
            <div class="hero-chips">
              <cfm-status-chip [label]="alert.moduleLabel" [tone]="alert.tone" />
            </div>
          </li>
        </ul>

        <ng-template #emptyAlerts>
          <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
            <p class="state-title">
              {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucune priorité critique" }}
            </p>
            <p class="small">
              {{
                ctx.isWorkspaceRefreshing
                  ? "Les alertes utiles se préparent."
                  : "Rien d’urgent pour le moment."
              }}
            </p>
          </div>
        </ng-template>
          </cfm-card>

          <cfm-card
            class="desktop-card home-section-card home-section-card--overview"
            eyebrow="Vue d’ensemble"
            title="Repères par module"
            description="Lecture rapide des modules."
          >
        <div class="dashboard-grid dashboard-grid--overview" *ngIf="ctx.dashboardEnterpriseOverviewCards.length > 0; else emptyOverview">
          <article class="dashboard-kpi-card dashboard-overview-card" *ngFor="let card of ctx.dashboardEnterpriseOverviewCards">
            <p class="small">{{ card.label }}</p>
            <strong class="overview-headline">{{ card.headline }}</strong>
            <p>{{ card.detail }}</p>

            <div class="overview-highlights" *ngIf="card.highlights.length > 0">
              <div class="overview-highlight" *ngFor="let highlight of card.highlights">
                <span class="small">{{ highlight.label }}</span>
                <strong class="overview-highlight-value">{{ highlight.value }}</strong>
              </div>
            </div>

            <cfm-status-chip [label]="card.statusLabel" [tone]="card.tone" />
          </article>
        </div>

        <ng-template #emptyOverview>
          <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
            <p class="state-title">
              {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun repère par module" }}
            </p>
            <p class="small">
              {{
                ctx.isWorkspaceRefreshing
                  ? "Les modules se mettent à jour."
                  : "La vue d’ensemble apparaitra ici dès qu’un repère remonte."
              }}
            </p>
          </div>
        </ng-template>
          </cfm-card>
        </div>
      </div>

      <div class="home-activity-layout">
        <cfm-card
          class="desktop-card home-section-card home-section-card--worksites"
          eyebrow="Chantiers"
          title="Chantiers à suivre"
          description="Les points utiles pour décider vite."
        >
        <section class="home-site-entry" *ngIf="ctx.canManageOrganization || ctx.organizationSites.length > 0">
          <div class="home-site-entry-header">
            <div class="hero-copy">
              <h3>Sites d’entreprise</h3>
              <p class="small">
                Ajoutez un site pour lancer l’enrichissement d’adresse et de risques sans ouvrir le module chantier.
              </p>
            </div>

            <div class="hero-chips">
              <cfm-status-chip
                [label]="ctx.organizationSites.length > 0
                  ? ctx.organizationSites.length + ' site' + (ctx.organizationSites.length > 1 ? 's' : '')
                  : 'Aucun site'"
                [tone]="ctx.organizationSites.length > 0 ? 'calm' : 'neutral'"
              />

              <cfm-button
                *ngIf="ctx.canManageOrganization && !ctx.homeSiteQuickCreateOpen"
                type="button"
                variant="secondary"
                size="sm"
                (click)="ctx.openHomeSiteQuickCreate()"
              >
                Ajouter un site
              </cfm-button>
            </div>
          </div>

          <form class="home-site-form" *ngIf="ctx.canManageOrganization && ctx.homeSiteQuickCreateOpen" (ngSubmit)="ctx.createSite()">
            <cfm-input
              [(ngModel)]="ctx.siteForm.name"
              name="homeSiteName"
              type="text"
              label="Nom du site"
              placeholder="Ex. Atelier Lyon Nord"
              [disabled]="ctx.organizationSiteSaving"
              required
            />

            <cfm-input
              [(ngModel)]="ctx.siteForm.address"
              name="homeSiteAddress"
              type="text"
              label="Adresse utile"
              placeholder="Ex. 12 rue Carnot, 69002 Lyon"
              [disabled]="ctx.organizationSiteSaving"
              required
            />

            <div class="home-site-form-actions">
              <cfm-button type="submit" [disabled]="ctx.organizationSiteSaving || !ctx.canCreateSite">
                {{ ctx.organizationSiteSaving ? "Création en cours" : "Créer le site" }}
              </cfm-button>
              <cfm-button
                type="button"
                variant="ghost"
                [disabled]="ctx.organizationSiteSaving"
                (click)="ctx.closeHomeSiteQuickCreate()"
              >
                Annuler
              </cfm-button>
            </div>
          </form>

          <ul class="alert-list home-site-list" *ngIf="ctx.organizationSites.length > 0; else emptyHomeSites">
            <li class="alert-item home-site-item" *ngFor="let site of ctx.organizationSites">
              <ng-container *ngIf="ctx.getSiteEnrichmentUiState(site) as enrichment">
                <div class="alert-copy home-site-copy">
                  <div class="home-site-heading">
                    <strong>{{ site.name }}</strong>
                    <div class="hero-chips">
                      <cfm-status-chip [label]="ctx.getSiteTypeLabel(site.site_type)" tone="calm" />
                    </div>
                  </div>

                  <p>{{ site.address }}</p>

                  <div class="home-site-enrichment">
                    <div class="home-site-enrichment-header">
                      <cfm-status-chip [label]="enrichment.label" [tone]="enrichment.tone" />
                      <span class="small" *ngIf="site.location_enrichment_attempted_at">
                        Dernière tentative : {{ site.location_enrichment_attempted_at | date: "dd/MM/yyyy HH:mm" }}
                      </span>
                    </div>

                    <p>{{ enrichment.detail }}</p>
                    <p class="small" *ngIf="enrichment.reasonLabel">{{ enrichment.reasonLabel }}</p>
                    <p class="small" *ngIf="site.normalized_address">Adresse reconnue : {{ site.normalized_address }}</p>
                    <p class="small" *ngIf="site.site_risk_summary">{{ site.site_risk_summary }}</p>
                  </div>
                </div>

                <cfm-button
                  *ngIf="ctx.canManageOrganization"
                  type="button"
                  [variant]="enrichment.showRetryAsPrimary ? 'secondary' : 'ghost'"
                  size="sm"
                  class="home-site-action"
                  [disabled]="ctx.organizationSiteEnrichmentBusyId === site.id"
                  (click)="ctx.relaunchSiteEnrichment(site)"
                >
                  {{
                    ctx.organizationSiteEnrichmentBusyId === site.id
                      ? "Relance en cours"
                      : enrichment.retryLabel
                  }}
                </cfm-button>
              </ng-container>
            </li>
          </ul>

          <ng-template #emptyHomeSites>
            <div class="empty-copy home-site-empty" *ngIf="!ctx.homeSiteQuickCreateOpen">
              <p class="state-title">Aucun site enregistré</p>
              <p class="small">Ajoutez un premier site pour lancer automatiquement l’enrichissement.</p>
            </div>
          </ng-template>
        </section>

        <div class="home-worksite-overview-header">
          <div class="hero-copy">
            <h3>Chantiers à suivre</h3>
            <p class="small">
              Les points utiles pour décider vite.
            </p>
          </div>

          <div class="hero-chips">
            <cfm-status-chip
              [label]="ctx.worksiteOverviewCountLabel"
              [tone]="ctx.filteredDashboardWorksiteOverviewItems.length > 0 ? 'calm' : 'neutral'"
            />
          </div>
        </div>

        <ul class="alert-list" *ngIf="ctx.filteredDashboardWorksiteOverviewItems.length > 0; else emptyWorksites">
          <li class="alert-item" *ngFor="let item of ctx.filteredDashboardWorksiteOverviewItems">
            <div class="alert-copy worksite-copy">
              <strong>{{ item.name }}</strong>
              <p>{{ item.summary }}</p>
              <p>{{ item.operationalSummary }}</p>
              <p>{{ item.taskSummary }}</p>
              <p>{{ item.linkedWorksiteDocumentsSummary }}</p>
              <p *ngIf="item.financialSummary">{{ item.financialSummary }}</p>
              <p *ngIf="item.regulatorySummary">{{ item.regulatorySummary }}</p>
            </div>

            <div class="hero-chips">
              <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
              <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
            </div>
          </li>
        </ul>

        <ng-template #emptyWorksites>
          <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
            <p class="state-title">
              {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun chantier à suivre" }}
            </p>
            <p class="small">
              {{
                ctx.isWorkspaceRefreshing
                  ? "Les repères chantier se mettent à jour."
                  : "Aucun point terrain ne demande d’action."
              }}
            </p>
          </div>
        </ng-template>
        </cfm-card>

        <cfm-card
          class="desktop-card home-section-card home-section-card--other"
          eyebrow="Suivi"
          title="Suivi quotidien"
          description="Clients et coordination sans surcharge."
        >
        <div class="other-grid">
          <section class="dashboard-kpi-card other-section">
            <div class="other-section-header">
              <div class="hero-copy">
                <h3>À traiter</h3>
                <p class="small">
                  Ce qui demande une action rapide.
                </p>
              </div>

              <div class="hero-chips">
                <cfm-status-chip
                  [label]="ctx.coordinationTodoCountLabel"
                  [tone]="ctx.coordinationTodoItems.length > 0 ? 'progress' : 'success'"
                />
              </div>
            </div>

            <ul class="alert-list" *ngIf="ctx.coordinationTodoItems.length > 0; else emptyCoordination">
              <li class="alert-item" *ngFor="let item of ctx.coordinationTodoItems">
                <div class="alert-copy">
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.description }}</p>
                  <p *ngIf="item.context">{{ item.context }}</p>
                </div>

                <div class="hero-chips">
                  <cfm-status-chip [label]="item.kindLabel" [tone]="item.kindTone" />
                  <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                </div>
              </li>
            </ul>

            <ng-template #emptyCoordination>
              <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
                <p class="state-title">
                  {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun point à traiter" }}
                </p>
                <p class="small">
                  {{
                    ctx.isWorkspaceRefreshing
                      ? "Le suivi quotidien se prépare."
                      : "Rien d’urgent côté coordination."
                  }}
                </p>
              </div>
            </ng-template>
          </section>

          <section class="dashboard-kpi-card other-section">
            <div class="other-section-header">
              <div class="hero-copy">
                <h3>Vue par client</h3>
                <p class="small">
                  Les clients qui demandent un suivi.
                </p>
              </div>

              <div class="hero-chips">
                <cfm-status-chip
                  [label]="ctx.customerOverviewCountLabel"
                  [tone]="ctx.dashboardCustomerOverviewItems.length > 0 ? 'calm' : 'neutral'"
                />
              </div>
            </div>

            <ul class="alert-list" *ngIf="ctx.dashboardCustomerOverviewItems.length > 0; else emptyCustomers">
              <li class="alert-item" *ngFor="let item of ctx.dashboardCustomerOverviewItems">
                <div class="alert-copy">
                  <strong>{{ item.name }}</strong>
                  <p>{{ item.summary }}</p>
                  <p>{{ item.context }}</p>
                </div>

                <div class="hero-chips">
                  <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                  <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
                </div>
              </li>
            </ul>

            <ng-template #emptyCustomers>
              <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
                <p class="state-title">
                  {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun client à suivre" }}
                </p>
                <p class="small">
                  {{
                    ctx.isWorkspaceRefreshing
                      ? "Les repères client se mettent à jour."
                      : "Aucun suivi client prioritaire pour le moment."
                  }}
                </p>
              </div>
            </ng-template>
          </section>
        </div>
        </cfm-card>
      </div>
    </section>
  `, styles: ["\n      :host {\n        display: block;\n        color: #17312b;\n      }\n\n      cfm-card.desktop-card {\n        display: block;\n      }\n\n      .workspace-body {\n        display: grid;\n        gap: 1.25rem;\n        min-width: 0;\n      }\n\n      .home-workspace,\n      .home-overview-layout,\n      .home-overview-rail,\n      .home-activity-layout {\n        display: grid;\n        gap: 1.25rem;\n        min-width: 0;\n      }\n\n      .home-overview-layout {\n        grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);\n        align-items: start;\n      }\n\n      .home-overview-rail,\n      .home-activity-layout {\n        align-items: start;\n      }\n\n      .home-activity-layout {\n        grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);\n      }\n\n      .home-section-card {\n        height: 100%;\n      }\n\n      .hero-line,\n      .other-section-header {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 0.85rem;\n        min-width: 0;\n      }\n\n      .hero-line {\n        margin-bottom: 0.9rem;\n        padding-bottom: 0.15rem;\n        border-bottom: 1px solid rgba(33, 68, 49, 0.08);\n      }\n\n      .hero-copy {\n        display: grid;\n        gap: 0.25rem;\n        min-width: 0;\n      }\n\n      .hero-copy h3 {\n        margin: 0;\n        font-size: 1.02rem;\n        line-height: 1.2;\n        font-weight: 650;\n        color: #17312b;\n      }\n\n      .hero-copy p,\n      .empty-copy p {\n        margin: 0;\n      }\n\n      .hero-chips {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.45rem;\n        justify-content: flex-end;\n        min-width: 0;\n      }\n\n      .hero-chips cfm-status-chip {\n        max-width: 100%;\n      }\n\n      .hero-chip-primary,\n      .hero-chip-secondary {\n        display: inline-flex;\n      }\n\n      .hero-chip-secondary {\n        opacity: 0.78;\n      }\n\n      .dashboard-grid {\n        display: grid;\n        gap: 1rem;\n        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));\n        min-width: 0;\n      }\n\n      .dashboard-grid--overview {\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n      }\n\n      .other-grid {\n        display: grid;\n        gap: 1rem;\n        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));\n        min-width: 0;\n      }\n\n      .home-site-entry {\n        display: grid;\n        gap: 0.9rem;\n        margin-bottom: 1rem;\n        padding-bottom: 1rem;\n        border-bottom: 1px solid rgba(33, 68, 49, 0.08);\n      }\n\n      .home-site-entry-header,\n      .home-worksite-overview-header {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 0.85rem;\n        min-width: 0;\n      }\n\n      .home-site-form {\n        display: grid;\n        gap: 0.8rem;\n        padding: 0.95rem 1rem;\n        border-radius: 1rem;\n        border: 1px solid rgba(33, 68, 49, 0.12);\n        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 246, 0.9));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 10px 22px rgba(18, 33, 42, 0.04);\n      }\n\n      .home-site-form-actions {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 0.65rem;\n      }\n\n      .alert-list {\n        list-style: none;\n        margin: 0;\n        padding: 0;\n        display: grid;\n        gap: 0.85rem;\n      }\n\n      .dashboard-kpi-card,\n      .alert-item,\n      .empty-copy {\n        border-radius: 1rem;\n        border: 1px solid rgba(33, 68, 49, 0.12);\n        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 246, 0.9));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 10px 22px rgba(18, 33, 42, 0.04);\n        min-width: 0;\n      }\n\n      .dashboard-kpi-card {\n        display: grid;\n        gap: 0.65rem;\n        padding: 1rem 1.05rem;\n      }\n\n      .alert-item {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 1rem;\n        padding: 0.95rem 1rem;\n      }\n\n      .alert-copy {\n        display: grid;\n        gap: 0.3rem;\n        min-width: 0;\n      }\n\n      .other-section {\n        align-content: start;\n      }\n\n      .home-site-list {\n        gap: 0.75rem;\n      }\n\n      .home-site-item {\n        align-items: flex-start;\n      }\n\n      .home-site-copy {\n        gap: 0.32rem;\n      }\n\n      .home-site-heading {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 0.75rem;\n        min-width: 0;\n      }\n\n      .home-site-enrichment {\n        display: grid;\n        gap: 0.24rem;\n        margin-top: 0.12rem;\n      }\n\n      .home-site-enrichment-header {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.45rem;\n      }\n\n      .home-site-action {\n        align-self: flex-start;\n      }\n\n      .worksite-copy p {\n        line-height: 1.35;\n        overflow-wrap: anywhere;\n      }\n\n      .dashboard-kpi-card p,\n      .dashboard-kpi-card strong,\n      .alert-copy p,\n      .alert-copy strong {\n        margin: 0;\n      }\n\n      .dashboard-kpi-card p,\n      .alert-copy p {\n        color: #415349;\n        line-height: 1.4;\n      }\n\n      .dashboard-kpi-card > .small,\n      .overview-highlight .small {\n        font-weight: 600;\n        letter-spacing: 0.01em;\n        color: #52635a;\n      }\n\n      .alert-copy strong {\n        font-size: 0.98rem;\n        line-height: 1.25;\n        color: #17312b;\n      }\n\n      .dashboard-kpi-card > strong:not(.overview-headline) {\n        font-size: 1.65rem;\n        line-height: 1.05;\n        letter-spacing: -0.02em;\n        color: #17312b;\n      }\n\n      .dashboard-kpi-card--attention {\n        border-color: rgba(186, 131, 34, 0.28);\n        background: linear-gradient(180deg, rgba(255, 252, 245, 0.97), rgba(247, 243, 232, 0.92));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.94),\n          0 12px 24px rgba(120, 84, 24, 0.08);\n      }\n\n      .dashboard-kpi-card--attention > strong {\n        color: #7a4a1f;\n      }\n\n      .overview-highlights {\n        display: grid;\n        gap: 0.65rem;\n        grid-template-columns: minmax(0, 1fr);\n        min-width: 0;\n      }\n\n      .overview-highlight {\n        display: grid;\n        gap: 0.25rem;\n        padding: 0.7rem 0.75rem;\n        border-radius: 0.85rem;\n        background: rgba(33, 68, 49, 0.04);\n        border: 1px solid rgba(33, 68, 49, 0.08);\n        min-width: 0;\n      }\n\n      .overview-highlight strong,\n      .overview-highlight span {\n        margin: 0;\n      }\n\n      .dashboard-overview-card {\n        gap: 0.55rem;\n      }\n\n      .dashboard-overview-card p {\n        line-height: 1.4;\n        word-break: normal;\n        overflow-wrap: break-word;\n        hyphens: auto;\n      }\n\n      .dashboard-overview-card > .overview-headline {\n        font-size: 1.08rem;\n        line-height: 1.25;\n        color: #17312b;\n        word-break: normal;\n        overflow-wrap: break-word;\n        hyphens: auto;\n      }\n\n      .overview-highlight .small {\n        line-height: 1.2;\n      }\n\n      .overview-highlight-value {\n        font-size: 0.9rem;\n        line-height: 1.25;\n        word-break: normal;\n        overflow-wrap: break-word;\n        hyphens: auto;\n      }\n\n      .empty-copy {\n        display: grid;\n        gap: 0.28rem;\n        padding: 0.94rem 1rem;\n        border-style: dashed;\n        align-content: start;\n      }\n\n      .empty-copy--loading {\n        border-color: rgba(168, 131, 60, 0.2);\n        background: linear-gradient(180deg, rgba(255, 249, 238, 0.96), rgba(255, 255, 255, 0.9));\n      }\n\n      .state-title {\n        margin: 0;\n        font-size: 0.92rem;\n        line-height: 1.25;\n        font-weight: 650;\n        color: #17312b;\n      }\n\n      .empty-copy--loading .state-title {\n        color: #6c5422;\n      }\n\n      .small {\n        font-size: 0.84rem;\n        line-height: 1.35;\n        color: #617166;\n      }\n\n      .empty-copy .small {\n        max-width: 44ch;\n      }\n\n      @media (max-width: 1280px) {\n        .dashboard-grid--overview {\n          grid-template-columns: repeat(2, minmax(0, 1fr));\n        }\n\n        .dashboard-grid--overview > .dashboard-overview-card:last-child:nth-child(odd) {\n          grid-column: 1 / -1;\n        }\n      }\n\n      @media (max-width: 1180px) {\n        .workspace-body {\n          gap: 1.15rem;\n        }\n\n        .home-workspace,\n        .home-overview-layout,\n        .home-overview-rail,\n        .home-activity-layout {\n          gap: 1.15rem;\n        }\n\n        .home-overview-layout,\n        .home-activity-layout {\n          grid-template-columns: 1fr;\n        }\n\n        .dashboard-grid--kpis {\n          grid-template-columns: repeat(2, minmax(0, 1fr));\n        }\n\n        .other-grid {\n          grid-template-columns: 1fr;\n        }\n      }\n\n      @media (max-width: 1024px) {\n        .hero-line,\n        .other-section-header,\n        .home-site-entry-header,\n        .home-worksite-overview-header {\n          flex-direction: column;\n        }\n\n        .hero-chips {\n          justify-content: flex-start;\n        }\n\n        .alert-item,\n        .home-site-form-actions {\n          flex-direction: column;\n        }\n      }\n\n      @media (max-width: 820px) {\n        .dashboard-grid--kpis,\n        .dashboard-grid--overview {\n          grid-template-columns: 1fr;\n        }\n\n        .dashboard-kpi-card,\n        .alert-item,\n        .empty-copy {\n          padding: 0.95rem;\n        }\n\n        .home-section-card--worksites .alert-list,\n        .home-section-card--other .alert-list {\n          gap: 0.7rem;\n        }\n\n        .home-section-card--worksites .alert-item,\n        .home-section-card--other .alert-item {\n          gap: 0.72rem;\n          padding: 0.82rem 0.88rem;\n        }\n\n        .home-site-form {\n          padding: 0.88rem 0.9rem;\n        }\n\n        .home-section-card--other .dashboard-kpi-card {\n          gap: 0.55rem;\n          padding: 0.86rem 0.9rem;\n        }\n\n        .home-section-card--worksites .hero-chips,\n        .home-section-card--other .hero-chips {\n          gap: 0.32rem;\n        }\n\n        .home-section-card--worksites .alert-copy,\n        .home-section-card--other .alert-copy,\n        .home-section-card--other .hero-copy {\n          gap: 0.22rem;\n        }\n\n        .home-site-entry {\n          gap: 0.82rem;\n          margin-bottom: 0.9rem;\n          padding-bottom: 0.9rem;\n        }\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DesktopHomePageComponent, { className: "DesktopHomePageComponent" }); })();
