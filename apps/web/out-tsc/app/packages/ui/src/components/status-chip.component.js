import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import * as i0 from "@angular/core";
export class CfmStatusChipComponent {
    label;
    tone = "neutral";
    static ɵfac = function CfmStatusChipComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CfmStatusChipComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CfmStatusChipComponent, selectors: [["cfm-status-chip"]], inputs: { label: "label", tone: "tone" }, standalone: true, features: [i0.ɵɵStandaloneFeature], decls: 2, vars: 2, consts: [[1, "chip"]], template: function CfmStatusChipComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "span", 0);
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵattribute("data-tone", ctx.tone);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.label);
        } }, styles: ["[_nghost-%COMP%] {\n        display: inline-flex;\n      }\n\n      .chip[_ngcontent-%COMP%] {\n        position: relative;\n        display: inline-flex;\n        align-items: center;\n        gap: 0.4rem;\n        width: fit-content;\n        padding: 0.38rem 0.78rem;\n        border-radius: var(--cfm-radius-pill, 999px);\n        font-size: 0.82rem;\n        font-weight: 700;\n        border: 1px solid rgba(16, 34, 43, 0.05);\n        box-shadow:\n          0 6px 16px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.72);\n      }\n\n      .chip[_ngcontent-%COMP%]::before {\n        content: \"\";\n        width: 0.45rem;\n        height: 0.45rem;\n        border-radius: 999px;\n        background: currentColor;\n        opacity: 0.7;\n      }\n\n      .chip[data-tone=\"neutral\"][_ngcontent-%COMP%] {\n        background: linear-gradient(180deg, #f2f5f6, #e9eeef);\n        color: #3f5762;\n      }\n\n      .chip[data-tone=\"calm\"][_ngcontent-%COMP%] {\n        background: linear-gradient(180deg, #edf8f5, #e6f2ef);\n        color: #1e5d54;\n      }\n\n      .chip[data-tone=\"progress\"][_ngcontent-%COMP%] {\n        background: linear-gradient(180deg, #fff6e1, #fff1d4);\n        color: #8f5e00;\n      }\n\n      .chip[data-tone=\"success\"][_ngcontent-%COMP%] {\n        background: linear-gradient(180deg, #e8f8ee, #ddf4e6);\n        color: #1d6a3d;\n      }\n\n      .chip[data-tone=\"warning\"][_ngcontent-%COMP%] {\n        background: linear-gradient(180deg, #fee9e3, #fde2dc);\n        color: #8a2d2d;\n      }\n\n      .chip[data-tone=\"danger\"][_ngcontent-%COMP%] {\n        background: linear-gradient(180deg, #fbe2dc, #f7d7d2);\n        color: #8e2f23;\n      }"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CfmStatusChipComponent, [{
        type: Component,
        args: [{ selector: "cfm-status-chip", standalone: true, template: `
    <span class="chip" [attr.data-tone]="tone">{{ label }}</span>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["\n      :host {\n        display: inline-flex;\n      }\n\n      .chip {\n        position: relative;\n        display: inline-flex;\n        align-items: center;\n        gap: 0.4rem;\n        width: fit-content;\n        padding: 0.38rem 0.78rem;\n        border-radius: var(--cfm-radius-pill, 999px);\n        font-size: 0.82rem;\n        font-weight: 700;\n        border: 1px solid rgba(16, 34, 43, 0.05);\n        box-shadow:\n          0 6px 16px rgba(18, 33, 42, 0.05),\n          inset 0 1px 0 rgba(255, 255, 255, 0.72);\n      }\n\n      .chip::before {\n        content: \"\";\n        width: 0.45rem;\n        height: 0.45rem;\n        border-radius: 999px;\n        background: currentColor;\n        opacity: 0.7;\n      }\n\n      .chip[data-tone=\"neutral\"] {\n        background: linear-gradient(180deg, #f2f5f6, #e9eeef);\n        color: #3f5762;\n      }\n\n      .chip[data-tone=\"calm\"] {\n        background: linear-gradient(180deg, #edf8f5, #e6f2ef);\n        color: #1e5d54;\n      }\n\n      .chip[data-tone=\"progress\"] {\n        background: linear-gradient(180deg, #fff6e1, #fff1d4);\n        color: #8f5e00;\n      }\n\n      .chip[data-tone=\"success\"] {\n        background: linear-gradient(180deg, #e8f8ee, #ddf4e6);\n        color: #1d6a3d;\n      }\n\n      .chip[data-tone=\"warning\"] {\n        background: linear-gradient(180deg, #fee9e3, #fde2dc);\n        color: #8a2d2d;\n      }\n\n      .chip[data-tone=\"danger\"] {\n        background: linear-gradient(180deg, #fbe2dc, #f7d7d2);\n        color: #8e2f23;\n      }\n    "] }]
    }], null, { label: [{
            type: Input,
            args: [{ required: true }]
        }], tone: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CfmStatusChipComponent, { className: "CfmStatusChipComponent" }); })();
