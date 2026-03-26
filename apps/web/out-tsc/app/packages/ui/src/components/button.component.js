import { CommonModule } from "@angular/common";
import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class CfmButtonComponent {
    variant = "primary";
    size = "md";
    type = "button";
    disabled = false;
    block = false;
    static ɵfac = function CfmButtonComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CfmButtonComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CfmButtonComponent, selectors: [["cfm-button"]], hostVars: 1, hostBindings: function CfmButtonComponent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-block", ctx.block ? "" : null);
        } }, inputs: { variant: "variant", size: "size", type: "type", disabled: [2, "disabled", "disabled", booleanAttribute], block: [2, "block", "block", booleanAttribute] }, standalone: true, features: [i0.ɵɵInputTransformsFeature, i0.ɵɵStandaloneFeature], ngContentSelectors: _c0, decls: 2, vars: 5, consts: [[1, "button", 3, "disabled"]], template: function CfmButtonComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "button", 0);
            i0.ɵɵprojection(1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("disabled", ctx.disabled);
            i0.ɵɵattribute("type", ctx.type)("data-variant", ctx.variant)("data-size", ctx.size)("data-block", ctx.block ? "" : null);
        } }, dependencies: [CommonModule], styles: ["[_nghost-%COMP%] {\n        display: inline-flex;\n      }\n\n      [data-block][_nghost-%COMP%] {\n        display: block;\n      }\n\n      .button[_ngcontent-%COMP%] {\n        width: auto;\n        display: inline-flex;\n        justify-content: center;\n        align-items: center;\n        gap: 0.5rem;\n        border: 0;\n        border-radius: var(--cfm-radius-pill, 999px);\n        padding: 0.92rem 1.28rem;\n        font: inherit;\n        font-weight: 700;\n        letter-spacing: 0.01em;\n        cursor: pointer;\n        box-shadow:\n          0 10px 24px rgba(18, 33, 42, 0.08),\n          0 1px 0 rgba(255, 255, 255, 0.32) inset;\n        transition:\n          transform 140ms ease,\n          opacity 140ms ease,\n          background-color 140ms ease,\n          box-shadow 140ms ease,\n          border-color 140ms ease;\n      }\n\n      .button[_ngcontent-%COMP%]:hover:not(:disabled) {\n        transform: translateY(-2px);\n        box-shadow:\n          0 14px 30px rgba(18, 33, 42, 0.12),\n          0 1px 0 rgba(255, 255, 255, 0.36) inset;\n      }\n\n      .button[_ngcontent-%COMP%]:active:not(:disabled) {\n        transform: translateY(0);\n      }\n\n      .button[data-size=\"sm\"][_ngcontent-%COMP%] {\n        padding: 0.65rem 0.95rem;\n        font-size: 0.92rem;\n      }\n\n      .button[data-block][_ngcontent-%COMP%] {\n        width: 100%;\n      }\n\n      .button[data-variant=\"primary\"][_ngcontent-%COMP%] {\n        color: #ffffff;\n        background:\n          linear-gradient(135deg, color-mix(in srgb, var(--cfm-color-primary, #1d6d64) 94%, #ffffff 6%), #154f49);\n      }\n\n      .button[data-variant=\"secondary\"][_ngcontent-%COMP%] {\n        color: var(--cfm-color-ink, #18323e);\n        background: linear-gradient(180deg, #ffffff, var(--cfm-color-surface-muted, #d9e4e7));\n        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 78%, transparent);\n      }\n\n      .button[data-variant=\"ghost\"][_ngcontent-%COMP%] {\n        color: var(--cfm-color-primary, #1d6d64);\n        background: rgba(255, 255, 255, 0.52);\n        border: 1px solid var(--cfm-color-border, #bfd3cf);\n      }\n\n      .button[data-variant=\"danger\"][_ngcontent-%COMP%] {\n        color: #ffffff;\n        background: linear-gradient(135deg, var(--cfm-color-danger, #b03d2e), #8a2d2d);\n      }\n\n      .button[_ngcontent-%COMP%]:disabled {\n        opacity: 0.64;\n        cursor: wait;\n        transform: none;\n        box-shadow: none;\n      }"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CfmButtonComponent, [{
        type: Component,
        args: [{ selector: "cfm-button", standalone: true, imports: [CommonModule], template: `
    <button
      class="button"
      [attr.type]="type"
      [attr.data-variant]="variant"
      [attr.data-size]="size"
      [attr.data-block]="block ? '' : null"
      [disabled]="disabled"
    >
      <ng-content />
    </button>
  `, host: {
                    "[attr.data-block]": "block ? '' : null"
                }, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["\n      :host {\n        display: inline-flex;\n      }\n\n      :host([data-block]) {\n        display: block;\n      }\n\n      .button {\n        width: auto;\n        display: inline-flex;\n        justify-content: center;\n        align-items: center;\n        gap: 0.5rem;\n        border: 0;\n        border-radius: var(--cfm-radius-pill, 999px);\n        padding: 0.92rem 1.28rem;\n        font: inherit;\n        font-weight: 700;\n        letter-spacing: 0.01em;\n        cursor: pointer;\n        box-shadow:\n          0 10px 24px rgba(18, 33, 42, 0.08),\n          0 1px 0 rgba(255, 255, 255, 0.32) inset;\n        transition:\n          transform 140ms ease,\n          opacity 140ms ease,\n          background-color 140ms ease,\n          box-shadow 140ms ease,\n          border-color 140ms ease;\n      }\n\n      .button:hover:not(:disabled) {\n        transform: translateY(-2px);\n        box-shadow:\n          0 14px 30px rgba(18, 33, 42, 0.12),\n          0 1px 0 rgba(255, 255, 255, 0.36) inset;\n      }\n\n      .button:active:not(:disabled) {\n        transform: translateY(0);\n      }\n\n      .button[data-size=\"sm\"] {\n        padding: 0.65rem 0.95rem;\n        font-size: 0.92rem;\n      }\n\n      .button[data-block] {\n        width: 100%;\n      }\n\n      .button[data-variant=\"primary\"] {\n        color: #ffffff;\n        background:\n          linear-gradient(135deg, color-mix(in srgb, var(--cfm-color-primary, #1d6d64) 94%, #ffffff 6%), #154f49);\n      }\n\n      .button[data-variant=\"secondary\"] {\n        color: var(--cfm-color-ink, #18323e);\n        background: linear-gradient(180deg, #ffffff, var(--cfm-color-surface-muted, #d9e4e7));\n        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 78%, transparent);\n      }\n\n      .button[data-variant=\"ghost\"] {\n        color: var(--cfm-color-primary, #1d6d64);\n        background: rgba(255, 255, 255, 0.52);\n        border: 1px solid var(--cfm-color-border, #bfd3cf);\n      }\n\n      .button[data-variant=\"danger\"] {\n        color: #ffffff;\n        background: linear-gradient(135deg, var(--cfm-color-danger, #b03d2e), #8a2d2d);\n      }\n\n      .button:disabled {\n        opacity: 0.64;\n        cursor: wait;\n        transform: none;\n        box-shadow: none;\n      }\n    "] }]
    }], null, { variant: [{
            type: Input
        }], size: [{
            type: Input
        }], type: [{
            type: Input
        }], disabled: [{
            type: Input,
            args: [{ transform: booleanAttribute }]
        }], block: [{
            type: Input,
            args: [{ transform: booleanAttribute }]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CfmButtonComponent, { className: "CfmButtonComponent" }); })();
