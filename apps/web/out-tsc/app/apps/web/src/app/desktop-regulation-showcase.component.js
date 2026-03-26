import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { CfmButtonComponent, CfmCardComponent, CfmEmptyStateComponent, CfmStatusChipComponent } from "@conformeo/ui";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function DesktopRegulationShowcaseComponent_section_0_cfm_status_chip_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 9);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("label", ctx_r1.summary.siteLabel)("tone", ctx_r1.summary.siteTone);
} }
function DesktopRegulationShowcaseComponent_section_0_p_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.summary.context);
} }
function DesktopRegulationShowcaseComponent_section_0_cfm_button_17_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "cfm-button", 36);
    i0.ɵɵlistener("click", function DesktopRegulationShowcaseComponent_section_0_cfm_button_17_Template_cfm_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.actionTriggered.emit(ctx_r1.topPriority)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.isActionBusy(ctx_r1.topPriority));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.getActionLabel(ctx_r1.topPriority), " ");
} }
function DesktopRegulationShowcaseComponent_section_0_div_30_li_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 40)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(6, "cfm-status-chip", 9);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r4.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r4.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r4.statusLabel)("tone", item_r4.tone);
} }
function DesktopRegulationShowcaseComponent_section_0_div_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 37)(1, "span", 17);
    i0.ɵɵtext(2, "Ce qui compose le score");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "ul", 38);
    i0.ɵɵtemplate(4, DesktopRegulationShowcaseComponent_section_0_div_30_li_4_Template, 7, 4, "li", 39);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", ctx_r1.scoreDrivers);
} }
function DesktopRegulationShowcaseComponent_section_0_div_33_article_1_cfm_status_chip_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 47);
} if (rf & 2) {
    const item_r6 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("label", item_r6.focusLabel);
} }
function DesktopRegulationShowcaseComponent_section_0_div_33_article_1_p_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r6 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r6.context);
} }
function DesktopRegulationShowcaseComponent_section_0_div_33_article_1_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 43)(1, "div", 30)(2, "div", 31)(3, "h3");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 34);
    i0.ɵɵtemplate(8, DesktopRegulationShowcaseComponent_section_0_div_33_article_1_cfm_status_chip_8_Template, 1, 1, "cfm-status-chip", 44);
    i0.ɵɵelement(9, "cfm-status-chip", 45)(10, "cfm-status-chip", 9);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(11, DesktopRegulationShowcaseComponent_section_0_div_33_article_1_p_11_Template, 2, 1, "p", 12);
    i0.ɵɵelementStart(12, "div", 13)(13, "cfm-button", 46);
    i0.ɵɵlistener("click", function DesktopRegulationShowcaseComponent_section_0_div_33_article_1_Template_cfm_button_click_13_listener() { const item_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.actionTriggered.emit(item_r6)); });
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(item_r6.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r6.impact);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", item_r6.focusLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r6.familyLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", item_r6.levelLabel)("tone", item_r6.tone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r6.context);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.isActionBusy(item_r6));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.getActionLabel(item_r6), " ");
} }
function DesktopRegulationShowcaseComponent_section_0_div_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41);
    i0.ɵɵtemplate(1, DesktopRegulationShowcaseComponent_section_0_div_33_article_1_Template, 15, 9, "article", 42);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.priorityItems);
} }
function DesktopRegulationShowcaseComponent_section_0_ng_template_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 48);
} }
function DesktopRegulationShowcaseComponent_section_0_article_38_li_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const highlight_r8 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(highlight_r8.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(highlight_r8.value);
} }
function DesktopRegulationShowcaseComponent_section_0_article_38_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 49)(1, "div", 30)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "cfm-status-chip", 9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 50);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "ul", 51);
    i0.ɵɵtemplate(10, DesktopRegulationShowcaseComponent_section_0_article_38_li_10_Template, 5, 2, "li", 39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "cfm-button", 52);
    i0.ɵɵlistener("click", function DesktopRegulationShowcaseComponent_section_0_article_38_Template_cfm_button_click_11_listener() { const family_r9 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.actionTriggered.emit(family_r9)); });
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const family_r9 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(family_r9.label);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", family_r9.statusLabel)("tone", family_r9.tone);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(family_r9.countLabel);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(family_r9.detail);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", family_r9.highlights);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.isActionBusy(family_r9));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.getActionLabel(family_r9), " ");
} }
function DesktopRegulationShowcaseComponent_section_0_p_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 53);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.recommendedActionsSummary, " ");
} }
function DesktopRegulationShowcaseComponent_section_0_ul_50_li_1_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r11 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(action_r11.supportLabel);
} }
function DesktopRegulationShowcaseComponent_section_0_ul_50_li_1_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "div", 55)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, DesktopRegulationShowcaseComponent_section_0_ul_50_li_1_span_6_Template, 2, 1, "span", 12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "cfm-button", 46);
    i0.ɵɵlistener("click", function DesktopRegulationShowcaseComponent_section_0_ul_50_li_1_Template_cfm_button_click_7_listener() { const action_r11 = i0.ɵɵrestoreView(_r10).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.actionTriggered.emit(action_r11)); });
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const action_r11 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(action_r11.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(action_r11.detail);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", action_r11.supportLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.isActionBusy(action_r11));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.getActionLabel(action_r11), " ");
} }
function DesktopRegulationShowcaseComponent_section_0_ul_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 54);
    i0.ɵɵtemplate(1, DesktopRegulationShowcaseComponent_section_0_ul_50_li_1_Template, 9, 5, "li", 39);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.recommendedActions);
} }
function DesktopRegulationShowcaseComponent_section_0_ng_template_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 56);
} }
function DesktopRegulationShowcaseComponent_section_0_p_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 53);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.proofSupportSummary, " ");
} }
function DesktopRegulationShowcaseComponent_section_0_ul_64_li_1_cfm_status_chip_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-status-chip", 47);
} if (rf & 2) {
    const proof_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("label", proof_r12.contextLabel);
} }
function DesktopRegulationShowcaseComponent_section_0_ul_64_li_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 55)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 34);
    i0.ɵɵelement(7, "cfm-status-chip", 9);
    i0.ɵɵtemplate(8, DesktopRegulationShowcaseComponent_section_0_ul_64_li_1_cfm_status_chip_8_Template, 1, 1, "cfm-status-chip", 44);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const proof_r12 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(proof_r12.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(proof_r12.detail);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("label", proof_r12.statusLabel)("tone", proof_r12.tone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", proof_r12.contextLabel);
} }
function DesktopRegulationShowcaseComponent_section_0_ul_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 57);
    i0.ɵɵtemplate(1, DesktopRegulationShowcaseComponent_section_0_ul_64_li_1_Template, 9, 5, "li", 39);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.evidenceItems);
} }
function DesktopRegulationShowcaseComponent_section_0_ng_template_65_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "cfm-empty-state", 58);
} }
function DesktopRegulationShowcaseComponent_section_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 4)(1, "cfm-card", 5)(2, "div", 6)(3, "div", 7)(4, "div", 8);
    i0.ɵɵelement(5, "cfm-status-chip", 9)(6, "cfm-status-chip", 9)(7, "cfm-status-chip", 9)(8, "cfm-status-chip", 9);
    i0.ɵɵtemplate(9, DesktopRegulationShowcaseComponent_section_0_cfm_status_chip_9_Template, 1, 2, "cfm-status-chip", 10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 11)(11, "h3");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "p");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, DesktopRegulationShowcaseComponent_section_0_p_15_Template, 2, 1, "p", 12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "div", 13);
    i0.ɵɵtemplate(17, DesktopRegulationShowcaseComponent_section_0_cfm_button_17_Template, 2, 2, "cfm-button", 14);
    i0.ɵɵelementStart(18, "cfm-button", 15);
    i0.ɵɵlistener("click", function DesktopRegulationShowcaseComponent_section_0_Template_cfm_button_click_18_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.exportTriggered.emit()); });
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(20, "aside", 16)(21, "span", 17);
    i0.ɵɵtext(22, "Niveau de conformit\u00E9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "strong", 18);
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(25, "cfm-status-chip", 9);
    i0.ɵɵelementStart(26, "p");
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "p", 19);
    i0.ɵɵtext(29);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(30, DesktopRegulationShowcaseComponent_section_0_div_30_Template, 5, 1, "div", 20);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(31, "div", 21)(32, "cfm-card", 22);
    i0.ɵɵtemplate(33, DesktopRegulationShowcaseComponent_section_0_div_33_Template, 2, 1, "div", 23)(34, DesktopRegulationShowcaseComponent_section_0_ng_template_34_Template, 1, 0, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "cfm-card", 24)(37, "div", 25);
    i0.ɵɵtemplate(38, DesktopRegulationShowcaseComponent_section_0_article_38_Template, 13, 8, "article", 26);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(39, "cfm-card", 27)(40, "div", 28)(41, "section", 29)(42, "div", 30)(43, "div", 31)(44, "h3");
    i0.ɵɵtext(45, "Actions recommand\u00E9es");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "p");
    i0.ɵɵtext(47, "Des actions courtes, claires et imm\u00E9diatement exploitables.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(48, "cfm-status-chip", 9);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(49, DesktopRegulationShowcaseComponent_section_0_p_49_Template, 2, 1, "p", 32)(50, DesktopRegulationShowcaseComponent_section_0_ul_50_Template, 2, 1, "ul", 33)(51, DesktopRegulationShowcaseComponent_section_0_ng_template_51_Template, 1, 0, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "section", 29)(54, "div", 30)(55, "div", 31)(56, "h3");
    i0.ɵɵtext(57, "Preuves et documents");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(58, "p");
    i0.ɵɵtext(59, "Des \u00E9l\u00E9ments concrets pour montrer ce qui est d\u00E9j\u00E0 pr\u00EAt ou d\u00E9montrable.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(60, "div", 34);
    i0.ɵɵelement(61, "cfm-status-chip", 9)(62, "cfm-status-chip", 9);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(63, DesktopRegulationShowcaseComponent_section_0_p_63_Template, 2, 1, "p", 32)(64, DesktopRegulationShowcaseComponent_section_0_ul_64_Template, 2, 1, "ul", 35)(65, DesktopRegulationShowcaseComponent_section_0_ng_template_65_Template, 1, 0, "ng-template", null, 2, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const emptyRegulatoryPriorities_r13 = i0.ɵɵreference(35);
    const emptyRegulatoryActions_r14 = i0.ɵɵreference(52);
    const emptyRegulatoryProofs_r15 = i0.ɵɵreference(66);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("label", ctx_r1.summary.statusLabel)("tone", ctx_r1.summary.tone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r1.summary.profileLabel)("tone", ctx_r1.summary.profileTone);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r1.obligationCountLabel)("tone", ctx_r1.hasObligations ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r1.evidenceAvailableCount + " preuve" + (ctx_r1.evidenceAvailableCount > 1 ? "s" : ""))("tone", ctx_r1.evidenceAvailableCount > 0 ? "success" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.summary.siteLabel);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.summary.headline);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.summary.summary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.summary.context);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r1.topPriority);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !ctx_r1.canReadOrganization || ctx_r1.exportLoading);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.exportLoading ? "G\u00E9n\u00E9ration en cours" : "Exporter le dossier", " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("", ctx_r1.score, "/100");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r1.summary.statusLabel)("tone", ctx_r1.summary.tone);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.summary.scoreSummary);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(" ", ctx_r1.overduePriorityCount, " sujet", ctx_r1.overduePriorityCount > 1 ? "s" : "", " prioritaire", ctx_r1.overduePriorityCount > 1 ? "s" : "", " \u00B7 ", ctx_r1.obligationsToVerifyCount, " \u00E0 v\u00E9rifier ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.scoreDrivers.length > 0);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r1.priorityItems.length > 0)("ngIfElse", emptyRegulatoryPriorities_r13);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngForOf", ctx_r1.familyCards);
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("label", ctx_r1.recommendedActions.length + " action" + (ctx_r1.recommendedActions.length > 1 ? "s" : ""))("tone", ctx_r1.recommendedActions.length > 0 ? "progress" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.recommendedActions.length > 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.recommendedActions.length > 0)("ngIfElse", emptyRegulatoryActions_r14);
    i0.ɵɵadvance(11);
    i0.ɵɵproperty("label", ctx_r1.evidenceAvailableCount + " pr\u00EAt" + (ctx_r1.evidenceAvailableCount > 1 ? "s" : ""))("tone", ctx_r1.evidenceAvailableCount > 0 ? "success" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", ctx_r1.evidenceCoverageCount + " obligation" + (ctx_r1.evidenceCoverageCount > 1 ? "s" : "") + " couverte" + (ctx_r1.evidenceCoverageCount > 1 ? "s" : ""))("tone", ctx_r1.evidenceCoverageCount > 0 ? "calm" : "neutral");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.proofSupportSummary);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.evidenceItems.length > 0)("ngIfElse", emptyRegulatoryProofs_r15);
} }
export class DesktopRegulationShowcaseComponent {
    summary;
    topPriority = null;
    priorityItems = [];
    familyCards = [];
    recommendedActions = [];
    recommendedActionsSummary = "";
    evidenceItems = [];
    proofSupportSummary = "";
    score = 0;
    scoreDrivers = [];
    obligationCountLabel = "0 obligation";
    evidenceAvailableCount = 0;
    evidenceCoverageCount = 0;
    overduePriorityCount = 0;
    obligationsToVerifyCount = 0;
    hasObligations = false;
    canReadOrganization = false;
    exportLoading = false;
    actionBusy = () => false;
    actionLabel = (action) => action.actionLabel;
    actionTriggered = new EventEmitter();
    exportTriggered = new EventEmitter();
    getActionLabel(action) {
        return this.actionLabel(action);
    }
    isActionBusy(action) {
        return this.actionBusy(action);
    }
    static ɵfac = function DesktopRegulationShowcaseComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DesktopRegulationShowcaseComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DesktopRegulationShowcaseComponent, selectors: [["cfm-desktop-regulation-showcase"]], inputs: { summary: "summary", topPriority: "topPriority", priorityItems: "priorityItems", familyCards: "familyCards", recommendedActions: "recommendedActions", recommendedActionsSummary: "recommendedActionsSummary", evidenceItems: "evidenceItems", proofSupportSummary: "proofSupportSummary", score: "score", scoreDrivers: "scoreDrivers", obligationCountLabel: "obligationCountLabel", evidenceAvailableCount: "evidenceAvailableCount", evidenceCoverageCount: "evidenceCoverageCount", overduePriorityCount: "overduePriorityCount", obligationsToVerifyCount: "obligationsToVerifyCount", hasObligations: "hasObligations", canReadOrganization: "canReadOrganization", exportLoading: "exportLoading", actionBusy: "actionBusy", actionLabel: "actionLabel" }, outputs: { actionTriggered: "actionTriggered", exportTriggered: "exportTriggered" }, standalone: true, features: [i0.ɵɵStandaloneFeature], decls: 1, vars: 1, consts: [["emptyRegulatoryPriorities", ""], ["emptyRegulatoryActions", ""], ["emptyRegulatoryProofs", ""], ["class", "regulatory-showcase-workspace", 4, "ngIf"], [1, "regulatory-showcase-workspace"], ["eyebrow", "R\u00E9glementation", "title", "Copilote conformit\u00E9", "description", "Une lecture claire de votre situation, des priorit\u00E9s et des preuves d\u00E9j\u00E0 pr\u00EAtes.", 1, "desktop-card", "regulatory-showcase-card"], [1, "regulatory-hero"], [1, "regulatory-hero-copy"], [1, "chips", "regulatory-showcase-chips"], [3, "label", "tone"], [3, "label", "tone", 4, "ngIf"], [1, "regulatory-hero-copy-block"], ["class", "small", 4, "ngIf"], [1, "inline-actions"], ["type", "button", 3, "disabled", "click", 4, "ngIf"], ["type", "button", "variant", "secondary", 3, "click", "disabled"], [1, "regulatory-score-card"], [1, "small", "regulatory-score-label"], [1, "regulatory-score-value"], [1, "small"], ["class", "regulatory-score-breakdown", 4, "ngIf"], [1, "regulatory-showcase-secondary-grid"], ["eyebrow", "Priorit\u00E9s", "title", "Priorit\u00E9s du moment", "description", "Trois sujets maximum pour avancer sans se disperser.", 1, "desktop-card"], ["class", "regulatory-priority-grid", 4, "ngIf", "ngIfElse"], ["eyebrow", "Familles", "title", "Familles r\u00E9glementaires", "description", "Une lecture modulaire pour voir vite o\u00F9 regarder, sans liste confuse.", 1, "desktop-card"], [1, "regulatory-family-grid"], ["class", "regulatory-family-card", 4, "ngFor", "ngForOf"], ["eyebrow", "Actions & preuves", "title", "Actions recommand\u00E9es", "description", "Ce que vous pouvez faire maintenant et ce que vous pouvez d\u00E9j\u00E0 d\u00E9montrer.", 1, "desktop-card"], [1, "regulatory-support-grid"], [1, "regulatory-support-block"], [1, "obligation-heading"], [1, "detail-copy"], ["class", "small regulatory-support-summary", 4, "ngIf"], ["class", "regulatory-action-list", 4, "ngIf", "ngIfElse"], [1, "chips"], ["class", "regulatory-proof-list", 4, "ngIf", "ngIfElse"], ["type", "button", 3, "click", "disabled"], [1, "regulatory-score-breakdown"], [1, "regulatory-score-breakdown-list"], [4, "ngFor", "ngForOf"], [1, "regulatory-score-breakdown-copy"], [1, "regulatory-priority-grid"], ["class", "regulatory-priority-card", 4, "ngFor", "ngForOf"], [1, "regulatory-priority-card"], ["tone", "neutral", 3, "label", 4, "ngIf"], ["tone", "calm", 3, "label"], ["type", "button", "variant", "secondary", "size", "sm", 3, "click", "disabled"], ["tone", "neutral", 3, "label"], ["title", "Aucune priorit\u00E9 imm\u00E9diate", "description", "La situation r\u00E9glementaire reste calme pour le moment. Gardez simplement les preuves \u00E0 jour."], [1, "regulatory-family-card"], [1, "regulatory-family-count"], [1, "regulatory-family-highlights"], ["type", "button", "variant", "ghost", "size", "sm", 3, "click", "disabled"], [1, "small", "regulatory-support-summary"], [1, "regulatory-action-list"], [1, "regulatory-support-copy"], ["title", "Aucune action urgente", "description", "Le socle r\u00E9glementaire est pos\u00E9. Conservez simplement un rythme de mise \u00E0 jour."], [1, "regulatory-proof-list"], ["title", "Aucune preuve encore pr\u00EAte", "description", "Ajoutez une premi\u00E8re pi\u00E8ce simple pour mat\u00E9rialiser la conformit\u00E9 et nourrir la d\u00E9mo."]], template: function DesktopRegulationShowcaseComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵtemplate(0, DesktopRegulationShowcaseComponent_section_0_Template, 67, 39, "section", 3);
        } if (rf & 2) {
            i0.ɵɵproperty("ngIf", ctx.summary);
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, CfmButtonComponent,
            CfmCardComponent,
            CfmEmptyStateComponent,
            CfmStatusChipComponent], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 0;\n      }\n\n      .regulatory-showcase-workspace[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 1.15rem;\n      }\n\n      .regulatory-showcase-secondary-grid[_ngcontent-%COMP%] {\n        display: grid;\n        grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);\n        gap: 1.15rem;\n        align-items: start;\n      }\n\n      @media (max-width: 1180px) {\n        .regulatory-showcase-workspace[_ngcontent-%COMP%], \n   .regulatory-showcase-secondary-grid[_ngcontent-%COMP%] {\n          gap: 1rem;\n        }\n\n        .regulatory-showcase-secondary-grid[_ngcontent-%COMP%] {\n          grid-template-columns: 1fr;\n        }\n      }"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DesktopRegulationShowcaseComponent, [{
        type: Component,
        args: [{ selector: "cfm-desktop-regulation-showcase", standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                    CommonModule,
                    CfmButtonComponent,
                    CfmCardComponent,
                    CfmEmptyStateComponent,
                    CfmStatusChipComponent,
                ], template: `
    <section class="regulatory-showcase-workspace" *ngIf="summary">
      <cfm-card
        class="desktop-card regulatory-showcase-card"
        eyebrow="Réglementation"
        title="Copilote conformité"
        description="Une lecture claire de votre situation, des priorités et des preuves déjà prêtes."
      >
        <div class="regulatory-hero">
          <div class="regulatory-hero-copy">
            <div class="chips regulatory-showcase-chips">
              <cfm-status-chip [label]="summary.statusLabel" [tone]="summary.tone" />
              <cfm-status-chip [label]="summary.profileLabel" [tone]="summary.profileTone" />
              <cfm-status-chip [label]="obligationCountLabel" [tone]="hasObligations ? 'calm' : 'neutral'" />
              <cfm-status-chip
                [label]="evidenceAvailableCount + ' preuve' + (evidenceAvailableCount > 1 ? 's' : '')"
                [tone]="evidenceAvailableCount > 0 ? 'success' : 'neutral'"
              />
              <cfm-status-chip *ngIf="summary.siteLabel" [label]="summary.siteLabel" [tone]="summary.siteTone" />
            </div>

            <div class="regulatory-hero-copy-block">
              <h3>{{ summary.headline }}</h3>
              <p>{{ summary.summary }}</p>
              <p class="small" *ngIf="summary.context">{{ summary.context }}</p>
            </div>

            <div class="inline-actions">
              <cfm-button
                *ngIf="topPriority"
                type="button"
                [disabled]="isActionBusy(topPriority)"
                (click)="actionTriggered.emit(topPriority)"
              >
                {{ getActionLabel(topPriority) }}
              </cfm-button>
              <cfm-button
                type="button"
                variant="secondary"
                [disabled]="!canReadOrganization || exportLoading"
                (click)="exportTriggered.emit()"
              >
                {{ exportLoading ? "Génération en cours" : "Exporter le dossier" }}
              </cfm-button>
            </div>
          </div>

          <aside class="regulatory-score-card">
            <span class="small regulatory-score-label">Niveau de conformité</span>
            <strong class="regulatory-score-value">{{ score }}/100</strong>
            <cfm-status-chip [label]="summary.statusLabel" [tone]="summary.tone" />
            <p>{{ summary.scoreSummary }}</p>
            <p class="small">
              {{ overduePriorityCount }} sujet{{ overduePriorityCount > 1 ? "s" : "" }}
              prioritaire{{ overduePriorityCount > 1 ? "s" : "" }} · {{ obligationsToVerifyCount }} à vérifier
            </p>

            <div class="regulatory-score-breakdown" *ngIf="scoreDrivers.length > 0">
              <span class="small regulatory-score-label">Ce qui compose le score</span>
              <ul class="regulatory-score-breakdown-list">
                <li *ngFor="let item of scoreDrivers">
                  <div class="regulatory-score-breakdown-copy">
                    <strong>{{ item.label }}</strong>
                    <span>{{ item.detail }}</span>
                  </div>
                  <cfm-status-chip [label]="item.statusLabel" [tone]="item.tone" />
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </cfm-card>

      <div class="regulatory-showcase-secondary-grid">
        <cfm-card
          class="desktop-card"
          eyebrow="Priorités"
          title="Priorités du moment"
          description="Trois sujets maximum pour avancer sans se disperser."
        >
          <div class="regulatory-priority-grid" *ngIf="priorityItems.length > 0; else emptyRegulatoryPriorities">
            <article class="regulatory-priority-card" *ngFor="let item of priorityItems">
              <div class="obligation-heading">
                <div class="detail-copy">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.impact }}</p>
                </div>
                <div class="chips">
                  <cfm-status-chip *ngIf="item.focusLabel" [label]="item.focusLabel" tone="neutral" />
                  <cfm-status-chip [label]="item.familyLabel" tone="calm" />
                  <cfm-status-chip [label]="item.levelLabel" [tone]="item.tone" />
                </div>
              </div>

              <p class="small" *ngIf="item.context">{{ item.context }}</p>

              <div class="inline-actions">
                <cfm-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  [disabled]="isActionBusy(item)"
                  (click)="actionTriggered.emit(item)"
                >
                  {{ getActionLabel(item) }}
                </cfm-button>
              </div>
            </article>
          </div>

          <ng-template #emptyRegulatoryPriorities>
            <cfm-empty-state
              title="Aucune priorité immédiate"
              description="La situation réglementaire reste calme pour le moment. Gardez simplement les preuves à jour."
            />
          </ng-template>
        </cfm-card>

        <cfm-card
          class="desktop-card"
          eyebrow="Familles"
          title="Familles réglementaires"
          description="Une lecture modulaire pour voir vite où regarder, sans liste confuse."
        >
          <div class="regulatory-family-grid">
            <article class="regulatory-family-card" *ngFor="let family of familyCards">
              <div class="obligation-heading">
                <strong>{{ family.label }}</strong>
                <cfm-status-chip [label]="family.statusLabel" [tone]="family.tone" />
              </div>

              <p class="regulatory-family-count">{{ family.countLabel }}</p>
              <p>{{ family.detail }}</p>

              <ul class="regulatory-family-highlights">
                <li *ngFor="let highlight of family.highlights">
                  <span>{{ highlight.label }}</span>
                  <strong>{{ highlight.value }}</strong>
                </li>
              </ul>

              <cfm-button
                type="button"
                variant="ghost"
                size="sm"
                [disabled]="isActionBusy(family)"
                (click)="actionTriggered.emit(family)"
              >
                {{ getActionLabel(family) }}
              </cfm-button>
            </article>
          </div>
        </cfm-card>
      </div>

      <cfm-card
        class="desktop-card"
        eyebrow="Actions & preuves"
        title="Actions recommandées"
        description="Ce que vous pouvez faire maintenant et ce que vous pouvez déjà démontrer."
      >
        <div class="regulatory-support-grid">
          <section class="regulatory-support-block">
            <div class="obligation-heading">
              <div class="detail-copy">
                <h3>Actions recommandées</h3>
                <p>Des actions courtes, claires et immédiatement exploitables.</p>
              </div>
              <cfm-status-chip
                [label]="recommendedActions.length + ' action' + (recommendedActions.length > 1 ? 's' : '')"
                [tone]="recommendedActions.length > 0 ? 'progress' : 'neutral'"
              />
            </div>

            <p class="small regulatory-support-summary" *ngIf="recommendedActions.length > 0">
              {{ recommendedActionsSummary }}
            </p>

            <ul class="regulatory-action-list" *ngIf="recommendedActions.length > 0; else emptyRegulatoryActions">
              <li *ngFor="let action of recommendedActions">
                <div class="regulatory-support-copy">
                  <strong>{{ action.title }}</strong>
                  <span>{{ action.detail }}</span>
                  <span class="small" *ngIf="action.supportLabel">{{ action.supportLabel }}</span>
                </div>
                <cfm-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  [disabled]="isActionBusy(action)"
                  (click)="actionTriggered.emit(action)"
                >
                  {{ getActionLabel(action) }}
                </cfm-button>
              </li>
            </ul>

            <ng-template #emptyRegulatoryActions>
              <cfm-empty-state
                title="Aucune action urgente"
                description="Le socle réglementaire est posé. Conservez simplement un rythme de mise à jour."
              />
            </ng-template>
          </section>

          <section class="regulatory-support-block">
            <div class="obligation-heading">
              <div class="detail-copy">
                <h3>Preuves et documents</h3>
                <p>Des éléments concrets pour montrer ce qui est déjà prêt ou démontrable.</p>
              </div>
              <div class="chips">
                <cfm-status-chip
                  [label]="evidenceAvailableCount + ' prêt' + (evidenceAvailableCount > 1 ? 's' : '')"
                  [tone]="evidenceAvailableCount > 0 ? 'success' : 'neutral'"
                />
                <cfm-status-chip
                  [label]="evidenceCoverageCount + ' obligation' + (evidenceCoverageCount > 1 ? 's' : '') + ' couverte' + (evidenceCoverageCount > 1 ? 's' : '')"
                  [tone]="evidenceCoverageCount > 0 ? 'calm' : 'neutral'"
                />
              </div>
            </div>

            <p class="small regulatory-support-summary" *ngIf="proofSupportSummary">
              {{ proofSupportSummary }}
            </p>

            <ul class="regulatory-proof-list" *ngIf="evidenceItems.length > 0; else emptyRegulatoryProofs">
              <li *ngFor="let proof of evidenceItems">
                <div class="regulatory-support-copy">
                  <strong>{{ proof.title }}</strong>
                  <span>{{ proof.detail }}</span>
                </div>

                <div class="chips">
                  <cfm-status-chip [label]="proof.statusLabel" [tone]="proof.tone" />
                  <cfm-status-chip *ngIf="proof.contextLabel" [label]="proof.contextLabel" tone="neutral" />
                </div>
              </li>
            </ul>

            <ng-template #emptyRegulatoryProofs>
              <cfm-empty-state
                title="Aucune preuve encore prête"
                description="Ajoutez une première pièce simple pour matérialiser la conformité et nourrir la démo."
              />
            </ng-template>
          </section>
        </div>
      </cfm-card>
    </section>
  `, styles: ["\n      :host {\n        display: block;\n        min-width: 0;\n      }\n\n      .regulatory-showcase-workspace {\n        display: grid;\n        gap: 1.15rem;\n      }\n\n      .regulatory-showcase-secondary-grid {\n        display: grid;\n        grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);\n        gap: 1.15rem;\n        align-items: start;\n      }\n\n      @media (max-width: 1180px) {\n        .regulatory-showcase-workspace,\n        .regulatory-showcase-secondary-grid {\n          gap: 1rem;\n        }\n\n        .regulatory-showcase-secondary-grid {\n          grid-template-columns: 1fr;\n        }\n      }\n    "] }]
    }], null, { summary: [{
            type: Input,
            args: [{ required: true }]
        }], topPriority: [{
            type: Input
        }], priorityItems: [{
            type: Input
        }], familyCards: [{
            type: Input
        }], recommendedActions: [{
            type: Input
        }], recommendedActionsSummary: [{
            type: Input
        }], evidenceItems: [{
            type: Input
        }], proofSupportSummary: [{
            type: Input
        }], score: [{
            type: Input
        }], scoreDrivers: [{
            type: Input
        }], obligationCountLabel: [{
            type: Input
        }], evidenceAvailableCount: [{
            type: Input
        }], evidenceCoverageCount: [{
            type: Input
        }], overduePriorityCount: [{
            type: Input
        }], obligationsToVerifyCount: [{
            type: Input
        }], hasObligations: [{
            type: Input
        }], canReadOrganization: [{
            type: Input
        }], exportLoading: [{
            type: Input
        }], actionBusy: [{
            type: Input
        }], actionLabel: [{
            type: Input
        }], actionTriggered: [{
            type: Output
        }], exportTriggered: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DesktopRegulationShowcaseComponent, { className: "DesktopRegulationShowcaseComponent" }); })();
