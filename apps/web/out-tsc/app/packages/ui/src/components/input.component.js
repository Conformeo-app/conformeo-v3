import { CommonModule } from "@angular/common";
import { booleanAttribute, ChangeDetectionStrategy, Component, forwardRef, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function CfmInputComponent_small_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.hint);
} }
export class CfmInputComponent {
    label;
    type = "text";
    name = "";
    placeholder = "";
    autocomplete = "";
    hint = "";
    required = false;
    disabled = false;
    value = "";
    formDisabled = false;
    onChange = () => undefined;
    onTouched = () => undefined;
    writeValue(value) {
        this.value = value ?? "";
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.formDisabled = isDisabled;
    }
    handleInput(event) {
        const target = event.target;
        this.value = target?.value ?? "";
        this.onChange(this.value);
    }
    handleBlur() {
        this.onTouched();
    }
    static ɵfac = function CfmInputComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CfmInputComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CfmInputComponent, selectors: [["cfm-input"]], inputs: { label: "label", type: "type", name: "name", placeholder: "placeholder", autocomplete: "autocomplete", hint: "hint", required: [2, "required", "required", booleanAttribute], disabled: [2, "disabled", "disabled", booleanAttribute] }, standalone: true, features: [i0.ɵɵProvidersFeature([
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => CfmInputComponent),
                    multi: true
                }
            ]), i0.ɵɵInputTransformsFeature, i0.ɵɵStandaloneFeature], decls: 5, vars: 9, consts: [[1, "field"], [1, "label"], [1, "input", 3, "input", "blur", "required", "disabled", "value"], ["class", "hint", 4, "ngIf"], [1, "hint"]], template: function CfmInputComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "label", 0)(1, "span", 1);
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "input", 2);
            i0.ɵɵlistener("input", function CfmInputComponent_Template_input_input_3_listener($event) { return ctx.handleInput($event); })("blur", function CfmInputComponent_Template_input_blur_3_listener() { return ctx.handleBlur(); });
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(4, CfmInputComponent_small_4_Template, 2, 1, "small", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.label);
            i0.ɵɵadvance();
            i0.ɵɵproperty("required", ctx.required)("disabled", ctx.disabled || ctx.formDisabled)("value", ctx.value);
            i0.ɵɵattribute("type", ctx.type)("name", ctx.name || null)("placeholder", ctx.placeholder || null)("autocomplete", ctx.autocomplete || null);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.hint);
        } }, dependencies: [CommonModule, i1.NgIf], styles: ["[_nghost-%COMP%] {\n        display: block;\n      }\n\n      .field[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.48rem;\n      }\n\n      .label[_ngcontent-%COMP%], \n   .hint[_ngcontent-%COMP%] {\n        color: var(--cfm-color-copy-muted, #4c6471);\n      }\n\n      .label[_ngcontent-%COMP%] {\n        font-size: 0.92rem;\n        font-weight: 600;\n        letter-spacing: 0.01em;\n      }\n\n      .input[_ngcontent-%COMP%] {\n        width: 100%;\n        box-sizing: border-box;\n        border: 1px solid var(--cfm-color-border, #bfd3cf);\n        border-radius: var(--cfm-radius-field, 14px);\n        padding: 0.85rem 1rem;\n        font: inherit;\n        color: var(--cfm-color-ink, #10222b);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 252, 0.94));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 8px 18px rgba(18, 33, 42, 0.04);\n        transition:\n          border-color 140ms ease,\n          box-shadow 140ms ease,\n          background-color 140ms ease,\n          transform 140ms ease;\n      }\n\n      .input[_ngcontent-%COMP%]:focus {\n        outline: 2px solid color-mix(in srgb, var(--cfm-color-primary, #1d6d64) 18%, transparent);\n        outline-offset: 2px;\n        border-color: var(--cfm-color-primary, #1d6d64);\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.92),\n          0 0 0 4px rgba(29, 109, 100, 0.12),\n          0 12px 28px rgba(18, 33, 42, 0.06);\n        transform: translateY(-1px);\n      }\n\n      .input[_ngcontent-%COMP%]:disabled {\n        opacity: 0.7;\n        cursor: not-allowed;\n      }\n\n      .hint[_ngcontent-%COMP%] {\n        line-height: 1.45;\n      }"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CfmInputComponent, [{
        type: Component,
        args: [{ selector: "cfm-input", standalone: true, imports: [CommonModule], providers: [
                    {
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef(() => CfmInputComponent),
                        multi: true
                    }
                ], template: `
    <label class="field">
      <span class="label">{{ label }}</span>
      <input
        class="input"
        [attr.type]="type"
        [attr.name]="name || null"
        [attr.placeholder]="placeholder || null"
        [attr.autocomplete]="autocomplete || null"
        [required]="required"
        [disabled]="disabled || formDisabled"
        [value]="value"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
      <small class="hint" *ngIf="hint">{{ hint }}</small>
    </label>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["\n      :host {\n        display: block;\n      }\n\n      .field {\n        display: grid;\n        gap: 0.48rem;\n      }\n\n      .label,\n      .hint {\n        color: var(--cfm-color-copy-muted, #4c6471);\n      }\n\n      .label {\n        font-size: 0.92rem;\n        font-weight: 600;\n        letter-spacing: 0.01em;\n      }\n\n      .input {\n        width: 100%;\n        box-sizing: border-box;\n        border: 1px solid var(--cfm-color-border, #bfd3cf);\n        border-radius: var(--cfm-radius-field, 14px);\n        padding: 0.85rem 1rem;\n        font: inherit;\n        color: var(--cfm-color-ink, #10222b);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 252, 0.94));\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.9),\n          0 8px 18px rgba(18, 33, 42, 0.04);\n        transition:\n          border-color 140ms ease,\n          box-shadow 140ms ease,\n          background-color 140ms ease,\n          transform 140ms ease;\n      }\n\n      .input:focus {\n        outline: 2px solid color-mix(in srgb, var(--cfm-color-primary, #1d6d64) 18%, transparent);\n        outline-offset: 2px;\n        border-color: var(--cfm-color-primary, #1d6d64);\n        box-shadow:\n          inset 0 1px 0 rgba(255, 255, 255, 0.92),\n          0 0 0 4px rgba(29, 109, 100, 0.12),\n          0 12px 28px rgba(18, 33, 42, 0.06);\n        transform: translateY(-1px);\n      }\n\n      .input:disabled {\n        opacity: 0.7;\n        cursor: not-allowed;\n      }\n\n      .hint {\n        line-height: 1.45;\n      }\n    "] }]
    }], null, { label: [{
            type: Input,
            args: [{ required: true }]
        }], type: [{
            type: Input
        }], name: [{
            type: Input
        }], placeholder: [{
            type: Input
        }], autocomplete: [{
            type: Input
        }], hint: [{
            type: Input
        }], required: [{
            type: Input,
            args: [{ transform: booleanAttribute }]
        }], disabled: [{
            type: Input,
            args: [{ transform: booleanAttribute }]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CfmInputComponent, { className: "CfmInputComponent" }); })();
