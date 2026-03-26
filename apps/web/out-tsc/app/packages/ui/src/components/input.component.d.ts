import { ControlValueAccessor } from "@angular/forms";
import * as i0 from "@angular/core";
export declare class CfmInputComponent implements ControlValueAccessor {
    label: string;
    type: string;
    name: string;
    placeholder: string;
    autocomplete: string;
    hint: string;
    required: boolean;
    disabled: boolean;
    value: string;
    formDisabled: boolean;
    private onChange;
    private onTouched;
    writeValue(value: string | null): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleInput(event: Event): void;
    handleBlur(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CfmInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CfmInputComponent, "cfm-input", never, { "label": { "alias": "label"; "required": true; }; "type": { "alias": "type"; "required": false; }; "name": { "alias": "name"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "autocomplete": { "alias": "autocomplete"; "required": false; }; "hint": { "alias": "hint"; "required": false; }; "required": { "alias": "required"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_required: unknown;
    static ngAcceptInputType_disabled: unknown;
}
//# sourceMappingURL=input.component.d.ts.map