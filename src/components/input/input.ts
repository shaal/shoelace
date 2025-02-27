import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import styles from './input.styles';
import '~/components/icon/icon';
import { autoIncrement } from '~/internal/auto-increment';
import { emit } from '~/internal/event';
import { FormSubmitController, getLabelledBy, renderFormControl } from '~/internal/form-control';
import { HasSlotController } from '~/internal/slot';
import { watch } from '~/internal/watch';

/**
 * @since 2.0
 * @status stable
 *
 * @dependency sl-icon
 *
 * @slot label - The input's label. Alternatively, you can use the label prop.
 * @slot prefix - Used to prepend an icon or similar element to the input.
 * @slot suffix - Used to append an icon or similar element to the input.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot show-password-icon - An icon to use in lieu of the default show password icon.
 * @slot hide-password-icon - An icon to use in lieu of the default hide password icon.
 * @slot help-text - Help text that describes how to use the input. Alternatively, you can use the help-text prop.
 *
 * @event sl-change - Emitted when the control's value changes.
 * @event sl-clear - Emitted when the clear button is activated.
 * @event sl-input - Emitted when the control receives input.
 * @event sl-focus - Emitted when the control gains focus.
 * @event sl-blur - Emitted when the control loses focus.
 *
 * @csspart base - The component's base wrapper.
 * @csspart form-control - The form control that wraps the label, input, and help-text.
 * @csspart label - The input label.
 * @csspart input - The input control.
 * @csspart prefix - The input prefix container.
 * @csspart clear-button - The clear button.
 * @csspart password-toggle-button - The password toggle button.
 * @csspart suffix - The input suffix container.
 * @csspart help-text - The input help text.
 */
@customElement('sl-input')
export default class SlInput extends LitElement {
  static styles = styles;

  @query('.input__control') input: HTMLInputElement;

  // @ts-expect-error -- Controller is currently unused
  private readonly formSubmitController = new FormSubmitController(this);
  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');
  private readonly attrId = autoIncrement();
  private readonly inputId = `input-${this.attrId}`;
  private readonly helpTextId = `input-help-text-${this.attrId}`;
  private readonly labelId = `input-label-${this.attrId}`;

  @state() private hasFocus = false;
  @state() private isPasswordVisible = false;

  /** The input's type. */
  @property({ reflect: true }) type: 'date' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' =
    'text';

  /** The input's size. */
  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';

  /** The input's name attribute. */
  @property() name: string;

  /** The input's value attribute. */
  @property() value = '';

  /** Draws a filled input. */
  @property({ type: Boolean, reflect: true }) filled = false;

  /** Draws a pill-style input with rounded edges. */
  @property({ type: Boolean, reflect: true }) pill = false;

  /** The input's label. Alternatively, you can use the label slot. */
  @property() label = '';

  /** The input's help text. Alternatively, you can use the help-text slot. */
  @property({ attribute: 'help-text' }) helpText = '';

  /** Adds a clear button when the input is populated. */
  @property({ type: Boolean }) clearable = false;

  /** Adds a password toggle button to password inputs. */
  @property({ attribute: 'toggle-password', type: Boolean }) togglePassword = false;

  /** The input's placeholder text. */
  @property() placeholder: string;

  /** Disables the input. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Makes the input readonly. */
  @property({ type: Boolean, reflect: true }) readonly = false;

  /** The minimum length of input that will be considered valid. */
  @property({ type: Number }) minlength: number;

  /** The maximum length of input that will be considered valid. */
  @property({ type: Number }) maxlength: number;

  /** The input's minimum value. */
  @property() min: number | string;

  /** The input's maximum value. */
  @property() max: number | string;

  /** The input's step attribute. */
  @property({ type: Number }) step: number;

  /** A pattern to validate input against. */
  @property() pattern: string;

  /** Makes the input a required field. */
  @property({ type: Boolean, reflect: true }) required = false;

  /**
   * This will be true when the control is in an invalid state. Validity is determined by props such as `type`,
   * `required`, `minlength`, `maxlength`, and `pattern` using the browser's constraint validation API.
   */
  @property({ type: Boolean, reflect: true }) invalid = false;

  /** The input's autocapitalize attribute. */
  @property() autocapitalize: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

  /** The input's autocorrect attribute. */
  @property() autocorrect: string;

  /** The input's autocomplete attribute. */
  @property() autocomplete: string;

  /** The input's autofocus attribute. */
  @property({ type: Boolean }) autofocus: boolean;

  /** Enables spell checking on the input. */
  @property({ type: Boolean }) spellcheck: boolean;

  /** The input's inputmode attribute. */
  @property() inputmode: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /** Gets or sets the current value as a `Date` object. Only valid when `type` is `date`. */
  get valueAsDate() {
    return this.input.valueAsDate!;
  }

  set valueAsDate(newValue: Date) {
    this.input.valueAsDate = newValue;
    this.value = this.input.value;
  }

  /** Gets or sets the current value as a number. */
  get valueAsNumber() {
    return this.input.valueAsNumber;
  }

  set valueAsNumber(newValue: number) {
    this.input.valueAsNumber = newValue;
    this.value = this.input.value;
  }

  firstUpdated() {
    this.invalid = !this.input.checkValidity();
  }

