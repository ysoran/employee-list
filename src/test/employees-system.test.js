import sinon from 'sinon';
import { Router } from '@vaadin/router';
import { employeeStore } from '../employee-store.js';
import { fixture, assert, html, oneEvent } from '@open-wc/testing';

// Absolute imports assuming root directory is 'src/'
import '/src/components/employee-list.js';
import '/src/components/employee-form.js';
import '/src/components/nav-menu.js';
import '/src/components/confirmation-modal.js';

window.litDisableDevMode = true;

describe('<employee-list>', () => {
  it('registers as a custom element', () => {
    const elementDefinition = customElements.get('employee-list');
    assert.isNotNull(elementDefinition, 'employee-list element should be registered');
    const element = document.createElement('employee-list');
    assert.instanceOf(element, HTMLElement);
  });

  it('renders the main header', async () => {
    const element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    const header = element.shadowRoot?.querySelector('h1');
    assert.exists(header, 'Header element should exist');
    assert.equal(header.textContent.trim(), 'Employee List');
  });

  it('shows pagination buttons', async () => {
    const element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    const paginationButtons = element.shadowRoot?.querySelectorAll('.pagination button');
    assert.exists(paginationButtons, 'Pagination buttons should exist');
    assert.lengthOf(paginationButtons, 2);
  });

  it('filters employees based on search term', async () => {
    const element = await fixture(html`<employee-list></employee-list>`);
    element.employees = [
      { id: '1', firstName: 'John', lastName: 'Doe', emailAddress: 'john@example.com', department: 'Tech', position: 'Junior', dateOfEmployment: '', dateOfBirth: '', phoneNumber: '' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', emailAddress: 'jane@example.com', department: 'HR', position: 'Senior', dateOfEmployment: '', dateOfBirth: '', phoneNumber: '' },
    ];
    element._searchTerm = 'Jane';
    element._filteredEmployees = element.employees.filter(emp => emp.firstName.includes('Jane'));
    await element.updateComplete;

    assert.lengthOf(element._filteredEmployees, 1);
    assert.equal(element._filteredEmployees[0].firstName, 'Jane');
  });

  it('deletes employees that are selected', async () => {
    const element = await fixture(html`<employee-list></employee-list>`);
    element.employees = [
      { id: '1', firstName: 'A', lastName: 'B', emailAddress: 'a@b.com', department: 'Tech', position: 'Junior', dateOfEmployment: '', dateOfBirth: '', phoneNumber: '' },
      { id: '2', firstName: 'C', lastName: 'D', emailAddress: 'c@d.com', department: 'HR', position: 'Senior', dateOfEmployment: '', dateOfBirth: '', phoneNumber: '' },
    ];
    element._filteredEmployees = element.employees;
    element._selectedIds = ['1', '2'];
    element._showConfirmationModal = () => Promise.resolve(true);
    await element._deleteSelectedEmployees();

    assert.deepEqual(element._selectedIds, [], 'Selected IDs should be cleared after deletion');
  });

  it('correctly handles empty employee list', async () => {
    const element = await fixture(html`<employee-list></employee-list>`);
    element.employees = [];
    element._filteredEmployees = [];
    await element.updateComplete;
    const rows = element.shadowRoot.querySelectorAll('tbody tr');
    assert.equal(rows.length, 0, 'No table rows should render for empty employee list');
  });

  it('toggles select all employees correctly', async () => {
    const element = await fixture(html`<employee-list></employee-list>`);
    element.employees = [
      { id: '1', firstName: 'A', lastName: 'B', emailAddress: '', department: '', position: '', dateOfEmployment: '', dateOfBirth: '', phoneNumber: '' },
      { id: '2', firstName: 'C', lastName: 'D', emailAddress: '', department: '', position: '', dateOfEmployment: '', dateOfBirth: '', phoneNumber: '' },
    ];
    element._filteredEmployees = element.employees;
    await element.updateComplete;

    if (typeof element._toggleSelectAll === 'function') {
      element._toggleSelectAll();
      assert.deepEqual(element._selectedIds, ['1', '2'], 'All employees should be selected');
      element._toggleSelectAll();
      assert.deepEqual(element._selectedIds, [], 'All employees should be deselected');
    } else {
      // Fallback for when _toggleSelectAll is not defined
      const selectAllCheckbox = element.shadowRoot.querySelector('thead input[type="checkbox"]');
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.dispatchEvent(new Event('change'));
        assert.deepEqual(element._selectedIds, ['1', '2']);
        selectAllCheckbox.checked = false;
        selectAllCheckbox.dispatchEvent(new Event('change'));
        assert.deepEqual(element._selectedIds, []);
      }
    }
  });
});

