import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CfmButtonComponent, CfmCardComponent, CfmEmptyStateComponent, CfmStatusChipComponent, } from "@conformeo/ui";
import { DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT } from "./desktop-worksite-documents-page-context";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_2_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 29);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const worksite_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", worksite_r4.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", worksite_r4.name, " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_2_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 14)(1, "span", 9);
    i0.ɵɵtext(2, "Chantier");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 28);
    i0.ɵɵtwoWayListener("ngModelChange", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_2_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r2.ctx.selectedWorksiteDocumentFilterId, $event) || (ctx_r2.ctx.selectedWorksiteDocumentFilterId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 16);
    i0.ɵɵtext(5, "Tous les chantiers");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_2_option_6_Template, 2, 2, "option", 25);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.ctx.selectedWorksiteDocumentFilterId);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r2.ctx.worksiteDocumentFilterOptions);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_3_option_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 29);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r6 = ctx.$implicit;
    i0.ɵɵproperty("value", option_r6.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", option_r6.label, " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_3_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 14)(1, "span", 9);
    i0.ɵɵtext(2, "Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 30);
    i0.ɵɵtwoWayListener("ngModelChange", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_3_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r2.ctx.selectedWorksiteDocumentTypeFilter, $event) || (ctx_r2.ctx.selectedWorksiteDocumentTypeFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(4, "option", 16);
    i0.ɵɵtext(5, "Tous les types");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_3_option_6_Template, 2, 2, "option", 25);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.ctx.selectedWorksiteDocumentTypeFilter);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r2.ctx.worksiteDocumentTypeFilterOptions);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_option_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 29);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const assignee_r7 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", assignee_r7.user_id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.ctx.getWorksiteAssigneeOptionLabel(assignee_r7), " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_cfm_button_35_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 31);
    i0.ɵɵlistener("click", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_cfm_button_35_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.ctx.resetWorksiteDocumentFilters()); });
    i0.ɵɵtext(1, " R\u00E9initialiser les filtres ");
    i0.ɵɵelementEnd();
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_ng_container_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtext(1);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u00B7 ", document_r10.fileSizeLabel, " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(document_r10.coordination.commentSummary);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re g\u00E9n\u00E9ration : ", document_r10.uploadedAtLabel, " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_15_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtext(1);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u00B7 ", document_r10.linkedSignatureDetail, " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵtemplate(2, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_15_ng_container_2_Template, 2, 1, "ng-container", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Signature li\u00E9e : ", document_r10.linkedSignatureLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.linkedSignatureDetail);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Preuves li\u00E9es : ", document_r10.linkedProofsSummary, " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(document_r10.notes);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_cfm_button_23_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 40);
    i0.ɵɵlistener("click", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_cfm_button_23_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const document_r10 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.ctx.downloadWorksiteDocument(document_r10)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r2.ctx.isWorksiteDocumentDownloadBusy(document_r10));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.ctx.isWorksiteDocumentDownloadBusy(document_r10) ? "T\u00E9l\u00E9chargement en cours" : ctx_r2.ctx.getWorksiteDocumentActionLabel(document_r10), " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_cfm_button_24_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 40);
    i0.ɵɵlistener("click", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_cfm_button_24_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const document_r10 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.ctx.toggleWorksitePreventionPlanEditor(document_r10.worksiteId)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r2.ctx.worksitePreventionPlanPdfBusyId === document_r10.worksiteId);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.ctx.worksitePreventionPlanEditingId === document_r10.worksiteId ? "Fermer l'ajustement" : "Ajuster le plan", " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Derni\u00E8re mise \u00E0 jour : ", document_r10.coordination.updatedAtLabel, " ");
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_div_19_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const signature_r13 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(signature_r13.detail);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_div_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 43)(1, "span", 9);
    i0.ɵɵtext(2, "Signature li\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(5, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_div_19_span_5_Template, 2, 1, "span", 35);
    i0.ɵɵelement(6, "cfm-status-chip", 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const signature_r13 = ctx.ngIf;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(signature_r13.label);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", signature_r13.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", signature_r13.statusLabel)("tone", signature_r13.statusTone);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ng_template_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 43)(1, "span", 9);
    i0.ɵɵtext(2, "Signature li\u00E9e");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Aucune signature li\u00E9e.");
    i0.ɵɵelementEnd()();
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ul_25_li_1_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const proof_r14 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(proof_r14.detail);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ul_25_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ul_25_li_1_span_3_Template, 2, 1, "span", 35);
    i0.ɵɵelement(4, "cfm-status-chip", 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const proof_r14 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(proof_r14.label);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", proof_r14.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", proof_r14.statusLabel)("tone", proof_r14.statusTone);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ul_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 46);
    i0.ɵɵtemplate(1, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ul_25_li_1_Template, 5, 4, "li", 33);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", document_r10.linkedProofs);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ng_template_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Aucune preuve li\u00E9e.");
    i0.ɵɵelementEnd();
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 41)(1, "div", 42)(2, "div", 43)(3, "span", 9);
    i0.ɵɵtext(4, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "cfm-status-chip", 10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 43)(9, "span", 9);
    i0.ɵɵtext(10, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "strong");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_span_13_Template, 2, 1, "span", 35);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 43)(15, "span", 9);
    i0.ɵɵtext(16, "Commentaire simple");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(19, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_div_19_Template, 7, 4, "div", 44)(20, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ng_template_20_Template, 5, 0, "ng-template", null, 2, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementStart(22, "div", 43)(23, "span", 9);
    i0.ɵɵtext(24, "Preuves li\u00E9es");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(25, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ul_25_Template, 2, 1, "ul", 45)(26, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_ng_template_26_Template, 2, 0, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const noStandaloneLinkedSignature_r15 = i0.ɵɵreference(21);
    const noStandaloneLinkedProofs_r16 = i0.ɵɵreference(27);
    const document_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(document_r10.coordination.statusLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", document_r10.coordination.statusLabel)("tone", document_r10.coordination.statusTone);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(document_r10.coordination.assigneeLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.coordination.updatedAtLabel);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", document_r10.coordination.commentText || "Aucun commentaire simple pour le moment.", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.linkedSignature)("ngIfElse", noStandaloneLinkedSignature_r15);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngIf", document_r10.linkedProofs.length > 0)("ngIfElse", noStandaloneLinkedProofs_r16);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "div", 34)(2, "strong");
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
    i0.ɵɵtemplate(10, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_ng_container_10_Template, 2, 1, "ng-container", 35);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_13_Template, 2, 1, "span", 35)(14, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_14_Template, 2, 1, "span", 35)(15, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_15_Template, 3, 2, "span", 35)(16, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_16_Template, 2, 1, "span", 35)(17, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_span_17_Template, 2, 1, "span", 35);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "div", 36)(19, "div", 37);
    i0.ɵɵelement(20, "cfm-status-chip", 10)(21, "cfm-status-chip", 10)(22, "cfm-status-chip", 10);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(23, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_cfm_button_23_Template, 2, 2, "cfm-button", 38)(24, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_cfm_button_24_Template, 2, 2, "cfm-button", 38);
    i0.ɵɵelementStart(25, "cfm-button", 31);
    i0.ɵɵlistener("click", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_Template_cfm_button_click_25_listener() { const document_r10 = i0.ɵɵrestoreView(_r9).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.ctx.toggleWorksiteDocumentDetails(document_r10.id)); });
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(27, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_section_27_Template, 28, 10, "section", 39);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const document_r10 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(document_r10.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", document_r10.worksiteName, " \u00B7 ", document_r10.fileName, "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(" Type : ", document_r10.typeLabel, " \u00B7 Pr\u00E9paration : ", document_r10.lifecycleStatusLabel, " \u00B7 ", document_r10.signatureStatusLabel, " \u00B7 ", document_r10.proofCountLabel, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" Fichier : ", document_r10.fileAvailabilityLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.fileSizeLabel);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" Coordination : ", document_r10.coordination.statusLabel, " \u00B7 ", document_r10.coordination.assigneeLabel, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.coordination.commentText);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.uploadedAtLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.linkedSignatureLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.linkedProofsSummary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", document_r10.notes);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", document_r10.lifecycleStatusLabel)("tone", document_r10.lifecycleStatusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", document_r10.technicalStatusLabel)("tone", document_r10.technicalStatusTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", document_r10.fileAvailabilityLabel)("tone", document_r10.fileAvailabilityTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.canReadOrganization);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.canAdjustWorksiteDocument(document_r10));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.ctx.selectedWorksiteDocumentDetailId === document_r10.id ? "Masquer les \u00E9l\u00E9ments li\u00E9s" : "Voir les \u00E9l\u00E9ments li\u00E9s", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.selectedWorksiteDocumentDetailId === document_r10.id);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 32);
    i0.ɵɵtemplate(1, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_li_1_Template, 28, 26, "li", 33);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r2.ctx.filteredWorksiteDocumentItems);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ng_template_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 47);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 12);
    i0.ɵɵtemplate(2, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_2_Template, 7, 2, "label", 13)(3, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_label_3_Template, 7, 2, "label", 13);
    i0.ɵɵelementStart(4, "label", 14)(5, "span", 9);
    i0.ɵɵtext(6, "Statut");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "select", 15);
    i0.ɵɵtwoWayListener("ngModelChange", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_Template_select_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.ctx.selectedWorksiteDocumentLifecycleFilter, $event) || (ctx_r2.ctx.selectedWorksiteDocumentLifecycleFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(8, "option", 16);
    i0.ɵɵtext(9, "Tous les statuts");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "option", 17);
    i0.ɵɵtext(11, "Brouillon");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "option", 18);
    i0.ɵɵtext(13, "Finalis\u00E9");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "label", 14)(15, "span", 9);
    i0.ɵɵtext(16, "Suivi");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "select", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_Template_select_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.ctx.selectedCoordinationStatusFilter, $event) || (ctx_r2.ctx.selectedCoordinationStatusFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(18, "option", 16);
    i0.ɵɵtext(19, "Tous les suivis");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "option", 20);
    i0.ɵɵtext(21, "\u00C0 faire");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "option", 21);
    i0.ɵɵtext(23, "En cours");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "option", 22);
    i0.ɵɵtext(25, "Fait");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "label", 14)(27, "span", 9);
    i0.ɵɵtext(28, "Affectation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "select", 23);
    i0.ɵɵtwoWayListener("ngModelChange", function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_Template_select_ngModelChange_29_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.ctx.selectedCoordinationAssigneeFilter, $event) || (ctx_r2.ctx.selectedCoordinationAssigneeFilter = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(30, "option", 16);
    i0.ɵɵtext(31, "Toutes les affectations");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "option", 24);
    i0.ɵɵtext(33, "Non affect\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(34, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_option_34_Template, 2, 2, "option", 25);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(35, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_cfm_button_35_Template, 2, 0, "cfm-button", 26);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(36, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ul_36_Template, 2, 1, "ul", 27)(37, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_ng_template_37_Template, 1, 0, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const emptyStandaloneWorksiteDocuments_r17 = i0.ɵɵreference(38);
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.worksiteDocumentFilterOptions.length > 1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.worksiteDocumentTypeFilterOptions.length > 1);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.ctx.selectedWorksiteDocumentLifecycleFilter);
    i0.ɵɵadvance(10);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.ctx.selectedCoordinationStatusFilter);
    i0.ɵɵadvance(12);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.ctx.selectedCoordinationAssigneeFilter);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngForOf", ctx_r2.ctx.worksiteAssignees);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.hasActiveWorksiteDocumentFilters);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.filteredWorksiteDocumentItems.length > 0)("ngIfElse", emptyStandaloneWorksiteDocuments_r17);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_template_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 48);
} }
function DesktopWorksiteDocumentsPageComponent_cfm_card_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "cfm-card", 5)(1, "section", 6)(2, "div", 7)(3, "div", 8)(4, "h3");
    i0.ɵɵtext(5, "Documents li\u00E9s aux chantiers");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 9);
    i0.ɵɵtext(7, " Filtrez par chantier, type, statut et suivi pour retrouver le bon document plus vite. ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(8, "cfm-status-chip", 10);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(9, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_container_9_Template, 39, 9, "ng-container", 11)(10, DesktopWorksiteDocumentsPageComponent_cfm_card_0_ng_template_10_Template, 1, 0, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const standaloneDocumentsDisabled_r18 = i0.ɵɵreference(11);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("label", ctx_r2.ctx.worksiteDocumentCountLabel)("tone", ctx_r2.ctx.filteredWorksiteDocumentItems.length > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r2.ctx.isChantierEnabled)("ngIfElse", standaloneDocumentsDisabled_r18);
} }
export class DesktopWorksiteDocumentsPageComponent {
    ctx = inject(DESKTOP_WORKSITE_DOCUMENTS_PAGE_CONTEXT);
    static ɵfac = function DesktopWorksiteDocumentsPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DesktopWorksiteDocumentsPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DesktopWorksiteDocumentsPageComponent, selectors: [["cfm-desktop-worksite-documents-page"]], standalone: true, features: [i0.ɵɵStandaloneFeature], decls: 1, vars: 1, consts: [["standaloneDocumentsDisabled", ""], ["emptyStandaloneWorksiteDocuments", ""], ["noStandaloneLinkedSignature", ""], ["noStandaloneLinkedProofs", ""], ["class", "desktop-card", "eyebrow", "Documents chantier", "title", "Documents chantier", "description", "Une vue d\u00E9di\u00E9e pour retrouver, t\u00E9l\u00E9charger et relire plus facilement les documents d\u00E9j\u00E0 g\u00E9n\u00E9r\u00E9s.", 4, "ngIf"], ["eyebrow", "Documents chantier", "title", "Documents chantier", "description", "Une vue d\u00E9di\u00E9e pour retrouver, t\u00E9l\u00E9charger et relire plus facilement les documents d\u00E9j\u00E0 g\u00E9n\u00E9r\u00E9s.", 1, "desktop-card"], ["id", "worksite-documents-section", 1, "dashboard-actions"], [1, "dashboard-actions-header"], [1, "dashboard-action-copy"], [1, "small"], [3, "label", "tone"], [4, "ngIf", "ngIfElse"], [1, "inline-actions"], ["class", "compact-field", 4, "ngIf"], [1, "compact-field"], ["name", "standaloneWorksiteDocumentLifecycleFilter", 3, "ngModelChange", "ngModel"], ["value", "all"], ["value", "draft"], ["value", "finalized"], ["name", "standaloneWorksiteDocumentCoordinationStatusFilter", 3, "ngModelChange", "ngModel"], ["value", "todo"], ["value", "in_progress"], ["value", "done"], ["name", "standaloneWorksiteDocumentAssigneeFilter", 3, "ngModelChange", "ngModel"], ["value", "unassigned"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "button", "variant", "secondary", 3, "click", 4, "ngIf"], ["class", "stack-list", 4, "ngIf", "ngIfElse"], ["name", "standaloneWorksiteDocumentFilterId", 3, "ngModelChange", "ngModel"], [3, "value"], ["name", "standaloneWorksiteDocumentTypeFilter", 3, "ngModelChange", "ngModel"], ["type", "button", "variant", "secondary", 3, "click"], [1, "stack-list"], [4, "ngFor", "ngForOf"], [1, "list-copy"], [4, "ngIf"], [1, "billing-item-actions"], [1, "chips"], ["type", "button", "variant", "secondary", 3, "disabled", "click", 4, "ngIf"], ["class", "document-linked-panel", 4, "ngIf"], ["type", "button", "variant", "secondary", 3, "click", "disabled"], [1, "document-linked-panel"], [1, "detail-grid"], [1, "detail-block"], ["class", "detail-block", 4, "ngIf", "ngIfElse"], ["class", "detail-list", 4, "ngIf", "ngIfElse"], [1, "detail-list"], ["title", "Aucun document pour ce filtre", "description", "Ajustez les filtres ou g\u00E9n\u00E9rez un document chantier pour le retrouver ici."], ["title", "Module Chantier non activ\u00E9", "description", "Activez le module Chantier pour afficher les documents chantier dans cette vue."]], template: function DesktopWorksiteDocumentsPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵtemplate(0, DesktopWorksiteDocumentsPageComponent_cfm_card_0_Template, 12, 4, "cfm-card", 4);
        } if (rf & 2) {
            i0.ɵɵproperty("ngIf", ctx.ctx.shouldShowWorkspaceContent && ctx.ctx.currentMembership);
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, FormsModule, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.SelectControlValueAccessor, i2.NgControlStatus, i2.NgModel, CfmButtonComponent,
            CfmCardComponent,
            CfmEmptyStateComponent,
            CfmStatusChipComponent], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DesktopWorksiteDocumentsPageComponent, [{
        type: Component,
        args: [{
                selector: "cfm-desktop-worksite-documents-page",
                standalone: true,
                imports: [
                    CommonModule,
                    FormsModule,
                    CfmButtonComponent,
                    CfmCardComponent,
                    CfmEmptyStateComponent,
                    CfmStatusChipComponent,
                ],
                template: `
    <cfm-card
      *ngIf="ctx.shouldShowWorkspaceContent && ctx.currentMembership"
      class="desktop-card"
      eyebrow="Documents chantier"
      title="Documents chantier"
      description="Une vue dédiée pour retrouver, télécharger et relire plus facilement les documents déjà générés."
    >
      <section class="dashboard-actions" id="worksite-documents-section">
        <div class="dashboard-actions-header">
          <div class="dashboard-action-copy">
            <h3>Documents liés aux chantiers</h3>
            <p class="small">
              Filtrez par chantier, type, statut et suivi pour retrouver le bon document plus vite.
            </p>
          </div>

          <cfm-status-chip
            [label]="ctx.worksiteDocumentCountLabel"
            [tone]="ctx.filteredWorksiteDocumentItems.length > 0 ? 'calm' : 'neutral'"
          />
        </div>

        <ng-container *ngIf="ctx.isChantierEnabled; else standaloneDocumentsDisabled">
          <div class="inline-actions">
            <label class="compact-field" *ngIf="ctx.worksiteDocumentFilterOptions.length > 1">
              <span class="small">Chantier</span>
              <select [(ngModel)]="ctx.selectedWorksiteDocumentFilterId" name="standaloneWorksiteDocumentFilterId">
                <option value="all">Tous les chantiers</option>
                <option *ngFor="let worksite of ctx.worksiteDocumentFilterOptions" [value]="worksite.id">
                  {{ worksite.name }}
                </option>
              </select>
            </label>

            <label class="compact-field" *ngIf="ctx.worksiteDocumentTypeFilterOptions.length > 1">
              <span class="small">Type</span>
              <select [(ngModel)]="ctx.selectedWorksiteDocumentTypeFilter" name="standaloneWorksiteDocumentTypeFilter">
                <option value="all">Tous les types</option>
                <option *ngFor="let option of ctx.worksiteDocumentTypeFilterOptions" [value]="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="compact-field">
              <span class="small">Statut</span>
              <select
                [(ngModel)]="ctx.selectedWorksiteDocumentLifecycleFilter"
                name="standaloneWorksiteDocumentLifecycleFilter"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="finalized">Finalisé</option>
              </select>
            </label>

            <label class="compact-field">
              <span class="small">Suivi</span>
              <select [(ngModel)]="ctx.selectedCoordinationStatusFilter" name="standaloneWorksiteDocumentCoordinationStatusFilter">
                <option value="all">Tous les suivis</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Fait</option>
              </select>
            </label>

            <label class="compact-field">
              <span class="small">Affectation</span>
              <select [(ngModel)]="ctx.selectedCoordinationAssigneeFilter" name="standaloneWorksiteDocumentAssigneeFilter">
                <option value="all">Toutes les affectations</option>
                <option value="unassigned">Non affecté</option>
                <option *ngFor="let assignee of ctx.worksiteAssignees" [value]="assignee.user_id">
                  {{ ctx.getWorksiteAssigneeOptionLabel(assignee) }}
                </option>
              </select>
            </label>

            <cfm-button
              *ngIf="ctx.hasActiveWorksiteDocumentFilters"
              type="button"
              variant="secondary"
              (click)="ctx.resetWorksiteDocumentFilters()"
            >
              Réinitialiser les filtres
            </cfm-button>
          </div>

          <ul class="stack-list" *ngIf="ctx.filteredWorksiteDocumentItems.length > 0; else emptyStandaloneWorksiteDocuments">
            <li *ngFor="let document of ctx.filteredWorksiteDocumentItems">
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
                  *ngIf="ctx.canReadOrganization"
                  type="button"
                  variant="secondary"
                  [disabled]="ctx.isWorksiteDocumentDownloadBusy(document)"
                  (click)="ctx.downloadWorksiteDocument(document)"
                >
                  {{
                    ctx.isWorksiteDocumentDownloadBusy(document)
                      ? "Téléchargement en cours"
                      : ctx.getWorksiteDocumentActionLabel(document)
                  }}
                </cfm-button>

                <cfm-button
                  *ngIf="ctx.canAdjustWorksiteDocument(document)"
                  type="button"
                  variant="secondary"
                  [disabled]="ctx.worksitePreventionPlanPdfBusyId === document.worksiteId"
                  (click)="ctx.toggleWorksitePreventionPlanEditor(document.worksiteId)"
                >
                  {{
                    ctx.worksitePreventionPlanEditingId === document.worksiteId
                      ? "Fermer l'ajustement"
                      : "Ajuster le plan"
                  }}
                </cfm-button>

                <cfm-button
                  type="button"
                  variant="secondary"
                  (click)="ctx.toggleWorksiteDocumentDetails(document.id)"
                >
                  {{
                    ctx.selectedWorksiteDocumentDetailId === document.id
                      ? "Masquer les éléments liés"
                      : "Voir les éléments liés"
                  }}
                </cfm-button>
              </div>

              <section
                class="document-linked-panel"
                *ngIf="ctx.selectedWorksiteDocumentDetailId === document.id"
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

                <div class="detail-block" *ngIf="document.linkedSignature as signature; else noStandaloneLinkedSignature">
                  <span class="small">Signature liée</span>
                  <strong>{{ signature.label }}</strong>
                  <span *ngIf="signature.detail">{{ signature.detail }}</span>
                  <cfm-status-chip [label]="signature.statusLabel" [tone]="signature.statusTone" />
                </div>

                <ng-template #noStandaloneLinkedSignature>
                  <div class="detail-block">
                    <span class="small">Signature liée</span>
                    <span>Aucune signature liée.</span>
                  </div>
                </ng-template>

                <div class="detail-block">
                  <span class="small">Preuves liées</span>
                  <ul class="detail-list" *ngIf="document.linkedProofs.length > 0; else noStandaloneLinkedProofs">
                    <li *ngFor="let proof of document.linkedProofs">
                      <strong>{{ proof.label }}</strong>
                      <span *ngIf="proof.detail">{{ proof.detail }}</span>
                      <cfm-status-chip [label]="proof.statusLabel" [tone]="proof.statusTone" />
                    </li>
                  </ul>
                  <ng-template #noStandaloneLinkedProofs>
                    <span>Aucune preuve liée.</span>
                  </ng-template>
                </div>
              </section>
            </li>
          </ul>

          <ng-template #emptyStandaloneWorksiteDocuments>
            <cfm-empty-state
              title="Aucun document pour ce filtre"
              description="Ajustez les filtres ou générez un document chantier pour le retrouver ici."
            />
          </ng-template>
        </ng-container>

        <ng-template #standaloneDocumentsDisabled>
          <cfm-empty-state
            title="Module Chantier non activé"
            description="Activez le module Chantier pour afficher les documents chantier dans cette vue."
          />
        </ng-template>
      </section>
    </cfm-card>
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DesktopWorksiteDocumentsPageComponent, { className: "DesktopWorksiteDocumentsPageComponent" }); })();
