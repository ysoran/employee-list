import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { employeeStore } from '../employee-store.js';
import { i18n } from '../i18n.js';

class EmployeeForm extends LitElement {
  static properties = {
    employeeId: { type: String, reflect: true },
    _formData: { type: Object, state: true },
    _errors: { type: Object, state: true },
    _isEditMode: { type: Boolean, state: true },
    _lang: { type: String, state: true },
  };

  constructor() {
    super();
    this.employeeId = null;
    this._formData = this._defaultFormData();
    this._errors = {};
    this._isEditMode = false;
    this._lang = i18n.getCurrentLanguage();

    // Listen for language changes globally — update texts accordingly
    window.addEventListener('language-changed', this._onLanguageChange);
  }

  static styles = css`
    :host {
      display: block;
      background: #fff;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 1rem auto;
      font-family: Arial, sans-serif;
    }
    h1 {
      color: #ff6600;
      text-align: center;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
      color: #555;
    }
    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-sizing: border-box;
      transition: border-color 0.3s;
    }
    input:focus, select:focus {
      border-color: #ff6600;
      outline: none;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    button {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      color: white;
      font-weight: 600;
    }
    .primary {
      background-color: #ff6600;
    }
    .primary:hover {
      background-color: #e65c00;
    }
    .secondary {
      background-color: #999;
    }
    .secondary:hover {
      background-color: #777;
    }
    .error-message {
      color: red;
      font-size: 0.85rem;
    }
  `;

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('language-changed', this._onLanguageChange);
  }

  firstUpdated() {
    // Grab employeeId from URL if present (e.g. editing mode)
    const match = window.location.pathname.match(/\/edit-employee\/(.+)/);
    if (!this.employeeId && match?.[1]) {
      this.employeeId = match[1];
    }
  }

  updated(changedProps) {
    if (changedProps.has('employeeId')) {
      this._isEditMode = !!this.employeeId;
      if (this._isEditMode) {
        this._loadEmployee(this.employeeId);
      } else {
        this._formData = this._defaultFormData();
      }
    }
  }

  _onLanguageChange = (e) => {
    this._lang = e.detail;
    this.requestUpdate();
  };

  _defaultFormData() {
    return {
      firstName: '',
      lastName: '',
      dateOfEmployment: '',
      dateOfBirth: '',
      phoneNumber: '',
      emailAddress: '',
      department: '',
      position: '',
    };
  }

  _loadEmployee(id) {
    const employee = employeeStore.getEmployeeById(id);
    if (!employee) {
      this._notify('employee-not-found', i18n.getTranslation('employeeNotFound'), 'error');
      Router.go('/employees');
      return;
    }
    // Spread so that internal _formData is a fresh copy
    this._formData = { ...employee };
  }

  _todayAsString() {
    // Return current date in yyyy-mm-dd format for max attribute on date inputs
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  _handleChange(event) {
    const { name, value } = event.target;
    let val = value;

    // Format phone as XXX-XXX-XXXX while typing
    if (name === 'phoneNumber') {
      val = value.replace(/\D/g, '').substring(0, 10);
      if (val.length > 6) {
        val = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}`;
      } else if (val.length > 3) {
        val = `${val.slice(0, 3)}-${val.slice(3)}`;
      }
    }

    // For date fields, normalize to yyyy-mm-dd string
    if (name.includes('date') && value) {
      const dt = new Date(value);
      if (!isNaN(dt.getTime())) {
        val = dt.toISOString().split('T')[0];
      }
    }

    this._formData = { ...this._formData, [name]: val };

    // Clear any existing validation error for this field on change
    if (this._errors[name]) {
      const newErrors = { ...this._errors };
      delete newErrors[name];
      this._errors = newErrors;
    }
  }

  _validateForm() {
    const errors = {};
    let valid = true;

    const requiredFields = ['firstName', 'lastName', 'dateOfEmployment', 'dateOfBirth', 'phoneNumber', 'emailAddress', 'department', 'position'];

    requiredFields.forEach(field => {
      if (!this._formData[field]) {
        errors[field] = i18n.getTranslation('requiredField');
        valid = false;
      }
    });

    if (this._formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._formData.emailAddress)) {
      errors.emailAddress = i18n.getTranslation('invalidEmail');
      valid = false;
    }

    if (this._formData.phoneNumber && !/^\d{3}-\d{3}-\d{4}$/.test(this._formData.phoneNumber)) {
      errors.phoneNumber = i18n.getTranslation('invalidPhone');
      valid = false;
    }

    // Helper to validate date strings properly and check date logic
    const validateDate = (val, fieldName) => {
      if (!val) return;
      const parts = val.split('-').map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      if (
        isNaN(dt.getTime()) ||
        dt.getFullYear() !== parts[0] ||
        dt.getMonth() + 1 !== parts[1] ||
        dt.getDate() !== parts[2] ||
        dt > new Date()  // future date check
      ) {
        errors[fieldName] = i18n.getTranslation('invalidDate');
        valid = false;
      }
    };

    validateDate(this._formData.dateOfEmployment, 'dateOfEmployment');
    validateDate(this._formData.dateOfBirth, 'dateOfBirth');

    // Employment date cannot be before birth date
    if (this._formData.dateOfEmployment && this._formData.dateOfBirth) {
      const empDate = new Date(this._formData.dateOfEmployment);
      const birthDate = new Date(this._formData.dateOfBirth);
      if (empDate < birthDate) {
        errors.dateOfEmployment = i18n.getTranslation('employmentDateAfterBirth');
        valid = false;
      }
    }

    if (valid) {
      // Check if email or phone number are already in use (excluding current record when editing)
      if (employeeStore.isEmailTaken(this._formData.emailAddress, this._isEditMode ? this.employeeId : '')) {
        errors.emailAddress = i18n.getTranslation('emailTaken');
        valid = false;
      }
      if (employeeStore.isPhoneNumberTaken(this._formData.phoneNumber, this._isEditMode ? this.employeeId : '')) {
        errors.phoneNumber = i18n.getTranslation('phoneTaken');
        valid = false;
      }
    }

    this._errors = errors;
    return valid;
  }

  async _handleSubmit(event) {
    event.preventDefault();

    if (!this._validateForm()) {
      await this._showModal(i18n.getTranslation('validationError'), Object.values(this._errors).join('\n'), 'alert', true);
      return;
    }

    const confirmed = await this._showModal(
      i18n.getTranslation('confirmSubmission'),
      i18n.getTranslation('confirmSubmissionMessage'),
      'confirm'
    );

    if (!confirmed) return;

    let message, eventName, success;

    if (this._isEditMode) {
      success = employeeStore.updateEmployee(this._formData);
      message = success ? i18n.getTranslation('employeeUpdatedSuccess') : i18n.getTranslation('uniquenessError');
      eventName = success ? 'employee-saved' : 'employee-error';
    } else {
      success = !!employeeStore.addEmployee(this._formData);
      message = success ? i18n.getTranslation('employeeAddedSuccess') : i18n.getTranslation('uniquenessError');
      eventName = success ? 'employee-saved' : 'employee-error';
    }

    this._notify(eventName, message, success ? 'success' : 'error');

    if (success) Router.go('/employees');
  }

  _handleCancel() {
    Router.go('/employees');
  }

  _notify(eventName, message, type) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail: { message, type },
      bubbles: true,
      composed: true,
    }));
  }

  _showModal(title, message, type, hideCancel = false) {
    return new Promise((resolve) => {
      const modal = document.createElement('confirmation-modal');
      Object.assign(modal, { title, message, type, hideCancel });

      const onModalResult = (e) => {
        resolve(e.detail);
        modal.removeEventListener('modal-result', onModalResult);
        modal.remove();
      };

      modal.addEventListener('modal-result', onModalResult);
      document.body.appendChild(modal);
    });
  }

  render() {
    const departments = ['Analytics', 'Tech', 'HR', 'Marketing', 'Sales'];
    const positions = ['Junior', 'Medior', 'Senior'];

    return html`
      <h1>${this._isEditMode ? i18n.getTranslation('editRecord') : i18n.getTranslation('addRecord')}</h1>
      <form @submit=${this._handleSubmit}>
        <div class="form-grid">
          ${['firstName','lastName','emailAddress','phoneNumber','dateOfBirth','dateOfEmployment'].map(field => html`
            <div class="form-group">
              <label for=${field}>${i18n.getTranslation(field)}:</label>
              <input
                id=${field}
                name=${field}
                type=${field.includes('date') ? 'date' : field.includes('email') ? 'email' : field.includes('phone') ? 'tel' : 'text'}
                .value=${this._formData[field] || ''}
                max=${field.includes('date') ? this._todayAsString() : ''}
                @input=${this._handleChange}
              />
              ${this._errors[field] ? html`<p class="error-message">${this._errors[field]}</p>` : ''}
            </div>
          `)}

          ${['department','position'].map(field => html`
            <div class="form-group">
              <label for=${field}>${i18n.getTranslation(field)}:</label>
              <select id=${field} name=${field} .value=${this._formData[field] || ''} @change=${this._handleChange}>
                <option value="" disabled>${i18n.getTranslation('select' + field.charAt(0).toUpperCase() + field.slice(1))}</option>
                ${(field === 'department' ? departments : positions).map(option => html`
                  <option value=${option}>${i18n.getTranslation(field + option)}</option>
                `)}
              </select>
              ${this._errors[field] ? html`<p class="error-message">${this._errors[field]}</p>` : ''}
            </div>
          `)}
        </div>

        <div class="form-actions">
          <button type="button" class="secondary" @click=${this._handleCancel}>
            ${i18n.getTranslation('cancel')}
          </button>
          <button type="submit" class="primary">
            ${i18n.getTranslation('save')}
          </button>
        </div>
      </form>
    `;
  }
}

customElements.define('employee-form', EmployeeForm);
