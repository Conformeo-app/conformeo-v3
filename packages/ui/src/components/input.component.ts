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
        gap: 0.4rem;
      }

      .label,
      .hint {
        color: var(--cfm-color-copy-muted, #4c6471);
      }

      .label {
        font-size: 0.82rem;
        font-weight: 500;
        letter-spacing: 0.02em;
      }

      .input {
        width: 100%;
        box-sizing: border-box;
        border: 0;
        border-bottom: 1px solid color-mix(in srgb, var(--cfm-color-copy-muted, #46464d) 40%, transparent);
        border-radius: 0;
        padding: 0.55rem 0 0.52rem;
        font: inherit;
        color: var(--cfm-color-ink, #1e2b3a);
        background: transparent;
        transition:
          border-color 140ms ease,
          color 140ms ease;
      }

      .input:focus {
        outline: none;
        border-color: var(--cfm-color-secondary, #ffdea5);
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