  /** Sets focus on the input. */
  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the input. */
  blur() {
    this.input.blur();
  }

  /** Selects all the text in the input. */
  select() {
    this.input.select();
  }

  /** Sets the start and end positions of the text selection (0-based). */
  setSelectionRange(
    selectionStart: number,
    selectionEnd: number,
    selectionDirection: 'forward' | 'backward' | 'none' = 'none'
  ) {
    this.input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }

  /** Replaces a range of text with a new string. */
  setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    this.input.setRangeText(replacement, start, end, selectMode);

    if (this.value !== this.input.value) {
      this.value = this.input.value;
      emit(this, 'sl-input');
      emit(this, 'sl-change');
    }
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.input.reportValidity();
  }

  /** Sets a custom validation message. If `message` is not empty, the field will be considered invalid. */
  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  handleBlur() {
    this.hasFocus = false;
    emit(this, 'sl-blur');
  }

  handleChange() {
    this.value = this.input.value;
    emit(this, 'sl-change');
  }

  handleClearClick(event: MouseEvent) {
    this.value = '';
    emit(this, 'sl-clear');
    emit(this, 'sl-input');
    emit(this, 'sl-change');
    this.input.focus();

    event.stopPropagation();
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  handleDisabledChange() {
    // Disabled form controls are always valid, so we need to recheck validity when the state changes
    this.input.disabled = this.disabled;
    this.invalid = !this.input.checkValidity();
  }

  handleFocus() {
    this.hasFocus = true;
    emit(this, 'sl-focus');
  }

  handleInput() {
    this.value = this.input.value;
    emit(this, 'sl-input');
  }

  handleInvalid() {
    this.invalid = true;
  }

  handlePasswordToggle() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  @watch('value', { waitUntilFirstUpdate: true })
  handleValueChange() {
    this.invalid = !this.input.checkValidity();
  }

  render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');

    // NOTE - always bind value after min/max, otherwise it will be clamped
    return renderFormControl(
      {
        inputId: this.inputId,
        label: this.label,
        labelId: this.labelId,
        hasLabelSlot,
        helpTextId: this.helpTextId,
        helpText: this.helpText,
        hasHelpTextSlot,
        size: this.size
      },
      html`
        <div
          part="base"
          class=${classMap({
            input: true,

            // Sizes
            'input--small': this.size === 'small',
            'input--medium': this.size === 'medium',
            'input--large': this.size === 'large',

            // States
            'input--pill': this.pill,
            'input--standard': !this.filled,
            'input--filled': this.filled,
            'input--disabled': this.disabled,
            'input--focused': this.hasFocus,
            'input--empty': this.value.length === 0,
            'input--invalid': this.invalid
          })}
        >
          <span part="prefix" class="input__prefix">
            <slot name="prefix"></slot>
          </span>

          <input
            part="input"
            id=${this.inputId}
            class="input__control"
            type=${this.type === 'password' && this.isPasswordVisible ? 'text' : this.type}
            name=${ifDefined(this.name)}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            placeholder=${ifDefined(this.placeholder)}
            minlength=${ifDefined(this.minlength)}
            maxlength=${ifDefined(this.maxlength)}
            min=${ifDefined(this.min)}
            max=${ifDefined(this.max)}
            step=${ifDefined(this.step)}
            .value=${live(this.value)}
            autocapitalize=${ifDefined(this.autocapitalize)}
            autocomplete=${ifDefined(this.autocomplete)}
            autocorrect=${ifDefined(this.autocorrect)}
            ?autofocus=${this.autofocus}
            spellcheck=${ifDefined(this.spellcheck)}
            pattern=${ifDefined(this.pattern)}
            inputmode=${ifDefined(this.inputmode)}
            aria-labelledby=${ifDefined(
              getLabelledBy({
                label: this.label,
                labelId: this.labelId,
                hasLabelSlot,
                helpText: this.helpText,
                helpTextId: this.helpTextId,
                hasHelpTextSlot
              })
            )}
            aria-invalid=${this.invalid ? 'true' : 'false'}
            @change=${this.handleChange}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          />

          ${this.clearable && this.value.length > 0
            ? html`
                <button
                  part="clear-button"
                  class="input__clear"
                  type="button"
                  @click=${this.handleClearClick}
                  tabindex="-1"
                >
                  <slot name="clear-icon">
                    <sl-icon name="x-circle-fill" library="system"></sl-icon>
                  </slot>
                </button>
              `
            : ''}
          ${this.togglePassword
            ? html`
                <button
                  part="password-toggle-button"
                  class="input__password-toggle"
                  type="button"
                  @click=${this.handlePasswordToggle}
                  tabindex="-1"
                >
                  ${this.isPasswordVisible
                    ? html`
                        <slot name="show-password-icon">
                          <sl-icon name="eye-slash" library="system"></sl-icon>
                        </slot>
                      `
                    : html`
                        <slot name="hide-password-icon">
                          <sl-icon name="eye" library="system"></sl-icon>
                        </slot>
                      `}
                </button>
              `
            : ''}

          <span part="suffix" class="input__suffix">
            <slot name="suffix"></slot>
          </span>
        </div>
      `
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-input': SlInput;
  }
}
