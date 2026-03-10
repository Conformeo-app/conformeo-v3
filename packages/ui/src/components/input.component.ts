import { CommonModule } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "cfm-input",
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CfmInputComponent),
      multi: true
    }
  ],
  template: `
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
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .field {
        display: grid;
        gap: 0.45rem;
      }

      .label,
      .hint {
        color: var(--cfm-color-copy-muted, #4c6471);
      }

      .label {
        font-size: 0.92rem;
      }

      .input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--cfm-color-border, #bfd3cf);
        border-radius: var(--cfm-radius-field, 14px);
        padding: 0.85rem 1rem;
        font: inherit;
        color: var(--cfm-color-ink, #10222b);
        background: var(--cfm-color-surface, #fffdfa);
      }

      .input:focus {
        outline: 2px solid color-mix(in srgb, var(--cfm-color-primary, #1d6d64) 24%, transparent);
        outline-offset: 1px;
        border-color: var(--cfm-color-primary, #1d6d64);
      }

      .input:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .hint {
        line-height: 1.45;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CfmInputComponent implements ControlValueAccessor {
  @Input({ required: true }) label!: string;
  @Input() type = "text";
  @Input() name = "";
  @Input() placeholder = "";
  @Input() autocomplete = "";
  @Input() hint = "";
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) disabled = false;

  value = "";
  formDisabled = false;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? "";
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled = isDisabled;
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.value = target?.value ?? "";
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