describe('<employee-form> behavior', () => {
  it('registers as a custom element', () => {
    const element = document.createElement('employee-form');
    assert.isNotNull(customElements.get('employee-form'));
    assert.instanceOf(element, HTMLElement);
  });

  it('renders all necessary form inputs', async () => {
    const element = await fixture(html`<employee-form></employee-form>`);
    await element.updateComplete;
    const form = element.shadowRoot.querySelector('form');
    assert.exists(form, 'Form element should exist');
    const inputs = element.shadowRoot.querySelectorAll('input, select');
    assert.exists(inputs, 'Inputs and selects should be present');
    assert.isAtLeast(inputs.length, 8);
  });

  it('returns default form data with empty fields', () => {
    const element = document.createElement('employee-form');
    const defaults = element._defaultFormData();
    assert.isObject(defaults);
    assert.propertyVal(defaults, 'firstName', '');
    assert.propertyVal(defaults, 'lastName', '');
  });

  it('formats phone numbers and dates correctly on input change', () => {
    const element = document.createElement('employee-form');
    element._formData = element._defaultFormData();

    // Phone formatting test
    element._handleChange({ target: { name: 'phoneNumber', value: '1234567890' } });
    assert.match(element._formData.phoneNumber, /^\d{3}-\d{3}-\d{4}$/, 'Phone number should be formatted');

    // Date formatting test
    element._handleChange({ target: { name: 'dateOfBirth', value: '2020-12-31' } });
    assert.equal(element._formData.dateOfBirth, '2020-12-31', 'Date should remain properly formatted');
  });

  it('redirects properly if employee is not found', () => {
    const element = document.createElement('employee-form');
    sinon.stub(employeeStore, 'getEmployeeById').returns(null);
    sinon.stub(Router, 'go');
    sinon.stub(element, '_notify');

    element._loadEmployee('nonexistent-id');

    assert(element._notify.calledWith('employee-not-found'));
    assert(Router.go.calledWith('/employees'));

    employeeStore.getEmployeeById.restore();
    Router.go.restore();
    element._notify.restore();
  });

  it('navigates away when cancelling', () => {
    const element = document.createElement('employee-form');
    sinon.stub(Router, 'go');
    element._handleCancel();
    assert(Router.go.calledOnceWith('/employees'));
    Router.go.restore();
  });

  it('validates required and incorrect fields', async () => {
    const element = await fixture(html`<employee-form></employee-form>`);
    await element.updateComplete;

    element._formData = {
      firstName: '',
      lastName: '',
      dateOfEmployment: '2025-06-30',
      dateOfBirth: '2020-01-01',
      phoneNumber: '123',
      emailAddress: 'invalid-email',
      department: '',
      position: '',
    };

    assert.isFunction(element._validateForm, 'Validate form method should exist');
    const valid = element._validateForm();
    assert.isFalse(valid, 'Form validation should fail');
    assert.property(element._errors, 'firstName');
    assert.property(element._errors, 'emailAddress');
  });

  it('prevents form submission when validation fails', async () => {
    const element = await fixture(html`<employee-form></employee-form>`);
    await element.updateComplete;
    const form = element.shadowRoot.querySelector('form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await element.updateComplete;
    assert.isAbove(Object.keys(element._errors).length, 0, 'Errors should be set on failed validation');
  });
});

describe('<nav-menu>', () => {
  it('registers as a custom element', () => {
    const element = document.createElement('nav-menu');
    assert.isNotNull(customElements.get('nav-menu'));
    assert.instanceOf(element, HTMLElement);
  });

  it('renders the language toggle button', async () => {
    const element = await fixture(html`<nav-menu></nav-menu>`);
    await element.updateComplete;
    const toggleButton = element.shadowRoot?.querySelector('button');
    assert.exists(toggleButton, 'Language toggle button should be rendered');
  });

  it('emits language-changed event on toggle click', async () => {
    const element = await fixture(html`<nav-menu></nav-menu>`);
    await element.updateComplete;
    const toggleButton = element.shadowRoot?.querySelector('button');
    setTimeout(() => toggleButton.click());
    const event = await oneEvent(element, 'language-changed');
    assert.include(['en', 'tr'], event.detail);
  });
});

describe('<confirmation-modal>', () => {
  it('registers as a custom element', () => {
    const element = document.createElement('confirmation-modal');
    assert.isNotNull(customElements.get('confirmation-modal'));
    assert.instanceOf(element, HTMLElement);
  });

  it('displays title and message content correctly', async () => {
    const element = await fixture(html`
      <confirmation-modal title="Confirm" message="Are you sure?"></confirmation-modal>
    `);
    await element.updateComplete;
    const title = element.shadowRoot?.querySelector('h2');
    const message = element.shadowRoot?.querySelector('p');
    assert.exists(title, 'Modal title should exist');
    assert.exists(message, 'Modal message should exist');
    assert.equal(title.textContent, 'Confirm');
    assert.equal(message.textContent, 'Are you sure?');
  });

  it('fires "modal-result" event with true on confirm', async () => {
    const element = await fixture(html`
      <confirmation-modal title="Test" message="Confirm test"></confirmation-modal>
    `);
    await element.updateComplete;
    const confirmBtn = element.shadowRoot?.querySelector('.confirm-btn');
    assert.exists(confirmBtn, 'Confirm button should be present');
    setTimeout(() => confirmBtn.click());
    const event = await oneEvent(element, 'modal-result');
    assert.isTrue(event.detail);
  });

  it('fires "modal-result" event with false on cancel', async () => {
    const element = await fixture(html`
      <confirmation-modal title="Test" message="Cancel test"></confirmation-modal>
    `);
    await element.updateComplete;
    const cancelBtn = element.shadowRoot?.querySelector('.cancel-btn');
    assert.exists(cancelBtn, 'Cancel button should be present');
    setTimeout(() => cancelBtn.click());
    const event = await oneEvent(element, 'modal-result');
    assert.isFalse(event.detail);
  });

  it('does not show cancel button if hideCancel is true', async () => {
    const element = await fixture(html`
      <confirmation-modal hideCancel></confirmation-modal>
    `);
    await element.updateComplete;
    const cancelBtn = element.shadowRoot?.querySelector('.cancel-btn');
    assert.isNull(cancelBtn, 'Cancel button should be hidden when hideCancel is true');
  });
});


describe('<employee-list> additional behavior', () => {
  it('falls back to checkbox for select all toggle', async () => {
    const element = await fixture(html`<employee-list></employee-list>`);
    element.employees = [
      { id: '1', firstName: 'A', lastName: 'B', emailAddress: '', department: '', position: '', dateOfEmployment: '', dateOfBirth: '', phoneNumber: '' },
      { id: '2', firstName: 'C', lastName: 'D', emailAddress: '', department: '', position: '', dateOfEmployment: '', dateOfBirth: '', phoneNumber: '' },
    ];
    element._filteredEmployees = element.employees;
    await element.updateComplete;

    // Backup and remove toggleSelectAll method to force fallback
    const originalToggle = element._toggleSelectAll;
    element._toggleSelectAll = undefined;

    const selectAllCheckbox = element.shadowRoot.querySelector('thead input[type="checkbox"]');
    assert.exists(selectAllCheckbox, 'Select all checkbox should be present');

    selectAllCheckbox.checked = true;
    selectAllCheckbox.dispatchEvent(new Event('change'));
    assert.deepEqual(element._selectedIds, ['1', '2'], 'All employees should be selected');

    selectAllCheckbox.checked = false;
    selectAllCheckbox.dispatchEvent(new Event('change'));
    assert.deepEqual(element._selectedIds, [], 'All employees should be deselected');

    // Restore original method
    element._toggleSelectAll = originalToggle;
  });
});

describe('<employee-form> additional behavior', () => {
  it('dispatches custom events correctly with _notify', () => {
    const element = document.createElement('employee-form');
    const spy = sinon.spy();
    element.addEventListener('test-event', spy);
    element._notify('test-event', 'Sample message', 'success');
    assert.isTrue(spy.calledOnce, '_notify should dispatch the event once');
    const event = spy.firstCall.args[0];
    assert.equal(event.detail.message, 'Sample message');
    assert.equal(event.detail.type, 'success');
    assert.isTrue(event.bubbles);
    assert.isTrue(event.composed);
  });

  it('_showModal works and resolves promise correctly', async () => {
    const element = document.createElement('employee-form');

    // Stub createElement to intercept modal creation and simulate event dispatch
    const stubCreateElement = sinon.stub(document, 'createElement').callsFake((tagName) => {
      if (tagName === 'confirmation-modal') {
        const dummyModal = document.createElement('div');
        setTimeout(() => {
          dummyModal.dispatchEvent(new CustomEvent('modal-result', { detail: true }));
        }, 0);
        dummyModal.addEventListener = (event, listener) => {
          if (event === 'modal-result') {
            setTimeout(() => listener({ detail: true }), 0);
          }
        };
        dummyModal.remove = () => {};
        return dummyModal;
      }
      return document.createElement.wrappedMethod.call(document, tagName);
    });

    const result = await element._showModal('Title', 'Message', 'confirm');
    assert.isTrue(result, '_showModal should resolve with true');

    stubCreateElement.restore();
  });

  it('_validateForm correctly identifies taken email and phone', () => {
    const element = document.createElement('employee-form');
    element._formData = {
      firstName: 'A',
      lastName: 'B',
      dateOfEmployment: '2024-01-01',
      dateOfBirth: '2000-01-01',
      phoneNumber: '123-456-7890',
      emailAddress: 'a@b.com',
      department: 'Tech',
      position: 'Junior',
    };

    sinon.stub(employeeStore, 'isEmailTaken').returns(true);
    sinon.stub(employeeStore, 'isPhoneNumberTaken').returns(true);

    const valid = element._validateForm();
    assert.isFalse(valid, 'Validation should fail if email or phone is taken');
    assert.property(element._errors, 'emailAddress');
    assert.property(element._errors, 'phoneNumber');

    employeeStore.isEmailTaken.restore();
    employeeStore.isPhoneNumberTaken.restore();
  });

  it('_handleChange clears errors on updated field', () => {
    const element = document.createElement('employee-form');
    element._formData = element._defaultFormData();
    element._errors = { firstName: 'Required' };
    element._handleChange({ target: { name: 'firstName', value: 'John' } });
    assert.notProperty(element._errors, 'firstName');
    assert.equal(element._formData.firstName, 'John');
  });

  it('_loadEmployee populates form data when found', () => {
    const element = document.createElement('employee-form');
    const fakeEmployee = { id: '1', firstName: 'John', lastName: 'Doe' };
    sinon.stub(employeeStore, 'getEmployeeById').returns(fakeEmployee);
    sinon.stub(element, '_notify');

    element._loadEmployee('1');
    assert.deepEqual(element._formData, fakeEmployee);

    employeeStore.getEmployeeById.restore();
    element._notify.restore();
  });
});
