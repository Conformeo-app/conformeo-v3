import { CommonModule } from "@angular/common";
import { Component, ViewChild, ViewEncapsulation, forwardRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet } from "@angular/router";
import { CfmButtonComponent, CfmCardComponent, CfmEmptyStateComponent, CfmInputComponent, CfmStatusChipComponent } from "@conformeo/ui";
import { clearSession, fetchSession, getStoredAccessToken, getStoredOrganizationId, login, persistSession, updateOrganizationModule } from "./auth-client";
import { ApiClientError } from "./api-error";
import { createBillingCustomer, createBuildingSafetyItem, createDuerpEntry, createInvoice, createOrganizationSite, createQuote, createRegulatoryEvidence, duplicateQuoteToInvoice, downloadGeneratedWorksiteDocument, downloadInvoicePdf, downloadWorksitePreventionPlanPdf, downloadQuotePdf, downloadRegulatoryExportPdf, downloadWorksiteSummaryPdf, enrichOrganizationSiteLocation, fetchCockpitSummary, fetchOrganizationProfile, fetchOrganizationRegulatoryProfile, listAuditLogs, listBillingCustomers, listBuildingSafetyAlerts, listBuildingSafetyItems, listDuerpEntries, listInvoices, listOrganizationSites, listQuotes, listRegulatoryEvidences, listWorksiteAssignees, listWorksiteDocuments, listWorksiteProofs, listWorksiteSignatures, listWorksites, recordInvoicePayment, updateBillingCustomer, updateBuildingSafetyItem, updateDuerpEntry, updateInvoice, updateInvoiceFollowUpStatus, updateInvoiceStatus, updateInvoiceWorksiteLink, updateOrganizationProfile, updateOrganizationSite, updateQuote, updateQuoteFollowUpStatus, updateQuoteStatus, updateQuoteWorksiteLink, updateWorksiteDocumentProofs, updateWorksiteCoordination, updateWorksiteDocumentCoordination, updateWorksiteDocumentSignature, updateWorksiteDocumentStatus } from "./organization-client";
import { DESKTOP_SHELL_CONTEXT, } from "./desktop-shell-context";
import { DESKTOP_LOGIN_PAGE_CONTEXT } from "./desktop-login-page-context";
import { DesktopRegulationShowcaseComponent } from "./desktop-regulation-showcase.component";
import { DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT } from "./desktop-worksite-documents-page-context";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _c0 = ["homePageTemplate"];
const _c1 = ["reglementationPageTemplate"];
const _c2 = ["chantierPageTemplate"];
const _c3 = ["facturationPageTemplate"];
const _c4 = ["coordinationPageTemplate"];
const _c5 = () => ({ standalone: true });
const _c6 = () => [];
function AppComponent_ng_template_1_cfm_card_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 50)(1, "div", 51)(2, "div", 52);
    i0.ɵɵelement(3, "div", 53);
    i0.ɵɵelementStart(4, "div", 54);
    i0.ɵɵelement(5, "span")(6, "span")(7, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 55);
    i0.ɵɵelement(9, "span")(10, "span")(11, "span");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 56)(13, "p", 57);
    i0.ɵɵtext(14, "Mise \u00E0 jour en cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "p", 58);
    i0.ɵɵtext(16, "Les rep\u00E8res arrivent sans bloquer votre lecture.");
    i0.ɵɵelementEnd()()()();
} }
function AppComponent_ng_template_1_ng_template_1_div_1_cfm_status_chip_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 67);
} if (rf & 2) {
    const permission_r1 = ctx.$implicit;
    i0.ɵɵproperty("label", permission_r1);
} }
function AppComponent_ng_template_1_ng_template_1_div_1_li_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 68)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(6, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r2 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r2.organization.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r2.membership.role_code);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r2.membership.is_default ? "Courante" : "Li\u00E9e")("tone", item_r2.membership.is_default ? "success" : "neutral");
} }
function AppComponent_ng_template_1_ng_template_1_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62)(1, "article")(2, "h3");
    i0.ɵɵtext(3, "Permissions");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 63);
    i0.ɵɵtemplate(5, AppComponent_ng_template_1_ng_template_1_div_1_cfm_status_chip_5_Template, 1, 1, "cfm-status-chip", 64);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "article")(7, "h3");
    i0.ɵɵtext(8, "Organisations li\u00E9es");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "ul", 65);
    i0.ɵɵtemplate(10, AppComponent_ng_template_1_ng_template_1_div_1_li_10_Template, 7, 4, "li", 66);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const membership_r3 = ctx.ngIf;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngForOf", membership_r3.permissions);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngForOf", ctx_r3.session == null ? null : ctx_r3.session.memberships);
} }
function AppComponent_ng_template_1_ng_template_1_section_2_ul_7_li_1_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "div", 74)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "label", 75)(6, "input", 76);
    i0.ɵɵlistener("change", function AppComponent_ng_template_1_ng_template_1_section_2_ul_7_li_1_Template_input_change_6_listener($event) { const module_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.toggleModule(module_r6.module_code, $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const module_r6 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(module_r6.module_code);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", module_r6.is_enabled ? "Activ\u00E9" : "D\u00E9sactiv\u00E9")("tone", module_r6.is_enabled ? "success" : "neutral");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", module_r6.is_enabled)("disabled", ctx_r3.loading || !ctx_r3.canManageModules);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(module_r6.is_enabled ? "On" : "Off");
} }
function AppComponent_ng_template_1_ng_template_1_section_2_ul_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 73);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_ng_template_1_section_2_ul_7_li_1_Template, 9, 6, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const membership_r7 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", membership_r7.modules);
} }
function AppComponent_ng_template_1_ng_template_1_section_2_ng_template_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 77);
} }
function AppComponent_ng_template_1_ng_template_1_section_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 70)(1, "div", 71)(2, "div")(3, "h3");
    i0.ɵɵtext(4, "Modules de l'organisation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6, " Activez les modules utiles pour ouvrir progressivement la r\u00E9glementation et la facturation depuis l\u2019espace bureau. ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(7, AppComponent_ng_template_1_ng_template_1_section_2_ul_7_Template, 2, 1, "ul", 72)(8, AppComponent_ng_template_1_ng_template_1_section_2_ng_template_8_Template, 1, 0, "ng-template", null, 6, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const membership_r7 = ctx.ngIf;
    const emptyModules_r8 = i0.ɵɵreference(9);
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngIf", membership_r7.modules.length > 0)("ngIfElse", emptyModules_r8);
} }
function AppComponent_ng_template_1_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 59);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_ng_template_1_div_1_Template, 11, 2, "div", 60)(2, AppComponent_ng_template_1_ng_template_1_section_2_Template, 10, 2, "section", 61);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.currentMembership);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.currentMembership);
} }
function AppComponent_ng_template_1_cfm_card_3_div_6_article_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 94)(1, "p", 95);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong", 96);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const kpi_r10 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(kpi_r10.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(kpi_r10.value);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(kpi_r10.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", kpi_r10.statusLabel)("tone", kpi_r10.tone);
} }
function AppComponent_ng_template_1_cfm_card_3_div_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 92);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_3_div_6_article_1_Template, 8, 5, "article", 93);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.dashboardKpis);
} }
function AppComponent_ng_template_1_cfm_card_3_ng_template_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 97);
} }
function AppComponent_ng_template_1_cfm_card_3_ul_12_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 99)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(6, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const alert_r11 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(alert_r11.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(alert_r11.description);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", alert_r11.moduleLabel)("tone", alert_r11.tone);
} }
function AppComponent_ng_template_1_cfm_card_3_ul_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 98);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_3_ul_12_li_1_Template, 7, 4, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.dashboardAlerts);
} }
function AppComponent_ng_template_1_cfm_card_3_ng_template_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 58);
    i0.ɵɵtext(1, "Aucune priorit\u00E9 simple d\u00E9tect\u00E9e pour le moment.");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_3_ul_36_li_1_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(action_r12.context);
} }
function AppComponent_ng_template_1_cfm_card_3_ul_36_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 99)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_3_ul_36_li_1_span_6_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 63);
    i0.ɵɵelement(8, "cfm-status-chip", 69)(9, "cfm-status-chip", 69);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const action_r12 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(action_r12.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(action_r12.description);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", action_r12.context);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r3.getDashboardActionPriorityLabel(action_r12.priority))("tone", ctx_r3.getDashboardActionPriorityTone(action_r12.priority));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getDashboardActionModuleLabel(action_r12.module))("tone", ctx_r3.getDashboardActionModuleTone(action_r12.module));
} }
function AppComponent_ng_template_1_cfm_card_3_ul_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 98);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_3_ul_36_li_1_Template, 10, 7, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredDashboardActions);
} }
function AppComponent_ng_template_1_cfm_card_3_ng_template_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 58);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.selectedDashboardActionModule === "all" ? "Aucune action simple d\u00E9tect\u00E9e pour le moment." : "Aucune action simple pour ce module.", " ");
} }
function AppComponent_ng_template_1_cfm_card_3_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-card", 78)(1, "div", 79)(2, "div", 63);
    i0.ɵɵelement(3, "cfm-status-chip", 69)(4, "cfm-status-chip", 69)(5, "cfm-status-chip", 69);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_3_div_6_Template, 2, 1, "div", 80)(7, AppComponent_ng_template_1_cfm_card_3_ng_template_7_Template, 1, 0, "ng-template", null, 7, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementStart(9, "section", 81)(10, "h3");
    i0.ɵɵtext(11, "Priorit\u00E9s du moment");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(12, AppComponent_ng_template_1_cfm_card_3_ul_12_Template, 2, 1, "ul", 82)(13, AppComponent_ng_template_1_cfm_card_3_ng_template_13_Template, 2, 0, "ng-template", null, 8, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "section", 83)(16, "div", 84)(17, "div", 85)(18, "h3");
    i0.ɵɵtext(19, "Actions \u00E0 faire");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "p", 58);
    i0.ɵɵtext(21, " Une vue courte pour passer du constat \u00E0 l\u2019action, sans cr\u00E9er un gestionnaire de t\u00E2ches. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "label", 86)(23, "span");
    i0.ɵɵtext(24, "Module");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "select", 87);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_3_Template_select_ngModelChange_25_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedDashboardActionModule, $event) || (ctx_r3.selectedDashboardActionModule = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(26, "option", 88);
    i0.ɵɵtext(27, "Tous les modules");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "option", 89);
    i0.ɵɵtext(29, "R\u00E9glementation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "option", 90);
    i0.ɵɵtext(31, "Chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "option", 91);
    i0.ɵɵtext(33, "Facturation");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(34, "div", 63);
    i0.ɵɵelement(35, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(36, AppComponent_ng_template_1_cfm_card_3_ul_36_Template, 2, 1, "ul", 82)(37, AppComponent_ng_template_1_cfm_card_3_ng_template_37_Template, 2, 1, "ng-template", null, 9, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const emptyDashboard_r13 = i0.ɵɵreference(8);
    const emptyDashboardAlerts_r14 = i0.ɵɵreference(14);
    const emptyDashboardActions_r15 = i0.ɵɵreference(38);
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", ctx_r3.dashboardKpis.length + " rep\u00E8re" + (ctx_r3.dashboardKpis.length > 1 ? "s" : ""))("tone", ctx_r3.dashboardKpis.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.dashboardActions.length > 0 ? ctx_r3.dashboardActions.length + " action" + (ctx_r3.dashboardActions.length > 1 ? "s" : "") : "Aucune action simple")("tone", ctx_r3.dashboardActions.length > 0 ? "progress" : "success");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.dashboardAlerts.length > 0 ? ctx_r3.dashboardAlerts.length + " priorit\u00E9" + (ctx_r3.dashboardAlerts.length > 1 ? "s" : "") : "Aucune alerte simple")("tone", ctx_r3.dashboardAlerts.length > 0 ? "progress" : "success");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.dashboardKpis.length > 0)("ngIfElse", emptyDashboard_r13);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngIf", ctx_r3.dashboardAlerts.length > 0)("ngIfElse", emptyDashboardAlerts_r14);
    i0.ɵɵadvance(13);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedDashboardActionModule);
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("label", ctx_r3.dashboardActionCountLabel)("tone", ctx_r3.filteredDashboardActions.length > 0 ? "progress" : "success");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredDashboardActions.length > 0)("ngIfElse", emptyDashboardActions_r15);
} }
function AppComponent_ng_template_1_cfm_card_4_div_8_article_1_ul_7_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span", 95);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const highlight_r16 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(highlight_r16.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(highlight_r16.value);
} }
function AppComponent_ng_template_1_cfm_card_4_div_8_article_1_ul_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 106);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_div_8_article_1_ul_7_li_1_Template, 5, 2, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const card_r17 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", card_r17.highlights);
} }
function AppComponent_ng_template_1_cfm_card_4_div_8_article_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 94)(1, "p", 95);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, AppComponent_ng_template_1_cfm_card_4_div_8_article_1_ul_7_Template, 2, 1, "ul", 105);
    i0.ɵɵelement(8, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const card_r17 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(card_r17.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(card_r17.headline);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(card_r17.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", card_r17.highlights.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", card_r17.statusLabel)("tone", card_r17.tone);
} }
function AppComponent_ng_template_1_cfm_card_4_div_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 92);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_div_8_article_1_Template, 9, 6, "article", 93);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.dashboardEnterpriseOverviewCards);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_template_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 58);
    i0.ɵɵtext(1, "Aucun module actif pour construire une lecture synth\u00E9tique pour le moment.");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_19_option_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const assignee_r19 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", assignee_r19.user_id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.getWorksiteAssigneeOptionLabel(assignee_r19), " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_19_cfm_button_23_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_19_cfm_button_23_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r20); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.resetCoordinationFilters()); });
    i0.ɵɵtext(1, " R\u00E9initialiser les filtres ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_19_ul_26_li_1_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r22 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r22.context);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_19_ul_26_li_1_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "div", 99)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_4_ng_container_19_ul_26_li_1_span_6_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 119)(8, "div", 63);
    i0.ɵɵelement(9, "cfm-status-chip", 69)(10, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_19_ul_26_li_1_Template_cfm_button_click_11_listener() { const item_r22 = i0.ɵɵrestoreView(_r21).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.openCoordinationTodoItem(item_r22)); });
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r22 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r22.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r22.description);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r22.context);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", item_r22.kindLabel)("tone", item_r22.kindTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r22.statusLabel)("tone", item_r22.statusTone);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", item_r22.kind === "worksite" ? "Voir le chantier" : "Voir le document", " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_19_ul_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 98);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_19_ul_26_li_1_Template, 13, 8, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.coordinationTodoItems);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_19_ng_template_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 120);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("title", ctx_r3.hasActiveCoordinationFilters ? "Aucun r\u00E9sultat pour ces filtres" : "Rien \u00E0 coordonner pour le moment")("description", ctx_r3.hasActiveCoordinationFilters ? "Ajustez les filtres pour \u00E9largir la lecture chantier." : "Les chantiers et documents \u00E0 traiter apparaitront ici.");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_19_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 107)(2, "label", 108)(3, "span", 58);
    i0.ɵɵtext(4, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "select", 109);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_19_Template_select_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedCoordinationStatusFilter, $event) || (ctx_r3.selectedCoordinationStatusFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(6, "option", 88);
    i0.ɵɵtext(7, "Tous les suivis");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "option", 110);
    i0.ɵɵtext(9, "\u00C0 faire");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "option", 111);
    i0.ɵɵtext(11, "En cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "option", 112);
    i0.ɵɵtext(13, "Fait");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "label", 108)(15, "span", 58);
    i0.ɵɵtext(16, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "select", 113);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_19_Template_select_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedCoordinationAssigneeFilter, $event) || (ctx_r3.selectedCoordinationAssigneeFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(18, "option", 88);
    i0.ɵɵtext(19, "Toutes les affectations");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "option", 114);
    i0.ɵɵtext(21, "Non affect\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(22, AppComponent_ng_template_1_cfm_card_4_ng_container_19_option_22_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(23, AppComponent_ng_template_1_cfm_card_4_ng_container_19_cfm_button_23_Template, 2, 0, "cfm-button", 116);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "p", 58);
    i0.ɵɵtext(25, " Ces filtres s'appliquent aussi \u00E0 la vue chantier et aux documents chantier plus bas. ");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(26, AppComponent_ng_template_1_cfm_card_4_ng_container_19_ul_26_Template, 2, 1, "ul", 82)(27, AppComponent_ng_template_1_cfm_card_4_ng_container_19_ng_template_27_Template, 1, 2, "ng-template", null, 15, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptyCoordinationTodo_r23 = i0.ɵɵreference(28);
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedCoordinationStatusFilter);
    i0.ɵɵadvance(12);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedCoordinationAssigneeFilter);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngForOf", ctx_r3.worksiteAssignees);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.hasActiveCoordinationFilters);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r3.coordinationTodoItems.length > 0)("ngIfElse", emptyCoordinationTodo_r23);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_template_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 121);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r24.coordination.commentSummary);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Dernier suivi : ", item_r24.coordination.updatedAtLabel, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_span_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r24.financialSummary);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_span_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r24.regulatorySummary);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_26_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_26_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r25); const item_r24 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.prepareQuoteFromWorksite(item_r24.id)); });
    i0.ɵɵtext(1, " Pr\u00E9parer un devis ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_27_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_27_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r26); const item_r24 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.prepareInvoiceFromWorksite(item_r24.id)); });
    i0.ɵɵtext(1, " Pr\u00E9parer une facture ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_28_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_28_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r27); const item_r24 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.exportWorksiteSummaryPdf(item_r24.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r3.worksiteDocumentPdfBusyId === item_r24.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksiteDocumentPdfBusyId === item_r24.id ? "G\u00E9n\u00E9ration en cours" : "Fiche chantier PDF", " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_29_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_29_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r28); const item_r24 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.toggleWorksitePreventionPlanEditor(item_r24.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksitePreventionPlanEditingId === item_r24.id ? "Fermer le plan" : "Ajuster le plan", " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_30_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_30_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r29); const item_r24 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.focusWorksiteDocuments(item_r24.id)); });
    i0.ɵɵtext(1, " Voir les documents ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_31_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_31_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r30); const item_r24 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.toggleWorksiteCoordination(item_r24.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.selectedWorksiteCoordinationId === item_r24.id ? "Masquer la coordination" : "Coordination simple", " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r31 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re g\u00E9n\u00E9ration : ", document_r31.uploadedAtLabel, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_7_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtext(1);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const document_r31 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u00B7 ", document_r31.linkedSignatureDetail, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵtemplate(2, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_7_ng_container_2_Template, 2, 1, "ng-container", 100);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r31 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Signature li\u00E9e : ", document_r31.linkedSignatureLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r31.linkedSignatureDetail);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r31 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Preuves li\u00E9es : ", document_r31.linkedProofsSummary, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r31 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", document_r31.coordination.commentSummary, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_label_15_Template(rf, ctx) { if (rf & 1) {
    const _r32 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 108)(1, "span", 58);
    i0.ɵɵtext(2, "Statut du document");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_label_15_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r32); const document_r31 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(7); return i0.ɵɵresetView(ctx_r3.changeWorksiteDocumentLifecycleStatus(document_r31.id, $event)); });
    i0.ɵɵelementStart(4, "option", 131);
    i0.ɵɵtext(5, "Brouillon");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "option", 132);
    i0.ɵɵtext(7, "Finalis\u00E9");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const document_r31 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(7);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", document_r31.lifecycleStatus)("name", "worksiteDocumentLifecycle" + document_r31.id)("disabled", ctx_r3.worksiteDocumentStatusBusyId === document_r31.id);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_label_16_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const signature_r34 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(9);
    i0.ɵɵproperty("value", signature_r34.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.getWorksiteSignatureOptionLabel(signature_r34), " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_label_16_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 108)(1, "span", 58);
    i0.ɵɵtext(2, "Signature li\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_label_16_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r33); const document_r31 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(7); return i0.ɵɵresetView(ctx_r3.changeWorksiteDocumentSignature(document_r31.id, $event)); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Aucune signature li\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_label_16_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_22_0;
    const document_r31 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(7);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", (tmp_22_0 = document_r31.linkedSignatureId) !== null && tmp_22_0 !== undefined ? tmp_22_0 : "")("name", "worksiteDocumentSignature" + document_r31.id)("disabled", ctx_r3.worksiteDocumentSignatureBusyId === document_r31.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.getWorksiteSignatureOptions(document_r31.worksiteId));
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 58);
    i0.ɵɵtext(1, " Aucune signature chantier disponible pour ce chantier. ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_div_18_label_3_Template(rf, ctx) { if (rf & 1) {
    const _r35 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 136)(1, "input", 137);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_div_18_label_3_Template_input_ngModelChange_1_listener($event) { const proof_r36 = i0.ɵɵrestoreView(_r35).$implicit; const document_r31 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(7); return i0.ɵɵresetView(ctx_r3.toggleWorksiteDocumentProof(document_r31.id, proof_r36.id, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const proof_r36 = ctx.$implicit;
    const document_r31 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(7);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngModel", ctx_r3.isWorksiteProofLinked(document_r31, proof_r36.id))("ngModelOptions", i0.ɵɵpureFunction0(4, _c5))("disabled", ctx_r3.worksiteDocumentProofBusyId === document_r31.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r3.getWorksiteProofOptionLabel(proof_r36));
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_div_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 134)(1, "span", 58);
    i0.ɵɵtext(2, "Preuves li\u00E9es");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_div_18_label_3_Template, 4, 5, "label", 135);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r31 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(7);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.getWorksiteProofOptions(document_r31.worksiteId));
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 58);
    i0.ɵɵtext(1, " Aucune preuve chantier disponible pour ce chantier. ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 68)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_6_Template, 2, 1, "span", 100)(7, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_7_Template, 3, 2, "span", 100)(8, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_8_Template, 2, 1, "span", 100);
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(11, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_11_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 119)(13, "div", 63);
    i0.ɵɵelement(14, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_label_15_Template, 8, 3, "label", 127)(16, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_label_16_Template, 7, 4, "label", 127)(17, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_17_Template, 2, 0, "span", 128)(18, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_div_18_Template, 4, 1, "div", 129)(19, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_span_19_Template, 2, 0, "span", 128);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const document_r31 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(7);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(document_r31.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(document_r31.fileName);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r31.uploadedAtLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r31.linkedSignatureLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r31.linkedProofsSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" Coordination : ", document_r31.coordination.statusLabel, " \u00B7 ", document_r31.coordination.assigneeLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r31.coordination.commentText);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", document_r31.lifecycleStatusLabel)("tone", document_r31.lifecycleStatusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.getWorksiteSignatureOptions(document_r31.worksiteId).length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.getWorksiteSignatureOptions(document_r31.worksiteId).length === 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.getWorksiteProofOptions(document_r31.worksiteId).length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.getWorksiteProofOptions(document_r31.worksiteId).length === 0);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 65);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_li_1_Template, 20, 15, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", item_r24.worksiteDocuments);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re mise \u00E0 jour : ", item_r24.coordination.updatedAtLabel, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_label_11_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const assignee_r39 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(9);
    i0.ɵɵproperty("value", assignee_r39.user_id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.getWorksiteAssigneeOptionLabel(assignee_r39), " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_label_11_Template(rf, ctx) { if (rf & 1) {
    const _r38 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_label_11_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r38); const item_r24 = i0.ɵɵnextContext(3).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteCoordinationDraft(item_r24.id, { assigneeUserId: $event })); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Non affect\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_label_11_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteCoordinationDraft(item_r24.id).assigneeUserId)("name", "worksiteCoordinationAssignee" + item_r24.id)("disabled", ctx_r3.worksiteCoordinationBusyId === item_r24.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.worksiteAssignees);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_ng_template_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 140)(1, "span", 58);
    i0.ɵɵtext(2, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Aucun membre lisible pour affecter ce chantier.");
    i0.ɵɵelementEnd()();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_Template(rf, ctx) { if (rf & 1) {
    const _r37 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 139)(1, "label", 144)(2, "span");
    i0.ɵɵtext(3, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_Template_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r37); const item_r24 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteCoordinationDraft(item_r24.id, { status: $event })); });
    i0.ɵɵelementStart(5, "option", 110);
    i0.ɵɵtext(6, "\u00C0 faire");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "option", 111);
    i0.ɵɵtext(8, "En cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "option", 112);
    i0.ɵɵtext(10, "Fait");
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(11, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_label_11_Template, 7, 4, "label", 145)(12, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_ng_template_12_Template, 5, 0, "ng-template", null, 17, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const noWorksiteAssignees_r40 = i0.ɵɵreference(13);
    const item_r24 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteCoordinationDraft(item_r24.id).status)("name", "worksiteCoordinationStatus" + item_r24.id)("disabled", ctx_r3.worksiteCoordinationBusyId === item_r24.id);
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngIf", ctx_r3.worksiteAssignees.length > 0)("ngIfElse", noWorksiteAssignees_r40);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_label_20_Template(rf, ctx) { if (rf & 1) {
    const _r41 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 146)(1, "span");
    i0.ɵɵtext(2, "Commentaire simple");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "textarea", 147);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_label_20_Template_textarea_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r41); const item_r24 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteCoordinationDraft(item_r24.id, { commentText: $event })); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteCoordinationDraft(item_r24.id).commentText)("name", "worksiteCoordinationComment" + item_r24.id)("disabled", ctx_r3.worksiteCoordinationBusyId === item_r24.id);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_21_Template(rf, ctx) { if (rf & 1) {
    const _r42 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 107)(1, "cfm-button", 148);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_21_Template_cfm_button_click_1_listener() { i0.ɵɵrestoreView(_r42); const item_r24 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.saveWorksiteCoordination(item_r24)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.worksiteCoordinationBusyId === item_r24.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksiteCoordinationBusyId === item_r24.id ? "Enregistrement en cours" : "Enregistrer", " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 138)(1, "div", 139)(2, "div", 140)(3, "span", 58);
    i0.ɵɵtext(4, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 140)(9, "span", 58);
    i0.ɵɵtext(10, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "strong");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_span_13_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 140)(15, "span", 58);
    i0.ɵɵtext(16, "Commentaire simple");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(19, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_19_Template, 14, 5, "div", 141)(20, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_label_20_Template, 4, 3, "label", 142)(21, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_div_21_Template, 3, 2, "div", 143);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(item_r24.coordination.statusLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r24.coordination.statusLabel)("tone", item_r24.coordination.statusTone);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(item_r24.coordination.assigneeLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r24.coordination.updatedAtLabel);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", item_r24.coordination.commentText || "Aucun commentaire simple pour le moment.", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_span_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const preview_r44 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Contact utile compl\u00E9mentaire : ", preview_r44.additionalContact, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ul_39_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const point_r45 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(point_r45);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ul_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 162);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ul_39_li_1_Template, 2, 1, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const preview_r44 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", preview_r44.vigilancePoints);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ng_template_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Aucun point de vigilance saisi.");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ul_45_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const point_r46 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(point_r46);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ul_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 162);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ul_45_li_1_Template, 2, 1, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const preview_r44 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", preview_r44.measurePoints);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ng_template_46_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Aucune mesure saisie.");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 159)(1, "div", 160)(2, "strong");
    i0.ɵɵtext(3, "Aper\u00E7u texte avant t\u00E9l\u00E9chargement");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 58);
    i0.ɵɵtext(5, "Relisez ici les \u00E9l\u00E9ments essentiels repris dans le PDF final.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 139)(7, "div", 140)(8, "span", 58);
    i0.ɵɵtext(9, "Entreprise");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "strong");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 140)(13, "span", 58);
    i0.ɵɵtext(14, "Date utile");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "strong");
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "div", 140)(18, "span", 58);
    i0.ɵɵtext(19, "Chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "strong");
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "span");
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "div", 140)(25, "span", 58);
    i0.ɵɵtext(26, "Client / donneur d'ordre");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "strong");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(29, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_span_29_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "div", 140)(31, "span", 58);
    i0.ɵɵtext(32, "Contexte d\u2019intervention");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "span");
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "div", 139)(36, "div", 140)(37, "span", 58);
    i0.ɵɵtext(38, "Points de vigilance");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(39, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ul_39_Template, 2, 1, "ul", 161)(40, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ng_template_40_Template, 2, 0, "ng-template", null, 18, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "div", 140)(43, "span", 58);
    i0.ɵɵtext(44, "Mesures / consignes");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(45, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ul_45_Template, 2, 1, "ul", 161)(46, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_ng_template_46_Template, 2, 0, "ng-template", null, 19, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const preview_r44 = ctx.ngIf;
    const noVigilancePreview_r47 = i0.ɵɵreference(41);
    const noMeasuresPreview_r48 = i0.ɵɵreference(47);
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(preview_r44.companyName);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(preview_r44.usefulDateLabel || "\u00C0 pr\u00E9ciser avant export");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(preview_r44.worksiteName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(preview_r44.worksiteAddress);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(preview_r44.clientName || "\u00C0 confirmer");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", preview_r44.additionalContact);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(preview_r44.interventionContext);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngIf", preview_r44.vigilancePoints.length > 0)("ngIfElse", noVigilancePreview_r47);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngIf", preview_r44.measurePoints.length > 0)("ngIfElse", noMeasuresPreview_r48);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template(rf, ctx) { if (rf & 1) {
    const _r43 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 149);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r43); const item_r24 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.exportAdjustedWorksitePreventionPlanPdf(item_r24.id)); });
    i0.ɵɵelementStart(1, "p", 150);
    i0.ɵɵtext(2, " Ajustez seulement ce qui est utile avant export. Le document reste pr\u00E9rempli et ne cr\u00E9e pas de workflow suppl\u00E9mentaire. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-input", 151);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template_cfm_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r3 = i0.ɵɵnextContext(6); i0.ɵɵtwoWayBindingSet(ctx_r3.worksitePreventionPlanForm.usefulDate, $event) || (ctx_r3.worksitePreventionPlanForm.usefulDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "cfm-input", 152);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template_cfm_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r3 = i0.ɵɵnextContext(6); i0.ɵɵtwoWayBindingSet(ctx_r3.worksitePreventionPlanForm.additionalContact, $event) || (ctx_r3.worksitePreventionPlanForm.additionalContact = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "label", 146)(6, "span");
    i0.ɵɵtext(7, "Contexte d\u2019intervention");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "textarea", 153);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template_textarea_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r3 = i0.ɵɵnextContext(6); i0.ɵɵtwoWayBindingSet(ctx_r3.worksitePreventionPlanForm.interventionContext, $event) || (ctx_r3.worksitePreventionPlanForm.interventionContext = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "label", 146)(10, "span");
    i0.ɵɵtext(11, "Points de vigilance");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "textarea", 154);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template_textarea_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r3 = i0.ɵɵnextContext(6); i0.ɵɵtwoWayBindingSet(ctx_r3.worksitePreventionPlanForm.vigilancePoints, $event) || (ctx_r3.worksitePreventionPlanForm.vigilancePoints = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "label", 146)(14, "span");
    i0.ɵɵtext(15, "Mesures / consignes");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "textarea", 155);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template_textarea_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r3 = i0.ɵɵnextContext(6); i0.ɵɵtwoWayBindingSet(ctx_r3.worksitePreventionPlanForm.measurePoints, $event) || (ctx_r3.worksitePreventionPlanForm.measurePoints = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(17, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_section_17_Template, 48, 11, "section", 156);
    i0.ɵɵelementStart(18, "div", 157)(19, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template_cfm_button_click_19_listener() { i0.ɵɵrestoreView(_r43); const ctx_r3 = i0.ɵɵnextContext(6); return i0.ɵɵresetView(ctx_r3.restoreInitialWorksitePreventionPlanForm()); });
    i0.ɵɵtext(20, " Revenir au pr\u00E9remplissage initial ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "cfm-button", 158);
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template_cfm_button_click_23_listener() { i0.ɵɵrestoreView(_r43); const ctx_r3 = i0.ɵɵnextContext(6); return i0.ɵɵresetView(ctx_r3.cancelWorksitePreventionPlanEditing()); });
    i0.ɵɵtext(24, " Annuler ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.worksitePreventionPlanForm.usefulDate);
    i0.ɵɵproperty("name", "worksitePreventionDate" + item_r24.id)("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.worksitePreventionPlanForm.additionalContact);
    i0.ɵɵproperty("name", "worksitePreventionContact" + item_r24.id)("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.worksitePreventionPlanForm.interventionContext);
    i0.ɵɵproperty("name", "worksitePreventionContext" + item_r24.id)("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.worksitePreventionPlanForm.vigilancePoints);
    i0.ɵɵproperty("name", "worksitePreventionVigilance" + item_r24.id)("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.worksitePreventionPlanForm.measurePoints);
    i0.ɵɵproperty("name", "worksitePreventionMeasures" + item_r24.id)("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.activeWorksitePreventionPlanPreview);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id || !ctx_r3.canResetWorksitePreventionPlanToInitial);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id ? "G\u00E9n\u00E9ration en cours" : "Exporter le PDF", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r24.id);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 99)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(12, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_span_12_Template, 2, 1, "span", 100)(13, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_span_13_Template, 2, 1, "span", 100);
    i0.ɵɵelementStart(14, "span");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "span");
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(20, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_span_20_Template, 2, 1, "span", 100)(21, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_span_21_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "div", 119)(23, "div", 63);
    i0.ɵɵelement(24, "cfm-status-chip", 69)(25, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(26, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_26_Template, 2, 0, "cfm-button", 116)(27, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_27_Template, 2, 0, "cfm-button", 116)(28, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_28_Template, 2, 2, "cfm-button", 122)(29, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_29_Template, 2, 2, "cfm-button", 122)(30, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_30_Template, 2, 0, "cfm-button", 116)(31, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_cfm_button_31_Template, 2, 1, "cfm-button", 116);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(32, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_ul_32_Template, 2, 1, "ul", 123)(33, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_section_33_Template, 22, 9, "section", 124)(34, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_form_34_Template, 25, 20, "form", 125);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r24.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r24.summary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r24.operationalSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r24.taskSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" Coordination : ", item_r24.coordination.statusLabel, " \u00B7 ", item_r24.coordination.assigneeLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r24.coordination.commentText);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r24.coordination.updatedAtLabel);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r24.linkedWorksiteDocumentsSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r24.linkedQuotesSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r24.linkedInvoicesSummary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r24.financialSummary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r24.regulatorySummary);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", item_r24.statusLabel)("tone", item_r24.statusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r24.signalLabel)("tone", item_r24.signalTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.isFacturationEnabled && ctx_r3.billingCustomers.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.isFacturationEnabled && ctx_r3.billingCustomers.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r24.worksiteDocumentsCount > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r24.worksiteDocuments.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.selectedWorksiteCoordinationId === item_r24.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.worksitePreventionPlanEditingId === item_r24.id);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 98);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_li_1_Template, 35, 26, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredDashboardWorksiteOverviewItems);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 120);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("title", ctx_r3.hasActiveCoordinationFilters ? "Aucun chantier pour ces filtres" : "Aucun chantier \u00E0 afficher")("description", ctx_r3.hasActiveCoordinationFilters ? "Changez les filtres de coordination pour retrouver un chantier." : "Les rep\u00E8res chantier apparaitront ici d\u00E8s qu\u2019ils seront disponibles.");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ul_1_Template, 2, 1, "ul", 82)(2, AppComponent_ng_template_1_cfm_card_4_ng_container_30_ng_template_2_Template, 1, 2, "ng-template", null, 16, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptyWorksiteOverview_r49 = i0.ɵɵreference(3);
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredDashboardWorksiteOverviewItems.length > 0)("ngIfElse", emptyWorksiteOverview_r49);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_template_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 163);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_2_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const worksite_r52 = ctx.$implicit;
    i0.ɵɵproperty("value", worksite_r52.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", worksite_r52.name, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_2_Template(rf, ctx) { if (rf & 1) {
    const _r51 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 108)(1, "span", 58);
    i0.ɵɵtext(2, "Chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 168);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_2_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r51); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedWorksiteDocumentFilterId, $event) || (ctx_r3.selectedWorksiteDocumentFilterId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 88);
    i0.ɵɵtext(5, "Tous les chantiers");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_2_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedWorksiteDocumentFilterId);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.worksiteDocumentFilterOptions);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_3_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r54 = ctx.$implicit;
    i0.ɵɵproperty("value", option_r54.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", option_r54.label, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_3_Template(rf, ctx) { if (rf & 1) {
    const _r53 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 108)(1, "span", 58);
    i0.ɵɵtext(2, "Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 169);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_3_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r53); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedWorksiteDocumentTypeFilter, $event) || (ctx_r3.selectedWorksiteDocumentTypeFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 88);
    i0.ɵɵtext(5, "Tous les types");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_3_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedWorksiteDocumentTypeFilter);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.worksiteDocumentTypeFilterOptions);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_option_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const assignee_r55 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", assignee_r55.user_id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.getWorksiteAssigneeOptionLabel(assignee_r55), " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_cfm_button_35_Template(rf, ctx) { if (rf & 1) {
    const _r56 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_cfm_button_35_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r56); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.resetWorksiteDocumentFilters()); });
    i0.ɵɵtext(1, " R\u00E9initialiser les filtres ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_ng_container_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtext(1);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u00B7 ", document_r58.fileSizeLabel, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(document_r58.coordination.commentSummary);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re g\u00E9n\u00E9ration : ", document_r58.uploadedAtLabel, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_15_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtext(1);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u00B7 ", document_r58.linkedSignatureDetail, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵtemplate(2, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_15_ng_container_2_Template, 2, 1, "ng-container", 100);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Signature li\u00E9e : ", document_r58.linkedSignatureLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.linkedSignatureDetail);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Preuves li\u00E9es : ", document_r58.linkedProofsSummary, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(document_r58.notes);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_cfm_button_23_Template(rf, ctx) { if (rf & 1) {
    const _r59 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_cfm_button_23_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r59); const document_r58 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.downloadWorksiteDocument(document_r58)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r3.isWorksiteDocumentDownloadBusy(document_r58));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.isWorksiteDocumentDownloadBusy(document_r58) ? "T\u00E9l\u00E9chargement en cours" : ctx_r3.getWorksiteDocumentActionLabel(document_r58), " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_cfm_button_24_Template(rf, ctx) { if (rf & 1) {
    const _r60 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_cfm_button_24_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r60); const document_r58 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.toggleWorksitePreventionPlanEditor(document_r58.worksiteId)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === document_r58.worksiteId);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksitePreventionPlanEditingId === document_r58.worksiteId ? "Fermer l'ajustement" : "Ajuster le plan", " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re mise \u00E0 jour : ", document_r58.coordination.updatedAtLabel, " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_label_11_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const assignee_r63 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(9);
    i0.ɵɵproperty("value", assignee_r63.user_id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.getWorksiteAssigneeOptionLabel(assignee_r63), " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_label_11_Template(rf, ctx) { if (rf & 1) {
    const _r62 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_label_11_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r62); const document_r58 = i0.ɵɵnextContext(3).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteDocumentCoordinationDraft(document_r58.id, { assigneeUserId: $event })); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Non affect\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_label_11_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteDocumentCoordinationDraft(document_r58.id).assigneeUserId)("name", "worksiteDocumentCoordinationAssignee" + document_r58.id)("disabled", ctx_r3.worksiteDocumentCoordinationBusyId === document_r58.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.worksiteAssignees);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_ng_template_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 140)(1, "span", 58);
    i0.ɵɵtext(2, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Aucun membre lisible pour affecter ce document.");
    i0.ɵɵelementEnd()();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_Template(rf, ctx) { if (rf & 1) {
    const _r61 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 139)(1, "label", 144)(2, "span");
    i0.ɵɵtext(3, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_Template_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r61); const document_r58 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteDocumentCoordinationDraft(document_r58.id, { status: $event })); });
    i0.ɵɵelementStart(5, "option", 110);
    i0.ɵɵtext(6, "\u00C0 faire");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "option", 111);
    i0.ɵɵtext(8, "En cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "option", 112);
    i0.ɵɵtext(10, "Fait");
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(11, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_label_11_Template, 7, 4, "label", 145)(12, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_ng_template_12_Template, 5, 0, "ng-template", null, 23, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const noDocumentAssignees_r64 = i0.ɵɵreference(13);
    const document_r58 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteDocumentCoordinationDraft(document_r58.id).status)("name", "worksiteDocumentCoordinationStatus" + document_r58.id)("disabled", ctx_r3.worksiteDocumentCoordinationBusyId === document_r58.id);
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngIf", ctx_r3.worksiteAssignees.length > 0)("ngIfElse", noDocumentAssignees_r64);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_label_20_Template(rf, ctx) { if (rf & 1) {
    const _r65 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 146)(1, "span");
    i0.ɵɵtext(2, "Commentaire simple");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "textarea", 171);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_label_20_Template_textarea_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r65); const document_r58 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteDocumentCoordinationDraft(document_r58.id, { commentText: $event })); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteDocumentCoordinationDraft(document_r58.id).commentText)("name", "worksiteDocumentCoordinationComment" + document_r58.id)("disabled", ctx_r3.worksiteDocumentCoordinationBusyId === document_r58.id);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_21_Template(rf, ctx) { if (rf & 1) {
    const _r66 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 107)(1, "cfm-button", 148);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_21_Template_cfm_button_click_1_listener() { i0.ɵɵrestoreView(_r66); const document_r58 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.saveWorksiteDocumentCoordination(document_r58)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.worksiteDocumentCoordinationBusyId === document_r58.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksiteDocumentCoordinationBusyId === document_r58.id ? "Enregistrement en cours" : "Enregistrer", " ");
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_22_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const signature_r67 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(signature_r67.detail);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 140)(1, "span", 58);
    i0.ɵɵtext(2, "Signature li\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(5, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_22_span_5_Template, 2, 1, "span", 100);
    i0.ɵɵelement(6, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const signature_r67 = ctx.ngIf;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(signature_r67.label);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", signature_r67.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", signature_r67.statusLabel)("tone", signature_r67.statusTone);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ng_template_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 140)(1, "span", 58);
    i0.ɵɵtext(2, "Signature li\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Aucune signature li\u00E9e.");
    i0.ɵɵelementEnd()();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ul_28_li_1_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const proof_r68 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(proof_r68.detail);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ul_28_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ul_28_li_1_span_3_Template, 2, 1, "span", 100);
    i0.ɵɵelement(4, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const proof_r68 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(proof_r68.label);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", proof_r68.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", proof_r68.statusLabel)("tone", proof_r68.statusTone);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ul_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 162);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ul_28_li_1_Template, 5, 4, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", document_r58.linkedProofs);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ng_template_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Aucune preuve li\u00E9e.");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 138)(1, "div", 139)(2, "div", 140)(3, "span", 58);
    i0.ɵɵtext(4, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 140)(9, "span", 58);
    i0.ɵɵtext(10, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "strong");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_span_13_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 140)(15, "span", 58);
    i0.ɵɵtext(16, "Commentaire simple");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(19, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_19_Template, 14, 5, "div", 141)(20, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_label_20_Template, 4, 3, "label", 142)(21, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_21_Template, 3, 2, "div", 143)(22, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_div_22_Template, 7, 4, "div", 170)(23, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ng_template_23_Template, 5, 0, "ng-template", null, 21, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementStart(25, "div", 140)(26, "span", 58);
    i0.ɵɵtext(27, "Preuves li\u00E9es");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(28, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ul_28_Template, 2, 1, "ul", 161)(29, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_ng_template_29_Template, 2, 0, "ng-template", null, 22, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const noLinkedSignature_r69 = i0.ɵɵreference(24);
    const noLinkedProofs_r70 = i0.ɵɵreference(30);
    const document_r58 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(document_r58.coordination.statusLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", document_r58.coordination.statusLabel)("tone", document_r58.coordination.statusTone);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(document_r58.coordination.assigneeLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.coordination.updatedAtLabel);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", document_r58.coordination.commentText || "Aucun commentaire simple pour le moment.", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.linkedSignature)("ngIfElse", noLinkedSignature_r69);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngIf", document_r58.linkedProofs.length > 0)("ngIfElse", noLinkedProofs_r70);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_Template(rf, ctx) { if (rf & 1) {
    const _r57 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "div", 68)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span");
    i0.ɵɵtext(9);
    i0.ɵɵtemplate(10, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_ng_container_10_Template, 2, 1, "ng-container", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_13_Template, 2, 1, "span", 100)(14, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_14_Template, 2, 1, "span", 100)(15, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_15_Template, 3, 2, "span", 100)(16, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_16_Template, 2, 1, "span", 100)(17, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_span_17_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "div", 119)(19, "div", 63);
    i0.ɵɵelement(20, "cfm-status-chip", 69)(21, "cfm-status-chip", 69)(22, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(23, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_cfm_button_23_Template, 2, 2, "cfm-button", 122)(24, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_cfm_button_24_Template, 2, 2, "cfm-button", 122);
    i0.ɵɵelementStart(25, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_Template_cfm_button_click_25_listener() { const document_r58 = i0.ɵɵrestoreView(_r57).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.toggleWorksiteDocumentDetails(document_r58.id)); });
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(27, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_section_27_Template, 31, 13, "section", 124);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r58 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(document_r58.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", document_r58.worksiteName, " \u00B7 ", document_r58.fileName, "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(" Type : ", document_r58.typeLabel, " \u00B7 Pr\u00E9paration : ", document_r58.lifecycleStatusLabel, " \u00B7 ", document_r58.signatureStatusLabel, " \u00B7 ", document_r58.proofCountLabel, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" Fichier : ", document_r58.fileAvailabilityLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.fileSizeLabel);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" Coordination : ", document_r58.coordination.statusLabel, " \u00B7 ", document_r58.coordination.assigneeLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.coordination.commentText);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.uploadedAtLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.linkedSignatureLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.linkedProofsSummary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r58.notes);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", document_r58.lifecycleStatusLabel)("tone", document_r58.lifecycleStatusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", document_r58.technicalStatusLabel)("tone", document_r58.technicalStatusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", document_r58.fileAvailabilityLabel)("tone", document_r58.fileAvailabilityTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canAdjustWorksiteDocument(document_r58));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.selectedWorksiteDocumentDetailId === document_r58.id ? "Masquer les \u00E9l\u00E9ments li\u00E9s" : "Voir les \u00E9l\u00E9ments li\u00E9s", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.selectedWorksiteDocumentDetailId === document_r58.id);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 65);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_li_1_Template, 28, 26, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredWorksiteDocumentItems);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_ng_template_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 172);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_41_Template(rf, ctx) { if (rf & 1) {
    const _r50 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 107);
    i0.ɵɵtemplate(2, AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_2_Template, 7, 2, "label", 127)(3, AppComponent_ng_template_1_cfm_card_4_ng_container_41_label_3_Template, 7, 2, "label", 127);
    i0.ɵɵelementStart(4, "label", 108)(5, "span", 58);
    i0.ɵɵtext(6, "Statut");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "select", 164);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_Template_select_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r50); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedWorksiteDocumentLifecycleFilter, $event) || (ctx_r3.selectedWorksiteDocumentLifecycleFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(8, "option", 88);
    i0.ɵɵtext(9, "Tous les statuts");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "option", 131);
    i0.ɵɵtext(11, "Brouillon");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "option", 132);
    i0.ɵɵtext(13, "Finalis\u00E9");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "label", 108)(15, "span", 58);
    i0.ɵɵtext(16, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "select", 165);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_Template_select_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r50); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedCoordinationStatusFilter, $event) || (ctx_r3.selectedCoordinationStatusFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(18, "option", 88);
    i0.ɵɵtext(19, "Tous les suivis");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "option", 110);
    i0.ɵɵtext(21, "\u00C0 faire");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "option", 111);
    i0.ɵɵtext(23, "En cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "option", 112);
    i0.ɵɵtext(25, "Fait");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "label", 108)(27, "span", 58);
    i0.ɵɵtext(28, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "select", 166);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_4_ng_container_41_Template_select_ngModelChange_29_listener($event) { i0.ɵɵrestoreView(_r50); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedCoordinationAssigneeFilter, $event) || (ctx_r3.selectedCoordinationAssigneeFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(30, "option", 88);
    i0.ɵɵtext(31, "Toutes les affectations");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "option", 114);
    i0.ɵɵtext(33, "Non affect\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(34, AppComponent_ng_template_1_cfm_card_4_ng_container_41_option_34_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(35, AppComponent_ng_template_1_cfm_card_4_ng_container_41_cfm_button_35_Template, 2, 0, "cfm-button", 116);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(36, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ul_36_Template, 2, 1, "ul", 167)(37, AppComponent_ng_template_1_cfm_card_4_ng_container_41_ng_template_37_Template, 1, 0, "ng-template", null, 20, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptyWorksiteDocuments_r71 = i0.ɵɵreference(38);
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r3.worksiteDocumentFilterOptions.length > 1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.worksiteDocumentTypeFilterOptions.length > 1);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedWorksiteDocumentLifecycleFilter);
    i0.ɵɵadvance(10);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedCoordinationStatusFilter);
    i0.ɵɵadvance(12);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedCoordinationAssigneeFilter);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngForOf", ctx_r3.worksiteAssignees);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.hasActiveWorksiteDocumentFilters);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredWorksiteDocumentItems.length > 0)("ngIfElse", emptyWorksiteDocuments_r71);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_template_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 173);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_li_1_cfm_button_12_Template(rf, ctx) { if (rf & 1) {
    const _r72 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_li_1_cfm_button_12_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r72); const item_r73 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.prepareQuoteFromCustomer(item_r73.id)); });
    i0.ɵɵtext(1, " Pr\u00E9parer un devis ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_li_1_cfm_button_13_Template(rf, ctx) { if (rf & 1) {
    const _r74 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_li_1_cfm_button_13_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r74); const item_r73 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.prepareInvoiceFromCustomer(item_r73.id)); });
    i0.ɵɵtext(1, " Pr\u00E9parer une facture ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 99)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 119)(9, "div", 63);
    i0.ɵɵelement(10, "cfm-status-chip", 69)(11, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(12, AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_li_1_cfm_button_12_Template, 2, 0, "cfm-button", 116)(13, AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_li_1_cfm_button_13_Template, 2, 0, "cfm-button", 116);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r73 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r73.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r73.summary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r73.context);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", item_r73.statusLabel)("tone", item_r73.statusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r73.signalLabel)("tone", item_r73.signalTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.billingCustomers.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.billingCustomers.length > 0);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 98);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_li_1_Template, 14, 9, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.dashboardCustomerOverviewItems);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_52_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 174);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_container_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, AppComponent_ng_template_1_cfm_card_4_ng_container_52_ul_1_Template, 2, 1, "ul", 82)(2, AppComponent_ng_template_1_cfm_card_4_ng_container_52_ng_template_2_Template, 1, 0, "ng-template", null, 24, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptyCustomerOverview_r75 = i0.ɵɵreference(3);
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.dashboardCustomerOverviewItems.length > 0)("ngIfElse", emptyCustomerOverview_r75);
} }
function AppComponent_ng_template_1_cfm_card_4_ng_template_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 175);
} }
function AppComponent_ng_template_1_cfm_card_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 101)(1, "section", 83)(2, "div", 84)(3, "div", 85)(4, "h3");
    i0.ɵɵtext(5, "Synth\u00E8se par module");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 58);
    i0.ɵɵtext(7, " Chaque module ressort avec quelques rep\u00E8res utiles pour comprendre plus vite o\u00F9 regarder. ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(8, AppComponent_ng_template_1_cfm_card_4_div_8_Template, 2, 1, "div", 80)(9, AppComponent_ng_template_1_cfm_card_4_ng_template_9_Template, 2, 0, "ng-template", null, 10, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "section", 83)(12, "div", 84)(13, "div", 85)(14, "h3");
    i0.ɵɵtext(15, "\u00C0 traiter");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "p", 58);
    i0.ɵɵtext(17, " Une lecture courte pour retrouver vite les chantiers et documents encore en pr\u00E9paration. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(18, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(19, AppComponent_ng_template_1_cfm_card_4_ng_container_19_Template, 29, 6, "ng-container", 102)(20, AppComponent_ng_template_1_cfm_card_4_ng_template_20_Template, 1, 0, "ng-template", null, 11, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "section", 103)(23, "div", 84)(24, "div", 85)(25, "h3");
    i0.ɵɵtext(26, "Vue par chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "p", 58);
    i0.ɵɵtext(28, " Les chantiers ressortent avec leur statut g\u00E9n\u00E9ral, leurs signaux simples et les documents d\u00E9j\u00E0 li\u00E9s. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(29, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(30, AppComponent_ng_template_1_cfm_card_4_ng_container_30_Template, 4, 2, "ng-container", 102)(31, AppComponent_ng_template_1_cfm_card_4_ng_template_31_Template, 1, 0, "ng-template", null, 12, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "section", 104)(34, "div", 84)(35, "div", 85)(36, "h3");
    i0.ɵɵtext(37, "Documents chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "p", 58);
    i0.ɵɵtext(39, " Retrouvez rapidement les documents d\u00E9j\u00E0 g\u00E9n\u00E9r\u00E9s pour un chantier, sans navigation documentaire plus lourde. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(40, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(41, AppComponent_ng_template_1_cfm_card_4_ng_container_41_Template, 39, 9, "ng-container", 102)(42, AppComponent_ng_template_1_cfm_card_4_ng_template_42_Template, 1, 0, "ng-template", null, 13, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "section", 83)(45, "div", 84)(46, "div", 85)(47, "h3");
    i0.ɵɵtext(48, "Vue par client");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "p", 58);
    i0.ɵɵtext(50, " Une lecture commerciale simple pour savoir quels clients demandent un suivi imm\u00E9diat. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(51, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(52, AppComponent_ng_template_1_cfm_card_4_ng_container_52_Template, 4, 2, "ng-container", 102)(53, AppComponent_ng_template_1_cfm_card_4_ng_template_53_Template, 1, 0, "ng-template", null, 14, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const emptyEnterpriseOverview_r76 = i0.ɵɵreference(10);
    const chantierCoordinationDisabled_r77 = i0.ɵɵreference(21);
    const chantierOverviewDisabled_r78 = i0.ɵɵreference(32);
    const chantierDocumentsDisabled_r79 = i0.ɵɵreference(43);
    const customerOverviewDisabled_r80 = i0.ɵɵreference(54);
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("ngIf", ctx_r3.dashboardEnterpriseOverviewCards.length > 0)("ngIfElse", emptyEnterpriseOverview_r76);
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("label", ctx_r3.coordinationTodoCountLabel)("tone", ctx_r3.coordinationTodoItems.length > 0 ? "progress" : "success");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isChantierEnabled)("ngIfElse", chantierCoordinationDisabled_r77);
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("label", ctx_r3.worksiteOverviewCountLabel)("tone", ctx_r3.filteredDashboardWorksiteOverviewItems.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isChantierEnabled)("ngIfElse", chantierOverviewDisabled_r78);
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("label", ctx_r3.worksiteDocumentCountLabel)("tone", ctx_r3.filteredWorksiteDocumentItems.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isChantierEnabled)("ngIfElse", chantierDocumentsDisabled_r79);
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("label", ctx_r3.dashboardCustomerOverviewItems.length + " client" + (ctx_r3.dashboardCustomerOverviewItems.length > 1 ? "s" : ""))("tone", ctx_r3.dashboardCustomerOverviewItems.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isFacturationEnabled)("ngIfElse", customerOverviewDisabled_r80);
} }
function AppComponent_ng_template_1_ng_container_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 176);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const homeAdministrationCardTemplate_r81 = i0.ɵɵreference(2);
    i0.ɵɵproperty("ngTemplateOutlet", homeAdministrationCardTemplate_r81);
} }
function AppComponent_ng_template_1_cfm_card_6_p_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 195);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.betaFeedbackError);
} }
function AppComponent_ng_template_1_cfm_card_6_p_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 196);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.betaFeedbackNotice);
} }
function AppComponent_ng_template_1_cfm_card_6_section_46_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 197)(1, "div", 160)(2, "strong");
    i0.ɵɵtext(3, "Aper\u00E7u du retour");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 58);
    i0.ɵɵtext(5, "La date et l\u2019organisation seront ajout\u00E9es lors de la copie.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "pre", 198);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(ctx_r3.betaFeedbackPreviewText);
} }
function AppComponent_ng_template_1_cfm_card_6_Template(rf, ctx) { if (rf & 1) {
    const _r82 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-card", 177)(1, "form", 178);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_1_cfm_card_6_Template_form_ngSubmit_1_listener() { i0.ɵɵrestoreView(_r82); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.copyBetaFeedback()); });
    i0.ɵɵelementStart(2, "div", 107)(3, "label", 144)(4, "span");
    i0.ɵɵtext(5, "Type de retour");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "select", 179);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_6_Template_select_ngModelChange_6_listener($event) { i0.ɵɵrestoreView(_r82); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.betaFeedbackCategory, $event) || (ctx_r3.betaFeedbackCategory = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(7, "option", 180);
    i0.ɵɵtext(8, "Bloquant");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "option", 181);
    i0.ɵɵtext(10, "Incompr\u00E9hension");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "option", 182);
    i0.ɵɵtext(12, "Am\u00E9lioration");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option", 183);
    i0.ɵɵtext(14, "Retour positif");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "label", 144)(16, "span");
    i0.ɵɵtext(17, "Zone concern\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "select", 184);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_6_Template_select_ngModelChange_18_listener($event) { i0.ɵɵrestoreView(_r82); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.betaFeedbackArea, $event) || (ctx_r3.betaFeedbackArea = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(19, "option", 185);
    i0.ɵɵtext(20, "Cockpit");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "option", 186);
    i0.ɵɵtext(22, "Chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "option", 187);
    i0.ɵɵtext(24, "Documents chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "option", 91);
    i0.ɵɵtext(26, "Facturation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "option", 89);
    i0.ɵɵtext(28, "R\u00E9glementation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "option", 188);
    i0.ɵɵtext(30, "Synchronisation visible");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "option", 189);
    i0.ɵɵtext(32, "Autre");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(33, "label", 146)(34, "span");
    i0.ɵɵtext(35, "Message libre court");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "textarea", 190);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_1_cfm_card_6_Template_textarea_ngModelChange_36_listener($event) { i0.ɵɵrestoreView(_r82); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.betaFeedbackMessageText, $event) || (ctx_r3.betaFeedbackMessageText = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "p", 58);
    i0.ɵɵtext(38, " Le retour est pr\u00E9par\u00E9 dans un format simple \u00E0 coller ensuite dans votre canal beta ou pilote habituel. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "div", 191)(40, "cfm-button", 158);
    i0.ɵɵtext(41);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_1_cfm_card_6_Template_cfm_button_click_42_listener() { i0.ɵɵrestoreView(_r82); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.resetBetaFeedback()); });
    i0.ɵɵtext(43, " Effacer ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(44, AppComponent_ng_template_1_cfm_card_6_p_44_Template, 2, 1, "p", 192)(45, AppComponent_ng_template_1_cfm_card_6_p_45_Template, 2, 1, "p", 193)(46, AppComponent_ng_template_1_cfm_card_6_section_46_Template, 8, 1, "section", 194);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(6);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.betaFeedbackCategory);
    i0.ɵɵadvance(12);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.betaFeedbackArea);
    i0.ɵɵadvance(18);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.betaFeedbackMessageText);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r3.betaFeedbackCopyBusy || !ctx_r3.canCopyBetaFeedback);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.betaFeedbackCopyBusy ? "Copie en cours" : "Copier le retour", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.betaFeedbackCopyBusy || !ctx_r3.hasBetaFeedbackDraft);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r3.betaFeedbackError);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.betaFeedbackNotice && !ctx_r3.betaFeedbackError);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.hasBetaFeedbackDraft);
} }
function AppComponent_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, AppComponent_ng_template_1_cfm_card_0_Template, 17, 0, "cfm-card", 45)(1, AppComponent_ng_template_1_ng_template_1_Template, 3, 2, "ng-template", null, 5, i0.ɵɵtemplateRefExtractor)(3, AppComponent_ng_template_1_cfm_card_3_Template, 39, 15, "cfm-card", 46)(4, AppComponent_ng_template_1_cfm_card_4_Template, 55, 18, "cfm-card", 47)(5, AppComponent_ng_template_1_ng_container_5_Template, 1, 1, "ng-container", 48)(6, AppComponent_ng_template_1_cfm_card_6_Template, 47, 9, "cfm-card", 49);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngIf", ctx_r3.shouldShowInitialWorkspaceLoading);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r3.currentMembership);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.currentMembership);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.currentMembership);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.currentMembership);
} }
function AppComponent_ng_template_3_cfm_card_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 201)(1, "div", 51)(2, "div", 52);
    i0.ɵɵelement(3, "div", 53);
    i0.ɵɵelementStart(4, "div", 54);
    i0.ɵɵelement(5, "span")(6, "span")(7, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 55);
    i0.ɵɵelement(9, "span")(10, "span")(11, "span");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 56)(13, "p", 57);
    i0.ɵɵtext(14, "Mise \u00E0 jour en cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "p", 58);
    i0.ɵɵtext(16, "Les donn\u00E9es r\u00E9glementaires restent en pr\u00E9paration.");
    i0.ɵɵelementEnd()()()();
} }
function AppComponent_ng_template_3_cfm_card_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 202);
    i0.ɵɵelement(1, "cfm-empty-state", 203);
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_1_Template(rf, ctx) { if (rf & 1) {
    const _r84 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-card", 268)(1, "div", 63);
    i0.ɵɵelement(2, "cfm-status-chip", 269)(3, "cfm-status-chip", 270);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "form", 271);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_1_Template_form_ngSubmit_4_listener() { i0.ɵɵrestoreView(_r84); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.completeOnboarding()); });
    i0.ɵɵelementStart(5, "cfm-input", 272);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_1_Template_cfm_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r84); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.name, $event) || (ctx_r3.profileForm.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "cfm-input", 273);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_1_Template_cfm_input_ngModelChange_6_listener($event) { i0.ɵɵrestoreView(_r84); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.activityLabel, $event) || (ctx_r3.profileForm.activityLabel = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "label", 212)(8, "span");
    i0.ɵɵtext(9, "Pr\u00E9sence de salari\u00E9s");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "select", 274);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_1_Template_select_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r84); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.hasEmployees, $event) || (ctx_r3.profileForm.hasEmployees = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(11, "option", 133);
    i0.ɵɵtext(12, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option", 275);
    i0.ɵɵtext(14, "Oui");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "option", 276);
    i0.ɵɵtext(16, "Non");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(17, "cfm-input", 277);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_1_Template_cfm_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r84); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.employeeCount, $event) || (ctx_r3.profileForm.employeeCount = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "cfm-input", 278);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_1_Template_cfm_input_ngModelChange_18_listener($event) { i0.ɵɵrestoreView(_r84); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.contactEmail, $event) || (ctx_r3.profileForm.contactEmail = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div", 218)(20, "cfm-button", 158);
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.name);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.activityLabel);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.hasEmployees);
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.employeeCount);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.contactEmail);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.organizationProfileSaving || !ctx_r3.canSubmitOnboarding);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.organizationProfileSaving ? "Initialisation en cours" : "Initialiser l\u2019entreprise", " ");
} }
function AppComponent_ng_template_3_ng_container_2_div_3_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 63);
    i0.ɵɵelement(1, "cfm-status-chip", 69)(2, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.isOnboardingPending ? "Onboarding \u00E0 finaliser" : "Profil initialis\u00E9")("tone", ctx_r3.isOnboardingPending ? "progress" : "success");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.organizationProfile.has_employees === true ? "Avec salari\u00E9s" : ctx_r3.organizationProfile.has_employees === false ? "Sans salari\u00E9s" : "Salari\u00E9s \u00E0 pr\u00E9ciser")("tone", ctx_r3.organizationProfile.has_employees === true ? "success" : ctx_r3.organizationProfile.has_employees === false ? "calm" : "warning");
} }
function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template(rf, ctx) { if (rf & 1) {
    const _r85 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 271);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.saveProfile()); });
    i0.ɵɵelementStart(1, "cfm-input", 279);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_cfm_input_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.name, $event) || (ctx_r3.profileForm.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "cfm-input", 280);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_cfm_input_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.legalName, $event) || (ctx_r3.profileForm.legalName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-input", 281);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_cfm_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.activityLabel, $event) || (ctx_r3.profileForm.activityLabel = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "cfm-input", 282);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_cfm_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.employeeCount, $event) || (ctx_r3.profileForm.employeeCount = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "label", 212)(6, "span");
    i0.ɵɵtext(7, "Pr\u00E9sence de salari\u00E9s");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "select", 283);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_select_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.hasEmployees, $event) || (ctx_r3.profileForm.hasEmployees = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(9, "option", 133);
    i0.ɵɵtext(10, "\u00C0 pr\u00E9ciser");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "option", 275);
    i0.ɵɵtext(12, "Oui");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option", 276);
    i0.ɵɵtext(14, "Non");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "cfm-input", 284);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_cfm_input_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.contactEmail, $event) || (ctx_r3.profileForm.contactEmail = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "cfm-input", 285);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_cfm_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.contactPhone, $event) || (ctx_r3.profileForm.contactPhone = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "label", 146)(18, "span");
    i0.ɵɵtext(19, "Adresse principale");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "textarea", 286);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_textarea_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.headquartersAddress, $event) || (ctx_r3.profileForm.headquartersAddress = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "label", 146)(22, "span");
    i0.ɵɵtext(23, "Informations utiles");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "textarea", 287);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template_textarea_ngModelChange_24_listener($event) { i0.ɵɵrestoreView(_r85); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.notes, $event) || (ctx_r3.profileForm.notes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "div", 218)(26, "cfm-button", 158);
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.name);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.legalName);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.activityLabel);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.employeeCount);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.hasEmployees);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.contactEmail);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.contactPhone);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.headquartersAddress);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.notes);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.organizationProfileSaving ? "Enregistrement en cours" : "Enregistrer le profil", " ");
} }
function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_5_Template(rf, ctx) { if (rf & 1) {
    const _r86 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-card", 288)(1, "div", 63);
    i0.ɵɵelement(2, "cfm-status-chip", 289)(3, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 58);
    i0.ɵɵtext(5, " Ces r\u00E9ponses am\u00E9liorent la lecture du p\u00E9rim\u00E8tre r\u00E9glementaire. Si vous laissez un point \u00E0 pr\u00E9ciser, le moteur reste volontairement prudent. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "form", 271);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_5_Template_form_ngSubmit_6_listener() { i0.ɵɵrestoreView(_r86); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.saveQualificationQuestionnaire()); });
    i0.ɵɵelementStart(7, "label", 212)(8, "span");
    i0.ɵɵtext(9, "Recevez-vous du public ou des clients sur au moins un site ?");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "select", 290);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_5_Template_select_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r86); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.receivesPublic, $event) || (ctx_r3.profileForm.receivesPublic = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(11, "option", 133);
    i0.ɵɵtext(12, "\u00C0 pr\u00E9ciser");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option", 275);
    i0.ɵɵtext(14, "Oui");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "option", 276);
    i0.ɵɵtext(16, "Non");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(17, "label", 212)(18, "span");
    i0.ɵɵtext(19, "Stockez-vous des produits ou mat\u00E9riels sensibles sur site ?");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "select", 291);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_5_Template_select_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r86); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.storesHazardousProducts, $event) || (ctx_r3.profileForm.storesHazardousProducts = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(21, "option", 133);
    i0.ɵɵtext(22, "\u00C0 pr\u00E9ciser");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "option", 275);
    i0.ɵɵtext(24, "Oui");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "option", 276);
    i0.ɵɵtext(26, "Non");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "label", 212)(28, "span");
    i0.ɵɵtext(29, "R\u00E9alisez-vous des interventions terrain \u00E0 risque ?");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "select", 292);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_5_Template_select_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r86); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.profileForm.performsHighRiskWork, $event) || (ctx_r3.profileForm.performsHighRiskWork = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(31, "option", 133);
    i0.ɵɵtext(32, "\u00C0 pr\u00E9ciser");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "option", 275);
    i0.ɵɵtext(34, "Oui");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "option", 276);
    i0.ɵɵtext(36, "Non");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(37, "div", 218)(38, "cfm-button", 158);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", ctx_r3.isQualificationQuestionnaireComplete ? "Questionnaire compl\u00E9t\u00E9" : "Questionnaire \u00E0 compl\u00E9ter")("tone", ctx_r3.isQualificationQuestionnaireComplete ? "success" : "progress");
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.receivesPublic);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance(10);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.storesHazardousProducts);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance(10);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.profileForm.performsHighRiskWork);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationProfileSaving);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.organizationProfileSaving ? "Enregistrement en cours" : "Enregistrer le questionnaire", " ");
} }
function AppComponent_ng_template_3_ng_container_2_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 263);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_1_Template, 22, 7, "cfm-card", 264);
    i0.ɵɵelementStart(2, "cfm-card", 265);
    i0.ɵɵtemplate(3, AppComponent_ng_template_3_ng_container_2_div_3_div_3_Template, 3, 4, "div", 237)(4, AppComponent_ng_template_3_ng_container_2_div_3_form_4_Template, 28, 20, "form", 266);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(5, AppComponent_ng_template_3_ng_container_2_div_3_cfm_card_5_Template, 40, 10, "cfm-card", 267);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isOnboardingPending);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r3.organizationProfile);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.organizationProfile);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.organizationProfile && !ctx_r3.isOnboardingPending);
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 304);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const declaredSite_r87 = i0.ɵɵnextContext(2).ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re tentative : ", i0.ɵɵpipeBind2(2, 1, declaredSite_r87.location_enrichment_attempted_at, "dd/MM/yyyy HH:mm"), " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 305);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const enrichment_r88 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", enrichment_r88.reasonLabel, " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 306);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const declaredSite_r87 = i0.ɵɵnextContext(2).ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Adresse reconnue : ", declaredSite_r87.normalized_address, " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 306);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const declaredSite_r87 = i0.ɵɵnextContext(2).ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", declaredSite_r87.site_risk_summary, " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 306);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r89 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.getRegulatoryAllSiteDetail(site_r89), " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 298)(1, "div", 299);
    i0.ɵɵelement(2, "cfm-status-chip", 69);
    i0.ɵɵtemplate(3, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_3_Template, 3, 4, "span", 300);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 301);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_6_Template, 2, 1, "span", 302)(7, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_7_Template, 2, 1, "span", 303)(8, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_8_Template, 2, 1, "span", 303)(9, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_span_9_Template, 2, 1, "span", 303);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const enrichment_r88 = ctx.ngIf;
    const declaredSite_r87 = i0.ɵɵnextContext().ngIf;
    const site_r89 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", enrichment_r88.label)("tone", enrichment_r88.tone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", declaredSite_r87.location_enrichment_attempted_at);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(enrichment_r88.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", enrichment_r88.reasonLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", declaredSite_r87.normalized_address);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", declaredSite_r87.site_risk_summary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", site_r89.sourceKinds.length > 1);
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_11_cfm_button_1_Template(rf, ctx) { if (rf & 1) {
    const _r91 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 310);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_11_cfm_button_1_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r91); const declaredSite_r87 = i0.ɵɵnextContext(2).ngIf; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.relaunchSiteEnrichment(declaredSite_r87)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const enrichment_r92 = ctx.ngIf;
    const declaredSite_r87 = i0.ɵɵnextContext(2).ngIf;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("variant", enrichment_r92.showRetryAsPrimary ? "secondary" : "ghost")("disabled", ctx_r3.organizationSiteEnrichmentBusyId === declaredSite_r87.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.organizationSiteEnrichmentBusyId === declaredSite_r87.id ? "Relance en cours" : enrichment_r92.retryLabel, " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_11_Template(rf, ctx) { if (rf & 1) {
    const _r90 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 307);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_11_cfm_button_1_Template, 2, 3, "cfm-button", 308);
    i0.ɵɵelementStart(2, "cfm-button", 309);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_11_Template_cfm_button_click_2_listener() { i0.ɵɵrestoreView(_r90); const declaredSite_r87 = i0.ɵɵnextContext().ngIf; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.toggleSiteStatus(declaredSite_r87)); });
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const declaredSite_r87 = i0.ɵɵnextContext().ngIf;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.getSiteEnrichmentUiState(declaredSite_r87));
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.organizationSiteStatusBusyId === declaredSite_r87.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.organizationSiteStatusBusyId === declaredSite_r87.id ? "Mise \u00E0 jour en cours" : declaredSite_r87.status === "active" ? "Archiver" : "R\u00E9activer", " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 294)(2, "div", 295)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 63);
    i0.ɵɵelement(6, "cfm-status-chip", 67)(7, "cfm-status-chip", 69);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "span");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(10, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_10_Template, 10, 8, "div", 296);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(11, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_div_11_Template, 4, 3, "div", 297);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const declaredSite_r87 = ctx.ngIf;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(declaredSite_r87.name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r3.getSiteTypeLabel(declaredSite_r87.site_type));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", declaredSite_r87.status === "active" ? "Actif" : "Archiv\u00E9")("tone", declaredSite_r87.status === "active" ? "success" : "neutral");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(declaredSite_r87.address);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.getSiteEnrichmentUiState(declaredSite_r87));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_template_2_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r89 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(site_r89.address);
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 294)(1, "div", 295)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 63);
    i0.ɵɵelement(5, "cfm-status-chip", 311)(6, "cfm-status-chip", 312);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(7, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_template_2_span_7_Template, 2, 1, "span", 100);
    i0.ɵɵelementStart(8, "span", 301);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const site_r89 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(site_r89.name);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", ctx_r3.getRegulatoryAllSiteSourceLabel(site_r89));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", site_r89.address);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r3.getRegulatoryAllSiteDetail(site_r89));
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_container_1_Template, 12, 7, "ng-container", 102)(2, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_ng_template_2_Template, 10, 4, "ng-template", null, 31, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r89 = ctx.$implicit;
    const inferredRegulatorySite_r93 = i0.ɵɵreference(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", site_r89.declaredSite)("ngIfElse", inferredRegulatorySite_r93);
} }
function AppComponent_ng_template_3_ng_container_2_ul_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 293);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_ul_24_li_1_Template, 4, 2, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.regulatoryAllSites);
} }
function AppComponent_ng_template_3_ng_container_2_ng_template_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 313);
} }
function AppComponent_ng_template_3_ng_container_2_option_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r94 = ctx.$implicit;
    i0.ɵɵproperty("value", site_r94.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", site_r94.name, " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_40_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 68)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(6, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const alert_r95 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(alert_r95.item_name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", alert_r95.site_name, " \u00B7 ", alert_r95.message, "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", alert_r95.alert_type === "overdue" ? "En retard" : "\u00C9ch\u00E9ance proche")("tone", alert_r95.alert_type === "overdue" ? "warning" : "progress");
} }
function AppComponent_ng_template_3_ng_container_2_ul_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 98);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_ul_40_li_1_Template, 7, 5, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredBuildingSafetyAlerts);
} }
function AppComponent_ng_template_3_ng_container_2_ng_template_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 314);
} }
function AppComponent_ng_template_3_ng_container_2_option_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r96 = ctx.$implicit;
    i0.ɵɵproperty("value", site_r96.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", site_r96.name, " ");
} }
function AppComponent_ng_template_3_ng_container_2_label_64_Template(rf, ctx) { if (rf & 1) {
    const _r97 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 212)(1, "span");
    i0.ɵɵtext(2, "Statut");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 315);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_label_64_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r97); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.buildingSafetyForm.status, $event) || (ctx_r3.buildingSafetyForm.status = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 316);
    i0.ɵɵtext(5, "Actif");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "option", 317);
    i0.ɵɵtext(7, "Archiv\u00E9");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.buildingSafetyForm.status);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.buildingSafetySaving);
} }
function AppComponent_ng_template_3_ng_container_2_p_69_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 58);
    i0.ɵɵtext(1, " Mettez \u00E0 jour l\u2019\u00E9ch\u00E9ance ou le dernier contr\u00F4le sans changer le rattachement du site. ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_3_ng_container_2_cfm_button_73_Template(rf, ctx) { if (rf & 1) {
    const _r98 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_cfm_button_73_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r98); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.cancelBuildingSafetyEditing()); });
    i0.ɵɵtext(1, " Annuler ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r3.buildingSafetySaving);
} }
function AppComponent_ng_template_3_ng_container_2_ul_74_li_1_cfm_status_chip_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 312);
} if (rf & 2) {
    const item_r99 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("label", item_r99.site_name);
} }
function AppComponent_ng_template_3_ng_container_2_ul_74_li_1_span_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r99 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Dernier contr\u00F4le : ", item_r99.last_checked_at, "");
} }
function AppComponent_ng_template_3_ng_container_2_ul_74_li_1_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r99 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r99.notes);
} }
function AppComponent_ng_template_3_ng_container_2_ul_74_li_1_div_13_Template(rf, ctx) { if (rf & 1) {
    const _r100 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 107)(1, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_ul_74_li_1_div_13_Template_cfm_button_click_1_listener() { i0.ɵɵrestoreView(_r100); const item_r99 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.startEditingBuildingSafetyItem(item_r99)); });
    i0.ɵɵtext(2, " Modifier ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_ul_74_li_1_div_13_Template_cfm_button_click_3_listener() { i0.ɵɵrestoreView(_r100); const item_r99 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.toggleBuildingSafetyItemStatus(item_r99)); });
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r99 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.buildingSafetySaving || ctx_r3.buildingSafetyStatusBusyId === item_r99.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.buildingSafetySaving || ctx_r3.buildingSafetyStatusBusyId === item_r99.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.buildingSafetyStatusBusyId === item_r99.id ? "Mise \u00E0 jour en cours" : item_r99.status === "active" ? "Archiver" : "R\u00E9activer", " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_74_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 319)(2, "div", 295)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 63);
    i0.ɵɵelement(6, "cfm-status-chip", 67)(7, "cfm-status-chip", 69);
    i0.ɵɵtemplate(8, AppComponent_ng_template_3_ng_container_2_ul_74_li_1_cfm_status_chip_8_Template, 1, 1, "cfm-status-chip", 320);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(11, AppComponent_ng_template_3_ng_container_2_ul_74_li_1_span_11_Template, 2, 1, "span", 100)(12, AppComponent_ng_template_3_ng_container_2_ul_74_li_1_span_12_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, AppComponent_ng_template_3_ng_container_2_ul_74_li_1_div_13_Template, 5, 3, "div", 143);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r99 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(item_r99.name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r3.getBuildingSafetyTypeLabel(item_r99.item_type));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getBuildingSafetyAlertStatusLabel(item_r99.alert_status))("tone", ctx_r3.getBuildingSafetyAlertStatusTone(item_r99.alert_status));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.selectedSafetySiteId === "all");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("\u00C9ch\u00E9ance : ", item_r99.next_due_date, "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r99.last_checked_at);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r99.notes);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
} }
function AppComponent_ng_template_3_ng_container_2_ul_74_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 318);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_ul_74_li_1_Template, 14, 9, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredBuildingSafetyItems);
} }
function AppComponent_ng_template_3_ng_container_2_ng_template_75_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 321);
} }
function AppComponent_ng_template_3_ng_container_2_div_79_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 63);
    i0.ɵɵelement(1, "cfm-status-chip", 69)(2, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_17_0;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.regulatoryProfile.profile_status === "ready" ? "Profil exploitable" : "Profil \u00E0 compl\u00E9ter")("tone", ctx_r3.regulatoryProfile.profile_status === "ready" ? "success" : "progress");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getObligationCountLabel())("tone", ((tmp_17_0 = ctx_r3.regulatoryProfile.applicable_obligations.length) !== null && tmp_17_0 !== undefined ? tmp_17_0 : 0) > 0 ? "calm" : "neutral");
} }
function AppComponent_ng_template_3_ng_container_2_cfm_status_chip_80_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 69);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("label", ctx_r3.selectedObligationEvidences.length + " preuve" + (ctx_r3.selectedObligationEvidences.length > 1 ? "s" : ""))("tone", ctx_r3.selectedObligationEvidences.length > 0 ? "success" : "neutral");
} }
function AppComponent_ng_template_3_ng_container_2_p_81_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 58);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Pour affiner cette lecture, compl\u00E9tez : ", ctx_r3.regulatoryProfile == null ? null : ctx_r3.regulatoryProfile.missing_profile_items == null ? null : ctx_r3.regulatoryProfile.missing_profile_items.join(", "), ". ");
} }
function AppComponent_ng_template_3_ng_container_2_div_82_cfm_status_chip_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 69);
} if (rf & 2) {
    const criterion_r101 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("label", criterion_r101.summary)("tone", ctx_r3.getCriterionTone(criterion_r101.value));
} }
function AppComponent_ng_template_3_ng_container_2_div_82_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 322);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_div_82_cfm_status_chip_1_Template, 1, 2, "cfm-status-chip", 323);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.regulatoryProfile.criteria);
} }
function AppComponent_ng_template_3_ng_container_2_ul_83_li_1_Template(rf, ctx) { if (rf & 1) {
    const _r102 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "div", 325)(2, "div", 326)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 63);
    i0.ɵɵelement(6, "cfm-status-chip", 67)(7, "cfm-status-chip", 69)(8, "cfm-status-chip", 69);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 58);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 107)(14, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_ul_83_li_1_Template_cfm_button_click_14_listener() { const obligation_r103 = i0.ɵɵrestoreView(_r102).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.openObligationDetail(obligation_r103.id)); });
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const obligation_r103 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(obligation_r103.title);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r3.getObligationCategoryLabel(obligation_r103.category));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getObligationPriorityLabel(obligation_r103.priority))("tone", ctx_r3.getObligationPriorityTone(obligation_r103.priority));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getComplianceStatusLabel(obligation_r103.status))("tone", ctx_r3.getComplianceStatusTone(obligation_r103.status));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(obligation_r103.description);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(obligation_r103.reason_summary);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.selectedObligationId === obligation_r103.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.selectedObligationId === obligation_r103.id ? "Fiche ouverte" : "Ouvrir la fiche", " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_83_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 324);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_ul_83_li_1_Template, 16, 10, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.regulatoryProfile.applicable_obligations);
} }
function AppComponent_ng_template_3_ng_container_2_article_84_ul_17_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const criterion_r104 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(criterion_r104.summary);
} }
function AppComponent_ng_template_3_ng_container_2_article_84_ul_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 162);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_article_84_ul_17_li_1_Template, 2, 1, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.selectedObligationCriteria);
} }
function AppComponent_ng_template_3_ng_container_2_article_84_ul_26_li_1_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const evidence_r105 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Ajout\u00E9 le ", i0.ɵɵpipeBind2(2, 1, evidence_r105.uploaded_at, "shortDate"), "");
} }
function AppComponent_ng_template_3_ng_container_2_article_84_ul_26_li_1_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const evidence_r105 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(evidence_r105.notes);
} }
function AppComponent_ng_template_3_ng_container_2_article_84_ul_26_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 330)(2, "div", 328)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, AppComponent_ng_template_3_ng_container_2_article_84_ul_26_li_1_span_7_Template, 3, 4, "span", 100)(8, AppComponent_ng_template_3_ng_container_2_article_84_ul_26_li_1_span_8_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(9, "cfm-status-chip", 69);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const evidence_r105 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(evidence_r105.file_name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", evidence_r105.document_type, " \u00B7 ", ctx_r3.getDocumentStatusLabel(evidence_r105.status), "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", evidence_r105.uploaded_at);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", evidence_r105.notes);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getDocumentStatusLabel(evidence_r105.status))("tone", ctx_r3.getDocumentStatusTone(evidence_r105.status));
} }
function AppComponent_ng_template_3_ng_container_2_article_84_ul_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 162);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_article_84_ul_26_li_1_Template, 10, 7, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.selectedObligationEvidences);
} }
function AppComponent_ng_template_3_ng_container_2_article_84_ng_template_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 58);
    i0.ɵɵtext(1, " Aucune pi\u00E8ce n'est encore rattach\u00E9e directement \u00E0 cette obligation. ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_3_ng_container_2_article_84_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 327)(1, "div", 326)(2, "div", 328)(3, "h3");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 63);
    i0.ɵɵelement(8, "cfm-status-chip", 69)(9, "cfm-status-chip", 69)(10, "cfm-status-chip", 69);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 139)(12, "section", 140)(13, "h3");
    i0.ɵɵtext(14, "Pourquoi elle s'applique");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "p");
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(17, AppComponent_ng_template_3_ng_container_2_article_84_ul_17_Template, 2, 1, "ul", 329);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "section", 140)(19, "h3");
    i0.ɵɵtext(20, "Premi\u00E8re action conseill\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "p");
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(23, "section", 140)(24, "h3");
    i0.ɵɵtext(25, "Pi\u00E8ces d\u00E9j\u00E0 rattach\u00E9es");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(26, AppComponent_ng_template_3_ng_container_2_article_84_ul_26_Template, 2, 1, "ul", 161)(27, AppComponent_ng_template_3_ng_container_2_article_84_ng_template_27_Template, 2, 0, "ng-template", null, 32, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const selectedObligation_r106 = ctx.ngIf;
    const emptyObligationEvidences_r107 = i0.ɵɵreference(28);
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(selectedObligation_r106.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(selectedObligation_r106.description);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r3.getObligationPriorityLabel(selectedObligation_r106.priority))("tone", ctx_r3.getObligationPriorityTone(selectedObligation_r106.priority));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getComplianceStatusLabel(selectedObligation_r106.status))("tone", ctx_r3.getComplianceStatusTone(selectedObligation_r106.status));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.selectedObligationEvidences.length + " preuve" + (ctx_r3.selectedObligationEvidences.length > 1 ? "s" : ""))("tone", ctx_r3.selectedObligationEvidences.length > 0 ? "success" : "neutral");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(selectedObligation_r106.reason_summary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.selectedObligationCriteria.length > 0);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r3.getObligationFirstAction(selectedObligation_r106, ctx_r3.selectedObligationEvidences.length));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r3.selectedObligationEvidences.length > 0)("ngIfElse", emptyObligationEvidences_r107);
} }
function AppComponent_ng_template_3_ng_container_2_ng_template_85_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 331);
} }
function AppComponent_ng_template_3_ng_container_2_option_98_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r108 = ctx.$implicit;
    i0.ɵɵproperty("value", site_r108.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", site_r108.name, " ");
} }
function AppComponent_ng_template_3_ng_container_2_cfm_button_118_Template(rf, ctx) { if (rf & 1) {
    const _r109 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_cfm_button_118_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r109); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.cancelDuerpEditing()); });
    i0.ɵɵtext(1, " Annuler ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r3.duerpSaving);
} }
function AppComponent_ng_template_3_ng_container_2_ul_119_li_1_cfm_status_chip_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 312);
} if (rf & 2) {
    let tmp_17_0;
    const entry_r110 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("label", (tmp_17_0 = entry_r110.site_name) !== null && tmp_17_0 !== undefined ? tmp_17_0 : "Entreprise");
} }
function AppComponent_ng_template_3_ng_container_2_ul_119_li_1_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r110 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Pr\u00E9vention : ", entry_r110.prevention_action, "");
} }
function AppComponent_ng_template_3_ng_container_2_ul_119_li_1_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r110 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate3(" ", entry_r110.proof_count, " pi\u00E8ce", entry_r110.proof_count > 1 ? "s" : "", " justificative", entry_r110.proof_count > 1 ? "s" : "", " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_119_li_1_div_14_Template(rf, ctx) { if (rf & 1) {
    const _r111 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 107)(1, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_ul_119_li_1_div_14_Template_cfm_button_click_1_listener() { i0.ɵɵrestoreView(_r111); const entry_r110 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.startEditingDuerpEntry(entry_r110)); });
    i0.ɵɵtext(2, " Modifier ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_3_ng_container_2_ul_119_li_1_div_14_Template_cfm_button_click_3_listener() { i0.ɵɵrestoreView(_r111); const entry_r110 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.toggleDuerpEntryStatus(entry_r110)); });
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const entry_r110 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.duerpStatusBusyId === entry_r110.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.duerpStatusBusyId === entry_r110.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.duerpStatusBusyId === entry_r110.id ? "Mise \u00E0 jour en cours" : entry_r110.status === "active" ? "Archiver" : "R\u00E9activer", " ");
} }
function AppComponent_ng_template_3_ng_container_2_ul_119_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 333)(2, "div", 295)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 63);
    i0.ɵɵelement(6, "cfm-status-chip", 69)(7, "cfm-status-chip", 69)(8, "cfm-status-chip", 69);
    i0.ɵɵtemplate(9, AppComponent_ng_template_3_ng_container_2_ul_119_li_1_cfm_status_chip_9_Template, 1, 1, "cfm-status-chip", 320);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(12, AppComponent_ng_template_3_ng_container_2_ul_119_li_1_span_12_Template, 2, 1, "span", 100)(13, AppComponent_ng_template_3_ng_container_2_ul_119_li_1_span_13_Template, 2, 3, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(14, AppComponent_ng_template_3_ng_container_2_ul_119_li_1_div_14_Template, 5, 3, "div", 143);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r110 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(entry_r110.risk_label);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r3.getDuerpSeverityLabel(entry_r110.severity))("tone", ctx_r3.getDuerpSeverityTone(entry_r110.severity));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", entry_r110.status === "active" ? "Actif" : "Archiv\u00E9")("tone", entry_r110.status === "active" ? "success" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getComplianceStatusLabel(entry_r110.compliance_status))("tone", ctx_r3.getComplianceStatusTone(entry_r110.compliance_status));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.selectedSafetySiteId === "all");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Unit\u00E9 de travail : ", entry_r110.work_unit_name, "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", entry_r110.prevention_action);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", entry_r110.proof_count > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
} }
function AppComponent_ng_template_3_ng_container_2_ul_119_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 332);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_ul_119_li_1_Template, 15, 12, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredDuerpEntries);
} }
function AppComponent_ng_template_3_ng_container_2_ng_template_120_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 334);
} }
function AppComponent_ng_template_3_ng_container_2_label_136_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const obligation_r113 = ctx.$implicit;
    i0.ɵɵproperty("value", obligation_r113.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", obligation_r113.title, " ");
} }
function AppComponent_ng_template_3_ng_container_2_label_136_Template(rf, ctx) { if (rf & 1) {
    const _r112 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 212)(1, "span");
    i0.ɵɵtext(2, "Obligation concern\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 335);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_label_136_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r112); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.regulatoryEvidenceForm.obligationId, $event) || (ctx_r3.regulatoryEvidenceForm.obligationId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_3_ng_container_2_label_136_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_16_0;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.regulatoryEvidenceForm.obligationId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", (tmp_16_0 = ctx_r3.regulatoryProfile == null ? null : ctx_r3.regulatoryProfile.applicable_obligations) !== null && tmp_16_0 !== undefined ? tmp_16_0 : i0.ɵɵpureFunction0(3, _c6));
} }
function AppComponent_ng_template_3_ng_container_2_label_137_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const site_r115 = ctx.$implicit;
    i0.ɵɵproperty("value", site_r115.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", site_r115.name, " ");
} }
function AppComponent_ng_template_3_ng_container_2_label_137_Template(rf, ctx) { if (rf & 1) {
    const _r114 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 212)(1, "span");
    i0.ɵɵtext(2, "Site / b\u00E2timent");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 336);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_label_137_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r114); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.regulatoryEvidenceForm.siteId, $event) || (ctx_r3.regulatoryEvidenceForm.siteId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_3_ng_container_2_label_137_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.regulatoryEvidenceForm.siteId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.activeOrganizationSites);
} }
function AppComponent_ng_template_3_ng_container_2_label_138_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r117 = ctx.$implicit;
    i0.ɵɵproperty("value", item_r117.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", item_r117.name, "", item_r117.site_name ? " \u00B7 " + item_r117.site_name : "", " ");
} }
function AppComponent_ng_template_3_ng_container_2_label_138_Template(rf, ctx) { if (rf & 1) {
    const _r116 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 212)(1, "span");
    i0.ɵɵtext(2, "\u00C9l\u00E9ment s\u00E9curit\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 337);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_label_138_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r116); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.regulatoryEvidenceForm.buildingSafetyItemId, $event) || (ctx_r3.regulatoryEvidenceForm.buildingSafetyItemId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_3_ng_container_2_label_138_option_6_Template, 2, 3, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.regulatoryEvidenceForm.buildingSafetyItemId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.selectableBuildingSafetyItems);
} }
function AppComponent_ng_template_3_ng_container_2_label_139_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r119 = ctx.$implicit;
    i0.ɵɵproperty("value", entry_r119.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", entry_r119.risk_label, "", entry_r119.site_name ? " \u00B7 " + entry_r119.site_name : "", " ");
} }
function AppComponent_ng_template_3_ng_container_2_label_139_Template(rf, ctx) { if (rf & 1) {
    const _r118 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 212)(1, "span");
    i0.ɵɵtext(2, "Entr\u00E9e DUERP");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 338);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_label_139_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r118); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.regulatoryEvidenceForm.duerpEntryId, $event) || (ctx_r3.regulatoryEvidenceForm.duerpEntryId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_3_ng_container_2_label_139_option_6_Template, 2, 3, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.regulatoryEvidenceForm.duerpEntryId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.selectableDuerpEntries);
} }
function AppComponent_ng_template_3_ng_container_2_ul_149_li_1_cfm_status_chip_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 312);
} if (rf & 2) {
    const evidence_r120 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("label", ctx_r3.getSiteNameById(evidence_r120.site_id));
} }
function AppComponent_ng_template_3_ng_container_2_ul_149_li_1_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const evidence_r120 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Ajout\u00E9 le ", i0.ɵɵpipeBind2(2, 1, evidence_r120.uploaded_at, "shortDate"), "");
} }
function AppComponent_ng_template_3_ng_container_2_ul_149_li_1_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const evidence_r120 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(evidence_r120.notes);
} }
function AppComponent_ng_template_3_ng_container_2_ul_149_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 333)(2, "div", 295)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 63);
    i0.ɵɵelement(6, "cfm-status-chip", 67)(7, "cfm-status-chip", 340);
    i0.ɵɵtemplate(8, AppComponent_ng_template_3_ng_container_2_ul_149_li_1_cfm_status_chip_8_Template, 1, 1, "cfm-status-chip", 320);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, AppComponent_ng_template_3_ng_container_2_ul_149_li_1_span_13_Template, 3, 4, "span", 100)(14, AppComponent_ng_template_3_ng_container_2_ul_149_li_1_span_14_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const evidence_r120 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(evidence_r120.file_name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r3.getRegulatoryEvidenceLinkKindLabel(evidence_r120.link_kind));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r3.selectedSafetySiteId === "all" && evidence_r120.site_id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Rattach\u00E9 \u00E0 : ", evidence_r120.link_label, "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Type : ", evidence_r120.document_type, "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", evidence_r120.uploaded_at);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", evidence_r120.notes);
} }
function AppComponent_ng_template_3_ng_container_2_ul_149_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 339);
    i0.ɵɵtemplate(1, AppComponent_ng_template_3_ng_container_2_ul_149_li_1_Template, 15, 7, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredRegulatoryEvidences);
} }
function AppComponent_ng_template_3_ng_container_2_ng_template_150_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 341);
} }
function AppComponent_ng_template_3_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    const _r83 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "cfm-desktop-regulation-showcase", 204);
    i0.ɵɵlistener("actionTriggered", function AppComponent_ng_template_3_ng_container_2_Template_cfm_desktop_regulation_showcase_actionTriggered_1_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.runRegulatoryShowcaseAction($event)); })("exportTriggered", function AppComponent_ng_template_3_ng_container_2_Template_cfm_desktop_regulation_showcase_exportTriggered_1_listener() { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.exportRegulatoryPdf()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "section", 205);
    i0.ɵɵtemplate(3, AppComponent_ng_template_3_ng_container_2_div_3_Template, 6, 4, "div", 206);
    i0.ɵɵelementStart(4, "div", 207)(5, "cfm-card", 208)(6, "form", 209);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_3_ng_container_2_Template_form_ngSubmit_6_listener() { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.createSite()); });
    i0.ɵɵelementStart(7, "cfm-input", 210);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.siteForm.name, $event) || (ctx_r3.siteForm.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "cfm-input", 211);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.siteForm.address, $event) || (ctx_r3.siteForm.address = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "label", 212)(10, "span");
    i0.ɵɵtext(11, "Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "select", 213);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_select_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.siteForm.siteType, $event) || (ctx_r3.siteForm.siteType = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(13, "option", 214);
    i0.ɵɵtext(14, "Site");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "option", 215);
    i0.ɵɵtext(16, "B\u00E2timent");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "option", 216);
    i0.ɵɵtext(18, "Bureau");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "option", 217);
    i0.ɵɵtext(20, "Entrep\u00F4t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "div", 218)(22, "cfm-button", 158);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(24, AppComponent_ng_template_3_ng_container_2_ul_24_Template, 2, 1, "ul", 219)(25, AppComponent_ng_template_3_ng_container_2_ng_template_25_Template, 1, 0, "ng-template", null, 25, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "cfm-card", 220)(28, "div", 221)(29, "div", 63);
    i0.ɵɵelement(30, "cfm-status-chip", 69)(31, "cfm-status-chip", 69)(32, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "label", 222)(34, "span");
    i0.ɵɵtext(35, "Vue par site");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "select", 223);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_select_ngModelChange_36_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedSafetySiteId, $event) || (ctx_r3.selectedSafetySiteId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("change", function AppComponent_ng_template_3_ng_container_2_Template_select_change_36_listener() { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.handleSiteFilterChange()); });
    i0.ɵɵelementStart(37, "option", 88);
    i0.ɵɵtext(38, "Tous les sites");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(39, AppComponent_ng_template_3_ng_container_2_option_39_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(40, AppComponent_ng_template_3_ng_container_2_ul_40_Template, 2, 1, "ul", 82)(41, AppComponent_ng_template_3_ng_container_2_ng_template_41_Template, 1, 0, "ng-template", null, 26, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementStart(43, "form", 224);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_3_ng_container_2_Template_form_ngSubmit_43_listener() { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.saveBuildingSafetyItem()); });
    i0.ɵɵelementStart(44, "label", 212)(45, "span");
    i0.ɵɵtext(46, "Site ou b\u00E2timent");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "select", 225);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_select_ngModelChange_47_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.buildingSafetyForm.siteId, $event) || (ctx_r3.buildingSafetyForm.siteId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(48, "option", 133);
    i0.ɵɵtext(49, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(50, AppComponent_ng_template_3_ng_container_2_option_50_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(51, "label", 212)(52, "span");
    i0.ɵɵtext(53, "\u00C9l\u00E9ment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(54, "select", 226);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_select_ngModelChange_54_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.buildingSafetyForm.itemType, $event) || (ctx_r3.buildingSafetyForm.itemType = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(55, "option", 227);
    i0.ɵɵtext(56, "Extincteur");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(57, "option", 228);
    i0.ɵɵtext(58, "DAE");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(59, "option", 229);
    i0.ɵɵtext(60, "Contr\u00F4le p\u00E9riodique");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(61, "cfm-input", 230);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_61_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.buildingSafetyForm.name, $event) || (ctx_r3.buildingSafetyForm.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(62, "cfm-input", 231);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_62_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.buildingSafetyForm.nextDueDate, $event) || (ctx_r3.buildingSafetyForm.nextDueDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "cfm-input", 232);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_63_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.buildingSafetyForm.lastCheckedAt, $event) || (ctx_r3.buildingSafetyForm.lastCheckedAt = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(64, AppComponent_ng_template_3_ng_container_2_label_64_Template, 8, 2, "label", 233);
    i0.ɵɵelementStart(65, "label", 146)(66, "span");
    i0.ɵɵtext(67, "Note utile");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(68, "textarea", 234);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_textarea_ngModelChange_68_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.buildingSafetyForm.notes, $event) || (ctx_r3.buildingSafetyForm.notes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(69, AppComponent_ng_template_3_ng_container_2_p_69_Template, 2, 0, "p", 128);
    i0.ɵɵelementStart(70, "div", 191)(71, "cfm-button", 158);
    i0.ɵɵtext(72);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(73, AppComponent_ng_template_3_ng_container_2_cfm_button_73_Template, 2, 1, "cfm-button", 122);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(74, AppComponent_ng_template_3_ng_container_2_ul_74_Template, 2, 1, "ul", 235)(75, AppComponent_ng_template_3_ng_container_2_ng_template_75_Template, 1, 0, "ng-template", null, 27, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(77, "cfm-card", 236)(78, "div", 79);
    i0.ɵɵtemplate(79, AppComponent_ng_template_3_ng_container_2_div_79_Template, 3, 4, "div", 237)(80, AppComponent_ng_template_3_ng_container_2_cfm_status_chip_80_Template, 1, 2, "cfm-status-chip", 238);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(81, AppComponent_ng_template_3_ng_container_2_p_81_Template, 2, 1, "p", 128)(82, AppComponent_ng_template_3_ng_container_2_div_82_Template, 2, 1, "div", 239)(83, AppComponent_ng_template_3_ng_container_2_ul_83_Template, 2, 1, "ul", 240)(84, AppComponent_ng_template_3_ng_container_2_article_84_Template, 29, 13, "article", 241)(85, AppComponent_ng_template_3_ng_container_2_ng_template_85_Template, 1, 0, "ng-template", null, 28, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(87, "cfm-card", 242)(88, "div", 63);
    i0.ɵɵelement(89, "cfm-status-chip", 69)(90, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(91, "form", 243);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_3_ng_container_2_Template_form_ngSubmit_91_listener() { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.saveDuerpEntry()); });
    i0.ɵɵelementStart(92, "label", 212)(93, "span");
    i0.ɵɵtext(94, "Site ou b\u00E2timent");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(95, "select", 244);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_select_ngModelChange_95_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.duerpForm.siteId, $event) || (ctx_r3.duerpForm.siteId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(96, "option", 133);
    i0.ɵɵtext(97, "Entreprise / transversal");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(98, AppComponent_ng_template_3_ng_container_2_option_98_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(99, "cfm-input", 245);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_99_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.duerpForm.workUnitName, $event) || (ctx_r3.duerpForm.workUnitName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(100, "cfm-input", 246);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_100_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.duerpForm.riskLabel, $event) || (ctx_r3.duerpForm.riskLabel = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(101, "label", 212)(102, "span");
    i0.ɵɵtext(103, "Gravit\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(104, "select", 247);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_select_ngModelChange_104_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.duerpForm.severity, $event) || (ctx_r3.duerpForm.severity = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(105, "option", 248);
    i0.ɵɵtext(106, "Faible");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(107, "option", 249);
    i0.ɵɵtext(108, "Moyenne");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(109, "option", 250);
    i0.ɵɵtext(110, "Haute");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(111, "label", 146)(112, "span");
    i0.ɵɵtext(113, "Action de pr\u00E9vention");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(114, "textarea", 251);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_textarea_ngModelChange_114_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.duerpForm.preventionAction, $event) || (ctx_r3.duerpForm.preventionAction = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(115, "div", 191)(116, "cfm-button", 158);
    i0.ɵɵtext(117);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(118, AppComponent_ng_template_3_ng_container_2_cfm_button_118_Template, 2, 1, "cfm-button", 122);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(119, AppComponent_ng_template_3_ng_container_2_ul_119_Template, 2, 1, "ul", 252)(120, AppComponent_ng_template_3_ng_container_2_ng_template_120_Template, 1, 0, "ng-template", null, 29, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(122, "cfm-card", 253)(123, "form", 254);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_3_ng_container_2_Template_form_ngSubmit_123_listener() { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.createEvidence()); });
    i0.ɵɵelementStart(124, "label", 212)(125, "span");
    i0.ɵɵtext(126, "Rattacher \u00E0");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(127, "select", 255);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_select_ngModelChange_127_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.regulatoryEvidenceForm.linkKind, $event) || (ctx_r3.regulatoryEvidenceForm.linkKind = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(128, "option", 256);
    i0.ɵɵtext(129, "Obligation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(130, "option", 214);
    i0.ɵɵtext(131, "Site / b\u00E2timent");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(132, "option", 257);
    i0.ɵɵtext(133, "\u00C9l\u00E9ment s\u00E9curit\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(134, "option", 258);
    i0.ɵɵtext(135, "Entr\u00E9e DUERP");
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(136, AppComponent_ng_template_3_ng_container_2_label_136_Template, 7, 4, "label", 233)(137, AppComponent_ng_template_3_ng_container_2_label_137_Template, 7, 3, "label", 233)(138, AppComponent_ng_template_3_ng_container_2_label_138_Template, 7, 3, "label", 233)(139, AppComponent_ng_template_3_ng_container_2_label_139_Template, 7, 3, "label", 233);
    i0.ɵɵelementStart(140, "cfm-input", 259);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_140_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.regulatoryEvidenceForm.fileName, $event) || (ctx_r3.regulatoryEvidenceForm.fileName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(141, "cfm-input", 260);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_cfm_input_ngModelChange_141_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.regulatoryEvidenceForm.documentType, $event) || (ctx_r3.regulatoryEvidenceForm.documentType = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(142, "label", 146)(143, "span");
    i0.ɵɵtext(144, "Note utile");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(145, "textarea", 261);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_3_ng_container_2_Template_textarea_ngModelChange_145_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.regulatoryEvidenceForm.notes, $event) || (ctx_r3.regulatoryEvidenceForm.notes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(146, "div", 218)(147, "cfm-button", 158);
    i0.ɵɵtext(148);
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(149, AppComponent_ng_template_3_ng_container_2_ul_149_Template, 2, 1, "ul", 262)(150, AppComponent_ng_template_3_ng_container_2_ng_template_150_Template, 1, 0, "ng-template", null, 30, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptySites_r121 = i0.ɵɵreference(26);
    const noBuildingSafetyAlerts_r122 = i0.ɵɵreference(42);
    const emptyBuildingSafetyItems_r123 = i0.ɵɵreference(76);
    const emptyObligations_r124 = i0.ɵɵreference(86);
    const emptyDuerpEntries_r125 = i0.ɵɵreference(121);
    const emptyRegulatoryEvidences_r126 = i0.ɵɵreference(151);
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("summary", ctx_r3.regulatoryShowcaseSummary)("topPriority", ctx_r3.topRegulatoryPriority)("priorityItems", ctx_r3.regulatoryPriorityItems)("familyCards", ctx_r3.regulatoryFamilyCards)("recommendedActions", ctx_r3.regulatoryRecommendedActions)("recommendedActionsSummary", ctx_r3.regulatoryRecommendedActionsSummary)("evidenceItems", ctx_r3.regulatoryEvidenceShowcaseItems)("proofSupportSummary", ctx_r3.regulatoryProofSupportSummary)("score", ctx_r3.regulatoryComplianceScore)("scoreDrivers", ctx_r3.regulatoryScoreDrivers)("obligationCountLabel", ctx_r3.getObligationCountLabel())("evidenceAvailableCount", ctx_r3.regulatoryEvidenceAvailableCount)("evidenceCoverageCount", ctx_r3.regulatoryEvidenceCoverageCount)("overduePriorityCount", ctx_r3.overdueRegulatoryObligationCount + ctx_r3.globalBuildingSafetyOverdueCount)("obligationsToVerifyCount", ctx_r3.regulatoryObligationsToVerifyCount)("hasObligations", ctx_r3.regulatoryObligations.length > 0)("canReadOrganization", ctx_r3.canReadOrganization)("exportLoading", ctx_r3.regulatoryExporting)("actionBusy", ctx_r3.boundRegulatoryShowcaseActionBusy)("actionLabel", ctx_r3.boundRegulatoryShowcaseActionLabel);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r3.isOnboardingPending || ctx_r3.organizationProfile);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.siteForm.name);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationSiteSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.siteForm.address);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationSiteSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.siteForm.siteType);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationSiteSaving);
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.organizationSiteSaving || !ctx_r3.canCreateSite);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.organizationSiteSaving ? "Cr\u00E9ation en cours" : "Ajouter le site", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryAllSites.length > 0)("ngIfElse", emptySites_r121);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("label", ctx_r3.getBuildingSafetySummaryLabel("overdue"))("tone", ctx_r3.buildingSafetyOverdueCount > 0 ? "warning" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getBuildingSafetySummaryLabel("due_soon"))("tone", ctx_r3.buildingSafetyDueSoonCount > 0 ? "progress" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getBuildingSafetySummaryLabel("ok"))("tone", ctx_r3.buildingSafetyOkCount > 0 ? "success" : "neutral");
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedSafetySiteId);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.organizationSites);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredBuildingSafetyAlerts.length > 0)("ngIfElse", noBuildingSafetyAlerts_r122);
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.buildingSafetyForm.siteId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.buildingSafetySaving || ctx_r3.isBuildingSafetyEditing);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.activeOrganizationSites);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.buildingSafetyForm.itemType);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.buildingSafetySaving || ctx_r3.isBuildingSafetyEditing);
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.buildingSafetyForm.name);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.buildingSafetySaving || ctx_r3.isBuildingSafetyEditing);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.buildingSafetyForm.nextDueDate);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.buildingSafetySaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.buildingSafetyForm.lastCheckedAt);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.buildingSafetySaving);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isBuildingSafetyEditing);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.buildingSafetyForm.notes);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.buildingSafetySaving);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isBuildingSafetyEditing);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.buildingSafetySaving || !ctx_r3.canCreateBuildingSafetyItem);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.buildingSafetySaving ? ctx_r3.isBuildingSafetyEditing ? "Enregistrement en cours" : "Ajout en cours" : ctx_r3.isBuildingSafetyEditing ? "Enregistrer les changements" : "Ajouter l\u2019\u00E9l\u00E9ment", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isBuildingSafetyEditing);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredBuildingSafetyItems.length > 0)("ngIfElse", emptyBuildingSafetyItems_r123);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryProfile);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.selectedRegulatoryObligation);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryProfile == null ? null : ctx_r3.regulatoryProfile.missing_profile_items == null ? null : ctx_r3.regulatoryProfile.missing_profile_items.length);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryProfile);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryProfile && ctx_r3.regulatoryProfile.applicable_obligations.length > 0)("ngIfElse", emptyObligations_r124);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.selectedRegulatoryObligation);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("label", ctx_r3.filteredDuerpEntries.length + " risque" + (ctx_r3.filteredDuerpEntries.length > 1 ? "s" : ""))("tone", ctx_r3.filteredDuerpEntries.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.duerpEditingId ? "Modification en cours" : "Saisie progressive")("tone", ctx_r3.duerpEditingId ? "progress" : "neutral");
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.duerpForm.siteId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.duerpSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.activeOrganizationSites);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.duerpForm.workUnitName);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.duerpSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.duerpForm.riskLabel);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.duerpSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.duerpForm.severity);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.duerpSaving);
    i0.ɵɵadvance(10);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.duerpForm.preventionAction);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.duerpSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.duerpSaving || !ctx_r3.canSaveDuerpEntry);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.duerpSaving ? ctx_r3.duerpEditingId ? "Enregistrement en cours" : "Ajout en cours" : ctx_r3.duerpEditingId ? "Enregistrer les changements" : "Ajouter le risque", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.duerpEditingId);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredDuerpEntries.length > 0)("ngIfElse", emptyDuerpEntries_r125);
    i0.ɵɵadvance(8);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.regulatoryEvidenceForm.linkKind);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving);
    i0.ɵɵadvance(9);
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryEvidenceForm.linkKind === "obligation");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryEvidenceForm.linkKind === "site");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryEvidenceForm.linkKind === "building_safety_item");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.regulatoryEvidenceForm.linkKind === "duerp_entry");
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.regulatoryEvidenceForm.fileName);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.regulatoryEvidenceForm.documentType);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.regulatoryEvidenceForm.notes);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.regulatoryEvidenceSaving || !ctx_r3.canCreateRegulatoryEvidence);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.regulatoryEvidenceSaving ? "Ajout en cours" : "Ajouter la pi\u00E8ce", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredRegulatoryEvidences.length > 0)("ngIfElse", emptyRegulatoryEvidences_r126);
} }
function AppComponent_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, AppComponent_ng_template_3_cfm_card_0_Template, 17, 0, "cfm-card", 199)(1, AppComponent_ng_template_3_cfm_card_1_Template, 2, 0, "cfm-card", 200)(2, AppComponent_ng_template_3_ng_container_2_Template, 152, 104, "ng-container", 100);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngIf", ctx_r3.shouldShowInitialWorkspaceLoading);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.shouldShowWorkspaceContent && ctx_r3.currentMembership && !ctx_r3.isReglementationEnabled);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.shouldShowWorkspaceContent && ctx_r3.currentMembership && ctx_r3.isReglementationEnabled);
} }
function AppComponent_ng_template_5_cfm_card_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 343);
    i0.ɵɵelement(1, "cfm-empty-state", 344);
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_5_ng_container_1_cfm_button_28_Template(rf, ctx) { if (rf & 1) {
    const _r128 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_cfm_button_28_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r128); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.cancelCustomerEditing()); });
    i0.ɵɵtext(1, " Annuler ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r3.customerSaving);
} }
function AppComponent_ng_template_5_ng_container_1_cfm_input_29_Template(rf, ctx) { if (rf & 1) {
    const _r129 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-input", 361);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_cfm_input_29_Template_cfm_input_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r129); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.customerSearchTerm, $event) || (ctx_r3.customerSearchTerm = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.customerSearchTerm);
} }
function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r130 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Email : ", customer_r130.email, "");
} }
function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r130 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("T\u00E9l\u00E9phone : ", customer_r130.phone, "");
} }
function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_span_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r130 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(customer_r130.address);
} }
function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_span_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r130 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(customer_r130.notes);
} }
function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_div_11_Template(rf, ctx) { if (rf & 1) {
    const _r131 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 119)(1, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_div_11_Template_cfm_button_click_1_listener() { i0.ɵɵrestoreView(_r131); const customer_r130 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.startEditingCustomer(customer_r130)); });
    i0.ɵɵtext(2, " Modifier ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_div_11_Template_cfm_button_click_3_listener() { i0.ɵɵrestoreView(_r131); const customer_r130 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.prepareQuoteFromCustomer(customer_r130.id)); });
    i0.ɵɵtext(4, " Pr\u00E9parer un devis ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_div_11_Template_cfm_button_click_5_listener() { i0.ɵɵrestoreView(_r131); const customer_r130 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.prepareInvoiceFromCustomer(customer_r130.id)); });
    i0.ɵɵtext(6, " Pr\u00E9parer une facture ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.customerSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.customerSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.customerSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ul_30_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 363)(2, "div", 295)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 63);
    i0.ɵɵelement(6, "cfm-status-chip", 67);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(7, AppComponent_ng_template_5_ng_container_1_ul_30_li_1_span_7_Template, 2, 1, "span", 100)(8, AppComponent_ng_template_5_ng_container_1_ul_30_li_1_span_8_Template, 2, 1, "span", 100)(9, AppComponent_ng_template_5_ng_container_1_ul_30_li_1_span_9_Template, 2, 1, "span", 100)(10, AppComponent_ng_template_5_ng_container_1_ul_30_li_1_span_10_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(11, AppComponent_ng_template_5_ng_container_1_ul_30_li_1_div_11_Template, 7, 3, "div", 364);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r130 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(customer_r130.name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", ctx_r3.getCustomerTypeLabel(customer_r130.customer_type));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", customer_r130.email);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", customer_r130.phone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", customer_r130.address);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", customer_r130.notes);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
} }
function AppComponent_ng_template_5_ng_container_1_ul_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 362);
    i0.ɵɵtemplate(1, AppComponent_ng_template_5_ng_container_1_ul_30_li_1_Template, 12, 7, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredBillingCustomers);
} }
function AppComponent_ng_template_5_ng_container_1_ng_template_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 120);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("title", ctx_r3.billingCustomers.length === 0 ? "Aucun client pour le moment" : "Aucun client trouv\u00E9")("description", ctx_r3.billingCustomers.length === 0 ? "Ajoutez un premier client avec les informations essentielles uniquement." : "Essayez un nom, un email ou un t\u00E9l\u00E9phone plus court.");
} }
function AppComponent_ng_template_5_ng_container_1_cfm_status_chip_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 365);
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_38_option_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r133 = ctx.$implicit;
    i0.ɵɵproperty("value", customer_r133.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", customer_r133.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_38_option_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const worksite_r134 = ctx.$implicit;
    i0.ɵɵproperty("value", worksite_r134.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", worksite_r134.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_38_div_37_Template(rf, ctx) { if (rf & 1) {
    const _r135 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 378)(1, "cfm-input", 379);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_div_37_Template_cfm_input_ngModelChange_1_listener($event) { const line_r136 = i0.ɵɵrestoreView(_r135).$implicit; i0.ɵɵtwoWayBindingSet(line_r136.description, $event) || (line_r136.description = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "cfm-input", 380);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_div_37_Template_cfm_input_ngModelChange_2_listener($event) { const line_r136 = i0.ɵɵrestoreView(_r135).$implicit; i0.ɵɵtwoWayBindingSet(line_r136.quantity, $event) || (line_r136.quantity = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-input", 381);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_div_37_Template_cfm_input_ngModelChange_3_listener($event) { const line_r136 = i0.ɵɵrestoreView(_r135).$implicit; i0.ɵɵtwoWayBindingSet(line_r136.unitPrice, $event) || (line_r136.unitPrice = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ng_container_38_div_37_Template_cfm_button_click_4_listener() { const lineIndex_r137 = i0.ɵɵrestoreView(_r135).index; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.removeQuoteLine(lineIndex_r137)); });
    i0.ɵɵtext(5, " Retirer ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const line_r136 = ctx.$implicit;
    const lineIndex_r137 = ctx.index;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r136.description);
    i0.ɵɵproperty("name", "quoteLineDescription" + lineIndex_r137)("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r136.quantity);
    i0.ɵɵproperty("name", "quoteLineQuantity" + lineIndex_r137)("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r136.unitPrice);
    i0.ɵɵproperty("name", "quoteLineUnitPrice" + lineIndex_r137)("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_38_cfm_button_43_Template(rf, ctx) { if (rf & 1) {
    const _r138 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ng_container_38_cfm_button_43_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r138); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.discardQuoteDraft()); });
    i0.ɵɵtext(1, " Effacer la saisie ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.quoteSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template(rf, ctx) { if (rf & 1) {
    const _r132 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "form", 366);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_form_ngSubmit_1_listener() { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.saveQuote()); });
    i0.ɵɵelementStart(2, "label", 212)(3, "span");
    i0.ɵɵtext(4, "Client");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "select", 367);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_select_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteForm.customerId, $event) || (ctx_r3.quoteForm.customerId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(6, "option", 133);
    i0.ɵɵtext(7, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(8, AppComponent_ng_template_5_ng_container_1_ng_container_38_option_8_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "label", 212)(10, "span");
    i0.ɵɵtext(11, "Chantier li\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "select", 368);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_select_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteForm.worksiteId, $event) || (ctx_r3.quoteForm.worksiteId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(13, "option", 133);
    i0.ɵɵtext(14, "Aucun chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, AppComponent_ng_template_5_ng_container_1_ng_container_38_option_15_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "cfm-input", 369);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_cfm_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteForm.title, $event) || (ctx_r3.quoteForm.title = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "cfm-input", 370);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_cfm_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteForm.issueDate, $event) || (ctx_r3.quoteForm.issueDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "cfm-input", 371);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_cfm_input_ngModelChange_18_listener($event) { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteForm.validUntil, $event) || (ctx_r3.quoteForm.validUntil = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "label", 212)(20, "span");
    i0.ɵɵtext(21, "Statut");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "select", 372);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_select_ngModelChange_22_listener($event) { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteForm.status, $event) || (ctx_r3.quoteForm.status = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(23, "option", 131);
    i0.ɵɵtext(24, "Brouillon");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "option", 373);
    i0.ɵɵtext(26, "Envoy\u00E9");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "label", 146)(28, "span");
    i0.ɵɵtext(29, "Note courte");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "textarea", 374);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_textarea_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteForm.notes, $event) || (ctx_r3.quoteForm.notes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(31, "div", 375)(32, "div", 376)(33, "h3");
    i0.ɵɵtext(34, "Lignes du devis");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ng_container_38_Template_cfm_button_click_35_listener() { i0.ɵɵrestoreView(_r132); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.addQuoteLine()); });
    i0.ɵɵtext(36, " Ajouter une ligne ");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(37, AppComponent_ng_template_5_ng_container_1_ng_container_38_div_37_Template, 6, 10, "div", 377);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "p", 150);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "div", 218)(41, "cfm-button", 158);
    i0.ɵɵtext(42);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(43, AppComponent_ng_template_5_ng_container_1_ng_container_38_cfm_button_43_Template, 2, 1, "cfm-button", 122);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteForm.customerId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingCustomers);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteForm.worksiteId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingWorksites);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteForm.title);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteForm.issueDate);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteForm.validUntil);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteForm.status);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance(8);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteForm.notes);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r3.quoteForm.lines);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Total estim\u00E9 : ", ctx_r3.formatAmountCents(ctx_r3.quoteFormTotalCents), "");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.quoteSaving || !ctx_r3.canCreateQuote);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.quoteSaving ? "Ajout en cours" : "Cr\u00E9er le devis", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.hasQuoteDraft);
} }
function AppComponent_ng_template_5_ng_container_1_ng_template_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 382);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_span_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Chantier : ", quote_r139.worksite_name, "");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_span_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Valable jusqu'au ", i0.ɵɵpipeBind2(2, 1, quote_r139.valid_until, "shortDate"), "");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_span_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(quote_r139.notes);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_1_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const worksite_r141 = ctx.$implicit;
    i0.ɵɵproperty("value", worksite_r141.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", worksite_r141.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_1_Template(rf, ctx) { if (rf & 1) {
    const _r140 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_1_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r140); const quote_r139 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.changeQuoteWorksite(quote_r139, $event)); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Aucun chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_1_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_17_0;
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", (tmp_17_0 = quote_r139.worksite_id) !== null && tmp_17_0 !== undefined ? tmp_17_0 : "")("name", "quoteWorksiteEdit" + quote_r139.id)("disabled", ctx_r3.quoteWorksiteBusyId === quote_r139.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingWorksites);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_2_Template(rf, ctx) { if (rf & 1) {
    const _r142 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Statut");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_2_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r142); const quote_r139 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.changeQuoteStatus(quote_r139, $event)); });
    i0.ɵɵelementStart(4, "option", 131);
    i0.ɵɵtext(5, "Brouillon");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "option", 373);
    i0.ɵɵtext(7, "Envoy\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "option", 387);
    i0.ɵɵtext(9, "Accept\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "option", 388);
    i0.ɵɵtext(11, "Refus\u00E9");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", quote_r139.status)("name", "quoteStatusEdit" + quote_r139.id)("disabled", ctx_r3.quoteStatusBusyId === quote_r139.id);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_3_Template(rf, ctx) { if (rf & 1) {
    const _r143 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_3_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r143); const quote_r139 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.changeQuoteFollowUpStatus(quote_r139, $event)); });
    i0.ɵɵelementStart(4, "option", 389);
    i0.ɵɵtext(5, "Suivi normal");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "option", 390);
    i0.ɵɵtext(7, "\u00C0 relancer");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "option", 391);
    i0.ɵɵtext(9, "Relanc\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "option", 392);
    i0.ɵɵtext(11, "En attente client");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", quote_r139.follow_up_status)("name", "quoteFollowUpEdit" + quote_r139.id)("disabled", ctx_r3.quoteFollowUpBusyId === quote_r139.id);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r144 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_4_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r144); const quote_r139 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.quoteEditingId === quote_r139.id ? ctx_r3.cancelQuoteEditing() : ctx_r3.startEditingQuote(quote_r139)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.quoteEditingId === quote_r139.id ? "Annuler la modification" : "Modifier", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_5_Template(rf, ctx) { if (rf & 1) {
    const _r145 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_5_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r145); const quote_r139 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.duplicateQuoteAsInvoice(quote_r139)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.quoteDuplicateBusyId === quote_r139.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.quoteDuplicateBusyId === quote_r139.id ? "Cr\u00E9ation en cours" : "Cr\u00E9er une facture", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_6_Template(rf, ctx) { if (rf & 1) {
    const _r146 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_6_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r146); const quote_r139 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.exportQuotePdf(quote_r139)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.quotePdfBusyId === quote_r139.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.quotePdfBusyId === quote_r139.id ? "G\u00E9n\u00E9ration en cours" : "Exporter le PDF", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_7_Template(rf, ctx) { if (rf & 1) {
    const _r147 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_7_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r147); const quote_r139 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.toggleQuoteHistory(quote_r139)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.quoteHistoryBusyId === quote_r139.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.quoteHistoryBusyId === quote_r139.id ? "Chargement en cours" : ctx_r3.quoteHistoryOpenId === quote_r139.id ? "Masquer l'historique" : "Voir l'historique", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 119);
    i0.ɵɵtemplate(1, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_1_Template, 7, 4, "label", 386)(2, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_2_Template, 12, 3, "label", 386)(3, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_label_3_Template, 12, 3, "label", 386)(4, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_4_Template, 2, 2, "cfm-button", 122)(5, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_5_Template, 2, 2, "cfm-button", 122)(6, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_6_Template, 2, 2, "cfm-button", 122)(7, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_cfm_button_7_Template, 2, 2, "cfm-button", 122);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_23_ul_3_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 396)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const log_r148 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(7);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r3.getBillingHistoryLabel(log_r148));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 3, log_r148.occurred_at, "short"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r3.getBillingHistoryMeta(log_r148));
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_23_ul_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 395);
    i0.ɵɵtemplate(1, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_23_ul_3_li_1_Template, 9, 6, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.getQuoteHistory(quote_r139.id));
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_23_ng_template_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 397);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 393)(1, "p", 58);
    i0.ɵɵtext(2, "Principaux \u00E9v\u00E9nements");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_23_ul_3_Template, 2, 1, "ul", 394)(4, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_23_ng_template_4_Template, 1, 0, "ng-template", null, 38, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const emptyQuoteHistory_r149 = i0.ɵɵreference(5);
    const quote_r139 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r3.getQuoteHistory(quote_r139.id).length > 0)("ngIfElse", emptyQuoteHistory_r149);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_option_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r151 = ctx.$implicit;
    i0.ɵɵproperty("value", customer_r151.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", customer_r151.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_option_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const worksite_r152 = ctx.$implicit;
    i0.ɵɵproperty("value", worksite_r152.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", worksite_r152.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_div_28_Template(rf, ctx) { if (rf & 1) {
    const _r153 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 378)(1, "cfm-input", 403);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_div_28_Template_cfm_input_ngModelChange_1_listener($event) { const line_r154 = i0.ɵɵrestoreView(_r153).$implicit; i0.ɵɵtwoWayBindingSet(line_r154.description, $event) || (line_r154.description = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "cfm-input", 380);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_div_28_Template_cfm_input_ngModelChange_2_listener($event) { const line_r154 = i0.ɵɵrestoreView(_r153).$implicit; i0.ɵɵtwoWayBindingSet(line_r154.quantity, $event) || (line_r154.quantity = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-input", 381);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_div_28_Template_cfm_input_ngModelChange_3_listener($event) { const line_r154 = i0.ɵɵrestoreView(_r153).$implicit; i0.ɵɵtwoWayBindingSet(line_r154.unitPrice, $event) || (line_r154.unitPrice = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_div_28_Template_cfm_button_click_4_listener() { const lineIndex_r155 = i0.ɵɵrestoreView(_r153).index; const ctx_r3 = i0.ɵɵnextContext(6); return i0.ɵɵresetView(ctx_r3.removeQuoteEditLine(lineIndex_r155)); });
    i0.ɵɵtext(5, " Retirer ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const line_r154 = ctx.$implicit;
    const lineIndex_r155 = ctx.index;
    const quote_r139 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r154.description);
    i0.ɵɵproperty("name", "quoteEditLineDescription" + quote_r139.id + "-" + lineIndex_r155)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r154.quantity);
    i0.ɵɵproperty("name", "quoteEditLineQuantity" + quote_r139.id + "-" + lineIndex_r155)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r154.unitPrice);
    i0.ɵɵproperty("name", "quoteEditLineUnitPrice" + quote_r139.id + "-" + lineIndex_r155)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.quoteEditingSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template(rf, ctx) { if (rf & 1) {
    const _r150 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 366);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r150); const quote_r139 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.saveQuoteEdit(quote_r139)); });
    i0.ɵɵelementStart(1, "label", 212)(2, "span");
    i0.ɵɵtext(3, "Client");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "select", 398);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r150); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteEditForm.customerId, $event) || (ctx_r3.quoteEditForm.customerId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(5, "option", 133);
    i0.ɵɵtext(6, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_option_7_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "label", 212)(9, "span");
    i0.ɵɵtext(10, "Chantier li\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "select", 130);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_select_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r150); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteEditForm.worksiteId, $event) || (ctx_r3.quoteEditForm.worksiteId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(12, "option", 133);
    i0.ɵɵtext(13, "Aucun chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(14, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_option_14_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "cfm-input", 399);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_cfm_input_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r150); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteEditForm.title, $event) || (ctx_r3.quoteEditForm.title = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "cfm-input", 400);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_cfm_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r150); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteEditForm.issueDate, $event) || (ctx_r3.quoteEditForm.issueDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "cfm-input", 401);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_cfm_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r150); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteEditForm.validUntil, $event) || (ctx_r3.quoteEditForm.validUntil = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "label", 146)(19, "span");
    i0.ɵɵtext(20, "Note courte");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "textarea", 402);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_textarea_ngModelChange_21_listener($event) { i0.ɵɵrestoreView(_r150); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.quoteEditForm.notes, $event) || (ctx_r3.quoteEditForm.notes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div", 375)(23, "div", 376)(24, "h3");
    i0.ɵɵtext(25, "Lignes du devis");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_cfm_button_click_26_listener() { i0.ɵɵrestoreView(_r150); const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.addQuoteEditLine()); });
    i0.ɵɵtext(27, " Ajouter une ligne ");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(28, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_div_28_Template, 6, 10, "div", 377);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "p", 150);
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "div", 191)(32, "cfm-button", 158);
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template_cfm_button_click_34_listener() { i0.ɵɵrestoreView(_r150); const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.cancelQuoteEditing()); });
    i0.ɵɵtext(35, " Annuler ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const quote_r139 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteEditForm.customerId);
    i0.ɵɵproperty("name", "quoteEditCustomerId" + quote_r139.id)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingCustomers);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteEditForm.worksiteId);
    i0.ɵɵproperty("name", "quoteEditWorksiteId" + quote_r139.id)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingWorksites);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteEditForm.title);
    i0.ɵɵproperty("name", "quoteEditTitle" + quote_r139.id)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteEditForm.issueDate);
    i0.ɵɵproperty("name", "quoteEditIssueDate" + quote_r139.id)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteEditForm.validUntil);
    i0.ɵɵproperty("name", "quoteEditValidUntil" + quote_r139.id)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.quoteEditForm.notes);
    i0.ɵɵproperty("name", "quoteEditNotes" + quote_r139.id)("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("disabled", ctx_r3.quoteEditingSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r3.quoteEditForm.lines);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" Total recalcul\u00E9 : ", ctx_r3.formatAmountCents(ctx_r3.quoteEditFormTotalCents), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.quoteEditingSaving || !ctx_r3.canSaveQuoteEdit);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.quoteEditingSaving ? "Enregistrement en cours" : "Enregistrer les modifications", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.quoteEditingSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 333)(2, "div", 295)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 63);
    i0.ɵɵelement(7, "cfm-status-chip", 69)(8, "cfm-status-chip", 69)(9, "cfm-status-chip", 67);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(10, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_span_10_Template, 2, 1, "span", 100);
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "span");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(16, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_span_16_Template, 3, 4, "span", 100);
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(21, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_span_21_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(22, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_22_Template, 8, 7, "div", 364)(23, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_div_23_Template, 6, 2, "div", 384)(24, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_form_24_Template, 36, 26, "form", 385);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const quote_r139 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(quote_r139.title || "Devis du " + i0.ɵɵpipeBind2(5, 17, quote_r139.issue_date, "shortDate"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", ctx_r3.getQuoteStatusLabel(quote_r139.status))("tone", ctx_r3.getQuoteStatusTone(quote_r139.status));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getBillingFollowUpStatusLabel(quote_r139.follow_up_status))("tone", ctx_r3.getBillingFollowUpStatusTone(quote_r139.follow_up_status));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", quote_r139.customer_name);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", quote_r139.worksite_name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Num\u00E9ro : ", quote_r139.number, "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("\u00C9mis le ", i0.ɵɵpipeBind2(15, 20, quote_r139.issue_date, "shortDate"), "");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", quote_r139.valid_until);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", quote_r139.line_items.length, " ligne", quote_r139.line_items.length > 1 ? "s" : "", "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Total : ", ctx_r3.formatAmountCents(quote_r139.total_amount_cents, quote_r139.currency), "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", quote_r139.notes);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization || ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.quoteHistoryOpenId === quote_r139.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.quoteEditingId === quote_r139.id);
} }
function AppComponent_ng_template_5_ng_container_1_ul_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 383);
    i0.ɵɵtemplate(1, AppComponent_ng_template_5_ng_container_1_ul_41_li_1_Template, 25, 23, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.quotes);
} }
function AppComponent_ng_template_5_ng_container_1_ng_template_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 404);
} }
function AppComponent_ng_template_5_ng_container_1_cfm_status_chip_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 365);
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_49_option_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r157 = ctx.$implicit;
    i0.ɵɵproperty("value", customer_r157.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", customer_r157.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_49_option_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const worksite_r158 = ctx.$implicit;
    i0.ɵɵproperty("value", worksite_r158.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", worksite_r158.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_49_div_37_Template(rf, ctx) { if (rf & 1) {
    const _r159 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 378)(1, "cfm-input", 413);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_div_37_Template_cfm_input_ngModelChange_1_listener($event) { const line_r160 = i0.ɵɵrestoreView(_r159).$implicit; i0.ɵɵtwoWayBindingSet(line_r160.description, $event) || (line_r160.description = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "cfm-input", 380);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_div_37_Template_cfm_input_ngModelChange_2_listener($event) { const line_r160 = i0.ɵɵrestoreView(_r159).$implicit; i0.ɵɵtwoWayBindingSet(line_r160.quantity, $event) || (line_r160.quantity = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-input", 381);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_div_37_Template_cfm_input_ngModelChange_3_listener($event) { const line_r160 = i0.ɵɵrestoreView(_r159).$implicit; i0.ɵɵtwoWayBindingSet(line_r160.unitPrice, $event) || (line_r160.unitPrice = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ng_container_49_div_37_Template_cfm_button_click_4_listener() { const lineIndex_r161 = i0.ɵɵrestoreView(_r159).index; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.removeInvoiceLine(lineIndex_r161)); });
    i0.ɵɵtext(5, " Retirer ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const line_r160 = ctx.$implicit;
    const lineIndex_r161 = ctx.index;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r160.description);
    i0.ɵɵproperty("name", "invoiceLineDescription" + lineIndex_r161)("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r160.quantity);
    i0.ɵɵproperty("name", "invoiceLineQuantity" + lineIndex_r161)("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r160.unitPrice);
    i0.ɵɵproperty("name", "invoiceLineUnitPrice" + lineIndex_r161)("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_49_cfm_button_43_Template(rf, ctx) { if (rf & 1) {
    const _r162 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ng_container_49_cfm_button_43_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r162); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.discardInvoiceDraft()); });
    i0.ɵɵtext(1, " Effacer la saisie ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.invoiceSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template(rf, ctx) { if (rf & 1) {
    const _r156 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "form", 366);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_form_ngSubmit_1_listener() { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.saveInvoice()); });
    i0.ɵɵelementStart(2, "label", 212)(3, "span");
    i0.ɵɵtext(4, "Client");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "select", 405);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_select_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceForm.customerId, $event) || (ctx_r3.invoiceForm.customerId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(6, "option", 133);
    i0.ɵɵtext(7, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(8, AppComponent_ng_template_5_ng_container_1_ng_container_49_option_8_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "label", 212)(10, "span");
    i0.ɵɵtext(11, "Chantier li\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "select", 406);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_select_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceForm.worksiteId, $event) || (ctx_r3.invoiceForm.worksiteId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(13, "option", 133);
    i0.ɵɵtext(14, "Aucun chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, AppComponent_ng_template_5_ng_container_1_ng_container_49_option_15_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "cfm-input", 407);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_cfm_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceForm.title, $event) || (ctx_r3.invoiceForm.title = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "cfm-input", 408);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_cfm_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceForm.issueDate, $event) || (ctx_r3.invoiceForm.issueDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "cfm-input", 409);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_cfm_input_ngModelChange_18_listener($event) { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceForm.dueDate, $event) || (ctx_r3.invoiceForm.dueDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "label", 212)(20, "span");
    i0.ɵɵtext(21, "Statut");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "select", 410);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_select_ngModelChange_22_listener($event) { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceForm.status, $event) || (ctx_r3.invoiceForm.status = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(23, "option", 131);
    i0.ɵɵtext(24, "Brouillon");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "option", 411);
    i0.ɵɵtext(26, "\u00C9mise");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "label", 146)(28, "span");
    i0.ɵɵtext(29, "Note courte");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "textarea", 412);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_textarea_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceForm.notes, $event) || (ctx_r3.invoiceForm.notes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(31, "div", 375)(32, "div", 376)(33, "h3");
    i0.ɵɵtext(34, "Lignes de la facture");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ng_container_49_Template_cfm_button_click_35_listener() { i0.ɵɵrestoreView(_r156); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.addInvoiceLine()); });
    i0.ɵɵtext(36, " Ajouter une ligne ");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(37, AppComponent_ng_template_5_ng_container_1_ng_container_49_div_37_Template, 6, 10, "div", 377);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "p", 150);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "div", 218)(41, "cfm-button", 158);
    i0.ɵɵtext(42);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(43, AppComponent_ng_template_5_ng_container_1_ng_container_49_cfm_button_43_Template, 2, 1, "cfm-button", 122);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceForm.customerId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingCustomers);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceForm.worksiteId);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingWorksites);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceForm.title);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceForm.issueDate);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceForm.dueDate);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceForm.status);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance(8);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceForm.notes);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r3.invoiceForm.lines);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Total estim\u00E9 : ", ctx_r3.formatAmountCents(ctx_r3.invoiceFormTotalCents), "");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.invoiceSaving || !ctx_r3.canCreateInvoice);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.invoiceSaving ? "Ajout en cours" : "Cr\u00E9er la facture", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.hasInvoiceDraft);
} }
function AppComponent_ng_template_5_ng_container_1_ng_template_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 414);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Chantier : ", invoice_r163.worksite_name, "");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("\u00C9ch\u00E9ance : ", i0.ɵɵpipeBind2(2, 1, invoice_r163.due_date, "shortDate"), "");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" R\u00E9gl\u00E9 : ", ctx_r3.formatAmountCents(invoice_r163.paid_amount_cents, invoice_r163.currency), " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Reste d\u00FB : ", ctx_r3.formatAmountCents(invoice_r163.outstanding_amount_cents, invoice_r163.currency), " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Pay\u00E9e le ", i0.ɵɵpipeBind2(2, 1, invoice_r163.paid_at, "shortDate"), "");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(invoice_r163.notes);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_1_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const worksite_r165 = ctx.$implicit;
    i0.ɵɵproperty("value", worksite_r165.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", worksite_r165.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_1_Template(rf, ctx) { if (rf & 1) {
    const _r164 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_1_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r164); const invoice_r163 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.changeInvoiceWorksite(invoice_r163, $event)); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Aucun chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_1_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_17_0;
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", (tmp_17_0 = invoice_r163.worksite_id) !== null && tmp_17_0 !== undefined ? tmp_17_0 : "")("name", "invoiceWorksiteEdit" + invoice_r163.id)("disabled", ctx_r3.invoiceWorksiteBusyId === invoice_r163.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingWorksites);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_2_Template(rf, ctx) { if (rf & 1) {
    const _r166 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Statut");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_2_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r166); const invoice_r163 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.changeInvoiceStatus(invoice_r163, $event)); });
    i0.ɵɵelementStart(4, "option", 131);
    i0.ɵɵtext(5, "Brouillon");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "option", 411);
    i0.ɵɵtext(7, "\u00C9mise");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", invoice_r163.status === "draft" ? "draft" : "issued")("name", "invoiceStatusEdit" + invoice_r163.id)("disabled", ctx_r3.invoiceStatusBusyId === invoice_r163.id || invoice_r163.status === "paid");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_3_Template(rf, ctx) { if (rf & 1) {
    const _r167 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_3_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r167); const invoice_r163 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.changeInvoiceFollowUpStatus(invoice_r163, $event)); });
    i0.ɵɵelementStart(4, "option", 389);
    i0.ɵɵtext(5, "Suivi normal");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "option", 390);
    i0.ɵɵtext(7, "\u00C0 relancer");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "option", 391);
    i0.ɵɵtext(9, "Relanc\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "option", 392);
    i0.ɵɵtext(11, "En attente client");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", invoice_r163.follow_up_status)("name", "invoiceFollowUpEdit" + invoice_r163.id)("disabled", ctx_r3.invoiceFollowUpBusyId === invoice_r163.id);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r168 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_4_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r168); const invoice_r163 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.invoiceEditingId === invoice_r163.id ? ctx_r3.cancelInvoiceEditing() : ctx_r3.startEditingInvoice(invoice_r163)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.invoiceEditingId === invoice_r163.id ? "Annuler la modification" : "Modifier", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_5_Template(rf, ctx) { if (rf & 1) {
    const _r169 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_5_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r169); const invoice_r163 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.invoicePaymentId === invoice_r163.id ? ctx_r3.cancelInvoicePayment() : ctx_r3.openInvoicePayment(invoice_r163)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.invoicePaymentBusyId === invoice_r163.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.invoicePaymentId === invoice_r163.id ? "Annuler le paiement" : "Enregistrer un paiement", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_6_Template(rf, ctx) { if (rf & 1) {
    const _r170 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_6_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r170); const invoice_r163 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.exportInvoicePdf(invoice_r163)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.invoicePdfBusyId === invoice_r163.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.invoicePdfBusyId === invoice_r163.id ? "G\u00E9n\u00E9ration en cours" : "Exporter le PDF", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_7_Template(rf, ctx) { if (rf & 1) {
    const _r171 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_7_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r171); const invoice_r163 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.toggleInvoiceHistory(invoice_r163)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r3.invoiceHistoryBusyId === invoice_r163.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.invoiceHistoryBusyId === invoice_r163.id ? "Chargement en cours" : ctx_r3.invoiceHistoryOpenId === invoice_r163.id ? "Masquer l'historique" : "Voir l'historique", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_form_8_Template(rf, ctx) { if (rf & 1) {
    const _r172 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 416);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_form_8_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r172); const invoice_r163 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.saveInvoicePayment(invoice_r163)); });
    i0.ɵɵelementStart(1, "cfm-input", 417);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_form_8_Template_cfm_input_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r172); const ctx_r3 = i0.ɵɵnextContext(6); i0.ɵɵtwoWayBindingSet(ctx_r3.invoicePaymentForm.paidAmount, $event) || (ctx_r3.invoicePaymentForm.paidAmount = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "cfm-input", 418);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_form_8_Template_cfm_input_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r172); const ctx_r3 = i0.ɵɵnextContext(6); i0.ɵɵtwoWayBindingSet(ctx_r3.invoicePaymentForm.paidAt, $event) || (ctx_r3.invoicePaymentForm.paidAt = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 107)(4, "cfm-button", 158);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoicePaymentForm.paidAmount);
    i0.ɵɵproperty("name", "invoicePaidAmount" + invoice_r163.id)("disabled", ctx_r3.invoicePaymentBusyId === invoice_r163.id);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoicePaymentForm.paidAt);
    i0.ɵɵproperty("name", "invoicePaidAt" + invoice_r163.id)("disabled", ctx_r3.invoicePaymentBusyId === invoice_r163.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.invoicePaymentBusyId === invoice_r163.id || !ctx_r3.canSaveInvoicePayment(invoice_r163));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.invoicePaymentBusyId === invoice_r163.id ? "Enregistrement en cours" : "Valider le paiement", " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 119);
    i0.ɵɵtemplate(1, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_1_Template, 7, 4, "label", 386)(2, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_2_Template, 8, 3, "label", 386)(3, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_label_3_Template, 12, 3, "label", 386)(4, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_4_Template, 2, 2, "cfm-button", 122)(5, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_5_Template, 2, 2, "cfm-button", 122)(6, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_6_Template, 2, 2, "cfm-button", 122)(7, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_cfm_button_7_Template, 2, 2, "cfm-button", 122)(8, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_form_8_Template, 6, 8, "form", 415);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && invoice_r163.status !== "paid");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.invoicePaymentId === invoice_r163.id);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_26_ul_3_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 396)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const log_r173 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(7);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r3.getBillingHistoryLabel(log_r173));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 3, log_r173.occurred_at, "short"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r3.getBillingHistoryMeta(log_r173));
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_26_ul_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 395);
    i0.ɵɵtemplate(1, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_26_ul_3_li_1_Template, 9, 6, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.getInvoiceHistory(invoice_r163.id));
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_26_ng_template_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 419);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 393)(1, "p", 58);
    i0.ɵɵtext(2, "Principaux \u00E9v\u00E9nements");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_26_ul_3_Template, 2, 1, "ul", 394)(4, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_26_ng_template_4_Template, 1, 0, "ng-template", null, 39, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const emptyInvoiceHistory_r174 = i0.ɵɵreference(5);
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r3.getInvoiceHistory(invoice_r163.id).length > 0)("ngIfElse", emptyInvoiceHistory_r174);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_option_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const customer_r176 = ctx.$implicit;
    i0.ɵɵproperty("value", customer_r176.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", customer_r176.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_option_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const worksite_r177 = ctx.$implicit;
    i0.ɵɵproperty("value", worksite_r177.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", worksite_r177.name, " ");
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_div_28_Template(rf, ctx) { if (rf & 1) {
    const _r178 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 378)(1, "cfm-input", 422);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_div_28_Template_cfm_input_ngModelChange_1_listener($event) { const line_r179 = i0.ɵɵrestoreView(_r178).$implicit; i0.ɵɵtwoWayBindingSet(line_r179.description, $event) || (line_r179.description = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "cfm-input", 380);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_div_28_Template_cfm_input_ngModelChange_2_listener($event) { const line_r179 = i0.ɵɵrestoreView(_r178).$implicit; i0.ɵɵtwoWayBindingSet(line_r179.quantity, $event) || (line_r179.quantity = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "cfm-input", 381);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_div_28_Template_cfm_input_ngModelChange_3_listener($event) { const line_r179 = i0.ɵɵrestoreView(_r178).$implicit; i0.ɵɵtwoWayBindingSet(line_r179.unitPrice, $event) || (line_r179.unitPrice = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_div_28_Template_cfm_button_click_4_listener() { const lineIndex_r180 = i0.ɵɵrestoreView(_r178).index; const ctx_r3 = i0.ɵɵnextContext(6); return i0.ɵɵresetView(ctx_r3.removeInvoiceEditLine(lineIndex_r180)); });
    i0.ɵɵtext(5, " Retirer ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const line_r179 = ctx.$implicit;
    const lineIndex_r180 = ctx.index;
    const invoice_r163 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r179.description);
    i0.ɵɵproperty("name", "invoiceEditLineDescription" + invoice_r163.id + "-" + lineIndex_r180)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r179.quantity);
    i0.ɵɵproperty("name", "invoiceEditLineQuantity" + invoice_r163.id + "-" + lineIndex_r180)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", line_r179.unitPrice);
    i0.ɵɵproperty("name", "invoiceEditLineUnitPrice" + invoice_r163.id + "-" + lineIndex_r180)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.invoiceEditingSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template(rf, ctx) { if (rf & 1) {
    const _r175 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 366);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r175); const invoice_r163 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.saveInvoiceEdit(invoice_r163)); });
    i0.ɵɵelementStart(1, "label", 212)(2, "span");
    i0.ɵɵtext(3, "Client");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "select", 398);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r175); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceEditForm.customerId, $event) || (ctx_r3.invoiceEditForm.customerId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(5, "option", 133);
    i0.ɵɵtext(6, "Choisir");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_option_7_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "label", 212)(9, "span");
    i0.ɵɵtext(10, "Chantier li\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "select", 130);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_select_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r175); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceEditForm.worksiteId, $event) || (ctx_r3.invoiceEditForm.worksiteId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(12, "option", 133);
    i0.ɵɵtext(13, "Aucun chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(14, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_option_14_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "cfm-input", 399);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_cfm_input_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r175); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceEditForm.title, $event) || (ctx_r3.invoiceEditForm.title = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "cfm-input", 400);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_cfm_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r175); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceEditForm.issueDate, $event) || (ctx_r3.invoiceEditForm.issueDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "cfm-input", 420);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_cfm_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r175); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceEditForm.dueDate, $event) || (ctx_r3.invoiceEditForm.dueDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "label", 146)(19, "span");
    i0.ɵɵtext(20, "Note courte");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "textarea", 421);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_textarea_ngModelChange_21_listener($event) { i0.ɵɵrestoreView(_r175); const ctx_r3 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r3.invoiceEditForm.notes, $event) || (ctx_r3.invoiceEditForm.notes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div", 375)(23, "div", 376)(24, "h3");
    i0.ɵɵtext(25, "Lignes de la facture");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_cfm_button_click_26_listener() { i0.ɵɵrestoreView(_r175); const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.addInvoiceEditLine()); });
    i0.ɵɵtext(27, " Ajouter une ligne ");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(28, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_div_28_Template, 6, 10, "div", 377);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "p", 150);
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "div", 191)(32, "cfm-button", 158);
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template_cfm_button_click_34_listener() { i0.ɵɵrestoreView(_r175); const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.cancelInvoiceEditing()); });
    i0.ɵɵtext(35, " Annuler ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const invoice_r163 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceEditForm.customerId);
    i0.ɵɵproperty("name", "invoiceEditCustomerId" + invoice_r163.id)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingCustomers);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceEditForm.worksiteId);
    i0.ɵɵproperty("name", "invoiceEditWorksiteId" + invoice_r163.id)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.billingWorksites);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceEditForm.title);
    i0.ɵɵproperty("name", "invoiceEditTitle" + invoice_r163.id)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceEditForm.issueDate);
    i0.ɵɵproperty("name", "invoiceEditIssueDate" + invoice_r163.id)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceEditForm.dueDate);
    i0.ɵɵproperty("name", "invoiceEditDueDate" + invoice_r163.id)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.invoiceEditForm.notes);
    i0.ɵɵproperty("name", "invoiceEditNotes" + invoice_r163.id)("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("disabled", ctx_r3.invoiceEditingSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r3.invoiceEditForm.lines);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" Total recalcul\u00E9 : ", ctx_r3.formatAmountCents(ctx_r3.invoiceEditFormTotalCents), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.invoiceEditingSaving || !ctx_r3.canSaveInvoiceEdit);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.invoiceEditingSaving ? "Enregistrement en cours" : "Enregistrer les modifications", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.invoiceEditingSaving);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 333)(2, "div", 295)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 63);
    i0.ɵɵelement(7, "cfm-status-chip", 69)(8, "cfm-status-chip", 69)(9, "cfm-status-chip", 67);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(10, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_10_Template, 2, 1, "span", 100);
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "span");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(16, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_16_Template, 3, 4, "span", 100);
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(21, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_21_Template, 2, 1, "span", 100)(22, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_22_Template, 2, 1, "span", 100)(23, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_23_Template, 3, 4, "span", 100)(24, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_span_24_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(25, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_25_Template, 9, 8, "div", 364)(26, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_div_26_Template, 6, 2, "div", 384)(27, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_form_27_Template, 36, 26, "form", 385);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const invoice_r163 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(invoice_r163.title || "Facture du " + i0.ɵɵpipeBind2(5, 20, invoice_r163.issue_date, "shortDate"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", ctx_r3.getInvoiceStatusLabel(invoice_r163.status))("tone", ctx_r3.getInvoiceStatusTone(invoice_r163.status));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.getBillingFollowUpStatusLabel(invoice_r163.follow_up_status))("tone", ctx_r3.getBillingFollowUpStatusTone(invoice_r163.follow_up_status));
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", invoice_r163.customer_name);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", invoice_r163.worksite_name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Num\u00E9ro : ", invoice_r163.number, "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("\u00C9mise le ", i0.ɵɵpipeBind2(15, 23, invoice_r163.issue_date, "shortDate"), "");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", invoice_r163.due_date);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", invoice_r163.line_items.length, " ligne", invoice_r163.line_items.length > 1 ? "s" : "", "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Total : ", ctx_r3.formatAmountCents(invoice_r163.total_amount_cents, invoice_r163.currency), "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", invoice_r163.paid_amount_cents > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", invoice_r163.outstanding_amount_cents > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", invoice_r163.paid_at);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", invoice_r163.notes);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization || ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.invoiceHistoryOpenId === invoice_r163.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.invoiceEditingId === invoice_r163.id);
} }
function AppComponent_ng_template_5_ng_container_1_ul_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 383);
    i0.ɵɵtemplate(1, AppComponent_ng_template_5_ng_container_1_ul_52_li_1_Template, 28, 26, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.invoices);
} }
function AppComponent_ng_template_5_ng_container_1_ng_template_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 423);
} }
function AppComponent_ng_template_5_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    const _r127 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "cfm-card", 345)(2, "div", 63);
    i0.ɵɵelement(3, "cfm-status-chip", 69)(4, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "form", 346);
    i0.ɵɵlistener("ngSubmit", function AppComponent_ng_template_5_ng_container_1_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r127); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.saveCustomer()); });
    i0.ɵɵelementStart(6, "cfm-input", 347);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_Template_cfm_input_ngModelChange_6_listener($event) { i0.ɵɵrestoreView(_r127); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.customerForm.name, $event) || (ctx_r3.customerForm.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "label", 212)(8, "span");
    i0.ɵɵtext(9, "Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "select", 348);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_Template_select_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r127); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.customerForm.customerType, $event) || (ctx_r3.customerForm.customerType = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(11, "option", 349);
    i0.ɵɵtext(12, "Entreprise");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option", 350);
    i0.ɵɵtext(14, "Particulier");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "cfm-input", 351);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_Template_cfm_input_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r127); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.customerForm.email, $event) || (ctx_r3.customerForm.email = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "cfm-input", 352);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_Template_cfm_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r127); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.customerForm.phone, $event) || (ctx_r3.customerForm.phone = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "label", 146)(18, "span");
    i0.ɵɵtext(19, "Adresse");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "textarea", 353);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_Template_textarea_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r127); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.customerForm.address, $event) || (ctx_r3.customerForm.address = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "label", 146)(22, "span");
    i0.ɵɵtext(23, "Note courte");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "textarea", 354);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_5_ng_container_1_Template_textarea_ngModelChange_24_listener($event) { i0.ɵɵrestoreView(_r127); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.customerForm.notes, $event) || (ctx_r3.customerForm.notes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "div", 191)(26, "cfm-button", 158);
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(28, AppComponent_ng_template_5_ng_container_1_cfm_button_28_Template, 2, 1, "cfm-button", 122);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(29, AppComponent_ng_template_5_ng_container_1_cfm_input_29_Template, 1, 1, "cfm-input", 355)(30, AppComponent_ng_template_5_ng_container_1_ul_30_Template, 2, 1, "ul", 356)(31, AppComponent_ng_template_5_ng_container_1_ng_template_31_Template, 1, 2, "ng-template", null, 33, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "cfm-card", 357)(34, "div", 63);
    i0.ɵɵelement(35, "cfm-status-chip", 69)(36, "cfm-status-chip", 69);
    i0.ɵɵtemplate(37, AppComponent_ng_template_5_ng_container_1_cfm_status_chip_37_Template, 1, 0, "cfm-status-chip", 358);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(38, AppComponent_ng_template_5_ng_container_1_ng_container_38_Template, 44, 22, "ng-container", 102)(39, AppComponent_ng_template_5_ng_container_1_ng_template_39_Template, 1, 0, "ng-template", null, 34, i0.ɵɵtemplateRefExtractor)(41, AppComponent_ng_template_5_ng_container_1_ul_41_Template, 2, 1, "ul", 359)(42, AppComponent_ng_template_5_ng_container_1_ng_template_42_Template, 1, 0, "ng-template", null, 35, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "cfm-card", 360)(45, "div", 63);
    i0.ɵɵelement(46, "cfm-status-chip", 69)(47, "cfm-status-chip", 69);
    i0.ɵɵtemplate(48, AppComponent_ng_template_5_ng_container_1_cfm_status_chip_48_Template, 1, 0, "cfm-status-chip", 358);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(49, AppComponent_ng_template_5_ng_container_1_ng_container_49_Template, 44, 22, "ng-container", 102)(50, AppComponent_ng_template_5_ng_container_1_ng_template_50_Template, 1, 0, "ng-template", null, 36, i0.ɵɵtemplateRefExtractor)(52, AppComponent_ng_template_5_ng_container_1_ul_52_Template, 2, 1, "ul", 359)(53, AppComponent_ng_template_5_ng_container_1_ng_template_53_Template, 1, 0, "ng-template", null, 37, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptyCustomers_r181 = i0.ɵɵreference(32);
    const noCustomersForQuotes_r182 = i0.ɵɵreference(40);
    const emptyQuotes_r183 = i0.ɵɵreference(43);
    const noCustomersForInvoices_r184 = i0.ɵɵreference(51);
    const emptyInvoices_r185 = i0.ɵɵreference(54);
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", ctx_r3.customerSearchCountLabel)("tone", ctx_r3.billingCustomers.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r3.isCustomerEditing ? "Modification en cours" : "Cr\u00E9ation simple")("tone", ctx_r3.isCustomerEditing ? "progress" : "neutral");
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.customerForm.name);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.customerSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.customerForm.customerType);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.customerSaving);
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.customerForm.email);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.customerSaving);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.customerForm.phone);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.customerSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.customerForm.address);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.customerSaving);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.customerForm.notes);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.customerSaving);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r3.canManageOrganization || ctx_r3.customerSaving || !ctx_r3.canSaveCustomer);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.customerSaving ? ctx_r3.isCustomerEditing ? "Enregistrement en cours" : "Ajout en cours" : ctx_r3.isCustomerEditing ? "Enregistrer les changements" : "Ajouter le client", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isCustomerEditing);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.billingCustomers.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredBillingCustomers.length > 0)("ngIfElse", emptyCustomers_r181);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("label", ctx_r3.quotes.length + " devis")("tone", ctx_r3.quotes.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", "Total en pr\u00E9paration : " + ctx_r3.formatAmountCents(ctx_r3.quoteFormTotalCents))("tone", ctx_r3.quoteFormTotalCents > 0 ? "progress" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.hasQuoteDraft);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.billingCustomers.length > 0)("ngIfElse", noCustomersForQuotes_r182);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r3.quotes.length > 0)("ngIfElse", emptyQuotes_r183);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("label", ctx_r3.invoices.length + " facture" + (ctx_r3.invoices.length > 1 ? "s" : ""))("tone", ctx_r3.invoices.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", "Total en pr\u00E9paration : " + ctx_r3.formatAmountCents(ctx_r3.invoiceFormTotalCents))("tone", ctx_r3.invoiceFormTotalCents > 0 ? "progress" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.hasInvoiceDraft);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.billingCustomers.length > 0)("ngIfElse", noCustomersForInvoices_r184);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r3.invoices.length > 0)("ngIfElse", emptyInvoices_r185);
} }
function AppComponent_ng_template_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, AppComponent_ng_template_5_cfm_card_0_Template, 2, 0, "cfm-card", 342)(1, AppComponent_ng_template_5_ng_container_1_Template, 55, 40, "ng-container", 100);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngIf", ctx_r3.shouldShowWorkspaceContent && ctx_r3.currentMembership && !ctx_r3.isFacturationEnabled);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.shouldShowWorkspaceContent && ctx_r3.currentMembership && ctx_r3.isFacturationEnabled);
} }
function AppComponent_ng_template_7_cfm_card_0_ng_container_9_option_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const assignee_r187 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", assignee_r187.user_id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.getWorksiteAssigneeOptionLabel(assignee_r187), " ");
} }
function AppComponent_ng_template_7_cfm_card_0_ng_container_9_cfm_button_23_Template(rf, ctx) { if (rf & 1) {
    const _r188 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_7_cfm_card_0_ng_container_9_cfm_button_23_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r188); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.resetCoordinationFilters()); });
    i0.ɵɵtext(1, " R\u00E9initialiser les filtres ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_7_cfm_card_0_ng_container_9_ul_24_li_1_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r190 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r190.context);
} }
function AppComponent_ng_template_7_cfm_card_0_ng_container_9_ul_24_li_1_Template(rf, ctx) { if (rf & 1) {
    const _r189 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "div", 99)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_7_cfm_card_0_ng_container_9_ul_24_li_1_span_6_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 119)(8, "div", 63);
    i0.ɵɵelement(9, "cfm-status-chip", 69)(10, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_7_cfm_card_0_ng_container_9_ul_24_li_1_Template_cfm_button_click_11_listener() { const item_r190 = i0.ɵɵrestoreView(_r189).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.openCoordinationTodoItem(item_r190)); });
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r190 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r190.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r190.description);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r190.context);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", item_r190.kindLabel)("tone", item_r190.kindTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r190.statusLabel)("tone", item_r190.statusTone);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", item_r190.kind === "worksite" ? "Voir le chantier" : "Voir le document", " ");
} }
function AppComponent_ng_template_7_cfm_card_0_ng_container_9_ul_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 98);
    i0.ɵɵtemplate(1, AppComponent_ng_template_7_cfm_card_0_ng_container_9_ul_24_li_1_Template, 13, 8, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.coordinationTodoItems);
} }
function AppComponent_ng_template_7_cfm_card_0_ng_container_9_ng_template_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 58);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.hasActiveCoordinationFilters ? "Aucun \u00E9l\u00E9ment coordonn\u00E9 ne correspond aux filtres." : "Aucun chantier ni document coordonn\u00E9 \u00E0 traiter pour le moment.", " ");
} }
function AppComponent_ng_template_7_cfm_card_0_ng_container_9_Template(rf, ctx) { if (rf & 1) {
    const _r186 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 107)(2, "label", 108)(3, "span", 58);
    i0.ɵɵtext(4, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "select", 426);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_7_cfm_card_0_ng_container_9_Template_select_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r186); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedCoordinationStatusFilter, $event) || (ctx_r3.selectedCoordinationStatusFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(6, "option", 88);
    i0.ɵɵtext(7, "Tous les suivis");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "option", 110);
    i0.ɵɵtext(9, "\u00C0 faire");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "option", 111);
    i0.ɵɵtext(11, "En cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "option", 112);
    i0.ɵɵtext(13, "Fait");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "label", 108)(15, "span", 58);
    i0.ɵɵtext(16, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "select", 427);
    i0.ɵɵtwoWayListener("ngModelChange", function AppComponent_ng_template_7_cfm_card_0_ng_container_9_Template_select_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r186); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.selectedCoordinationAssigneeFilter, $event) || (ctx_r3.selectedCoordinationAssigneeFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(18, "option", 88);
    i0.ɵɵtext(19, "Toutes les affectations");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "option", 114);
    i0.ɵɵtext(21, "Non affect\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(22, AppComponent_ng_template_7_cfm_card_0_ng_container_9_option_22_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(23, AppComponent_ng_template_7_cfm_card_0_ng_container_9_cfm_button_23_Template, 2, 0, "cfm-button", 116);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(24, AppComponent_ng_template_7_cfm_card_0_ng_container_9_ul_24_Template, 2, 1, "ul", 82)(25, AppComponent_ng_template_7_cfm_card_0_ng_container_9_ng_template_25_Template, 2, 1, "ng-template", null, 41, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptyStandaloneCoordinationTodo_r191 = i0.ɵɵreference(26);
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedCoordinationStatusFilter);
    i0.ɵɵadvance(12);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.selectedCoordinationAssigneeFilter);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngForOf", ctx_r3.worksiteAssignees);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.hasActiveCoordinationFilters);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.coordinationTodoItems.length > 0)("ngIfElse", emptyStandaloneCoordinationTodo_r191);
} }
function AppComponent_ng_template_7_cfm_card_0_ng_template_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 428);
} }
function AppComponent_ng_template_7_cfm_card_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 425)(1, "section", 83)(2, "div", 84)(3, "div", 85)(4, "h3");
    i0.ɵɵtext(5, "Coordination l\u00E9g\u00E8re");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 58);
    i0.ɵɵtext(7, " Retrouvez vite ce qui reste \u00E0 faire sans ouvrir un gestionnaire de t\u00E2ches complet. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(8, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(9, AppComponent_ng_template_7_cfm_card_0_ng_container_9_Template, 27, 6, "ng-container", 102)(10, AppComponent_ng_template_7_cfm_card_0_ng_template_10_Template, 1, 0, "ng-template", null, 40, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const standaloneCoordinationDisabled_r192 = i0.ɵɵreference(11);
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("label", ctx_r3.coordinationTodoCountLabel)("tone", ctx_r3.coordinationTodoItems.length > 0 ? "progress" : "success");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isChantierEnabled)("ngIfElse", standaloneCoordinationDisabled_r192);
} }
function AppComponent_ng_template_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, AppComponent_ng_template_7_cfm_card_0_Template, 12, 4, "cfm-card", 424);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngIf", ctx_r3.shouldShowWorkspaceContent && ctx_r3.currentMembership);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r193.coordination.commentSummary);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Dernier suivi : ", item_r193.coordination.updatedAtLabel, " ");
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_span_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r193.financialSummary);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_25_Template(rf, ctx) { if (rf & 1) {
    const _r194 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_25_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r194); const item_r193 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.prepareQuoteFromWorksite(item_r193.id)); });
    i0.ɵɵtext(1, " Pr\u00E9parer un devis ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_26_Template(rf, ctx) { if (rf & 1) {
    const _r195 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_26_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r195); const item_r193 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.prepareInvoiceFromWorksite(item_r193.id)); });
    i0.ɵɵtext(1, " Pr\u00E9parer une facture ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_27_Template(rf, ctx) { if (rf & 1) {
    const _r196 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_27_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r196); const item_r193 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.exportWorksiteSummaryPdf(item_r193.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r3.worksiteDocumentPdfBusyId === item_r193.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksiteDocumentPdfBusyId === item_r193.id ? "G\u00E9n\u00E9ration en cours" : "Fiche chantier PDF", " ");
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_28_Template(rf, ctx) { if (rf & 1) {
    const _r197 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 126);
    i0.ɵɵlistener("click", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_28_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r197); const item_r193 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.toggleWorksitePreventionPlanEditor(item_r193.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r3.worksitePreventionPlanPdfBusyId === item_r193.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksitePreventionPlanEditingId === item_r193.id ? "Fermer le plan" : "Ajuster le plan", " ");
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_29_Template(rf, ctx) { if (rf & 1) {
    const _r198 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_29_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r198); const item_r193 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.focusWorksiteDocuments(item_r193.id)); });
    i0.ɵɵtext(1, " Voir les documents ");
    i0.ɵɵelementEnd();
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_30_Template(rf, ctx) { if (rf & 1) {
    const _r199 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 118);
    i0.ɵɵlistener("click", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_30_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r199); const item_r193 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.toggleWorksiteCoordination(item_r193.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.selectedWorksiteCoordinationId === item_r193.id ? "Masquer la coordination" : "Coordination simple", " ");
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re mise \u00E0 jour : ", item_r193.coordination.updatedAtLabel, " ");
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_label_11_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const assignee_r202 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(9);
    i0.ɵɵproperty("value", assignee_r202.user_id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.getWorksiteAssigneeOptionLabel(assignee_r202), " ");
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_label_11_Template(rf, ctx) { if (rf & 1) {
    const _r201 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 144)(1, "span");
    i0.ɵɵtext(2, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_label_11_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r201); const item_r193 = i0.ɵɵnextContext(3).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteCoordinationDraft(item_r193.id, { assigneeUserId: $event })); });
    i0.ɵɵelementStart(4, "option", 133);
    i0.ɵɵtext(5, "Non affect\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_label_11_option_6_Template, 2, 2, "option", 115);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteCoordinationDraft(item_r193.id).assigneeUserId)("name", "worksiteStandaloneCoordinationAssignee" + item_r193.id)("disabled", ctx_r3.worksiteCoordinationBusyId === item_r193.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.worksiteAssignees);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_ng_template_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 140)(1, "span", 58);
    i0.ɵɵtext(2, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Aucun membre lisible pour affecter ce chantier.");
    i0.ɵɵelementEnd()();
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_Template(rf, ctx) { if (rf & 1) {
    const _r200 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 139)(1, "label", 144)(2, "span");
    i0.ɵɵtext(3, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "select", 130);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_Template_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r200); const item_r193 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteCoordinationDraft(item_r193.id, { status: $event })); });
    i0.ɵɵelementStart(5, "option", 110);
    i0.ɵɵtext(6, "\u00C0 faire");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "option", 111);
    i0.ɵɵtext(8, "En cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "option", 112);
    i0.ɵɵtext(10, "Fait");
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(11, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_label_11_Template, 7, 4, "label", 145)(12, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_ng_template_12_Template, 5, 0, "ng-template", null, 44, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const noStandaloneWorksiteAssignees_r203 = i0.ɵɵreference(13);
    const item_r193 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteCoordinationDraft(item_r193.id).status)("name", "worksiteStandaloneCoordinationStatus" + item_r193.id)("disabled", ctx_r3.worksiteCoordinationBusyId === item_r193.id);
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngIf", ctx_r3.worksiteAssignees.length > 0)("ngIfElse", noStandaloneWorksiteAssignees_r203);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_label_20_Template(rf, ctx) { if (rf & 1) {
    const _r204 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 146)(1, "span");
    i0.ɵɵtext(2, "Commentaire simple");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "textarea", 147);
    i0.ɵɵlistener("ngModelChange", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_label_20_Template_textarea_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r204); const item_r193 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.updateWorksiteCoordinationDraft(item_r193.id, { commentText: $event })); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r3.getWorksiteCoordinationDraft(item_r193.id).commentText)("name", "worksiteStandaloneCoordinationComment" + item_r193.id)("disabled", ctx_r3.worksiteCoordinationBusyId === item_r193.id);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_21_Template(rf, ctx) { if (rf & 1) {
    const _r205 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 107)(1, "cfm-button", 148);
    i0.ɵɵlistener("click", function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_21_Template_cfm_button_click_1_listener() { i0.ɵɵrestoreView(_r205); const item_r193 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r3.saveWorksiteCoordination(item_r193)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.worksiteCoordinationBusyId === item_r193.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.worksiteCoordinationBusyId === item_r193.id ? "Enregistrement en cours" : "Enregistrer", " ");
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 138)(1, "div", 139)(2, "div", 140)(3, "span", 58);
    i0.ɵɵtext(4, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 140)(9, "span", 58);
    i0.ɵɵtext(10, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "strong");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_span_13_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 140)(15, "span", 58);
    i0.ɵɵtext(16, "Commentaire simple");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(19, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_19_Template, 14, 5, "div", 141)(20, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_label_20_Template, 4, 3, "label", 142)(21, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_div_21_Template, 3, 2, "div", 143);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(item_r193.coordination.statusLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r193.coordination.statusLabel)("tone", item_r193.coordination.statusTone);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(item_r193.coordination.assigneeLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r193.coordination.updatedAtLabel);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", item_r193.coordination.commentText || "Aucun commentaire simple pour le moment.", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 99)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(12, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_span_12_Template, 2, 1, "span", 100)(13, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_span_13_Template, 2, 1, "span", 100);
    i0.ɵɵelementStart(14, "span");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "span");
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(20, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_span_20_Template, 2, 1, "span", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "div", 119)(22, "div", 63);
    i0.ɵɵelement(23, "cfm-status-chip", 69)(24, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(25, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_25_Template, 2, 0, "cfm-button", 116)(26, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_26_Template, 2, 0, "cfm-button", 116)(27, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_27_Template, 2, 2, "cfm-button", 122)(28, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_28_Template, 2, 2, "cfm-button", 122)(29, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_29_Template, 2, 0, "cfm-button", 116)(30, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_cfm_button_30_Template, 2, 1, "cfm-button", 116);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(31, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_section_31_Template, 22, 9, "section", 124);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r193 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r193.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r193.summary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r193.operationalSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r193.taskSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" Coordination : ", item_r193.coordination.statusLabel, " \u00B7 ", item_r193.coordination.assigneeLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r193.coordination.commentText);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r193.coordination.updatedAtLabel);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r193.linkedWorksiteDocumentsSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r193.linkedQuotesSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r193.linkedInvoicesSummary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r193.financialSummary);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", item_r193.statusLabel)("tone", item_r193.statusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r193.signalLabel)("tone", item_r193.signalTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.isFacturationEnabled && ctx_r3.billingCustomers.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canManageOrganization && ctx_r3.isFacturationEnabled && ctx_r3.billingCustomers.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r193.worksiteDocumentsCount > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.selectedWorksiteCoordinationId === item_r193.id);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 98);
    i0.ɵɵtemplate(1, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_li_1_Template, 32, 23, "li", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r3.filteredDashboardWorksiteOverviewItems);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 58);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.hasActiveCoordinationFilters ? "Aucun chantier ne correspond aux filtres de coordination." : "Aucun chantier \u00E0 afficher pour le moment.", " ");
} }
function AppComponent_ng_template_9_cfm_card_0_ng_container_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ul_1_Template, 2, 1, "ul", 82)(2, AppComponent_ng_template_9_cfm_card_0_ng_container_9_ng_template_2_Template, 2, 1, "ng-template", null, 43, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptyStandaloneWorksiteOverview_r206 = i0.ɵɵreference(3);
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.filteredDashboardWorksiteOverviewItems.length > 0)("ngIfElse", emptyStandaloneWorksiteOverview_r206);
} }
function AppComponent_ng_template_9_cfm_card_0_ng_template_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 431);
} }
function AppComponent_ng_template_9_cfm_card_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 430)(1, "section", 103)(2, "div", 84)(3, "div", 85)(4, "h3");
    i0.ɵɵtext(5, "Chantiers");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 58);
    i0.ɵɵtext(7, " Les chantiers ressortent avec leur statut g\u00E9n\u00E9ral, leurs signaux simples et les actions utiles. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(8, "cfm-status-chip", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(9, AppComponent_ng_template_9_cfm_card_0_ng_container_9_Template, 4, 2, "ng-container", 102)(10, AppComponent_ng_template_9_cfm_card_0_ng_template_10_Template, 1, 0, "ng-template", null, 42, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const standaloneWorksiteDisabled_r207 = i0.ɵɵreference(11);
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("label", ctx_r3.worksiteOverviewCountLabel)("tone", ctx_r3.filteredDashboardWorksiteOverviewItems.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.isChantierEnabled)("ngIfElse", standaloneWorksiteDisabled_r207);
} }
function AppComponent_ng_template_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, AppComponent_ng_template_9_cfm_card_0_Template, 12, 4, "cfm-card", 429);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngIf", ctx_r3.shouldShowWorkspaceContent && ctx_r3.currentMembership);
} }
export class AppComponent {
    static REGULATORY_WORKSPACE_SEGMENT_LABELS = [
        "building-safety-alerts",
        "duerp-entries",
        "regulatory-evidences",
    ];
    static DISABLE_BOOTSTRAP_SESSION_RESTORE = false;
    static DISABLE_DO_CHECK_PERSISTENCE = false;
    static WORKSPACE_LOADING_DISABLED = false;
    static WORKSPACE_DEBUG_ONLY_LABEL = null;
    static DISABLE_DEFERRED_WORKSPACE_SCROLL = false;
    router = inject(Router);
    email = "";
    password = "";
    loading = false;
    errorMessage = "";
    feedbackMessage = "";
    session = null;
    accessToken = getStoredAccessToken();
    selectedOrganizationId = getStoredOrganizationId();
    sessionRestoreInProgress = false;
    organizationWorkspaceLoading = false;
    workspaceRefreshInFlight = null;
    workspaceRefreshScheduledHandle = null;
    workspaceRefreshScheduledOrganizationId = null;
    workspaceRefreshScheduledReason = null;
    workspaceHydratedOrganizationId = null;
    workspaceSegmentIssues = {};
    regulatoryExporting = false;
    organizationProfileSaving = false;
    organizationSiteSaving = false;
    organizationSiteStatusBusyId = null;
    organizationSiteEnrichmentBusyId = null;
    homeSiteQuickCreateOpen = false;
    organizationProfile = null;
    organizationSites = [];
    regulatoryProfile = null;
    selectedObligationId = null;
    customerSaving = false;
    customerEditingId = null;
    customerSearchTerm = "";
    billingCustomers = [];
    billingWorksites = [];
    worksiteDocuments = [];
    worksiteProofs = [];
    worksiteSignatures = [];
    worksiteAssignees = [];
    selectedWorksiteCoordinationId = null;
    selectedCoordinationStatusFilter = "all";
    selectedCoordinationAssigneeFilter = "all";
    selectedWorksiteDocumentFilterId = "all";
    selectedWorksiteDocumentTypeFilter = "all";
    selectedWorksiteDocumentLifecycleFilter = "all";
    selectedWorksiteDocumentDetailId = null;
    worksiteDocumentDownloadBusyId = null;
    worksiteDocumentPdfBusyId = null;
    worksiteCoordinationBusyId = null;
    worksiteDocumentCoordinationBusyId = null;
    worksiteDocumentStatusBusyId = null;
    worksiteDocumentProofBusyId = null;
    worksiteDocumentSignatureBusyId = null;
    worksitePreventionPlanPdfBusyId = null;
    worksitePreventionPlanEditingId = null;
    worksiteCoordinationDrafts = {};
    worksiteDocumentCoordinationDrafts = {};
    worksitePreventionPlanForm = {
        usefulDate: "",
        interventionContext: "",
        vigilancePoints: "",
        measurePoints: "",
        additionalContact: "",
    };
    worksitePreventionPlanInitialForm = null;
    billingDraftsHydratedScope = null;
    quoteDraftSnapshot = "";
    invoiceDraftSnapshot = "";
    quoteSaving = false;
    quoteEditingSaving = false;
    quoteEditingId = null;
    quoteStatusBusyId = null;
    quoteFollowUpBusyId = null;
    quoteWorksiteBusyId = null;
    quoteDuplicateBusyId = null;
    quotePdfBusyId = null;
    quoteHistoryBusyId = null;
    quoteHistoryOpenId = null;
    quoteHistoryById = {};
    quotes = [];
    invoiceSaving = false;
    invoiceEditingSaving = false;
    invoiceEditingId = null;
    invoiceStatusBusyId = null;
    invoiceFollowUpBusyId = null;
    invoicePaymentBusyId = null;
    invoicePaymentId = null;
    invoiceWorksiteBusyId = null;
    invoicePdfBusyId = null;
    invoiceHistoryBusyId = null;
    invoiceHistoryOpenId = null;
    invoiceHistoryById = {};
    invoices = [];
    cockpitSummary = null;
    buildingSafetySaving = false;
    buildingSafetyStatusBusyId = null;
    buildingSafetyEditingId = null;
    buildingSafetyItems = [];
    buildingSafetyAlerts = [];
    duerpSaving = false;
    duerpStatusBusyId = null;
    duerpEditingId = null;
    duerpEntries = [];
    regulatoryEvidenceSaving = false;
    regulatoryEvidences = [];
    selectedSafetySiteId = "all";
    selectedDashboardActionModule = "all";
    betaFeedbackCategory = "improvement";
    betaFeedbackArea = "cockpit";
    betaFeedbackMessageText = "";
    betaFeedbackNotice = "";
    betaFeedbackError = "";
    betaFeedbackCopyBusy = false;
    profileForm = {
        name: "",
        legalName: "",
        activityLabel: "",
        employeeCount: "",
        hasEmployees: "",
        receivesPublic: "",
        storesHazardousProducts: "",
        performsHighRiskWork: "",
        contactEmail: "",
        contactPhone: "",
        headquartersAddress: "",
        notes: ""
    };
    siteForm = {
        name: "",
        address: "",
        siteType: "site"
    };
    customerForm = {
        name: "",
        customerType: "company",
        email: "",
        phone: "",
        address: "",
        notes: ""
    };
    quoteForm = {
        customerId: "",
        worksiteId: "",
        title: "",
        issueDate: this.getTodayDateValue(),
        validUntil: "",
        status: "draft",
        notes: "",
        lines: [this.createEmptyBillingLineForm()]
    };
    quoteEditForm = {
        customerId: "",
        worksiteId: "",
        title: "",
        issueDate: this.getTodayDateValue(),
        validUntil: "",
        status: "draft",
        notes: "",
        lines: [this.createEmptyBillingLineForm()]
    };
    invoiceForm = {
        customerId: "",
        worksiteId: "",
        title: "",
        issueDate: this.getTodayDateValue(),
        dueDate: "",
        status: "draft",
        notes: "",
        lines: [this.createEmptyBillingLineForm()]
    };
    invoiceEditForm = {
        customerId: "",
        worksiteId: "",
        title: "",
        issueDate: this.getTodayDateValue(),
        dueDate: "",
        status: "draft",
        notes: "",
        lines: [this.createEmptyBillingLineForm()]
    };
    invoicePaymentForm = {
        paidAmount: "",
        paidAt: this.getTodayDateValue()
    };
    buildingSafetyForm = {
        siteId: "",
        itemType: "fire_extinguisher",
        name: "",
        nextDueDate: "",
        lastCheckedAt: "",
        status: "active",
        notes: ""
    };
    duerpForm = {
        siteId: "",
        workUnitName: "",
        riskLabel: "",
        severity: "medium",
        preventionAction: ""
    };
    regulatoryEvidenceForm = {
        linkKind: "obligation",
        obligationId: "",
        siteId: "",
        buildingSafetyItemId: "",
        duerpEntryId: "",
        fileName: "",
        documentType: "attestation",
        notes: ""
    };
    homePageTemplateRef;
    reglementationPageTemplateRef;
    chantierPageTemplateRef;
    facturationPageTemplateRef;
    coordinationPageTemplateRef;
    boundRegulatoryShowcaseActionBusy = (action) => this.isRegulatoryShowcaseActionBusy(action);
    boundRegulatoryShowcaseActionLabel = (action) => this.getRegulatoryShowcaseActionLabel(action);
    constructor() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationCancel) {
                console.warn("[routing] navigation cancelled.", {
                    url: event.url,
                    reason: event.reason,
                });
            }
            if (event instanceof NavigationError) {
                console.error("[routing] navigation error.", {
                    url: event.url,
                    error: event.error,
                });
            }
            if (event instanceof NavigationEnd) {
                void this.handleRouteChange();
            }
        });
        void this.handleRouteChange();
    }
    getWorkspaceTemplate(name) {
        switch (name) {
            case "home":
                return this.homePageTemplateRef ?? null;
            case "reglementation":
                return this.reglementationPageTemplateRef ?? null;
            case "chantier":
                return this.chantierPageTemplateRef ?? null;
            case "facturation":
                return this.facturationPageTemplateRef ?? null;
            case "coordination":
                return this.coordinationPageTemplateRef ?? null;
            default:
                return null;
        }
    }
    ngDoCheck() {
        if (AppComponent.DISABLE_DO_CHECK_PERSISTENCE) {
            return;
        }
        this.persistBillingDraftsIfNeeded();
    }
    get currentMembership() {
        return this.session?.current_membership ?? null;
    }
    get activeSessionModules() {
        const membership = this.currentMembership;
        if (!membership) {
            return [];
        }
        const modulesFromEnabledList = membership.enabled_modules ?? [];
        const modulesFromRecords = membership.modules
            ?.filter((module) => module.is_enabled)
            .map((module) => module.module_code)
            ?? [];
        return Array.from(new Set([...modulesFromEnabledList, ...modulesFromRecords]));
    }
    get shouldRenderLoginScreen() {
        return this.isLoginRoutePath(this.router.url.split("#")[0] || "/login");
    }
    get canManageModules() {
        return this.currentMembership?.permissions.includes("modules:manage") ?? false;
    }
    get canManageOrganization() {
        return this.currentMembership?.permissions.includes("organization:update") ?? false;
    }
    get canReadOrganization() {
        return this.currentMembership?.permissions.includes("organization:read") ?? false;
    }
    get canReadUsers() {
        return this.currentMembership?.permissions.includes("users:read") ?? false;
    }
    get desktopNavigationItems() {
        const items = [
            { route: "/app/home", label: "Cockpit", tone: "calm" },
        ];
        if (this.isReglementationEnabled) {
            items.push({ route: "/app/reglementation", label: "Réglementation", tone: "progress" });
        }
        if (this.isChantierEnabled) {
            items.push({ route: "/app/chantier", label: "Chantier", tone: "calm" });
            items.push({ route: "/app/chantier/documents", label: "Documents", tone: "neutral" });
            items.push({ route: "/app/chantier/coordination", label: "Coordination", tone: "progress" });
        }
        if (this.isFacturationEnabled) {
            items.push({ route: "/app/facturation", label: "Facturation", tone: "calm" });
        }
        return items;
    }
    get isReglementationEnabled() {
        return this.activeSessionModules.includes("reglementation");
    }
    get isFacturationEnabled() {
        return this.activeSessionModules.includes("facturation");
    }
    get isChantierEnabled() {
        return this.activeSessionModules.includes("chantier");
    }
    get homeUsedModuleCodes() {
        return this.activeSessionModules.filter((moduleCode) => moduleCode === "reglementation" || moduleCode === "chantier" || moduleCode === "facturation");
    }
    get isWorkspaceHydratedForCurrentOrganization() {
        return Boolean(this.selectedOrganizationId
            && this.workspaceHydratedOrganizationId === this.selectedOrganizationId);
    }
    get isReglementationDataPending() {
        return this.isModuleDataPending("reglementation");
    }
    get isReglementationDataDelayed() {
        return Boolean(this.isReglementationEnabled
            && this.regulatoryWorkspaceNotice
            && !this.regulatoryProfile
            && this.buildingSafetyItems.length === 0
            && this.buildingSafetyAlerts.length === 0
            && this.duerpEntries.length === 0
            && this.regulatoryEvidences.length === 0);
    }
    get regulatoryWorkspaceNotice() {
        if (!this.isReglementationEnabled) {
            return null;
        }
        const messages = AppComponent.REGULATORY_WORKSPACE_SEGMENT_LABELS
            .map((label) => this.workspaceSegmentIssues[label])
            .filter((message) => Boolean(message));
        if (messages.length === 0) {
            return null;
        }
        return "Les données réglementaires mettent plus de temps à remonter. Le reste du cockpit reste disponible.";
    }
    get isFacturationDataPending() {
        return this.isModuleDataPending("facturation");
    }
    get isChantierDataPending() {
        return this.isModuleDataPending("chantier");
    }
    getModuleNavigationLabel(moduleCode) {
        switch (moduleCode) {
            case "reglementation":
                return "Réglementation";
            case "chantier":
                return "Chantier";
            case "facturation":
                return "Facturation";
        }
    }
    get hasWorkspaceContent() {
        return Boolean(this.cockpitSummary
            || this.organizationProfile
            || this.organizationSites.length > 0
            || this.regulatoryProfile
            || this.billingCustomers.length > 0
            || this.billingWorksites.length > 0
            || this.worksiteDocuments.length > 0
            || this.worksiteProofs.length > 0
            || this.worksiteSignatures.length > 0
            || this.quotes.length > 0
            || this.invoices.length > 0
            || this.buildingSafetyItems.length > 0
            || this.buildingSafetyAlerts.length > 0
            || this.duerpEntries.length > 0
            || this.regulatoryEvidences.length > 0);
    }
    get shouldShowWorkspaceContent() {
        return !this.organizationWorkspaceLoading || this.hasWorkspaceContent;
    }
    get shouldShowInitialWorkspaceLoading() {
        return this.organizationWorkspaceLoading && !this.hasWorkspaceContent;
    }
    get isWorkspaceRefreshing() {
        return this.organizationWorkspaceLoading && this.hasWorkspaceContent;
    }
    get hasBetaFeedbackDraft() {
        return this.betaFeedbackMessageText.trim().length > 0;
    }
    get canCopyBetaFeedback() {
        return this.hasBetaFeedbackDraft;
    }
    get betaFeedbackPreviewText() {
        return [
            "Retour beta Conforméo",
            `Type : ${this.getBetaFeedbackCategoryLabel(this.betaFeedbackCategory)}`,
            `Zone : ${this.getBetaFeedbackAreaLabel(this.betaFeedbackArea)}`,
            "",
            this.betaFeedbackMessageText.trim(),
        ].join("\n");
    }
    get isOnboardingPending() {
        return !this.organizationProfile?.onboarding_completed_at;
    }
    get isQualificationQuestionnaireComplete() {
        return Boolean(this.profileForm.receivesPublic
            && this.profileForm.storesHazardousProducts
            && this.profileForm.performsHighRiskWork);
    }
    get canSubmitOnboarding() {
        return Boolean(this.profileForm.name.trim()
            && this.profileForm.activityLabel.trim()
            && this.profileForm.contactEmail.trim()
            && this.profileForm.hasEmployees);
    }
    get canCreateSite() {
        return Boolean(this.siteForm.name.trim() && this.siteForm.address.trim());
    }
    get canSaveCustomer() {
        return Boolean(this.customerForm.name.trim());
    }
    get isCustomerEditing() {
        return this.customerEditingId !== null;
    }
    get filteredBillingCustomers() {
        const query = this.toSearchableText(this.customerSearchTerm);
        if (!query) {
            return this.billingCustomers;
        }
        return this.billingCustomers.filter((customer) => [customer.name, customer.email, customer.phone].some((value) => this.toSearchableText(value).includes(query)));
    }
    get customerSearchCountLabel() {
        const total = this.billingCustomers.length;
        const visible = this.filteredBillingCustomers.length;
        const label = total > 1 ? "clients" : "client";
        if (this.toSearchableText(this.customerSearchTerm)) {
            return `${visible} sur ${total} ${label}`;
        }
        return `${total} ${label}`;
    }
    get activeWorksitePreventionPlanPreview() {
        if (!this.worksitePreventionPlanEditingId) {
            return null;
        }
        const worksite = this.billingWorksites.find((entry) => entry.id === this.worksitePreventionPlanEditingId);
        if (!worksite) {
            return null;
        }
        return this.buildWorksitePreventionPlanPreview(worksite);
    }
    getWorksiteAssigneeOptionLabel(assignee) {
        return `${assignee.display_name} · ${assignee.role_code}`;
    }
    toggleWorksiteCoordination(worksiteId) {
        this.selectedWorksiteCoordinationId =
            this.selectedWorksiteCoordinationId === worksiteId ? null : worksiteId;
    }
    getWorksiteCoordinationDraft(worksiteId) {
        const existingDraft = this.worksiteCoordinationDrafts[worksiteId];
        if (existingDraft) {
            return existingDraft;
        }
        const worksite = this.billingWorksites.find((entry) => entry.id === worksiteId);
        const draft = this.buildCoordinationDraft(worksite?.coordination ?? null);
        this.worksiteCoordinationDrafts = {
            ...this.worksiteCoordinationDrafts,
            [worksiteId]: draft,
        };
        return draft;
    }
    getWorksiteDocumentCoordinationDraft(documentId) {
        const existingDraft = this.worksiteDocumentCoordinationDrafts[documentId];
        if (existingDraft) {
            return existingDraft;
        }
        const document = this.worksiteDocuments.find((entry) => entry.id === documentId);
        const draft = this.buildCoordinationDraft(document?.coordination ?? null);
        this.worksiteDocumentCoordinationDrafts = {
            ...this.worksiteDocumentCoordinationDrafts,
            [documentId]: draft,
        };
        return draft;
    }
    updateWorksiteCoordinationDraft(worksiteId, patch) {
        this.worksiteCoordinationDrafts = {
            ...this.worksiteCoordinationDrafts,
            [worksiteId]: {
                ...this.getWorksiteCoordinationDraft(worksiteId),
                ...patch,
            },
        };
    }
    updateWorksiteDocumentCoordinationDraft(documentId, patch) {
        this.worksiteDocumentCoordinationDrafts = {
            ...this.worksiteDocumentCoordinationDrafts,
            [documentId]: {
                ...this.getWorksiteDocumentCoordinationDraft(documentId),
                ...patch,
            },
        };
    }
    buildCoordinationDraft(coordination) {
        return {
            status: coordination?.status ?? "todo",
            assigneeUserId: coordination?.assignee_user_id ?? "",
            commentText: coordination?.comment_text ?? "",
        };
    }
    buildDashboardCoordinationState(coordination) {
        const commentText = coordination.comment_text?.trim() ? coordination.comment_text.trim() : null;
        const updatedAtLabel = this.formatCompactDate(coordination.updated_at);
        return {
            status: coordination.status,
            statusLabel: this.getWorksiteCoordinationStatusLabel(coordination.status),
            statusTone: this.getWorksiteCoordinationStatusTone(coordination.status),
            assigneeUserId: coordination.assignee_user_id,
            assigneeDisplayName: coordination.assignee_display_name,
            assigneeLabel: coordination.assignee_display_name ?? "Non affecté",
            commentText,
            commentSummary: commentText
                ? `Commentaire : ${commentText}`
                : "Commentaire : aucun commentaire simple",
            updatedAtLabel,
        };
    }
    mapDashboardWorksiteDocumentItem(document) {
        return {
            id: document.id,
            title: document.document_type_label,
            documentType: document.document_type,
            fileName: document.file_name,
            worksiteId: document.worksite_id,
            worksiteName: document.worksite_name,
            lifecycleStatus: document.lifecycle_status,
            lifecycleStatusLabel: this.getWorksiteDocumentLifecycleStatusLabel(document.lifecycle_status),
            lifecycleStatusTone: this.getWorksiteDocumentLifecycleStatusTone(document.lifecycle_status),
            technicalStatusLabel: this.getWorksiteDocumentTechnicalStatusLabel(document.status),
            technicalStatusTone: this.getWorksiteDocumentTechnicalStatusTone(document.status),
            typeLabel: document.document_type_label,
            proofCount: document.linked_proofs.length,
            proofCountLabel: this.getWorksiteDocumentProofCountLabel(document.linked_proofs.length),
            signatureStatusLabel: this.getWorksiteDocumentSignatureStatusLabel(document.linked_signature_id),
            signatureStatusTone: this.getWorksiteDocumentSignatureStatusTone(document.linked_signature_id),
            linkedSignature: this.mapLinkedWorksiteSignatureItem(document),
            linkedSignatureId: document.linked_signature_id,
            linkedSignatureLabel: document.linked_signature_label,
            linkedSignatureDetail: this.formatWorksiteLinkedSignatureDetail(document),
            linkedProofs: this.mapLinkedWorksiteProofItems(document),
            linkedProofsSummary: this.formatWorksiteLinkedProofsSummary(document),
            hasStoredFile: document.has_stored_file,
            fileAvailabilityLabel: this.getWorksiteDocumentFileAvailabilityLabel(document),
            fileAvailabilityTone: this.getWorksiteDocumentFileAvailabilityTone(document),
            fileSizeLabel: this.formatFileSize(document.size_bytes),
            uploadedAtValue: document.uploaded_at,
            uploadedAtLabel: this.formatCompactDate(document.uploaded_at),
            notes: document.notes,
            coordination: this.buildDashboardCoordinationState(document.coordination),
        };
    }
    matchesCoordinationFilters(coordination) {
        return this.matchesCoordinationStatusFilter(coordination) && this.matchesCoordinationAssigneeFilter(coordination);
    }
    matchesCoordinationStatusFilter(coordination) {
        return this.selectedCoordinationStatusFilter === "all"
            ? true
            : coordination.status === this.selectedCoordinationStatusFilter;
    }
    matchesCoordinationAssigneeFilter(coordination) {
        if (this.selectedCoordinationAssigneeFilter === "all") {
            return true;
        }
        if (this.selectedCoordinationAssigneeFilter === "unassigned") {
            return !coordination.assigneeUserId;
        }
        return coordination.assigneeUserId === this.selectedCoordinationAssigneeFilter;
    }
    isCoordinationPending(coordination) {
        return coordination.status === "todo" || coordination.status === "in_progress";
    }
    get worksiteDocumentFilterOptions() {
        const worksiteIds = new Set(this.worksiteDocuments.map((document) => document.worksite_id));
        return this.billingWorksites
            .filter((worksite) => worksiteIds.has(worksite.id))
            .sort((left, right) => left.name.localeCompare(right.name));
    }
    get worksiteDocumentTypeFilterOptions() {
        const byType = new Map();
        for (const document of this.worksiteDocuments) {
            if (!byType.has(document.document_type)) {
                byType.set(document.document_type, document.document_type_label);
            }
        }
        return Array.from(byType.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((left, right) => left.label.localeCompare(right.label));
    }
    get filteredWorksiteDocumentItems() {
        const documents = this.worksiteDocuments
            .filter((document) => this.selectedWorksiteDocumentFilterId === "all"
            ? true
            : document.worksite_id === this.selectedWorksiteDocumentFilterId)
            .filter((document) => this.selectedWorksiteDocumentTypeFilter === "all"
            ? true
            : document.document_type === this.selectedWorksiteDocumentTypeFilter)
            .filter((document) => this.selectedWorksiteDocumentLifecycleFilter === "all"
            ? true
            : document.lifecycle_status === this.selectedWorksiteDocumentLifecycleFilter);
        return documents
            .map((document) => this.mapDashboardWorksiteDocumentItem(document))
            .filter((document) => this.matchesCoordinationFilters(document.coordination))
            .sort((left, right) => (right.uploadedAtValue ?? "").localeCompare(left.uploadedAtValue ?? ""));
    }
    get filteredDashboardWorksiteOverviewItems() {
        return this.dashboardWorksiteOverviewItems.filter((item) => this.matchesCoordinationFilters(item.coordination));
    }
    get worksiteDocumentCountLabel() {
        const total = this.worksiteDocuments.length;
        const visible = this.filteredWorksiteDocumentItems.length;
        const label = total > 1 ? "documents" : "document";
        if (this.selectedWorksiteDocumentFilterId !== "all"
            || this.selectedWorksiteDocumentTypeFilter !== "all"
            || this.selectedWorksiteDocumentLifecycleFilter !== "all"
            || this.hasActiveCoordinationFilters) {
            return `${visible} sur ${total} ${label}`;
        }
        return `${total} ${label}`;
    }
    get worksiteOverviewCountLabel() {
        const total = this.dashboardWorksiteOverviewItems.length;
        const visible = this.filteredDashboardWorksiteOverviewItems.length;
        const label = total > 1 ? "chantiers" : "chantier";
        if (this.isChantierDataPending && total === 0) {
            return "Lecture chantier en préparation";
        }
        if (this.hasActiveCoordinationFilters) {
            return `${visible} sur ${total} ${label}`;
        }
        return `${total} ${label}`;
    }
    get customerOverviewCountLabel() {
        const count = this.dashboardCustomerOverviewItems.length;
        const label = count > 1 ? "clients" : "client";
        if (this.isFacturationDataPending && count === 0) {
            return "Lecture client en préparation";
        }
        return `${count} ${label}`;
    }
    get hasActiveCoordinationFilters() {
        return this.selectedCoordinationStatusFilter !== "all" || this.selectedCoordinationAssigneeFilter !== "all";
    }
    get canResetWorksitePreventionPlanToInitial() {
        if (!this.worksitePreventionPlanInitialForm) {
            return false;
        }
        return JSON.stringify(this.worksitePreventionPlanForm) !== JSON.stringify(this.worksitePreventionPlanInitialForm);
    }
    getWorksiteSignatureOptions(worksiteId) {
        return this.worksiteSignatures
            .filter((signature) => signature.worksite_id === worksiteId)
            .sort((left, right) => (right.uploaded_at ?? "").localeCompare(left.uploaded_at ?? ""));
    }
    getWorksiteSignatureOptionLabel(signature) {
        const uploadedLabel = this.formatCompactDate(signature.uploaded_at);
        return uploadedLabel ? `${signature.file_name} · ${uploadedLabel}` : signature.file_name;
    }
    getWorksiteDocumentActionLabel(document) {
        return this.isWorksitePreventionPlanDocumentType(document.documentType)
            ? "Télécharger"
            : "Télécharger";
    }
    get hasActiveWorksiteDocumentFilters() {
        return (this.selectedWorksiteDocumentFilterId !== "all"
            || this.selectedWorksiteDocumentTypeFilter !== "all"
            || this.selectedWorksiteDocumentLifecycleFilter !== "all"
            || this.hasActiveCoordinationFilters);
    }
    get coordinationTodoItems() {
        const worksiteItems = this.filteredDashboardWorksiteOverviewItems
            .filter((item) => this.isCoordinationPending(item.coordination))
            .map((item) => ({
            id: `worksite-${item.id}`,
            kind: "worksite",
            kindLabel: "Chantier",
            kindTone: "calm",
            title: item.name,
            description: item.coordination.commentText ?? item.taskSummary,
            context: `Affectation : ${item.coordination.assigneeLabel}`,
            status: item.coordination.status,
            statusLabel: item.coordination.statusLabel,
            statusTone: item.coordination.statusTone,
            worksiteId: item.id,
            documentId: null,
        }));
        const documentItems = this.worksiteDocuments
            .map((document) => this.mapDashboardWorksiteDocumentItem(document))
            .filter((document) => this.matchesCoordinationFilters(document.coordination))
            .filter((document) => this.isCoordinationPending(document.coordination))
            .map((document) => ({
            id: `document-${document.id}`,
            kind: "document",
            kindLabel: "Document",
            kindTone: "neutral",
            title: `${document.title} · ${document.worksiteName}`,
            description: document.coordination.commentText
                ?? `${document.typeLabel} encore en préparation ou en suivi simple.`,
            context: `Affectation : ${document.coordination.assigneeLabel}`,
            status: document.coordination.status,
            statusLabel: document.coordination.statusLabel,
            statusTone: document.coordination.statusTone,
            worksiteId: document.worksiteId,
            documentId: document.id,
        }));
        return [...worksiteItems, ...documentItems].sort((left, right) => this.getCoordinationStatusRank(left.status) - this.getCoordinationStatusRank(right.status)
            || left.title.localeCompare(right.title));
    }
    get coordinationTodoCountLabel() {
        const count = this.coordinationTodoItems.length;
        if (this.isChantierDataPending && count === 0) {
            return "Coordination en préparation";
        }
        return `${count} élément${count > 1 ? "s" : ""} à traiter`;
    }
    isWorksiteDocumentDownloadBusy(document) {
        return this.worksiteDocumentDownloadBusyId === document.id;
    }
    canAdjustWorksiteDocument(document) {
        return this.isWorksitePreventionPlanDocumentType(document.documentType) && this.canReadOrganization;
    }
    hasWorksiteDocumentLinkedItems(document) {
        return document.linkedSignature !== null || document.linkedProofs.length > 0;
    }
    getWorksiteDocumentProofCountLabel(count) {
        return count > 0
            ? `${count} preuve${count > 1 ? "s" : ""} liée${count > 1 ? "s" : ""}`
            : "Aucune preuve liée";
    }
    getWorksiteDocumentFileAvailabilityLabel(document) {
        return document.has_stored_file ? "Fichier prêt" : "Fichier à stabiliser";
    }
    getWorksiteDocumentFileAvailabilityTone(document) {
        return document.has_stored_file ? "success" : "progress";
    }
    formatFileSize(sizeBytes) {
        if (!sizeBytes || sizeBytes <= 0) {
            return null;
        }
        if (sizeBytes >= 1024 * 1024) {
            return `${(sizeBytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
        }
        return `${Math.max(1, Math.round(sizeBytes / 1024))} Ko`;
    }
    getWorksiteProofOptions(worksiteId) {
        return this.worksiteProofs
            .filter((proof) => proof.worksite_id === worksiteId)
            .sort((left, right) => (right.uploaded_at ?? "").localeCompare(left.uploaded_at ?? ""));
    }
    getWorksiteProofOptionLabel(proof) {
        const uploadedLabel = this.formatCompactDate(proof.uploaded_at);
        return uploadedLabel ? `${proof.file_name} · ${uploadedLabel}` : proof.file_name;
    }
    resetWorksiteDocumentFilters() {
        this.selectedWorksiteDocumentFilterId = "all";
        this.selectedWorksiteDocumentTypeFilter = "all";
        this.selectedWorksiteDocumentLifecycleFilter = "all";
        this.selectedWorksiteDocumentDetailId = null;
        this.resetCoordinationFilters();
    }
    resetCoordinationFilters() {
        this.selectedCoordinationStatusFilter = "all";
        this.selectedCoordinationAssigneeFilter = "all";
    }
    focusWorksiteDocuments(worksiteId, documentType = "all") {
        this.selectedWorksiteDocumentFilterId = worksiteId;
        this.selectedWorksiteDocumentTypeFilter = documentType;
        this.selectedWorksiteDocumentLifecycleFilter = "all";
        this.selectedWorksiteDocumentDetailId = null;
        this.feedbackMessage = "Documents chantier filtrés sur la zone utile.";
        void this.navigateToWorkspaceRoute("/app/chantier/documents", "worksite-documents-section");
    }
    openCoordinationTodoItem(item) {
        if (item.kind === "worksite") {
            this.selectedWorksiteCoordinationId = item.worksiteId;
            this.feedbackMessage = "Chantier ouvert sur la coordination utile.";
            void this.navigateToWorkspaceRoute("/app/chantier", "worksite-overview-section");
            return;
        }
        if (item.documentId) {
            this.selectedWorksiteDocumentFilterId = item.worksiteId;
            this.selectedWorksiteDocumentTypeFilter = "all";
            this.selectedWorksiteDocumentLifecycleFilter = "all";
            this.selectedWorksiteDocumentDetailId = item.documentId;
            this.feedbackMessage = "Document chantier ouvert sur la zone utile.";
            void this.navigateToWorkspaceRoute("/app/chantier/documents", "worksite-documents-section");
        }
    }
    isWorksiteProofLinked(document, proofId) {
        return document.linkedProofs.some((proof) => proof.id === proofId);
    }
    get localDashboardKpis() {
        const cards = [];
        if (this.isFacturationEnabled) {
            const facturationPending = this.isFacturationDataPending && this.quotes.length === 0 && this.invoices.length === 0;
            cards.push({
                id: "quotes-in-progress",
                label: "Devis en cours",
                value: facturationPending ? "Actif" : String(this.activeQuotesCount),
                detail: facturationPending
                    ? "Le module Facturation est actif. Les premiers repères arrivent."
                    : this.activeQuotesCount > 0
                        ? "Brouillons et devis envoyés à suivre."
                        : "Aucun devis en cours.",
                statusLabel: facturationPending
                    ? "Préparation"
                    : this.activeQuotesCount > 0
                        ? "À suivre"
                        : "À jour",
                tone: facturationPending
                    ? "calm"
                    : this.activeQuotesCount > 0
                        ? "progress"
                        : "success",
            });
            cards.push({
                id: "invoices-pending",
                label: "Factures en attente",
                value: facturationPending ? "Actif" : String(this.pendingInvoicesCount),
                detail: facturationPending
                    ? "Les premières factures suivies apparaîtront après l’hydratation du workspace."
                    : this.pendingInvoicesCount > 0
                        ? this.overdueInvoicesCount > 0
                            ? `${this.overdueInvoicesCount} en retard.`
                            : "Reste à encaisser ou à suivre."
                        : "Aucune facture en attente.",
                statusLabel: facturationPending
                    ? "Préparation"
                    : this.overdueInvoicesCount > 0
                        ? "En retard"
                        : this.pendingInvoicesCount > 0
                            ? "En attente"
                            : "À jour",
                tone: facturationPending
                    ? "calm"
                    : this.overdueInvoicesCount > 0
                        ? "warning"
                        : this.pendingInvoicesCount > 0
                            ? "progress"
                            : "success",
            });
        }
        if (this.isReglementationEnabled) {
            const regulationPending = this.isReglementationDataPending
                && !this.regulatoryProfile
                && this.buildingSafetyItems.length === 0
                && this.duerpEntries.length === 0;
            const regulationDelayed = !regulationPending && this.isReglementationDataDelayed;
            cards.push({
                id: "regulation-to-review",
                label: "Réglementaire à vérifier",
                value: regulationPending ? "Actif" : regulationDelayed ? "Partiel" : String(this.regulatoryActionCount),
                detail: regulationPending
                    ? "Le module Réglementation est actif. Les premiers repères arrivent."
                    : regulationDelayed
                        ? "Les données réglementaires mettent plus de temps à remonter. Le reste du cockpit reste disponible."
                        : this.regulatoryActionCount > 0
                            ? "Obligations ou contrôles à revoir."
                            : "Aucun point réglementaire prioritaire.",
                statusLabel: regulationPending
                    ? "Préparation"
                    : regulationDelayed
                        ? "Remontée lente"
                        : this.globalBuildingSafetyOverdueCount > 0 || this.overdueRegulatoryObligationCount > 0
                            ? "À traiter"
                            : this.regulatoryActionCount > 0
                                ? "À vérifier"
                                : "À jour",
                tone: regulationPending
                    ? "calm"
                    : regulationDelayed
                        ? "progress"
                        : this.globalBuildingSafetyOverdueCount > 0 || this.overdueRegulatoryObligationCount > 0
                            ? "warning"
                            : this.regulatoryActionCount > 0
                                ? "progress"
                                : "success",
            });
        }
        if (this.isChantierEnabled) {
            const chantierPending = this.isChantierDataPending
                && this.billingWorksites.length === 0
                && this.worksiteDocuments.length === 0
                && this.worksiteProofs.length === 0
                && this.worksiteSignatures.length === 0;
            cards.push({
                id: "worksites-needing-action",
                label: "Chantiers nécessitant une action",
                value: chantierPending ? "Actif" : String(this.worksitesNeedingActionCount),
                detail: chantierPending
                    ? "Le module Chantier est actif. Les premiers repères arrivent."
                    : this.worksitesNeedingActionCount > 0
                        ? "Bloqués ou à préparer."
                        : "Aucun chantier prioritaire.",
                statusLabel: chantierPending
                    ? "Préparation"
                    : this.blockedWorksitesCount > 0
                        ? "Bloqués"
                        : this.worksitesNeedingActionCount > 0
                            ? "À préparer"
                            : "À jour",
                tone: chantierPending
                    ? "calm"
                    : this.blockedWorksitesCount > 0
                        ? "warning"
                        : this.worksitesNeedingActionCount > 0
                            ? "progress"
                            : "success",
            });
        }
        return cards;
    }
    get localDashboardAlerts() {
        const alerts = [];
        if (this.isFacturationEnabled && this.overdueInvoicesCount > 0) {
            alerts.push({
                id: "billing-overdue-invoices",
                title: "Factures en retard",
                description: `${this.overdueInvoicesCount} facture${this.overdueInvoicesCount > 1 ? "s dépassent" : " dépasse"} l'échéance et demande${this.overdueInvoicesCount > 1 ? "nt" : ""} un suivi.`,
                moduleLabel: "Facturation",
                tone: "warning",
                priority: 1,
            });
        }
        if (this.isFacturationEnabled && this.quotesToFollowUpCount > 0) {
            alerts.push({
                id: "billing-quotes-follow-up",
                title: "Devis à relancer",
                description: `${this.quotesToFollowUpCount} devis ${this.quotesToFollowUpCount > 1 ? "sont marqués" : "est marqué"} à relancer.`,
                moduleLabel: "Facturation",
                tone: "progress",
                priority: 2,
            });
        }
        if (this.isReglementationEnabled && this.globalBuildingSafetyOverdueCount > 0) {
            alerts.push({
                id: "regulation-building-safety-overdue",
                title: "Sécurité bâtiment à traiter",
                description: `${this.globalBuildingSafetyOverdueCount} élément${this.globalBuildingSafetyOverdueCount > 1 ? "s" : ""} sécurité ${this.globalBuildingSafetyOverdueCount > 1 ? "sont en retard" : "est en retard"} de contrôle.`,
                moduleLabel: "Réglementation",
                tone: "warning",
                priority: 1,
            });
        }
        if (this.isReglementationEnabled && this.regulatoryObligationsToVerifyCount > 0) {
            alerts.push({
                id: "regulation-obligations-to-verify",
                title: "Obligations à vérifier",
                description: `${this.regulatoryObligationsToVerifyCount} obligation${this.regulatoryObligationsToVerifyCount > 1 ? "s demandent" : " demande"} une vérification simple.`,
                moduleLabel: "Réglementation",
                tone: "progress",
                priority: 2,
            });
        }
        if (this.isChantierEnabled && this.blockedWorksitesCount > 0) {
            alerts.push({
                id: "worksites-blocked",
                title: "Chantiers bloqués",
                description: `${this.blockedWorksitesCount} chantier${this.blockedWorksitesCount > 1 ? "s sont" : " est"} bloqué${this.blockedWorksitesCount > 1 ? "s" : ""} et nécessite${this.blockedWorksitesCount > 1 ? "nt" : ""} une action.`,
                moduleLabel: "Chantier",
                tone: "warning",
                priority: 1,
            });
        }
        else if (this.isChantierEnabled && this.plannedWorksitesCount > 0) {
            alerts.push({
                id: "worksites-planned",
                title: "Chantiers à préparer",
                description: `${this.plannedWorksitesCount} chantier${this.plannedWorksitesCount > 1 ? "s sont" : " est"} planifié${this.plannedWorksitesCount > 1 ? "s" : ""} et mérite${this.plannedWorksitesCount > 1 ? "nt" : ""} une préparation simple.`,
                moduleLabel: "Chantier",
                tone: "calm",
                priority: 3,
            });
        }
        return alerts
            .sort((left, right) => left.priority - right.priority || left.title.localeCompare(right.title))
            .slice(0, 6);
    }
    get dashboardKpis() {
        if (!this.cockpitSummary || this.cockpitSummary.kpis.length === 0) {
            return this.localDashboardKpis;
        }
        return this.cockpitSummary.kpis.map((kpi) => ({
            id: kpi.id,
            label: kpi.label,
            value: kpi.value,
            detail: kpi.detail,
            statusLabel: kpi.status_label,
            tone: this.mapCockpitTone(kpi.tone),
        }));
    }
    get dashboardAlerts() {
        if (!this.cockpitSummary || this.cockpitSummary.alerts.length === 0) {
            return this.localDashboardAlerts;
        }
        return this.cockpitSummary.alerts.map((alert) => ({
            id: alert.id,
            title: alert.title,
            description: alert.description,
            moduleLabel: alert.module_label,
            tone: this.mapCockpitTone(alert.tone),
            priority: alert.priority,
        }));
    }
    get dashboardEnterpriseOverviewCards() {
        if (!this.cockpitSummary || this.cockpitSummary.module_cards.length === 0) {
            return this.localDashboardEnterpriseOverviewCards;
        }
        return this.cockpitSummary.module_cards.map((card) => ({
            id: card.id,
            label: card.label,
            headline: card.headline,
            detail: card.detail,
            highlights: card.highlights.map((highlight) => ({
                id: highlight.id,
                label: highlight.label,
                value: highlight.value,
            })),
            statusLabel: card.status_label,
            tone: this.mapCockpitTone(card.tone),
        }));
    }
    get dashboardActions() {
        const actions = [];
        if (this.isFacturationEnabled) {
            for (const invoice of this.invoices) {
                if (invoice.status === "overdue") {
                    actions.push({
                        id: `invoice-overdue-${invoice.id}`,
                        module: "facturation",
                        priority: "high",
                        title: `Traiter la facture ${invoice.number}`,
                        description: `${invoice.customer_name} • reste dû ${this.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)}.`,
                        context: invoice.worksite_name ? `Chantier lié : ${invoice.worksite_name}` : null,
                    });
                }
                else if (invoice.outstanding_amount_cents > 0 && invoice.status === "issued") {
                    actions.push({
                        id: `invoice-issued-${invoice.id}`,
                        module: "facturation",
                        priority: invoice.follow_up_status === "to_follow_up" ? "medium" : "low",
                        title: `Suivre la facture ${invoice.number}`,
                        description: invoice.follow_up_status === "to_follow_up"
                            ? "Une relance simple est déjà identifiée."
                            : `Paiement en attente de ${this.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)}.`,
                        context: invoice.worksite_name ? `Chantier lié : ${invoice.worksite_name}` : null,
                    });
                }
            }
            for (const quote of this.quotes) {
                if (quote.follow_up_status === "to_follow_up") {
                    actions.push({
                        id: `quote-follow-up-${quote.id}`,
                        module: "facturation",
                        priority: "medium",
                        title: `Relancer le devis ${quote.number}`,
                        description: `${quote.customer_name} attend un retour ou une prise de contact simple.`,
                        context: quote.worksite_name ? `Chantier lié : ${quote.worksite_name}` : null,
                    });
                }
                else if (quote.status === "draft") {
                    actions.push({
                        id: `quote-draft-${quote.id}`,
                        module: "facturation",
                        priority: "low",
                        title: `Finaliser le devis ${quote.number}`,
                        description: "Le devis est encore en brouillon et peut être envoyé quand il est prêt.",
                        context: quote.worksite_name ? `Chantier lié : ${quote.worksite_name}` : null,
                    });
                }
            }
        }
        if (this.isReglementationEnabled) {
            for (const alert of this.buildingSafetyAlerts) {
                actions.push({
                    id: `building-safety-${alert.item_id}-${alert.alert_type}`,
                    module: "reglementation",
                    priority: alert.alert_type === "overdue" ? "high" : "medium",
                    title: alert.alert_type === "overdue"
                        ? `Mettre à jour ${alert.item_name}`
                        : `Anticiper ${alert.item_name}`,
                    description: alert.message,
                    context: `Site : ${alert.site_name}`,
                });
            }
            for (const obligation of this.regulatoryProfile?.applicable_obligations ?? []) {
                if (obligation.status === "compliant") {
                    continue;
                }
                const priority = obligation.status === "overdue"
                    ? "high"
                    : obligation.status === "to_verify"
                        ? "medium"
                        : "low";
                const titlePrefix = obligation.status === "overdue"
                    ? "Traiter"
                    : obligation.status === "to_verify"
                        ? "Vérifier"
                        : "Préparer";
                actions.push({
                    id: `obligation-${obligation.id}`,
                    module: "reglementation",
                    priority,
                    title: `${titlePrefix} ${obligation.title}`,
                    description: obligation.reason_summary,
                    context: `Priorité ${this.getObligationPriorityLabel(obligation.priority).toLowerCase()}`,
                });
            }
        }
        if (this.isChantierEnabled) {
            for (const worksite of this.billingWorksites) {
                if (worksite.status === "blocked") {
                    actions.push({
                        id: `worksite-blocked-${worksite.id}`,
                        module: "chantier",
                        priority: "high",
                        title: `Débloquer le chantier ${worksite.name}`,
                        description: "Le chantier est actuellement bloqué et demande une action terrain.",
                        context: worksite.client_name ? `Client : ${worksite.client_name}` : null,
                    });
                }
                else if (worksite.status === "planned") {
                    actions.push({
                        id: `worksite-planned-${worksite.id}`,
                        module: "chantier",
                        priority: "low",
                        title: `Préparer le chantier ${worksite.name}`,
                        description: "Le chantier est planifié et peut être préparé avant l’intervention.",
                        context: worksite.client_name ? `Client : ${worksite.client_name}` : null,
                    });
                }
            }
        }
        return actions.sort((left, right) => this.getDashboardActionPriorityRank(left.priority) - this.getDashboardActionPriorityRank(right.priority)
            || this.getDashboardActionModuleLabel(left.module).localeCompare(this.getDashboardActionModuleLabel(right.module))
            || left.title.localeCompare(right.title));
    }
    get filteredDashboardActions() {
        if (this.selectedDashboardActionModule === "all") {
            return this.dashboardActions;
        }
        return this.dashboardActions.filter((action) => action.module === this.selectedDashboardActionModule);
    }
    get dashboardActionCountLabel() {
        const visible = this.filteredDashboardActions.length;
        const total = this.dashboardActions.length;
        const actionLabel = visible > 1 ? "actions" : "action";
        if (total === 0
            && (this.homeUsedModuleCodes.some((moduleCode) => this.isModuleDataPending(moduleCode))
                || this.isReglementationDataDelayed)) {
            return "Actions en préparation";
        }
        if (this.selectedDashboardActionModule === "all") {
            return `${visible} ${actionLabel}`;
        }
        return `${visible} ${actionLabel} · ${this.getDashboardActionModuleLabel(this.selectedDashboardActionModule)}`;
    }
    get localDashboardEnterpriseOverviewCards() {
        const cards = [];
        if (this.isReglementationEnabled) {
            const activeDuerpEntriesCount = this.activeDuerpEntries.length;
            const regulationPending = this.isReglementationDataPending
                && !this.regulatoryProfile
                && this.buildingSafetyItems.length === 0
                && this.duerpEntries.length === 0;
            const regulationDelayed = !regulationPending && this.isReglementationDataDelayed;
            cards.push({
                id: "enterprise-reglementation",
                label: "Réglementation",
                headline: regulationPending
                    ? "Module actif"
                    : regulationDelayed
                        ? "Lecture partielle"
                        : this.regulatoryActionCount > 0
                            ? `${this.regulatoryActionCount} point${this.regulatoryActionCount > 1 ? "s" : ""} à revoir`
                            : "Lecture apaisée",
                detail: regulationPending
                    ? "Les premiers repères réglementaires arrivent. La session connaît déjà ce module."
                    : regulationDelayed
                        ? "Les données réglementaires mettent plus de temps à remonter. La lecture reste partielle sans bloquer le cockpit."
                        : this.regulatoryActionCount > 0
                            ? "Obligations, sécurité bâtiment et risques suivis ressortent dans une même lecture simple."
                            : "Le module reste lisible avec des repères courts sur les obligations et la prévention.",
                highlights: [
                    {
                        id: "reglementation-obligations",
                        label: "Obligations",
                        value: regulationPending
                            ? "Lecture en préparation"
                            : regulationDelayed
                                ? "Remontée plus lente"
                                : this.regulatoryObligationsToVerifyCount > 0 || this.overdueRegulatoryObligationCount > 0
                                    ? `${this.regulatoryObligationsToVerifyCount} à vérifier${this.overdueRegulatoryObligationCount > 0 ? ` · ${this.overdueRegulatoryObligationCount} en retard` : ""}`
                                    : "Aucune obligation à reprendre"
                    },
                    {
                        id: "reglementation-building-safety",
                        label: "Sécurité bâtiment",
                        value: regulationPending
                            ? "Lecture en préparation"
                            : regulationDelayed
                                ? "Remontée plus lente"
                                : this.buildingSafetyAlerts.length > 0 || this.globalBuildingSafetyOverdueCount > 0
                                    ? `${this.buildingSafetyAlerts.length} alerte${this.buildingSafetyAlerts.length > 1 ? "s" : ""}${this.globalBuildingSafetyOverdueCount > 0 ? ` · ${this.globalBuildingSafetyOverdueCount} contrôle${this.globalBuildingSafetyOverdueCount > 1 ? "s" : ""} en retard` : ""}`
                                    : "Aucun contrôle simple à revoir"
                    },
                    {
                        id: "reglementation-duerp",
                        label: "DUERP",
                        value: regulationPending
                            ? "Lecture en préparation"
                            : regulationDelayed
                                ? "Remontée plus lente"
                                : activeDuerpEntriesCount > 0
                                    ? `${activeDuerpEntriesCount} risque${activeDuerpEntriesCount > 1 ? "s" : ""} suivi${activeDuerpEntriesCount > 1 ? "s" : ""}`
                                    : "Aucun risque suivi pour le moment"
                    }
                ],
                statusLabel: regulationPending
                    ? "Préparation"
                    : regulationDelayed
                        ? "Partiel"
                        : this.globalBuildingSafetyOverdueCount > 0 || this.overdueRegulatoryObligationCount > 0
                            ? "À traiter"
                            : this.regulatoryActionCount > 0
                                ? "À vérifier"
                                : "À jour",
                tone: regulationPending
                    ? "calm"
                    : regulationDelayed
                        ? "progress"
                        : this.globalBuildingSafetyOverdueCount > 0 || this.overdueRegulatoryObligationCount > 0
                            ? "warning"
                            : this.regulatoryActionCount > 0
                                ? "progress"
                                : "success",
            });
        }
        if (this.isChantierEnabled) {
            const finalizedWorksiteDocumentsCount = this.worksiteDocuments.filter((document) => document.lifecycle_status === "finalized").length;
            const chantierPending = this.isChantierDataPending
                && this.billingWorksites.length === 0
                && this.worksiteDocuments.length === 0
                && this.worksiteProofs.length === 0
                && this.worksiteSignatures.length === 0;
            const linkedWorksiteSignaturesCount = this.worksiteDocuments.filter((document) => Boolean(document.linked_signature_id)).length;
            const linkedWorksiteProofsCount = this.worksiteDocuments.reduce((sum, document) => sum + document.linked_proofs.length, 0);
            cards.push({
                id: "enterprise-chantier",
                label: "Chantier",
                headline: chantierPending
                    ? "Module actif"
                    : this.billingWorksites.length > 0
                        ? `${this.billingWorksites.length} chantier${this.billingWorksites.length > 1 ? "s" : ""} suivi${this.billingWorksites.length > 1 ? "s" : ""}`
                        : "Aucun chantier",
                detail: chantierPending
                    ? "Les premiers repères chantier arrivent. La session connaît déjà ce module."
                    : this.billingWorksites.length > 0
                        ? "Statut terrain, documents chantier et repères liés restent regroupés ici."
                        : "Le module chantier pourra remonter ici ses signaux utiles.",
                highlights: [
                    {
                        id: "chantier-worksites",
                        label: "Actions terrain",
                        value: chantierPending
                            ? "Lecture en préparation"
                            : this.worksitesNeedingActionCount > 0
                                ? `${this.blockedWorksitesCount} bloqué${this.blockedWorksitesCount > 1 ? "s" : ""} · ${this.plannedWorksitesCount} à préparer`
                                : "Aucun signal terrain prioritaire"
                    },
                    {
                        id: "chantier-documents",
                        label: "Documents chantier",
                        value: chantierPending
                            ? "Lecture en préparation"
                            : this.worksiteDocuments.length > 0
                                ? `${this.worksiteDocuments.length} généré${this.worksiteDocuments.length > 1 ? "s" : ""} · ${finalizedWorksiteDocumentsCount} finalisé${finalizedWorksiteDocumentsCount > 1 ? "s" : ""}`
                                : "Aucun document chantier généré"
                    },
                    {
                        id: "chantier-links",
                        label: "Éléments liés",
                        value: chantierPending
                            ? "Lecture en préparation"
                            : linkedWorksiteSignaturesCount > 0 || linkedWorksiteProofsCount > 0
                                ? `${linkedWorksiteSignaturesCount} signature${linkedWorksiteSignaturesCount > 1 ? "s" : ""} · ${linkedWorksiteProofsCount} preuve${linkedWorksiteProofsCount > 1 ? "s" : ""}`
                                : "Aucune signature ou preuve liée"
                    }
                ],
                statusLabel: chantierPending
                    ? "Préparation"
                    : this.blockedWorksitesCount > 0
                        ? "À traiter"
                        : this.plannedWorksitesCount > 0
                            ? "À préparer"
                            : "À jour",
                tone: chantierPending
                    ? "calm"
                    : this.blockedWorksitesCount > 0
                        ? "warning"
                        : this.billingWorksites.length > 0 && this.plannedWorksitesCount > 0
                            ? "progress"
                            : "success",
            });
        }
        if (this.isFacturationEnabled) {
            const outstandingAmountCents = this.invoices.reduce((sum, invoice) => sum + invoice.outstanding_amount_cents, 0);
            const facturationPending = this.isFacturationDataPending
                && this.billingCustomers.length === 0
                && this.quotes.length === 0
                && this.invoices.length === 0;
            cards.push({
                id: "enterprise-facturation",
                label: "Facturation",
                headline: facturationPending
                    ? "Module actif"
                    : this.pendingInvoicesCount > 0
                        ? `${this.pendingInvoicesCount} facture${this.pendingInvoicesCount > 1 ? "s" : ""} à suivre`
                        : `${this.billingCustomers.length} client${this.billingCustomers.length > 1 ? "s" : ""} actif${this.billingCustomers.length > 1 ? "s" : ""}`,
                detail: facturationPending
                    ? "Les premiers repères facturation arrivent. La session connaît déjà ce module."
                    : this.pendingInvoicesCount > 0 || this.activeQuotesCount > 0 || this.quotesToFollowUpCount > 0
                        ? "Devis, factures et suivis utiles sont regroupés dans une lecture rapide."
                        : "Le module reste calme avec une lecture courte des clients et documents suivis.",
                highlights: [
                    {
                        id: "facturation-invoices",
                        label: "Factures",
                        value: facturationPending
                            ? "Lecture en préparation"
                            : this.pendingInvoicesCount > 0 || this.overdueInvoicesCount > 0
                                ? `${this.pendingInvoicesCount} en attente${this.overdueInvoicesCount > 0 ? ` · ${this.overdueInvoicesCount} en retard` : ""}`
                                : "Aucune facture à suivre"
                    },
                    {
                        id: "facturation-quotes",
                        label: "Devis",
                        value: facturationPending
                            ? "Lecture en préparation"
                            : this.activeQuotesCount > 0 || this.quotesToFollowUpCount > 0
                                ? `${this.activeQuotesCount} en cours${this.quotesToFollowUpCount > 0 ? ` · ${this.quotesToFollowUpCount} à relancer` : ""}`
                                : "Aucun devis en cours"
                    },
                    {
                        id: "facturation-cash",
                        label: "Encaissement",
                        value: facturationPending
                            ? "Lecture en préparation"
                            : outstandingAmountCents > 0
                                ? `${this.formatAmountCents(outstandingAmountCents)} en attente`
                                : `${this.billingCustomers.length} client${this.billingCustomers.length > 1 ? "s" : ""} suivi${this.billingCustomers.length > 1 ? "s" : ""}`
                    }
                ],
                statusLabel: facturationPending
                    ? "Préparation"
                    : this.overdueInvoicesCount > 0
                        ? "À traiter"
                        : this.pendingInvoicesCount > 0 || this.quotesToFollowUpCount > 0
                            ? "À suivre"
                            : "À jour",
                tone: facturationPending
                    ? "calm"
                    : this.overdueInvoicesCount > 0
                        ? "warning"
                        : this.pendingInvoicesCount > 0 || this.quotesToFollowUpCount > 0
                            ? "progress"
                            : "success",
            });
        }
        return cards;
    }
    get dashboardWorksiteOverviewItems() {
        if (!this.isChantierEnabled) {
            return [];
        }
        return this.billingWorksites
            .map((worksite) => {
            const worksiteDocuments = this.worksiteDocuments.filter((document) => document.worksite_id === worksite.id);
            const worksiteQuotes = this.quotes.filter((quote) => quote.worksite_id === worksite.id);
            const worksiteInvoices = this.invoices.filter((invoice) => invoice.worksite_id === worksite.id);
            const overdueInvoices = worksiteInvoices.filter((invoice) => invoice.status === "overdue").length;
            const pendingInvoices = worksiteInvoices.filter((invoice) => invoice.outstanding_amount_cents > 0).length;
            const draftQuotes = worksiteQuotes.filter((quote) => quote.status === "draft").length;
            const quotesToFollowUp = worksiteQuotes.filter((quote) => quote.follow_up_status === "to_follow_up").length;
            const outstandingAmountCents = worksiteInvoices.reduce((sum, invoice) => sum + invoice.outstanding_amount_cents, 0);
            const plannedLabel = this.formatCompactDate(worksite.planned_for);
            const updatedLabel = this.formatCompactDate(worksite.updated_at);
            const linkedQuotesSummary = this.isFacturationEnabled
                ? this.formatDashboardDocumentSummary("Devis liés", worksiteQuotes.map((quote) => `${quote.number} (${this.getQuoteStatusLabel(quote.status)})`), "aucun")
                : "Devis liés : module Facturation non activé.";
            const linkedWorksiteDocumentsSummary = this.formatDashboardDocumentSummary("Documents chantier", worksiteDocuments.map((document) => {
                const uploadedLabel = this.formatCompactDate(document.uploaded_at);
                const lifecycleLabel = this.getWorksiteDocumentLifecycleStatusLabel(document.lifecycle_status);
                return uploadedLabel
                    ? `${document.document_type_label} (${lifecycleLabel}, ${uploadedLabel})`
                    : `${document.document_type_label} (${lifecycleLabel})`;
            }), "aucun document généré");
            const linkedInvoicesSummary = this.isFacturationEnabled
                ? this.formatDashboardDocumentSummary("Factures liées", worksiteInvoices.map((invoice) => `${invoice.number} (${this.getInvoiceStatusLabel(invoice.status)})`), "aucune")
                : "Factures liées : module Facturation non activé.";
            const taskParts = [];
            const financialParts = [];
            const signalLabel = worksite.status === "blocked" || overdueInvoices > 0
                ? "À traiter"
                : worksite.status === "planned" || pendingInvoices > 0 || draftQuotes > 0
                    ? "À suivre"
                    : "Rien à signaler";
            const signalTone = signalLabel === "À traiter"
                ? "warning"
                : signalLabel === "À suivre"
                    ? "progress"
                    : "success";
            const operationalParts = [worksite.client_name];
            if (worksite.address) {
                operationalParts.push(worksite.address);
            }
            if (worksite.status === "blocked") {
                taskParts.push("chantier bloqué");
            }
            else if (worksite.status === "planned") {
                taskParts.push("préparation avant intervention");
            }
            if (overdueInvoices > 0) {
                taskParts.push(`${overdueInvoices} facture${overdueInvoices > 1 ? "s" : ""} en retard`);
            }
            else if (pendingInvoices > 0) {
                taskParts.push(`${pendingInvoices} facture${pendingInvoices > 1 ? "s" : ""} à suivre`);
            }
            if (draftQuotes > 0) {
                taskParts.push(`${draftQuotes} devis en brouillon`);
            }
            if (quotesToFollowUp > 0) {
                taskParts.push(`${quotesToFollowUp} devis à relancer`);
            }
            if (pendingInvoices > 0) {
                financialParts.push(`${this.formatAmountCents(outstandingAmountCents)} en attente`);
            }
            if (overdueInvoices > 0) {
                financialParts.push(`${overdueInvoices} facture${overdueInvoices > 1 ? "s" : ""} en retard`);
            }
            if (quotesToFollowUp > 0) {
                financialParts.push(`${quotesToFollowUp} devis à relancer`);
            }
            return {
                id: worksite.id,
                name: worksite.name,
                summary: this.isFacturationEnabled
                    ? `${operationalParts.join(" · ")} · ${worksiteQuotes.length} devis · ${worksiteInvoices.length} facture${worksiteInvoices.length > 1 ? "s" : ""}`
                    : operationalParts.join(" · "),
                operationalSummary: plannedLabel
                    ? `Prévu le ${plannedLabel}${updatedLabel ? ` · mis à jour le ${updatedLabel}` : ""}.`
                    : updatedLabel
                        ? `Mis à jour le ${updatedLabel}.`
                        : "Lecture chantier disponible.",
                taskSummary: taskParts.length > 0
                    ? `Points à traiter : ${taskParts.join(", ")}.`
                    : "Points à traiter : aucun signal immédiat.",
                worksiteDocuments: worksiteDocuments.map((document) => this.mapDashboardWorksiteDocumentItem(document)),
                coordination: this.buildDashboardCoordinationState(worksite.coordination),
                linkedWorksiteDocumentsSummary,
                linkedQuotesSummary,
                linkedInvoicesSummary,
                worksiteDocumentsCount: worksiteDocuments.length,
                financialSummary: this.isFacturationEnabled
                    ? financialParts.length > 0
                        ? `Signal financier : ${financialParts.join(", ")}.`
                        : "Signal financier : aucun point simple à remonter."
                    : null,
                regulatorySummary: null,
                statusLabel: this.getWorksiteStatusLabel(worksite.status),
                statusTone: this.getWorksiteStatusTone(worksite.status),
                signalLabel,
                signalTone,
            };
        })
            .sort((left, right) => this.getDashboardOverviewSignalRank(left.signalLabel) - this.getDashboardOverviewSignalRank(right.signalLabel)
            || left.name.localeCompare(right.name));
    }
    get dashboardCustomerOverviewItems() {
        if (!this.isFacturationEnabled) {
            return [];
        }
        return this.billingCustomers
            .map((customer) => {
            const customerQuotes = this.quotes.filter((quote) => quote.customer_id === customer.id);
            const customerInvoices = this.invoices.filter((invoice) => invoice.customer_id === customer.id);
            const overdueInvoices = customerInvoices.filter((invoice) => invoice.status === "overdue").length;
            const pendingInvoices = customerInvoices.filter((invoice) => invoice.outstanding_amount_cents > 0).length;
            const quotesToFollowUp = customerQuotes.filter((quote) => quote.follow_up_status === "to_follow_up").length;
            const outstandingAmountCents = customerInvoices.reduce((sum, invoice) => sum + invoice.outstanding_amount_cents, 0);
            const signalLabel = overdueInvoices > 0
                ? "À traiter"
                : pendingInvoices > 0 || quotesToFollowUp > 0
                    ? "À suivre"
                    : "Rien à signaler";
            const signalTone = signalLabel === "À traiter"
                ? "warning"
                : signalLabel === "À suivre"
                    ? "progress"
                    : "success";
            const statusTone = overdueInvoices > 0
                ? "warning"
                : pendingInvoices > 0 || quotesToFollowUp > 0
                    ? "progress"
                    : "neutral";
            const contextParts = [];
            if (overdueInvoices > 0) {
                contextParts.push(`${overdueInvoices} facture${overdueInvoices > 1 ? "s" : ""} en retard.`);
            }
            else if (pendingInvoices > 0) {
                contextParts.push(`${this.formatAmountCents(outstandingAmountCents)} en attente.`);
            }
            if (quotesToFollowUp > 0) {
                contextParts.push(`${quotesToFollowUp} devis à relancer.`);
            }
            if (contextParts.length === 0) {
                contextParts.push("Suivi commercial à jour.");
            }
            return {
                id: customer.id,
                name: customer.name,
                summary: `${this.getCustomerTypeLabel(customer.customer_type)} · ${customerQuotes.length} devis · ${customerInvoices.length} facture${customerInvoices.length > 1 ? "s" : ""}`,
                context: contextParts.join(" "),
                statusLabel: pendingInvoices > 0 || quotesToFollowUp > 0
                    ? "À suivre"
                    : customerQuotes.length > 0 || customerInvoices.length > 0
                        ? "Suivi normal"
                        : "À jour",
                statusTone,
                signalLabel,
                signalTone,
            };
        })
            .sort((left, right) => this.getDashboardOverviewSignalRank(left.signalLabel) - this.getDashboardOverviewSignalRank(right.signalLabel)
            || left.name.localeCompare(right.name));
    }
    get canCreateQuote() {
        return Boolean(this.quoteForm.customerId && this.hasValidBillingLines(this.quoteForm.lines));
    }
    get canSaveQuoteEdit() {
        return Boolean(this.quoteEditForm.customerId && this.hasValidBillingLines(this.quoteEditForm.lines));
    }
    get canCreateInvoice() {
        return Boolean(this.invoiceForm.customerId && this.hasValidBillingLines(this.invoiceForm.lines));
    }
    get canSaveInvoiceEdit() {
        return Boolean(this.invoiceEditForm.customerId && this.hasValidBillingLines(this.invoiceEditForm.lines));
    }
    get hasQuoteDraft() {
        return this.isMeaningfulQuoteDraft(this.quoteForm);
    }
    get hasInvoiceDraft() {
        return this.isMeaningfulInvoiceDraft(this.invoiceForm);
    }
    get quoteFormTotalCents() {
        return this.computeBillingFormTotalCents(this.quoteForm.lines);
    }
    get invoiceFormTotalCents() {
        return this.computeBillingFormTotalCents(this.invoiceForm.lines);
    }
    get quoteEditFormTotalCents() {
        return this.computeBillingFormTotalCents(this.quoteEditForm.lines);
    }
    get invoiceEditFormTotalCents() {
        return this.computeBillingFormTotalCents(this.invoiceEditForm.lines);
    }
    getQuoteHistory(quoteId) {
        return this.quoteHistoryById[quoteId] ?? [];
    }
    getInvoiceHistory(invoiceId) {
        return this.invoiceHistoryById[invoiceId] ?? [];
    }
    getBillingHistoryLabel(log) {
        if (log.target_type === "quote") {
            if (log.action_type === "create") {
                return "Devis créé";
            }
            if (log.action_type === "update") {
                const nextFollowUpStatus = this.getAuditChangeValue(log, "follow_up_status", "to");
                if (this.isBillingFollowUpStatus(nextFollowUpStatus)) {
                    return `Suivi passé à ${this.getBillingFollowUpStatusLabel(nextFollowUpStatus)}`;
                }
            }
            if (log.action_type === "status_change") {
                const nextStatus = this.getAuditChangeValue(log, "status", "to");
                if (this.isQuoteStatus(nextStatus)) {
                    return `Statut passé à ${this.getQuoteStatusLabel(nextStatus)}`;
                }
                return "Statut du devis mis à jour";
            }
            return "Devis mis à jour";
        }
        if (log.target_type === "quote_worksite_link") {
            const previousName = this.getAuditChangeValue(log, "worksite_name", "from");
            const nextName = this.getAuditChangeValue(log, "worksite_name", "to");
            if (typeof nextName === "string" && typeof previousName === "string" && previousName !== nextName) {
                return `Chantier lié mis à jour : ${nextName}`;
            }
            if (typeof nextName === "string") {
                return `Chantier lié : ${nextName}`;
            }
            return "Chantier retiré";
        }
        if (log.target_type === "invoice") {
            if (log.action_type === "create") {
                const sourceQuoteNumber = this.getAuditScalarValue(log, "source_quote_number");
                if (typeof sourceQuoteNumber === "string") {
                    return `Facture créée depuis ${sourceQuoteNumber}`;
                }
                return "Facture créée";
            }
            if (log.action_type === "update") {
                const nextFollowUpStatus = this.getAuditChangeValue(log, "follow_up_status", "to");
                if (this.isBillingFollowUpStatus(nextFollowUpStatus)) {
                    return `Suivi passé à ${this.getBillingFollowUpStatusLabel(nextFollowUpStatus)}`;
                }
            }
            if (log.action_type === "status_change") {
                const nextStatus = this.getAuditChangeValue(log, "status", "to");
                if (this.isInvoiceStatus(nextStatus)) {
                    return `Statut passé à ${this.getInvoiceStatusLabel(nextStatus)}`;
                }
                return "Statut de la facture mis à jour";
            }
            return "Facture mise à jour";
        }
        if (log.target_type === "invoice_payment") {
            const paidAmountCents = this.getAuditChangeValue(log, "paid_amount_cents", "to");
            if (typeof paidAmountCents === "number") {
                return `Paiement enregistré : ${this.formatAmountCents(paidAmountCents)}`;
            }
            return "Paiement enregistré";
        }
        if (log.target_type === "invoice_worksite_link") {
            const previousName = this.getAuditChangeValue(log, "worksite_name", "from");
            const nextName = this.getAuditChangeValue(log, "worksite_name", "to");
            if (typeof nextName === "string" && typeof previousName === "string" && previousName !== nextName) {
                return `Chantier lié mis à jour : ${nextName}`;
            }
            if (typeof nextName === "string") {
                return `Chantier lié : ${nextName}`;
            }
            return "Chantier retiré";
        }
        return "Événement enregistré";
    }
    getBillingHistoryMeta(log) {
        if (log.target_display) {
            return `Par ${log.actor_label} • ${log.target_display}`;
        }
        return `Par ${log.actor_label}`;
    }
    get activeOrganizationSites() {
        return this.organizationSites.filter((site) => site.status === "active");
    }
    get regulatoryAllSites() {
        const siteMap = new Map();
        const declaredSiteById = new Map(this.organizationSites.map((site) => [site.id, site]));
        const declaredSiteBySignature = new Map(this.organizationSites.map((site) => [this.getRegulatorySiteDedupKey(null, site.name, site.address), site]));
        const addSiteReference = (sourceKind, siteId, name, address = null) => {
            const trimmedName = name?.trim() ?? "";
            const declaredSite = ((siteId ? declaredSiteById.get(siteId) : undefined)
                ?? declaredSiteBySignature.get(this.getRegulatorySiteDedupKey(null, trimmedName, address))
                ?? null);
            const effectiveSiteId = siteId ?? declaredSite?.id ?? null;
            const effectiveName = trimmedName || (declaredSite?.name ?? "");
            const effectiveAddress = address?.trim() || declaredSite?.address || null;
            const dedupKey = this.getRegulatorySiteDedupKey(effectiveSiteId, effectiveName, effectiveAddress);
            if (!dedupKey || !effectiveName) {
                return;
            }
            const existing = siteMap.get(dedupKey);
            siteMap.set(dedupKey, {
                key: dedupKey,
                siteId: effectiveSiteId,
                name: effectiveName,
                address: effectiveAddress,
                declaredSite: declaredSite ?? existing?.declaredSite ?? null,
                sourceKinds: existing
                    ? Array.from(new Set([...existing.sourceKinds, sourceKind]))
                    : [sourceKind],
            });
        };
        for (const site of this.organizationSites) {
            addSiteReference("declared", site.id, site.name, site.address);
        }
        for (const entry of this.activeDuerpEntries) {
            addSiteReference("duerp", entry.site_id, entry.site_name);
        }
        for (const item of this.buildingSafetyItems.filter((entry) => entry.status === "active")) {
            addSiteReference("building_safety", item.site_id, item.site_name);
        }
        for (const evidence of this.regulatoryEvidences.filter((entry) => entry.status !== "archived")) {
            if (evidence.link_kind === "site") {
                addSiteReference("evidence", evidence.site_id, evidence.link_label);
                continue;
            }
            if (evidence.building_safety_item_id) {
                const linkedSafetyItem = this.buildingSafetyItems.find((item) => item.id === evidence.building_safety_item_id);
                if (linkedSafetyItem) {
                    addSiteReference("evidence", linkedSafetyItem.site_id, linkedSafetyItem.site_name);
                    continue;
                }
            }
            if (evidence.duerp_entry_id) {
                const linkedDuerpEntry = this.duerpEntries.find((entry) => entry.id === evidence.duerp_entry_id);
                if (linkedDuerpEntry) {
                    addSiteReference("evidence", linkedDuerpEntry.site_id, linkedDuerpEntry.site_name);
                    continue;
                }
            }
            if (evidence.site_id) {
                addSiteReference("evidence", evidence.site_id, evidence.link_label);
            }
        }
        return [...siteMap.values()].sort((left, right) => {
            const declaredRank = Number(Boolean(right.declaredSite)) - Number(Boolean(left.declaredSite));
            if (declaredRank !== 0) {
                return declaredRank;
            }
            return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
        });
    }
    get canCreateBuildingSafetyItem() {
        return Boolean(this.buildingSafetyForm.siteId
            && this.buildingSafetyForm.name.trim()
            && this.buildingSafetyForm.nextDueDate);
    }
    get isBuildingSafetyEditing() {
        return this.buildingSafetyEditingId !== null;
    }
    get filteredBuildingSafetyItems() {
        if (this.selectedSafetySiteId === "all") {
            return this.buildingSafetyItems;
        }
        return this.buildingSafetyItems.filter((item) => item.site_id === this.selectedSafetySiteId);
    }
    get filteredBuildingSafetyAlerts() {
        if (this.selectedSafetySiteId === "all") {
            return this.buildingSafetyAlerts;
        }
        return this.buildingSafetyAlerts.filter((item) => item.site_id === this.selectedSafetySiteId);
    }
    get canSaveDuerpEntry() {
        return Boolean(this.duerpForm.workUnitName.trim() && this.duerpForm.riskLabel.trim());
    }
    get filteredDuerpEntries() {
        if (this.selectedSafetySiteId === "all") {
            return this.duerpEntries;
        }
        return this.duerpEntries.filter((entry) => entry.site_id === null || entry.site_id === this.selectedSafetySiteId);
    }
    get activeBuildingSafetyItems() {
        return this.buildingSafetyItems.filter((item) => item.status === "active");
    }
    get selectableBuildingSafetyItems() {
        if (this.selectedSafetySiteId === "all") {
            return this.activeBuildingSafetyItems;
        }
        return this.activeBuildingSafetyItems.filter((item) => item.site_id === this.selectedSafetySiteId);
    }
    get activeDuerpEntries() {
        return this.duerpEntries.filter((entry) => entry.status === "active");
    }
    get selectableDuerpEntries() {
        if (this.selectedSafetySiteId === "all") {
            return this.activeDuerpEntries;
        }
        return this.activeDuerpEntries.filter((entry) => entry.site_id === null || entry.site_id === this.selectedSafetySiteId);
    }
    get filteredRegulatoryEvidences() {
        if (this.selectedSafetySiteId === "all") {
            return this.regulatoryEvidences;
        }
        return this.regulatoryEvidences.filter((evidence) => evidence.site_id === null || evidence.site_id === this.selectedSafetySiteId);
    }
    get regulatoryObligations() {
        return this.regulatoryProfile?.applicable_obligations ?? [];
    }
    get regulatoryEvidenceAvailableCount() {
        return this.regulatoryEvidences.filter((evidence) => evidence.status === "available").length;
    }
    get regulatoryEvidenceCoverageCount() {
        const coveredObligations = new Set(this.regulatoryEvidences
            .filter((evidence) => evidence.status === "available" && evidence.obligation_id)
            .map((evidence) => evidence.obligation_id));
        return coveredObligations.size;
    }
    get regulatoryComplianceScore() {
        const obligations = this.regulatoryObligations;
        const hasHighRiskWork = this.getRegulatoryBooleanCriterion("performs_high_risk_work") === true;
        const weights = {
            compliant: 1,
            in_progress: 0.72,
            to_complete: 0.42,
            to_verify: 0.24,
            overdue: 0.08,
        };
        let score = obligations.length > 0
            ? (obligations.reduce((total, obligation) => total + weights[obligation.status], 0) / obligations.length) * 100
            : this.regulatoryProfile?.profile_status === "ready"
                ? 58
                : 34;
        if (this.regulatoryProfile?.profile_status !== "ready") {
            score -= 10;
        }
        if (this.regulatoryEvidenceAvailableCount === 0) {
            score -= 8;
        }
        else if (this.regulatoryEvidenceCoverageCount > 0) {
            score += 4;
        }
        const siteInsight = this.getRegulatorySiteInsight();
        if (siteInsight.tone === "warning") {
            score -= 8;
        }
        else if (siteInsight.tone === "progress") {
            score -= 4;
        }
        else if (siteInsight.tone === "success") {
            score += 3;
        }
        if (this.globalBuildingSafetyOverdueCount > 0) {
            score -= 6;
        }
        if (hasHighRiskWork && this.activeDuerpEntries.length === 0) {
            score -= 6;
        }
        else if (this.activeDuerpEntries.length > 0) {
            score += 2;
        }
        return Math.max(18, Math.min(96, Math.round(score)));
    }
    get regulatoryScoreDrivers() {
        const missingProfileItems = this.regulatoryProfile?.missing_profile_items ?? [];
        const profileReady = this.regulatoryProfile?.profile_status === "ready" && !this.isOnboardingPending;
        const siteInsight = this.getRegulatorySiteInsight();
        const allSites = this.regulatoryAllSites;
        const activeDeclaredSites = this.activeOrganizationSites;
        const inferredOnlySites = allSites.filter((site) => !site.declaredSite);
        const problematicSite = this.getProblematicRegulatorySite();
        const problematicSiteState = problematicSite ? this.getSiteEnrichmentUiState(problematicSite) : null;
        const highRiskWork = this.getRegulatoryBooleanCriterion("performs_high_risk_work") === true;
        const highestSeverityEntry = this.getHighestPriorityDuerpEntry();
        const nextEvidenceGap = this.getNextEvidenceGapObligation();
        const highSeverityCount = this.activeDuerpEntries.filter((entry) => entry.severity === "high").length;
        return [
            {
                id: "profile",
                label: "Profil",
                detail: profileReady
                    ? "Base entreprise exploitable."
                    : missingProfileItems.length > 0
                        ? `Il manque encore ${missingProfileItems.slice(0, 2).join(", ")}.`
                        : "Les informations de base restent à compléter.",
                statusLabel: profileReady ? "Exploitable" : "À compléter",
                tone: profileReady ? "success" : "progress",
            },
            {
                id: "sites",
                label: "Sites",
                detail: allSites.length === 0
                    ? "Aucun site utile n'est encore déclaré."
                    : problematicSite && problematicSiteState
                        ? `${problematicSite.name} ${problematicSiteState.reasonLabel ? `: ${problematicSiteState.reasonLabel.toLowerCase()}.` : "reste à consolider."}`
                        : activeDeclaredSites.length === 0
                            ? `${allSites.length} site${allSites.length > 1 ? "s sont" : " est"} déjà suivi${allSites.length > 1 ? "s" : ""} dans le module.`
                            : inferredOnlySites.length > 0
                                ? `${allSites.length} site${allSites.length > 1 ? "s sont" : " est"} visible${allSites.length > 1 ? "s" : ""}, dont ${inferredOnlySites.length} encore à consolider.`
                                : `${activeDeclaredSites.length} site${activeDeclaredSites.length > 1 ? "s sont" : " est"} déjà exploitable${activeDeclaredSites.length > 1 ? "s" : ""}.`,
                statusLabel: allSites.length === 0
                    ? "À lancer"
                    : activeDeclaredSites.length === 0
                        ? "Suivis"
                        : problematicSiteState?.label ?? siteInsight.label ?? "Prêts",
                tone: allSites.length === 0
                    ? "progress"
                    : activeDeclaredSites.length === 0
                        ? "calm"
                        : problematicSiteState?.tone ?? siteInsight.tone,
            },
            {
                id: "duerp",
                label: "DUERP",
                detail: this.activeDuerpEntries.length === 0
                    ? highRiskWork
                        ? "Aucun risque actif n'est encore consigné."
                        : "Aucun risque actif remonté pour le moment."
                    : highSeverityCount > 0
                        ? `${highestSeverityEntry?.work_unit_name ?? "Le DUERP"} reste à consolider et à prouver.`
                        : "Le DUERP existe déjà et peut être enrichi progressivement.",
                statusLabel: this.activeDuerpEntries.length === 0
                    ? (highRiskWork ? "À ouvrir" : "Calme")
                    : highSeverityCount > 0
                        ? `${highSeverityCount} risque${highSeverityCount > 1 ? "s" : ""}`
                        : `${this.activeDuerpEntries.length} suivi${this.activeDuerpEntries.length > 1 ? "s" : ""}`,
                tone: this.activeDuerpEntries.length === 0
                    ? (highRiskWork ? "progress" : "neutral")
                    : highSeverityCount > 0
                        ? "warning"
                        : "progress",
            },
            {
                id: "proofs",
                label: "Preuves",
                detail: this.regulatoryEvidenceAvailableCount === 0
                    ? nextEvidenceGap
                        ? `La prochaine pièce utile concerne ${nextEvidenceGap.title.toLowerCase()}.`
                        : "Aucune preuve n'est encore rattachée."
                    : nextEvidenceGap
                        ? `La prochaine pièce utile concerne ${nextEvidenceGap.title.toLowerCase()}.`
                        : "Les preuves disponibles rendent déjà la conformité démontrable.",
                statusLabel: this.regulatoryEvidenceAvailableCount === 0
                    ? "À lancer"
                    : nextEvidenceGap
                        ? (this.regulatoryEvidenceCoverageCount > 0
                            ? `${this.regulatoryEvidenceCoverageCount} couverte${this.regulatoryEvidenceCoverageCount > 1 ? "s" : ""}`
                            : "Partielles")
                        : `${this.regulatoryEvidenceAvailableCount} prête${this.regulatoryEvidenceAvailableCount > 1 ? "s" : ""}`,
                tone: this.regulatoryEvidenceAvailableCount === 0
                    ? "progress"
                    : nextEvidenceGap
                        ? (this.regulatoryEvidenceCoverageCount > 0 ? "calm" : "progress")
                        : "success",
            },
        ];
    }
    get regulatoryRecommendedActionsSummary() {
        if (this.regulatoryRecommendedActions.length === 0) {
            return "Le module est déjà bien cadré pour le moment.";
        }
        const hasSiteAction = this.regulatoryRecommendedActions.some((action) => action.actionKind === "site_enrichment" || action.sectionId === "reg-sites-section");
        const hasDuerpAction = this.regulatoryRecommendedActions.some((action) => action.sectionId === "reg-duerp-section");
        const hasEvidenceAction = this.regulatoryRecommendedActions.some((action) => action.sectionId === "reg-evidence-section");
        if (hasSiteAction && hasDuerpAction && hasEvidenceAction) {
            return "Les prochaines actions relient directement les sites, le DUERP et les preuves.";
        }
        if (hasSiteAction && hasEvidenceAction) {
            return "Les prochaines actions portent à la fois sur le terrain et sur la preuve.";
        }
        return "Chaque action ci-dessous pointe vers un bloc concret du module, sans détour inutile.";
    }
    get regulatoryProofSupportSummary() {
        const nextEvidenceGap = this.getNextEvidenceGapObligation();
        if (this.regulatoryEvidenceAvailableCount === 0) {
            return nextEvidenceGap
                ? `Commencez par une première pièce simple pour ${nextEvidenceGap.title.toLowerCase()}.`
                : "Commencez par une première pièce simple pour rendre la conformité démontrable.";
        }
        if (nextEvidenceGap) {
            return `${this.regulatoryEvidenceAvailableCount} pièce${this.regulatoryEvidenceAvailableCount > 1 ? "s sont" : " est"} déjà prête${this.regulatoryEvidenceAvailableCount > 1 ? "s" : ""}. La prochaine preuve utile concerne ${nextEvidenceGap.title.toLowerCase()}.`;
        }
        return this.regulatoryEvidenceAvailableCount > 1
            ? `${this.regulatoryEvidenceAvailableCount} pièces soutiennent déjà les sujets visibles du module.`
            : "1 pièce soutient déjà les sujets visibles du module.";
    }
    get regulatoryShowcaseSummary() {
        const siteInsight = this.getRegulatorySiteInsight();
        const priorityCount = this.overdueRegulatoryObligationCount + this.globalBuildingSafetyOverdueCount;
        const profileIncomplete = this.regulatoryProfile?.profile_status !== "ready" || this.isOnboardingPending;
        const siteNeedsAttention = siteInsight.tone === "warning" || siteInsight.tone === "progress";
        const hasAnySite = this.regulatoryAllSites.length > 0;
        const hasVerification = this.regulatoryObligationsToVerifyCount > 0;
        const allCompliant = this.regulatoryObligations.length > 0
            && this.regulatoryObligations.every((obligation) => obligation.status === "compliant");
        let statusLabel = "À compléter";
        let tone = "progress";
        let headline = "Le socle réglementaire prend forme.";
        let summary = "Le module vous aide à cadrer vos obligations, vos sites et vos preuves sans lecture juridique lourde.";
        let context = "Commencez par les trois priorités du moment pour faire monter la qualité de conformité rapidement.";
        let scoreSummary = "Le score combine le profil, les sites, le DUERP, les preuves et les sujets encore ouverts.";
        if (priorityCount > 0) {
            statusLabel = "Prioritaire";
            tone = "warning";
            headline = "Des sujets demandent une action rapide.";
            summary = "Le copilote détecte des points réglementaires ou bâtiment qui doivent être repris en premier.";
            context = "Traitez d’abord les sujets prioritaires puis rattachez une preuve simple pour refermer la boucle.";
            scoreSummary = "Le score reste pénalisé tant que les sujets prioritaires, les contrôles en retard ou les preuves manquantes restent ouverts.";
        }
        else if (profileIncomplete || !hasAnySite) {
            statusLabel = "À compléter";
            tone = "progress";
            headline = "La base est en cours de construction.";
            summary = "Le module a déjà identifié les premiers sujets, mais le socle reste encore trop partiel pour être pleinement fiable.";
            context = "Commencez par le profil, puis ancrez la lecture sur un site utile et une première preuve.";
            scoreSummary = "Le score remonte surtout quand le profil, les sites, le DUERP et les premières preuves deviennent exploitables.";
        }
        else if (siteNeedsAttention || hasVerification) {
            statusLabel = "À vérifier";
            tone = "warning";
            headline = "La situation est lisible, mais quelques vérifications restent à faire.";
            summary = "Le périmètre est posé, avec des points encore partiels ou à confirmer avant de pouvoir le considérer comme propre.";
            context = "Une relance d’enrichissement, une vérification courte ou une preuve ajoutée suffisent souvent à débloquer la suite.";
            scoreSummary = "Le score reflète un socle déjà exploitable, avec quelques points encore partiels sur les sites, le DUERP ou les preuves.";
        }
        else if (allCompliant && this.regulatoryEvidenceAvailableCount > 0) {
            statusLabel = "Conforme";
            tone = "success";
            headline = "La situation réglementaire est bien cadrée.";
            summary = "Les obligations visibles sont couvertes, les preuves sont présentes et le module devient une base solide de démonstration.";
            context = "Gardez le rythme sur les contrôles périodiques et les pièces justificatives pour conserver cet état.";
            scoreSummary = "Le score reflète un socle cohérent, démontrable et crédible pour une démo produit.";
        }
        return {
            statusLabel,
            tone,
            headline,
            summary,
            context,
            scoreSummary,
            profileLabel: this.regulatoryProfile?.profile_status === "ready" && !this.isOnboardingPending
                ? "Profil exploitable"
                : "Profil à compléter",
            profileTone: this.regulatoryProfile?.profile_status === "ready" && !this.isOnboardingPending
                ? "success"
                : "progress",
            siteLabel: siteInsight.label,
            siteTone: siteInsight.tone,
        };
    }
    get regulatoryPriorityItems() {
        return this.buildRegulatoryPriorityCandidates()
            .sort((left, right) => left.rank - right.rank || left.title.localeCompare(right.title))
            .slice(0, 3);
    }
    get topRegulatoryPriority() {
        return this.regulatoryPriorityItems[0] ?? null;
    }
    get regulatoryFamilyCards() {
        const categories = ["company", "employees", "safety", "buildings"];
        return categories.map((category) => {
            const obligations = this.regulatoryObligations.filter((obligation) => obligation.category === category);
            const evidenceCount = this.regulatoryEvidences.filter((evidence) => obligations.some((obligation) => obligation.id === evidence.obligation_id)).length;
            const overdueCount = obligations.filter((obligation) => obligation.status === "overdue").length;
            const verifyCount = obligations.filter((obligation) => obligation.status === "to_verify").length;
            const compliantCount = obligations.filter((obligation) => obligation.status === "compliant").length;
            const referenceObligation = [...obligations].sort((left, right) => this.getRegulatoryObligationRank(left) - this.getRegulatoryObligationRank(right))[0] ?? null;
            let statusLabel = "Aucun sujet";
            let tone = "neutral";
            let detail = this.getRegulatoryFamilyEmptyDetail(category);
            let actionLabel = "Compléter le profil";
            let actionKind = "scroll";
            let sectionId = "reg-profile-section";
            let obligationId = null;
            let siteId = null;
            if (referenceObligation) {
                const action = this.getRegulatoryObligationAction(referenceObligation, evidenceCount);
                statusLabel = referenceObligation.status === "overdue"
                    ? "Prioritaire"
                    : this.getComplianceStatusLabel(referenceObligation.status);
                tone = referenceObligation.status === "overdue"
                    ? "warning"
                    : this.getComplianceStatusTone(referenceObligation.status);
                actionLabel = action.actionLabel;
                actionKind = action.actionKind;
                sectionId = action.sectionId;
                obligationId = action.obligationId;
                siteId = action.siteId;
                if (overdueCount > 0) {
                    detail = `${overdueCount} sujet${overdueCount > 1 ? "s" : ""} demande${overdueCount > 1 ? "nt" : ""} une action rapide dans cette famille.`;
                }
                else if (verifyCount > 0) {
                    detail = `${verifyCount} point${verifyCount > 1 ? "s" : ""} mérite${verifyCount > 1 ? "nt" : ""} encore une vérification courte.`;
                }
                else if (compliantCount === obligations.length) {
                    detail = "La famille est cadrée avec une lecture déjà propre et démontrable.";
                }
                else {
                    detail = "La famille avance, avec encore quelques compléments ou preuves à consolider.";
                }
            }
            return {
                id: category,
                label: this.getRegulatoryFamilyLabel(category),
                countLabel: obligations.length > 0
                    ? `${obligations.length} sujet${obligations.length > 1 ? "s" : ""}`
                    : "Aucun sujet remonté",
                detail,
                statusLabel,
                tone,
                highlights: [
                    { label: "À traiter", value: String(overdueCount + verifyCount) },
                    { label: "Conformes", value: String(compliantCount) },
                    { label: "Preuves", value: String(evidenceCount) },
                ],
                actionLabel,
                actionKind,
                sectionId,
                obligationId,
                siteId,
            };
        });
    }
    get regulatoryRecommendedActions() {
        const actions = [];
        const allSites = this.regulatoryAllSites;
        const inferredOnlySites = allSites.filter((site) => !site.declaredSite);
        const problematicSite = this.getProblematicRegulatorySite();
        const problematicSiteState = problematicSite ? this.getSiteEnrichmentUiState(problematicSite) : null;
        const nextEvidenceGap = this.getNextEvidenceGapObligation();
        const highRiskWork = this.getRegulatoryBooleanCriterion("performs_high_risk_work") === true;
        const highestSeverityEntry = this.getHighestPriorityDuerpEntry();
        if (this.regulatoryProfile?.profile_status !== "ready" || this.isOnboardingPending) {
            actions.push({
                id: "reg-action-profile",
                title: "Compléter le profil entreprise",
                detail: "Le profil pilote les obligations détectées et rend le module plus crédible en démonstration.",
                supportLabel: "Profil",
                actionLabel: "Compléter le profil",
                tone: "progress",
                actionKind: "scroll",
                sectionId: "reg-profile-section",
                obligationId: null,
                siteId: null,
            });
        }
        if (allSites.length === 0) {
            actions.push({
                id: "reg-action-first-site",
                title: "Ajouter un site utile",
                detail: "Un premier site déclaré rend la lecture réglementaire plus concrète et plus démonstrative.",
                supportLabel: "Sites",
                actionLabel: "Ajouter un site",
                tone: "progress",
                actionKind: "scroll",
                sectionId: "reg-sites-section",
                obligationId: null,
                siteId: null,
            });
        }
        else if (inferredOnlySites.length > 0) {
            actions.push({
                id: "reg-action-complete-sites",
                title: "Compléter les sites suivis",
                detail: `${inferredOnlySites.length} site${inferredOnlySites.length > 1 ? "s apparaissent" : " apparait"} déjà dans le DUERP, la sécurité ou les preuves.`,
                supportLabel: "Sites",
                actionLabel: "Vérifier les sites",
                tone: "progress",
                actionKind: "scroll",
                sectionId: "reg-sites-section",
                obligationId: null,
                siteId: null,
            });
        }
        if (problematicSite && problematicSiteState) {
            actions.push({
                id: `reg-action-site-${problematicSite.id}`,
                title: `Relancer ${problematicSite.name}`,
                detail: problematicSiteState.reasonLabel
                    ? `${problematicSiteState.reasonLabel}. Une relance peut clarifier la situation.`
                    : problematicSiteState.detail,
                supportLabel: "Sites",
                actionLabel: problematicSiteState.retryLabel,
                tone: problematicSiteState.tone,
                actionKind: "site_enrichment",
                sectionId: "reg-sites-section",
                obligationId: null,
                siteId: problematicSite.id,
            });
        }
        if (this.activeDuerpEntries.length > 0 || highRiskWork) {
            actions.push({
                id: "reg-action-duerp",
                title: this.activeDuerpEntries.length > 0 ? "Ouvrir le DUERP actif" : "Commencer le DUERP",
                detail: this.activeDuerpEntries.length > 0
                    ? `${this.activeDuerpEntries.length} risque${this.activeDuerpEntries.length > 1 ? "s" : ""} suivi${this.activeDuerpEntries.length > 1 ? "s" : ""}${highestSeverityEntry ? `, dont ${highestSeverityEntry.work_unit_name.toLowerCase()}` : ""}.`
                    : "Les interventions à risque méritent au moins un premier risque documenté.",
                supportLabel: "DUERP",
                actionLabel: "Ouvrir DUERP",
                tone: highestSeverityEntry?.severity === "high" ? "warning" : "progress",
                actionKind: "scroll",
                sectionId: "reg-duerp-section",
                obligationId: null,
                siteId: null,
            });
        }
        if (this.globalBuildingSafetyOverdueCount > 0) {
            actions.push({
                id: "reg-action-building-safety",
                title: "Mettre à jour les contrôles bâtiment",
                detail: "Les contrôles visibles renforcent immédiatement la crédibilité du module Réglementation.",
                supportLabel: "Sécurité bâtiment",
                actionLabel: "Voir la sécurité",
                tone: "warning",
                actionKind: "scroll",
                sectionId: "reg-building-safety-section",
                obligationId: null,
                siteId: null,
            });
        }
        if (nextEvidenceGap) {
            const hasAnyEvidence = this.regulatoryEvidenceAvailableCount > 0;
            actions.push({
                id: `reg-action-evidence-${nextEvidenceGap.id}`,
                title: hasAnyEvidence ? "Renforcer les preuves utiles" : "Ajouter une première preuve",
                detail: hasAnyEvidence
                    ? `La prochaine pièce utile concerne ${nextEvidenceGap.title.toLowerCase()}.`
                    : `Commencez par une pièce simple pour ${nextEvidenceGap.title.toLowerCase()}.`,
                supportLabel: "Preuves",
                actionLabel: hasAnyEvidence ? "Voir les preuves" : "Ajouter une pièce",
                tone: hasAnyEvidence ? "calm" : "progress",
                actionKind: "scroll",
                sectionId: "reg-evidence-section",
                obligationId: nextEvidenceGap.id,
                siteId: null,
            });
        }
        return actions
            .filter((action, index, collection) => collection.findIndex((item) => this.getRegulatoryShowcaseActionGroupKey(item) === this.getRegulatoryShowcaseActionGroupKey(action)) === index)
            .slice(0, 4);
    }
    get regulatoryEvidenceShowcaseItems() {
        return [...this.regulatoryEvidences]
            .sort((left, right) => {
            const rightDate = right.uploaded_at ? Date.parse(right.uploaded_at) : 0;
            const leftDate = left.uploaded_at ? Date.parse(left.uploaded_at) : 0;
            return rightDate - leftDate || left.file_name.localeCompare(right.file_name);
        })
            .slice(0, 3)
            .map((evidence) => ({
            id: evidence.id,
            title: evidence.link_label,
            detail: `${evidence.document_type}${evidence.uploaded_at ? ` · ajouté le ${new Date(evidence.uploaded_at).toLocaleDateString("fr-FR")}` : ""}`,
            statusLabel: this.getDocumentStatusLabel(evidence.status),
            tone: this.getDocumentStatusTone(evidence.status),
            contextLabel: evidence.site_id
                ? this.getSiteNameById(evidence.site_id)
                : this.getRegulatoryEvidenceLinkKindLabel(evidence.link_kind),
        }));
    }
    get selectedRegulatoryObligation() {
        if (!this.regulatoryProfile || !this.selectedObligationId) {
            return null;
        }
        return this.regulatoryProfile.applicable_obligations.find((obligation) => obligation.id === this.selectedObligationId) ?? null;
    }
    get selectedObligationCriteria() {
        if (!this.regulatoryProfile || !this.selectedRegulatoryObligation) {
            return [];
        }
        return this.regulatoryProfile.criteria.filter((criterion) => this.selectedRegulatoryObligation?.matched_criteria.includes(criterion.code));
    }
    get selectedObligationEvidences() {
        if (!this.selectedRegulatoryObligation) {
            return [];
        }
        return this.regulatoryEvidences.filter((evidence) => evidence.obligation_id === this.selectedRegulatoryObligation?.id);
    }
    getRegulatoryShowcaseActionLabel(action) {
        if (action.actionKind === "site_enrichment" && action.siteId === this.organizationSiteEnrichmentBusyId) {
            return "Relance en cours";
        }
        return action.actionLabel;
    }
    isRegulatoryShowcaseActionBusy(action) {
        return action.actionKind === "site_enrichment" && action.siteId === this.organizationSiteEnrichmentBusyId;
    }
    async runRegulatoryShowcaseAction(action) {
        if (action.actionKind === "site_enrichment" && action.siteId) {
            const site = this.organizationSites.find((entry) => entry.id === action.siteId);
            if (site) {
                await this.relaunchSiteEnrichment(site);
                return;
            }
        }
        this.openRegulatoryWorkspaceTarget(action.sectionId, action.obligationId);
    }
    get canCreateRegulatoryEvidence() {
        if (!this.regulatoryEvidenceForm.fileName.trim() || !this.regulatoryEvidenceForm.documentType.trim()) {
            return false;
        }
        switch (this.regulatoryEvidenceForm.linkKind) {
            case "obligation":
                return Boolean(this.regulatoryEvidenceForm.obligationId);
            case "site":
                return Boolean(this.regulatoryEvidenceForm.siteId);
            case "building_safety_item":
                return Boolean(this.regulatoryEvidenceForm.buildingSafetyItemId);
            case "duerp_entry":
                return Boolean(this.regulatoryEvidenceForm.duerpEntryId);
        }
    }
    openRegulatoryWorkspaceTarget(sectionId, obligationId = null) {
        if (obligationId) {
            this.selectedObligationId = obligationId;
        }
        this.scrollToWorkspaceSection(sectionId);
    }
    get buildingSafetyOverdueCount() {
        return this.filteredBuildingSafetyItems.filter((item) => item.alert_status === "overdue").length;
    }
    get buildingSafetyDueSoonCount() {
        return this.filteredBuildingSafetyItems.filter((item) => item.alert_status === "due_soon").length;
    }
    get buildingSafetyOkCount() {
        return this.filteredBuildingSafetyItems.filter((item) => item.alert_status === "ok").length;
    }
    get globalBuildingSafetyOverdueCount() {
        return this.buildingSafetyItems.filter((item) => item.alert_status === "overdue").length;
    }
    get activeQuotesCount() {
        return this.quotes.filter((quote) => quote.status === "draft" || quote.status === "sent").length;
    }
    get pendingInvoicesCount() {
        return this.invoices.filter((invoice) => invoice.outstanding_amount_cents > 0).length;
    }
    get overdueInvoicesCount() {
        return this.invoices.filter((invoice) => invoice.status === "overdue").length;
    }
    get quotesToFollowUpCount() {
        return this.quotes.filter((quote) => quote.follow_up_status === "to_follow_up").length;
    }
    get regulatoryObligationsToVerifyCount() {
        return (this.regulatoryProfile?.applicable_obligations.filter((obligation) => obligation.status === "to_verify").length
            ?? 0);
    }
    get overdueRegulatoryObligationCount() {
        return (this.regulatoryProfile?.applicable_obligations.filter((obligation) => obligation.status === "overdue").length
            ?? 0);
    }
    get regulatoryActionCount() {
        return this.regulatoryObligationsToVerifyCount + this.overdueRegulatoryObligationCount + this.buildingSafetyAlerts.length;
    }
    get blockedWorksitesCount() {
        return this.billingWorksites.filter((worksite) => worksite.status === "blocked").length;
    }
    get plannedWorksitesCount() {
        return this.billingWorksites.filter((worksite) => worksite.status === "planned").length;
    }
    get worksitesNeedingActionCount() {
        return this.blockedWorksitesCount + this.plannedWorksitesCount;
    }
    async submitLogin() {
        this.loading = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            const response = await login({
                email: this.email,
                password: this.password
            });
            if (!response.access_token || !response.session?.current_membership?.organization?.id) {
                throw new Error("La réponse de connexion reçue est incomplète.");
            }
            const persistedSession = {
                accessToken: getStoredAccessToken(),
                organizationId: getStoredOrganizationId(),
            };
            if (persistedSession.accessToken !== response.access_token
                || persistedSession.organizationId !== response.session.current_membership.organization.id) {
                throw new Error("La session n'a pas pu être confirmée dans le navigateur après la connexion.");
            }
            this.accessToken = response.access_token;
            this.session = response.session;
            this.selectedOrganizationId = response.session.current_membership.organization.id;
            this.loading = false;
            let navigationSucceeded = await this.router.navigateByUrl("/app/home");
            let finalPath = this.router.url.split("#")[0] || "/login";
            if (!navigationSucceeded || this.isLoginRoutePath(finalPath)) {
                console.warn("[auth] primary navigation did not leave login. Retrying.", {
                    navigationSucceeded,
                    currentUrl: this.router.url,
                });
                navigationSucceeded = await this.router.navigate(["/app", "home"], { replaceUrl: true });
                finalPath = this.router.url.split("#")[0] || "/login";
            }
            if (!navigationSucceeded || this.isLoginRoutePath(finalPath)) {
                throw new Error("La redirection après connexion n'a pas abouti.");
            }
        }
        catch (error) {
            console.error("[auth] login flow failed after POST /auth/login.", error);
            this.errorMessage = this.toErrorMessage(error, "auth");
        }
        finally {
            this.loading = false;
        }
    }
    async changeOrganization() {
        if (this.customerEditingId) {
            this.cancelCustomerEditing();
        }
        if (this.buildingSafetyEditingId) {
            this.cancelBuildingSafetyEditing();
        }
        this.resetBetaFeedback();
        await this.refreshSession(this.selectedOrganizationId);
    }
    async copyBetaFeedback() {
        if (!this.canCopyBetaFeedback) {
            return;
        }
        this.betaFeedbackCopyBusy = true;
        this.betaFeedbackError = "";
        this.betaFeedbackNotice = "";
        try {
            await this.copyTextToClipboard(this.buildBetaFeedbackPayload());
            this.betaFeedbackNotice = "Retour prêt à coller dans votre canal beta ou pilote.";
        }
        catch (error) {
            this.betaFeedbackError = "La copie automatique n'a pas abouti. Le texte reste visible ci-dessous.";
        }
        finally {
            this.betaFeedbackCopyBusy = false;
        }
    }
    resetBetaFeedback() {
        this.betaFeedbackCategory = "improvement";
        this.betaFeedbackArea = "cockpit";
        this.betaFeedbackMessageText = "";
        this.betaFeedbackNotice = "";
        this.betaFeedbackError = "";
    }
    async toggleModule(moduleCode, nextValue) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageModules) {
            return;
        }
        this.loading = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateOrganizationModule(this.accessToken, this.selectedOrganizationId, moduleCode, nextValue);
            await this.refreshSession(this.selectedOrganizationId);
            this.feedbackMessage = "Modules mis à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.loading = false;
        }
    }
    async completeOnboarding() {
        await this.saveProfile("Entreprise initialisée.");
    }
    async saveQualificationQuestionnaire() {
        await this.saveProfile("Questionnaire réglementaire enregistré.");
    }
    async saveProfile(successMessage = "Profil entreprise enregistré.") {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.organizationProfileSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            const profile = await updateOrganizationProfile(this.accessToken, this.selectedOrganizationId, this.buildProfilePayload());
            this.organizationProfile = profile;
            this.applyProfileToForm(profile);
            await this.refreshSession(this.selectedOrganizationId);
            this.feedbackMessage = successMessage;
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.organizationProfileSaving = false;
        }
    }
    async createSite() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.organizationSiteSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            const createdSite = await createOrganizationSite(this.accessToken, this.selectedOrganizationId, {
                name: this.siteForm.name.trim(),
                address: this.siteForm.address.trim(),
                site_type: this.siteForm.siteType
            });
            await this.refreshOrganizationWorkspace();
            this.resetSiteForm();
            this.homeSiteQuickCreateOpen = false;
            this.feedbackMessage = this.getSiteEnrichmentFeedbackMessage(createdSite, true);
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.organizationSiteSaving = false;
        }
    }
    startEditingCustomer(customer) {
        this.customerEditingId = customer.id;
        this.customerForm = {
            name: customer.name,
            customerType: customer.customer_type,
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            address: customer.address ?? "",
            notes: customer.notes ?? ""
        };
    }
    cancelCustomerEditing() {
        this.customerEditingId = null;
        this.resetCustomerForm();
    }
    async saveCustomer() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.customerSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            if (this.customerEditingId) {
                await updateBillingCustomer(this.accessToken, this.selectedOrganizationId, this.customerEditingId, {
                    name: this.customerForm.name.trim(),
                    customer_type: this.customerForm.customerType,
                    email: this.normalizeOptionalText(this.customerForm.email),
                    phone: this.normalizeOptionalText(this.customerForm.phone),
                    address: this.normalizeOptionalText(this.customerForm.address),
                    notes: this.normalizeOptionalText(this.customerForm.notes)
                });
            }
            else {
                await createBillingCustomer(this.accessToken, this.selectedOrganizationId, {
                    name: this.customerForm.name.trim(),
                    customer_type: this.customerForm.customerType,
                    email: this.normalizeOptionalText(this.customerForm.email),
                    phone: this.normalizeOptionalText(this.customerForm.phone),
                    address: this.normalizeOptionalText(this.customerForm.address),
                    notes: this.normalizeOptionalText(this.customerForm.notes)
                });
            }
            await this.refreshOrganizationWorkspace();
            const wasEditing = this.customerEditingId !== null;
            this.cancelCustomerEditing();
            this.feedbackMessage = wasEditing ? "Client mis à jour." : "Client ajouté.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.customerSaving = false;
        }
    }
    addQuoteLine() {
        this.quoteForm.lines = [...this.quoteForm.lines, this.createEmptyBillingLineForm()];
    }
    removeQuoteLine(index) {
        if (this.quoteForm.lines.length === 1) {
            this.quoteForm.lines = [this.createEmptyBillingLineForm()];
            return;
        }
        this.quoteForm.lines = this.quoteForm.lines.filter((_, currentIndex) => currentIndex !== index);
    }
    startEditingQuote(quote) {
        this.quoteEditingId = quote.id;
        this.quoteEditForm = this.buildQuoteFormFromRecord(quote);
    }
    cancelQuoteEditing() {
        this.quoteEditingId = null;
        this.quoteEditingSaving = false;
        this.quoteEditForm = this.createEmptyQuoteForm();
    }
    addQuoteEditLine() {
        this.quoteEditForm.lines = [...this.quoteEditForm.lines, this.createEmptyBillingLineForm()];
    }
    removeQuoteEditLine(index) {
        if (this.quoteEditForm.lines.length === 1) {
            this.quoteEditForm.lines = [this.createEmptyBillingLineForm()];
            return;
        }
        this.quoteEditForm.lines = this.quoteEditForm.lines.filter((_, currentIndex) => currentIndex !== index);
    }
    async saveQuoteEdit(quote) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.quoteEditingSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateQuote(this.accessToken, this.selectedOrganizationId, quote.id, {
                customer_id: this.quoteEditForm.customerId,
                worksite_id: this.quoteEditForm.worksiteId || null,
                title: this.normalizeOptionalText(this.quoteEditForm.title),
                issue_date: this.quoteEditForm.issueDate,
                valid_until: this.normalizeOptionalText(this.quoteEditForm.validUntil),
                line_items: this.buildBillingLineItemsPayload(this.quoteEditForm.lines),
                notes: this.normalizeOptionalText(this.quoteEditForm.notes),
            });
            await this.refreshOrganizationWorkspace();
            this.cancelQuoteEditing();
            this.feedbackMessage = "Devis mis à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.quoteEditingSaving = false;
        }
    }
    addInvoiceLine() {
        this.invoiceForm.lines = [...this.invoiceForm.lines, this.createEmptyBillingLineForm()];
    }
    removeInvoiceLine(index) {
        if (this.invoiceForm.lines.length === 1) {
            this.invoiceForm.lines = [this.createEmptyBillingLineForm()];
            return;
        }
        this.invoiceForm.lines = this.invoiceForm.lines.filter((_, currentIndex) => currentIndex !== index);
    }
    startEditingInvoice(invoice) {
        this.invoiceEditingId = invoice.id;
        this.invoiceEditForm = this.buildInvoiceFormFromRecord(invoice);
    }
    cancelInvoiceEditing() {
        this.invoiceEditingId = null;
        this.invoiceEditingSaving = false;
        this.invoiceEditForm = this.createEmptyInvoiceForm();
    }
    addInvoiceEditLine() {
        this.invoiceEditForm.lines = [...this.invoiceEditForm.lines, this.createEmptyBillingLineForm()];
    }
    removeInvoiceEditLine(index) {
        if (this.invoiceEditForm.lines.length === 1) {
            this.invoiceEditForm.lines = [this.createEmptyBillingLineForm()];
            return;
        }
        this.invoiceEditForm.lines = this.invoiceEditForm.lines.filter((_, currentIndex) => currentIndex !== index);
    }
    async saveInvoiceEdit(invoice) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.invoiceEditingSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateInvoice(this.accessToken, this.selectedOrganizationId, invoice.id, {
                customer_id: this.invoiceEditForm.customerId,
                worksite_id: this.invoiceEditForm.worksiteId || null,
                title: this.normalizeOptionalText(this.invoiceEditForm.title),
                issue_date: this.invoiceEditForm.issueDate,
                due_date: this.normalizeOptionalText(this.invoiceEditForm.dueDate),
                line_items: this.buildBillingLineItemsPayload(this.invoiceEditForm.lines),
                notes: this.normalizeOptionalText(this.invoiceEditForm.notes),
            });
            await this.refreshOrganizationWorkspace();
            this.cancelInvoiceEditing();
            this.feedbackMessage = "Facture mise à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.invoiceEditingSaving = false;
        }
    }
    discardQuoteDraft() {
        this.clearBillingDraft("quote");
        this.resetQuoteForm();
        this.refreshBillingDraftSnapshots();
        this.feedbackMessage = "Saisie du devis effacée.";
    }
    async saveQuote() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.quoteSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await createQuote(this.accessToken, this.selectedOrganizationId, {
                customer_id: this.quoteForm.customerId,
                worksite_id: this.quoteForm.worksiteId || null,
                title: this.normalizeOptionalText(this.quoteForm.title),
                issue_date: this.quoteForm.issueDate,
                valid_until: this.normalizeOptionalText(this.quoteForm.validUntil),
                status: this.quoteForm.status,
                currency: "EUR",
                line_items: this.buildBillingLineItemsPayload(this.quoteForm.lines),
                notes: this.normalizeOptionalText(this.quoteForm.notes)
            });
            this.clearBillingDraft("quote");
            await this.refreshOrganizationWorkspace();
            this.resetQuoteForm();
            this.refreshBillingDraftSnapshots();
            this.feedbackMessage = "Devis ajouté.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.quoteSaving = false;
        }
    }
    async exportWorksiteSummaryPdf(worksiteId) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        this.worksiteDocumentPdfBusyId = worksiteId;
        this.errorMessage = "";
        this.feedbackMessage = "Fiche chantier PDF en préparation.";
        try {
            const { blob, fileName } = await downloadWorksiteSummaryPdf(this.accessToken, this.selectedOrganizationId, worksiteId);
            this.downloadBlob(blob, fileName);
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Fiche chantier PDF générée.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "export");
        }
        finally {
            this.worksiteDocumentPdfBusyId = null;
        }
    }
    async exportWorksitePreventionPlanPdf(worksiteId) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        this.worksitePreventionPlanPdfBusyId = worksiteId;
        this.errorMessage = "";
        this.feedbackMessage = "Plan de prévention PDF en préparation.";
        try {
            const { blob, fileName } = await downloadWorksitePreventionPlanPdf(this.accessToken, this.selectedOrganizationId, worksiteId);
            this.downloadBlob(blob, fileName);
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Plan de prévention PDF généré.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "export");
        }
        finally {
            this.worksitePreventionPlanPdfBusyId = null;
        }
    }
    async downloadWorksiteDocument(document) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        this.worksiteDocumentDownloadBusyId = document.id;
        this.errorMessage = "";
        this.feedbackMessage = "Document chantier en préparation.";
        try {
            const { blob, fileName } = await downloadGeneratedWorksiteDocument(this.accessToken, this.selectedOrganizationId, document.id);
            this.downloadBlob(blob, fileName);
            this.markWorksiteDocumentAsStored(document.id, blob.size);
            this.feedbackMessage = "Document chantier téléchargé.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "export");
        }
        finally {
            this.worksiteDocumentDownloadBusyId = null;
        }
    }
    toggleWorksiteDocumentDetails(documentId) {
        this.selectedWorksiteDocumentDetailId =
            this.selectedWorksiteDocumentDetailId === documentId ? null : documentId;
    }
    markWorksiteDocumentAsStored(documentId, sizeBytes) {
        this.worksiteDocuments = this.worksiteDocuments.map((document) => document.id === documentId
            ? {
                ...document,
                has_stored_file: true,
                size_bytes: sizeBytes > 0 ? sizeBytes : document.size_bytes,
            }
            : document);
    }
    async saveWorksiteCoordination(item) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        const draft = this.getWorksiteCoordinationDraft(item.id);
        this.worksiteCoordinationBusyId = item.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateWorksiteCoordination(this.accessToken, this.selectedOrganizationId, item.id, {
                status: draft.status,
                assignee_user_id: draft.assigneeUserId || null,
                comment_text: this.normalizeOptionalText(draft.commentText),
            });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Coordination du chantier mise à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.worksiteCoordinationBusyId = null;
        }
    }
    async saveWorksiteDocumentCoordination(document) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        const draft = this.getWorksiteDocumentCoordinationDraft(document.id);
        this.worksiteDocumentCoordinationBusyId = document.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateWorksiteDocumentCoordination(this.accessToken, this.selectedOrganizationId, document.id, {
                status: draft.status,
                assignee_user_id: draft.assigneeUserId || null,
                comment_text: this.normalizeOptionalText(draft.commentText),
            });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Coordination du document mise à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.worksiteDocumentCoordinationBusyId = null;
        }
    }
    async changeWorksiteDocumentLifecycleStatus(documentId, lifecycleStatus) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        const existingDocument = this.worksiteDocuments.find((document) => document.id === documentId);
        if (!existingDocument || existingDocument.lifecycle_status === lifecycleStatus) {
            return;
        }
        this.worksiteDocumentStatusBusyId = documentId;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateWorksiteDocumentStatus(this.accessToken, this.selectedOrganizationId, documentId, { lifecycle_status: lifecycleStatus });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage =
                lifecycleStatus === "finalized"
                    ? "Document chantier marqué comme finalisé."
                    : "Document chantier repassé en brouillon.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.worksiteDocumentStatusBusyId = null;
        }
    }
    async changeWorksiteDocumentSignature(documentId, signatureDocumentId) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        const existingDocument = this.worksiteDocuments.find((document) => document.id === documentId);
        const nextSignatureDocumentId = signatureDocumentId || null;
        if (!existingDocument || existingDocument.linked_signature_id === nextSignatureDocumentId) {
            return;
        }
        this.worksiteDocumentSignatureBusyId = documentId;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateWorksiteDocumentSignature(this.accessToken, this.selectedOrganizationId, documentId, { signature_document_id: nextSignatureDocumentId });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = nextSignatureDocumentId
                ? "Signature liée au document chantier."
                : "Lien vers la signature retiré du document chantier.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.worksiteDocumentSignatureBusyId = null;
        }
    }
    async toggleWorksiteDocumentProof(documentId, proofDocumentId, isLinked) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        const existingDocument = this.worksiteDocuments.find((document) => document.id === documentId);
        if (!existingDocument) {
            return;
        }
        const nextProofIds = isLinked
            ? [...existingDocument.linked_proofs.map((proof) => proof.id), proofDocumentId]
            : existingDocument.linked_proofs
                .map((proof) => proof.id)
                .filter((proofId) => proofId !== proofDocumentId);
        const normalizedNextProofIds = Array.from(new Set(nextProofIds));
        const currentProofIds = existingDocument.linked_proofs.map((proof) => proof.id);
        if (JSON.stringify(currentProofIds) === JSON.stringify(normalizedNextProofIds)) {
            return;
        }
        this.worksiteDocumentProofBusyId = documentId;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateWorksiteDocumentProofs(this.accessToken, this.selectedOrganizationId, documentId, { proof_document_ids: normalizedNextProofIds });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = isLinked
                ? "Preuve liée au document chantier."
                : "Lien vers la preuve retiré du document chantier.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.worksiteDocumentProofBusyId = null;
        }
    }
    toggleWorksitePreventionPlanEditor(worksiteId) {
        if (this.worksitePreventionPlanEditingId === worksiteId) {
            this.cancelWorksitePreventionPlanEditing();
            return;
        }
        const worksite = this.billingWorksites.find((entry) => entry.id === worksiteId);
        if (!worksite) {
            return;
        }
        const initialForm = this.buildWorksitePreventionPlanForm(worksite);
        this.worksitePreventionPlanEditingId = worksiteId;
        this.worksitePreventionPlanInitialForm = this.cloneWorksitePreventionPlanForm(initialForm);
        this.worksitePreventionPlanForm = this.cloneWorksitePreventionPlanForm(initialForm);
        this.errorMessage = "";
        this.feedbackMessage = `Plan de prévention prêt à ajuster pour ${worksite.name}.`;
    }
    cancelWorksitePreventionPlanEditing() {
        this.worksitePreventionPlanEditingId = null;
        this.worksitePreventionPlanPdfBusyId = null;
        this.worksitePreventionPlanInitialForm = null;
        this.resetWorksitePreventionPlanForm();
    }
    restoreInitialWorksitePreventionPlanForm() {
        if (!this.worksitePreventionPlanInitialForm) {
            return;
        }
        this.worksitePreventionPlanForm = this.cloneWorksitePreventionPlanForm(this.worksitePreventionPlanInitialForm);
        this.errorMessage = "";
        this.feedbackMessage = "Préremplissage initial réappliqué.";
    }
    async exportAdjustedWorksitePreventionPlanPdf(worksiteId) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        this.worksitePreventionPlanPdfBusyId = worksiteId;
        this.errorMessage = "";
        this.feedbackMessage = "Plan de prévention PDF en préparation avec vos ajustements.";
        try {
            const payload = {
                useful_date: this.normalizeOptionalText(this.worksitePreventionPlanForm.usefulDate),
                intervention_context: this.normalizeOptionalText(this.worksitePreventionPlanForm.interventionContext),
                vigilance_points: this.splitMultilineItems(this.worksitePreventionPlanForm.vigilancePoints),
                measure_points: this.splitMultilineItems(this.worksitePreventionPlanForm.measurePoints),
                additional_contact: this.normalizeOptionalText(this.worksitePreventionPlanForm.additionalContact),
            };
            const { blob, fileName } = await downloadWorksitePreventionPlanPdf(this.accessToken, this.selectedOrganizationId, worksiteId, payload);
            this.downloadBlob(blob, fileName);
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Plan de prévention simplifié généré avec les ajustements.";
            this.cancelWorksitePreventionPlanEditing();
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "export");
        }
        finally {
            this.worksitePreventionPlanPdfBusyId = null;
        }
    }
    prepareQuoteFromWorksite(worksiteId) {
        const worksite = this.billingWorksites.find((entry) => entry.id === worksiteId);
        if (!worksite) {
            return;
        }
        const matchedCustomer = this.findBillingCustomerByName(worksite.client_name);
        this.quoteForm = {
            ...this.quoteForm,
            customerId: matchedCustomer?.id ?? "",
            worksiteId: worksite.id,
            title: this.quoteForm.title.trim() ? this.quoteForm.title : worksite.name,
        };
        this.errorMessage = "";
        this.feedbackMessage = matchedCustomer
            ? `Devis préparé depuis le chantier ${worksite.name}.`
            : `Devis préparé depuis le chantier ${worksite.name}. Client à confirmer manuellement.`;
        void this.navigateToWorkspaceRoute("/app/facturation", "billing-quote-card");
    }
    prepareInvoiceFromWorksite(worksiteId) {
        const worksite = this.billingWorksites.find((entry) => entry.id === worksiteId);
        if (!worksite) {
            return;
        }
        const matchedCustomer = this.findBillingCustomerByName(worksite.client_name);
        this.invoiceForm = {
            ...this.invoiceForm,
            customerId: matchedCustomer?.id ?? "",
            worksiteId: worksite.id,
            title: this.invoiceForm.title.trim() ? this.invoiceForm.title : worksite.name,
        };
        this.errorMessage = "";
        this.feedbackMessage = matchedCustomer
            ? `Facture préparée depuis le chantier ${worksite.name}.`
            : `Facture préparée depuis le chantier ${worksite.name}. Client à confirmer manuellement.`;
        void this.navigateToWorkspaceRoute("/app/facturation", "billing-invoice-card");
    }
    prepareQuoteFromCustomer(customerId) {
        const customer = this.billingCustomers.find((entry) => entry.id === customerId);
        if (!customer) {
            return;
        }
        const matchedWorksite = this.findSingleWorksiteForCustomer(customer.name);
        this.quoteForm = {
            ...this.quoteForm,
            customerId: customer.id,
            worksiteId: matchedWorksite?.id ?? "",
            title: this.quoteForm.title.trim() ? this.quoteForm.title : customer.name,
        };
        this.errorMessage = "";
        this.feedbackMessage = matchedWorksite
            ? `Devis préparé pour ${customer.name}, avec le chantier ${matchedWorksite.name}.`
            : `Devis préparé pour ${customer.name}. Aucun chantier repris automatiquement.`;
        void this.navigateToWorkspaceRoute("/app/facturation", "billing-quote-card");
    }
    prepareInvoiceFromCustomer(customerId) {
        const customer = this.billingCustomers.find((entry) => entry.id === customerId);
        if (!customer) {
            return;
        }
        const matchedWorksite = this.findSingleWorksiteForCustomer(customer.name);
        this.invoiceForm = {
            ...this.invoiceForm,
            customerId: customer.id,
            worksiteId: matchedWorksite?.id ?? "",
            title: this.invoiceForm.title.trim() ? this.invoiceForm.title : customer.name,
        };
        this.errorMessage = "";
        this.feedbackMessage = matchedWorksite
            ? `Facture préparée pour ${customer.name}, avec le chantier ${matchedWorksite.name}.`
            : `Facture préparée pour ${customer.name}. Aucun chantier repris automatiquement.`;
        void this.navigateToWorkspaceRoute("/app/facturation", "billing-invoice-card");
    }
    async changeQuoteWorksite(quote, worksiteId) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.quoteWorksiteBusyId = quote.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateQuoteWorksiteLink(this.accessToken, this.selectedOrganizationId, quote.id, {
                worksite_id: worksiteId || null
            });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Chantier du devis mis à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.quoteWorksiteBusyId = null;
        }
    }
    async exportQuotePdf(quote) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        this.quotePdfBusyId = quote.id;
        this.errorMessage = "";
        this.feedbackMessage = "PDF devis en préparation.";
        try {
            const { blob, fileName } = await downloadQuotePdf(this.accessToken, this.selectedOrganizationId, quote.id);
            this.downloadBlob(blob, fileName);
            this.feedbackMessage = "PDF devis généré.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "export");
        }
        finally {
            this.quotePdfBusyId = null;
        }
    }
    async duplicateQuoteAsInvoice(quote) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.quoteDuplicateBusyId = quote.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            const invoice = await duplicateQuoteToInvoice(this.accessToken, this.selectedOrganizationId, quote.id);
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = `Facture ${invoice.number} créée depuis le devis ${quote.number}.`;
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.quoteDuplicateBusyId = null;
        }
    }
    async toggleQuoteHistory(quote) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        if (this.quoteHistoryOpenId === quote.id) {
            this.quoteHistoryOpenId = null;
            return;
        }
        this.quoteHistoryBusyId = quote.id;
        this.errorMessage = "";
        try {
            const logs = await listAuditLogs(this.accessToken, this.selectedOrganizationId, {
                limit: 10,
                targetId: quote.id,
                targetTypes: ["quote", "quote_worksite_link"],
            });
            this.quoteHistoryById = { ...this.quoteHistoryById, [quote.id]: logs };
            this.quoteHistoryOpenId = quote.id;
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "load");
        }
        finally {
            this.quoteHistoryBusyId = null;
        }
    }
    async changeQuoteStatus(quote, status) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        if (quote.status === status) {
            return;
        }
        this.quoteStatusBusyId = quote.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateQuoteStatus(this.accessToken, this.selectedOrganizationId, quote.id, { status });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Statut du devis mis à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.quoteStatusBusyId = null;
        }
    }
    async changeQuoteFollowUpStatus(quote, followUpStatus) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        if (quote.follow_up_status === followUpStatus) {
            return;
        }
        this.quoteFollowUpBusyId = quote.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateQuoteFollowUpStatus(this.accessToken, this.selectedOrganizationId, quote.id, {
                follow_up_status: followUpStatus,
            });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Suivi du devis mis à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.quoteFollowUpBusyId = null;
        }
    }
    discardInvoiceDraft() {
        this.clearBillingDraft("invoice");
        this.resetInvoiceForm();
        this.refreshBillingDraftSnapshots();
        this.feedbackMessage = "Saisie de la facture effacée.";
    }
    async saveInvoice() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.invoiceSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await createInvoice(this.accessToken, this.selectedOrganizationId, {
                customer_id: this.invoiceForm.customerId,
                worksite_id: this.invoiceForm.worksiteId || null,
                title: this.normalizeOptionalText(this.invoiceForm.title),
                issue_date: this.invoiceForm.issueDate,
                due_date: this.normalizeOptionalText(this.invoiceForm.dueDate),
                status: this.invoiceForm.status,
                currency: "EUR",
                line_items: this.buildBillingLineItemsPayload(this.invoiceForm.lines),
                notes: this.normalizeOptionalText(this.invoiceForm.notes)
            });
            this.clearBillingDraft("invoice");
            await this.refreshOrganizationWorkspace();
            this.resetInvoiceForm();
            this.refreshBillingDraftSnapshots();
            this.feedbackMessage = "Facture ajoutée.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.invoiceSaving = false;
        }
    }
    async changeInvoiceWorksite(invoice, worksiteId) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.invoiceWorksiteBusyId = invoice.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateInvoiceWorksiteLink(this.accessToken, this.selectedOrganizationId, invoice.id, {
                worksite_id: worksiteId || null
            });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Chantier de la facture mis à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.invoiceWorksiteBusyId = null;
        }
    }
    async exportInvoicePdf(invoice) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        this.invoicePdfBusyId = invoice.id;
        this.errorMessage = "";
        this.feedbackMessage = "PDF facture en préparation.";
        try {
            const { blob, fileName } = await downloadInvoicePdf(this.accessToken, this.selectedOrganizationId, invoice.id);
            this.downloadBlob(blob, fileName);
            this.feedbackMessage = "PDF facture généré.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "export");
        }
        finally {
            this.invoicePdfBusyId = null;
        }
    }
    async toggleInvoiceHistory(invoice) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        if (this.invoiceHistoryOpenId === invoice.id) {
            this.invoiceHistoryOpenId = null;
            return;
        }
        this.invoiceHistoryBusyId = invoice.id;
        this.errorMessage = "";
        try {
            const logs = await listAuditLogs(this.accessToken, this.selectedOrganizationId, {
                limit: 10,
                targetId: invoice.id,
                targetTypes: ["invoice", "invoice_payment", "invoice_worksite_link"],
            });
            this.invoiceHistoryById = { ...this.invoiceHistoryById, [invoice.id]: logs };
            this.invoiceHistoryOpenId = invoice.id;
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "load");
        }
        finally {
            this.invoiceHistoryBusyId = null;
        }
    }
    async changeInvoiceStatus(invoice, status) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        if (invoice.status === status) {
            return;
        }
        this.invoiceStatusBusyId = invoice.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateInvoiceStatus(this.accessToken, this.selectedOrganizationId, invoice.id, { status });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Statut de la facture mis à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.invoiceStatusBusyId = null;
        }
    }
    async changeInvoiceFollowUpStatus(invoice, followUpStatus) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        if (invoice.follow_up_status === followUpStatus) {
            return;
        }
        this.invoiceFollowUpBusyId = invoice.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateInvoiceFollowUpStatus(this.accessToken, this.selectedOrganizationId, invoice.id, {
                follow_up_status: followUpStatus,
            });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage = "Suivi de la facture mis à jour.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.invoiceFollowUpBusyId = null;
        }
    }
    openInvoicePayment(invoice) {
        this.invoicePaymentId = invoice.id;
        this.invoicePaymentForm = {
            paidAmount: (invoice.outstanding_amount_cents / 100).toFixed(2).replace(".", ","),
            paidAt: this.getTodayDateValue()
        };
    }
    cancelInvoicePayment() {
        this.invoicePaymentId = null;
        this.resetInvoicePaymentForm();
    }
    canSaveInvoicePayment(invoice) {
        const paidAmountCents = this.parseUnitPriceToCents(this.invoicePaymentForm.paidAmount);
        return Boolean(paidAmountCents !== null
            && paidAmountCents > 0
            && paidAmountCents <= invoice.total_amount_cents
            && this.invoicePaymentForm.paidAt);
    }
    async saveInvoicePayment(invoice) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        const paidAmountCents = this.parseUnitPriceToCents(this.invoicePaymentForm.paidAmount);
        if (paidAmountCents === null || !this.invoicePaymentForm.paidAt) {
            this.errorMessage = "Renseignez un montant payé et une date valides.";
            return;
        }
        this.invoicePaymentBusyId = invoice.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await recordInvoicePayment(this.accessToken, this.selectedOrganizationId, invoice.id, {
                paid_amount_cents: paidAmountCents,
                paid_at: this.invoicePaymentForm.paidAt
            });
            await this.refreshOrganizationWorkspace();
            this.cancelInvoicePayment();
            this.feedbackMessage = "Paiement enregistré.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.invoicePaymentBusyId = null;
        }
    }
    startEditingBuildingSafetyItem(item) {
        this.buildingSafetyEditingId = item.id;
        this.buildingSafetyForm = {
            siteId: item.site_id,
            itemType: item.item_type,
            name: item.name,
            nextDueDate: item.next_due_date,
            lastCheckedAt: item.last_checked_at ?? "",
            status: item.status,
            notes: item.notes ?? ""
        };
    }
    cancelBuildingSafetyEditing() {
        this.buildingSafetyEditingId = null;
        this.resetBuildingSafetyForm();
    }
    async saveBuildingSafetyItem() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.buildingSafetySaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            if (this.buildingSafetyEditingId) {
                await updateBuildingSafetyItem(this.accessToken, this.selectedOrganizationId, this.buildingSafetyEditingId, {
                    next_due_date: this.buildingSafetyForm.nextDueDate,
                    last_checked_at: this.normalizeOptionalText(this.buildingSafetyForm.lastCheckedAt),
                    status: this.buildingSafetyForm.status,
                    notes: this.normalizeOptionalText(this.buildingSafetyForm.notes)
                });
            }
            else {
                await createBuildingSafetyItem(this.accessToken, this.selectedOrganizationId, {
                    site_id: this.buildingSafetyForm.siteId,
                    item_type: this.buildingSafetyForm.itemType,
                    name: this.buildingSafetyForm.name.trim(),
                    next_due_date: this.buildingSafetyForm.nextDueDate,
                    last_checked_at: this.normalizeOptionalText(this.buildingSafetyForm.lastCheckedAt),
                    notes: this.normalizeOptionalText(this.buildingSafetyForm.notes)
                });
            }
            await this.refreshOrganizationWorkspace();
            const wasEditing = this.buildingSafetyEditingId !== null;
            this.cancelBuildingSafetyEditing();
            this.feedbackMessage = wasEditing ? "Élément sécurité mis à jour." : "Élément sécurité ajouté.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.buildingSafetySaving = false;
        }
    }
    async toggleBuildingSafetyItemStatus(item) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.buildingSafetyStatusBusyId = item.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateBuildingSafetyItem(this.accessToken, this.selectedOrganizationId, item.id, {
                status: item.status === "active" ? "archived" : "active"
            });
            await this.refreshOrganizationWorkspace();
            if (this.buildingSafetyEditingId === item.id) {
                this.cancelBuildingSafetyEditing();
            }
            this.feedbackMessage = item.status === "active" ? "Élément archivé." : "Élément réactivé.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.buildingSafetyStatusBusyId = null;
        }
    }
    startEditingDuerpEntry(entry) {
        this.duerpEditingId = entry.id;
        this.duerpForm = {
            siteId: entry.site_id ?? "",
            workUnitName: entry.work_unit_name,
            riskLabel: entry.risk_label,
            severity: entry.severity,
            preventionAction: entry.prevention_action ?? ""
        };
    }
    cancelDuerpEditing() {
        this.duerpEditingId = null;
        this.resetDuerpForm();
    }
    async saveDuerpEntry() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.duerpSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            if (this.duerpEditingId) {
                await updateDuerpEntry(this.accessToken, this.selectedOrganizationId, this.duerpEditingId, {
                    site_id: this.duerpForm.siteId || undefined,
                    work_unit_name: this.duerpForm.workUnitName.trim(),
                    risk_label: this.duerpForm.riskLabel.trim(),
                    severity: this.duerpForm.severity,
                    prevention_action: this.normalizeOptionalText(this.duerpForm.preventionAction)
                });
            }
            else {
                await createDuerpEntry(this.accessToken, this.selectedOrganizationId, {
                    site_id: this.duerpForm.siteId || null,
                    work_unit_name: this.duerpForm.workUnitName.trim(),
                    risk_label: this.duerpForm.riskLabel.trim(),
                    severity: this.duerpForm.severity,
                    prevention_action: this.normalizeOptionalText(this.duerpForm.preventionAction)
                });
            }
            await this.refreshOrganizationWorkspace();
            const wasEditing = this.duerpEditingId !== null;
            this.cancelDuerpEditing();
            this.feedbackMessage = wasEditing ? "Entrée DUERP mise à jour." : "Entrée DUERP ajoutée.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.duerpSaving = false;
        }
    }
    async toggleDuerpEntryStatus(entry) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.duerpStatusBusyId = entry.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await updateDuerpEntry(this.accessToken, this.selectedOrganizationId, entry.id, {
                status: entry.status === "active" ? "archived" : "active"
            });
            await this.refreshOrganizationWorkspace();
            if (this.duerpEditingId === entry.id) {
                this.cancelDuerpEditing();
            }
            this.feedbackMessage = entry.status === "active" ? "Entrée DUERP archivée." : "Entrée DUERP réactivée.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.duerpStatusBusyId = null;
        }
    }
    async createEvidence() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.regulatoryEvidenceSaving = true;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            await createRegulatoryEvidence(this.accessToken, this.selectedOrganizationId, {
                link_kind: this.regulatoryEvidenceForm.linkKind,
                obligation_id: this.regulatoryEvidenceForm.linkKind === "obligation"
                    ? this.regulatoryEvidenceForm.obligationId
                    : null,
                site_id: this.regulatoryEvidenceForm.linkKind === "site"
                    ? this.regulatoryEvidenceForm.siteId
                    : null,
                building_safety_item_id: this.regulatoryEvidenceForm.linkKind === "building_safety_item"
                    ? this.regulatoryEvidenceForm.buildingSafetyItemId
                    : null,
                duerp_entry_id: this.regulatoryEvidenceForm.linkKind === "duerp_entry"
                    ? this.regulatoryEvidenceForm.duerpEntryId
                    : null,
                file_name: this.regulatoryEvidenceForm.fileName.trim(),
                document_type: this.regulatoryEvidenceForm.documentType.trim(),
                notes: this.normalizeOptionalText(this.regulatoryEvidenceForm.notes)
            });
            await this.refreshOrganizationWorkspace();
            this.resetRegulatoryEvidenceForm();
            this.feedbackMessage = "Pièce justificative ajoutée.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "save");
        }
        finally {
            this.regulatoryEvidenceSaving = false;
        }
    }
    async exportRegulatoryPdf() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canReadOrganization) {
            return;
        }
        this.regulatoryExporting = true;
        this.errorMessage = "";
        this.feedbackMessage = "Export réglementaire PDF en préparation.";
        try {
            const { blob, fileName } = await downloadRegulatoryExportPdf(this.accessToken, this.selectedOrganizationId);
            const objectUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = fileName;
            anchor.click();
            window.URL.revokeObjectURL(objectUrl);
            this.feedbackMessage = "PDF réglementaire généré.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "export");
        }
        finally {
            this.regulatoryExporting = false;
        }
    }
    async toggleSiteStatus(site) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.organizationSiteStatusBusyId = site.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            const updatedSite = await updateOrganizationSite(this.accessToken, this.selectedOrganizationId, site.id, {
                status: site.status === "active" ? "archived" : "active"
            });
            await this.refreshOrganizationWorkspace();
            this.feedbackMessage =
                updatedSite.status === "active" ? "Site réactivé." : "Site archivé.";
        }
        catch (error) {
            this.errorMessage = this.toErrorMessage(error, "update");
        }
        finally {
            this.organizationSiteStatusBusyId = null;
        }
    }
    async relaunchSiteEnrichment(site) {
        if (!this.accessToken || !this.selectedOrganizationId || !this.canManageOrganization) {
            return;
        }
        this.organizationSiteEnrichmentBusyId = site.id;
        this.errorMessage = "";
        this.feedbackMessage = "";
        try {
            const result = await enrichOrganizationSiteLocation(this.accessToken, this.selectedOrganizationId, site.id);
            this.organizationSites = this.sortSites(this.organizationSites.map((item) => (item.id === result.site.id ? result.site : item)));
            this.feedbackMessage = this.getSiteEnrichmentFeedbackMessage(result.site);
        }
        catch (error) {
            try {
                await this.refreshOrganizationWorkspace();
            }
            catch {
                // Keep the primary action feedback readable if workspace refresh also fails.
            }
            this.errorMessage = "La relance de l'enrichissement n'a pas abouti. Réessayez dans un instant.";
        }
        finally {
            this.organizationSiteEnrichmentBusyId = null;
        }
    }
    openHomeSiteQuickCreate() {
        if (!this.canManageOrganization) {
            return;
        }
        this.resetSiteForm();
        this.homeSiteQuickCreateOpen = true;
    }
    closeHomeSiteQuickCreate() {
        this.homeSiteQuickCreateOpen = false;
        if (!this.organizationSiteSaving) {
            this.resetSiteForm();
        }
    }
    handleSiteFilterChange() {
        if (!this.buildingSafetyEditingId && this.selectedSafetySiteId !== "all") {
            this.buildingSafetyForm.siteId = this.selectedSafetySiteId;
        }
        if (!this.duerpEditingId) {
            this.duerpForm.siteId = this.selectedSafetySiteId !== "all" ? this.selectedSafetySiteId : this.duerpForm.siteId;
        }
        if (this.selectedSafetySiteId !== "all") {
            if (this.regulatoryEvidenceForm.linkKind === "site"
                && this.regulatoryEvidenceForm.siteId !== this.selectedSafetySiteId) {
                this.regulatoryEvidenceForm.siteId = this.selectedSafetySiteId;
            }
            if (this.regulatoryEvidenceForm.linkKind === "building_safety_item"
                && this.regulatoryEvidenceForm.buildingSafetyItemId
                && !this.selectableBuildingSafetyItems.some((item) => item.id === this.regulatoryEvidenceForm.buildingSafetyItemId)) {
                this.regulatoryEvidenceForm.buildingSafetyItemId = "";
            }
            if (this.regulatoryEvidenceForm.linkKind === "duerp_entry"
                && this.regulatoryEvidenceForm.duerpEntryId
                && !this.selectableDuerpEntries.some((entry) => entry.id === this.regulatoryEvidenceForm.duerpEntryId)) {
                this.regulatoryEvidenceForm.duerpEntryId = "";
            }
        }
    }
    logout() {
        this.clearAuthenticatedState(true, "logout");
        void this.router.navigateByUrl("/login");
    }
    getSiteTypeLabel(siteType) {
        switch (siteType) {
            case "site":
                return "Site";
            case "building":
                return "Bâtiment";
            case "office":
                return "Bureau";
            case "warehouse":
                return "Entrepôt";
        }
    }
    getSiteEnrichmentUiState(site) {
        const status = site.location_enrichment_status;
        switch (status) {
            case "enriched":
                return {
                    label: "Enrichissement terminé",
                    tone: "success",
                    detail: "Adresse reconnue et données de localisation prêtes.",
                    reasonLabel: null,
                    retryLabel: "Actualiser",
                    showRetryAsPrimary: false,
                };
            case "partial":
                return {
                    label: "Enrichissement partiel",
                    tone: "progress",
                    detail: "Le site a été enrichi partiellement. Une relance peut compléter les données.",
                    reasonLabel: this.getSiteEnrichmentReasonLabel(site.location_enrichment_last_error_reason),
                    retryLabel: "Relancer l’enrichissement",
                    showRetryAsPrimary: true,
                };
            case "no_match":
                return {
                    label: "Adresse non reconnue",
                    tone: "warning",
                    detail: "L'adresse n'a pas été reconnue automatiquement.",
                    reasonLabel: this.getSiteEnrichmentReasonLabel(site.location_enrichment_last_error_reason),
                    retryLabel: "Réessayer l’enrichissement",
                    showRetryAsPrimary: true,
                };
            case "failed":
                return {
                    label: "Enrichissement indisponible",
                    tone: "warning",
                    detail: "Le service n'a pas pu enrichir ce site pour le moment.",
                    reasonLabel: this.getSiteEnrichmentReasonLabel(site.location_enrichment_last_error_reason),
                    retryLabel: "Réessayer l’enrichissement",
                    showRetryAsPrimary: true,
                };
            default:
                return {
                    label: "Enrichissement non lancé",
                    tone: "neutral",
                    detail: "L'adresse n'a pas encore été vérifiée automatiquement.",
                    reasonLabel: null,
                    retryLabel: "Lancer l’enrichissement",
                    showRetryAsPrimary: false,
                };
        }
    }
    getSiteEnrichmentReasonLabel(reason) {
        switch (reason) {
            case "no_geocode_match":
                return "Adresse introuvable";
            case "ambiguous_address":
                return "Adresse ambiguë";
            case "risk_provider_unavailable":
                return "Risques temporairement indisponibles";
            case "provider_unavailable":
                return "Service temporairement indisponible";
            case "provider_response_invalid":
                return "Réponse externe invalide";
            default:
                return null;
        }
    }
    getSiteEnrichmentFeedbackMessage(site, created = false) {
        const prefix = created ? "Site ajouté." : "Enrichissement relancé.";
        switch (site.location_enrichment_status) {
            case "enriched":
                return created ? "Site ajouté et enrichi." : "Enrichissement du site terminé.";
            case "partial":
                return `${prefix} Enrichissement partiel.`;
            case "no_match":
                return `${prefix} Adresse non reconnue.`;
            case "failed":
                return `${prefix} Enrichissement indisponible pour le moment.`;
            default:
                return created ? "Site ajouté." : "Relance enregistrée.";
        }
    }
    getSiteNameById(siteId) {
        if (!siteId) {
            return "Entreprise";
        }
        return this.regulatoryAllSites.find((site) => site.siteId === siteId)?.name ?? "Site";
    }
    getRegulatoryAllSiteSourceLabel(site) {
        const sourceLabels = site.sourceKinds
            .filter((kind) => kind !== "declared")
            .map((kind) => this.getRegulatorySiteSourceKindLabel(kind));
        return sourceLabels.length > 0 ? sourceLabels.join(" · ") : "Site déclaré";
    }
    getRegulatoryAllSiteDetail(site) {
        const sourceLabels = site.sourceKinds
            .filter((kind) => kind !== "declared")
            .map((kind) => this.getRegulatorySiteSourceKindLabel(kind));
        if (site.declaredSite && sourceLabels.length === 0) {
            return "Site déjà exploitable dans le module.";
        }
        if (site.declaredSite && sourceLabels.length > 0) {
            return `Site utilisé dans ${sourceLabels.join(", ")}.`;
        }
        if (sourceLabels.length === 0) {
            return "Site repéré dans le module. Complétez-le pour fiabiliser l’adresse et l’enrichissement.";
        }
        return `Site repéré via ${sourceLabels.join(", ")}. Complétez-le pour fiabiliser l’adresse et l’enrichissement.`;
    }
    getBillingWorksiteNameById(worksiteId) {
        if (!worksiteId) {
            return "Aucun chantier lié";
        }
        return this.billingWorksites.find((worksite) => worksite.id === worksiteId)?.name ?? "Chantier";
    }
    getCustomerTypeLabel(customerType) {
        switch (customerType) {
            case "company":
                return "Entreprise";
            case "individual":
                return "Particulier";
        }
    }
    getWorksiteStatusLabel(status) {
        switch (status) {
            case "planned":
                return "Planifié";
            case "in_progress":
                return "En cours";
            case "blocked":
                return "Bloqué";
            case "completed":
                return "Terminé";
        }
    }
    getWorksiteStatusTone(status) {
        switch (status) {
            case "planned":
                return "calm";
            case "in_progress":
                return "progress";
            case "blocked":
                return "warning";
            case "completed":
                return "success";
        }
    }
    getWorksiteDocumentLifecycleStatusLabel(status) {
        switch (status) {
            case "draft":
                return "Brouillon";
            case "finalized":
                return "Finalisé";
        }
    }
    getWorksiteDocumentLifecycleStatusTone(status) {
        switch (status) {
            case "draft":
                return "progress";
            case "finalized":
                return "success";
        }
    }
    getWorksiteDocumentTechnicalStatusLabel(status) {
        switch (status) {
            case "pending":
                return "En préparation";
            case "available":
                return "Prêt";
            case "failed":
                return "À vérifier";
            case "archived":
                return "Archivé";
        }
    }
    getWorksiteDocumentTechnicalStatusTone(status) {
        switch (status) {
            case "pending":
                return "calm";
            case "available":
                return "success";
            case "failed":
                return "warning";
            case "archived":
                return "neutral";
        }
    }
    getWorksiteCoordinationStatusLabel(status) {
        switch (status) {
            case "todo":
                return "À faire";
            case "in_progress":
                return "En cours";
            case "done":
                return "Fait";
        }
    }
    getWorksiteCoordinationStatusTone(status) {
        switch (status) {
            case "todo":
                return "warning";
            case "in_progress":
                return "progress";
            case "done":
                return "success";
        }
    }
    getWorksiteDocumentSignatureStatusLabel(signatureId) {
        return signatureId ? "Signature liée" : "Aucune signature liée";
    }
    getWorksiteDocumentSignatureStatusTone(signatureId) {
        return signatureId ? "success" : "neutral";
    }
    isWorksiteSummaryDocumentType(documentType) {
        return documentType === "worksite_summary_pdf";
    }
    isWorksitePreventionPlanDocumentType(documentType) {
        return documentType === "worksite_prevention_plan_pdf";
    }
    formatWorksiteLinkedSignatureDetail(document) {
        if (!document.linked_signature_label) {
            return null;
        }
        const uploadedLabel = this.formatCompactDate(document.linked_signature_uploaded_at);
        if (uploadedLabel) {
            return `Signature du ${uploadedLabel}`;
        }
        if (document.linked_signature_file_name && document.linked_signature_file_name !== document.linked_signature_label) {
            return document.linked_signature_file_name;
        }
        return "Signature chantier liée";
    }
    mapLinkedWorksiteSignatureItem(document) {
        if (!document.linked_signature_id || !document.linked_signature_label) {
            return null;
        }
        const linkedSignature = this.worksiteSignatures.find((signature) => signature.id === document.linked_signature_id);
        const status = linkedSignature?.status ?? "available";
        return {
            id: document.linked_signature_id,
            label: document.linked_signature_label,
            detail: this.formatWorksiteLinkedSignatureDetail(document),
            statusLabel: this.getWorksiteDocumentTechnicalStatusLabel(status),
            statusTone: this.getWorksiteDocumentTechnicalStatusTone(status),
        };
    }
    mapLinkedWorksiteProofItems(document) {
        return document.linked_proofs.map((proof) => ({
            id: proof.id,
            label: proof.label,
            detail: this.formatWorksiteProofDetail(proof),
            statusLabel: this.getWorksiteDocumentTechnicalStatusLabel(proof.status),
            statusTone: this.getWorksiteDocumentTechnicalStatusTone(proof.status),
        }));
    }
    formatWorksiteLinkedProofsSummary(document) {
        if (document.linked_proofs.length === 0) {
            return null;
        }
        const labels = document.linked_proofs.map((proof) => proof.label);
        if (labels.length === 1) {
            return labels[0];
        }
        return `${labels.length} preuves liées : ${labels.join(", ")}`;
    }
    formatWorksiteProofDetail(proof) {
        const uploadedLabel = this.formatCompactDate(proof.uploaded_at);
        if (proof.notes && uploadedLabel) {
            return `${uploadedLabel} · ${proof.notes}`;
        }
        if (proof.notes) {
            return proof.notes;
        }
        return uploadedLabel;
    }
    getQuoteStatusLabel(status) {
        switch (status) {
            case "draft":
                return "Brouillon";
            case "sent":
                return "Envoyé";
            case "accepted":
                return "Accepté";
            case "declined":
                return "Refusé";
        }
    }
    getQuoteStatusTone(status) {
        switch (status) {
            case "draft":
                return "neutral";
            case "sent":
                return "progress";
            case "accepted":
                return "success";
            case "declined":
                return "warning";
        }
    }
    getInvoiceStatusLabel(status) {
        switch (status) {
            case "draft":
                return "Brouillon";
            case "issued":
                return "Émise";
            case "paid":
                return "Payée";
            case "overdue":
                return "En retard";
        }
    }
    getInvoiceStatusTone(status) {
        switch (status) {
            case "draft":
                return "neutral";
            case "issued":
                return "progress";
            case "paid":
                return "success";
            case "overdue":
                return "warning";
        }
    }
    getBillingFollowUpStatusLabel(status) {
        switch (status) {
            case "normal":
                return "Suivi normal";
            case "to_follow_up":
                return "À relancer";
            case "followed_up":
                return "Relancé";
            case "waiting_customer":
                return "En attente client";
        }
    }
    getBillingFollowUpStatusTone(status) {
        switch (status) {
            case "normal":
                return "neutral";
            case "to_follow_up":
                return "warning";
            case "followed_up":
                return "progress";
            case "waiting_customer":
                return "calm";
        }
    }
    getDashboardActionPriorityLabel(priority) {
        switch (priority) {
            case "high":
                return "Haute";
            case "medium":
                return "Moyenne";
            case "low":
                return "Basse";
        }
    }
    getDashboardActionPriorityTone(priority) {
        switch (priority) {
            case "high":
                return "warning";
            case "medium":
                return "progress";
            case "low":
                return "neutral";
        }
    }
    getDashboardActionModuleLabel(module) {
        switch (module) {
            case "reglementation":
                return "Réglementation";
            case "chantier":
                return "Chantier";
            case "facturation":
                return "Facturation";
        }
    }
    getDashboardActionModuleTone(module) {
        switch (module) {
            case "reglementation":
                return "calm";
            case "chantier":
                return "progress";
            case "facturation":
                return "neutral";
        }
    }
    getBetaFeedbackCategoryLabel(category) {
        switch (category) {
            case "blocking":
                return "Bloquant";
            case "unclear":
                return "Incompréhension";
            case "improvement":
                return "Amélioration";
            case "positive":
                return "Retour positif";
        }
    }
    getBetaFeedbackAreaLabel(area) {
        switch (area) {
            case "cockpit":
                return "Cockpit";
            case "worksite":
                return "Chantier";
            case "worksite_document":
                return "Documents chantier";
            case "facturation":
                return "Facturation";
            case "reglementation":
                return "Réglementation";
            case "sync":
                return "Synchronisation visible";
            case "other":
                return "Autre";
        }
    }
    getDashboardActionPriorityRank(priority) {
        switch (priority) {
            case "high":
                return 1;
            case "medium":
                return 2;
            case "low":
                return 3;
        }
    }
    getDashboardOverviewSignalRank(label) {
        switch (label) {
            case "À traiter":
                return 1;
            case "À suivre":
                return 2;
            default:
                return 3;
        }
    }
    getCoordinationStatusRank(status) {
        switch (status) {
            case "todo":
                return 1;
            case "in_progress":
                return 2;
            case "done":
                return 3;
        }
    }
    formatDashboardDocumentSummary(label, entries, emptyWord) {
        if (entries.length === 0) {
            return `${label} : ${emptyWord}.`;
        }
        const preview = entries.slice(0, 2).join(", ");
        const remaining = entries.length - 2;
        if (remaining > 0) {
            return `${label} : ${preview} + ${remaining} autre${remaining > 1 ? "s" : ""}.`;
        }
        return `${label} : ${preview}.`;
    }
    formatCompactDate(value) {
        if (!value) {
            return null;
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    }
    formatAmountCents(amountCents, currency = "EUR") {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency,
        }).format(amountCents / 100);
    }
    getAuditChangeValue(log, field, side) {
        const entry = log.changes?.[field];
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            return null;
        }
        return entry[side] ?? null;
    }
    getAuditScalarValue(log, field) {
        return log.changes?.[field] ?? null;
    }
    isQuoteStatus(value) {
        return value === "draft" || value === "sent" || value === "accepted" || value === "declined";
    }
    isInvoiceStatus(value) {
        return value === "draft" || value === "issued" || value === "paid" || value === "overdue";
    }
    isBillingFollowUpStatus(value) {
        return (value === "normal"
            || value === "to_follow_up"
            || value === "followed_up"
            || value === "waiting_customer");
    }
    mapCockpitTone(tone) {
        return tone;
    }
    getBuildingSafetyTypeLabel(itemType) {
        switch (itemType) {
            case "fire_extinguisher":
                return "Extincteur";
            case "dae":
                return "DAE";
            case "periodic_check":
                return "Contrôle périodique";
        }
    }
    getBuildingSafetyAlertStatusLabel(alertStatus) {
        switch (alertStatus) {
            case "ok":
                return "À jour";
            case "due_soon":
                return "Échéance proche";
            case "overdue":
                return "En retard";
            case "archived":
                return "Archivé";
        }
    }
    getBuildingSafetyAlertStatusTone(alertStatus) {
        switch (alertStatus) {
            case "ok":
                return "success";
            case "due_soon":
                return "progress";
            case "overdue":
                return "warning";
            case "archived":
                return "neutral";
        }
    }
    getBuildingSafetySummaryLabel(kind) {
        const count = kind === "overdue"
            ? this.buildingSafetyOverdueCount
            : kind === "due_soon"
                ? this.buildingSafetyDueSoonCount
                : this.buildingSafetyOkCount;
        if (kind === "overdue") {
            return `${count} en retard`;
        }
        if (kind === "due_soon") {
            return `${count} échéance${count > 1 ? "s" : ""} proche${count > 1 ? "s" : ""}`;
        }
        return `${count} à jour`;
    }
    getObligationCountLabel() {
        const count = this.regulatoryProfile?.applicable_obligations.length ?? 0;
        return `${count} obligation${count > 1 ? "s" : ""} détectée${count > 1 ? "s" : ""}`;
    }
    getRegulatoryFamilyLabel(category) {
        switch (category) {
            case "company":
                return "Documents obligatoires";
            case "employees":
                return "Salariés / organisation";
            case "safety":
                return "Sécurité / prévention";
            case "buildings":
                return "Sites / conformité visible";
        }
    }
    openObligationDetail(obligationId) {
        this.selectedObligationId = obligationId;
    }
    getObligationCategoryLabel(category) {
        switch (category) {
            case "company":
                return "Entreprise";
            case "employees":
                return "Salariés";
            case "safety":
                return "Sécurité";
            case "buildings":
                return "Bâtiments";
        }
    }
    getObligationPriorityLabel(priority) {
        switch (priority) {
            case "high":
                return "Priorité haute";
            case "medium":
                return "Priorité moyenne";
            case "low":
                return "Priorité basse";
        }
    }
    getObligationPriorityTone(priority) {
        switch (priority) {
            case "high":
                return "warning";
            case "medium":
                return "progress";
            case "low":
                return "neutral";
        }
    }
    getComplianceStatusLabel(status) {
        switch (status) {
            case "to_complete":
                return "À compléter";
            case "in_progress":
                return "En cours";
            case "compliant":
                return "Conforme";
            case "to_verify":
                return "À vérifier";
            case "overdue":
                return "En retard";
        }
    }
    getComplianceStatusTone(status) {
        switch (status) {
            case "to_complete":
                return "calm";
            case "in_progress":
                return "progress";
            case "compliant":
                return "success";
            case "to_verify":
                return "warning";
            case "overdue":
                return "warning";
        }
    }
    getDocumentStatusLabel(status) {
        switch (status) {
            case "pending":
                return "À compléter";
            case "available":
                return "Disponible";
            case "failed":
                return "À vérifier";
            case "archived":
                return "Archivé";
        }
    }
    getDocumentStatusTone(status) {
        switch (status) {
            case "pending":
                return "progress";
            case "available":
                return "success";
            case "failed":
                return "warning";
            case "archived":
                return "neutral";
        }
    }
    getObligationFirstAction(obligation, evidenceCount) {
        if (evidenceCount > 0 && obligation.status === "compliant") {
            return "Gardez cette pièce à jour et vérifiez simplement qu'elle reste valable pour le prochain contrôle.";
        }
        switch (obligation.id) {
            case "reg-employees-register":
                return "Préparez un modèle de registre du personnel et identifiez qui le mettra à jour dans l'entreprise.";
            case "reg-employees-safety-organization":
                return "Rassemblez les consignes d'accueil sécurité, le contact interne utile et la première preuve associée.";
            case "reg-sites-emergency-contacts":
                return "Listez les contacts d'urgence et le point de rassemblement pour chaque site actif.";
            case "reg-buildings-periodic-checks":
                return "Recensez les vérifications périodiques à suivre sur vos bâtiments et ajoutez une première preuve de contrôle.";
            case "reg-warehouse-storage-rules":
                return "Identifiez les zones de stockage sensibles et formalisez une première consigne simple de rangement ou de stockage.";
        }
        return "Commencez par rassembler une première preuve simple et clarifier qui suit ce sujet dans l'entreprise.";
    }
    getDuerpSeverityLabel(severity) {
        switch (severity) {
            case "low":
                return "Gravité faible";
            case "medium":
                return "Gravité moyenne";
            case "high":
                return "Gravité haute";
        }
    }
    getDuerpSeverityTone(severity) {
        switch (severity) {
            case "low":
                return "neutral";
            case "medium":
                return "progress";
            case "high":
                return "warning";
        }
    }
    getRegulatoryEvidenceLinkKindLabel(kind) {
        switch (kind) {
            case "obligation":
                return "Obligation";
            case "site":
                return "Site";
            case "building_safety_item":
                return "Sécurité bâtiment";
            case "duerp_entry":
                return "DUERP";
        }
    }
    getCriterionTone(value) {
        if (value === null) {
            return "progress";
        }
        if (typeof value === "number") {
            return value > 0 ? "success" : "neutral";
        }
        return value ? "success" : "neutral";
    }
    getRegulatoryBooleanCriterion(code) {
        const criterion = this.regulatoryProfile?.criteria.find((entry) => entry.code === code);
        return typeof criterion?.value === "boolean" ? criterion.value : null;
    }
    getRegulatorySiteDedupKey(siteId, name, address) {
        if (siteId) {
            return `id:${siteId}`;
        }
        const normalizedName = (name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
        const normalizedAddress = (address ?? "").trim().toLowerCase().replace(/\s+/g, " ");
        return `fallback:${normalizedName}|${normalizedAddress}`;
    }
    getRegulatorySiteSourceKindLabel(kind) {
        switch (kind) {
            case "declared":
                return "site";
            case "duerp":
                return "DUERP";
            case "building_safety":
                return "sécurité bâtiment";
            case "evidence":
                return "preuves";
        }
    }
    getProblematicRegulatorySite() {
        return this.activeOrganizationSites.find((site) => site.location_enrichment_status === "failed" || site.location_enrichment_status === "no_match")
            ?? this.activeOrganizationSites.find((site) => site.location_enrichment_status === "partial")
            ?? this.activeOrganizationSites.find((site) => site.location_enrichment_status == null)
            ?? null;
    }
    getHighestPriorityDuerpEntry() {
        return [...this.activeDuerpEntries]
            .sort((left, right) => {
            const leftRank = left.severity === "high" ? 0 : left.severity === "medium" ? 1 : 2;
            const rightRank = right.severity === "high" ? 0 : right.severity === "medium" ? 1 : 2;
            return leftRank - rightRank || left.work_unit_name.localeCompare(right.work_unit_name);
        })[0] ?? null;
    }
    getNextEvidenceGapObligation() {
        const sortedObligations = [...this.regulatoryObligations].sort((left, right) => this.getRegulatoryObligationRank(left) - this.getRegulatoryObligationRank(right));
        return sortedObligations.find((obligation) => {
            const evidenceCount = this.regulatoryEvidences.filter((evidence) => evidence.status === "available" && evidence.obligation_id === obligation.id).length;
            return evidenceCount === 0 && obligation.status !== "compliant";
        })
            ?? sortedObligations.find((obligation) => this.regulatoryEvidences.every((evidence) => evidence.status !== "available" || evidence.obligation_id !== obligation.id))
            ?? null;
    }
    getRegulatoryObligationAction(obligation, evidenceCount) {
        switch (obligation.id) {
            case "reg-employees-register":
                if (this.regulatoryProfile?.profile_status !== "ready" || this.isOnboardingPending) {
                    return {
                        actionLabel: "Compléter le profil",
                        actionKind: "scroll",
                        sectionId: "reg-profile-section",
                        obligationId: null,
                        siteId: null,
                    };
                }
                break;
            case "reg-employees-safety-organization":
                return {
                    actionLabel: "Ouvrir DUERP",
                    actionKind: "scroll",
                    sectionId: "reg-duerp-section",
                    obligationId: null,
                    siteId: null,
                };
            case "reg-sites-emergency-contacts":
                return {
                    actionLabel: evidenceCount > 0 ? "Voir les preuves" : "Ajouter une preuve",
                    actionKind: "scroll",
                    sectionId: "reg-evidence-section",
                    obligationId: obligation.id,
                    siteId: null,
                };
            case "reg-buildings-periodic-checks":
                return {
                    actionLabel: "Voir la sécurité",
                    actionKind: "scroll",
                    sectionId: "reg-building-safety-section",
                    obligationId: null,
                    siteId: null,
                };
            case "reg-warehouse-storage-rules":
                return {
                    actionLabel: this.regulatoryAllSites.length === 0
                        ? "Ajouter un site"
                        : this.activeOrganizationSites.length > 0
                            ? "Vérifier un site"
                            : "Compléter les sites",
                    actionKind: "scroll",
                    sectionId: "reg-sites-section",
                    obligationId: null,
                    siteId: null,
                };
        }
        return {
            actionLabel: "Ouvrir l’obligation",
            actionKind: "scroll",
            sectionId: "reg-obligations-section",
            obligationId: obligation.id,
            siteId: null,
        };
    }
    getRegulatoryShowcaseActionGroupKey(action) {
        return action.actionKind === "site_enrichment"
            ? `site:${action.siteId ?? "missing"}`
            : `scroll:${action.sectionId}`;
    }
    buildRegulatoryPriorityCandidates() {
        const candidates = [];
        const missingProfileItems = this.regulatoryProfile?.missing_profile_items ?? [];
        const allSites = this.regulatoryAllSites;
        const inferredOnlySites = allSites.filter((site) => !site.declaredSite);
        const problematicSite = this.getProblematicRegulatorySite();
        const problematicSiteState = problematicSite ? this.getSiteEnrichmentUiState(problematicSite) : null;
        const highestSeverityEntry = this.getHighestPriorityDuerpEntry();
        const highRiskWork = this.getRegulatoryBooleanCriterion("performs_high_risk_work") === true;
        if (this.isOnboardingPending || missingProfileItems.length > 0) {
            const missingLabel = missingProfileItems.length > 0
                ? missingProfileItems.slice(0, 2).join(", ")
                : "les informations essentielles";
            candidates.push({
                id: "priority-profile",
                title: "Compléter le profil entreprise",
                familyLabel: "Profil",
                levelLabel: "À compléter",
                tone: "progress",
                impact: `Il manque encore ${missingLabel} pour fiabiliser le périmètre réglementaire.`,
                context: "Le profil reste la base du copilote de conformité.",
                focusLabel: null,
                actionLabel: "Compléter le profil",
                actionKind: "scroll",
                sectionId: "reg-profile-section",
                obligationId: null,
                siteId: null,
                rank: 18,
            });
        }
        if (allSites.length === 0) {
            candidates.push({
                id: "priority-first-site",
                title: "Déclarer un premier site",
                familyLabel: "Sites",
                levelLabel: "À compléter",
                tone: "progress",
                impact: "Sans site déclaré, la lecture réglementaire reste plus générale et moins démonstrative.",
                context: "Un site reconnu rend tout de suite le module plus concret.",
                focusLabel: null,
                actionLabel: "Ajouter un site",
                actionKind: "scroll",
                sectionId: "reg-sites-section",
                obligationId: null,
                siteId: null,
                rank: 26,
            });
        }
        else if (inferredOnlySites.length > 0) {
            candidates.push({
                id: "priority-sites-to-consolidate",
                title: "Compléter les sites suivis",
                familyLabel: "Sites",
                levelLabel: "À vérifier",
                tone: "progress",
                impact: `${inferredOnlySites.length} site${inferredOnlySites.length > 1 ? "s apparaissent" : " apparait"} déjà dans le DUERP, la sécurité ou les preuves.`,
                context: "Fiabiliser ces sites supprime les contradictions visibles du module.",
                focusLabel: inferredOnlySites[0]?.name ?? null,
                actionLabel: "Vérifier les sites",
                actionKind: "scroll",
                sectionId: "reg-sites-section",
                obligationId: null,
                siteId: null,
                rank: 22,
            });
        }
        if (problematicSite && problematicSiteState) {
            const status = problematicSite.location_enrichment_status;
            candidates.push({
                id: `priority-site-${problematicSite.id}`,
                title: `Fiabiliser ${problematicSite.name}`,
                familyLabel: "Sites",
                levelLabel: status === "failed" || status === "no_match"
                    ? "À vérifier"
                    : "À compléter",
                tone: status === "failed" || status === "no_match"
                    ? "warning"
                    : "progress",
                impact: status === "failed"
                    ? `${problematicSite.name} n'a pas pu être enrichi pour le moment.`
                    : status === "no_match"
                        ? `${problematicSite.name} n'a pas encore d'adresse reconnue automatiquement.`
                        : status === "partial"
                            ? `${problematicSite.name} reste enrichi partiellement.`
                            : `${problematicSite.name} n'a pas encore été vérifié automatiquement.`,
                context: problematicSiteState.reasonLabel
                    ?? "Les sites fiables renforcent la lecture réglementaire par adresse et bâtiment.",
                focusLabel: problematicSite.name,
                actionLabel: problematicSiteState.retryLabel,
                actionKind: "site_enrichment",
                sectionId: "reg-sites-section",
                obligationId: null,
                siteId: problematicSite.id,
                rank: status === "failed"
                    ? 12
                    : status === "no_match"
                        ? 14
                        : status === "partial"
                            ? 20
                            : 28,
            });
        }
        if (this.globalBuildingSafetyOverdueCount > 0) {
            candidates.push({
                id: "priority-building-safety",
                title: "Traiter les contrôles bâtiment en retard",
                familyLabel: "Sécurité / prévention",
                levelLabel: "Prioritaire",
                tone: "warning",
                impact: `${this.globalBuildingSafetyOverdueCount} contrôle${this.globalBuildingSafetyOverdueCount > 1 ? "s" : ""} demande${this.globalBuildingSafetyOverdueCount > 1 ? "nt" : ""} une action rapide.`,
                context: "Ces contrôles sont très démonstratifs dans une revue de conformité.",
                focusLabel: this.buildingSafetyItems.find((item) => item.alert_status === "overdue")?.name
                    ?? null,
                actionLabel: "Voir la sécurité",
                actionKind: "scroll",
                sectionId: "reg-building-safety-section",
                obligationId: null,
                siteId: null,
                rank: 6,
            });
        }
        if (this.activeDuerpEntries.length > 0 || highRiskWork) {
            candidates.push({
                id: "priority-duerp",
                title: this.activeDuerpEntries.length > 0 ? "Reprendre le DUERP actif" : "Ouvrir le DUERP",
                familyLabel: "Sécurité / prévention",
                levelLabel: this.activeDuerpEntries.length === 0
                    ? "À compléter"
                    : highestSeverityEntry?.severity === "high"
                        ? "À vérifier"
                        : "En cours",
                tone: this.activeDuerpEntries.length === 0
                    ? "progress"
                    : highestSeverityEntry?.severity === "high"
                        ? "warning"
                        : "progress",
                impact: this.activeDuerpEntries.length === 0
                    ? "Les interventions à risque méritent au moins un premier risque documenté."
                    : `${this.activeDuerpEntries.length} risque${this.activeDuerpEntries.length > 1 ? "s" : ""} actif${this.activeDuerpEntries.length > 1 ? "s" : ""} reste${this.activeDuerpEntries.length > 1 ? "nt" : ""} à consolider.`,
                context: highestSeverityEntry
                    ? `${highestSeverityEntry.work_unit_name} · ${highestSeverityEntry.risk_label}`
                    : "Le DUERP relie déjà la conformité aux sites, à la prévention et aux preuves terrain.",
                focusLabel: highestSeverityEntry?.site_id ? this.getSiteNameById(highestSeverityEntry.site_id) : "DUERP",
                actionLabel: "Ouvrir DUERP",
                actionKind: "scroll",
                sectionId: "reg-duerp-section",
                obligationId: null,
                siteId: null,
                rank: this.activeDuerpEntries.length === 0 ? 24 : highestSeverityEntry?.severity === "high" ? 18 : 26,
            });
        }
        const occupiedTargets = new Set(candidates.map((candidate) => this.getRegulatoryShowcaseActionGroupKey(candidate)));
        for (const obligation of this.regulatoryObligations.slice().sort((left, right) => this.getRegulatoryObligationRank(left) - this.getRegulatoryObligationRank(right))) {
            const evidenceCount = this.regulatoryEvidences.filter((evidence) => evidence.obligation_id === obligation.id).length;
            const action = this.getRegulatoryObligationAction(obligation, evidenceCount);
            if (occupiedTargets.has(this.getRegulatoryShowcaseActionGroupKey(action))) {
                continue;
            }
            occupiedTargets.add(this.getRegulatoryShowcaseActionGroupKey(action));
            candidates.push({
                id: `priority-obligation-${obligation.id}`,
                title: obligation.title,
                familyLabel: this.getRegulatoryFamilyLabel(obligation.category),
                levelLabel: obligation.status === "overdue"
                    ? "Prioritaire"
                    : this.getComplianceStatusLabel(obligation.status),
                tone: obligation.status === "overdue"
                    ? "warning"
                    : this.getComplianceStatusTone(obligation.status),
                impact: obligation.reason_summary,
                context: this.getObligationFirstAction(obligation, evidenceCount),
                focusLabel: null,
                actionLabel: action.actionLabel,
                actionKind: action.actionKind,
                sectionId: action.sectionId,
                obligationId: action.obligationId,
                siteId: action.siteId,
                rank: this.getRegulatoryObligationRank(obligation),
            });
        }
        return candidates;
    }
    getRegulatoryFamilyEmptyDetail(category) {
        switch (category) {
            case "company":
                return "Cette famille se précisera dès que le profil entreprise sera mieux cadré.";
            case "employees":
                return "Les sujets salariés apparaitront ici dès que le profil d’entreprise les rendra pertinents.";
            case "safety":
                return "Les sujets prévention remonteront ici avec les premiers repères sécurité et DUERP.";
            case "buildings":
                return "Les sujets liés aux sites et bâtiments gagneront en précision avec des sites enrichis et suivis.";
        }
    }
    getRegulatorySiteInsight() {
        const allSites = this.regulatoryAllSites;
        const activeSites = this.activeOrganizationSites;
        if (allSites.length === 0) {
            return { label: "Aucun site déclaré", tone: "neutral" };
        }
        const failedOrNoMatchCount = activeSites.filter((site) => site.location_enrichment_status === "failed" || site.location_enrichment_status === "no_match").length;
        if (failedOrNoMatchCount > 0) {
            return {
                label: `${failedOrNoMatchCount} site${failedOrNoMatchCount > 1 ? "s" : ""} à vérifier`,
                tone: "warning",
            };
        }
        const partialCount = activeSites.filter((site) => site.location_enrichment_status === "partial").length;
        if (partialCount > 0) {
            return {
                label: `${partialCount} site${partialCount > 1 ? "s" : ""} à compléter`,
                tone: "progress",
            };
        }
        if (activeSites.length === 0) {
            return {
                label: `${allSites.length} site${allSites.length > 1 ? "s suivis" : " suivi"}`,
                tone: "calm",
            };
        }
        const enrichedCount = activeSites.filter((site) => site.location_enrichment_status === "enriched").length;
        if (enrichedCount > 0) {
            return {
                label: enrichedCount === activeSites.length
                    ? `${allSites.length} site${allSites.length > 1 ? "s prêts" : " prêt"}`
                    : `${enrichedCount} site${enrichedCount > 1 ? "s" : ""} prêt${enrichedCount > 1 ? "s" : ""}`,
                tone: "success",
            };
        }
        return {
            label: `${allSites.length} site${allSites.length > 1 ? "s" : ""} à vérifier`,
            tone: "progress",
        };
    }
    getRegulatoryObligationRank(obligation) {
        const statusRank = (() => {
            switch (obligation.status) {
                case "overdue":
                    return 0;
                case "to_verify":
                    return 10;
                case "to_complete":
                    return 20;
                case "in_progress":
                    return 30;
                case "compliant":
                    return 40;
            }
        })();
        const priorityRank = (() => {
            switch (obligation.priority) {
                case "high":
                    return 0;
                case "medium":
                    return 2;
                case "low":
                    return 4;
            }
        })();
        return statusRank + priorityRank;
    }
    scrollToWorkspaceSection(sectionId) {
        const executeScroll = () => {
            globalThis.document?.getElementById(sectionId)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        };
        if (typeof globalThis.requestAnimationFrame === "function") {
            globalThis.requestAnimationFrame(executeScroll);
            return;
        }
        globalThis.setTimeout(executeScroll, 0);
    }
    async refreshSession(organizationId) {
        if (!this.accessToken) {
            return;
        }
        if (AppComponent.DISABLE_BOOTSTRAP_SESSION_RESTORE) {
            return;
        }
        this.sessionRestoreInProgress = true;
        this.errorMessage = "";
        try {
            const session = await fetchSession(this.accessToken, organizationId);
            this.session = session;
            this.selectedOrganizationId = session.current_membership.organization.id;
            persistSession(this.accessToken, session);
            await this.ensureAccessibleWorkspaceRoute();
        }
        catch (error) {
            const nextErrorMessage = this.toErrorMessage(error, "load");
            this.errorMessage = nextErrorMessage;
            const shouldClearAuth = error instanceof ApiClientError
                && (error.status === 401 || error.status === 403);
            if (shouldClearAuth) {
                this.clearAuthenticatedState(true, `session refresh failed with ${error.status}`);
            }
            if (shouldClearAuth && !this.shouldRenderLoginScreen) {
                await this.router.navigateByUrl("/login");
            }
        }
        finally {
            this.sessionRestoreInProgress = false;
        }
    }
    clearScheduledWorkspaceRefresh() {
        if (this.workspaceRefreshScheduledHandle !== null) {
            globalThis.clearTimeout(this.workspaceRefreshScheduledHandle);
            this.workspaceRefreshScheduledHandle = null;
        }
        this.workspaceRefreshScheduledOrganizationId = null;
        this.workspaceRefreshScheduledReason = null;
    }
    scheduleWorkspaceRefresh(reason) {
        if (AppComponent.WORKSPACE_LOADING_DISABLED) {
            return;
        }
        const currentPath = this.router.url.split("#")[0] || "/login";
        const organizationId = this.selectedOrganizationId;
        if (!this.session || !organizationId || !this.isShellRoutePath(currentPath)) {
            return;
        }
        if (this.workspaceHydratedOrganizationId === organizationId && this.hasWorkspaceContent) {
            return;
        }
        if (this.workspaceRefreshInFlight) {
            return;
        }
        if (this.workspaceRefreshScheduledOrganizationId === organizationId) {
            return;
        }
        this.clearScheduledWorkspaceRefresh();
        this.workspaceRefreshScheduledOrganizationId = organizationId;
        this.workspaceRefreshScheduledReason = reason;
        this.workspaceRefreshScheduledHandle = globalThis.setTimeout(() => {
            const scheduledReason = this.workspaceRefreshScheduledReason ?? reason;
            const scheduledOrganizationId = this.workspaceRefreshScheduledOrganizationId;
            this.clearScheduledWorkspaceRefresh();
            const activePath = this.router.url.split("#")[0] || "/login";
            if (!scheduledOrganizationId
                || !this.session
                || !this.selectedOrganizationId
                || this.selectedOrganizationId !== scheduledOrganizationId
                || !this.isShellRoutePath(activePath)) {
                return;
            }
            void this.refreshOrganizationWorkspaceSafely(scheduledReason, scheduledOrganizationId);
        }, 0);
    }
    async resolveWorkspaceRequest(label, requestFactory, fallbackValue) {
        try {
            const payload = await requestFactory();
            this.clearWorkspaceSegmentIssue(label);
            return payload;
        }
        catch (error) {
            this.setWorkspaceSegmentIssue(label, this.toWorkspaceSegmentIssueMessage(label, error));
            console.warn("[workspace] segment failed.", {
                label,
                organizationId: this.selectedOrganizationId,
                errorName: error instanceof Error ? error.name : typeof error,
                errorMessage: error instanceof Error ? error.message : String(error),
            });
            return fallbackValue;
        }
    }
    async refreshOrganizationWorkspace() {
        if (!this.accessToken || !this.selectedOrganizationId) {
            this.workspaceHydratedOrganizationId = null;
            this.workspaceSegmentIssues = {};
            this.resetWorkspaceState();
            return;
        }
        if (AppComponent.WORKSPACE_LOADING_DISABLED) {
            this.workspaceHydratedOrganizationId = null;
            this.workspaceSegmentIssues = {};
            this.organizationWorkspaceLoading = false;
            this.resetWorkspaceState();
            return;
        }
        if (this.workspaceHydratedOrganizationId !== this.selectedOrganizationId) {
            this.workspaceSegmentIssues = {};
        }
        this.organizationWorkspaceLoading = true;
        try {
            const billingEnabled = this.isFacturationEnabled;
            const chantierEnabled = this.isChantierEnabled;
            const regulationEnabled = this.isReglementationEnabled;
            if (!regulationEnabled) {
                this.clearWorkspaceSegmentIssue("building-safety-alerts");
                this.clearWorkspaceSegmentIssue("duerp-entries");
                this.clearWorkspaceSegmentIssue("regulatory-evidences");
            }
            const runWorkspaceRequest = (label, requestFactory, fallbackValue) => this.resolveWorkspaceRequest(label, requestFactory, fallbackValue);
            const shouldLoadWorksites = billingEnabled || chantierEnabled;
            const cockpitSummary = this.canReadOrganization
                ? await runWorkspaceRequest("cockpit-summary", () => fetchCockpitSummary(this.accessToken, this.selectedOrganizationId), null)
                : null;
            this.cockpitSummary = cockpitSummary;
            const profile = await runWorkspaceRequest("organization-profile", () => fetchOrganizationProfile(this.accessToken, this.selectedOrganizationId), this.currentMembership?.organization ?? null);
            const sites = await runWorkspaceRequest("organization-sites", () => listOrganizationSites(this.accessToken, this.selectedOrganizationId), []);
            const regulatoryProfile = regulationEnabled
                ? await runWorkspaceRequest("regulatory-profile", () => fetchOrganizationRegulatoryProfile(this.accessToken, this.selectedOrganizationId), null)
                : null;
            const buildingSafetyItems = regulationEnabled
                ? await runWorkspaceRequest("building-safety-items", () => listBuildingSafetyItems(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const buildingSafetyAlerts = regulationEnabled
                ? await runWorkspaceRequest("building-safety-alerts", () => listBuildingSafetyAlerts(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const duerpEntries = regulationEnabled
                ? await runWorkspaceRequest("duerp-entries", () => listDuerpEntries(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const regulatoryEvidences = regulationEnabled
                ? await runWorkspaceRequest("regulatory-evidences", () => listRegulatoryEvidences(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const customers = billingEnabled
                ? await runWorkspaceRequest("billing-customers", () => listBillingCustomers(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const worksites = shouldLoadWorksites
                ? await runWorkspaceRequest("worksites", () => listWorksites(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const worksiteDocuments = chantierEnabled
                ? await runWorkspaceRequest("worksite-documents", () => listWorksiteDocuments(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const worksiteProofs = chantierEnabled
                ? await runWorkspaceRequest("worksite-proofs", () => listWorksiteProofs(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const worksiteSignatures = chantierEnabled
                ? await runWorkspaceRequest("worksite-signatures", () => listWorksiteSignatures(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const worksiteAssignees = chantierEnabled && this.canReadUsers
                ? await runWorkspaceRequest("worksite-assignees", () => listWorksiteAssignees(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const quotes = billingEnabled
                ? await runWorkspaceRequest("quotes", () => listQuotes(this.accessToken, this.selectedOrganizationId), [])
                : [];
            const invoices = billingEnabled
                ? await runWorkspaceRequest("invoices", () => listInvoices(this.accessToken, this.selectedOrganizationId), [])
                : [];
            this.organizationProfile = profile;
            this.organizationSites = this.sortSites(sites);
            this.regulatoryProfile = regulatoryProfile;
            this.billingCustomers = customers;
            this.billingWorksites = worksites;
            this.worksiteDocuments = worksiteDocuments;
            this.worksiteProofs = worksiteProofs;
            this.worksiteSignatures = worksiteSignatures;
            this.worksiteAssignees = worksiteAssignees;
            if (this.selectedCoordinationAssigneeFilter !== "all"
                && this.selectedCoordinationAssigneeFilter !== "unassigned"
                && !worksiteAssignees.some((assignee) => assignee.user_id === this.selectedCoordinationAssigneeFilter)) {
                this.selectedCoordinationAssigneeFilter = "all";
            }
            this.worksiteCoordinationDrafts = chantierEnabled
                ? Object.fromEntries(worksites.map((worksite) => [worksite.id, this.buildCoordinationDraft(worksite.coordination)]))
                : {};
            this.worksiteDocumentCoordinationDrafts = chantierEnabled
                ? Object.fromEntries(worksiteDocuments.map((document) => [document.id, this.buildCoordinationDraft(document.coordination)]))
                : {};
            if (this.selectedWorksiteCoordinationId
                && !worksites.some((worksite) => worksite.id === this.selectedWorksiteCoordinationId)) {
                this.selectedWorksiteCoordinationId = null;
            }
            if (!chantierEnabled) {
                this.selectedWorksiteCoordinationId = null;
                this.selectedCoordinationStatusFilter = "all";
                this.selectedCoordinationAssigneeFilter = "all";
            }
            if (this.selectedWorksiteDocumentDetailId
                && !this.worksiteDocuments.some((document) => document.id === this.selectedWorksiteDocumentDetailId)) {
                this.selectedWorksiteDocumentDetailId = null;
            }
            if (this.selectedWorksiteDocumentFilterId !== "all"
                && !worksites.some((worksite) => worksite.id === this.selectedWorksiteDocumentFilterId)) {
                this.selectedWorksiteDocumentFilterId = "all";
            }
            this.worksiteDocumentDownloadBusyId = null;
            this.worksiteDocumentPdfBusyId = null;
            this.worksiteCoordinationBusyId = null;
            this.worksiteDocumentCoordinationBusyId = null;
            this.worksiteDocumentStatusBusyId = null;
            this.worksitePreventionPlanPdfBusyId = null;
            if (this.worksitePreventionPlanEditingId
                && !worksites.some((worksite) => worksite.id === this.worksitePreventionPlanEditingId)) {
                this.cancelWorksitePreventionPlanEditing();
            }
            this.quotes = quotes;
            this.invoices = invoices;
            this.quoteEditingId = null;
            this.quoteEditingSaving = false;
            this.quoteFollowUpBusyId = null;
            this.invoiceEditingId = null;
            this.invoiceEditingSaving = false;
            this.invoiceFollowUpBusyId = null;
            if (this.quoteHistoryOpenId && !quotes.some((quote) => quote.id === this.quoteHistoryOpenId)) {
                this.quoteHistoryOpenId = null;
            }
            this.quoteHistoryById = Object.fromEntries(Object.entries(this.quoteHistoryById).filter(([quoteId]) => quotes.some((quote) => quote.id === quoteId)));
            if (this.invoiceHistoryOpenId && !invoices.some((invoice) => invoice.id === this.invoiceHistoryOpenId)) {
                this.invoiceHistoryOpenId = null;
            }
            this.invoiceHistoryById = Object.fromEntries(Object.entries(this.invoiceHistoryById).filter(([invoiceId]) => invoices.some((invoice) => invoice.id === invoiceId)));
            this.hydrateBillingDraftsIfNeeded(billingEnabled);
            if (!regulationEnabled) {
                this.selectedObligationId = null;
            }
            else {
                if (this.selectedObligationId
                    && !regulatoryProfile?.applicable_obligations.some((obligation) => obligation.id === this.selectedObligationId)) {
                    this.selectedObligationId = null;
                }
                if (!this.selectedObligationId) {
                    this.selectedObligationId = regulatoryProfile?.applicable_obligations[0]?.id ?? null;
                }
            }
            this.buildingSafetyItems = buildingSafetyItems;
            this.buildingSafetyAlerts = buildingSafetyAlerts;
            this.duerpEntries = duerpEntries;
            this.regulatoryEvidences = regulatoryEvidences;
            if (this.selectedSafetySiteId !== "all"
                && !this.organizationSites.some((site) => site.id === this.selectedSafetySiteId)) {
                this.selectedSafetySiteId = "all";
            }
            if (!this.buildingSafetyForm.siteId) {
                this.buildingSafetyForm.siteId = this.activeOrganizationSites[0]?.id ?? "";
            }
            if (!this.buildingSafetyEditingId && this.selectedSafetySiteId !== "all") {
                this.buildingSafetyForm.siteId = this.selectedSafetySiteId;
            }
            if (!this.duerpEditingId) {
                this.resetDuerpForm();
            }
            if (this.customerEditingId
                && !this.billingCustomers.some((customer) => customer.id === this.customerEditingId)) {
                this.cancelCustomerEditing();
            }
            if (!billingEnabled) {
                this.cancelCustomerEditing();
                this.cancelInvoicePayment();
                this.resetQuoteForm();
                this.resetInvoiceForm();
            }
            if (!this.quoteForm.customerId || !this.billingCustomers.some((customer) => customer.id === this.quoteForm.customerId)) {
                this.quoteForm.customerId = this.billingCustomers[0]?.id ?? "";
            }
            if (this.quoteForm.worksiteId && !this.billingWorksites.some((worksite) => worksite.id === this.quoteForm.worksiteId)) {
                this.quoteForm.worksiteId = "";
            }
            if (!this.invoiceForm.customerId || !this.billingCustomers.some((customer) => customer.id === this.invoiceForm.customerId)) {
                this.invoiceForm.customerId = this.billingCustomers[0]?.id ?? "";
            }
            if (this.invoiceForm.worksiteId && !this.billingWorksites.some((worksite) => worksite.id === this.invoiceForm.worksiteId)) {
                this.invoiceForm.worksiteId = "";
            }
            if (this.invoicePaymentId && !this.invoices.some((invoice) => invoice.id === this.invoicePaymentId)) {
                this.cancelInvoicePayment();
            }
            if (!regulationEnabled) {
                this.resetRegulatoryEvidenceForm();
            }
            else if (this.regulatoryEvidenceForm.linkKind === "obligation"
                && this.regulatoryProfile
                && !this.regulatoryProfile.applicable_obligations.some((obligation) => obligation.id === this.regulatoryEvidenceForm.obligationId)) {
                this.regulatoryEvidenceForm.obligationId =
                    this.regulatoryProfile.applicable_obligations[0]?.id ?? "";
            }
            if (regulationEnabled && this.regulatoryEvidenceForm.linkKind === "site" && !this.regulatoryEvidenceForm.siteId) {
                this.regulatoryEvidenceForm.siteId = this.selectedSafetySiteId !== "all"
                    ? this.selectedSafetySiteId
                    : this.activeOrganizationSites[0]?.id ?? "";
            }
            if (profile) {
                this.applyProfileToForm(profile);
            }
            this.workspaceHydratedOrganizationId = this.selectedOrganizationId;
            this.handleSiteFilterChange();
            this.refreshBillingDraftSnapshots();
        }
        finally {
            this.organizationWorkspaceLoading = false;
        }
    }
    async refreshOrganizationWorkspaceSafely(reason, organizationId = this.selectedOrganizationId) {
        if (this.workspaceRefreshInFlight) {
            return this.workspaceRefreshInFlight;
        }
        let refreshPromise = null;
        refreshPromise = (async () => {
            try {
                await this.refreshOrganizationWorkspace();
            }
            catch (error) {
                this.errorMessage = this.toErrorMessage(error, "load");
            }
            finally {
                if (this.workspaceRefreshInFlight === refreshPromise) {
                    this.workspaceRefreshInFlight = null;
                }
            }
        })();
        this.workspaceRefreshInFlight = refreshPromise;
        return refreshPromise;
    }
    async refreshRegulatoryProfile() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.isReglementationEnabled) {
            this.regulatoryProfile = null;
            return;
        }
        this.regulatoryProfile = await fetchOrganizationRegulatoryProfile(this.accessToken, this.selectedOrganizationId);
    }
    async refreshBuildingSafetyState() {
        if (!this.accessToken || !this.selectedOrganizationId || !this.isReglementationEnabled) {
            this.buildingSafetyItems = [];
            this.buildingSafetyAlerts = [];
            return;
        }
        const [items, alerts] = await Promise.all([
            listBuildingSafetyItems(this.accessToken, this.selectedOrganizationId),
            listBuildingSafetyAlerts(this.accessToken, this.selectedOrganizationId)
        ]);
        this.buildingSafetyItems = items;
        this.buildingSafetyAlerts = alerts;
    }
    applyProfileToForm(profile) {
        this.profileForm = {
            name: profile.name ?? "",
            legalName: profile.legal_name ?? "",
            activityLabel: profile.activity_label ?? "",
            employeeCount: typeof profile.employee_count === "number" ? String(profile.employee_count) : "",
            hasEmployees: profile.has_employees === true ? "yes" : profile.has_employees === false ? "no" : "",
            receivesPublic: profile.receives_public === true ? "yes" : profile.receives_public === false ? "no" : "",
            storesHazardousProducts: profile.stores_hazardous_products === true
                ? "yes"
                : profile.stores_hazardous_products === false
                    ? "no"
                    : "",
            performsHighRiskWork: profile.performs_high_risk_work === true
                ? "yes"
                : profile.performs_high_risk_work === false
                    ? "no"
                    : "",
            contactEmail: profile.contact_email ?? "",
            contactPhone: profile.contact_phone ?? "",
            headquartersAddress: profile.headquarters_address ?? "",
            notes: profile.notes ?? ""
        };
    }
    buildProfilePayload() {
        const employeeCount = this.profileForm.employeeCount.trim().length > 0
            ? Number(this.profileForm.employeeCount)
            : null;
        return {
            name: this.profileForm.name.trim(),
            legal_name: this.normalizeOptionalText(this.profileForm.legalName),
            activity_label: this.normalizeOptionalText(this.profileForm.activityLabel),
            employee_count: Number.isFinite(employeeCount ?? NaN) ? employeeCount : null,
            has_employees: this.profileForm.hasEmployees === "yes"
                ? true
                : this.profileForm.hasEmployees === "no"
                    ? false
                    : null,
            receives_public: this.profileForm.receivesPublic === "yes"
                ? true
                : this.profileForm.receivesPublic === "no"
                    ? false
                    : null,
            stores_hazardous_products: this.profileForm.storesHazardousProducts === "yes"
                ? true
                : this.profileForm.storesHazardousProducts === "no"
                    ? false
                    : null,
            performs_high_risk_work: this.profileForm.performsHighRiskWork === "yes"
                ? true
                : this.profileForm.performsHighRiskWork === "no"
                    ? false
                    : null,
            contact_email: this.normalizeOptionalText(this.profileForm.contactEmail),
            contact_phone: this.normalizeOptionalText(this.profileForm.contactPhone),
            headquarters_address: this.normalizeOptionalText(this.profileForm.headquartersAddress),
            notes: this.normalizeOptionalText(this.profileForm.notes)
        };
    }
    sortSites(sites) {
        return [...sites].sort((left, right) => {
            if (left.status !== right.status) {
                return left.status.localeCompare(right.status);
            }
            return left.name.localeCompare(right.name);
        });
    }
    resetSiteForm() {
        this.siteForm = {
            name: "",
            address: "",
            siteType: "site"
        };
    }
    normalizeOptionalText(value) {
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : null;
    }
    persistBillingDraftsIfNeeded() {
        const hydrationScope = this.getBillingDraftHydrationScope();
        if (!hydrationScope || this.billingDraftsHydratedScope !== hydrationScope) {
            return;
        }
        const quoteDraft = this.buildQuoteDraftPayload();
        const nextQuoteSnapshot = JSON.stringify(quoteDraft);
        if (nextQuoteSnapshot !== this.quoteDraftSnapshot) {
            this.quoteDraftSnapshot = nextQuoteSnapshot;
            if (this.isMeaningfulQuoteDraft(quoteDraft)) {
                this.saveBillingDraft("quote", quoteDraft);
            }
            else {
                this.clearBillingDraft("quote");
            }
        }
        const invoiceDraft = this.buildInvoiceDraftPayload();
        const nextInvoiceSnapshot = JSON.stringify(invoiceDraft);
        if (nextInvoiceSnapshot !== this.invoiceDraftSnapshot) {
            this.invoiceDraftSnapshot = nextInvoiceSnapshot;
            if (this.isMeaningfulInvoiceDraft(invoiceDraft)) {
                this.saveBillingDraft("invoice", invoiceDraft);
            }
            else {
                this.clearBillingDraft("invoice");
            }
        }
    }
    refreshBillingDraftSnapshots() {
        this.quoteDraftSnapshot = JSON.stringify(this.buildQuoteDraftPayload());
        this.invoiceDraftSnapshot = JSON.stringify(this.buildInvoiceDraftPayload());
    }
    hydrateBillingDraftsIfNeeded(billingEnabled) {
        if (!billingEnabled) {
            this.billingDraftsHydratedScope = null;
            return;
        }
        const hydrationScope = this.getBillingDraftHydrationScope();
        if (!hydrationScope || hydrationScope === this.billingDraftsHydratedScope) {
            return;
        }
        this.restoreQuoteDraft();
        this.restoreInvoiceDraft();
        this.billingDraftsHydratedScope = hydrationScope;
    }
    getBillingDraftHydrationScope() {
        const scope = this.getBillingDraftScopeKey();
        if (!scope || !this.isFacturationEnabled) {
            return null;
        }
        return `${scope}:${this.billingCustomers.length}:${this.billingWorksites.length}`;
    }
    getBillingDraftScopeKey() {
        const userId = this.session?.user?.id ?? null;
        if (!userId || !this.selectedOrganizationId) {
            return null;
        }
        return `${userId}:${this.selectedOrganizationId}`;
    }
    getBillingDraftStorageKey(kind) {
        const scope = this.getBillingDraftScopeKey();
        return scope ? `conformeo.billing.${kind}.draft.${scope}` : null;
    }
    getBillingDraftStorage() {
        try {
            return globalThis.localStorage ?? null;
        }
        catch {
            return null;
        }
    }
    readBillingDraft(kind) {
        const storage = this.getBillingDraftStorage();
        const storageKey = this.getBillingDraftStorageKey(kind);
        if (!storage || !storageKey) {
            return null;
        }
        const rawValue = storage.getItem(storageKey);
        if (!rawValue) {
            return null;
        }
        try {
            const parsed = JSON.parse(rawValue);
            if (!parsed || typeof parsed !== "object" || !("payload" in parsed)) {
                return null;
            }
            return parsed;
        }
        catch {
            storage.removeItem(storageKey);
            return null;
        }
    }
    saveBillingDraft(kind, payload) {
        const storage = this.getBillingDraftStorage();
        const storageKey = this.getBillingDraftStorageKey(kind);
        if (!storage || !storageKey) {
            return;
        }
        const record = {
            updatedAt: new Date().toISOString(),
            payload,
        };
        storage.setItem(storageKey, JSON.stringify(record));
    }
    clearBillingDraft(kind) {
        const storage = this.getBillingDraftStorage();
        const storageKey = this.getBillingDraftStorageKey(kind);
        if (!storage || !storageKey) {
            return;
        }
        storage.removeItem(storageKey);
    }
    buildQuoteDraftPayload() {
        return {
            customerId: this.quoteForm.customerId,
            worksiteId: this.quoteForm.worksiteId,
            title: this.quoteForm.title,
            issueDate: this.quoteForm.issueDate,
            validUntil: this.quoteForm.validUntil,
            status: this.quoteForm.status,
            notes: this.quoteForm.notes,
            lines: this.cloneBillingLines(this.quoteForm.lines),
        };
    }
    buildInvoiceDraftPayload() {
        return {
            customerId: this.invoiceForm.customerId,
            worksiteId: this.invoiceForm.worksiteId,
            title: this.invoiceForm.title,
            issueDate: this.invoiceForm.issueDate,
            dueDate: this.invoiceForm.dueDate,
            status: this.invoiceForm.status,
            notes: this.invoiceForm.notes,
            lines: this.cloneBillingLines(this.invoiceForm.lines),
        };
    }
    restoreQuoteDraft() {
        const record = this.readBillingDraft("quote");
        if (!record) {
            return;
        }
        this.quoteForm = this.sanitizeQuoteDraft(record.payload);
    }
    restoreInvoiceDraft() {
        const record = this.readBillingDraft("invoice");
        if (!record) {
            return;
        }
        this.invoiceForm = this.sanitizeInvoiceDraft(record.payload);
    }
    sanitizeQuoteDraft(payload) {
        return {
            customerId: this.hasBillingCustomer(payload?.customerId) ? payload?.customerId ?? "" : this.billingCustomers[0]?.id ?? "",
            worksiteId: this.hasBillingWorksite(payload?.worksiteId) ? payload?.worksiteId ?? "" : "",
            title: payload?.title ?? "",
            issueDate: payload?.issueDate || this.getTodayDateValue(),
            validUntil: payload?.validUntil ?? "",
            status: payload?.status === "sent" ? "sent" : "draft",
            notes: payload?.notes ?? "",
            lines: this.sanitizeBillingLines(payload?.lines),
        };
    }
    sanitizeInvoiceDraft(payload) {
        return {
            customerId: this.hasBillingCustomer(payload?.customerId) ? payload?.customerId ?? "" : this.billingCustomers[0]?.id ?? "",
            worksiteId: this.hasBillingWorksite(payload?.worksiteId) ? payload?.worksiteId ?? "" : "",
            title: payload?.title ?? "",
            issueDate: payload?.issueDate || this.getTodayDateValue(),
            dueDate: payload?.dueDate ?? "",
            status: payload?.status === "issued" ? "issued" : "draft",
            notes: payload?.notes ?? "",
            lines: this.sanitizeBillingLines(payload?.lines),
        };
    }
    sanitizeBillingLines(lines) {
        if (!Array.isArray(lines) || lines.length === 0) {
            return [this.createEmptyBillingLineForm()];
        }
        const normalizedLines = lines.map((line) => ({
            description: typeof line?.description === "string" ? line.description : "",
            quantity: typeof line?.quantity === "string" ? line.quantity : "",
            unitPrice: typeof line?.unitPrice === "string" ? line.unitPrice : "",
        }));
        return normalizedLines.length > 0 ? normalizedLines : [this.createEmptyBillingLineForm()];
    }
    cloneBillingLines(lines) {
        return lines.map((line) => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
        }));
    }
    isMeaningfulQuoteDraft(draft) {
        const defaultCustomerId = this.billingCustomers[0]?.id ?? "";
        return Boolean(draft.worksiteId
            || draft.title.trim()
            || draft.validUntil
            || draft.status !== "draft"
            || draft.notes.trim()
            || (draft.customerId && draft.customerId !== defaultCustomerId)
            || draft.lines.some((line) => this.isMeaningfulBillingLine(line)));
    }
    isMeaningfulInvoiceDraft(draft) {
        const defaultCustomerId = this.billingCustomers[0]?.id ?? "";
        return Boolean(draft.worksiteId
            || draft.title.trim()
            || draft.dueDate
            || draft.status !== "draft"
            || draft.notes.trim()
            || (draft.customerId && draft.customerId !== defaultCustomerId)
            || draft.lines.some((line) => this.isMeaningfulBillingLine(line)));
    }
    isMeaningfulBillingLine(line) {
        return Boolean(line.description.trim() || line.quantity.trim() || line.unitPrice.trim());
    }
    hasBillingCustomer(customerId) {
        return Boolean(customerId && this.billingCustomers.some((customer) => customer.id === customerId));
    }
    hasBillingWorksite(worksiteId) {
        return Boolean(worksiteId && this.billingWorksites.some((worksite) => worksite.id === worksiteId));
    }
    findBillingCustomerByName(name) {
        const query = this.toSearchableText(name);
        if (!query) {
            return null;
        }
        return this.billingCustomers.find((customer) => this.toSearchableText(customer.name) === query) ?? null;
    }
    findSingleWorksiteForCustomer(customerName) {
        const query = this.toSearchableText(customerName);
        if (!query) {
            return null;
        }
        const matchingWorksites = this.billingWorksites.filter((worksite) => this.toSearchableText(worksite.client_name) === query);
        return matchingWorksites.length === 1 ? matchingWorksites[0] : null;
    }
    buildWorksitePreventionPlanForm(worksite) {
        const matchedCustomer = this.findBillingCustomerByName(worksite.client_name);
        const usefulDate = this.toDateTimeLocalValue(worksite.planned_for);
        return {
            usefulDate,
            interventionContext: this.buildDefaultWorksitePreventionContext(worksite, matchedCustomer, this.formatDateTimeForHumans(usefulDate)),
            vigilancePoints: this.buildDefaultWorksiteVigilancePoints(worksite, matchedCustomer).join("\n"),
            measurePoints: this.buildDefaultWorksiteMeasurePoints(worksite, matchedCustomer, this.formatDateTimeForHumans(usefulDate)).join("\n"),
            additionalContact: "",
        };
    }
    cloneWorksitePreventionPlanForm(form) {
        return {
            usefulDate: form.usefulDate,
            interventionContext: form.interventionContext,
            vigilancePoints: form.vigilancePoints,
            measurePoints: form.measurePoints,
            additionalContact: form.additionalContact,
        };
    }
    buildWorksitePreventionPlanPreview(worksite) {
        return {
            companyName: this.normalizeOptionalText(this.organizationProfile?.legal_name ?? "")
                ?? this.normalizeOptionalText(this.organizationProfile?.name ?? "")
                ?? this.currentMembership?.organization.name
                ?? "Entreprise",
            worksiteName: worksite.name,
            worksiteAddress: worksite.address,
            clientName: this.normalizeOptionalText(worksite.client_name),
            usefulDateLabel: this.formatDateTimeForHumans(this.worksitePreventionPlanForm.usefulDate),
            interventionContext: this.normalizeOptionalText(this.worksitePreventionPlanForm.interventionContext)
                ?? "Contexte à compléter avant export.",
            vigilancePoints: this.splitMultilineItems(this.worksitePreventionPlanForm.vigilancePoints),
            measurePoints: this.splitMultilineItems(this.worksitePreventionPlanForm.measurePoints),
            additionalContact: this.normalizeOptionalText(this.worksitePreventionPlanForm.additionalContact),
        };
    }
    buildDefaultWorksitePreventionContext(worksite, customer, usefulDateLabel) {
        const customerName = customer?.name || worksite.client_name;
        const parts = [
            `Intervention préparée sur le chantier ${worksite.name}`,
            `pour ${customerName}`,
            `à l'adresse ${worksite.address}`,
        ];
        if (usefulDateLabel) {
            parts.push(`avec un repère de date au ${usefulDateLabel}`);
        }
        return `${parts.join(" ")}.`;
    }
    buildDefaultWorksiteVigilancePoints(worksite, customer) {
        const points = [
            "Accès au site, accueil et zones d'intervention à confirmer avant le démarrage.",
            "Coactivité possible avec occupants, clients ou autres prestataires présents sur place.",
            "Circulation, manutention et balisage autour de la zone de travail à préparer simplement.",
        ];
        if (worksite.status === "blocked") {
            points.push("Un point bloquant est déjà remonté sur ce chantier et doit être levé avant intervention.");
        }
        else if (worksite.status === "in_progress") {
            points.push("Le chantier est déjà en cours et demande une coordination simple avec les intervenants présents.");
        }
        else if (worksite.status === "planned") {
            points.push("Les accès, badges ou autorisations utiles peuvent être vérifiés avant l'arrivée sur site.");
        }
        if (customer && (customer.email || customer.phone)) {
            points.push("Un contact donneur d'ordre est disponible et peut être confirmé avant intervention.");
        }
        return points;
    }
    buildDefaultWorksiteMeasurePoints(worksite, customer, usefulDateLabel) {
        const points = [
            "Présenter l'intervention et le périmètre concerné au contact du site avant de commencer.",
            "Vérifier les accès, les autorisations et les équipements de protection utiles à l'intervention.",
            "Baliser la zone de travail et maintenir un cheminement sûr pour les tiers.",
            "Arrêter l'intervention et faire remonter tout risque non prévu ou toute consigne contradictoire.",
        ];
        if (usefulDateLabel) {
            points.push(`Confirmer simplement l'accueil et l'accès au chantier pour la date utile du ${usefulDateLabel}.`);
        }
        if (customer && (customer.email || customer.phone)) {
            points.push("Utiliser les coordonnées disponibles pour confirmer l'accueil avant l'arrivée sur site.");
        }
        return points;
    }
    splitMultilineItems(value) {
        return value
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }
    toSearchableText(value) {
        return (value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }
    toDateTimeLocalValue(value) {
        if (!value) {
            return "";
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "";
        }
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const day = `${date.getDate()}`.padStart(2, "0");
        const hours = `${date.getHours()}`.padStart(2, "0");
        const minutes = `${date.getMinutes()}`.padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    formatDateTimeForHumans(value) {
        if (!value) {
            return null;
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }
    scrollToDesktopSection(sectionId) {
        globalThis.document?.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }
    async navigateToWorkspaceRoute(route, sectionId) {
        await this.router.navigateByUrl(sectionId ? `${route}#${sectionId}` : route);
        if (sectionId && !AppComponent.DISABLE_DEFERRED_WORKSPACE_SCROLL) {
            globalThis.setTimeout(() => this.scrollToDesktopSection(sectionId), 30);
        }
    }
    async handleRouteChange() {
        let currentPath = this.router.url.split("#")[0] || "/login";
        const storedAccessToken = getStoredAccessToken();
        const storedOrganizationId = getStoredOrganizationId();
        if (!storedAccessToken && (this.accessToken || this.session)) {
            console.warn("[auth] in-memory session detected without persisted token. Clearing shell state.", {
                currentPath,
                hadAccessTokenInMemory: Boolean(this.accessToken),
                hadSessionInMemory: Boolean(this.session),
            });
            this.clearAuthenticatedState(false);
        }
        else {
            this.accessToken = storedAccessToken;
            this.selectedOrganizationId = storedOrganizationId;
        }
        if (this.isLoginRoutePath(currentPath)) {
            this.clearScheduledWorkspaceRefresh();
            this.organizationWorkspaceLoading = false;
            return;
        }
        if (!this.isShellRoutePath(currentPath)) {
            this.clearScheduledWorkspaceRefresh();
            return;
        }
        if (!this.accessToken) {
            console.warn("[auth] protected shell route requested without persisted token. Redirecting to login.", {
                currentPath,
            });
            await this.router.navigate(["/login"], { replaceUrl: true });
            return;
        }
        if (!this.session && !this.sessionRestoreInProgress) {
            if (AppComponent.DISABLE_BOOTSTRAP_SESSION_RESTORE) {
                this.organizationWorkspaceLoading = false;
                await this.ensureAccessibleWorkspaceRoute();
                return;
            }
            await this.refreshSession(this.selectedOrganizationId);
            currentPath = this.router.url.split("#")[0] || "/login";
            if (!this.session || !this.isShellRoutePath(currentPath)) {
                return;
            }
        }
        if (this.session) {
            if (AppComponent.WORKSPACE_LOADING_DISABLED) {
                this.organizationWorkspaceLoading = false;
                await this.ensureAccessibleWorkspaceRoute();
                return;
            }
            if (!this.organizationWorkspaceLoading && !this.isWorkspaceHydratedForCurrentOrganization) {
                this.scheduleWorkspaceRefresh("route change");
            }
            await this.ensureAccessibleWorkspaceRoute();
        }
    }
    resetWorkspaceState() {
        this.cockpitSummary = null;
        this.organizationProfile = null;
        this.organizationSites = [];
        this.regulatoryProfile = null;
        this.billingCustomers = [];
        this.billingWorksites = [];
        this.worksiteDocuments = [];
        this.worksiteProofs = [];
        this.worksiteSignatures = [];
        this.worksiteAssignees = [];
        this.selectedWorksiteCoordinationId = null;
        this.selectedCoordinationStatusFilter = "all";
        this.selectedCoordinationAssigneeFilter = "all";
        this.selectedWorksiteDocumentFilterId = "all";
        this.selectedWorksiteDocumentTypeFilter = "all";
        this.selectedWorksiteDocumentLifecycleFilter = "all";
        this.selectedWorksiteDocumentDetailId = null;
        this.worksiteDocumentDownloadBusyId = null;
        this.worksiteDocumentPdfBusyId = null;
        this.worksiteCoordinationBusyId = null;
        this.worksiteDocumentCoordinationBusyId = null;
        this.worksiteDocumentStatusBusyId = null;
        this.worksiteDocumentProofBusyId = null;
        this.worksiteDocumentSignatureBusyId = null;
        this.worksitePreventionPlanPdfBusyId = null;
        this.worksitePreventionPlanEditingId = null;
        this.worksiteCoordinationDrafts = {};
        this.worksiteDocumentCoordinationDrafts = {};
        this.quotes = [];
        this.invoices = [];
        this.buildingSafetyItems = [];
        this.buildingSafetyAlerts = [];
        this.duerpEntries = [];
        this.regulatoryEvidences = [];
        this.billingDraftsHydratedScope = null;
        this.refreshBillingDraftSnapshots();
    }
    clearWorkspaceSegmentIssue(label) {
        if (!(label in this.workspaceSegmentIssues)) {
            return;
        }
        const remainingIssues = { ...this.workspaceSegmentIssues };
        delete remainingIssues[label];
        this.workspaceSegmentIssues = remainingIssues;
    }
    setWorkspaceSegmentIssue(label, message) {
        if (!message) {
            this.clearWorkspaceSegmentIssue(label);
            return;
        }
        this.workspaceSegmentIssues = {
            ...this.workspaceSegmentIssues,
            [label]: message,
        };
    }
    toWorkspaceSegmentIssueMessage(label, error) {
        if (label !== "building-safety-alerts"
            && label !== "duerp-entries"
            && label !== "regulatory-evidences") {
            return null;
        }
        if (error instanceof ApiClientError) {
            if (error.status === 408 || error.status === 0 || (error.status !== null && error.status >= 500)) {
                return "Les données réglementaires mettent plus de temps à remonter. Le reste du cockpit reste disponible.";
            }
            return error.detail;
        }
        return "Les données réglementaires mettent plus de temps à remonter. Le reste du cockpit reste disponible.";
    }
    async ensureAccessibleWorkspaceRoute() {
        const currentPath = this.router.url.split("#")[0] || "/app/home";
        const nextPath = currentPath === "/" || !currentPath.startsWith("/app/")
            ? "/app/home"
            : currentPath.startsWith("/app/reglementation") && !this.isReglementationEnabled
                ? "/app/home"
                : currentPath.startsWith("/app/facturation") && !this.isFacturationEnabled
                    ? "/app/home"
                    : currentPath.startsWith("/app/chantier") && !this.isChantierEnabled
                        ? "/app/home"
                        : currentPath;
        if (nextPath !== currentPath) {
            await this.router.navigateByUrl(nextPath);
        }
    }
    isLoginRoutePath(path) {
        return !path.startsWith("/app/");
    }
    isShellRoutePath(path) {
        return path.startsWith("/app/");
    }
    clearAuthenticatedState(clearStoredSession = true, reason = "app state reset") {
        if (clearStoredSession) {
            clearSession(reason);
        }
        this.clearScheduledWorkspaceRefresh();
        this.workspaceHydratedOrganizationId = null;
        this.workspaceSegmentIssues = {};
        this.accessToken = null;
        this.selectedOrganizationId = null;
        this.session = null;
        this.loading = false;
        this.organizationWorkspaceLoading = false;
        this.sessionRestoreInProgress = false;
        this.resetBetaFeedback();
        this.regulatoryExporting = false;
        this.cockpitSummary = null;
        this.organizationProfile = null;
        this.organizationSites = [];
        this.regulatoryProfile = null;
        this.selectedObligationId = null;
        this.billingCustomers = [];
        this.billingWorksites = [];
        this.worksiteDocuments = [];
        this.worksiteProofs = [];
        this.worksiteSignatures = [];
        this.worksiteAssignees = [];
        this.selectedWorksiteCoordinationId = null;
        this.selectedCoordinationStatusFilter = "all";
        this.selectedCoordinationAssigneeFilter = "all";
        this.selectedWorksiteDocumentFilterId = "all";
        this.selectedWorksiteDocumentTypeFilter = "all";
        this.selectedWorksiteDocumentLifecycleFilter = "all";
        this.selectedWorksiteDocumentDetailId = null;
        this.worksiteDocumentDownloadBusyId = null;
        this.worksiteDocumentPdfBusyId = null;
        this.worksiteCoordinationBusyId = null;
        this.worksiteDocumentCoordinationBusyId = null;
        this.worksiteDocumentStatusBusyId = null;
        this.worksiteDocumentProofBusyId = null;
        this.worksiteDocumentSignatureBusyId = null;
        this.worksitePreventionPlanPdfBusyId = null;
        this.worksitePreventionPlanEditingId = null;
        this.worksiteCoordinationDrafts = {};
        this.worksiteDocumentCoordinationDrafts = {};
        this.quotes = [];
        this.invoices = [];
        this.quoteEditingId = null;
        this.quoteEditingSaving = false;
        this.quoteStatusBusyId = null;
        this.quoteFollowUpBusyId = null;
        this.quoteWorksiteBusyId = null;
        this.quoteDuplicateBusyId = null;
        this.quotePdfBusyId = null;
        this.quoteHistoryBusyId = null;
        this.quoteHistoryOpenId = null;
        this.quoteHistoryById = {};
        this.invoiceEditingId = null;
        this.invoiceEditingSaving = false;
        this.invoiceStatusBusyId = null;
        this.invoiceFollowUpBusyId = null;
        this.invoicePaymentBusyId = null;
        this.invoicePaymentId = null;
        this.invoiceWorksiteBusyId = null;
        this.invoicePdfBusyId = null;
        this.invoiceHistoryBusyId = null;
        this.invoiceHistoryOpenId = null;
        this.invoiceHistoryById = {};
        this.buildingSafetyItems = [];
        this.buildingSafetyAlerts = [];
        this.duerpEntries = [];
        this.regulatoryEvidences = [];
        this.buildingSafetyEditingId = null;
        this.duerpEditingId = null;
        this.selectedSafetySiteId = "all";
        this.errorMessage = "";
        this.feedbackMessage = "";
        this.resetCustomerForm();
        this.resetQuoteForm();
        this.resetInvoiceForm();
        this.resetWorksitePreventionPlanForm();
        this.resetInvoicePaymentForm();
        this.resetBuildingSafetyForm();
        this.resetDuerpForm();
        this.resetRegulatoryEvidenceForm();
        this.billingDraftsHydratedScope = null;
        this.refreshBillingDraftSnapshots();
    }
    isModuleDataPending(moduleCode) {
        return this.activeSessionModules.includes(moduleCode) && !this.isWorkspaceHydratedForCurrentOrganization;
    }
    buildBetaFeedbackPayload() {
        const organizationName = this.currentMembership?.organization.name ?? "Organisation à préciser";
        const authorLabel = this.session?.user.display_name
            || this.session?.user.email
            || "Utilisateur à préciser";
        const capturedAt = new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date());
        return [
            "Retour beta Conforméo",
            `Organisation : ${organizationName}`,
            `Auteur : ${authorLabel}`,
            `Date : ${capturedAt}`,
            `Type : ${this.getBetaFeedbackCategoryLabel(this.betaFeedbackCategory)}`,
            `Zone : ${this.getBetaFeedbackAreaLabel(this.betaFeedbackArea)}`,
            "",
            "Message :",
            this.betaFeedbackMessageText.trim(),
        ].join("\n");
    }
    async copyTextToClipboard(value) {
        if (globalThis.navigator?.clipboard?.writeText) {
            await globalThis.navigator.clipboard.writeText(value);
            return;
        }
        const documentRef = globalThis.document;
        if (!documentRef) {
            throw new Error("clipboard_unavailable");
        }
        const textarea = documentRef.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        documentRef.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = documentRef.execCommand("copy");
        documentRef.body.removeChild(textarea);
        if (!success) {
            throw new Error("clipboard_unavailable");
        }
    }
    toErrorMessage(error, context = "generic") {
        if (error instanceof ApiClientError) {
            return this.toApiClientErrorMessage(error, context);
        }
        if (error instanceof Error) {
            if (this.isLikelyNetworkErrorMessage(error.message)) {
                return this.getNetworkErrorMessage(context);
            }
            if (this.isUserFacingErrorMessage(error.message)) {
                return error.message;
            }
        }
        return this.getDefaultErrorMessage(context);
    }
    toApiClientErrorMessage(error, context) {
        const detail = error.detail.trim();
        const normalizedDetail = detail.toLowerCase();
        if (normalizedDetail.includes("not authenticated") || normalizedDetail.includes("invalid token")) {
            return "Votre session a expiré. Reconnectez-vous pour continuer.";
        }
        if (normalizedDetail.includes("invalid credentials")
            || normalizedDetail.includes("incorrect email")
            || normalizedDetail.includes("incorrect password")) {
            return "Connexion refusée. Vérifiez votre email et votre mot de passe.";
        }
        if (normalizedDetail.includes("module")
            && (normalizedDetail.includes("disabled") || normalizedDetail.includes("not enabled"))) {
            return "Ce module n'est pas activé pour cette organisation.";
        }
        switch (error.status) {
            case 400:
            case 409:
            case 422:
                return this.isUserFacingErrorMessage(detail)
                    ? detail
                    : this.getValidationErrorMessage(context);
            case 401:
                return context === "auth"
                    ? "Connexion refusée. Vérifiez votre email et votre mot de passe."
                    : "Votre session a expiré. Reconnectez-vous pour continuer.";
            case 403:
                return "Vous n'avez pas accès à cette action pour le moment.";
            case 404:
                return context === "load"
                    ? "Les données demandées ne sont plus disponibles. Rechargez l'espace puis réessayez."
                    : "L'élément demandé est introuvable ou n'est plus disponible.";
            default:
                if (typeof error.status === "number" && error.status >= 500) {
                    return this.getTemporaryUnavailableMessage(context);
                }
                return this.isUserFacingErrorMessage(detail)
                    ? detail
                    : this.getDefaultErrorMessage(context);
        }
    }
    isLikelyNetworkErrorMessage(message) {
        const normalized = message.toLowerCase();
        return (normalized.includes("failed to fetch")
            || normalized.includes("networkerror")
            || normalized.includes("load failed")
            || normalized.includes("network request failed")
            || normalized.includes("fetch failed"));
    }
    isUserFacingErrorMessage(message) {
        const trimmed = message.trim();
        if (!trimmed || trimmed.length > 220) {
            return false;
        }
        return ![
            "traceback",
            "sqlalchemy",
            "asyncpg",
            "internal server error",
            "exception",
            "stack",
            "syntaxerror",
            "typeerror",
            "referenceerror",
            "constraint",
            "violates",
            "enum",
            "uuid",
            "failed to fetch",
            "networkerror",
            "fetch failed",
        ].some((token) => trimmed.toLowerCase().includes(token));
    }
    getDefaultErrorMessage(context) {
        switch (context) {
            case "auth":
                return "Connexion impossible pour le moment. Réessayez dans un instant.";
            case "load":
                return "Les données n'ont pas pu être chargées pour le moment. Réessayez dans un instant.";
            case "save":
                return "L'enregistrement n'a pas pu être confirmé. Réessayez dans un instant.";
            case "update":
                return "La mise à jour n'a pas pu être enregistrée. Réessayez dans un instant.";
            case "export":
                return "Le document n'a pas pu être préparé pour le moment. Réessayez dans un instant.";
            default:
                return "Une erreur est survenue. Réessayez dans un instant.";
        }
    }
    getValidationErrorMessage(context) {
        switch (context) {
            case "save":
            case "update":
                return "Vérifiez les informations saisies puis réessayez.";
            case "export":
                return "Le document n'a pas pu être préparé avec ces informations. Vérifiez les champs puis réessayez.";
            case "auth":
                return "Connexion refusée. Vérifiez vos identifiants puis réessayez.";
            default:
                return "Vérifiez les informations puis réessayez.";
        }
    }
    getNetworkErrorMessage(context) {
        switch (context) {
            case "load":
                return "Impossible de charger les données pour le moment. Vérifiez la connexion puis réessayez.";
            case "save":
            case "update":
                return "La connexion a été interrompue. Vérifiez le réseau puis réessayez.";
            case "export":
                return "Le téléchargement n'a pas abouti. Vérifiez la connexion puis réessayez.";
            case "auth":
                return "Connexion impossible pour le moment. Vérifiez la connexion puis réessayez.";
            default:
                return "Connexion impossible pour le moment. Vérifiez le réseau puis réessayez.";
        }
    }
    getTemporaryUnavailableMessage(context) {
        switch (context) {
            case "load":
                return "Les données ne sont pas disponibles pour le moment. Réessayez dans un instant.";
            case "save":
            case "update":
                return "L'action n'a pas pu être enregistrée pour le moment. Réessayez dans un instant.";
            case "export":
                return "Le document n'a pas pu être généré pour le moment. Réessayez dans un instant.";
            case "auth":
                return "Le service de connexion est temporairement indisponible. Réessayez dans un instant.";
            default:
                return "Le service est temporairement indisponible. Réessayez dans un instant.";
        }
    }
    downloadBlob(blob, fileName) {
        const objectUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(objectUrl);
    }
    getTodayDateValue() {
        return new Date().toISOString().slice(0, 10);
    }
    createEmptyQuoteForm() {
        return {
            customerId: this.billingCustomers[0]?.id ?? "",
            worksiteId: "",
            title: "",
            issueDate: this.getTodayDateValue(),
            validUntil: "",
            status: "draft",
            notes: "",
            lines: [this.createEmptyBillingLineForm()],
        };
    }
    createEmptyInvoiceForm() {
        return {
            customerId: this.billingCustomers[0]?.id ?? "",
            worksiteId: "",
            title: "",
            issueDate: this.getTodayDateValue(),
            dueDate: "",
            status: "draft",
            notes: "",
            lines: [this.createEmptyBillingLineForm()],
        };
    }
    createEmptyWorksitePreventionPlanForm() {
        return {
            usefulDate: "",
            interventionContext: "",
            vigilancePoints: "",
            measurePoints: "",
            additionalContact: "",
        };
    }
    buildQuoteFormFromRecord(quote) {
        return {
            customerId: this.hasBillingCustomer(quote.customer_id) ? quote.customer_id : this.billingCustomers[0]?.id ?? "",
            worksiteId: this.hasBillingWorksite(quote.worksite_id) ? quote.worksite_id ?? "" : "",
            title: quote.title ?? "",
            issueDate: quote.issue_date,
            validUntil: quote.valid_until ?? "",
            status: quote.status,
            notes: quote.notes ?? "",
            lines: quote.line_items.map((line) => ({
                description: line.description,
                quantity: String(line.quantity),
                unitPrice: (line.unit_price_cents / 100).toFixed(2).replace(".", ","),
            })),
        };
    }
    buildInvoiceFormFromRecord(invoice) {
        return {
            customerId: this.hasBillingCustomer(invoice.customer_id) ? invoice.customer_id : this.billingCustomers[0]?.id ?? "",
            worksiteId: this.hasBillingWorksite(invoice.worksite_id) ? invoice.worksite_id ?? "" : "",
            title: invoice.title ?? "",
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date ?? "",
            status: invoice.status === "draft" ? "draft" : "issued",
            notes: invoice.notes ?? "",
            lines: invoice.line_items.map((line) => ({
                description: line.description,
                quantity: String(line.quantity),
                unitPrice: (line.unit_price_cents / 100).toFixed(2).replace(".", ","),
            })),
        };
    }
    createEmptyBillingLineForm() {
        return {
            description: "",
            quantity: "1",
            unitPrice: "",
        };
    }
    parseBillingQuantity(value) {
        const normalized = value.replace(",", ".").trim();
        if (!normalized) {
            return null;
        }
        const parsed = Number(normalized);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    parseUnitPriceToCents(value) {
        const normalized = value.replace(",", ".").trim();
        if (!normalized) {
            return null;
        }
        const parsed = Number(normalized);
        if (!Number.isFinite(parsed) || parsed < 0) {
            return null;
        }
        return Math.round(parsed * 100);
    }
    hasValidBillingLines(lines) {
        return lines.some((line) => {
            return Boolean(line.description.trim()
                && this.parseBillingQuantity(line.quantity) !== null
                && this.parseUnitPriceToCents(line.unitPrice) !== null);
        });
    }
    computeBillingFormTotalCents(lines) {
        return lines.reduce((total, line) => {
            const quantity = this.parseBillingQuantity(line.quantity);
            const unitPriceCents = this.parseUnitPriceToCents(line.unitPrice);
            if (!line.description.trim() || quantity === null || unitPriceCents === null) {
                return total;
            }
            return total + Math.round(quantity * unitPriceCents);
        }, 0);
    }
    buildBillingLineItemsPayload(lines) {
        const payload = lines
            .map((line) => {
            const quantity = this.parseBillingQuantity(line.quantity);
            const unitPriceCents = this.parseUnitPriceToCents(line.unitPrice);
            if (!line.description.trim() || quantity === null || unitPriceCents === null) {
                return null;
            }
            return {
                description: line.description.trim(),
                quantity,
                unit_price_cents: unitPriceCents,
            };
        })
            .filter((line) => line !== null);
        if (payload.length === 0) {
            throw new Error("Ajoutez au moins une ligne valide.");
        }
        return payload;
    }
    resetCustomerForm() {
        this.customerForm = {
            name: "",
            customerType: "company",
            email: "",
            phone: "",
            address: "",
            notes: ""
        };
    }
    resetQuoteForm() {
        this.quoteForm = this.createEmptyQuoteForm();
    }
    resetInvoiceForm() {
        this.invoiceForm = this.createEmptyInvoiceForm();
    }
    resetWorksitePreventionPlanForm() {
        this.worksitePreventionPlanForm = this.createEmptyWorksitePreventionPlanForm();
        this.worksitePreventionPlanInitialForm = null;
    }
    resetInvoicePaymentForm() {
        this.invoicePaymentForm = {
            paidAmount: "",
            paidAt: this.getTodayDateValue()
        };
    }
    resetDuerpForm() {
        this.duerpForm = {
            siteId: this.selectedSafetySiteId !== "all" ? this.selectedSafetySiteId : "",
            workUnitName: "",
            riskLabel: "",
            severity: "medium",
            preventionAction: ""
        };
    }
    resetBuildingSafetyForm() {
        this.buildingSafetyForm = {
            siteId: this.selectedSafetySiteId !== "all"
                ? this.selectedSafetySiteId
                : this.activeOrganizationSites[0]?.id ?? "",
            itemType: "fire_extinguisher",
            name: "",
            nextDueDate: "",
            lastCheckedAt: "",
            status: "active",
            notes: ""
        };
    }
    resetRegulatoryEvidenceForm() {
        this.regulatoryEvidenceForm = {
            linkKind: "obligation",
            obligationId: this.regulatoryProfile?.applicable_obligations[0]?.id ?? "",
            siteId: this.selectedSafetySiteId !== "all" ? this.selectedSafetySiteId : "",
            buildingSafetyItemId: "",
            duerpEntryId: "",
            fileName: "",
            documentType: "attestation",
            notes: ""
        };
    }
    static ɵfac = function AppComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppComponent, selectors: [["cfm-root"]], viewQuery: function AppComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
            i0.ɵɵviewQuery(_c1, 5);
            i0.ɵɵviewQuery(_c2, 5);
            i0.ɵɵviewQuery(_c3, 5);
            i0.ɵɵviewQuery(_c4, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.homePageTemplateRef = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.reglementationPageTemplateRef = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.chantierPageTemplateRef = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.facturationPageTemplateRef = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.coordinationPageTemplateRef = _t.first);
        } }, standalone: true, features: [i0.ɵɵProvidersFeature([
                {
                    provide: DESKTOP_LOGIN_PAGE_CONTEXT,
                    useExisting: forwardRef(() => AppComponent),
                },
                {
                    provide: DESKTOP_SHELL_CONTEXT,
                    useExisting: forwardRef(() => AppComponent),
                },
                {
                    provide: DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT,
                    useExisting: forwardRef(() => AppComponent),
                },
            ]), i0.ɵɵStandaloneFeature], decls: 11, vars: 0, consts: [["homePageTemplate", ""], ["reglementationPageTemplate", ""], ["facturationPageTemplate", ""], ["coordinationPageTemplate", ""], ["chantierPageTemplate", ""], ["homeAdministrationCardTemplate", ""], ["emptyModules", ""], ["emptyDashboard", ""], ["emptyDashboardAlerts", ""], ["emptyDashboardActions", ""], ["emptyEnterpriseOverview", ""], ["chantierCoordinationDisabled", ""], ["chantierOverviewDisabled", ""], ["chantierDocumentsDisabled", ""], ["customerOverviewDisabled", ""], ["emptyCoordinationTodo", ""], ["emptyWorksiteOverview", ""], ["noWorksiteAssignees", ""], ["noVigilancePreview", ""], ["noMeasuresPreview", ""], ["emptyWorksiteDocuments", ""], ["noLinkedSignature", ""], ["noLinkedProofs", ""], ["noDocumentAssignees", ""], ["emptyCustomerOverview", ""], ["emptySites", ""], ["noBuildingSafetyAlerts", ""], ["emptyBuildingSafetyItems", ""], ["emptyObligations", ""], ["emptyDuerpEntries", ""], ["emptyRegulatoryEvidences", ""], ["inferredRegulatorySite", ""], ["emptyObligationEvidences", ""], ["emptyCustomers", ""], ["noCustomersForQuotes", ""], ["emptyQuotes", ""], ["noCustomersForInvoices", ""], ["emptyInvoices", ""], ["emptyQuoteHistory", ""], ["emptyInvoiceHistory", ""], ["standaloneCoordinationDisabled", ""], ["emptyStandaloneCoordinationTodo", ""], ["standaloneWorksiteDisabled", ""], ["emptyStandaloneWorksiteOverview", ""], ["noStandaloneWorksiteAssignees", ""], ["class", "desktop-card", "eyebrow", "Cockpit", "title", "Chargement du cockpit", "description", "Les rep\u00E8res entreprise, chantier et facturation sont en train d\u2019\u00EAtre pr\u00E9par\u00E9s.", 4, "ngIf"], ["class", "desktop-card", "eyebrow", "S4-001 \u00B7 S4-002 \u00B7 S4-003", "title", "Vue d\u2019ensemble", "description", "Quelques rep\u00E8res utiles pour savoir quoi traiter aujourd\u2019hui, sans reporting complexe ni jargon m\u00E9tier.", 4, "ngIf"], ["class", "desktop-card", "eyebrow", "S4-020 \u00B7 S4-021 \u00B7 S4-022", "title", "Lectures utiles", "description", "Trois angles simples pour relire l\u2019activit\u00E9 sans ouvrir de vue analytique complexe : entreprise, chantier et client.", 4, "ngIf"], [3, "ngTemplateOutlet", 4, "ngIf"], ["class", "desktop-card", "eyebrow", "S7-021", "title", "Donner un retour", "description", "Un format court pour remonter un blocage, une incompr\u00E9hension ou une am\u00E9lioration sans outil de support d\u00E9di\u00E9.", 4, "ngIf"], ["eyebrow", "Cockpit", "title", "Chargement du cockpit", "description", "Les rep\u00E8res entreprise, chantier et facturation sont en train d\u2019\u00EAtre pr\u00E9par\u00E9s.", 1, "desktop-card"], [1, "loading-state-card"], ["aria-hidden", "true", 1, "loading-state-skeleton"], [1, "loading-state-hero"], [1, "loading-state-grid"], [1, "loading-state-lines"], [1, "loading-state-copy"], [1, "loading-state-label"], [1, "small"], ["eyebrow", "Organisation", "title", "Organisation et modules", "description", "Les r\u00E9glages d\u2019organisation et les modules activ\u00E9s restent accessibles, sans prendre la place du cockpit.", 1, "desktop-card"], ["class", "grid", 4, "ngIf"], ["class", "modules", 4, "ngIf"], [1, "grid"], [1, "chips"], ["tone", "calm", 3, "label", 4, "ngFor", "ngForOf"], [1, "stack-list"], [4, "ngFor", "ngForOf"], ["tone", "calm", 3, "label"], [1, "list-copy"], [3, "label", "tone"], [1, "modules"], [1, "modules-header"], ["class", "module-list", 4, "ngIf", "ngIfElse"], [1, "module-list"], [1, "module-copy"], [1, "toggle"], ["type", "checkbox", 3, "change", "checked", "disabled"], ["title", "Aucun module configur\u00E9", "description", "Cette organisation n\u2019a encore aucun module activable dans le socle actuel."], ["eyebrow", "S4-001 \u00B7 S4-002 \u00B7 S4-003", "title", "Vue d\u2019ensemble", "description", "Quelques rep\u00E8res utiles pour savoir quoi traiter aujourd\u2019hui, sans reporting complexe ni jargon m\u00E9tier.", 1, "desktop-card"], [1, "card-header-actions"], ["class", "dashboard-grid", 4, "ngIf", "ngIfElse"], [1, "dashboard-alerts"], ["class", "alert-list", 4, "ngIf", "ngIfElse"], [1, "dashboard-actions"], [1, "dashboard-actions-header"], [1, "dashboard-action-copy"], [1, "field", "compact-field", "dashboard-filter"], ["name", "selectedDashboardActionModule", 3, "ngModelChange", "ngModel"], ["value", "all"], ["value", "reglementation"], ["value", "chantier"], ["value", "facturation"], [1, "dashboard-grid"], ["class", "dashboard-kpi-card", 4, "ngFor", "ngForOf"], [1, "dashboard-kpi-card"], [1, "meta"], [1, "dashboard-kpi-value"], ["title", "Aucun module actif pour le moment", "description", "Activez R\u00E9glementation, Chantier ou Facturation pour faire appara\u00EEtre une vue d\u2019ensemble utile."], [1, "alert-list"], [1, "dashboard-alert-copy"], [4, "ngIf"], ["eyebrow", "S4-020 \u00B7 S4-021 \u00B7 S4-022", "title", "Lectures utiles", "description", "Trois angles simples pour relire l\u2019activit\u00E9 sans ouvrir de vue analytique complexe : entreprise, chantier et client.", 1, "desktop-card"], [4, "ngIf", "ngIfElse"], ["id", "worksite-overview-section", 1, "dashboard-actions"], ["id", "worksite-documents-section", 1, "dashboard-actions"], ["class", "dashboard-module-highlights", 4, "ngIf"], [1, "dashboard-module-highlights"], [1, "inline-actions"], [1, "compact-field"], ["name", "selectedCoordinationStatusFilter", 3, "ngModelChange", "ngModel"], ["value", "todo"], ["value", "in_progress"], ["value", "done"], ["name", "selectedCoordinationAssigneeFilter", 3, "ngModelChange", "ngModel"], ["value", "unassigned"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "button", "variant", "secondary", 3, "click", 4, "ngIf"], [3, "value"], ["type", "button", "variant", "secondary", 3, "click"], [1, "billing-item-actions"], [3, "title", "description"], ["title", "Module Chantier non activ\u00E9", "description", "Activez le module Chantier pour afficher cette lecture de coordination."], ["type", "button", "variant", "secondary", 3, "disabled", "click", 4, "ngIf"], ["class", "stack-list", 4, "ngIf"], ["class", "document-linked-panel", 4, "ngIf"], ["class", "document-adjustment-form", 3, "ngSubmit", 4, "ngIf"], ["type", "button", "variant", "secondary", 3, "click", "disabled"], ["class", "compact-field", 4, "ngIf"], ["class", "small", 4, "ngIf"], ["class", "inline-choice-list compact-field", 4, "ngIf"], [3, "ngModelChange", "ngModel", "name", "disabled"], ["value", "draft"], ["value", "finalized"], ["value", ""], [1, "inline-choice-list", "compact-field"], ["class", "inline-choice", 4, "ngFor", "ngForOf"], [1, "inline-choice"], ["type", "checkbox", 3, "ngModelChange", "ngModel", "ngModelOptions", "disabled"], [1, "document-linked-panel"], [1, "detail-grid"], [1, "detail-block"], ["class", "detail-grid", 4, "ngIf"], ["class", "field field-wide", 4, "ngIf"], ["class", "inline-actions", 4, "ngIf"], [1, "field", "compact-field"], ["class", "field compact-field", 4, "ngIf", "ngIfElse"], [1, "field", "field-wide"], ["rows", "3", "placeholder", "Ex. appeler le client avant l'intervention", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "button", 3, "click", "disabled"], [1, "document-adjustment-form", 3, "ngSubmit"], [1, "small", "field-wide"], ["type", "datetime-local", "label", "Date utile", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "text", "label", "Contact utile compl\u00E9mentaire", "placeholder", "Ex. chef de site, standard, accueil", 3, "ngModelChange", "ngModel", "name", "disabled"], ["rows", "4", "placeholder", "Contexte simple de l\u2019intervention", 3, "ngModelChange", "ngModel", "name", "disabled"], ["rows", "5", "placeholder", "Un point par ligne", 3, "ngModelChange", "ngModel", "name", "disabled"], ["rows", "5", "placeholder", "Une consigne par ligne", 3, "ngModelChange", "ngModel", "name", "disabled"], ["class", "document-preview field-wide", 4, "ngIf"], [1, "form-actions", "inline-actions", "field-wide"], ["type", "submit", 3, "disabled"], [1, "document-preview", "field-wide"], [1, "document-preview-header"], ["class", "detail-list", 4, "ngIf", "ngIfElse"], [1, "detail-list"], ["title", "Module Chantier non activ\u00E9", "description", "Activez le module Chantier pour afficher cette vue synth\u00E9tique."], ["name", "worksiteDocumentLifecycleFilter", 3, "ngModelChange", "ngModel"], ["name", "selectedCoordinationStatusFilterDocuments", 3, "ngModelChange", "ngModel"], ["name", "selectedCoordinationAssigneeFilterDocuments", 3, "ngModelChange", "ngModel"], ["class", "stack-list", 4, "ngIf", "ngIfElse"], ["name", "worksiteDocumentFilterId", 3, "ngModelChange", "ngModel"], ["name", "worksiteDocumentTypeFilter", 3, "ngModelChange", "ngModel"], ["class", "detail-block", 4, "ngIf", "ngIfElse"], ["rows", "3", "placeholder", "Ex. relire avant envoi au client", 3, "ngModelChange", "ngModel", "name", "disabled"], ["title", "Aucun document pour ce filtre", "description", "Ajustez les filtres ou g\u00E9n\u00E9rez un document chantier pour le retrouver ici."], ["title", "Module Chantier non activ\u00E9", "description", "Activez le module Chantier pour consulter les documents li\u00E9s aux chantiers."], ["title", "Aucun client \u00E0 suivre", "description", "Les clients demandant un suivi apparaitront ici d\u00E8s qu\u2019un rep\u00E8re remonte."], ["title", "Module Facturation non activ\u00E9", "description", "Activez le module Facturation pour afficher cette lecture client."], [3, "ngTemplateOutlet"], ["eyebrow", "S7-021", "title", "Donner un retour", "description", "Un format court pour remonter un blocage, une incompr\u00E9hension ou une am\u00E9lioration sans outil de support d\u00E9di\u00E9.", 1, "desktop-card"], [1, "feedback-capture-form", 3, "ngSubmit"], ["name", "betaFeedbackCategory", 3, "ngModelChange", "ngModel"], ["value", "blocking"], ["value", "unclear"], ["value", "improvement"], ["value", "positive"], ["name", "betaFeedbackArea", 3, "ngModelChange", "ngModel"], ["value", "cockpit"], ["value", "worksite"], ["value", "worksite_document"], ["value", "sync"], ["value", "other"], ["name", "betaFeedbackMessageText", "rows", "4", "placeholder", "Ex. Je ne comprends pas si le document chantier est pr\u00EAt ou encore en pr\u00E9paration.", 3, "ngModelChange", "ngModel"], [1, "form-actions", "inline-actions"], ["class", "feedback error", 4, "ngIf"], ["class", "feedback success", 4, "ngIf"], ["class", "document-preview", 4, "ngIf"], [1, "feedback", "error"], [1, "feedback", "success"], [1, "document-preview"], [1, "feedback-preview-text"], ["class", "desktop-card", "eyebrow", "R\u00E9glementation", "title", "Chargement en cours", "description", "Le profil entreprise et les sites sont en train d\u2019\u00EAtre charg\u00E9s.", 4, "ngIf"], ["class", "desktop-card", "eyebrow", "R\u00E9glementation", "title", "Module non activ\u00E9", "description", "Activez le module R\u00E9glementation pour initialiser l\u2019entreprise et d\u00E9clarer ses premiers sites.", 4, "ngIf"], ["eyebrow", "R\u00E9glementation", "title", "Chargement en cours", "description", "Le profil entreprise et les sites sont en train d\u2019\u00EAtre charg\u00E9s.", 1, "desktop-card"], ["eyebrow", "R\u00E9glementation", "title", "Module non activ\u00E9", "description", "Activez le module R\u00E9glementation pour initialiser l\u2019entreprise et d\u00E9clarer ses premiers sites.", 1, "desktop-card"], ["title", "Rien d\u2019autre \u00E0 remplir pour le moment", "description", "Le parcours d\u2019onboarding entreprise apparaitra ici d\u00E8s que le module sera activ\u00E9."], [3, "actionTriggered", "exportTriggered", "summary", "topPriority", "priorityItems", "familyCards", "recommendedActions", "recommendedActionsSummary", "evidenceItems", "proofSupportSummary", "score", "scoreDrivers", "obligationCountLabel", "evidenceAvailableCount", "evidenceCoverageCount", "overduePriorityCount", "obligationsToVerifyCount", "hasObligations", "canReadOrganization", "exportLoading", "actionBusy", "actionLabel"], [1, "regulatory-foundation-grid"], ["class", "regulatory-foundation-column", 4, "ngIf"], [1, "regulatory-foundation-column", "regulatory-foundation-column--sites"], ["id", "reg-sites-section", "eyebrow", "S2-003", "title", "Sites et localisation", "description", "Des sites clairs, enrichis et exploitables pour fiabiliser la lecture r\u00E9glementaire par adresse ou b\u00E2timent.", 1, "desktop-card"], [1, "site-form", 3, "ngSubmit"], ["name", "siteName", "type", "text", "label", "Nom du site ou b\u00E2timent", "placeholder", "Ex. Si\u00E8ge Lyon Carnot", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "siteAddress", "type", "text", "label", "Adresse", "placeholder", "Ex. 12 rue Carnot, 69002 Lyon", "required", "", 3, "ngModelChange", "ngModel", "disabled"], [1, "field"], ["name", "siteType", 3, "ngModelChange", "ngModel", "disabled"], ["value", "site"], ["value", "building"], ["value", "office"], ["value", "warehouse"], [1, "form-actions"], ["class", "site-list", 4, "ngIf", "ngIfElse"], ["id", "reg-building-safety-section", "eyebrow", "S2-012 \u00B7 S2-013 \u00B7 S2-014", "title", "S\u00E9curit\u00E9 b\u00E2timent", "description", "Un suivi simple des extincteurs, DAE et contr\u00F4les p\u00E9riodiques, avec alertes claires et vue filtr\u00E9e par site.", 1, "desktop-card"], [1, "building-safety-header"], [1, "organization-switch"], ["name", "selectedSafetySiteId", 3, "ngModelChange", "change", "ngModel"], [1, "building-safety-form", 3, "ngSubmit"], ["name", "buildingSafetySiteId", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "buildingSafetyItemType", 3, "ngModelChange", "ngModel", "disabled"], ["value", "fire_extinguisher"], ["value", "dae"], ["value", "periodic_check"], ["name", "buildingSafetyName", "type", "text", "label", "Nom ou rep\u00E8re", "placeholder", "Ex. Extincteur hall d\u2019accueil", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "buildingSafetyNextDueDate", "type", "date", "label", "Prochaine \u00E9ch\u00E9ance", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "buildingSafetyLastCheckedAt", "type", "date", "label", "Dernier contr\u00F4le", 3, "ngModelChange", "ngModel", "disabled"], ["class", "field", 4, "ngIf"], ["name", "buildingSafetyNotes", "rows", "3", "placeholder", "Ex. v\u00E9rification annuelle \u00E0 anticiper avant l\u2019\u00E9t\u00E9", 3, "ngModelChange", "ngModel", "disabled"], ["class", "building-safety-list", 4, "ngIf", "ngIfElse"], ["id", "reg-obligations-section", "eyebrow", "S2-004 \u00B7 S2-010 \u00B7 S2-011", "title", "Fiches d\u2019obligations", "description", "Ouvrez une fiche pour comprendre pourquoi elle s\u2019applique, quoi faire maintenant et quelles preuves sont d\u00E9j\u00E0 pr\u00EAtes.", 1, "desktop-card"], ["class", "chips", 4, "ngIf"], [3, "label", "tone", 4, "ngIf"], ["class", "chips criteria-chips", 4, "ngIf"], ["class", "obligation-list", 4, "ngIf", "ngIfElse"], ["class", "obligation-detail", 4, "ngIf"], ["id", "reg-duerp-section", "eyebrow", "S2-020", "title", "DUERP simplifi\u00E9", "description", "Une base claire pour recenser quelques unit\u00E9s de travail, risques et actions de pr\u00E9vention sans jargon HSE.", 1, "desktop-card"], [1, "duerp-form", 3, "ngSubmit"], ["name", "duerpSiteId", 3, "ngModelChange", "ngModel", "disabled"], ["name", "duerpWorkUnitName", "type", "text", "label", "Unit\u00E9 de travail", "placeholder", "Ex. intervention en hauteur", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "duerpRiskLabel", "type", "text", "label", "Risque identifi\u00E9", "placeholder", "Ex. chute lors d\u2019une maintenance", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "duerpSeverity", 3, "ngModelChange", "ngModel", "disabled"], ["value", "low"], ["value", "medium"], ["value", "high"], ["name", "duerpPreventionAction", "rows", "3", "placeholder", "Ex. balisage, EPI, v\u00E9rification avant intervention", 3, "ngModelChange", "ngModel", "disabled"], ["class", "duerp-list", 4, "ngIf", "ngIfElse"], ["id", "reg-evidence-section", "eyebrow", "S2-021 \u00B7 S2-022", "title", "Preuves et tra\u00E7abilit\u00E9", "description", "Ajoutez des preuves simples, rattachez-les au bon sujet et gardez une lecture d\u00E9montrable de la conformit\u00E9.", 1, "desktop-card"], [1, "evidence-form", 3, "ngSubmit"], ["name", "evidenceLinkKind", 3, "ngModelChange", "ngModel", "disabled"], ["value", "obligation"], ["value", "building_safety_item"], ["value", "duerp_entry"], ["name", "evidenceFileName", "type", "text", "label", "Nom du justificatif", "placeholder", "Ex. attestation controle-extincteur-2026.pdf", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "evidenceDocumentType", "type", "text", "label", "Type", "placeholder", "Ex. attestation", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "evidenceNotes", "rows", "3", "placeholder", "Ex. justificatif ajout\u00E9 apr\u00E8s le dernier contr\u00F4le", 3, "ngModelChange", "ngModel", "disabled"], ["class", "evidence-list", 4, "ngIf", "ngIfElse"], [1, "regulatory-foundation-column"], ["class", "desktop-card", "eyebrow", "S2-001", "title", "Onboarding entreprise", "description", "Quelques informations essentielles pour d\u00E9marrer sans jargon r\u00E9glementaire ni formulaire intimidant.", 4, "ngIf"], ["id", "reg-profile-section", "eyebrow", "S2-002", "title", "Profil entreprise", "description", "Un profil clair et exploitable, avec seulement les informations utiles au p\u00E9rim\u00E8tre r\u00E9glementaire V1.", 1, "desktop-card"], ["class", "profile-form", 3, "ngSubmit", 4, "ngIf"], ["id", "reg-profile-questionnaire-section", "class", "desktop-card", "eyebrow", "S2-005", "title", "Questionnaire r\u00E9glementaire court", "description", "Trois questions courtes pour affiner le profil r\u00E9glementaire sans vous demander d'expertise juridique.", 4, "ngIf"], ["eyebrow", "S2-001", "title", "Onboarding entreprise", "description", "Quelques informations essentielles pour d\u00E9marrer sans jargon r\u00E9glementaire ni formulaire intimidant.", 1, "desktop-card"], ["label", "\u00C9tape 1 sur 2", "tone", "progress"], ["label", "Essentiel uniquement", "tone", "calm"], [1, "profile-form", 3, "ngSubmit"], ["name", "onboardingName", "type", "text", "label", "Nom de l\u2019entreprise", "placeholder", "Ex. Conform\u00E9o Services", "required", "", 3, "ngModelChange", "ngModel"], ["name", "onboardingActivity", "type", "text", "label", "Activit\u00E9 principale", "placeholder", "Ex. maintenance multitechnique", "required", "", 3, "ngModelChange", "ngModel"], ["name", "onboardingHasEmployees", "required", "", 3, "ngModelChange", "ngModel"], ["value", "yes"], ["value", "no"], ["name", "onboardingEmployeeCount", "type", "number", "label", "Effectif", "placeholder", "Ex. 12", 3, "ngModelChange", "ngModel"], ["name", "onboardingContactEmail", "type", "email", "label", "Email de contact", "placeholder", "contact@entreprise.fr", "required", "", 3, "ngModelChange", "ngModel"], ["name", "profileName", "type", "text", "label", "Nom de l\u2019entreprise", "placeholder", "Nom affich\u00E9 dans la plateforme", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "profileLegalName", "type", "text", "label", "Raison sociale", "placeholder", "Ex. Conform\u00E9o SAS", 3, "ngModelChange", "ngModel", "disabled"], ["name", "profileActivity", "type", "text", "label", "Activit\u00E9", "placeholder", "Ex. maintenance, exploitation, travaux", 3, "ngModelChange", "ngModel", "disabled"], ["name", "profileEmployeeCount", "type", "number", "label", "Effectif", "placeholder", "Ex. 12", 3, "ngModelChange", "ngModel", "disabled"], ["name", "profileHasEmployees", 3, "ngModelChange", "ngModel", "disabled"], ["name", "profileContactEmail", "type", "email", "label", "Email de contact", "placeholder", "contact@entreprise.fr", 3, "ngModelChange", "ngModel", "disabled"], ["name", "profileContactPhone", "type", "tel", "label", "T\u00E9l\u00E9phone", "placeholder", "Ex. 04 78 00 00 00", 3, "ngModelChange", "ngModel", "disabled"], ["name", "profileHeadquartersAddress", "rows", "3", "placeholder", "Adresse utile pour le p\u00E9rim\u00E8tre r\u00E9glementaire", 3, "ngModelChange", "ngModel", "disabled"], ["name", "profileNotes", "rows", "4", "placeholder", "Pr\u00E9cisions utiles pour la suite du p\u00E9rim\u00E8tre r\u00E9glementaire", 3, "ngModelChange", "ngModel", "disabled"], ["id", "reg-profile-questionnaire-section", "eyebrow", "S2-005", "title", "Questionnaire r\u00E9glementaire court", "description", "Trois questions courtes pour affiner le profil r\u00E9glementaire sans vous demander d'expertise juridique.", 1, "desktop-card"], ["label", "3 questions utiles", "tone", "calm"], ["name", "qualificationReceivesPublic", 3, "ngModelChange", "ngModel", "disabled"], ["name", "qualificationStoresHazardousProducts", 3, "ngModelChange", "ngModel", "disabled"], ["name", "qualificationPerformsHighRiskWork", 3, "ngModelChange", "ngModel", "disabled"], [1, "site-list"], [1, "site-copy"], [1, "site-heading"], ["class", "site-enrichment", 4, "ngIf"], ["class", "site-actions", 4, "ngIf"], [1, "site-enrichment"], [1, "site-enrichment-header"], ["class", "site-enrichment-attempted", 4, "ngIf"], [1, "site-enrichment-detail"], ["class", "site-enrichment-reason", 4, "ngIf"], ["class", "site-enrichment-meta", 4, "ngIf"], [1, "site-enrichment-attempted"], [1, "site-enrichment-reason"], [1, "site-enrichment-meta"], [1, "site-actions"], ["type", "button", "size", "sm", 3, "variant", "disabled", "click", 4, "ngIf"], ["type", "button", "variant", "secondary", "size", "sm", 3, "click", "disabled"], ["type", "button", "size", "sm", 3, "click", "variant", "disabled"], ["label", "Site rep\u00E9r\u00E9", "tone", "calm"], ["tone", "neutral", 3, "label"], ["title", "Aucun site d\u00E9clar\u00E9", "description", "Ajoutez un premier site ou b\u00E2timent pour structurer progressivement l\u2019entreprise."], ["title", "Aucune alerte sur ce filtre", "description", "Les alertes s\u00E9curit\u00E9 b\u00E2timent apparaitront ici d\u00E8s qu\u2019un contr\u00F4le demande une action."], ["name", "buildingSafetyStatus", 3, "ngModelChange", "ngModel", "disabled"], ["value", "active"], ["value", "archived"], [1, "building-safety-list"], [1, "building-safety-copy"], ["tone", "neutral", 3, "label", 4, "ngIf"], ["title", "Aucun \u00E9l\u00E9ment s\u00E9curit\u00E9 d\u00E9clar\u00E9", "description", "Ajoutez un extincteur, un DAE ou un contr\u00F4le p\u00E9riodique pour commencer un suivi b\u00E2timent tr\u00E8s simple."], [1, "chips", "criteria-chips"], [3, "label", "tone", 4, "ngFor", "ngForOf"], [1, "obligation-list"], [1, "obligation-copy"], [1, "obligation-heading"], [1, "obligation-detail"], [1, "detail-copy"], ["class", "detail-list", 4, "ngIf"], [1, "detail-evidence-row"], ["title", "Aucune obligation V1 d\u00E9tect\u00E9e pour l\u2019instant", "description", "Compl\u00E9tez le profil ou ajoutez un site pour affiner le premier p\u00E9rim\u00E8tre r\u00E9glementaire."], [1, "duerp-list"], [1, "duerp-copy"], ["title", "Aucun risque DUERP saisi", "description", "Ajoutez quelques risques simples pour constituer une premi\u00E8re base DUERP exploitable."], ["name", "evidenceObligationId", 3, "ngModelChange", "ngModel", "disabled"], ["name", "evidenceSiteId", 3, "ngModelChange", "ngModel", "disabled"], ["name", "evidenceBuildingSafetyItemId", 3, "ngModelChange", "ngModel", "disabled"], ["name", "evidenceDuerpEntryId", 3, "ngModelChange", "ngModel", "disabled"], [1, "evidence-list"], ["label", "Disponible", "tone", "success"], ["title", "Aucune pi\u00E8ce justificative", "description", "Ajoutez une premi\u00E8re preuve r\u00E9glementaire simple pour compl\u00E9ter progressivement les obligations ou le DUERP."], ["class", "desktop-card", "eyebrow", "Facturation", "title", "Module non activ\u00E9", "description", "Activez le module Facturation pour cr\u00E9er vos premiers clients, devis et factures simples.", 4, "ngIf"], ["eyebrow", "Facturation", "title", "Module non activ\u00E9", "description", "Activez le module Facturation pour cr\u00E9er vos premiers clients, devis et factures simples.", 1, "desktop-card"], ["title", "Rien d\u2019autre \u00E0 remplir pour le moment", "description", "Le socle facturation apparaitra ici d\u00E8s que le module sera activ\u00E9."], ["eyebrow", "S3-001", "title", "Clients", "description", "Un socle client simple pour d\u00E9marrer rapidement sans base CRM ni configuration lourde.", 1, "desktop-card"], [1, "customer-form", 3, "ngSubmit"], ["name", "customerName", "type", "text", "label", "Nom du client", "placeholder", "Ex. Atelier Durand", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "customerType", 3, "ngModelChange", "ngModel", "disabled"], ["value", "company"], ["value", "individual"], ["name", "customerEmail", "type", "email", "label", "Email", "placeholder", "contact@client.fr", 3, "ngModelChange", "ngModel", "disabled"], ["name", "customerPhone", "type", "text", "label", "T\u00E9l\u00E9phone", "placeholder", "06 00 00 00 00", 3, "ngModelChange", "ngModel", "disabled"], ["name", "customerAddress", "rows", "3", "placeholder", "Adresse utile pour les documents simples", 3, "ngModelChange", "ngModel", "disabled"], ["name", "customerNotes", "rows", "3", "placeholder", "Ex. contact principal, info utile de facturation", 3, "ngModelChange", "ngModel", "disabled"], ["name", "customerSearch", "type", "text", "label", "Recherche rapide client", "placeholder", "Nom, email ou t\u00E9l\u00E9phone", 3, "ngModel", "ngModelChange", 4, "ngIf"], ["class", "customer-list", 4, "ngIf", "ngIfElse"], ["id", "billing-quote-card", "eyebrow", "S3-002", "title", "Devis simple", "description", "Un devis l\u00E9ger, rattach\u00E9 \u00E0 un client, avec quelques lignes et un total lisible.", 1, "desktop-card"], ["label", "Saisie conserv\u00E9e", "tone", "calm", 4, "ngIf"], ["class", "billing-list", 4, "ngIf", "ngIfElse"], ["id", "billing-invoice-card", "eyebrow", "S3-003", "title", "Facture simple", "description", "Une facture l\u00E9g\u00E8re, rattach\u00E9e \u00E0 un client, avec lignes simples et total clair.", 1, "desktop-card"], ["name", "customerSearch", "type", "text", "label", "Recherche rapide client", "placeholder", "Nom, email ou t\u00E9l\u00E9phone", 3, "ngModelChange", "ngModel"], [1, "customer-list"], [1, "customer-copy"], ["class", "billing-item-actions", 4, "ngIf"], ["label", "Saisie conserv\u00E9e", "tone", "calm"], [1, "billing-form", 3, "ngSubmit"], ["name", "quoteCustomerId", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "quoteWorksiteId", 3, "ngModelChange", "ngModel", "disabled"], ["name", "quoteTitle", "type", "text", "label", "Objet", "placeholder", "Ex. Remise en \u00E9tat armoire \u00E9lectrique", 3, "ngModelChange", "ngModel", "disabled"], ["name", "quoteIssueDate", "type", "date", "label", "Date", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "quoteValidUntil", "type", "date", "label", "Valable jusqu'au", 3, "ngModelChange", "ngModel", "disabled"], ["name", "quoteStatus", 3, "ngModelChange", "ngModel", "disabled"], ["value", "sent"], ["name", "quoteNotes", "rows", "3", "placeholder", "Ex. port\u00E9e du devis ou pr\u00E9caution utile", 3, "ngModelChange", "ngModel", "disabled"], [1, "billing-lines", "field-wide"], [1, "billing-line-header"], ["class", "billing-line-editor", 4, "ngFor", "ngForOf"], [1, "billing-line-editor"], ["type", "text", "label", "Description", "placeholder", "Ex. Remplacement appareil", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "text", "label", "Quantit\u00E9", "placeholder", "1", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "text", "label", "Prix unitaire TTC (\u20AC)", "placeholder", "120", 3, "ngModelChange", "ngModel", "name", "disabled"], ["title", "Ajoutez d'abord un client", "description", "Le devis simple apparait d\u00E8s qu'un premier client est disponible."], [1, "billing-list"], ["class", "billing-history", 4, "ngIf"], ["class", "billing-form", 3, "ngSubmit", 4, "ngIf"], ["class", "field compact-field", 4, "ngIf"], ["value", "accepted"], ["value", "declined"], ["value", "normal"], ["value", "to_follow_up"], ["value", "followed_up"], ["value", "waiting_customer"], [1, "billing-history"], ["class", "history-list", 4, "ngIf", "ngIfElse"], [1, "history-list"], [1, "history-copy"], ["title", "Aucun \u00E9v\u00E9nement \u00E0 afficher", "description", "L'historique simple du devis apparaitra ici d\u00E8s qu'une action utile sera trac\u00E9e."], ["required", "", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "text", "label", "Objet", "placeholder", "Ex. Intervention ou prestation", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "date", "label", "Date", "required", "", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "date", "label", "Validit\u00E9", 3, "ngModelChange", "ngModel", "name", "disabled"], ["rows", "3", "placeholder", "Ex. port\u00E9e du devis ou pr\u00E9cision utile", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "text", "label", "Description", "placeholder", "Ex. Fourniture", 3, "ngModelChange", "ngModel", "name", "disabled"], ["title", "Aucun devis pour le moment", "description", "Cr\u00E9ez un premier devis simple avec quelques lignes et un total lisible."], ["name", "invoiceCustomerId", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "invoiceWorksiteId", 3, "ngModelChange", "ngModel", "disabled"], ["name", "invoiceTitle", "type", "text", "label", "Objet", "placeholder", "Ex. Intervention de maintenance", 3, "ngModelChange", "ngModel", "disabled"], ["name", "invoiceIssueDate", "type", "date", "label", "Date", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "invoiceDueDate", "type", "date", "label", "\u00C9ch\u00E9ance", 3, "ngModelChange", "ngModel", "disabled"], ["name", "invoiceStatus", 3, "ngModelChange", "ngModel", "disabled"], ["value", "issued"], ["name", "invoiceNotes", "rows", "3", "placeholder", "Ex. information utile visible dans l'outil", 3, "ngModelChange", "ngModel", "disabled"], ["type", "text", "label", "Description", "placeholder", "Ex. D\u00E9pannage sur site", 3, "ngModelChange", "ngModel", "name", "disabled"], ["title", "Ajoutez d'abord un client", "description", "La facture simple apparait d\u00E8s qu'un premier client est disponible."], ["class", "payment-form", 3, "ngSubmit", 4, "ngIf"], [1, "payment-form", 3, "ngSubmit"], ["type", "text", "label", "Montant pay\u00E9 (\u20AC)", "placeholder", "Ex. 1200", "required", "", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "date", "label", "Date de paiement", "required", "", 3, "ngModelChange", "ngModel", "name", "disabled"], ["title", "Aucun \u00E9v\u00E9nement \u00E0 afficher", "description", "L'historique simple de la facture apparaitra ici d\u00E8s qu'une action utile sera trac\u00E9e."], ["type", "date", "label", "\u00C9ch\u00E9ance", 3, "ngModelChange", "ngModel", "name", "disabled"], ["rows", "3", "placeholder", "Ex. pr\u00E9cision utile pour la facture", 3, "ngModelChange", "ngModel", "name", "disabled"], ["type", "text", "label", "Description", "placeholder", "Ex. Intervention", 3, "ngModelChange", "ngModel", "name", "disabled"], ["title", "Aucune facture pour le moment", "description", "Cr\u00E9ez une premi\u00E8re facture simple \u00E0 partir d'un client d\u00E9j\u00E0 enregistr\u00E9."], ["class", "desktop-card", "eyebrow", "Coordination", "title", "\u00C0 traiter", "description", "Une lecture simple des chantiers et documents encore ouverts, avec filtres l\u00E9gers par suivi et affectation.", 4, "ngIf"], ["eyebrow", "Coordination", "title", "\u00C0 traiter", "description", "Une lecture simple des chantiers et documents encore ouverts, avec filtres l\u00E9gers par suivi et affectation.", 1, "desktop-card"], ["name", "coordinationPageStatusFilter", 3, "ngModelChange", "ngModel"], ["name", "coordinationPageAssigneeFilter", 3, "ngModelChange", "ngModel"], ["title", "Module Chantier non activ\u00E9", "description", "Activez le module Chantier pour utiliser cette vue de coordination."], ["class", "desktop-card", "eyebrow", "Chantier", "title", "Vue chantier", "description", "Une lecture plus directe des chantiers, de leurs signaux et des actions utiles sans passer par le cockpit global.", 4, "ngIf"], ["eyebrow", "Chantier", "title", "Vue chantier", "description", "Une lecture plus directe des chantiers, de leurs signaux et des actions utiles sans passer par le cockpit global.", 1, "desktop-card"], ["title", "Module Chantier non activ\u00E9", "description", "Activez le module Chantier pour afficher les chantiers dans cette vue."]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "router-outlet");
            i0.ɵɵtemplate(1, AppComponent_ng_template_1_Template, 7, 5, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor)(3, AppComponent_ng_template_3_Template, 3, 3, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor)(5, AppComponent_ng_template_5_Template, 2, 2, "ng-template", null, 2, i0.ɵɵtemplateRefExtractor)(7, AppComponent_ng_template_7_Template, 1, 1, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor)(9, AppComponent_ng_template_9_Template, 1, 1, "ng-template", null, 4, i0.ɵɵtemplateRefExtractor);
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, i1.NgTemplateOutlet, i1.DatePipe, FormsModule, i2.ɵNgNoValidate, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.DefaultValueAccessor, i2.CheckboxControlValueAccessor, i2.SelectControlValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.NgModel, i2.NgForm, RouterOutlet,
            CfmButtonComponent,
            CfmCardComponent,
            CfmEmptyStateComponent,
            CfmInputComponent,
            CfmStatusChipComponent,
            DesktopRegulationShowcaseComponent], styles: ["\n      :host {\n        display: block;\n        min-height: 100vh;\n      }\n\n      .shell {\n        min-height: 100vh;\n        display: grid;\n        place-items: center;\n        padding: 2rem;\n        background:\n          radial-gradient(circle at top, rgba(245, 188, 88, 0.16), transparent 22%),\n          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);\n      }\n\n      .shell-workspace {\n        place-items: start center;\n        background:\n          radial-gradient(circle at top left, rgba(201, 224, 215, 0.58), transparent 28%),\n          radial-gradient(circle at top right, rgba(245, 188, 88, 0.2), transparent 24%),\n          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);\n      }\n\n      .workspace {\n        width: min(1240px, 100%);\n        display: grid;\n        gap: 1.25rem;\n        padding-bottom: 2.2rem;\n      }\n\n      .app-shell {\n        align-content: start;\n      }\n\n      .workspace-overview-bar,\n      .workspace-main-column,\n      .workspace-context-copy {\n        display: grid;\n        min-width: 0;\n      }\n\n      .workspace-overview-bar {\n        grid-template-columns: minmax(220px, auto) minmax(0, 1fr);\n        gap: 0.9rem;\n        align-items: start;\n      }\n\n      .workspace-main-column {\n        gap: 0.85rem;\n      }\n\n      .workspace-context-panel {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: space-between;\n        align-items: flex-start;\n        gap: 0.9rem;\n        min-width: 0;\n        padding: 0.88rem 1rem;\n        border-radius: 22px;\n        border: 1px solid rgba(137, 160, 149, 0.12);\n        background:\n          linear-gradient(180deg, rgba(252, 253, 252, 0.94), rgba(244, 248, 246, 0.94));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.88),\n          0 10px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .workspace-context-copy {\n        gap: 0.26rem;\n      }\n\n      .workspace-context-kicker {\n        margin: 0;\n      }\n\n      .workspace-context-title {\n        font-size: 1.02rem;\n        line-height: 1.2;\n        color: var(--cfm-color-ink);\n      }\n\n      .workspace-context-chips {\n        align-items: flex-start;\n      }\n\n      .workspace-body,\n      .workspace-page {\n        display: grid;\n        gap: 1.4rem;\n      }\n\n      .workspace-content-surface {\n        align-content: start;\n      }\n\n      .workspace-feedback-stack {\n        width: min(1240px, 100%);\n        display: grid;\n        gap: 0.55rem;\n        align-content: start;\n      }\n\n      .desktop-card {\n        width: min(1240px, 100%);\n        position: relative;\n        isolation: isolate;\n      }\n\n      .auth-form,\n      .modules,\n      .session-header,\n      .session-actions,\n      .organization-switch,\n      .customer-form,\n      .billing-form,\n      .profile-form,\n      .site-form,\n      .duerp-form,\n      .evidence-form {\n        display: grid;\n      }\n\n      h2,\n      h3,\n      p {\n        margin: 0;\n      }\n\n      h2 {\n        font-size: 1.75rem;\n        color: var(--cfm-color-ink);\n      }\n\n      h3 {\n        font-size: 1rem;\n        color: var(--cfm-color-ink);\n      }\n\n      .auth-form,\n      .customer-form,\n      .billing-form,\n      .profile-form,\n      .site-form,\n      .building-safety-form,\n      .duerp-form,\n      .evidence-form {\n        gap: 1rem;\n      }\n\n      .meta,\n      .small,\n      .modules p,\n      .feedback,\n      .organization-switch span,\n      .field span,\n      .customer-copy span,\n      .site-copy span,\n      .building-safety-copy span,\n      .duerp-copy span,\n      .obligation-copy span {\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .organization-switch,\n      .field {\n        gap: 0.35rem;\n        width: 100%;\n      }\n\n      .field {\n        display: grid;\n      }\n\n      .field span {\n        font-weight: 600;\n        letter-spacing: 0.01em;\n      }\n\n      .field-wide {\n        grid-column: 1 / -1;\n      }\n\n      select,\n      textarea {\n        width: 100%;\n        box-sizing: border-box;\n        border: 1px solid var(--cfm-color-border);\n        border-radius: var(--cfm-radius-field);\n        padding: 0.85rem 1rem;\n        font: inherit;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 252, 0.94));\n        color: var(--cfm-color-ink);\n        transition:\n          border-color 0.18s ease,\n          box-shadow 0.18s ease,\n          background-color 0.18s ease,\n          transform 0.18s ease;\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 10px 22px rgba(18, 33, 42, 0.04);\n      }\n\n      textarea {\n        resize: vertical;\n        min-height: 6.5rem;\n      }\n\n      select:focus,\n      textarea:focus {\n        outline: none;\n        border-color: #8ba79a;\n        background: #ffffff;\n        box-shadow:\n          0 0 0 4px rgba(139, 167, 154, 0.16),\n          0 14px 30px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(15, 23, 42, 0.03);\n        transform: translateY(-1px);\n      }\n\n      .session-header {\n        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\n        gap: 0.58rem;\n        align-items: start;\n      }\n\n      .session-actions {\n        gap: 0.55rem;\n        justify-items: end;\n        min-width: 0;\n      }\n\n      .workspace-shell-copy,\n      .workspace-shell-actions {\n        display: grid;\n        gap: 0.38rem;\n        min-width: 0;\n      }\n\n      .workspace-shell-meta {\n        font-weight: 500;\n        letter-spacing: 0.01em;\n        line-height: 1.25;\n      }\n\n      .app-nav {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.4rem;\n        min-width: 0;\n        margin-top: -0.24rem;\n        padding: 0.28rem 0.38rem 0.34rem;\n        border: 1px solid rgba(137, 160, 149, 0.12);\n        border-radius: 1rem;\n        background:\n          linear-gradient(180deg, rgba(252, 253, 252, 0.94), rgba(246, 249, 247, 0.97));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 4px 10px rgba(18, 33, 42, 0.028);\n      }\n\n      .regulatory-foundation-grid,\n      .regulatory-foundation-column {\n        display: grid;\n        min-width: 0;\n      }\n\n      .regulatory-foundation-grid {\n        grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);\n        gap: 1.15rem;\n        align-items: start;\n      }\n\n      .regulatory-foundation-column {\n        gap: 1.15rem;\n        align-content: start;\n      }\n\n      .app-nav-link {\n        display: inline-flex;\n        align-items: center;\n        min-width: 0;\n        padding: 0.18rem 0.22rem;\n        border-radius: 999px;\n        text-decoration: none;\n        opacity: 0.96;\n        transition:\n          transform 0.16s ease,\n          opacity 0.16s ease,\n          background-color 0.16s ease,\n          box-shadow 0.16s ease;\n      }\n\n      .app-nav-link:hover {\n        transform: translateY(-1px);\n        background: rgba(137, 160, 149, 0.09);\n      }\n\n      .app-nav-link.is-active {\n        transform: translateY(-1px);\n        background: rgba(255, 255, 255, 0.92);\n        box-shadow:\n          inset 0 0 0 1px rgba(137, 160, 149, 0.2),\n          0 6px 14px rgba(18, 33, 42, 0.04);\n      }\n\n      .nav-icon-placeholder {\n        display: none;\n      }\n\n      .meta,\n      .small {\n        margin-top: 0.16rem;\n      }\n\n      @media (max-width: 1280px) {\n        .session-header {\n          grid-template-columns: minmax(0, 1.18fr) minmax(280px, 0.82fr);\n          gap: 0.5rem;\n        }\n\n        .workspace-shell-copy,\n        .workspace-shell-actions {\n          gap: 0.32rem;\n        }\n\n        .session-actions {\n          gap: 0.46rem;\n        }\n      }\n\n      @media (max-width: 1180px) {\n        .workspace {\n          gap: 1.15rem;\n        }\n\n        .session-header {\n          grid-template-columns: minmax(0, 1fr);\n          gap: 0.44rem;\n        }\n\n        .session-actions {\n          justify-items: start;\n          gap: 0.42rem;\n        }\n\n        .workspace-shell-copy,\n        .workspace-shell-actions {\n          gap: 0.28rem;\n        }\n\n        .workspace-overview-bar,\n        .regulatory-foundation-grid {\n          grid-template-columns: 1fr;\n          gap: 1rem;\n        }\n\n        .regulatory-foundation-column {\n          gap: 1rem;\n        }\n\n        .app-nav {\n          margin-top: -0.18rem;\n          padding: 0.24rem 0.32rem 0.3rem;\n        }\n      }\n\n      @media (max-width: 820px) {\n        .workspace-context-panel {\n          padding: 0.8rem 0.88rem;\n        }\n\n        .app-nav {\n          gap: 0.3rem;\n          padding: 0.22rem 0.26rem 0.28rem;\n        }\n\n        .app-nav-link {\n          padding: 0.14rem 0.18rem;\n        }\n      }\n\n      .grid {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n        gap: 1rem;\n      }\n\n      article {\n        position: relative;\n        overflow: hidden;\n        padding: 1.3rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(247, 243, 234, 0.84)),\n          #f4f1ea;\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 36px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.8);\n        transition:\n          transform 0.18s ease,\n          box-shadow 0.18s ease,\n          border-color 0.18s ease;\n      }\n\n      article::before {\n        content: \"\";\n        position: absolute;\n        inset: 0 0 auto;\n        height: 3px;\n        background: linear-gradient(90deg, rgba(29, 109, 100, 0.88), rgba(245, 188, 88, 0.72));\n        opacity: 0.95;\n      }\n\n      article:hover {\n        transform: translateY(-2px);\n        box-shadow:\n          0 22px 44px rgba(18, 33, 42, 0.08),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n      }\n\n      .chips {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 0.5rem;\n      }\n\n      .stack-list,\n      .module-list,\n      .customer-list,\n      .site-list,\n      .obligation-list,\n      .alert-list,\n      .building-safety-list,\n      .billing-list,\n      .duerp-list,\n      .evidence-list {\n        list-style: none;\n        padding: 0;\n        margin: 0;\n      }\n\n      .stack-list,\n      .module-list,\n      .customer-list,\n      .site-list,\n      .obligation-list,\n      .alert-list,\n      .building-safety-list,\n      .billing-list,\n      .duerp-list,\n      .evidence-list {\n        display: grid;\n        gap: 0.85rem;\n      }\n\n      .stack-list li,\n      .module-list li,\n      .customer-list li,\n      .site-list li,\n      .alert-list li,\n      .building-safety-list li,\n      .billing-list li,\n      .duerp-list li,\n      .evidence-list li {\n        display: flex;\n        align-items: start;\n        justify-content: space-between;\n        gap: 1rem;\n        position: relative;\n        padding: 1.08rem 1.15rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 250, 249, 0.78));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 12px 24px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.8);\n        transition:\n          transform 0.18s ease,\n          box-shadow 0.18s ease,\n          border-color 0.18s ease;\n      }\n\n      .stack-list li:hover,\n      .module-list li:hover,\n      .customer-list li:hover,\n      .site-list li:hover,\n      .alert-list li:hover,\n      .building-safety-list li:hover,\n      .billing-list li:hover,\n      .duerp-list li:hover,\n      .evidence-list li:hover {\n        transform: translateY(-1px);\n        box-shadow:\n          0 16px 30px rgba(18, 33, 42, 0.07),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n        border-color: rgba(29, 109, 100, 0.14);\n      }\n\n      .list-copy,\n      .module-copy,\n      .customer-copy,\n      .site-copy,\n      .building-safety-copy,\n      .duerp-copy {\n        display: grid;\n        gap: 0.25rem;\n      }\n\n      .site-actions {\n        display: grid;\n        justify-items: end;\n        align-content: start;\n        gap: 0.6rem;\n        min-width: 13.5rem;\n      }\n\n      .site-enrichment {\n        display: grid;\n        gap: 0.28rem;\n        margin-top: 0.28rem;\n        min-width: 0;\n      }\n\n      .site-enrichment-header {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.5rem;\n      }\n\n      .site-enrichment-attempted,\n      .site-enrichment-reason,\n      .site-enrichment-meta {\n        font-size: 0.86rem;\n        line-height: 1.4;\n        color: rgba(23, 49, 43, 0.72);\n        overflow-wrap: break-word;\n      }\n\n      .site-enrichment-detail {\n        font-size: 0.92rem;\n        line-height: 1.45;\n        color: #17312b;\n      }\n\n      .obligation-copy {\n        display: grid;\n        gap: 0.45rem;\n        padding: 1.1rem 1.15rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(244, 246, 241, 0.96), rgba(255, 255, 255, 0.86));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .obligation-detail {\n        display: grid;\n        gap: 1rem;\n        margin-top: 1.25rem;\n        padding: 1.2rem 1.25rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(238, 243, 239, 0.96), rgba(255, 255, 255, 0.8));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 34px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.8);\n        animation: panelReveal 180ms ease;\n      }\n\n      .detail-grid {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 1rem;\n      }\n\n      .detail-block,\n      .detail-copy {\n        display: grid;\n        gap: 0.45rem;\n      }\n\n      .detail-block {\n        padding: 1.05rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(250, 252, 252, 0.74));\n        border: 1px solid rgba(15, 23, 42, 0.05);\n      }\n\n      .detail-list {\n        list-style: disc;\n        padding-left: 1.25rem;\n        margin: 0;\n        display: grid;\n        gap: 0.45rem;\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .detail-evidence-row {\n        display: flex;\n        justify-content: space-between;\n        align-items: start;\n        gap: 1rem;\n      }\n\n      .list-copy span {\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .modules {\n        gap: 1rem;\n        padding: 1.42rem 1.48rem;\n        border-radius: 28px;\n        background:\n          linear-gradient(180deg, rgba(245, 249, 249, 0.96), rgba(234, 241, 239, 0.94));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.82),\n          0 18px 40px rgba(18, 33, 42, 0.06);\n      }\n\n      .modules-header {\n        display: flex;\n        justify-content: space-between;\n        gap: 1rem;\n      }\n\n      .card-header-actions {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: space-between;\n        align-items: center;\n        gap: 1rem;\n      }\n\n      .regulatory-showcase-card {\n        overflow: hidden;\n      }\n\n      .regulatory-hero,\n      .regulatory-support-grid {\n        display: grid;\n        grid-template-columns: minmax(0, 2.2fr) minmax(280px, 1fr);\n        gap: 1.1rem;\n      }\n\n      .regulatory-hero-copy,\n      .regulatory-hero-copy-block,\n      .regulatory-score-card,\n      .regulatory-priority-card,\n      .regulatory-family-card,\n      .regulatory-support-block,\n      .regulatory-support-copy {\n        display: grid;\n      }\n\n      .regulatory-hero-copy,\n      .regulatory-score-card,\n      .regulatory-priority-card,\n      .regulatory-family-card,\n      .regulatory-support-block {\n        gap: 0.85rem;\n        padding: 1.12rem 1.18rem;\n        border-radius: 24px;\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 34px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n      }\n\n      .regulatory-hero-copy {\n        background:\n          linear-gradient(180deg, rgba(248, 251, 249, 0.96), rgba(255, 255, 255, 0.86));\n      }\n\n      .regulatory-score-card,\n      .regulatory-family-card,\n      .regulatory-support-block {\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(244, 248, 247, 0.82));\n      }\n\n      .regulatory-priority-card {\n        background:\n          linear-gradient(180deg, rgba(247, 249, 244, 0.96), rgba(255, 255, 255, 0.86));\n      }\n\n      .regulatory-showcase-chips {\n        margin-bottom: 0.2rem;\n      }\n\n      .regulatory-hero-copy-block {\n        gap: 0.45rem;\n        max-width: 64ch;\n      }\n\n      .regulatory-hero-copy-block h3,\n      .regulatory-priority-card h3,\n      .regulatory-support-block h3 {\n        margin: 0;\n        font-size: 1.28rem;\n        line-height: 1.15;\n        letter-spacing: -0.02em;\n      }\n\n      .regulatory-hero-copy-block p,\n      .regulatory-priority-card p,\n      .regulatory-family-card p,\n      .regulatory-support-block p {\n        margin: 0;\n      }\n\n      .regulatory-score-label {\n        color: rgba(23, 49, 43, 0.72);\n      }\n\n      .regulatory-score-value {\n        font-size: clamp(2.4rem, 5vw, 3.4rem);\n        line-height: 0.95;\n        letter-spacing: -0.05em;\n        color: var(--cfm-color-ink);\n      }\n\n      .regulatory-score-breakdown,\n      .regulatory-score-breakdown-copy {\n        display: grid;\n      }\n\n      .regulatory-score-breakdown {\n        gap: 0.6rem;\n        padding-top: 0.2rem;\n      }\n\n      .regulatory-score-breakdown-list {\n        list-style: none;\n        padding: 0;\n        margin: 0;\n        display: grid;\n        gap: 0.65rem;\n      }\n\n      .regulatory-score-breakdown-list li {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        gap: 0.8rem;\n        min-width: 0;\n        padding-top: 0.65rem;\n        border-top: 1px solid rgba(15, 23, 42, 0.08);\n      }\n\n      .regulatory-score-breakdown-copy {\n        gap: 0.16rem;\n        min-width: 0;\n      }\n\n      .regulatory-score-breakdown-copy span,\n      .regulatory-support-summary {\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .regulatory-priority-grid,\n      .regulatory-family-grid {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n        gap: 1rem;\n      }\n\n      .regulatory-family-count {\n        font-size: 1rem;\n        font-weight: 700;\n        color: #17312b;\n      }\n\n      .regulatory-family-highlights,\n      .regulatory-action-list,\n      .regulatory-proof-list {\n        list-style: none;\n        padding: 0;\n        margin: 0;\n        display: grid;\n      }\n\n      .regulatory-family-highlights {\n        gap: 0.6rem;\n      }\n\n      .regulatory-family-highlights li,\n      .regulatory-action-list li,\n      .regulatory-proof-list li {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        gap: 0.85rem;\n        min-width: 0;\n      }\n\n      .regulatory-family-highlights li {\n        padding-top: 0.65rem;\n        border-top: 1px solid rgba(15, 23, 42, 0.08);\n      }\n\n      .regulatory-action-list,\n      .regulatory-proof-list {\n        gap: 0.85rem;\n      }\n\n      .regulatory-action-list li,\n      .regulatory-proof-list li {\n        padding: 0.95rem 1rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 250, 249, 0.78));\n        border: 1px solid rgba(15, 23, 42, 0.05);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .regulatory-support-copy {\n        gap: 0.24rem;\n        min-width: 0;\n      }\n\n      .regulatory-support-summary {\n        margin: -0.1rem 0 0;\n      }\n\n      @media (max-width: 1080px) {\n        .regulatory-priority-grid,\n        .regulatory-family-grid {\n          grid-template-columns: repeat(2, minmax(0, 1fr));\n        }\n      }\n\n      .dashboard-grid {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));\n        gap: 1.05rem;\n        margin: 1.15rem 0 1.35rem;\n      }\n\n      .dashboard-kpi-card,\n      .dashboard-alert-copy {\n        display: grid;\n        gap: 0.35rem;\n      }\n\n      .dashboard-kpi-card {\n        position: relative;\n        overflow: hidden;\n        padding: 1.08rem 1.12rem 1.12rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 246, 241, 0.92));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 14px 28px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n      }\n\n      .dashboard-kpi-card::after {\n        content: \"\";\n        position: absolute;\n        inset: auto 0 0;\n        height: 48%;\n        background: linear-gradient(180deg, transparent, rgba(29, 109, 100, 0.06));\n        pointer-events: none;\n      }\n\n      .dashboard-module-highlights {\n        list-style: none;\n        padding: 0;\n        margin: 0.2rem 0 0;\n        display: grid;\n        gap: 0.55rem;\n      }\n\n      .dashboard-module-highlights li {\n        display: grid;\n        gap: 0.15rem;\n        padding-top: 0.55rem;\n        border-top: 1px solid rgba(15, 23, 42, 0.08);\n      }\n\n      .dashboard-kpi-value {\n        font-size: 2.15rem;\n        line-height: 0.96;\n        letter-spacing: -0.03em;\n        color: var(--cfm-color-ink);\n      }\n\n      .dashboard-alerts {\n        display: grid;\n        gap: 0.9rem;\n        padding: 1.08rem 1.15rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(246, 250, 249, 0.74));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 14px 28px rgba(18, 33, 42, 0.05);\n      }\n\n      .dashboard-actions {\n        display: grid;\n        gap: 0.9rem;\n        margin-top: 1.35rem;\n        padding: 1.08rem 1.15rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(246, 250, 249, 0.74));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 14px 28px rgba(18, 33, 42, 0.05);\n      }\n\n      .dashboard-actions-header {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: space-between;\n        align-items: end;\n        gap: 1rem;\n      }\n\n      .dashboard-action-copy {\n        display: grid;\n        gap: 0.35rem;\n      }\n\n      .dashboard-filter {\n        max-width: 240px;\n      }\n\n      .dashboard-alert-copy span {\n        line-height: 1.35;\n      }\n\n      .toggle {\n        display: inline-flex;\n        align-items: center;\n        gap: 0.65rem;\n      }\n\n      .toggle input {\n        width: auto;\n      }\n\n      .profile-form {\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n      }\n\n      .auth-form,\n      .customer-form,\n      .billing-form,\n      .profile-form,\n      .site-form,\n      .building-safety-form,\n      .duerp-form,\n      .evidence-form,\n      .feedback-capture-form {\n        padding: 1.1rem 1.15rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(247, 250, 249, 0.82));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 14px 32px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n      }\n\n      .customer-form {\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        align-items: end;\n        margin: 1.25rem 0;\n      }\n\n      .site-form {\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        align-items: end;\n        margin-bottom: 1rem;\n      }\n\n      .billing-form,\n      .building-safety-form,\n      .duerp-form,\n      .evidence-form {\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        align-items: end;\n        margin: 1.25rem 0;\n      }\n\n      .billing-lines {\n        display: grid;\n        gap: 1rem;\n      }\n\n      .billing-line-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        gap: 1rem;\n      }\n\n      .billing-line-editor {\n        display: grid;\n        grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr)) auto;\n        align-items: end;\n        gap: 0.75rem;\n        padding: 1.02rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 250, 249, 0.76));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.05);\n      }\n\n      .form-actions {\n        display: flex;\n        align-items: end;\n      }\n\n      .inline-actions {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 0.8rem;\n      }\n\n      .billing-item-actions {\n        display: grid;\n        gap: 0.8rem;\n        justify-items: stretch;\n        align-content: start;\n        min-width: min(260px, 100%);\n        padding: 0.15rem;\n      }\n\n      .compact-field {\n        min-width: 180px;\n        padding: 0.85rem 0.95rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 250, 249, 0.76));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.8),\n          0 10px 22px rgba(18, 33, 42, 0.04);\n      }\n\n      .inline-choice-list {\n        display: grid;\n        gap: 0.5rem;\n        padding: 0.9rem 1rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 250, 249, 0.78));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .inline-choice {\n        display: flex;\n        align-items: center;\n        gap: 0.6rem;\n      }\n\n      .inline-choice input {\n        width: auto;\n      }\n\n      .document-linked-panel {\n        display: grid;\n        gap: 0.8rem;\n        padding: 1.05rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 245, 242, 0.82));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 34px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n        animation: panelReveal 180ms ease;\n      }\n\n      .payment-form {\n        display: grid;\n        gap: 0.75rem;\n        padding: 1rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 250, 249, 0.76));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .document-adjustment-form {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 0.85rem;\n        padding: 1.08rem;\n        margin-top: 0.9rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(239, 245, 242, 0.84));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 18px 38px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n        animation: panelReveal 180ms ease;\n      }\n\n      .document-preview,\n      .document-preview-header {\n        display: grid;\n        gap: 0.65rem;\n      }\n\n      .feedback-capture-form {\n        display: grid;\n        gap: 1rem;\n      }\n\n      .document-preview {\n        padding: 1.05rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(238, 243, 239, 0.96), rgba(255, 255, 255, 0.82));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 28px rgba(18, 33, 42, 0.05);\n      }\n\n      .feedback-preview-text {\n        margin: 0;\n        white-space: pre-wrap;\n        word-break: break-word;\n        font: inherit;\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .billing-history {\n        display: grid;\n        gap: 0.75rem;\n        padding: 1.04rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 245, 242, 0.82));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 34px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n        animation: panelReveal 180ms ease;\n      }\n\n      .history-list {\n        list-style: none;\n        padding: 0;\n        margin: 0;\n        display: grid;\n        gap: 0.75rem;\n      }\n\n      .history-copy {\n        display: grid;\n        gap: 0.2rem;\n      }\n\n      .history-list li {\n        padding: 0.9rem 0.95rem;\n        border-radius: 18px;\n        background: rgba(255, 255, 255, 0.72);\n        border: 1px solid rgba(15, 23, 42, 0.05);\n        box-shadow: 0 10px 22px rgba(18, 33, 42, 0.04);\n      }\n\n      .site-heading {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.75rem;\n      }\n\n      .obligation-heading {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: start;\n        justify-content: space-between;\n        gap: 0.75rem;\n      }\n\n      .criteria-chips {\n        margin: 1rem 0 1.2rem;\n      }\n\n      .building-safety-header {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: space-between;\n        align-items: end;\n        gap: 1rem;\n        margin-bottom: 1rem;\n      }\n\n      .feedback {\n        position: relative;\n        display: grid;\n        gap: 0.2rem;\n        margin-top: 1rem;\n        padding: 0.95rem 1rem 0.95rem 1.15rem;\n        border-radius: 20px;\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 250, 249, 0.84));\n        box-shadow:\n          0 14px 30px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n        animation: feedbackPulse 220ms ease;\n      }\n\n      .workspace-feedback-stack .feedback {\n        margin-top: 0;\n      }\n\n      .feedback::before {\n        content: \"\";\n        position: absolute;\n        left: 0.8rem;\n        top: 0.95rem;\n        bottom: 0.95rem;\n        width: 4px;\n        border-radius: 999px;\n        background: currentColor;\n        opacity: 0.24;\n      }\n\n      .feedback.error {\n        color: #8a2d2d;\n        border-color: rgba(138, 45, 45, 0.16);\n        background:\n          linear-gradient(180deg, rgba(254, 243, 241, 0.98), rgba(255, 255, 255, 0.88));\n      }\n\n      .feedback.success {\n        color: #1f6a47;\n        border-color: rgba(31, 106, 71, 0.16);\n        background:\n          linear-gradient(180deg, rgba(239, 250, 245, 0.98), rgba(255, 255, 255, 0.88));\n      }\n\n      .feedback.progress {\n        color: #7c5b20;\n        border-color: rgba(124, 91, 32, 0.18);\n        background:\n          linear-gradient(180deg, rgba(255, 247, 228, 0.98), rgba(255, 255, 255, 0.88));\n      }\n\n      .feedback-title,\n      .feedback-body {\n        margin: 0;\n      }\n\n      .feedback-title {\n        font-size: 0.84rem;\n        line-height: 1.2;\n        font-weight: 700;\n        letter-spacing: 0.01em;\n      }\n\n      .feedback-body {\n        line-height: 1.4;\n      }\n\n      .loading-state-card {\n        display: grid;\n        gap: 0.85rem;\n        padding: 0.15rem 0 0.2rem;\n      }\n\n      .loading-state-skeleton,\n      .loading-state-copy {\n        display: grid;\n      }\n\n      .loading-state-skeleton {\n        gap: 1rem;\n      }\n\n      .loading-state-hero,\n      .loading-state-grid span,\n      .loading-state-lines span {\n        display: block;\n        border-radius: 999px;\n        background:\n          linear-gradient(90deg, rgba(255, 255, 255, 0.72), rgba(232, 239, 237, 0.96), rgba(255, 255, 255, 0.72));\n        background-size: 220% 100%;\n        animation: skeletonPulse 1.35s ease-in-out infinite;\n      }\n\n      .loading-state-hero {\n        height: 1.1rem;\n        width: min(320px, 72%);\n      }\n\n      .loading-state-grid {\n        display: grid;\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        gap: 0.85rem;\n      }\n\n      .loading-state-grid span {\n        height: 5.6rem;\n        border-radius: 22px;\n      }\n\n      .loading-state-lines {\n        display: grid;\n        gap: 0.7rem;\n      }\n\n      .loading-state-lines span {\n        height: 0.95rem;\n      }\n\n      .loading-state-lines span:nth-child(2) {\n        width: 88%;\n      }\n\n      .loading-state-lines span:nth-child(3) {\n        width: 68%;\n      }\n\n      .loading-state-copy {\n        gap: 0.24rem;\n        max-width: 44ch;\n      }\n\n      .loading-state-label {\n        margin: 0;\n        font-size: 0.92rem;\n        line-height: 1.25;\n        font-weight: 650;\n        color: #17312b;\n      }\n\n      @keyframes skeletonPulse {\n        0% {\n          background-position: 100% 50%;\n        }\n\n        100% {\n          background-position: 0% 50%;\n        }\n      }\n\n      @keyframes panelReveal {\n        from {\n          opacity: 0;\n          transform: translateY(6px);\n        }\n\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n\n      @keyframes feedbackPulse {\n        from {\n          opacity: 0;\n          transform: translateY(4px);\n        }\n\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n\n      code {\n        font-family: \"SFMono-Regular\", \"Menlo\", monospace;\n        font-size: 0.92em;\n      }\n\n      @media (max-width: 900px) {\n        .profile-form,\n        .customer-form,\n        .billing-form,\n        .site-form,\n        .building-safety-form,\n        .duerp-form,\n        .evidence-form,\n        .regulatory-hero,\n        .regulatory-support-grid,\n        .regulatory-priority-grid,\n        .regulatory-family-grid,\n        .document-adjustment-form,\n        .billing-line-editor,\n        .detail-grid,\n        .loading-state-grid {\n          grid-template-columns: 1fr;\n        }\n\n        .session-actions {\n          justify-items: stretch;\n        }\n\n        .card-header-actions {\n          align-items: stretch;\n        }\n\n        .site-list li,\n        .customer-list li,\n        .building-safety-list li,\n        .billing-list li,\n        .duerp-list li,\n        .evidence-list li,\n        .detail-evidence-row,\n        .alert-list li,\n        .module-list li,\n        .stack-list li {\n          flex-direction: column;\n        }\n\n        .billing-item-actions {\n          min-width: 0;\n          width: 100%;\n        }\n\n        .regulatory-family-highlights li,\n        .regulatory-score-breakdown-list li,\n        .regulatory-action-list li,\n        .regulatory-proof-list li {\n          flex-direction: column;\n          align-items: start;\n        }\n\n        .site-actions {\n          width: 100%;\n          min-width: 0;\n          justify-items: stretch;\n        }\n      }\n    "], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppComponent, [{
        type: Component,
        args: [{ selector: "cfm-root", standalone: true, encapsulation: ViewEncapsulation.None, imports: [
                    CommonModule,
                    FormsModule,
                    RouterOutlet,
                    CfmButtonComponent,
                    CfmCardComponent,
                    CfmEmptyStateComponent,
                    CfmInputComponent,
                    CfmStatusChipComponent,
                    DesktopRegulationShowcaseComponent,
                ], providers: [
                    {
                        provide: DESKTOP_LOGIN_PAGE_CONTEXT,
                        useExisting: forwardRef(() => AppComponent),
                    },
                    {
                        provide: DESKTOP_SHELL_CONTEXT,
                        useExisting: forwardRef(() => AppComponent),
                    },
                    {
                        provide: DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT,
                        useExisting: forwardRef(() => AppComponent),
                    },
                ], template: `
    <router-outlet />

    <ng-template #homePageTemplate>
            <cfm-card
              *ngIf="shouldShowInitialWorkspaceLoading"
              class="desktop-card"
              eyebrow="Cockpit"
              title="Chargement du cockpit"
              description="Les repères entreprise, chantier et facturation sont en train d’être préparés."
            >
              <div class="loading-state-card">
                <div class="loading-state-skeleton" aria-hidden="true">
                  <div class="loading-state-hero"></div>
                  <div class="loading-state-grid">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div class="loading-state-lines">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div class="loading-state-copy">
                  <p class="loading-state-label">Mise à jour en cours</p>
                  <p class="small">Les repères arrivent sans bloquer votre lecture.</p>
                </div>
              </div>
            </cfm-card>

            <ng-template #homeAdministrationCardTemplate>
              <cfm-card
                class="desktop-card"
                eyebrow="Organisation"
                title="Organisation et modules"
                description="Les réglages d’organisation et les modules activés restent accessibles, sans prendre la place du cockpit."
              >
                <div class="grid" *ngIf="currentMembership as membership">
                  <article>
                    <h3>Permissions</h3>
                    <div class="chips">
                      <cfm-status-chip
                        *ngFor="let permission of membership.permissions"
                        [label]="permission"
                        tone="calm"
                      />
                    </div>
                  </article>

                  <article>
                    <h3>Organisations liées</h3>
                    <ul class="stack-list">
                      <li *ngFor="let item of session?.memberships">
                        <div class="list-copy">
                          <strong>{{ item.organization.name }}</strong>
                          <span>{{ item.membership.role_code }}</span>
                        </div>
                        <cfm-status-chip
                          [label]="item.membership.is_default ? 'Courante' : 'Liée'"
                          [tone]="item.membership.is_default ? 'success' : 'neutral'"
                        />
                      </li>
                    </ul>
                  </article>
                </div>

                <section class="modules" *ngIf="currentMembership as membership">
                  <div class="modules-header">
                    <div>
                      <h3>Modules de l'organisation</h3>
                      <p>
                        Activez les modules utiles pour ouvrir progressivement la réglementation et la facturation depuis l’espace bureau.
                      </p>
                    </div>
                  </div>

                  <ul class="module-list" *ngIf="membership.modules.length > 0; else emptyModules">
                    <li *ngFor="let module of membership.modules">
                      <div class="module-copy">
                        <strong>{{ module.module_code }}</strong>
                        <cfm-status-chip
                          [label]="module.is_enabled ? 'Activé' : 'Désactivé'"
                          [tone]="module.is_enabled ? 'success' : 'neutral'"
                        />
                      </div>

                      <label class="toggle">
                        <input
                          type="checkbox"
                          [checked]="module.is_enabled"
                          [disabled]="loading || !canManageModules"
                          (change)="toggleModule(module.module_code, $any($event.target).checked)"
                        />
                        <span>{{ module.is_enabled ? "On" : "Off" }}</span>
                      </label>
                    </li>
                  </ul>

                  <ng-template #emptyModules>
                    <cfm-empty-state
                      title="Aucun module configuré"
                      description="Cette organisation n’a encore aucun module activable dans le socle actuel."
                    />
                  </ng-template>
                </section>
              </cfm-card>
            </ng-template>

          <cfm-card
            *ngIf="currentMembership"
            class="desktop-card"
            eyebrow="S4-001 · S4-002 · S4-003"
            title="Vue d’ensemble"
            description="Quelques repères utiles pour savoir quoi traiter aujourd’hui, sans reporting complexe ni jargon métier."
          >
            <div class="card-header-actions">
              <div class="chips">
                <cfm-status-chip
                  [label]="dashboardKpis.length + ' repère' + (dashboardKpis.length > 1 ? 's' : '')"
                  [tone]="dashboardKpis.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="dashboardActions.length > 0 ? dashboardActions.length + ' action' + (dashboardActions.length > 1 ? 's' : '') : 'Aucune action simple'"
                  [tone]="dashboardActions.length > 0 ? 'progress' : 'success'"
                />
                <cfm-status-chip
                  [label]="dashboardAlerts.length > 0 ? dashboardAlerts.length + ' priorité' + (dashboardAlerts.length > 1 ? 's' : '') : 'Aucune alerte simple'"
                  [tone]="dashboardAlerts.length > 0 ? 'progress' : 'success'"
                />
              </div>
            </div>

            <div class="dashboard-grid" *ngIf="dashboardKpis.length > 0; else emptyDashboard">
              <article class="dashboard-kpi-card" *ngFor="let kpi of dashboardKpis">
                <p class="meta">{{ kpi.label }}</p>
                <strong class="dashboard-kpi-value">{{ kpi.value }}</strong>
                <span>{{ kpi.detail }}</span>
                <cfm-status-chip [label]="kpi.statusLabel" [tone]="kpi.tone" />
              </article>
            </div>

            <ng-template #emptyDashboard>
              <cfm-empty-state
                title="Aucun module actif pour le moment"
                description="Activez Réglementation, Chantier ou Facturation pour faire apparaître une vue d’ensemble utile."
              />
            </ng-template>

            <section class="dashboard-alerts">
              <h3>Priorités du moment</h3>

              <ul class="alert-list" *ngIf="dashboardAlerts.length > 0; else emptyDashboardAlerts">
                <li *ngFor="let alert of dashboardAlerts">
                  <div class="dashboard-alert-copy">
                    <strong>{{ alert.title }}</strong>
                    <span>{{ alert.description }}</span>
                  </div>
                  <cfm-status-chip [label]="alert.moduleLabel" [tone]="alert.tone" />
                </li>
              </ul>

              <ng-template #emptyDashboardAlerts>
                <p class="small">Aucune priorité simple détectée pour le moment.</p>
              </ng-template>
            </section>

            <section class="dashboard-actions">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Actions à faire</h3>
                  <p class="small">
                    Une vue courte pour passer du constat à l’action, sans créer un gestionnaire de tâches.
                  </p>
                </div>

                <label class="field compact-field dashboard-filter">
                  <span>Module</span>
                  <select [(ngModel)]="selectedDashboardActionModule" name="selectedDashboardActionModule">
                    <option value="all">Tous les modules</option>
                    <option value="reglementation">Réglementation</option>
                    <option value="chantier">Chantier</option>
                    <option value="facturation">Facturation</option>
                  </select>
                </label>
              </div>

              <div class="chips">
                <cfm-status-chip
                  [label]="dashboardActionCountLabel"
                  [tone]="filteredDashboardActions.length > 0 ? 'progress' : 'success'"
                />
              </div>

              <ul class="alert-list" *ngIf="filteredDashboardActions.length > 0; else emptyDashboardActions">
                <li *ngFor="let action of filteredDashboardActions">
                  <div class="dashboard-alert-copy">
                    <strong>{{ action.title }}</strong>
                    <span>{{ action.description }}</span>
                    <span *ngIf="action.context">{{ action.context }}</span>
                  </div>

                  <div class="chips">
                    <cfm-status-chip
                      [label]="getDashboardActionPriorityLabel(action.priority)"
                      [tone]="getDashboardActionPriorityTone(action.priority)"
                    />
                    <cfm-status-chip
                      [label]="getDashboardActionModuleLabel(action.module)"
                      [tone]="getDashboardActionModuleTone(action.module)"
                    />
                  </div>
                </li>
              </ul>

              <ng-template #emptyDashboardActions>
                <p class="small">
                  {{
                    selectedDashboardActionModule === "all"
                      ? "Aucune action simple détectée pour le moment."
                      : "Aucune action simple pour ce module."
                  }}
                </p>
              </ng-template>
            </section>
          </cfm-card>

          <cfm-card
            *ngIf="currentMembership"
            class="desktop-card"
            eyebrow="S4-020 · S4-021 · S4-022"
            title="Lectures utiles"
            description="Trois angles simples pour relire l’activité sans ouvrir de vue analytique complexe : entreprise, chantier et client."
          >
            <section class="dashboard-actions">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Synthèse par module</h3>
                  <p class="small">
                    Chaque module ressort avec quelques repères utiles pour comprendre plus vite où regarder.
                  </p>
                </div>
              </div>

              <div class="dashboard-grid" *ngIf="dashboardEnterpriseOverviewCards.length > 0; else emptyEnterpriseOverview">
                <article class="dashboard-kpi-card" *ngFor="let card of dashboardEnterpriseOverviewCards">
                  <p class="meta">{{ card.label }}</p>
                  <strong>{{ card.headline }}</strong>
                  <span>{{ card.detail }}</span>
                  <ul class="dashboard-module-highlights" *ngIf="card.highlights.length > 0">
                    <li *ngFor="let highlight of card.highlights">
                      <span class="meta">{{ highlight.label }}</span>
                      <strong>{{ highlight.value }}</strong>
                    </li>
                  </ul>
                  <cfm-status-chip [label]="card.statusLabel" [tone]="card.tone" />
                </article>
              </div>

              <ng-template #emptyEnterpriseOverview>
                <p class="small">Aucun module actif pour construire une lecture synthétique pour le moment.</p>
              </ng-template>
            </section>

            <section class="dashboard-actions">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>À traiter</h3>
                  <p class="small">
                    Une lecture courte pour retrouver vite les chantiers et documents encore en préparation.
                  </p>
                </div>

                <cfm-status-chip
                  [label]="coordinationTodoCountLabel"
                  [tone]="coordinationTodoItems.length > 0 ? 'progress' : 'success'"
                />
              </div>

              <ng-container *ngIf="isChantierEnabled; else chantierCoordinationDisabled">
                <div class="inline-actions">
                  <label class="compact-field">
                    <span class="small">Suivi</span>
                    <select [(ngModel)]="selectedCoordinationStatusFilter" name="selectedCoordinationStatusFilter">
                      <option value="all">Tous les suivis</option>
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Fait</option>
                    </select>
                  </label>

                  <label class="compact-field">
                    <span class="small">Affectation</span>
                    <select [(ngModel)]="selectedCoordinationAssigneeFilter" name="selectedCoordinationAssigneeFilter">
                      <option value="all">Toutes les affectations</option>
                      <option value="unassigned">Non affecté</option>
                      <option *ngFor="let assignee of worksiteAssignees" [value]="assignee.user_id">
                        {{ getWorksiteAssigneeOptionLabel(assignee) }}
                      </option>
                    </select>
                  </label>

                  <cfm-button
                    *ngIf="hasActiveCoordinationFilters"
                    type="button"
                    variant="secondary"
                    (click)="resetCoordinationFilters()"
                  >
                    Réinitialiser les filtres
                  </cfm-button>
                </div>

                <p class="small">
                  Ces filtres s'appliquent aussi à la vue chantier et aux documents chantier plus bas.
                </p>

                <ul class="alert-list" *ngIf="coordinationTodoItems.length > 0; else emptyCoordinationTodo">
                  <li *ngFor="let item of coordinationTodoItems">
                    <div class="dashboard-alert-copy">
                      <strong>{{ item.title }}</strong>
                      <span>{{ item.description }}</span>
                      <span *ngIf="item.context">{{ item.context }}</span>
                    </div>

                    <div class="billing-item-actions">
                      <div class="chips">
                        <cfm-status-chip [label]="item.kindLabel" [tone]="item.kindTone" />
                        <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                      </div>

                      <cfm-button
                        type="button"
                        variant="secondary"
                        (click)="openCoordinationTodoItem(item)"
                      >
                        {{ item.kind === "worksite" ? "Voir le chantier" : "Voir le document" }}
                      </cfm-button>
                    </div>
                  </li>
                </ul>

                <ng-template #emptyCoordinationTodo>
                  <cfm-empty-state
                    [title]="hasActiveCoordinationFilters ? 'Aucun résultat pour ces filtres' : 'Rien à coordonner pour le moment'"
                    [description]="
                      hasActiveCoordinationFilters
                        ? 'Ajustez les filtres pour élargir la lecture chantier.'
                        : 'Les chantiers et documents à traiter apparaitront ici.'
                    "
                  />
                </ng-template>
              </ng-container>

              <ng-template #chantierCoordinationDisabled>
                <cfm-empty-state
                  title="Module Chantier non activé"
                  description="Activez le module Chantier pour afficher cette lecture de coordination."
                />
              </ng-template>
            </section>

            <section class="dashboard-actions" id="worksite-overview-section">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Vue par chantier</h3>
                  <p class="small">
                    Les chantiers ressortent avec leur statut général, leurs signaux simples et les documents déjà liés.
                  </p>
                </div>

                <cfm-status-chip
                  [label]="worksiteOverviewCountLabel"
                  [tone]="filteredDashboardWorksiteOverviewItems.length > 0 ? 'calm' : 'neutral'"
                />
              </div>

              <ng-container *ngIf="isChantierEnabled; else chantierOverviewDisabled">
                <ul class="alert-list" *ngIf="filteredDashboardWorksiteOverviewItems.length > 0; else emptyWorksiteOverview">
                  <li *ngFor="let item of filteredDashboardWorksiteOverviewItems">
                    <div class="dashboard-alert-copy">
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.summary }}</span>
                      <span>{{ item.operationalSummary }}</span>
                      <span>{{ item.taskSummary }}</span>
                      <span>
                        Coordination : {{ item.coordination.statusLabel }} · {{ item.coordination.assigneeLabel }}
                      </span>
                      <span *ngIf="item.coordination.commentText">{{ item.coordination.commentSummary }}</span>
                      <span *ngIf="item.coordination.updatedAtLabel">
                        Dernier suivi : {{ item.coordination.updatedAtLabel }}
                      </span>
                      <span>{{ item.linkedWorksiteDocumentsSummary }}</span>
                      <span>{{ item.linkedQuotesSummary }}</span>
                      <span>{{ item.linkedInvoicesSummary }}</span>
                      <span *ngIf="item.financialSummary">{{ item.financialSummary }}</span>
                      <span *ngIf="item.regulatorySummary">{{ item.regulatorySummary }}</span>
                    </div>

                    <div class="billing-item-actions">
                      <div class="chips">
                        <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                        <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
                      </div>

                      <cfm-button
                        *ngIf="canManageOrganization && isFacturationEnabled && billingCustomers.length > 0"
                        type="button"
                        variant="secondary"
                        (click)="prepareQuoteFromWorksite(item.id)"
                      >
                        Préparer un devis
                      </cfm-button>

                      <cfm-button
                        *ngIf="canManageOrganization && isFacturationEnabled && billingCustomers.length > 0"
                        type="button"
                        variant="secondary"
                        (click)="prepareInvoiceFromWorksite(item.id)"
                      >
                        Préparer une facture
                      </cfm-button>

                      <cfm-button
                        *ngIf="canReadOrganization"
                        type="button"
                        variant="secondary"
                        [disabled]="worksiteDocumentPdfBusyId === item.id"
                        (click)="exportWorksiteSummaryPdf(item.id)"
                      >
                        {{ worksiteDocumentPdfBusyId === item.id ? "Génération en cours" : "Fiche chantier PDF" }}
                      </cfm-button>

                      <cfm-button
                        *ngIf="canReadOrganization"
                        type="button"
                        variant="secondary"
                        [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        (click)="toggleWorksitePreventionPlanEditor(item.id)"
                      >
                        {{
                          worksitePreventionPlanEditingId === item.id
                            ? "Fermer le plan"
                            : "Ajuster le plan"
                        }}
                      </cfm-button>

                      <cfm-button
                        *ngIf="item.worksiteDocumentsCount > 0"
                        type="button"
                        variant="secondary"
                        (click)="focusWorksiteDocuments(item.id)"
                      >
                        Voir les documents
                      </cfm-button>

                      <cfm-button
                        *ngIf="canReadOrganization"
                        type="button"
                        variant="secondary"
                        (click)="toggleWorksiteCoordination(item.id)"
                      >
                        {{
                          selectedWorksiteCoordinationId === item.id
                            ? "Masquer la coordination"
                            : "Coordination simple"
                        }}
                      </cfm-button>
                    </div>

                    <ul class="stack-list" *ngIf="item.worksiteDocuments.length > 0">
                      <li *ngFor="let document of item.worksiteDocuments">
                        <div class="list-copy">
                          <strong>{{ document.title }}</strong>
                          <span>{{ document.fileName }}</span>
                          <span *ngIf="document.uploadedAtLabel">
                            Dernière génération : {{ document.uploadedAtLabel }}
                          </span>
                          <span *ngIf="document.linkedSignatureLabel">
                            Signature liée : {{ document.linkedSignatureLabel }}
                            <ng-container *ngIf="document.linkedSignatureDetail">
                              · {{ document.linkedSignatureDetail }}
                            </ng-container>
                          </span>
                          <span *ngIf="document.linkedProofsSummary">
                            Preuves liées : {{ document.linkedProofsSummary }}
                          </span>
                          <span>
                            Coordination : {{ document.coordination.statusLabel }} ·
                            {{ document.coordination.assigneeLabel }}
                          </span>
                          <span *ngIf="document.coordination.commentText">
                            {{ document.coordination.commentSummary }}
                          </span>
                        </div>

                        <div class="billing-item-actions">
                          <div class="chips">
                            <cfm-status-chip
                              [label]="document.lifecycleStatusLabel"
                              [tone]="document.lifecycleStatusTone"
                            />
                          </div>

                          <label class="compact-field" *ngIf="canManageOrganization">
                            <span class="small">Statut du document</span>
                            <select
                              [ngModel]="document.lifecycleStatus"
                              [name]="'worksiteDocumentLifecycle' + document.id"
                              [disabled]="worksiteDocumentStatusBusyId === document.id"
                              (ngModelChange)="changeWorksiteDocumentLifecycleStatus(document.id, $event)"
                            >
                              <option value="draft">Brouillon</option>
                              <option value="finalized">Finalisé</option>
                            </select>
                          </label>

                          <label
                            class="compact-field"
                            *ngIf="canManageOrganization && getWorksiteSignatureOptions(document.worksiteId).length > 0"
                          >
                            <span class="small">Signature liée</span>
                            <select
                              [ngModel]="document.linkedSignatureId ?? ''"
                              [name]="'worksiteDocumentSignature' + document.id"
                              [disabled]="worksiteDocumentSignatureBusyId === document.id"
                              (ngModelChange)="changeWorksiteDocumentSignature(document.id, $event)"
                            >
                              <option value="">Aucune signature liée</option>
                              <option
                                *ngFor="let signature of getWorksiteSignatureOptions(document.worksiteId)"
                                [value]="signature.id"
                              >
                                {{ getWorksiteSignatureOptionLabel(signature) }}
                              </option>
                            </select>
                          </label>

                          <span
                            class="small"
                            *ngIf="canManageOrganization && getWorksiteSignatureOptions(document.worksiteId).length === 0"
                          >
                            Aucune signature chantier disponible pour ce chantier.
                          </span>

                          <div
                            class="inline-choice-list compact-field"
                            *ngIf="canManageOrganization && getWorksiteProofOptions(document.worksiteId).length > 0"
                          >
                            <span class="small">Preuves liées</span>
                            <label
                              class="inline-choice"
                              *ngFor="let proof of getWorksiteProofOptions(document.worksiteId)"
                            >
                              <input
                                type="checkbox"
                                [ngModel]="isWorksiteProofLinked(document, proof.id)"
                                [ngModelOptions]="{ standalone: true }"
                                [disabled]="worksiteDocumentProofBusyId === document.id"
                                (ngModelChange)="toggleWorksiteDocumentProof(document.id, proof.id, $event)"
                              />
                              <span>{{ getWorksiteProofOptionLabel(proof) }}</span>
                            </label>
                          </div>

                          <span
                            class="small"
                            *ngIf="canManageOrganization && getWorksiteProofOptions(document.worksiteId).length === 0"
                          >
                            Aucune preuve chantier disponible pour ce chantier.
                          </span>
                        </div>
                      </li>
                    </ul>

                    <section class="document-linked-panel" *ngIf="selectedWorksiteCoordinationId === item.id">
                      <div class="detail-grid">
                        <div class="detail-block">
                          <span class="small">Suivi</span>
                          <strong>{{ item.coordination.statusLabel }}</strong>
                          <cfm-status-chip
                            [label]="item.coordination.statusLabel"
                            [tone]="item.coordination.statusTone"
                          />
                        </div>

                        <div class="detail-block">
                          <span class="small">Affectation</span>
                          <strong>{{ item.coordination.assigneeLabel }}</strong>
                          <span *ngIf="item.coordination.updatedAtLabel">
                            Dernière mise à jour : {{ item.coordination.updatedAtLabel }}
                          </span>
                        </div>
                      </div>

                      <div class="detail-block">
                        <span class="small">Commentaire simple</span>
                        <span>
                          {{ item.coordination.commentText || "Aucun commentaire simple pour le moment." }}
                        </span>
                      </div>

                      <div class="detail-grid" *ngIf="canManageOrganization">
                        <label class="field compact-field">
                          <span>Suivi</span>
                          <select
                            [ngModel]="getWorksiteCoordinationDraft(item.id).status"
                            [name]="'worksiteCoordinationStatus' + item.id"
                            [disabled]="worksiteCoordinationBusyId === item.id"
                            (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { status: $event })"
                          >
                            <option value="todo">À faire</option>
                            <option value="in_progress">En cours</option>
                            <option value="done">Fait</option>
                          </select>
                        </label>

                        <label
                          class="field compact-field"
                          *ngIf="worksiteAssignees.length > 0; else noWorksiteAssignees"
                        >
                          <span>Affectation</span>
                          <select
                            [ngModel]="getWorksiteCoordinationDraft(item.id).assigneeUserId"
                            [name]="'worksiteCoordinationAssignee' + item.id"
                            [disabled]="worksiteCoordinationBusyId === item.id"
                            (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { assigneeUserId: $event })"
                          >
                            <option value="">Non affecté</option>
                            <option
                              *ngFor="let assignee of worksiteAssignees"
                              [value]="assignee.user_id"
                            >
                              {{ getWorksiteAssigneeOptionLabel(assignee) }}
                            </option>
                          </select>
                        </label>

                        <ng-template #noWorksiteAssignees>
                          <div class="detail-block">
                            <span class="small">Affectation</span>
                            <span>Aucun membre lisible pour affecter ce chantier.</span>
                          </div>
                        </ng-template>
                      </div>

                      <label class="field field-wide" *ngIf="canManageOrganization">
                        <span>Commentaire simple</span>
                        <textarea
                          [ngModel]="getWorksiteCoordinationDraft(item.id).commentText"
                          [name]="'worksiteCoordinationComment' + item.id"
                          rows="3"
                          placeholder="Ex. appeler le client avant l'intervention"
                          [disabled]="worksiteCoordinationBusyId === item.id"
                          (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { commentText: $event })"
                        ></textarea>
                      </label>

                      <div class="inline-actions" *ngIf="canManageOrganization">
                        <cfm-button
                          type="button"
                          [disabled]="worksiteCoordinationBusyId === item.id"
                          (click)="saveWorksiteCoordination(item)"
                        >
                          {{
                            worksiteCoordinationBusyId === item.id
                              ? "Enregistrement en cours"
                              : "Enregistrer"
                          }}
                        </cfm-button>
                      </div>
                    </section>

                    <form
                      class="document-adjustment-form"
                      *ngIf="worksitePreventionPlanEditingId === item.id"
                      (ngSubmit)="exportAdjustedWorksitePreventionPlanPdf(item.id)"
                    >
                      <p class="small field-wide">
                        Ajustez seulement ce qui est utile avant export. Le document reste prérempli et ne crée pas
                        de workflow supplémentaire.
                      </p>

                      <cfm-input
                        [(ngModel)]="worksitePreventionPlanForm.usefulDate"
                        [name]="'worksitePreventionDate' + item.id"
                        type="datetime-local"
                        label="Date utile"
                        [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                      />

                      <cfm-input
                        [(ngModel)]="worksitePreventionPlanForm.additionalContact"
                        [name]="'worksitePreventionContact' + item.id"
                        type="text"
                        label="Contact utile complémentaire"
                        placeholder="Ex. chef de site, standard, accueil"
                        [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                      />

                      <label class="field field-wide">
                        <span>Contexte d’intervention</span>
                        <textarea
                          [(ngModel)]="worksitePreventionPlanForm.interventionContext"
                          [name]="'worksitePreventionContext' + item.id"
                          rows="4"
                          placeholder="Contexte simple de l’intervention"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        ></textarea>
                      </label>

                      <label class="field field-wide">
                        <span>Points de vigilance</span>
                        <textarea
                          [(ngModel)]="worksitePreventionPlanForm.vigilancePoints"
                          [name]="'worksitePreventionVigilance' + item.id"
                          rows="5"
                          placeholder="Un point par ligne"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        ></textarea>
                      </label>

                      <label class="field field-wide">
                        <span>Mesures / consignes</span>
                        <textarea
                          [(ngModel)]="worksitePreventionPlanForm.measurePoints"
                          [name]="'worksitePreventionMeasures' + item.id"
                          rows="5"
                          placeholder="Une consigne par ligne"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        ></textarea>
                      </label>

                      <section class="document-preview field-wide" *ngIf="activeWorksitePreventionPlanPreview as preview">
                        <div class="document-preview-header">
                          <strong>Aperçu texte avant téléchargement</strong>
                          <p class="small">Relisez ici les éléments essentiels repris dans le PDF final.</p>
                        </div>

                        <div class="detail-grid">
                          <div class="detail-block">
                            <span class="small">Entreprise</span>
                            <strong>{{ preview.companyName }}</strong>
                          </div>

                          <div class="detail-block">
                            <span class="small">Date utile</span>
                            <strong>{{ preview.usefulDateLabel || "À préciser avant export" }}</strong>
                          </div>

                          <div class="detail-block">
                            <span class="small">Chantier</span>
                            <strong>{{ preview.worksiteName }}</strong>
                            <span>{{ preview.worksiteAddress }}</span>
                          </div>

                          <div class="detail-block">
                            <span class="small">Client / donneur d'ordre</span>
                            <strong>{{ preview.clientName || "À confirmer" }}</strong>
                            <span *ngIf="preview.additionalContact">
                              Contact utile complémentaire : {{ preview.additionalContact }}
                            </span>
                          </div>
                        </div>

                        <div class="detail-block">
                          <span class="small">Contexte d’intervention</span>
                          <span>{{ preview.interventionContext }}</span>
                        </div>

                        <div class="detail-grid">
                          <div class="detail-block">
                            <span class="small">Points de vigilance</span>
                            <ul class="detail-list" *ngIf="preview.vigilancePoints.length > 0; else noVigilancePreview">
                              <li *ngFor="let point of preview.vigilancePoints">{{ point }}</li>
                            </ul>
                            <ng-template #noVigilancePreview>
                              <span>Aucun point de vigilance saisi.</span>
                            </ng-template>
                          </div>

                          <div class="detail-block">
                            <span class="small">Mesures / consignes</span>
                            <ul class="detail-list" *ngIf="preview.measurePoints.length > 0; else noMeasuresPreview">
                              <li *ngFor="let point of preview.measurePoints">{{ point }}</li>
                            </ul>
                            <ng-template #noMeasuresPreview>
                              <span>Aucune mesure saisie.</span>
                            </ng-template>
                          </div>
                        </div>
                      </section>

                      <div class="form-actions inline-actions field-wide">
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id || !canResetWorksitePreventionPlanToInitial"
                          (click)="restoreInitialWorksitePreventionPlanForm()"
                        >
                          Revenir au préremplissage initial
                        </cfm-button>

                        <cfm-button
                          type="submit"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                        >
                          {{
                            worksitePreventionPlanPdfBusyId === item.id
                              ? "Génération en cours"
                              : "Exporter le PDF"
                          }}
                        </cfm-button>

                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                          (click)="cancelWorksitePreventionPlanEditing()"
                        >
                          Annuler
                        </cfm-button>
                      </div>
                    </form>
                  </li>
                </ul>

                <ng-template #emptyWorksiteOverview>
                  <cfm-empty-state
                    [title]="hasActiveCoordinationFilters ? 'Aucun chantier pour ces filtres' : 'Aucun chantier à afficher'"
                    [description]="
                      hasActiveCoordinationFilters
                        ? 'Changez les filtres de coordination pour retrouver un chantier.'
                        : 'Les repères chantier apparaitront ici dès qu’ils seront disponibles.'
                    "
                  />
                </ng-template>
              </ng-container>

              <ng-template #chantierOverviewDisabled>
                <cfm-empty-state
                  title="Module Chantier non activé"
                  description="Activez le module Chantier pour afficher cette vue synthétique."
                />
              </ng-template>
            </section>

            <section class="dashboard-actions" id="worksite-documents-section">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Documents chantier</h3>
                  <p class="small">
                    Retrouvez rapidement les documents déjà générés pour un chantier, sans navigation documentaire
                    plus lourde.
                  </p>
                </div>

                <cfm-status-chip
                  [label]="worksiteDocumentCountLabel"
                  [tone]="filteredWorksiteDocumentItems.length > 0 ? 'calm' : 'neutral'"
                />
              </div>

              <ng-container *ngIf="isChantierEnabled; else chantierDocumentsDisabled">
                <div class="inline-actions">
                  <label class="compact-field" *ngIf="worksiteDocumentFilterOptions.length > 1">
                    <span class="small">Chantier</span>
                    <select [(ngModel)]="selectedWorksiteDocumentFilterId" name="worksiteDocumentFilterId">
                      <option value="all">Tous les chantiers</option>
                      <option *ngFor="let worksite of worksiteDocumentFilterOptions" [value]="worksite.id">
                        {{ worksite.name }}
                      </option>
                    </select>
                  </label>

                  <label class="compact-field" *ngIf="worksiteDocumentTypeFilterOptions.length > 1">
                    <span class="small">Type</span>
                    <select [(ngModel)]="selectedWorksiteDocumentTypeFilter" name="worksiteDocumentTypeFilter">
                      <option value="all">Tous les types</option>
                      <option *ngFor="let option of worksiteDocumentTypeFilterOptions" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <label class="compact-field">
                    <span class="small">Statut</span>
                    <select
                      [(ngModel)]="selectedWorksiteDocumentLifecycleFilter"
                      name="worksiteDocumentLifecycleFilter"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="draft">Brouillon</option>
                      <option value="finalized">Finalisé</option>
                    </select>
                  </label>

                  <label class="compact-field">
                    <span class="small">Suivi</span>
                    <select [(ngModel)]="selectedCoordinationStatusFilter" name="selectedCoordinationStatusFilterDocuments">
                      <option value="all">Tous les suivis</option>
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Fait</option>
                    </select>
                  </label>

                  <label class="compact-field">
                    <span class="small">Affectation</span>
                    <select [(ngModel)]="selectedCoordinationAssigneeFilter" name="selectedCoordinationAssigneeFilterDocuments">
                      <option value="all">Toutes les affectations</option>
                      <option value="unassigned">Non affecté</option>
                      <option *ngFor="let assignee of worksiteAssignees" [value]="assignee.user_id">
                        {{ getWorksiteAssigneeOptionLabel(assignee) }}
                      </option>
                    </select>
                  </label>

                  <cfm-button
                    *ngIf="hasActiveWorksiteDocumentFilters"
                    type="button"
                    variant="secondary"
                    (click)="resetWorksiteDocumentFilters()"
                  >
                    Réinitialiser les filtres
                  </cfm-button>
                </div>

                <ul class="stack-list" *ngIf="filteredWorksiteDocumentItems.length > 0; else emptyWorksiteDocuments">
                  <li *ngFor="let document of filteredWorksiteDocumentItems">
                    <div class="list-copy">
                      <strong>{{ document.title }}</strong>
                      <span>{{ document.worksiteName }} · {{ document.fileName }}</span>
                      <span>
                        Type : {{ document.typeLabel }} · Préparation : {{ document.lifecycleStatusLabel }} ·
                        {{ document.signatureStatusLabel }} · {{ document.proofCountLabel }}
                      </span>
                      <span>
                        Fichier : {{ document.fileAvailabilityLabel }}
                        <ng-container *ngIf="document.fileSizeLabel">
                          · {{ document.fileSizeLabel }}
                        </ng-container>
                      </span>
                      <span>
                        Coordination : {{ document.coordination.statusLabel }} ·
                        {{ document.coordination.assigneeLabel }}
                      </span>
                      <span *ngIf="document.coordination.commentText">{{ document.coordination.commentSummary }}</span>
                      <span *ngIf="document.uploadedAtLabel">
                        Dernière génération : {{ document.uploadedAtLabel }}
                      </span>
                      <span *ngIf="document.linkedSignatureLabel">
                        Signature liée : {{ document.linkedSignatureLabel }}
                        <ng-container *ngIf="document.linkedSignatureDetail">
                          · {{ document.linkedSignatureDetail }}
                        </ng-container>
                      </span>
                      <span *ngIf="document.linkedProofsSummary">
                        Preuves liées : {{ document.linkedProofsSummary }}
                      </span>
                      <span *ngIf="document.notes">{{ document.notes }}</span>
                    </div>

                    <div class="billing-item-actions">
                      <div class="chips">
                        <cfm-status-chip
                          [label]="document.lifecycleStatusLabel"
                          [tone]="document.lifecycleStatusTone"
                        />
                        <cfm-status-chip
                          [label]="document.technicalStatusLabel"
                          [tone]="document.technicalStatusTone"
                        />
                        <cfm-status-chip
                          [label]="document.fileAvailabilityLabel"
                          [tone]="document.fileAvailabilityTone"
                        />
                      </div>

                      <cfm-button
                        *ngIf="canReadOrganization"
                        type="button"
                        variant="secondary"
                        [disabled]="isWorksiteDocumentDownloadBusy(document)"
                        (click)="downloadWorksiteDocument(document)"
                      >
                        {{
                          isWorksiteDocumentDownloadBusy(document)
                            ? "Téléchargement en cours"
                            : getWorksiteDocumentActionLabel(document)
                        }}
                      </cfm-button>

                      <cfm-button
                        *ngIf="canAdjustWorksiteDocument(document)"
                        type="button"
                        variant="secondary"
                        [disabled]="worksitePreventionPlanPdfBusyId === document.worksiteId"
                        (click)="toggleWorksitePreventionPlanEditor(document.worksiteId)"
                      >
                        {{
                          worksitePreventionPlanEditingId === document.worksiteId
                            ? "Fermer l'ajustement"
                            : "Ajuster le plan"
                        }}
                      </cfm-button>

                      <cfm-button
                        type="button"
                        variant="secondary"
                        (click)="toggleWorksiteDocumentDetails(document.id)"
                      >
                        {{
                          selectedWorksiteDocumentDetailId === document.id
                            ? "Masquer les éléments liés"
                            : "Voir les éléments liés"
                        }}
                      </cfm-button>
                    </div>

                    <section
                      class="document-linked-panel"
                      *ngIf="selectedWorksiteDocumentDetailId === document.id"
                    >
                      <div class="detail-grid">
                        <div class="detail-block">
                          <span class="small">Suivi</span>
                          <strong>{{ document.coordination.statusLabel }}</strong>
                          <cfm-status-chip
                            [label]="document.coordination.statusLabel"
                            [tone]="document.coordination.statusTone"
                          />
                        </div>

                        <div class="detail-block">
                          <span class="small">Affectation</span>
                          <strong>{{ document.coordination.assigneeLabel }}</strong>
                          <span *ngIf="document.coordination.updatedAtLabel">
                            Dernière mise à jour : {{ document.coordination.updatedAtLabel }}
                          </span>
                        </div>
                      </div>

                      <div class="detail-block">
                        <span class="small">Commentaire simple</span>
                        <span>
                          {{ document.coordination.commentText || "Aucun commentaire simple pour le moment." }}
                        </span>
                      </div>

                      <div class="detail-grid" *ngIf="canManageOrganization">
                        <label class="field compact-field">
                          <span>Suivi</span>
                          <select
                            [ngModel]="getWorksiteDocumentCoordinationDraft(document.id).status"
                            [name]="'worksiteDocumentCoordinationStatus' + document.id"
                            [disabled]="worksiteDocumentCoordinationBusyId === document.id"
                            (ngModelChange)="updateWorksiteDocumentCoordinationDraft(document.id, { status: $event })"
                          >
                            <option value="todo">À faire</option>
                            <option value="in_progress">En cours</option>
                            <option value="done">Fait</option>
                          </select>
                        </label>

                        <label
                          class="field compact-field"
                          *ngIf="worksiteAssignees.length > 0; else noDocumentAssignees"
                        >
                          <span>Affectation</span>
                          <select
                            [ngModel]="getWorksiteDocumentCoordinationDraft(document.id).assigneeUserId"
                            [name]="'worksiteDocumentCoordinationAssignee' + document.id"
                            [disabled]="worksiteDocumentCoordinationBusyId === document.id"
                            (ngModelChange)="updateWorksiteDocumentCoordinationDraft(document.id, { assigneeUserId: $event })"
                          >
                            <option value="">Non affecté</option>
                            <option
                              *ngFor="let assignee of worksiteAssignees"
                              [value]="assignee.user_id"
                            >
                              {{ getWorksiteAssigneeOptionLabel(assignee) }}
                            </option>
                          </select>
                        </label>

                        <ng-template #noDocumentAssignees>
                          <div class="detail-block">
                            <span class="small">Affectation</span>
                            <span>Aucun membre lisible pour affecter ce document.</span>
                          </div>
                        </ng-template>
                      </div>

                      <label class="field field-wide" *ngIf="canManageOrganization">
                        <span>Commentaire simple</span>
                        <textarea
                          [ngModel]="getWorksiteDocumentCoordinationDraft(document.id).commentText"
                          [name]="'worksiteDocumentCoordinationComment' + document.id"
                          rows="3"
                          placeholder="Ex. relire avant envoi au client"
                          [disabled]="worksiteDocumentCoordinationBusyId === document.id"
                          (ngModelChange)="updateWorksiteDocumentCoordinationDraft(document.id, { commentText: $event })"
                        ></textarea>
                      </label>

                      <div class="inline-actions" *ngIf="canManageOrganization">
                        <cfm-button
                          type="button"
                          [disabled]="worksiteDocumentCoordinationBusyId === document.id"
                          (click)="saveWorksiteDocumentCoordination(document)"
                        >
                          {{
                            worksiteDocumentCoordinationBusyId === document.id
                              ? "Enregistrement en cours"
                              : "Enregistrer"
                          }}
                        </cfm-button>
                      </div>

                      <div class="detail-block" *ngIf="document.linkedSignature as signature; else noLinkedSignature">
                        <span class="small">Signature liée</span>
                        <strong>{{ signature.label }}</strong>
                        <span *ngIf="signature.detail">{{ signature.detail }}</span>
                        <cfm-status-chip [label]="signature.statusLabel" [tone]="signature.statusTone" />
                      </div>

                      <ng-template #noLinkedSignature>
                        <div class="detail-block">
                          <span class="small">Signature liée</span>
                          <span>Aucune signature liée.</span>
                        </div>
                      </ng-template>

                      <div class="detail-block">
                        <span class="small">Preuves liées</span>
                        <ul class="detail-list" *ngIf="document.linkedProofs.length > 0; else noLinkedProofs">
                          <li *ngFor="let proof of document.linkedProofs">
                            <strong>{{ proof.label }}</strong>
                            <span *ngIf="proof.detail">{{ proof.detail }}</span>
                            <cfm-status-chip [label]="proof.statusLabel" [tone]="proof.statusTone" />
                          </li>
                        </ul>
                        <ng-template #noLinkedProofs>
                          <span>Aucune preuve liée.</span>
                        </ng-template>
                      </div>
                    </section>
                  </li>
                </ul>

                <ng-template #emptyWorksiteDocuments>
                  <cfm-empty-state
                    title="Aucun document pour ce filtre"
                    description="Ajustez les filtres ou générez un document chantier pour le retrouver ici."
                  />
                </ng-template>
              </ng-container>

              <ng-template #chantierDocumentsDisabled>
                <cfm-empty-state
                  title="Module Chantier non activé"
                  description="Activez le module Chantier pour consulter les documents liés aux chantiers."
                />
              </ng-template>
            </section>

            <section class="dashboard-actions">
              <div class="dashboard-actions-header">
                <div class="dashboard-action-copy">
                  <h3>Vue par client</h3>
                  <p class="small">
                    Une lecture commerciale simple pour savoir quels clients demandent un suivi immédiat.
                  </p>
                </div>

                <cfm-status-chip
                  [label]="dashboardCustomerOverviewItems.length + ' client' + (dashboardCustomerOverviewItems.length > 1 ? 's' : '')"
                  [tone]="dashboardCustomerOverviewItems.length > 0 ? 'calm' : 'neutral'"
                />
              </div>

              <ng-container *ngIf="isFacturationEnabled; else customerOverviewDisabled">
                <ul class="alert-list" *ngIf="dashboardCustomerOverviewItems.length > 0; else emptyCustomerOverview">
                  <li *ngFor="let item of dashboardCustomerOverviewItems">
                    <div class="dashboard-alert-copy">
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.summary }}</span>
                      <span>{{ item.context }}</span>
                    </div>

                    <div class="billing-item-actions">
                      <div class="chips">
                        <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                        <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
                      </div>

                      <cfm-button
                        *ngIf="canManageOrganization && billingCustomers.length > 0"
                        type="button"
                        variant="secondary"
                        (click)="prepareQuoteFromCustomer(item.id)"
                      >
                        Préparer un devis
                      </cfm-button>

                      <cfm-button
                        *ngIf="canManageOrganization && billingCustomers.length > 0"
                        type="button"
                        variant="secondary"
                        (click)="prepareInvoiceFromCustomer(item.id)"
                      >
                        Préparer une facture
                      </cfm-button>
                    </div>
                  </li>
                </ul>

                <ng-template #emptyCustomerOverview>
                  <cfm-empty-state
                    title="Aucun client à suivre"
                    description="Les clients demandant un suivi apparaitront ici dès qu’un repère remonte."
                  />
                </ng-template>
              </ng-container>

              <ng-template #customerOverviewDisabled>
                <cfm-empty-state
                  title="Module Facturation non activé"
                  description="Activez le module Facturation pour afficher cette lecture client."
                />
              </ng-template>
            </section>
          </cfm-card>

          <ng-container *ngIf="currentMembership" [ngTemplateOutlet]="homeAdministrationCardTemplate"></ng-container>

          <cfm-card
            *ngIf="currentMembership"
            class="desktop-card"
            eyebrow="S7-021"
            title="Donner un retour"
            description="Un format court pour remonter un blocage, une incompréhension ou une amélioration sans outil de support dédié."
          >
            <form class="feedback-capture-form" (ngSubmit)="copyBetaFeedback()">
              <div class="inline-actions">
                <label class="field compact-field">
                  <span>Type de retour</span>
                  <select [(ngModel)]="betaFeedbackCategory" name="betaFeedbackCategory">
                    <option value="blocking">Bloquant</option>
                    <option value="unclear">Incompréhension</option>
                    <option value="improvement">Amélioration</option>
                    <option value="positive">Retour positif</option>
                  </select>
                </label>

                <label class="field compact-field">
                  <span>Zone concernée</span>
                  <select [(ngModel)]="betaFeedbackArea" name="betaFeedbackArea">
                    <option value="cockpit">Cockpit</option>
                    <option value="worksite">Chantier</option>
                    <option value="worksite_document">Documents chantier</option>
                    <option value="facturation">Facturation</option>
                    <option value="reglementation">Réglementation</option>
                    <option value="sync">Synchronisation visible</option>
                    <option value="other">Autre</option>
                  </select>
                </label>
              </div>

              <label class="field field-wide">
                <span>Message libre court</span>
                <textarea
                  [(ngModel)]="betaFeedbackMessageText"
                  name="betaFeedbackMessageText"
                  rows="4"
                  placeholder="Ex. Je ne comprends pas si le document chantier est prêt ou encore en préparation."
                ></textarea>
              </label>

              <p class="small">
                Le retour est préparé dans un format simple à coller ensuite dans votre canal beta ou pilote
                habituel.
              </p>

              <div class="form-actions inline-actions">
                <cfm-button type="submit" [disabled]="betaFeedbackCopyBusy || !canCopyBetaFeedback">
                  {{ betaFeedbackCopyBusy ? "Copie en cours" : "Copier le retour" }}
                </cfm-button>

                <cfm-button
                  type="button"
                  variant="secondary"
                  [disabled]="betaFeedbackCopyBusy || !hasBetaFeedbackDraft"
                  (click)="resetBetaFeedback()"
                >
                  Effacer
                </cfm-button>
              </div>
            </form>

            <p class="feedback error" *ngIf="betaFeedbackError">{{ betaFeedbackError }}</p>
            <p class="feedback success" *ngIf="betaFeedbackNotice && !betaFeedbackError">{{ betaFeedbackNotice }}</p>

            <section class="document-preview" *ngIf="hasBetaFeedbackDraft">
              <div class="document-preview-header">
                <strong>Aperçu du retour</strong>
                <span class="small">La date et l’organisation seront ajoutées lors de la copie.</span>
              </div>
              <pre class="feedback-preview-text">{{ betaFeedbackPreviewText }}</pre>
            </section>
          </cfm-card>
          </ng-template>

          <ng-template #reglementationPageTemplate>
          <cfm-card
            *ngIf="shouldShowInitialWorkspaceLoading"
            class="desktop-card"
            eyebrow="Réglementation"
            title="Chargement en cours"
            description="Le profil entreprise et les sites sont en train d’être chargés."
          >
            <div class="loading-state-card">
              <div class="loading-state-skeleton" aria-hidden="true">
                <div class="loading-state-hero"></div>
                <div class="loading-state-grid">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="loading-state-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="loading-state-copy">
                <p class="loading-state-label">Mise à jour en cours</p>
                <p class="small">Les données réglementaires restent en préparation.</p>
              </div>
            </div>
          </cfm-card>

          <cfm-card
            *ngIf="shouldShowWorkspaceContent && currentMembership && !isReglementationEnabled"
            class="desktop-card"
            eyebrow="Réglementation"
            title="Module non activé"
            description="Activez le module Réglementation pour initialiser l’entreprise et déclarer ses premiers sites."
          >
            <cfm-empty-state
              title="Rien d’autre à remplir pour le moment"
              description="Le parcours d’onboarding entreprise apparaitra ici dès que le module sera activé."
            />
          </cfm-card>

          <ng-container *ngIf="shouldShowWorkspaceContent && currentMembership && isReglementationEnabled">
            <cfm-desktop-regulation-showcase
              [summary]="regulatoryShowcaseSummary"
              [topPriority]="topRegulatoryPriority"
              [priorityItems]="regulatoryPriorityItems"
              [familyCards]="regulatoryFamilyCards"
              [recommendedActions]="regulatoryRecommendedActions"
              [recommendedActionsSummary]="regulatoryRecommendedActionsSummary"
              [evidenceItems]="regulatoryEvidenceShowcaseItems"
              [proofSupportSummary]="regulatoryProofSupportSummary"
              [score]="regulatoryComplianceScore"
              [scoreDrivers]="regulatoryScoreDrivers"
              [obligationCountLabel]="getObligationCountLabel()"
              [evidenceAvailableCount]="regulatoryEvidenceAvailableCount"
              [evidenceCoverageCount]="regulatoryEvidenceCoverageCount"
              [overduePriorityCount]="overdueRegulatoryObligationCount + globalBuildingSafetyOverdueCount"
              [obligationsToVerifyCount]="regulatoryObligationsToVerifyCount"
              [hasObligations]="regulatoryObligations.length > 0"
              [canReadOrganization]="canReadOrganization"
              [exportLoading]="regulatoryExporting"
              [actionBusy]="boundRegulatoryShowcaseActionBusy"
              [actionLabel]="boundRegulatoryShowcaseActionLabel"
              (actionTriggered)="runRegulatoryShowcaseAction($event)"
              (exportTriggered)="exportRegulatoryPdf()"
            />

            <section class="regulatory-foundation-grid">
              <div class="regulatory-foundation-column" *ngIf="isOnboardingPending || organizationProfile">

                <cfm-card
                  *ngIf="isOnboardingPending"
                  class="desktop-card"
                  eyebrow="S2-001"
                  title="Onboarding entreprise"
                  description="Quelques informations essentielles pour démarrer sans jargon réglementaire ni formulaire intimidant."
                >
                  <div class="chips">
                    <cfm-status-chip label="Étape 1 sur 2" tone="progress" />
                    <cfm-status-chip label="Essentiel uniquement" tone="calm" />
                  </div>

                  <form class="profile-form" (ngSubmit)="completeOnboarding()">
                    <cfm-input
                      [(ngModel)]="profileForm.name"
                      name="onboardingName"
                      type="text"
                      label="Nom de l’entreprise"
                      placeholder="Ex. Conforméo Services"
                      required
                    />

                    <cfm-input
                      [(ngModel)]="profileForm.activityLabel"
                      name="onboardingActivity"
                      type="text"
                      label="Activité principale"
                      placeholder="Ex. maintenance multitechnique"
                      required
                    />

                    <label class="field">
                      <span>Présence de salariés</span>
                      <select [(ngModel)]="profileForm.hasEmployees" name="onboardingHasEmployees" required>
                        <option value="">Choisir</option>
                        <option value="yes">Oui</option>
                        <option value="no">Non</option>
                      </select>
                    </label>

                    <cfm-input
                      [(ngModel)]="profileForm.employeeCount"
                      name="onboardingEmployeeCount"
                      type="number"
                      label="Effectif"
                      placeholder="Ex. 12"
                    />

                    <cfm-input
                      [(ngModel)]="profileForm.contactEmail"
                      name="onboardingContactEmail"
                      type="email"
                      label="Email de contact"
                      placeholder="contact@entreprise.fr"
                      required
                    />

                    <div class="form-actions">
                      <cfm-button type="submit" [disabled]="organizationProfileSaving || !canSubmitOnboarding">
                        {{ organizationProfileSaving ? "Initialisation en cours" : "Initialiser l’entreprise" }}
                      </cfm-button>
                    </div>
                  </form>
                </cfm-card>

                <cfm-card
                  id="reg-profile-section"
                  class="desktop-card"
                  eyebrow="S2-002"
                  title="Profil entreprise"
                  description="Un profil clair et exploitable, avec seulement les informations utiles au périmètre réglementaire V1."
                >
                  <div class="chips" *ngIf="organizationProfile">
                    <cfm-status-chip
                      [label]="isOnboardingPending ? 'Onboarding à finaliser' : 'Profil initialisé'"
                      [tone]="isOnboardingPending ? 'progress' : 'success'"
                    />
                    <cfm-status-chip
                      [label]="organizationProfile.has_employees === true ? 'Avec salariés' : organizationProfile.has_employees === false ? 'Sans salariés' : 'Salariés à préciser'"
                      [tone]="organizationProfile.has_employees === true ? 'success' : organizationProfile.has_employees === false ? 'calm' : 'warning'"
                    />
                  </div>

              <form class="profile-form" (ngSubmit)="saveProfile()" *ngIf="organizationProfile">
                <cfm-input
                  [(ngModel)]="profileForm.name"
                  name="profileName"
                  type="text"
                  label="Nom de l’entreprise"
                  placeholder="Nom affiché dans la plateforme"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="profileForm.legalName"
                  name="profileLegalName"
                  type="text"
                  label="Raison sociale"
                  placeholder="Ex. Conforméo SAS"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <cfm-input
                  [(ngModel)]="profileForm.activityLabel"
                  name="profileActivity"
                  type="text"
                  label="Activité"
                  placeholder="Ex. maintenance, exploitation, travaux"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <cfm-input
                  [(ngModel)]="profileForm.employeeCount"
                  name="profileEmployeeCount"
                  type="number"
                  label="Effectif"
                  placeholder="Ex. 12"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <label class="field">
                  <span>Présence de salariés</span>
                  <select
                    [(ngModel)]="profileForm.hasEmployees"
                    name="profileHasEmployees"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  >
                    <option value="">À préciser</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="profileForm.contactEmail"
                  name="profileContactEmail"
                  type="email"
                  label="Email de contact"
                  placeholder="contact@entreprise.fr"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <cfm-input
                  [(ngModel)]="profileForm.contactPhone"
                  name="profileContactPhone"
                  type="tel"
                  label="Téléphone"
                  placeholder="Ex. 04 78 00 00 00"
                  [disabled]="!canManageOrganization || organizationProfileSaving"
                />

                <label class="field field-wide">
                  <span>Adresse principale</span>
                  <textarea
                    [(ngModel)]="profileForm.headquartersAddress"
                    name="profileHeadquartersAddress"
                    rows="3"
                    placeholder="Adresse utile pour le périmètre réglementaire"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  ></textarea>
                </label>

                <label class="field field-wide">
                  <span>Informations utiles</span>
                  <textarea
                    [(ngModel)]="profileForm.notes"
                    name="profileNotes"
                    rows="4"
                    placeholder="Précisions utiles pour la suite du périmètre réglementaire"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  ></textarea>
                </label>

                <div class="form-actions">
                  <cfm-button type="submit" [disabled]="!canManageOrganization || organizationProfileSaving">
                    {{ organizationProfileSaving ? "Enregistrement en cours" : "Enregistrer le profil" }}
                  </cfm-button>
                </div>
                  </form>
                </cfm-card>

                <cfm-card
                  *ngIf="organizationProfile && !isOnboardingPending"
                  id="reg-profile-questionnaire-section"
                  class="desktop-card"
                  eyebrow="S2-005"
                  title="Questionnaire réglementaire court"
                  description="Trois questions courtes pour affiner le profil réglementaire sans vous demander d'expertise juridique."
                >
                  <div class="chips">
                    <cfm-status-chip label="3 questions utiles" tone="calm" />
                    <cfm-status-chip
                      [label]="isQualificationQuestionnaireComplete ? 'Questionnaire complété' : 'Questionnaire à compléter'"
                      [tone]="isQualificationQuestionnaireComplete ? 'success' : 'progress'"
                    />
                  </div>

              <p class="small">
                Ces réponses améliorent la lecture du périmètre réglementaire. Si vous laissez un point à préciser,
                le moteur reste volontairement prudent.
              </p>

              <form class="profile-form" (ngSubmit)="saveQualificationQuestionnaire()">
                <label class="field">
                  <span>Recevez-vous du public ou des clients sur au moins un site ?</span>
                  <select
                    [(ngModel)]="profileForm.receivesPublic"
                    name="qualificationReceivesPublic"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  >
                    <option value="">À préciser</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <label class="field">
                  <span>Stockez-vous des produits ou matériels sensibles sur site ?</span>
                  <select
                    [(ngModel)]="profileForm.storesHazardousProducts"
                    name="qualificationStoresHazardousProducts"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  >
                    <option value="">À préciser</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <label class="field">
                  <span>Réalisez-vous des interventions terrain à risque ?</span>
                  <select
                    [(ngModel)]="profileForm.performsHighRiskWork"
                    name="qualificationPerformsHighRiskWork"
                    [disabled]="!canManageOrganization || organizationProfileSaving"
                  >
                    <option value="">À préciser</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </label>

                <div class="form-actions">
                  <cfm-button type="submit" [disabled]="!canManageOrganization || organizationProfileSaving">
                    {{ organizationProfileSaving ? "Enregistrement en cours" : "Enregistrer le questionnaire" }}
                  </cfm-button>
                </div>
                  </form>
                </cfm-card>
              </div>

              <div class="regulatory-foundation-column regulatory-foundation-column--sites">
                <cfm-card
                  id="reg-sites-section"
                  class="desktop-card"
                  eyebrow="S2-003"
                  title="Sites et localisation"
                  description="Des sites clairs, enrichis et exploitables pour fiabiliser la lecture réglementaire par adresse ou bâtiment."
                >
              <form class="site-form" (ngSubmit)="createSite()">
                <cfm-input
                  [(ngModel)]="siteForm.name"
                  name="siteName"
                  type="text"
                  label="Nom du site ou bâtiment"
                  placeholder="Ex. Siège Lyon Carnot"
                  [disabled]="!canManageOrganization || organizationSiteSaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="siteForm.address"
                  name="siteAddress"
                  type="text"
                  label="Adresse"
                  placeholder="Ex. 12 rue Carnot, 69002 Lyon"
                  [disabled]="!canManageOrganization || organizationSiteSaving"
                  required
                />

                <label class="field">
                  <span>Type</span>
                  <select
                    [(ngModel)]="siteForm.siteType"
                    name="siteType"
                    [disabled]="!canManageOrganization || organizationSiteSaving"
                  >
                    <option value="site">Site</option>
                    <option value="building">Bâtiment</option>
                    <option value="office">Bureau</option>
                    <option value="warehouse">Entrepôt</option>
                  </select>
                </label>

                <div class="form-actions">
                  <cfm-button type="submit" [disabled]="!canManageOrganization || organizationSiteSaving || !canCreateSite">
                    {{ organizationSiteSaving ? "Création en cours" : "Ajouter le site" }}
                  </cfm-button>
                </div>
              </form>

              <ul class="site-list" *ngIf="regulatoryAllSites.length > 0; else emptySites">
                <li *ngFor="let site of regulatoryAllSites">
                  <ng-container *ngIf="site.declaredSite as declaredSite; else inferredRegulatorySite">
                    <div class="site-copy">
                      <div class="site-heading">
                        <strong>{{ declaredSite.name }}</strong>
                        <div class="chips">
                          <cfm-status-chip [label]="getSiteTypeLabel(declaredSite.site_type)" tone="calm" />
                          <cfm-status-chip
                            [label]="declaredSite.status === 'active' ? 'Actif' : 'Archivé'"
                            [tone]="declaredSite.status === 'active' ? 'success' : 'neutral'"
                          />
                        </div>
                      </div>
                      <span>{{ declaredSite.address }}</span>

                      <div class="site-enrichment" *ngIf="getSiteEnrichmentUiState(declaredSite) as enrichment">
                        <div class="site-enrichment-header">
                          <cfm-status-chip [label]="enrichment.label" [tone]="enrichment.tone" />
                          <span class="site-enrichment-attempted" *ngIf="declaredSite.location_enrichment_attempted_at">
                            Dernière tentative :
                            {{ declaredSite.location_enrichment_attempted_at | date: "dd/MM/yyyy HH:mm" }}
                          </span>
                        </div>

                        <span class="site-enrichment-detail">{{ enrichment.detail }}</span>
                        <span class="site-enrichment-reason" *ngIf="enrichment.reasonLabel">
                          {{ enrichment.reasonLabel }}
                        </span>
                        <span class="site-enrichment-meta" *ngIf="declaredSite.normalized_address">
                          Adresse reconnue : {{ declaredSite.normalized_address }}
                        </span>
                        <span class="site-enrichment-meta" *ngIf="declaredSite.site_risk_summary">
                          {{ declaredSite.site_risk_summary }}
                        </span>
                        <span class="site-enrichment-meta" *ngIf="site.sourceKinds.length > 1">
                          {{ getRegulatoryAllSiteDetail(site) }}
                        </span>
                      </div>
                    </div>

                    <div class="site-actions" *ngIf="canManageOrganization">
                      <cfm-button
                        *ngIf="getSiteEnrichmentUiState(declaredSite) as enrichment"
                        type="button"
                        [variant]="enrichment.showRetryAsPrimary ? 'secondary' : 'ghost'"
                        size="sm"
                        [disabled]="organizationSiteEnrichmentBusyId === declaredSite.id"
                        (click)="relaunchSiteEnrichment(declaredSite)"
                      >
                        {{
                          organizationSiteEnrichmentBusyId === declaredSite.id
                            ? "Relance en cours"
                            : enrichment.retryLabel
                        }}
                      </cfm-button>

                      <cfm-button
                        type="button"
                        variant="secondary"
                        size="sm"
                        [disabled]="organizationSiteStatusBusyId === declaredSite.id"
                        (click)="toggleSiteStatus(declaredSite)"
                      >
                        {{
                          organizationSiteStatusBusyId === declaredSite.id
                            ? "Mise à jour en cours"
                            : declaredSite.status === 'active'
                              ? "Archiver"
                              : "Réactiver"
                        }}
                      </cfm-button>
                    </div>
                  </ng-container>

                  <ng-template #inferredRegulatorySite>
                    <div class="site-copy">
                      <div class="site-heading">
                        <strong>{{ site.name }}</strong>
                        <div class="chips">
                          <cfm-status-chip label="Site repéré" tone="calm" />
                          <cfm-status-chip [label]="getRegulatoryAllSiteSourceLabel(site)" tone="neutral" />
                        </div>
                      </div>
                      <span *ngIf="site.address">{{ site.address }}</span>
                      <span class="site-enrichment-detail">{{ getRegulatoryAllSiteDetail(site) }}</span>
                    </div>
                  </ng-template>
                </li>
              </ul>

                  <ng-template #emptySites>
                    <cfm-empty-state
                      title="Aucun site déclaré"
                      description="Ajoutez un premier site ou bâtiment pour structurer progressivement l’entreprise."
                    />
                  </ng-template>
                </cfm-card>
              </div>
            </section>

            <cfm-card
              id="reg-building-safety-section"
              class="desktop-card"
              eyebrow="S2-012 · S2-013 · S2-014"
              title="Sécurité bâtiment"
              description="Un suivi simple des extincteurs, DAE et contrôles périodiques, avec alertes claires et vue filtrée par site."
            >
              <div class="building-safety-header">
                <div class="chips">
                  <cfm-status-chip
                    [label]="getBuildingSafetySummaryLabel('overdue')"
                    [tone]="buildingSafetyOverdueCount > 0 ? 'warning' : 'neutral'"
                  />
                  <cfm-status-chip
                    [label]="getBuildingSafetySummaryLabel('due_soon')"
                    [tone]="buildingSafetyDueSoonCount > 0 ? 'progress' : 'neutral'"
                  />
                  <cfm-status-chip
                    [label]="getBuildingSafetySummaryLabel('ok')"
                    [tone]="buildingSafetyOkCount > 0 ? 'success' : 'neutral'"
                  />
                </div>

                <label class="organization-switch">
                  <span>Vue par site</span>
                  <select
                    [(ngModel)]="selectedSafetySiteId"
                    name="selectedSafetySiteId"
                    (change)="handleSiteFilterChange()"
                  >
                    <option value="all">Tous les sites</option>
                    <option *ngFor="let site of organizationSites" [value]="site.id">
                      {{ site.name }}
                    </option>
                  </select>
                </label>
              </div>

              <ul
                class="alert-list"
                *ngIf="filteredBuildingSafetyAlerts.length > 0; else noBuildingSafetyAlerts"
              >
                <li *ngFor="let alert of filteredBuildingSafetyAlerts">
                  <div class="list-copy">
                    <strong>{{ alert.item_name }}</strong>
                    <span>{{ alert.site_name }} · {{ alert.message }}</span>
                  </div>
                  <cfm-status-chip
                    [label]="alert.alert_type === 'overdue' ? 'En retard' : 'Échéance proche'"
                    [tone]="alert.alert_type === 'overdue' ? 'warning' : 'progress'"
                  />
                </li>
              </ul>

              <ng-template #noBuildingSafetyAlerts>
                <cfm-empty-state
                  title="Aucune alerte sur ce filtre"
                  description="Les alertes sécurité bâtiment apparaitront ici dès qu’un contrôle demande une action."
                />
              </ng-template>

              <form class="building-safety-form" (ngSubmit)="saveBuildingSafetyItem()">
                <label class="field">
                  <span>Site ou bâtiment</span>
                  <select
                    [(ngModel)]="buildingSafetyForm.siteId"
                    name="buildingSafetySiteId"
                    [disabled]="!canManageOrganization || buildingSafetySaving || isBuildingSafetyEditing"
                    required
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let site of activeOrganizationSites" [value]="site.id">
                      {{ site.name }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span>Élément</span>
                  <select
                    [(ngModel)]="buildingSafetyForm.itemType"
                    name="buildingSafetyItemType"
                    [disabled]="!canManageOrganization || buildingSafetySaving || isBuildingSafetyEditing"
                  >
                    <option value="fire_extinguisher">Extincteur</option>
                    <option value="dae">DAE</option>
                    <option value="periodic_check">Contrôle périodique</option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="buildingSafetyForm.name"
                  name="buildingSafetyName"
                  type="text"
                  label="Nom ou repère"
                  placeholder="Ex. Extincteur hall d’accueil"
                  [disabled]="!canManageOrganization || buildingSafetySaving || isBuildingSafetyEditing"
                  required
                />

                <cfm-input
                  [(ngModel)]="buildingSafetyForm.nextDueDate"
                  name="buildingSafetyNextDueDate"
                  type="date"
                  label="Prochaine échéance"
                  [disabled]="!canManageOrganization || buildingSafetySaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="buildingSafetyForm.lastCheckedAt"
                  name="buildingSafetyLastCheckedAt"
                  type="date"
                  label="Dernier contrôle"
                  [disabled]="!canManageOrganization || buildingSafetySaving"
                />

                <label class="field" *ngIf="isBuildingSafetyEditing">
                  <span>Statut</span>
                  <select
                    [(ngModel)]="buildingSafetyForm.status"
                    name="buildingSafetyStatus"
                    [disabled]="!canManageOrganization || buildingSafetySaving"
                  >
                    <option value="active">Actif</option>
                    <option value="archived">Archivé</option>
                  </select>
                </label>

                <label class="field field-wide">
                  <span>Note utile</span>
                  <textarea
                    [(ngModel)]="buildingSafetyForm.notes"
                    name="buildingSafetyNotes"
                    rows="3"
                    placeholder="Ex. vérification annuelle à anticiper avant l’été"
                    [disabled]="!canManageOrganization || buildingSafetySaving"
                  ></textarea>
                </label>

                <p class="small" *ngIf="isBuildingSafetyEditing">
                  Mettez à jour l’échéance ou le dernier contrôle sans changer le rattachement du site.
                </p>

                <div class="form-actions inline-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!canManageOrganization || buildingSafetySaving || !canCreateBuildingSafetyItem"
                  >
                    {{
                      buildingSafetySaving
                        ? (isBuildingSafetyEditing ? "Enregistrement en cours" : "Ajout en cours")
                        : (isBuildingSafetyEditing ? "Enregistrer les changements" : "Ajouter l’élément")
                    }}
                  </cfm-button>

                  <cfm-button
                    *ngIf="isBuildingSafetyEditing"
                    type="button"
                    variant="secondary"
                    [disabled]="buildingSafetySaving"
                    (click)="cancelBuildingSafetyEditing()"
                  >
                    Annuler
                  </cfm-button>
                </div>
              </form>

              <ul
                class="building-safety-list"
                *ngIf="filteredBuildingSafetyItems.length > 0; else emptyBuildingSafetyItems"
              >
                <li *ngFor="let item of filteredBuildingSafetyItems">
                  <div class="building-safety-copy">
                    <div class="site-heading">
                      <strong>{{ item.name }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getBuildingSafetyTypeLabel(item.item_type)" tone="calm" />
                        <cfm-status-chip
                          [label]="getBuildingSafetyAlertStatusLabel(item.alert_status)"
                          [tone]="getBuildingSafetyAlertStatusTone(item.alert_status)"
                        />
                        <cfm-status-chip
                          *ngIf="selectedSafetySiteId === 'all'"
                          [label]="item.site_name"
                          tone="neutral"
                        />
                      </div>
                    </div>
                    <span>Échéance : {{ item.next_due_date }}</span>
                    <span *ngIf="item.last_checked_at">Dernier contrôle : {{ item.last_checked_at }}</span>
                    <span *ngIf="item.notes">{{ item.notes }}</span>
                  </div>

                  <div class="inline-actions" *ngIf="canManageOrganization">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="buildingSafetySaving || buildingSafetyStatusBusyId === item.id"
                      (click)="startEditingBuildingSafetyItem(item)"
                    >
                      Modifier
                    </cfm-button>
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="buildingSafetySaving || buildingSafetyStatusBusyId === item.id"
                      (click)="toggleBuildingSafetyItemStatus(item)"
                    >
                      {{
                        buildingSafetyStatusBusyId === item.id
                          ? "Mise à jour en cours"
                          : item.status === 'active'
                            ? "Archiver"
                            : "Réactiver"
                      }}
                    </cfm-button>
                  </div>
                </li>
              </ul>

              <ng-template #emptyBuildingSafetyItems>
                <cfm-empty-state
                  title="Aucun élément sécurité déclaré"
                  description="Ajoutez un extincteur, un DAE ou un contrôle périodique pour commencer un suivi bâtiment très simple."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              id="reg-obligations-section"
              class="desktop-card"
              eyebrow="S2-004 · S2-010 · S2-011"
              title="Fiches d’obligations"
              description="Ouvrez une fiche pour comprendre pourquoi elle s’applique, quoi faire maintenant et quelles preuves sont déjà prêtes."
            >
              <div class="card-header-actions">
                <div class="chips" *ngIf="regulatoryProfile">
                  <cfm-status-chip
                    [label]="regulatoryProfile.profile_status === 'ready' ? 'Profil exploitable' : 'Profil à compléter'"
                    [tone]="regulatoryProfile.profile_status === 'ready' ? 'success' : 'progress'"
                  />
                  <cfm-status-chip
                    [label]="getObligationCountLabel()"
                    [tone]="(regulatoryProfile.applicable_obligations.length ?? 0) > 0 ? 'calm' : 'neutral'"
                  />
                </div>

                <cfm-status-chip
                  *ngIf="selectedRegulatoryObligation"
                  [label]="selectedObligationEvidences.length + ' preuve' + (selectedObligationEvidences.length > 1 ? 's' : '')"
                  [tone]="selectedObligationEvidences.length > 0 ? 'success' : 'neutral'"
                />
              </div>

              <p class="small" *ngIf="regulatoryProfile?.missing_profile_items?.length">
                Pour affiner cette lecture, complétez :
                {{ regulatoryProfile?.missing_profile_items?.join(", ") }}.
              </p>

              <div class="chips criteria-chips" *ngIf="regulatoryProfile">
                <cfm-status-chip
                  *ngFor="let criterion of regulatoryProfile.criteria"
                  [label]="criterion.summary"
                  [tone]="getCriterionTone(criterion.value)"
                />
              </div>

              <ul
                class="obligation-list"
                *ngIf="regulatoryProfile && regulatoryProfile.applicable_obligations.length > 0; else emptyObligations"
              >
                <li *ngFor="let obligation of regulatoryProfile.applicable_obligations">
                  <div class="obligation-copy">
                    <div class="obligation-heading">
                      <strong>{{ obligation.title }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getObligationCategoryLabel(obligation.category)" tone="calm" />
                        <cfm-status-chip
                          [label]="getObligationPriorityLabel(obligation.priority)"
                          [tone]="getObligationPriorityTone(obligation.priority)"
                        />
                        <cfm-status-chip
                          [label]="getComplianceStatusLabel(obligation.status)"
                          [tone]="getComplianceStatusTone(obligation.status)"
                        />
                      </div>
                    </div>
                    <span>{{ obligation.description }}</span>
                    <p class="small">{{ obligation.reason_summary }}</p>
                    <div class="inline-actions">
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="selectedObligationId === obligation.id"
                        (click)="openObligationDetail(obligation.id)"
                      >
                        {{ selectedObligationId === obligation.id ? "Fiche ouverte" : "Ouvrir la fiche" }}
                      </cfm-button>
                    </div>
                  </div>
                </li>
              </ul>

              <article class="obligation-detail" *ngIf="selectedRegulatoryObligation as selectedObligation">
                <div class="obligation-heading">
                  <div class="detail-copy">
                    <h3>{{ selectedObligation.title }}</h3>
                    <p>{{ selectedObligation.description }}</p>
                  </div>
                  <div class="chips">
                    <cfm-status-chip
                      [label]="getObligationPriorityLabel(selectedObligation.priority)"
                      [tone]="getObligationPriorityTone(selectedObligation.priority)"
                    />
                    <cfm-status-chip
                      [label]="getComplianceStatusLabel(selectedObligation.status)"
                      [tone]="getComplianceStatusTone(selectedObligation.status)"
                    />
                    <cfm-status-chip
                      [label]="selectedObligationEvidences.length + ' preuve' + (selectedObligationEvidences.length > 1 ? 's' : '')"
                      [tone]="selectedObligationEvidences.length > 0 ? 'success' : 'neutral'"
                    />
                  </div>
                </div>

                <div class="detail-grid">
                  <section class="detail-block">
                    <h3>Pourquoi elle s'applique</h3>
                    <p>{{ selectedObligation.reason_summary }}</p>
                    <ul class="detail-list" *ngIf="selectedObligationCriteria.length > 0">
                      <li *ngFor="let criterion of selectedObligationCriteria">{{ criterion.summary }}</li>
                    </ul>
                  </section>

                  <section class="detail-block">
                    <h3>Première action conseillée</h3>
                    <p>{{ getObligationFirstAction(selectedObligation, selectedObligationEvidences.length) }}</p>
                  </section>
                </div>

                <section class="detail-block">
                  <h3>Pièces déjà rattachées</h3>
                  <ul class="detail-list" *ngIf="selectedObligationEvidences.length > 0; else emptyObligationEvidences">
                    <li *ngFor="let evidence of selectedObligationEvidences">
                      <div class="detail-evidence-row">
                        <div class="detail-copy">
                          <strong>{{ evidence.file_name }}</strong>
                          <span>{{ evidence.document_type }} · {{ getDocumentStatusLabel(evidence.status) }}</span>
                          <span *ngIf="evidence.uploaded_at">Ajouté le {{ evidence.uploaded_at | date:'shortDate' }}</span>
                          <span *ngIf="evidence.notes">{{ evidence.notes }}</span>
                        </div>
                        <cfm-status-chip
                          [label]="getDocumentStatusLabel(evidence.status)"
                          [tone]="getDocumentStatusTone(evidence.status)"
                        />
                      </div>
                    </li>
                  </ul>

                  <ng-template #emptyObligationEvidences>
                    <p class="small">
                      Aucune pièce n'est encore rattachée directement à cette obligation.
                    </p>
                  </ng-template>
                </section>
              </article>

              <ng-template #emptyObligations>
                <cfm-empty-state
                  title="Aucune obligation V1 détectée pour l’instant"
                  description="Complétez le profil ou ajoutez un site pour affiner le premier périmètre réglementaire."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              id="reg-duerp-section"
              class="desktop-card"
              eyebrow="S2-020"
              title="DUERP simplifié"
              description="Une base claire pour recenser quelques unités de travail, risques et actions de prévention sans jargon HSE."
            >
              <div class="chips">
                <cfm-status-chip
                  [label]="filteredDuerpEntries.length + ' risque' + (filteredDuerpEntries.length > 1 ? 's' : '')"
                  [tone]="filteredDuerpEntries.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="duerpEditingId ? 'Modification en cours' : 'Saisie progressive'"
                  [tone]="duerpEditingId ? 'progress' : 'neutral'"
                />
              </div>

              <form class="duerp-form" (ngSubmit)="saveDuerpEntry()">
                <label class="field">
                  <span>Site ou bâtiment</span>
                  <select
                    [(ngModel)]="duerpForm.siteId"
                    name="duerpSiteId"
                    [disabled]="!canManageOrganization || duerpSaving"
                  >
                    <option value="">Entreprise / transversal</option>
                    <option *ngFor="let site of activeOrganizationSites" [value]="site.id">
                      {{ site.name }}
                    </option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="duerpForm.workUnitName"
                  name="duerpWorkUnitName"
                  type="text"
                  label="Unité de travail"
                  placeholder="Ex. intervention en hauteur"
                  [disabled]="!canManageOrganization || duerpSaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="duerpForm.riskLabel"
                  name="duerpRiskLabel"
                  type="text"
                  label="Risque identifié"
                  placeholder="Ex. chute lors d’une maintenance"
                  [disabled]="!canManageOrganization || duerpSaving"
                  required
                />

                <label class="field">
                  <span>Gravité</span>
                  <select
                    [(ngModel)]="duerpForm.severity"
                    name="duerpSeverity"
                    [disabled]="!canManageOrganization || duerpSaving"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </label>

                <label class="field field-wide">
                  <span>Action de prévention</span>
                  <textarea
                    [(ngModel)]="duerpForm.preventionAction"
                    name="duerpPreventionAction"
                    rows="3"
                    placeholder="Ex. balisage, EPI, vérification avant intervention"
                    [disabled]="!canManageOrganization || duerpSaving"
                  ></textarea>
                </label>

                <div class="form-actions inline-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!canManageOrganization || duerpSaving || !canSaveDuerpEntry"
                  >
                    {{
                      duerpSaving
                        ? (duerpEditingId ? "Enregistrement en cours" : "Ajout en cours")
                        : (duerpEditingId ? "Enregistrer les changements" : "Ajouter le risque")
                    }}
                  </cfm-button>

                  <cfm-button
                    *ngIf="duerpEditingId"
                    type="button"
                    variant="secondary"
                    [disabled]="duerpSaving"
                    (click)="cancelDuerpEditing()"
                  >
                    Annuler
                  </cfm-button>
                </div>
              </form>

              <ul class="duerp-list" *ngIf="filteredDuerpEntries.length > 0; else emptyDuerpEntries">
                <li *ngFor="let entry of filteredDuerpEntries">
                  <div class="duerp-copy">
                    <div class="site-heading">
                      <strong>{{ entry.risk_label }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getDuerpSeverityLabel(entry.severity)" [tone]="getDuerpSeverityTone(entry.severity)" />
                        <cfm-status-chip [label]="entry.status === 'active' ? 'Actif' : 'Archivé'" [tone]="entry.status === 'active' ? 'success' : 'neutral'" />
                        <cfm-status-chip [label]="getComplianceStatusLabel(entry.compliance_status)" [tone]="getComplianceStatusTone(entry.compliance_status)" />
                        <cfm-status-chip
                          *ngIf="selectedSafetySiteId === 'all'"
                          [label]="entry.site_name ?? 'Entreprise'"
                          tone="neutral"
                        />
                      </div>
                    </div>
                    <span>Unité de travail : {{ entry.work_unit_name }}</span>
                    <span *ngIf="entry.prevention_action">Prévention : {{ entry.prevention_action }}</span>
                    <span *ngIf="entry.proof_count > 0">
                      {{ entry.proof_count }} pièce{{ entry.proof_count > 1 ? "s" : "" }} justificative{{ entry.proof_count > 1 ? "s" : "" }}
                    </span>
                  </div>

                  <div class="inline-actions" *ngIf="canManageOrganization">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="duerpStatusBusyId === entry.id"
                      (click)="startEditingDuerpEntry(entry)"
                    >
                      Modifier
                    </cfm-button>
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="duerpStatusBusyId === entry.id"
                      (click)="toggleDuerpEntryStatus(entry)"
                    >
                      {{
                        duerpStatusBusyId === entry.id
                          ? "Mise à jour en cours"
                          : entry.status === 'active'
                            ? "Archiver"
                            : "Réactiver"
                      }}
                    </cfm-button>
                  </div>
                </li>
              </ul>

              <ng-template #emptyDuerpEntries>
                <cfm-empty-state
                  title="Aucun risque DUERP saisi"
                  description="Ajoutez quelques risques simples pour constituer une première base DUERP exploitable."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              id="reg-evidence-section"
              class="desktop-card"
              eyebrow="S2-021 · S2-022"
              title="Preuves et traçabilité"
              description="Ajoutez des preuves simples, rattachez-les au bon sujet et gardez une lecture démontrable de la conformité."
            >
              <form class="evidence-form" (ngSubmit)="createEvidence()">
                <label class="field">
                  <span>Rattacher à</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.linkKind"
                    name="evidenceLinkKind"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="obligation">Obligation</option>
                    <option value="site">Site / bâtiment</option>
                    <option value="building_safety_item">Élément sécurité</option>
                    <option value="duerp_entry">Entrée DUERP</option>
                  </select>
                </label>

                <label class="field" *ngIf="regulatoryEvidenceForm.linkKind === 'obligation'">
                  <span>Obligation concernée</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.obligationId"
                    name="evidenceObligationId"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let obligation of regulatoryProfile?.applicable_obligations ?? []" [value]="obligation.id">
                      {{ obligation.title }}
                    </option>
                  </select>
                </label>

                <label class="field" *ngIf="regulatoryEvidenceForm.linkKind === 'site'">
                  <span>Site / bâtiment</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.siteId"
                    name="evidenceSiteId"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let site of activeOrganizationSites" [value]="site.id">
                      {{ site.name }}
                    </option>
                  </select>
                </label>

                <label class="field" *ngIf="regulatoryEvidenceForm.linkKind === 'building_safety_item'">
                  <span>Élément sécurité</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.buildingSafetyItemId"
                    name="evidenceBuildingSafetyItemId"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let item of selectableBuildingSafetyItems" [value]="item.id">
                      {{ item.name }}{{ item.site_name ? " · " + item.site_name : "" }}
                    </option>
                  </select>
                </label>

                <label class="field" *ngIf="regulatoryEvidenceForm.linkKind === 'duerp_entry'">
                  <span>Entrée DUERP</span>
                  <select
                    [(ngModel)]="regulatoryEvidenceForm.duerpEntryId"
                    name="evidenceDuerpEntryId"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  >
                    <option value="">Choisir</option>
                    <option *ngFor="let entry of selectableDuerpEntries" [value]="entry.id">
                      {{ entry.risk_label }}{{ entry.site_name ? " · " + entry.site_name : "" }}
                    </option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="regulatoryEvidenceForm.fileName"
                  name="evidenceFileName"
                  type="text"
                  label="Nom du justificatif"
                  placeholder="Ex. attestation controle-extincteur-2026.pdf"
                  [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  required
                />

                <cfm-input
                  [(ngModel)]="regulatoryEvidenceForm.documentType"
                  name="evidenceDocumentType"
                  type="text"
                  label="Type"
                  placeholder="Ex. attestation"
                  [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  required
                />

                <label class="field field-wide">
                  <span>Note utile</span>
                  <textarea
                    [(ngModel)]="regulatoryEvidenceForm.notes"
                    name="evidenceNotes"
                    rows="3"
                    placeholder="Ex. justificatif ajouté après le dernier contrôle"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving"
                  ></textarea>
                </label>

                <div class="form-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!canManageOrganization || regulatoryEvidenceSaving || !canCreateRegulatoryEvidence"
                  >
                    {{ regulatoryEvidenceSaving ? "Ajout en cours" : "Ajouter la pièce" }}
                  </cfm-button>
                </div>
              </form>

              <ul class="evidence-list" *ngIf="filteredRegulatoryEvidences.length > 0; else emptyRegulatoryEvidences">
                <li *ngFor="let evidence of filteredRegulatoryEvidences">
                  <div class="duerp-copy">
                    <div class="site-heading">
                      <strong>{{ evidence.file_name }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getRegulatoryEvidenceLinkKindLabel(evidence.link_kind)" tone="calm" />
                        <cfm-status-chip label="Disponible" tone="success" />
                        <cfm-status-chip
                          *ngIf="selectedSafetySiteId === 'all' && evidence.site_id"
                          [label]="getSiteNameById(evidence.site_id)"
                          tone="neutral"
                        />
                      </div>
                    </div>
                    <span>Rattaché à : {{ evidence.link_label }}</span>
                    <span>Type : {{ evidence.document_type }}</span>
                    <span *ngIf="evidence.uploaded_at">Ajouté le {{ evidence.uploaded_at | date:'shortDate' }}</span>
                    <span *ngIf="evidence.notes">{{ evidence.notes }}</span>
                  </div>
                </li>
              </ul>

              <ng-template #emptyRegulatoryEvidences>
                <cfm-empty-state
                  title="Aucune pièce justificative"
                  description="Ajoutez une première preuve réglementaire simple pour compléter progressivement les obligations ou le DUERP."
                />
              </ng-template>
            </cfm-card>
          </ng-container>
          </ng-template>

          <ng-template #facturationPageTemplate>
          <cfm-card
            *ngIf="shouldShowWorkspaceContent && currentMembership && !isFacturationEnabled"
            class="desktop-card"
            eyebrow="Facturation"
            title="Module non activé"
            description="Activez le module Facturation pour créer vos premiers clients, devis et factures simples."
          >
            <cfm-empty-state
              title="Rien d’autre à remplir pour le moment"
              description="Le socle facturation apparaitra ici dès que le module sera activé."
            />
          </cfm-card>

          <ng-container *ngIf="shouldShowWorkspaceContent && currentMembership && isFacturationEnabled">
            <cfm-card
              class="desktop-card"
              eyebrow="S3-001"
              title="Clients"
              description="Un socle client simple pour démarrer rapidement sans base CRM ni configuration lourde."
            >
              <div class="chips">
                <cfm-status-chip
                  [label]="customerSearchCountLabel"
                  [tone]="billingCustomers.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="isCustomerEditing ? 'Modification en cours' : 'Création simple'"
                  [tone]="isCustomerEditing ? 'progress' : 'neutral'"
                />
              </div>

              <form class="customer-form" (ngSubmit)="saveCustomer()">
                <cfm-input
                  [(ngModel)]="customerForm.name"
                  name="customerName"
                  type="text"
                  label="Nom du client"
                  placeholder="Ex. Atelier Durand"
                  [disabled]="!canManageOrganization || customerSaving"
                  required
                />

                <label class="field">
                  <span>Type</span>
                  <select
                    [(ngModel)]="customerForm.customerType"
                    name="customerType"
                    [disabled]="!canManageOrganization || customerSaving"
                  >
                    <option value="company">Entreprise</option>
                    <option value="individual">Particulier</option>
                  </select>
                </label>

                <cfm-input
                  [(ngModel)]="customerForm.email"
                  name="customerEmail"
                  type="email"
                  label="Email"
                  placeholder="contact@client.fr"
                  [disabled]="!canManageOrganization || customerSaving"
                />

                <cfm-input
                  [(ngModel)]="customerForm.phone"
                  name="customerPhone"
                  type="text"
                  label="Téléphone"
                  placeholder="06 00 00 00 00"
                  [disabled]="!canManageOrganization || customerSaving"
                />

                <label class="field field-wide">
                  <span>Adresse</span>
                  <textarea
                    [(ngModel)]="customerForm.address"
                    name="customerAddress"
                    rows="3"
                    placeholder="Adresse utile pour les documents simples"
                    [disabled]="!canManageOrganization || customerSaving"
                  ></textarea>
                </label>

                <label class="field field-wide">
                  <span>Note courte</span>
                  <textarea
                    [(ngModel)]="customerForm.notes"
                    name="customerNotes"
                    rows="3"
                    placeholder="Ex. contact principal, info utile de facturation"
                    [disabled]="!canManageOrganization || customerSaving"
                  ></textarea>
                </label>

                <div class="form-actions inline-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!canManageOrganization || customerSaving || !canSaveCustomer"
                  >
                    {{
                      customerSaving
                        ? (isCustomerEditing ? "Enregistrement en cours" : "Ajout en cours")
                        : (isCustomerEditing ? "Enregistrer les changements" : "Ajouter le client")
                    }}
                  </cfm-button>

                  <cfm-button
                    *ngIf="isCustomerEditing"
                    type="button"
                    variant="secondary"
                    [disabled]="customerSaving"
                    (click)="cancelCustomerEditing()"
                  >
                    Annuler
                  </cfm-button>
                </div>
              </form>

              <cfm-input
                *ngIf="billingCustomers.length > 0"
                [(ngModel)]="customerSearchTerm"
                name="customerSearch"
                type="text"
                label="Recherche rapide client"
                placeholder="Nom, email ou téléphone"
              />

              <ul class="customer-list" *ngIf="filteredBillingCustomers.length > 0; else emptyCustomers">
                <li *ngFor="let customer of filteredBillingCustomers">
                  <div class="customer-copy">
                    <div class="site-heading">
                      <strong>{{ customer.name }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getCustomerTypeLabel(customer.customer_type)" tone="calm" />
                      </div>
                    </div>
                    <span *ngIf="customer.email">Email : {{ customer.email }}</span>
                    <span *ngIf="customer.phone">Téléphone : {{ customer.phone }}</span>
                    <span *ngIf="customer.address">{{ customer.address }}</span>
                    <span *ngIf="customer.notes">{{ customer.notes }}</span>
                  </div>

                  <div class="billing-item-actions" *ngIf="canManageOrganization">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="customerSaving"
                      (click)="startEditingCustomer(customer)"
                    >
                      Modifier
                    </cfm-button>

                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="customerSaving"
                      (click)="prepareQuoteFromCustomer(customer.id)"
                    >
                      Préparer un devis
                    </cfm-button>

                    <cfm-button
                      type="button"
                      variant="secondary"
                      [disabled]="customerSaving"
                      (click)="prepareInvoiceFromCustomer(customer.id)"
                    >
                      Préparer une facture
                    </cfm-button>
                  </div>
                </li>
              </ul>

              <ng-template #emptyCustomers>
                <cfm-empty-state
                  [title]="billingCustomers.length === 0 ? 'Aucun client pour le moment' : 'Aucun client trouvé'"
                  [description]="billingCustomers.length === 0
                    ? 'Ajoutez un premier client avec les informations essentielles uniquement.'
                    : 'Essayez un nom, un email ou un téléphone plus court.'"
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              id="billing-quote-card"
              class="desktop-card"
              eyebrow="S3-002"
              title="Devis simple"
              description="Un devis léger, rattaché à un client, avec quelques lignes et un total lisible."
            >
              <div class="chips">
                <cfm-status-chip
                  [label]="quotes.length + ' devis'"
                  [tone]="quotes.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="'Total en préparation : ' + formatAmountCents(quoteFormTotalCents)"
                  [tone]="quoteFormTotalCents > 0 ? 'progress' : 'neutral'"
                />
                <cfm-status-chip
                  *ngIf="hasQuoteDraft"
                  label="Saisie conservée"
                  tone="calm"
                />
              </div>

              <ng-container *ngIf="billingCustomers.length > 0; else noCustomersForQuotes">
                <form class="billing-form" (ngSubmit)="saveQuote()">
                  <label class="field">
                    <span>Client</span>
                    <select
                      [(ngModel)]="quoteForm.customerId"
                      name="quoteCustomerId"
                      [disabled]="!canManageOrganization || quoteSaving"
                      required
                    >
                      <option value="">Choisir</option>
                      <option *ngFor="let customer of billingCustomers" [value]="customer.id">
                        {{ customer.name }}
                      </option>
                    </select>
                  </label>

                  <label class="field">
                    <span>Chantier lié</span>
                    <select
                      [(ngModel)]="quoteForm.worksiteId"
                      name="quoteWorksiteId"
                      [disabled]="!canManageOrganization || quoteSaving"
                    >
                      <option value="">Aucun chantier</option>
                      <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                        {{ worksite.name }}
                      </option>
                    </select>
                  </label>

                  <cfm-input
                    [(ngModel)]="quoteForm.title"
                    name="quoteTitle"
                    type="text"
                    label="Objet"
                    placeholder="Ex. Remise en état armoire électrique"
                    [disabled]="!canManageOrganization || quoteSaving"
                  />

                  <cfm-input
                    [(ngModel)]="quoteForm.issueDate"
                    name="quoteIssueDate"
                    type="date"
                    label="Date"
                    [disabled]="!canManageOrganization || quoteSaving"
                    required
                  />

                  <cfm-input
                    [(ngModel)]="quoteForm.validUntil"
                    name="quoteValidUntil"
                    type="date"
                    label="Valable jusqu'au"
                    [disabled]="!canManageOrganization || quoteSaving"
                  />

                  <label class="field">
                    <span>Statut</span>
                    <select
                      [(ngModel)]="quoteForm.status"
                      name="quoteStatus"
                      [disabled]="!canManageOrganization || quoteSaving"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="sent">Envoyé</option>
                    </select>
                  </label>

                  <label class="field field-wide">
                    <span>Note courte</span>
                    <textarea
                      [(ngModel)]="quoteForm.notes"
                      name="quoteNotes"
                      rows="3"
                      placeholder="Ex. portée du devis ou précaution utile"
                      [disabled]="!canManageOrganization || quoteSaving"
                    ></textarea>
                  </label>

                  <div class="billing-lines field-wide">
                    <div class="billing-line-header">
                      <h3>Lignes du devis</h3>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="!canManageOrganization || quoteSaving"
                        (click)="addQuoteLine()"
                      >
                        Ajouter une ligne
                      </cfm-button>
                    </div>

                    <div class="billing-line-editor" *ngFor="let line of quoteForm.lines; let lineIndex = index">
                      <cfm-input
                        [(ngModel)]="line.description"
                        [name]="'quoteLineDescription' + lineIndex"
                        type="text"
                        label="Description"
                        placeholder="Ex. Remplacement appareil"
                        [disabled]="!canManageOrganization || quoteSaving"
                      />
                      <cfm-input
                        [(ngModel)]="line.quantity"
                        [name]="'quoteLineQuantity' + lineIndex"
                        type="text"
                        label="Quantité"
                        placeholder="1"
                        [disabled]="!canManageOrganization || quoteSaving"
                      />
                      <cfm-input
                        [(ngModel)]="line.unitPrice"
                        [name]="'quoteLineUnitPrice' + lineIndex"
                        type="text"
                        label="Prix unitaire TTC (€)"
                        placeholder="120"
                        [disabled]="!canManageOrganization || quoteSaving"
                      />
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="!canManageOrganization || quoteSaving"
                        (click)="removeQuoteLine(lineIndex)"
                      >
                        Retirer
                      </cfm-button>
                    </div>
                  </div>

                  <p class="small field-wide">Total estimé : {{ formatAmountCents(quoteFormTotalCents) }}</p>

                  <div class="form-actions">
                    <cfm-button
                      type="submit"
                      [disabled]="!canManageOrganization || quoteSaving || !canCreateQuote"
                    >
                      {{ quoteSaving ? "Ajout en cours" : "Créer le devis" }}
                    </cfm-button>
                    <cfm-button
                      *ngIf="hasQuoteDraft"
                      type="button"
                      variant="secondary"
                      [disabled]="quoteSaving"
                      (click)="discardQuoteDraft()"
                    >
                      Effacer la saisie
                    </cfm-button>
                  </div>
                </form>
              </ng-container>

              <ng-template #noCustomersForQuotes>
                <cfm-empty-state
                  title="Ajoutez d'abord un client"
                  description="Le devis simple apparait dès qu'un premier client est disponible."
                />
              </ng-template>

              <ul class="billing-list" *ngIf="quotes.length > 0; else emptyQuotes">
                <li *ngFor="let quote of quotes">
                  <div class="duerp-copy">
                    <div class="site-heading">
                      <strong>{{ quote.title || ('Devis du ' + (quote.issue_date | date:'shortDate')) }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getQuoteStatusLabel(quote.status)" [tone]="getQuoteStatusTone(quote.status)" />
                        <cfm-status-chip
                          [label]="getBillingFollowUpStatusLabel(quote.follow_up_status)"
                          [tone]="getBillingFollowUpStatusTone(quote.follow_up_status)"
                        />
                        <cfm-status-chip [label]="quote.customer_name" tone="calm" />
                      </div>
                    </div>
                    <span *ngIf="quote.worksite_name">Chantier : {{ quote.worksite_name }}</span>
                    <span>Numéro : {{ quote.number }}</span>
                    <span>Émis le {{ quote.issue_date | date:'shortDate' }}</span>
                    <span *ngIf="quote.valid_until">Valable jusqu'au {{ quote.valid_until | date:'shortDate' }}</span>
                    <span>{{ quote.line_items.length }} ligne{{ quote.line_items.length > 1 ? "s" : "" }}</span>
                    <span>Total : {{ formatAmountCents(quote.total_amount_cents, quote.currency) }}</span>
                    <span *ngIf="quote.notes">{{ quote.notes }}</span>
                  </div>

                  <div class="billing-item-actions" *ngIf="canManageOrganization || canReadOrganization">
                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Chantier</span>
                      <select
                        [ngModel]="quote.worksite_id ?? ''"
                        [name]="'quoteWorksiteEdit' + quote.id"
                        [disabled]="quoteWorksiteBusyId === quote.id"
                        (ngModelChange)="changeQuoteWorksite(quote, $event)"
                      >
                        <option value="">Aucun chantier</option>
                        <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                          {{ worksite.name }}
                        </option>
                      </select>
                    </label>

                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Statut</span>
                      <select
                        [ngModel]="quote.status"
                        [name]="'quoteStatusEdit' + quote.id"
                        [disabled]="quoteStatusBusyId === quote.id"
                        (ngModelChange)="changeQuoteStatus(quote, $event)"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="sent">Envoyé</option>
                        <option value="accepted">Accepté</option>
                        <option value="declined">Refusé</option>
                      </select>
                    </label>

                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Suivi</span>
                      <select
                        [ngModel]="quote.follow_up_status"
                        [name]="'quoteFollowUpEdit' + quote.id"
                        [disabled]="quoteFollowUpBusyId === quote.id"
                        (ngModelChange)="changeQuoteFollowUpStatus(quote, $event)"
                      >
                        <option value="normal">Suivi normal</option>
                        <option value="to_follow_up">À relancer</option>
                        <option value="followed_up">Relancé</option>
                        <option value="waiting_customer">En attente client</option>
                      </select>
                    </label>

                    <cfm-button
                      *ngIf="canManageOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quoteEditingSaving"
                      (click)="quoteEditingId === quote.id ? cancelQuoteEditing() : startEditingQuote(quote)"
                    >
                      {{ quoteEditingId === quote.id ? "Annuler la modification" : "Modifier" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canManageOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quoteDuplicateBusyId === quote.id"
                      (click)="duplicateQuoteAsInvoice(quote)"
                    >
                      {{ quoteDuplicateBusyId === quote.id ? "Création en cours" : "Créer une facture" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quotePdfBusyId === quote.id"
                      (click)="exportQuotePdf(quote)"
                    >
                      {{ quotePdfBusyId === quote.id ? "Génération en cours" : "Exporter le PDF" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="quoteHistoryBusyId === quote.id"
                      (click)="toggleQuoteHistory(quote)"
                    >
                      {{
                        quoteHistoryBusyId === quote.id
                          ? "Chargement en cours"
                          : (quoteHistoryOpenId === quote.id ? "Masquer l'historique" : "Voir l'historique")
                      }}
                    </cfm-button>
                  </div>

                  <div class="billing-history" *ngIf="quoteHistoryOpenId === quote.id">
                    <p class="small">Principaux événements</p>

                    <ul class="history-list" *ngIf="getQuoteHistory(quote.id).length > 0; else emptyQuoteHistory">
                      <li *ngFor="let log of getQuoteHistory(quote.id)">
                        <div class="history-copy">
                          <strong>{{ getBillingHistoryLabel(log) }}</strong>
                          <span>{{ log.occurred_at | date:'short' }}</span>
                          <span>{{ getBillingHistoryMeta(log) }}</span>
                        </div>
                      </li>
                    </ul>

                    <ng-template #emptyQuoteHistory>
                      <cfm-empty-state
                        title="Aucun événement à afficher"
                        description="L'historique simple du devis apparaitra ici dès qu'une action utile sera tracée."
                      />
                    </ng-template>
                  </div>

                  <form class="billing-form" *ngIf="quoteEditingId === quote.id" (ngSubmit)="saveQuoteEdit(quote)">
                    <label class="field">
                      <span>Client</span>
                      <select
                        [(ngModel)]="quoteEditForm.customerId"
                        [name]="'quoteEditCustomerId' + quote.id"
                        [disabled]="quoteEditingSaving"
                        required
                      >
                        <option value="">Choisir</option>
                        <option *ngFor="let customer of billingCustomers" [value]="customer.id">
                          {{ customer.name }}
                        </option>
                      </select>
                    </label>

                    <label class="field">
                      <span>Chantier lié</span>
                      <select
                        [(ngModel)]="quoteEditForm.worksiteId"
                        [name]="'quoteEditWorksiteId' + quote.id"
                        [disabled]="quoteEditingSaving"
                      >
                        <option value="">Aucun chantier</option>
                        <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                          {{ worksite.name }}
                        </option>
                      </select>
                    </label>

                    <cfm-input
                      [(ngModel)]="quoteEditForm.title"
                      [name]="'quoteEditTitle' + quote.id"
                      type="text"
                      label="Objet"
                      placeholder="Ex. Intervention ou prestation"
                      [disabled]="quoteEditingSaving"
                    />

                    <cfm-input
                      [(ngModel)]="quoteEditForm.issueDate"
                      [name]="'quoteEditIssueDate' + quote.id"
                      type="date"
                      label="Date"
                      [disabled]="quoteEditingSaving"
                      required
                    />

                    <cfm-input
                      [(ngModel)]="quoteEditForm.validUntil"
                      [name]="'quoteEditValidUntil' + quote.id"
                      type="date"
                      label="Validité"
                      [disabled]="quoteEditingSaving"
                    />

                    <label class="field field-wide">
                      <span>Note courte</span>
                      <textarea
                        [(ngModel)]="quoteEditForm.notes"
                        [name]="'quoteEditNotes' + quote.id"
                        rows="3"
                        placeholder="Ex. portée du devis ou précision utile"
                        [disabled]="quoteEditingSaving"
                      ></textarea>
                    </label>

                    <div class="billing-lines field-wide">
                      <div class="billing-line-header">
                        <h3>Lignes du devis</h3>
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="quoteEditingSaving"
                          (click)="addQuoteEditLine()"
                        >
                          Ajouter une ligne
                        </cfm-button>
                      </div>

                      <div class="billing-line-editor" *ngFor="let line of quoteEditForm.lines; let lineIndex = index">
                        <cfm-input
                          [(ngModel)]="line.description"
                          [name]="'quoteEditLineDescription' + quote.id + '-' + lineIndex"
                          type="text"
                          label="Description"
                          placeholder="Ex. Fourniture"
                          [disabled]="quoteEditingSaving"
                        />
                        <cfm-input
                          [(ngModel)]="line.quantity"
                          [name]="'quoteEditLineQuantity' + quote.id + '-' + lineIndex"
                          type="text"
                          label="Quantité"
                          placeholder="1"
                          [disabled]="quoteEditingSaving"
                        />
                        <cfm-input
                          [(ngModel)]="line.unitPrice"
                          [name]="'quoteEditLineUnitPrice' + quote.id + '-' + lineIndex"
                          type="text"
                          label="Prix unitaire TTC (€)"
                          placeholder="120"
                          [disabled]="quoteEditingSaving"
                        />
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="quoteEditingSaving"
                          (click)="removeQuoteEditLine(lineIndex)"
                        >
                          Retirer
                        </cfm-button>
                      </div>
                    </div>

                    <p class="small field-wide">
                      Total recalculé : {{ formatAmountCents(quoteEditFormTotalCents) }}
                    </p>

                    <div class="form-actions inline-actions">
                      <cfm-button
                        type="submit"
                        [disabled]="quoteEditingSaving || !canSaveQuoteEdit"
                      >
                        {{ quoteEditingSaving ? "Enregistrement en cours" : "Enregistrer les modifications" }}
                      </cfm-button>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="quoteEditingSaving"
                        (click)="cancelQuoteEditing()"
                      >
                        Annuler
                      </cfm-button>
                    </div>
                  </form>
                </li>
              </ul>

              <ng-template #emptyQuotes>
                <cfm-empty-state
                  title="Aucun devis pour le moment"
                  description="Créez un premier devis simple avec quelques lignes et un total lisible."
                />
              </ng-template>
            </cfm-card>

            <cfm-card
              id="billing-invoice-card"
              class="desktop-card"
              eyebrow="S3-003"
              title="Facture simple"
              description="Une facture légère, rattachée à un client, avec lignes simples et total clair."
            >
              <div class="chips">
                <cfm-status-chip
                  [label]="invoices.length + ' facture' + (invoices.length > 1 ? 's' : '')"
                  [tone]="invoices.length > 0 ? 'calm' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="'Total en préparation : ' + formatAmountCents(invoiceFormTotalCents)"
                  [tone]="invoiceFormTotalCents > 0 ? 'progress' : 'neutral'"
                />
                <cfm-status-chip
                  *ngIf="hasInvoiceDraft"
                  label="Saisie conservée"
                  tone="calm"
                />
              </div>

              <ng-container *ngIf="billingCustomers.length > 0; else noCustomersForInvoices">
                <form class="billing-form" (ngSubmit)="saveInvoice()">
                  <label class="field">
                    <span>Client</span>
                    <select
                      [(ngModel)]="invoiceForm.customerId"
                      name="invoiceCustomerId"
                      [disabled]="!canManageOrganization || invoiceSaving"
                      required
                    >
                      <option value="">Choisir</option>
                      <option *ngFor="let customer of billingCustomers" [value]="customer.id">
                        {{ customer.name }}
                      </option>
                    </select>
                  </label>

                  <label class="field">
                    <span>Chantier lié</span>
                    <select
                      [(ngModel)]="invoiceForm.worksiteId"
                      name="invoiceWorksiteId"
                      [disabled]="!canManageOrganization || invoiceSaving"
                    >
                      <option value="">Aucun chantier</option>
                      <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                        {{ worksite.name }}
                      </option>
                    </select>
                  </label>

                  <cfm-input
                    [(ngModel)]="invoiceForm.title"
                    name="invoiceTitle"
                    type="text"
                    label="Objet"
                    placeholder="Ex. Intervention de maintenance"
                    [disabled]="!canManageOrganization || invoiceSaving"
                  />

                  <cfm-input
                    [(ngModel)]="invoiceForm.issueDate"
                    name="invoiceIssueDate"
                    type="date"
                    label="Date"
                    [disabled]="!canManageOrganization || invoiceSaving"
                    required
                  />

                  <cfm-input
                    [(ngModel)]="invoiceForm.dueDate"
                    name="invoiceDueDate"
                    type="date"
                    label="Échéance"
                    [disabled]="!canManageOrganization || invoiceSaving"
                  />

                  <label class="field">
                    <span>Statut</span>
                    <select
                      [(ngModel)]="invoiceForm.status"
                      name="invoiceStatus"
                      [disabled]="!canManageOrganization || invoiceSaving"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="issued">Émise</option>
                    </select>
                  </label>

                  <label class="field field-wide">
                    <span>Note courte</span>
                    <textarea
                      [(ngModel)]="invoiceForm.notes"
                      name="invoiceNotes"
                      rows="3"
                      placeholder="Ex. information utile visible dans l'outil"
                      [disabled]="!canManageOrganization || invoiceSaving"
                    ></textarea>
                  </label>

                  <div class="billing-lines field-wide">
                    <div class="billing-line-header">
                      <h3>Lignes de la facture</h3>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="!canManageOrganization || invoiceSaving"
                        (click)="addInvoiceLine()"
                      >
                        Ajouter une ligne
                      </cfm-button>
                    </div>

                    <div class="billing-line-editor" *ngFor="let line of invoiceForm.lines; let lineIndex = index">
                      <cfm-input
                        [(ngModel)]="line.description"
                        [name]="'invoiceLineDescription' + lineIndex"
                        type="text"
                        label="Description"
                        placeholder="Ex. Dépannage sur site"
                        [disabled]="!canManageOrganization || invoiceSaving"
                      />
                      <cfm-input
                        [(ngModel)]="line.quantity"
                        [name]="'invoiceLineQuantity' + lineIndex"
                        type="text"
                        label="Quantité"
                        placeholder="1"
                        [disabled]="!canManageOrganization || invoiceSaving"
                      />
                      <cfm-input
                        [(ngModel)]="line.unitPrice"
                        [name]="'invoiceLineUnitPrice' + lineIndex"
                        type="text"
                        label="Prix unitaire TTC (€)"
                        placeholder="120"
                        [disabled]="!canManageOrganization || invoiceSaving"
                      />
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="!canManageOrganization || invoiceSaving"
                        (click)="removeInvoiceLine(lineIndex)"
                      >
                        Retirer
                      </cfm-button>
                    </div>
                  </div>

                  <p class="small field-wide">Total estimé : {{ formatAmountCents(invoiceFormTotalCents) }}</p>

                  <div class="form-actions">
                    <cfm-button
                      type="submit"
                      [disabled]="!canManageOrganization || invoiceSaving || !canCreateInvoice"
                    >
                      {{ invoiceSaving ? "Ajout en cours" : "Créer la facture" }}
                    </cfm-button>
                    <cfm-button
                      *ngIf="hasInvoiceDraft"
                      type="button"
                      variant="secondary"
                      [disabled]="invoiceSaving"
                      (click)="discardInvoiceDraft()"
                    >
                      Effacer la saisie
                    </cfm-button>
                  </div>
                </form>
              </ng-container>

              <ng-template #noCustomersForInvoices>
                <cfm-empty-state
                  title="Ajoutez d'abord un client"
                  description="La facture simple apparait dès qu'un premier client est disponible."
                />
              </ng-template>

              <ul class="billing-list" *ngIf="invoices.length > 0; else emptyInvoices">
                <li *ngFor="let invoice of invoices">
                  <div class="duerp-copy">
                    <div class="site-heading">
                      <strong>{{ invoice.title || ('Facture du ' + (invoice.issue_date | date:'shortDate')) }}</strong>
                      <div class="chips">
                        <cfm-status-chip [label]="getInvoiceStatusLabel(invoice.status)" [tone]="getInvoiceStatusTone(invoice.status)" />
                        <cfm-status-chip
                          [label]="getBillingFollowUpStatusLabel(invoice.follow_up_status)"
                          [tone]="getBillingFollowUpStatusTone(invoice.follow_up_status)"
                        />
                        <cfm-status-chip [label]="invoice.customer_name" tone="calm" />
                      </div>
                    </div>
                    <span *ngIf="invoice.worksite_name">Chantier : {{ invoice.worksite_name }}</span>
                    <span>Numéro : {{ invoice.number }}</span>
                    <span>Émise le {{ invoice.issue_date | date:'shortDate' }}</span>
                    <span *ngIf="invoice.due_date">Échéance : {{ invoice.due_date | date:'shortDate' }}</span>
                    <span>{{ invoice.line_items.length }} ligne{{ invoice.line_items.length > 1 ? "s" : "" }}</span>
                    <span>Total : {{ formatAmountCents(invoice.total_amount_cents, invoice.currency) }}</span>
                    <span *ngIf="invoice.paid_amount_cents > 0">
                      Réglé : {{ formatAmountCents(invoice.paid_amount_cents, invoice.currency) }}
                    </span>
                    <span *ngIf="invoice.outstanding_amount_cents > 0">
                      Reste dû : {{ formatAmountCents(invoice.outstanding_amount_cents, invoice.currency) }}
                    </span>
                    <span *ngIf="invoice.paid_at">Payée le {{ invoice.paid_at | date:'shortDate' }}</span>
                    <span *ngIf="invoice.notes">{{ invoice.notes }}</span>
                  </div>

                  <div class="billing-item-actions" *ngIf="canManageOrganization || canReadOrganization">
                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Chantier</span>
                      <select
                        [ngModel]="invoice.worksite_id ?? ''"
                        [name]="'invoiceWorksiteEdit' + invoice.id"
                        [disabled]="invoiceWorksiteBusyId === invoice.id"
                        (ngModelChange)="changeInvoiceWorksite(invoice, $event)"
                      >
                        <option value="">Aucun chantier</option>
                        <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                          {{ worksite.name }}
                        </option>
                      </select>
                    </label>

                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Statut</span>
                      <select
                        [ngModel]="invoice.status === 'draft' ? 'draft' : 'issued'"
                        [name]="'invoiceStatusEdit' + invoice.id"
                        [disabled]="invoiceStatusBusyId === invoice.id || invoice.status === 'paid'"
                        (ngModelChange)="changeInvoiceStatus(invoice, $event)"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="issued">Émise</option>
                      </select>
                    </label>

                    <label class="field compact-field" *ngIf="canManageOrganization">
                      <span>Suivi</span>
                      <select
                        [ngModel]="invoice.follow_up_status"
                        [name]="'invoiceFollowUpEdit' + invoice.id"
                        [disabled]="invoiceFollowUpBusyId === invoice.id"
                        (ngModelChange)="changeInvoiceFollowUpStatus(invoice, $event)"
                      >
                        <option value="normal">Suivi normal</option>
                        <option value="to_follow_up">À relancer</option>
                        <option value="followed_up">Relancé</option>
                        <option value="waiting_customer">En attente client</option>
                      </select>
                    </label>

                    <cfm-button
                      *ngIf="canManageOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="invoiceEditingSaving"
                      (click)="invoiceEditingId === invoice.id ? cancelInvoiceEditing() : startEditingInvoice(invoice)"
                    >
                      {{ invoiceEditingId === invoice.id ? "Annuler la modification" : "Modifier" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canManageOrganization && invoice.status !== 'paid'"
                      type="button"
                      variant="secondary"
                      [disabled]="invoicePaymentBusyId === invoice.id"
                      (click)="invoicePaymentId === invoice.id ? cancelInvoicePayment() : openInvoicePayment(invoice)"
                    >
                      {{ invoicePaymentId === invoice.id ? "Annuler le paiement" : "Enregistrer un paiement" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="invoicePdfBusyId === invoice.id"
                      (click)="exportInvoicePdf(invoice)"
                    >
                      {{ invoicePdfBusyId === invoice.id ? "Génération en cours" : "Exporter le PDF" }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="canReadOrganization"
                      type="button"
                      variant="secondary"
                      [disabled]="invoiceHistoryBusyId === invoice.id"
                      (click)="toggleInvoiceHistory(invoice)"
                    >
                      {{
                        invoiceHistoryBusyId === invoice.id
                          ? "Chargement en cours"
                          : (invoiceHistoryOpenId === invoice.id ? "Masquer l'historique" : "Voir l'historique")
                      }}
                    </cfm-button>

                    <form
                      class="payment-form"
                      *ngIf="invoicePaymentId === invoice.id"
                      (ngSubmit)="saveInvoicePayment(invoice)"
                    >
                      <cfm-input
                        [(ngModel)]="invoicePaymentForm.paidAmount"
                        [name]="'invoicePaidAmount' + invoice.id"
                        type="text"
                        label="Montant payé (€)"
                        placeholder="Ex. 1200"
                        [disabled]="invoicePaymentBusyId === invoice.id"
                        required
                      />

                      <cfm-input
                        [(ngModel)]="invoicePaymentForm.paidAt"
                        [name]="'invoicePaidAt' + invoice.id"
                        type="date"
                        label="Date de paiement"
                        [disabled]="invoicePaymentBusyId === invoice.id"
                        required
                      />

                      <div class="inline-actions">
                        <cfm-button
                          type="submit"
                          [disabled]="invoicePaymentBusyId === invoice.id || !canSaveInvoicePayment(invoice)"
                        >
                          {{ invoicePaymentBusyId === invoice.id ? "Enregistrement en cours" : "Valider le paiement" }}
                        </cfm-button>
                      </div>
                    </form>
                  </div>

                  <div class="billing-history" *ngIf="invoiceHistoryOpenId === invoice.id">
                    <p class="small">Principaux événements</p>

                    <ul class="history-list" *ngIf="getInvoiceHistory(invoice.id).length > 0; else emptyInvoiceHistory">
                      <li *ngFor="let log of getInvoiceHistory(invoice.id)">
                        <div class="history-copy">
                          <strong>{{ getBillingHistoryLabel(log) }}</strong>
                          <span>{{ log.occurred_at | date:'short' }}</span>
                          <span>{{ getBillingHistoryMeta(log) }}</span>
                        </div>
                      </li>
                    </ul>

                    <ng-template #emptyInvoiceHistory>
                      <cfm-empty-state
                        title="Aucun événement à afficher"
                        description="L'historique simple de la facture apparaitra ici dès qu'une action utile sera tracée."
                      />
                    </ng-template>
                  </div>

                  <form class="billing-form" *ngIf="invoiceEditingId === invoice.id" (ngSubmit)="saveInvoiceEdit(invoice)">
                    <label class="field">
                      <span>Client</span>
                      <select
                        [(ngModel)]="invoiceEditForm.customerId"
                        [name]="'invoiceEditCustomerId' + invoice.id"
                        [disabled]="invoiceEditingSaving"
                        required
                      >
                        <option value="">Choisir</option>
                        <option *ngFor="let customer of billingCustomers" [value]="customer.id">
                          {{ customer.name }}
                        </option>
                      </select>
                    </label>

                    <label class="field">
                      <span>Chantier lié</span>
                      <select
                        [(ngModel)]="invoiceEditForm.worksiteId"
                        [name]="'invoiceEditWorksiteId' + invoice.id"
                        [disabled]="invoiceEditingSaving"
                      >
                        <option value="">Aucun chantier</option>
                        <option *ngFor="let worksite of billingWorksites" [value]="worksite.id">
                          {{ worksite.name }}
                        </option>
                      </select>
                    </label>

                    <cfm-input
                      [(ngModel)]="invoiceEditForm.title"
                      [name]="'invoiceEditTitle' + invoice.id"
                      type="text"
                      label="Objet"
                      placeholder="Ex. Intervention ou prestation"
                      [disabled]="invoiceEditingSaving"
                    />

                    <cfm-input
                      [(ngModel)]="invoiceEditForm.issueDate"
                      [name]="'invoiceEditIssueDate' + invoice.id"
                      type="date"
                      label="Date"
                      [disabled]="invoiceEditingSaving"
                      required
                    />

                    <cfm-input
                      [(ngModel)]="invoiceEditForm.dueDate"
                      [name]="'invoiceEditDueDate' + invoice.id"
                      type="date"
                      label="Échéance"
                      [disabled]="invoiceEditingSaving"
                    />

                    <label class="field field-wide">
                      <span>Note courte</span>
                      <textarea
                        [(ngModel)]="invoiceEditForm.notes"
                        [name]="'invoiceEditNotes' + invoice.id"
                        rows="3"
                        placeholder="Ex. précision utile pour la facture"
                        [disabled]="invoiceEditingSaving"
                      ></textarea>
                    </label>

                    <div class="billing-lines field-wide">
                      <div class="billing-line-header">
                        <h3>Lignes de la facture</h3>
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="invoiceEditingSaving"
                          (click)="addInvoiceEditLine()"
                        >
                          Ajouter une ligne
                        </cfm-button>
                      </div>

                      <div class="billing-line-editor" *ngFor="let line of invoiceEditForm.lines; let lineIndex = index">
                        <cfm-input
                          [(ngModel)]="line.description"
                          [name]="'invoiceEditLineDescription' + invoice.id + '-' + lineIndex"
                          type="text"
                          label="Description"
                          placeholder="Ex. Intervention"
                          [disabled]="invoiceEditingSaving"
                        />
                        <cfm-input
                          [(ngModel)]="line.quantity"
                          [name]="'invoiceEditLineQuantity' + invoice.id + '-' + lineIndex"
                          type="text"
                          label="Quantité"
                          placeholder="1"
                          [disabled]="invoiceEditingSaving"
                        />
                        <cfm-input
                          [(ngModel)]="line.unitPrice"
                          [name]="'invoiceEditLineUnitPrice' + invoice.id + '-' + lineIndex"
                          type="text"
                          label="Prix unitaire TTC (€)"
                          placeholder="120"
                          [disabled]="invoiceEditingSaving"
                        />
                        <cfm-button
                          type="button"
                          variant="secondary"
                          [disabled]="invoiceEditingSaving"
                          (click)="removeInvoiceEditLine(lineIndex)"
                        >
                          Retirer
                        </cfm-button>
                      </div>
                    </div>

                    <p class="small field-wide">
                      Total recalculé : {{ formatAmountCents(invoiceEditFormTotalCents) }}
                    </p>

                    <div class="form-actions inline-actions">
                      <cfm-button
                        type="submit"
                        [disabled]="invoiceEditingSaving || !canSaveInvoiceEdit"
                      >
                        {{ invoiceEditingSaving ? "Enregistrement en cours" : "Enregistrer les modifications" }}
                      </cfm-button>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        [disabled]="invoiceEditingSaving"
                        (click)="cancelInvoiceEditing()"
                      >
                        Annuler
                      </cfm-button>
                    </div>
                  </form>
                </li>
              </ul>

              <ng-template #emptyInvoices>
                <cfm-empty-state
                  title="Aucune facture pour le moment"
                  description="Créez une première facture simple à partir d'un client déjà enregistré."
                />
              </ng-template>
            </cfm-card>
          </ng-container>
          </ng-template>

          <ng-template #coordinationPageTemplate>
            <cfm-card
              *ngIf="shouldShowWorkspaceContent && currentMembership"
              class="desktop-card"
              eyebrow="Coordination"
              title="À traiter"
              description="Une lecture simple des chantiers et documents encore ouverts, avec filtres légers par suivi et affectation."
            >
              <section class="dashboard-actions">
                <div class="dashboard-actions-header">
                  <div class="dashboard-action-copy">
                    <h3>Coordination légère</h3>
                    <p class="small">
                      Retrouvez vite ce qui reste à faire sans ouvrir un gestionnaire de tâches complet.
                    </p>
                  </div>

                  <cfm-status-chip
                    [label]="coordinationTodoCountLabel"
                    [tone]="coordinationTodoItems.length > 0 ? 'progress' : 'success'"
                  />
                </div>

                <ng-container *ngIf="isChantierEnabled; else standaloneCoordinationDisabled">
                  <div class="inline-actions">
                    <label class="compact-field">
                      <span class="small">Suivi</span>
                      <select [(ngModel)]="selectedCoordinationStatusFilter" name="coordinationPageStatusFilter">
                        <option value="all">Tous les suivis</option>
                        <option value="todo">À faire</option>
                        <option value="in_progress">En cours</option>
                        <option value="done">Fait</option>
                      </select>
                    </label>

                    <label class="compact-field">
                      <span class="small">Affectation</span>
                      <select [(ngModel)]="selectedCoordinationAssigneeFilter" name="coordinationPageAssigneeFilter">
                        <option value="all">Toutes les affectations</option>
                        <option value="unassigned">Non affecté</option>
                        <option *ngFor="let assignee of worksiteAssignees" [value]="assignee.user_id">
                          {{ getWorksiteAssigneeOptionLabel(assignee) }}
                        </option>
                      </select>
                    </label>

                    <cfm-button
                      *ngIf="hasActiveCoordinationFilters"
                      type="button"
                      variant="secondary"
                      (click)="resetCoordinationFilters()"
                    >
                      Réinitialiser les filtres
                    </cfm-button>
                  </div>

                  <ul class="alert-list" *ngIf="coordinationTodoItems.length > 0; else emptyStandaloneCoordinationTodo">
                    <li *ngFor="let item of coordinationTodoItems">
                      <div class="dashboard-alert-copy">
                        <strong>{{ item.title }}</strong>
                        <span>{{ item.description }}</span>
                        <span *ngIf="item.context">{{ item.context }}</span>
                      </div>

                      <div class="billing-item-actions">
                        <div class="chips">
                          <cfm-status-chip [label]="item.kindLabel" [tone]="item.kindTone" />
                          <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                        </div>

                        <cfm-button
                          type="button"
                          variant="secondary"
                          (click)="openCoordinationTodoItem(item)"
                        >
                          {{ item.kind === "worksite" ? "Voir le chantier" : "Voir le document" }}
                        </cfm-button>
                      </div>
                    </li>
                  </ul>

                  <ng-template #emptyStandaloneCoordinationTodo>
                    <p class="small">
                      {{
                        hasActiveCoordinationFilters
                          ? "Aucun élément coordonné ne correspond aux filtres."
                          : "Aucun chantier ni document coordonné à traiter pour le moment."
                      }}
                    </p>
                  </ng-template>
                </ng-container>

                <ng-template #standaloneCoordinationDisabled>
                  <cfm-empty-state
                    title="Module Chantier non activé"
                    description="Activez le module Chantier pour utiliser cette vue de coordination."
                  />
                </ng-template>
              </section>
            </cfm-card>
          </ng-template>

          <ng-template #chantierPageTemplate>
            <cfm-card
              *ngIf="shouldShowWorkspaceContent && currentMembership"
              class="desktop-card"
              eyebrow="Chantier"
              title="Vue chantier"
              description="Une lecture plus directe des chantiers, de leurs signaux et des actions utiles sans passer par le cockpit global."
            >
              <section class="dashboard-actions" id="worksite-overview-section">
                <div class="dashboard-actions-header">
                  <div class="dashboard-action-copy">
                    <h3>Chantiers</h3>
                    <p class="small">
                      Les chantiers ressortent avec leur statut général, leurs signaux simples et les actions utiles.
                    </p>
                  </div>

                  <cfm-status-chip
                    [label]="worksiteOverviewCountLabel"
                    [tone]="filteredDashboardWorksiteOverviewItems.length > 0 ? 'calm' : 'neutral'"
                  />
                </div>

                <ng-container *ngIf="isChantierEnabled; else standaloneWorksiteDisabled">
                  <ul class="alert-list" *ngIf="filteredDashboardWorksiteOverviewItems.length > 0; else emptyStandaloneWorksiteOverview">
                    <li *ngFor="let item of filteredDashboardWorksiteOverviewItems">
                      <div class="dashboard-alert-copy">
                        <strong>{{ item.name }}</strong>
                        <span>{{ item.summary }}</span>
                        <span>{{ item.operationalSummary }}</span>
                        <span>{{ item.taskSummary }}</span>
                        <span>
                          Coordination : {{ item.coordination.statusLabel }} · {{ item.coordination.assigneeLabel }}
                        </span>
                        <span *ngIf="item.coordination.commentText">{{ item.coordination.commentSummary }}</span>
                        <span *ngIf="item.coordination.updatedAtLabel">
                          Dernier suivi : {{ item.coordination.updatedAtLabel }}
                        </span>
                        <span>{{ item.linkedWorksiteDocumentsSummary }}</span>
                        <span>{{ item.linkedQuotesSummary }}</span>
                        <span>{{ item.linkedInvoicesSummary }}</span>
                        <span *ngIf="item.financialSummary">{{ item.financialSummary }}</span>
                      </div>

                      <div class="billing-item-actions">
                        <div class="chips">
                          <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                          <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
                        </div>

                        <cfm-button
                          *ngIf="canManageOrganization && isFacturationEnabled && billingCustomers.length > 0"
                          type="button"
                          variant="secondary"
                          (click)="prepareQuoteFromWorksite(item.id)"
                        >
                          Préparer un devis
                        </cfm-button>

                        <cfm-button
                          *ngIf="canManageOrganization && isFacturationEnabled && billingCustomers.length > 0"
                          type="button"
                          variant="secondary"
                          (click)="prepareInvoiceFromWorksite(item.id)"
                        >
                          Préparer une facture
                        </cfm-button>

                        <cfm-button
                          *ngIf="canReadOrganization"
                          type="button"
                          variant="secondary"
                          [disabled]="worksiteDocumentPdfBusyId === item.id"
                          (click)="exportWorksiteSummaryPdf(item.id)"
                        >
                          {{ worksiteDocumentPdfBusyId === item.id ? "Génération en cours" : "Fiche chantier PDF" }}
                        </cfm-button>

                        <cfm-button
                          *ngIf="canReadOrganization"
                          type="button"
                          variant="secondary"
                          [disabled]="worksitePreventionPlanPdfBusyId === item.id"
                          (click)="toggleWorksitePreventionPlanEditor(item.id)"
                        >
                          {{
                            worksitePreventionPlanEditingId === item.id
                              ? "Fermer le plan"
                              : "Ajuster le plan"
                          }}
                        </cfm-button>

                        <cfm-button
                          *ngIf="item.worksiteDocumentsCount > 0"
                          type="button"
                          variant="secondary"
                          (click)="focusWorksiteDocuments(item.id)"
                        >
                          Voir les documents
                        </cfm-button>

                        <cfm-button
                          *ngIf="canReadOrganization"
                          type="button"
                          variant="secondary"
                          (click)="toggleWorksiteCoordination(item.id)"
                        >
                          {{
                            selectedWorksiteCoordinationId === item.id
                              ? "Masquer la coordination"
                              : "Coordination simple"
                          }}
                        </cfm-button>
                      </div>

                      <section class="document-linked-panel" *ngIf="selectedWorksiteCoordinationId === item.id">
                        <div class="detail-grid">
                          <div class="detail-block">
                            <span class="small">Suivi</span>
                            <strong>{{ item.coordination.statusLabel }}</strong>
                            <cfm-status-chip
                              [label]="item.coordination.statusLabel"
                              [tone]="item.coordination.statusTone"
                            />
                          </div>

                          <div class="detail-block">
                            <span class="small">Affectation</span>
                            <strong>{{ item.coordination.assigneeLabel }}</strong>
                            <span *ngIf="item.coordination.updatedAtLabel">
                              Dernière mise à jour : {{ item.coordination.updatedAtLabel }}
                            </span>
                          </div>
                        </div>

                        <div class="detail-block">
                          <span class="small">Commentaire simple</span>
                          <span>
                            {{ item.coordination.commentText || "Aucun commentaire simple pour le moment." }}
                          </span>
                        </div>

                        <div class="detail-grid" *ngIf="canManageOrganization">
                          <label class="field compact-field">
                            <span>Suivi</span>
                            <select
                              [ngModel]="getWorksiteCoordinationDraft(item.id).status"
                              [name]="'worksiteStandaloneCoordinationStatus' + item.id"
                              [disabled]="worksiteCoordinationBusyId === item.id"
                              (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { status: $event })"
                            >
                              <option value="todo">À faire</option>
                              <option value="in_progress">En cours</option>
                              <option value="done">Fait</option>
                            </select>
                          </label>

                          <label
                            class="field compact-field"
                            *ngIf="worksiteAssignees.length > 0; else noStandaloneWorksiteAssignees"
                          >
                            <span>Affectation</span>
                            <select
                              [ngModel]="getWorksiteCoordinationDraft(item.id).assigneeUserId"
                              [name]="'worksiteStandaloneCoordinationAssignee' + item.id"
                              [disabled]="worksiteCoordinationBusyId === item.id"
                              (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { assigneeUserId: $event })"
                            >
                              <option value="">Non affecté</option>
                              <option *ngFor="let assignee of worksiteAssignees" [value]="assignee.user_id">
                                {{ getWorksiteAssigneeOptionLabel(assignee) }}
                              </option>
                            </select>
                          </label>

                          <ng-template #noStandaloneWorksiteAssignees>
                            <div class="detail-block">
                              <span class="small">Affectation</span>
                              <span>Aucun membre lisible pour affecter ce chantier.</span>
                            </div>
                          </ng-template>
                        </div>

                        <label class="field field-wide" *ngIf="canManageOrganization">
                          <span>Commentaire simple</span>
                          <textarea
                            [ngModel]="getWorksiteCoordinationDraft(item.id).commentText"
                            [name]="'worksiteStandaloneCoordinationComment' + item.id"
                            rows="3"
                            placeholder="Ex. appeler le client avant l'intervention"
                            [disabled]="worksiteCoordinationBusyId === item.id"
                            (ngModelChange)="updateWorksiteCoordinationDraft(item.id, { commentText: $event })"
                          ></textarea>
                        </label>

                        <div class="inline-actions" *ngIf="canManageOrganization">
                          <cfm-button
                            type="button"
                            [disabled]="worksiteCoordinationBusyId === item.id"
                            (click)="saveWorksiteCoordination(item)"
                          >
                            {{
                              worksiteCoordinationBusyId === item.id
                                ? "Enregistrement en cours"
                                : "Enregistrer"
                            }}
                          </cfm-button>
                        </div>
                      </section>
                    </li>
                  </ul>

                  <ng-template #emptyStandaloneWorksiteOverview>
                    <p class="small">
                      {{
                        hasActiveCoordinationFilters
                          ? "Aucun chantier ne correspond aux filtres de coordination."
                          : "Aucun chantier à afficher pour le moment."
                      }}
                    </p>
                  </ng-template>
                </ng-container>

                <ng-template #standaloneWorksiteDisabled>
                  <cfm-empty-state
                    title="Module Chantier non activé"
                    description="Activez le module Chantier pour afficher les chantiers dans cette vue."
                  />
                </ng-template>
              </section>
            </cfm-card>
          </ng-template>

    
  `, styles: ["\n      :host {\n        display: block;\n        min-height: 100vh;\n      }\n\n      .shell {\n        min-height: 100vh;\n        display: grid;\n        place-items: center;\n        padding: 2rem;\n        background:\n          radial-gradient(circle at top, rgba(245, 188, 88, 0.16), transparent 22%),\n          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);\n      }\n\n      .shell-workspace {\n        place-items: start center;\n        background:\n          radial-gradient(circle at top left, rgba(201, 224, 215, 0.58), transparent 28%),\n          radial-gradient(circle at top right, rgba(245, 188, 88, 0.2), transparent 24%),\n          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);\n      }\n\n      .workspace {\n        width: min(1240px, 100%);\n        display: grid;\n        gap: 1.25rem;\n        padding-bottom: 2.2rem;\n      }\n\n      .app-shell {\n        align-content: start;\n      }\n\n      .workspace-overview-bar,\n      .workspace-main-column,\n      .workspace-context-copy {\n        display: grid;\n        min-width: 0;\n      }\n\n      .workspace-overview-bar {\n        grid-template-columns: minmax(220px, auto) minmax(0, 1fr);\n        gap: 0.9rem;\n        align-items: start;\n      }\n\n      .workspace-main-column {\n        gap: 0.85rem;\n      }\n\n      .workspace-context-panel {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: space-between;\n        align-items: flex-start;\n        gap: 0.9rem;\n        min-width: 0;\n        padding: 0.88rem 1rem;\n        border-radius: 22px;\n        border: 1px solid rgba(137, 160, 149, 0.12);\n        background:\n          linear-gradient(180deg, rgba(252, 253, 252, 0.94), rgba(244, 248, 246, 0.94));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.88),\n          0 10px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .workspace-context-copy {\n        gap: 0.26rem;\n      }\n\n      .workspace-context-kicker {\n        margin: 0;\n      }\n\n      .workspace-context-title {\n        font-size: 1.02rem;\n        line-height: 1.2;\n        color: var(--cfm-color-ink);\n      }\n\n      .workspace-context-chips {\n        align-items: flex-start;\n      }\n\n      .workspace-body,\n      .workspace-page {\n        display: grid;\n        gap: 1.4rem;\n      }\n\n      .workspace-content-surface {\n        align-content: start;\n      }\n\n      .workspace-feedback-stack {\n        width: min(1240px, 100%);\n        display: grid;\n        gap: 0.55rem;\n        align-content: start;\n      }\n\n      .desktop-card {\n        width: min(1240px, 100%);\n        position: relative;\n        isolation: isolate;\n      }\n\n      .auth-form,\n      .modules,\n      .session-header,\n      .session-actions,\n      .organization-switch,\n      .customer-form,\n      .billing-form,\n      .profile-form,\n      .site-form,\n      .duerp-form,\n      .evidence-form {\n        display: grid;\n      }\n\n      h2,\n      h3,\n      p {\n        margin: 0;\n      }\n\n      h2 {\n        font-size: 1.75rem;\n        color: var(--cfm-color-ink);\n      }\n\n      h3 {\n        font-size: 1rem;\n        color: var(--cfm-color-ink);\n      }\n\n      .auth-form,\n      .customer-form,\n      .billing-form,\n      .profile-form,\n      .site-form,\n      .building-safety-form,\n      .duerp-form,\n      .evidence-form {\n        gap: 1rem;\n      }\n\n      .meta,\n      .small,\n      .modules p,\n      .feedback,\n      .organization-switch span,\n      .field span,\n      .customer-copy span,\n      .site-copy span,\n      .building-safety-copy span,\n      .duerp-copy span,\n      .obligation-copy span {\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .organization-switch,\n      .field {\n        gap: 0.35rem;\n        width: 100%;\n      }\n\n      .field {\n        display: grid;\n      }\n\n      .field span {\n        font-weight: 600;\n        letter-spacing: 0.01em;\n      }\n\n      .field-wide {\n        grid-column: 1 / -1;\n      }\n\n      select,\n      textarea {\n        width: 100%;\n        box-sizing: border-box;\n        border: 1px solid var(--cfm-color-border);\n        border-radius: var(--cfm-radius-field);\n        padding: 0.85rem 1rem;\n        font: inherit;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 252, 0.94));\n        color: var(--cfm-color-ink);\n        transition:\n          border-color 0.18s ease,\n          box-shadow 0.18s ease,\n          background-color 0.18s ease,\n          transform 0.18s ease;\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 10px 22px rgba(18, 33, 42, 0.04);\n      }\n\n      textarea {\n        resize: vertical;\n        min-height: 6.5rem;\n      }\n\n      select:focus,\n      textarea:focus {\n        outline: none;\n        border-color: #8ba79a;\n        background: #ffffff;\n        box-shadow:\n          0 0 0 4px rgba(139, 167, 154, 0.16),\n          0 14px 30px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(15, 23, 42, 0.03);\n        transform: translateY(-1px);\n      }\n\n      .session-header {\n        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\n        gap: 0.58rem;\n        align-items: start;\n      }\n\n      .session-actions {\n        gap: 0.55rem;\n        justify-items: end;\n        min-width: 0;\n      }\n\n      .workspace-shell-copy,\n      .workspace-shell-actions {\n        display: grid;\n        gap: 0.38rem;\n        min-width: 0;\n      }\n\n      .workspace-shell-meta {\n        font-weight: 500;\n        letter-spacing: 0.01em;\n        line-height: 1.25;\n      }\n\n      .app-nav {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.4rem;\n        min-width: 0;\n        margin-top: -0.24rem;\n        padding: 0.28rem 0.38rem 0.34rem;\n        border: 1px solid rgba(137, 160, 149, 0.12);\n        border-radius: 1rem;\n        background:\n          linear-gradient(180deg, rgba(252, 253, 252, 0.94), rgba(246, 249, 247, 0.97));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 4px 10px rgba(18, 33, 42, 0.028);\n      }\n\n      .regulatory-foundation-grid,\n      .regulatory-foundation-column {\n        display: grid;\n        min-width: 0;\n      }\n\n      .regulatory-foundation-grid {\n        grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);\n        gap: 1.15rem;\n        align-items: start;\n      }\n\n      .regulatory-foundation-column {\n        gap: 1.15rem;\n        align-content: start;\n      }\n\n      .app-nav-link {\n        display: inline-flex;\n        align-items: center;\n        min-width: 0;\n        padding: 0.18rem 0.22rem;\n        border-radius: 999px;\n        text-decoration: none;\n        opacity: 0.96;\n        transition:\n          transform 0.16s ease,\n          opacity 0.16s ease,\n          background-color 0.16s ease,\n          box-shadow 0.16s ease;\n      }\n\n      .app-nav-link:hover {\n        transform: translateY(-1px);\n        background: rgba(137, 160, 149, 0.09);\n      }\n\n      .app-nav-link.is-active {\n        transform: translateY(-1px);\n        background: rgba(255, 255, 255, 0.92);\n        box-shadow:\n          inset 0 0 0 1px rgba(137, 160, 149, 0.2),\n          0 6px 14px rgba(18, 33, 42, 0.04);\n      }\n\n      .nav-icon-placeholder {\n        display: none;\n      }\n\n      .meta,\n      .small {\n        margin-top: 0.16rem;\n      }\n\n      @media (max-width: 1280px) {\n        .session-header {\n          grid-template-columns: minmax(0, 1.18fr) minmax(280px, 0.82fr);\n          gap: 0.5rem;\n        }\n\n        .workspace-shell-copy,\n        .workspace-shell-actions {\n          gap: 0.32rem;\n        }\n\n        .session-actions {\n          gap: 0.46rem;\n        }\n      }\n\n      @media (max-width: 1180px) {\n        .workspace {\n          gap: 1.15rem;\n        }\n\n        .session-header {\n          grid-template-columns: minmax(0, 1fr);\n          gap: 0.44rem;\n        }\n\n        .session-actions {\n          justify-items: start;\n          gap: 0.42rem;\n        }\n\n        .workspace-shell-copy,\n        .workspace-shell-actions {\n          gap: 0.28rem;\n        }\n\n        .workspace-overview-bar,\n        .regulatory-foundation-grid {\n          grid-template-columns: 1fr;\n          gap: 1rem;\n        }\n\n        .regulatory-foundation-column {\n          gap: 1rem;\n        }\n\n        .app-nav {\n          margin-top: -0.18rem;\n          padding: 0.24rem 0.32rem 0.3rem;\n        }\n      }\n\n      @media (max-width: 820px) {\n        .workspace-context-panel {\n          padding: 0.8rem 0.88rem;\n        }\n\n        .app-nav {\n          gap: 0.3rem;\n          padding: 0.22rem 0.26rem 0.28rem;\n        }\n\n        .app-nav-link {\n          padding: 0.14rem 0.18rem;\n        }\n      }\n\n      .grid {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n        gap: 1rem;\n      }\n\n      article {\n        position: relative;\n        overflow: hidden;\n        padding: 1.3rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(247, 243, 234, 0.84)),\n          #f4f1ea;\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 36px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.8);\n        transition:\n          transform 0.18s ease,\n          box-shadow 0.18s ease,\n          border-color 0.18s ease;\n      }\n\n      article::before {\n        content: \"\";\n        position: absolute;\n        inset: 0 0 auto;\n        height: 3px;\n        background: linear-gradient(90deg, rgba(29, 109, 100, 0.88), rgba(245, 188, 88, 0.72));\n        opacity: 0.95;\n      }\n\n      article:hover {\n        transform: translateY(-2px);\n        box-shadow:\n          0 22px 44px rgba(18, 33, 42, 0.08),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n      }\n\n      .chips {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 0.5rem;\n      }\n\n      .stack-list,\n      .module-list,\n      .customer-list,\n      .site-list,\n      .obligation-list,\n      .alert-list,\n      .building-safety-list,\n      .billing-list,\n      .duerp-list,\n      .evidence-list {\n        list-style: none;\n        padding: 0;\n        margin: 0;\n      }\n\n      .stack-list,\n      .module-list,\n      .customer-list,\n      .site-list,\n      .obligation-list,\n      .alert-list,\n      .building-safety-list,\n      .billing-list,\n      .duerp-list,\n      .evidence-list {\n        display: grid;\n        gap: 0.85rem;\n      }\n\n      .stack-list li,\n      .module-list li,\n      .customer-list li,\n      .site-list li,\n      .alert-list li,\n      .building-safety-list li,\n      .billing-list li,\n      .duerp-list li,\n      .evidence-list li {\n        display: flex;\n        align-items: start;\n        justify-content: space-between;\n        gap: 1rem;\n        position: relative;\n        padding: 1.08rem 1.15rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 250, 249, 0.78));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 12px 24px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.8);\n        transition:\n          transform 0.18s ease,\n          box-shadow 0.18s ease,\n          border-color 0.18s ease;\n      }\n\n      .stack-list li:hover,\n      .module-list li:hover,\n      .customer-list li:hover,\n      .site-list li:hover,\n      .alert-list li:hover,\n      .building-safety-list li:hover,\n      .billing-list li:hover,\n      .duerp-list li:hover,\n      .evidence-list li:hover {\n        transform: translateY(-1px);\n        box-shadow:\n          0 16px 30px rgba(18, 33, 42, 0.07),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n        border-color: rgba(29, 109, 100, 0.14);\n      }\n\n      .list-copy,\n      .module-copy,\n      .customer-copy,\n      .site-copy,\n      .building-safety-copy,\n      .duerp-copy {\n        display: grid;\n        gap: 0.25rem;\n      }\n\n      .site-actions {\n        display: grid;\n        justify-items: end;\n        align-content: start;\n        gap: 0.6rem;\n        min-width: 13.5rem;\n      }\n\n      .site-enrichment {\n        display: grid;\n        gap: 0.28rem;\n        margin-top: 0.28rem;\n        min-width: 0;\n      }\n\n      .site-enrichment-header {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.5rem;\n      }\n\n      .site-enrichment-attempted,\n      .site-enrichment-reason,\n      .site-enrichment-meta {\n        font-size: 0.86rem;\n        line-height: 1.4;\n        color: rgba(23, 49, 43, 0.72);\n        overflow-wrap: break-word;\n      }\n\n      .site-enrichment-detail {\n        font-size: 0.92rem;\n        line-height: 1.45;\n        color: #17312b;\n      }\n\n      .obligation-copy {\n        display: grid;\n        gap: 0.45rem;\n        padding: 1.1rem 1.15rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(244, 246, 241, 0.96), rgba(255, 255, 255, 0.86));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .obligation-detail {\n        display: grid;\n        gap: 1rem;\n        margin-top: 1.25rem;\n        padding: 1.2rem 1.25rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(238, 243, 239, 0.96), rgba(255, 255, 255, 0.8));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 34px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.8);\n        animation: panelReveal 180ms ease;\n      }\n\n      .detail-grid {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 1rem;\n      }\n\n      .detail-block,\n      .detail-copy {\n        display: grid;\n        gap: 0.45rem;\n      }\n\n      .detail-block {\n        padding: 1.05rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(250, 252, 252, 0.74));\n        border: 1px solid rgba(15, 23, 42, 0.05);\n      }\n\n      .detail-list {\n        list-style: disc;\n        padding-left: 1.25rem;\n        margin: 0;\n        display: grid;\n        gap: 0.45rem;\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .detail-evidence-row {\n        display: flex;\n        justify-content: space-between;\n        align-items: start;\n        gap: 1rem;\n      }\n\n      .list-copy span {\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .modules {\n        gap: 1rem;\n        padding: 1.42rem 1.48rem;\n        border-radius: 28px;\n        background:\n          linear-gradient(180deg, rgba(245, 249, 249, 0.96), rgba(234, 241, 239, 0.94));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.82),\n          0 18px 40px rgba(18, 33, 42, 0.06);\n      }\n\n      .modules-header {\n        display: flex;\n        justify-content: space-between;\n        gap: 1rem;\n      }\n\n      .card-header-actions {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: space-between;\n        align-items: center;\n        gap: 1rem;\n      }\n\n      .regulatory-showcase-card {\n        overflow: hidden;\n      }\n\n      .regulatory-hero,\n      .regulatory-support-grid {\n        display: grid;\n        grid-template-columns: minmax(0, 2.2fr) minmax(280px, 1fr);\n        gap: 1.1rem;\n      }\n\n      .regulatory-hero-copy,\n      .regulatory-hero-copy-block,\n      .regulatory-score-card,\n      .regulatory-priority-card,\n      .regulatory-family-card,\n      .regulatory-support-block,\n      .regulatory-support-copy {\n        display: grid;\n      }\n\n      .regulatory-hero-copy,\n      .regulatory-score-card,\n      .regulatory-priority-card,\n      .regulatory-family-card,\n      .regulatory-support-block {\n        gap: 0.85rem;\n        padding: 1.12rem 1.18rem;\n        border-radius: 24px;\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 34px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n      }\n\n      .regulatory-hero-copy {\n        background:\n          linear-gradient(180deg, rgba(248, 251, 249, 0.96), rgba(255, 255, 255, 0.86));\n      }\n\n      .regulatory-score-card,\n      .regulatory-family-card,\n      .regulatory-support-block {\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(244, 248, 247, 0.82));\n      }\n\n      .regulatory-priority-card {\n        background:\n          linear-gradient(180deg, rgba(247, 249, 244, 0.96), rgba(255, 255, 255, 0.86));\n      }\n\n      .regulatory-showcase-chips {\n        margin-bottom: 0.2rem;\n      }\n\n      .regulatory-hero-copy-block {\n        gap: 0.45rem;\n        max-width: 64ch;\n      }\n\n      .regulatory-hero-copy-block h3,\n      .regulatory-priority-card h3,\n      .regulatory-support-block h3 {\n        margin: 0;\n        font-size: 1.28rem;\n        line-height: 1.15;\n        letter-spacing: -0.02em;\n      }\n\n      .regulatory-hero-copy-block p,\n      .regulatory-priority-card p,\n      .regulatory-family-card p,\n      .regulatory-support-block p {\n        margin: 0;\n      }\n\n      .regulatory-score-label {\n        color: rgba(23, 49, 43, 0.72);\n      }\n\n      .regulatory-score-value {\n        font-size: clamp(2.4rem, 5vw, 3.4rem);\n        line-height: 0.95;\n        letter-spacing: -0.05em;\n        color: var(--cfm-color-ink);\n      }\n\n      .regulatory-score-breakdown,\n      .regulatory-score-breakdown-copy {\n        display: grid;\n      }\n\n      .regulatory-score-breakdown {\n        gap: 0.6rem;\n        padding-top: 0.2rem;\n      }\n\n      .regulatory-score-breakdown-list {\n        list-style: none;\n        padding: 0;\n        margin: 0;\n        display: grid;\n        gap: 0.65rem;\n      }\n\n      .regulatory-score-breakdown-list li {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        gap: 0.8rem;\n        min-width: 0;\n        padding-top: 0.65rem;\n        border-top: 1px solid rgba(15, 23, 42, 0.08);\n      }\n\n      .regulatory-score-breakdown-copy {\n        gap: 0.16rem;\n        min-width: 0;\n      }\n\n      .regulatory-score-breakdown-copy span,\n      .regulatory-support-summary {\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .regulatory-priority-grid,\n      .regulatory-family-grid {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n        gap: 1rem;\n      }\n\n      .regulatory-family-count {\n        font-size: 1rem;\n        font-weight: 700;\n        color: #17312b;\n      }\n\n      .regulatory-family-highlights,\n      .regulatory-action-list,\n      .regulatory-proof-list {\n        list-style: none;\n        padding: 0;\n        margin: 0;\n        display: grid;\n      }\n\n      .regulatory-family-highlights {\n        gap: 0.6rem;\n      }\n\n      .regulatory-family-highlights li,\n      .regulatory-action-list li,\n      .regulatory-proof-list li {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        gap: 0.85rem;\n        min-width: 0;\n      }\n\n      .regulatory-family-highlights li {\n        padding-top: 0.65rem;\n        border-top: 1px solid rgba(15, 23, 42, 0.08);\n      }\n\n      .regulatory-action-list,\n      .regulatory-proof-list {\n        gap: 0.85rem;\n      }\n\n      .regulatory-action-list li,\n      .regulatory-proof-list li {\n        padding: 0.95rem 1rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 250, 249, 0.78));\n        border: 1px solid rgba(15, 23, 42, 0.05);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .regulatory-support-copy {\n        gap: 0.24rem;\n        min-width: 0;\n      }\n\n      .regulatory-support-summary {\n        margin: -0.1rem 0 0;\n      }\n\n      @media (max-width: 1080px) {\n        .regulatory-priority-grid,\n        .regulatory-family-grid {\n          grid-template-columns: repeat(2, minmax(0, 1fr));\n        }\n      }\n\n      .dashboard-grid {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));\n        gap: 1.05rem;\n        margin: 1.15rem 0 1.35rem;\n      }\n\n      .dashboard-kpi-card,\n      .dashboard-alert-copy {\n        display: grid;\n        gap: 0.35rem;\n      }\n\n      .dashboard-kpi-card {\n        position: relative;\n        overflow: hidden;\n        padding: 1.08rem 1.12rem 1.12rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 246, 241, 0.92));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 14px 28px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n      }\n\n      .dashboard-kpi-card::after {\n        content: \"\";\n        position: absolute;\n        inset: auto 0 0;\n        height: 48%;\n        background: linear-gradient(180deg, transparent, rgba(29, 109, 100, 0.06));\n        pointer-events: none;\n      }\n\n      .dashboard-module-highlights {\n        list-style: none;\n        padding: 0;\n        margin: 0.2rem 0 0;\n        display: grid;\n        gap: 0.55rem;\n      }\n\n      .dashboard-module-highlights li {\n        display: grid;\n        gap: 0.15rem;\n        padding-top: 0.55rem;\n        border-top: 1px solid rgba(15, 23, 42, 0.08);\n      }\n\n      .dashboard-kpi-value {\n        font-size: 2.15rem;\n        line-height: 0.96;\n        letter-spacing: -0.03em;\n        color: var(--cfm-color-ink);\n      }\n\n      .dashboard-alerts {\n        display: grid;\n        gap: 0.9rem;\n        padding: 1.08rem 1.15rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(246, 250, 249, 0.74));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 14px 28px rgba(18, 33, 42, 0.05);\n      }\n\n      .dashboard-actions {\n        display: grid;\n        gap: 0.9rem;\n        margin-top: 1.35rem;\n        padding: 1.08rem 1.15rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(246, 250, 249, 0.74));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 14px 28px rgba(18, 33, 42, 0.05);\n      }\n\n      .dashboard-actions-header {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: space-between;\n        align-items: end;\n        gap: 1rem;\n      }\n\n      .dashboard-action-copy {\n        display: grid;\n        gap: 0.35rem;\n      }\n\n      .dashboard-filter {\n        max-width: 240px;\n      }\n\n      .dashboard-alert-copy span {\n        line-height: 1.35;\n      }\n\n      .toggle {\n        display: inline-flex;\n        align-items: center;\n        gap: 0.65rem;\n      }\n\n      .toggle input {\n        width: auto;\n      }\n\n      .profile-form {\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n      }\n\n      .auth-form,\n      .customer-form,\n      .billing-form,\n      .profile-form,\n      .site-form,\n      .building-safety-form,\n      .duerp-form,\n      .evidence-form,\n      .feedback-capture-form {\n        padding: 1.1rem 1.15rem;\n        border-radius: 24px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(247, 250, 249, 0.82));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 14px 32px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n      }\n\n      .customer-form {\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        align-items: end;\n        margin: 1.25rem 0;\n      }\n\n      .site-form {\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        align-items: end;\n        margin-bottom: 1rem;\n      }\n\n      .billing-form,\n      .building-safety-form,\n      .duerp-form,\n      .evidence-form {\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        align-items: end;\n        margin: 1.25rem 0;\n      }\n\n      .billing-lines {\n        display: grid;\n        gap: 1rem;\n      }\n\n      .billing-line-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        gap: 1rem;\n      }\n\n      .billing-line-editor {\n        display: grid;\n        grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr)) auto;\n        align-items: end;\n        gap: 0.75rem;\n        padding: 1.02rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 250, 249, 0.76));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.05);\n      }\n\n      .form-actions {\n        display: flex;\n        align-items: end;\n      }\n\n      .inline-actions {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 0.8rem;\n      }\n\n      .billing-item-actions {\n        display: grid;\n        gap: 0.8rem;\n        justify-items: stretch;\n        align-content: start;\n        min-width: min(260px, 100%);\n        padding: 0.15rem;\n      }\n\n      .compact-field {\n        min-width: 180px;\n        padding: 0.85rem 0.95rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 250, 249, 0.76));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.8),\n          0 10px 22px rgba(18, 33, 42, 0.04);\n      }\n\n      .inline-choice-list {\n        display: grid;\n        gap: 0.5rem;\n        padding: 0.9rem 1rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 250, 249, 0.78));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .inline-choice {\n        display: flex;\n        align-items: center;\n        gap: 0.6rem;\n      }\n\n      .inline-choice input {\n        width: auto;\n      }\n\n      .document-linked-panel {\n        display: grid;\n        gap: 0.8rem;\n        padding: 1.05rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 245, 242, 0.82));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 34px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n        animation: panelReveal 180ms ease;\n      }\n\n      .payment-form {\n        display: grid;\n        gap: 0.75rem;\n        padding: 1rem;\n        border-radius: 20px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 250, 249, 0.76));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 24px rgba(18, 33, 42, 0.04);\n      }\n\n      .document-adjustment-form {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 0.85rem;\n        padding: 1.08rem;\n        margin-top: 0.9rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(239, 245, 242, 0.84));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 18px 38px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n        animation: panelReveal 180ms ease;\n      }\n\n      .document-preview,\n      .document-preview-header {\n        display: grid;\n        gap: 0.65rem;\n      }\n\n      .feedback-capture-form {\n        display: grid;\n        gap: 1rem;\n      }\n\n      .document-preview {\n        padding: 1.05rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(238, 243, 239, 0.96), rgba(255, 255, 255, 0.82));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow: 0 12px 28px rgba(18, 33, 42, 0.05);\n      }\n\n      .feedback-preview-text {\n        margin: 0;\n        white-space: pre-wrap;\n        word-break: break-word;\n        font: inherit;\n        color: var(--cfm-color-copy-muted);\n      }\n\n      .billing-history {\n        display: grid;\n        gap: 0.75rem;\n        padding: 1.04rem;\n        border-radius: 22px;\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 245, 242, 0.82));\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        box-shadow:\n          0 16px 34px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n        animation: panelReveal 180ms ease;\n      }\n\n      .history-list {\n        list-style: none;\n        padding: 0;\n        margin: 0;\n        display: grid;\n        gap: 0.75rem;\n      }\n\n      .history-copy {\n        display: grid;\n        gap: 0.2rem;\n      }\n\n      .history-list li {\n        padding: 0.9rem 0.95rem;\n        border-radius: 18px;\n        background: rgba(255, 255, 255, 0.72);\n        border: 1px solid rgba(15, 23, 42, 0.05);\n        box-shadow: 0 10px 22px rgba(18, 33, 42, 0.04);\n      }\n\n      .site-heading {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 0.75rem;\n      }\n\n      .obligation-heading {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: start;\n        justify-content: space-between;\n        gap: 0.75rem;\n      }\n\n      .criteria-chips {\n        margin: 1rem 0 1.2rem;\n      }\n\n      .building-safety-header {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: space-between;\n        align-items: end;\n        gap: 1rem;\n        margin-bottom: 1rem;\n      }\n\n      .feedback {\n        position: relative;\n        display: grid;\n        gap: 0.2rem;\n        margin-top: 1rem;\n        padding: 0.95rem 1rem 0.95rem 1.15rem;\n        border-radius: 20px;\n        border: 1px solid rgba(15, 23, 42, 0.06);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 250, 249, 0.84));\n        box-shadow:\n          0 14px 30px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.82);\n        animation: feedbackPulse 220ms ease;\n      }\n\n      .workspace-feedback-stack .feedback {\n        margin-top: 0;\n      }\n\n      .feedback::before {\n        content: \"\";\n        position: absolute;\n        left: 0.8rem;\n        top: 0.95rem;\n        bottom: 0.95rem;\n        width: 4px;\n        border-radius: 999px;\n        background: currentColor;\n        opacity: 0.24;\n      }\n\n      .feedback.error {\n        color: #8a2d2d;\n        border-color: rgba(138, 45, 45, 0.16);\n        background:\n          linear-gradient(180deg, rgba(254, 243, 241, 0.98), rgba(255, 255, 255, 0.88));\n      }\n\n      .feedback.success {\n        color: #1f6a47;\n        border-color: rgba(31, 106, 71, 0.16);\n        background:\n          linear-gradient(180deg, rgba(239, 250, 245, 0.98), rgba(255, 255, 255, 0.88));\n      }\n\n      .feedback.progress {\n        color: #7c5b20;\n        border-color: rgba(124, 91, 32, 0.18);\n        background:\n          linear-gradient(180deg, rgba(255, 247, 228, 0.98), rgba(255, 255, 255, 0.88));\n      }\n\n      .feedback-title,\n      .feedback-body {\n        margin: 0;\n      }\n\n      .feedback-title {\n        font-size: 0.84rem;\n        line-height: 1.2;\n        font-weight: 700;\n        letter-spacing: 0.01em;\n      }\n\n      .feedback-body {\n        line-height: 1.4;\n      }\n\n      .loading-state-card {\n        display: grid;\n        gap: 0.85rem;\n        padding: 0.15rem 0 0.2rem;\n      }\n\n      .loading-state-skeleton,\n      .loading-state-copy {\n        display: grid;\n      }\n\n      .loading-state-skeleton {\n        gap: 1rem;\n      }\n\n      .loading-state-hero,\n      .loading-state-grid span,\n      .loading-state-lines span {\n        display: block;\n        border-radius: 999px;\n        background:\n          linear-gradient(90deg, rgba(255, 255, 255, 0.72), rgba(232, 239, 237, 0.96), rgba(255, 255, 255, 0.72));\n        background-size: 220% 100%;\n        animation: skeletonPulse 1.35s ease-in-out infinite;\n      }\n\n      .loading-state-hero {\n        height: 1.1rem;\n        width: min(320px, 72%);\n      }\n\n      .loading-state-grid {\n        display: grid;\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        gap: 0.85rem;\n      }\n\n      .loading-state-grid span {\n        height: 5.6rem;\n        border-radius: 22px;\n      }\n\n      .loading-state-lines {\n        display: grid;\n        gap: 0.7rem;\n      }\n\n      .loading-state-lines span {\n        height: 0.95rem;\n      }\n\n      .loading-state-lines span:nth-child(2) {\n        width: 88%;\n      }\n\n      .loading-state-lines span:nth-child(3) {\n        width: 68%;\n      }\n\n      .loading-state-copy {\n        gap: 0.24rem;\n        max-width: 44ch;\n      }\n\n      .loading-state-label {\n        margin: 0;\n        font-size: 0.92rem;\n        line-height: 1.25;\n        font-weight: 650;\n        color: #17312b;\n      }\n\n      @keyframes skeletonPulse {\n        0% {\n          background-position: 100% 50%;\n        }\n\n        100% {\n          background-position: 0% 50%;\n        }\n      }\n\n      @keyframes panelReveal {\n        from {\n          opacity: 0;\n          transform: translateY(6px);\n        }\n\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n\n      @keyframes feedbackPulse {\n        from {\n          opacity: 0;\n          transform: translateY(4px);\n        }\n\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n\n      code {\n        font-family: \"SFMono-Regular\", \"Menlo\", monospace;\n        font-size: 0.92em;\n      }\n\n      @media (max-width: 900px) {\n        .profile-form,\n        .customer-form,\n        .billing-form,\n        .site-form,\n        .building-safety-form,\n        .duerp-form,\n        .evidence-form,\n        .regulatory-hero,\n        .regulatory-support-grid,\n        .regulatory-priority-grid,\n        .regulatory-family-grid,\n        .document-adjustment-form,\n        .billing-line-editor,\n        .detail-grid,\n        .loading-state-grid {\n          grid-template-columns: 1fr;\n        }\n\n        .session-actions {\n          justify-items: stretch;\n        }\n\n        .card-header-actions {\n          align-items: stretch;\n        }\n\n        .site-list li,\n        .customer-list li,\n        .building-safety-list li,\n        .billing-list li,\n        .duerp-list li,\n        .evidence-list li,\n        .detail-evidence-row,\n        .alert-list li,\n        .module-list li,\n        .stack-list li {\n          flex-direction: column;\n        }\n\n        .billing-item-actions {\n          min-width: 0;\n          width: 100%;\n        }\n\n        .regulatory-family-highlights li,\n        .regulatory-score-breakdown-list li,\n        .regulatory-action-list li,\n        .regulatory-proof-list li {\n          flex-direction: column;\n          align-items: start;\n        }\n\n        .site-actions {\n          width: 100%;\n          min-width: 0;\n          justify-items: stretch;\n        }\n      }\n    "] }]
    }], () => [], { homePageTemplateRef: [{
            type: ViewChild,
            args: ["homePageTemplate"]
        }], reglementationPageTemplateRef: [{
            type: ViewChild,
            args: ["reglementationPageTemplate"]
        }], chantierPageTemplateRef: [{
            type: ViewChild,
            args: ["chantierPageTemplate"]
        }], facturationPageTemplateRef: [{
            type: ViewChild,
            args: ["facturationPageTemplate"]
        }], coordinationPageTemplateRef: [{
            type: ViewChild,
            args: ["coordinationPageTemplate"]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AppComponent, { className: "AppComponent" }); })();
