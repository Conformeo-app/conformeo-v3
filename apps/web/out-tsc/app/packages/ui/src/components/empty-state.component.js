import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = [[["", "cfmEmptyAction", ""]]];
const _c1 = ["[cfmEmptyAction]"];
function CfmEmptyStateComponent_p_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 3);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.eyebrow);
} }
export class CfmEmptyStateComponent {
    eyebrow = "";
    title;
    description;
    static ɵfac = function CfmEmptyStateComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CfmEmptyStateComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CfmEmptyStateComponent, selectors: [["cfm-empty-state"]], inputs: { eyebrow: "eyebrow", title: "title", description: "description" }, standalone: true, features: [i0.ɵɵStandaloneFeature], ngContentSelectors: _c1, decls: 8, vars: 3, consts: [[1, "empty-state"], ["class", "eyebrow", 4, "ngIf"], [1, "actions"], [1, "eyebrow"]], template: function CfmEmptyStateComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵelementStart(0, "section", 0);
            i0.ɵɵtemplate(1, CfmEmptyStateComponent_p_1_Template, 2, 1, "p", 1);
            i0.ɵɵelementStart(2, "strong");
            i0.ɵɵtext(3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "p");
            i0.ɵɵtext(5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "div", 2);
            i0.ɵɵprojection(7);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.eyebrow);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.title);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.description);
        } }, dependencies: [CommonModule, i1.NgIf], styles: ["[_nghost-%COMP%] {\n        display: block;\n      }\n\n      .empty-state[_ngcontent-%COMP%] {\n        position: relative;\n        display: grid;\n        gap: 0.5rem;\n        padding: 1.15rem 1.2rem 1.15rem 4rem;\n        border-radius: 22px;\n        border: 1px dashed color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 86%, transparent);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(245, 249, 249, 0.88));\n        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);\n      }\n\n      .empty-state[_ngcontent-%COMP%]::before {\n        content: \"\";\n        position: absolute;\n        left: 1.15rem;\n        top: 1.1rem;\n        width: 2rem;\n        height: 2rem;\n        border-radius: 999px;\n        background:\n          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0) 48%),\n          linear-gradient(135deg, rgba(29, 109, 100, 0.24), rgba(245, 188, 88, 0.32));\n        box-shadow: 0 8px 16px rgba(18, 33, 42, 0.08);\n      }\n\n      .eyebrow[_ngcontent-%COMP%], \n   p[_ngcontent-%COMP%] {\n        margin: 0;\n        color: var(--cfm-color-copy-muted, #4c6471);\n      }\n\n      .eyebrow[_ngcontent-%COMP%] {\n        text-transform: uppercase;\n        letter-spacing: 0.14em;\n        font-size: 0.72rem;\n      }\n\n      strong[_ngcontent-%COMP%] {\n        color: var(--cfm-color-ink, #10222b);\n        font-size: 1rem;\n      }\n\n      p[_ngcontent-%COMP%] {\n        line-height: 1.5;\n      }\n\n      .actions[_ngcontent-%COMP%] {\n        margin-top: 0.35rem;\n      }\n\n      .actions[_ngcontent-%COMP%]:empty {\n        display: none;\n      }"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CfmEmptyStateComponent, [{
        type: Component,
        args: [{ selector: "cfm-empty-state", standalone: true, imports: [CommonModule], template: `
    <section class="empty-state">
      <p class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
      <div class="actions">
        <ng-content select="[cfmEmptyAction]" />
      </div>
    </section>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["\n      :host {\n        display: block;\n      }\n\n      .empty-state {\n        position: relative;\n        display: grid;\n        gap: 0.5rem;\n        padding: 1.15rem 1.2rem 1.15rem 4rem;\n        border-radius: 22px;\n        border: 1px dashed color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 86%, transparent);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(245, 249, 249, 0.88));\n        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);\n      }\n\n      .empty-state::before {\n        content: \"\";\n        position: absolute;\n        left: 1.15rem;\n        top: 1.1rem;\n        width: 2rem;\n        height: 2rem;\n        border-radius: 999px;\n        background:\n          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0) 48%),\n          linear-gradient(135deg, rgba(29, 109, 100, 0.24), rgba(245, 188, 88, 0.32));\n        box-shadow: 0 8px 16px rgba(18, 33, 42, 0.08);\n      }\n\n      .eyebrow,\n      p {\n        margin: 0;\n        color: var(--cfm-color-copy-muted, #4c6471);\n      }\n\n      .eyebrow {\n        text-transform: uppercase;\n        letter-spacing: 0.14em;\n        font-size: 0.72rem;\n      }\n\n      strong {\n        color: var(--cfm-color-ink, #10222b);\n        font-size: 1rem;\n      }\n\n      p {\n        line-height: 1.5;\n      }\n\n      .actions {\n        margin-top: 0.35rem;\n      }\n\n      .actions:empty {\n        display: none;\n      }\n    "] }]
    }], null, { eyebrow: [{
            type: Input
        }], title: [{
            type: Input,
            args: [{ required: true }]
        }], description: [{
            type: Input,
            args: [{ required: true }]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CfmEmptyStateComponent, { className: "CfmEmptyStateComponent" }); })();
