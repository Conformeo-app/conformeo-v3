import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = ["*"];
function CfmCardComponent_p_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.eyebrow);
} }
function CfmCardComponent_header_2_h2_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.title);
} }
function CfmCardComponent_header_2_p_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.description);
} }
function CfmCardComponent_header_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 5);
    i0.ɵɵtemplate(1, CfmCardComponent_header_2_h2_1_Template, 2, 1, "h2", 6)(2, CfmCardComponent_header_2_p_2_Template, 2, 1, "p", 7);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r0.title);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r0.description);
} }
export class CfmCardComponent {
    eyebrow = "";
    title = "";
    description = "";
    static ɵfac = function CfmCardComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CfmCardComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CfmCardComponent, selectors: [["cfm-card"]], inputs: { eyebrow: "eyebrow", title: "title", description: "description" }, standalone: true, features: [i0.ɵɵStandaloneFeature], ngContentSelectors: _c0, decls: 5, vars: 2, consts: [[1, "card"], ["class", "eyebrow", 4, "ngIf"], ["class", "header", 4, "ngIf"], [1, "content"], [1, "eyebrow"], [1, "header"], [4, "ngIf"], ["class", "description", 4, "ngIf"], [1, "description"]], template: function CfmCardComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "section", 0);
            i0.ɵɵtemplate(1, CfmCardComponent_p_1_Template, 2, 1, "p", 1)(2, CfmCardComponent_header_2_Template, 3, 2, "header", 2);
            i0.ɵɵelementStart(3, "div", 3);
            i0.ɵɵprojection(4);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.eyebrow);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.title || ctx.description);
        } }, dependencies: [CommonModule, i1.NgIf], styles: ["[_nghost-%COMP%] {\n        display: block;\n      }\n\n      .card[_ngcontent-%COMP%] {\n        position: relative;\n        overflow: hidden;\n        padding: 1.6rem;\n        border-radius: var(--cfm-radius-panel, 24px);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 250, 0.94)),\n          color-mix(in srgb, var(--cfm-color-surface, #ffffff) 96%, transparent);\n        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 72%, transparent);\n        box-shadow:\n          0 18px 44px rgba(18, 33, 42, 0.08),\n          0 2px 0 rgba(255, 255, 255, 0.8) inset;\n        transition:\n          transform 180ms ease,\n          box-shadow 180ms ease,\n          border-color 180ms ease;\n      }\n\n      .card[_ngcontent-%COMP%]::before {\n        content: \"\";\n        position: absolute;\n        inset: 0 0 auto;\n        height: 4px;\n        background: linear-gradient(90deg, rgba(29, 109, 100, 0.95), rgba(245, 188, 88, 0.72));\n        opacity: 0.9;\n      }\n\n      .card[_ngcontent-%COMP%]:hover {\n        transform: translateY(-2px);\n        box-shadow:\n          0 24px 58px rgba(18, 33, 42, 0.1),\n          0 2px 0 rgba(255, 255, 255, 0.8) inset;\n        border-color: color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 88%, #ffffff 12%);\n      }\n\n      .eyebrow[_ngcontent-%COMP%] {\n        margin: 0 0 0.85rem;\n        text-transform: uppercase;\n        letter-spacing: 0.18em;\n        font-size: 0.72rem;\n        font-weight: 700;\n        color: var(--cfm-color-copy-muted, #4c6471);\n      }\n\n      .header[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.55rem;\n      }\n\n      h2[_ngcontent-%COMP%], \n   .description[_ngcontent-%COMP%] {\n        margin: 0;\n      }\n\n      h2[_ngcontent-%COMP%] {\n        font-size: 1.16rem;\n        line-height: 1.25;\n        color: var(--cfm-color-ink, #10222b);\n      }\n\n      .description[_ngcontent-%COMP%] {\n        line-height: 1.6;\n        color: var(--cfm-color-copy-muted, #4c6471);\n      }\n\n      .content[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 1.05rem;\n        margin-top: 1.1rem;\n      }"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CfmCardComponent, [{
        type: Component,
        args: [{ selector: "cfm-card", standalone: true, imports: [CommonModule], template: `
    <section class="card">
      <p class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
      <header class="header" *ngIf="title || description">
        <h2 *ngIf="title">{{ title }}</h2>
        <p class="description" *ngIf="description">{{ description }}</p>
      </header>
      <div class="content">
        <ng-content />
      </div>
    </section>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["\n      :host {\n        display: block;\n      }\n\n      .card {\n        position: relative;\n        overflow: hidden;\n        padding: 1.6rem;\n        border-radius: var(--cfm-radius-panel, 24px);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 250, 0.94)),\n          color-mix(in srgb, var(--cfm-color-surface, #ffffff) 96%, transparent);\n        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 72%, transparent);\n        box-shadow:\n          0 18px 44px rgba(18, 33, 42, 0.08),\n          0 2px 0 rgba(255, 255, 255, 0.8) inset;\n        transition:\n          transform 180ms ease,\n          box-shadow 180ms ease,\n          border-color 180ms ease;\n      }\n\n      .card::before {\n        content: \"\";\n        position: absolute;\n        inset: 0 0 auto;\n        height: 4px;\n        background: linear-gradient(90deg, rgba(29, 109, 100, 0.95), rgba(245, 188, 88, 0.72));\n        opacity: 0.9;\n      }\n\n      .card:hover {\n        transform: translateY(-2px);\n        box-shadow:\n          0 24px 58px rgba(18, 33, 42, 0.1),\n          0 2px 0 rgba(255, 255, 255, 0.8) inset;\n        border-color: color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 88%, #ffffff 12%);\n      }\n\n      .eyebrow {\n        margin: 0 0 0.85rem;\n        text-transform: uppercase;\n        letter-spacing: 0.18em;\n        font-size: 0.72rem;\n        font-weight: 700;\n        color: var(--cfm-color-copy-muted, #4c6471);\n      }\n\n      .header {\n        display: grid;\n        gap: 0.55rem;\n      }\n\n      h2,\n      .description {\n        margin: 0;\n      }\n\n      h2 {\n        font-size: 1.16rem;\n        line-height: 1.25;\n        color: var(--cfm-color-ink, #10222b);\n      }\n\n      .description {\n        line-height: 1.6;\n        color: var(--cfm-color-copy-muted, #4c6471);\n      }\n\n      .content {\n        display: grid;\n        gap: 1.05rem;\n        margin-top: 1.1rem;\n      }\n    "] }]
    }], null, { eyebrow: [{
            type: Input
        }], title: [{
            type: Input
        }], description: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CfmCardComponent, { className: "CfmCardComponent" }); })();
