import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { employeeStore } from '../employee-store.js';
import { i18n } from '../i18n.js';

class EmployeeList extends LitElement {
  static properties = {
    employees: { type: Array },
    _filteredEmployees: { type: Array, state: true },
    _selectedIds: { type: Array, state: true },
    _viewMode: { type: String, state: true },
    _searchTerm: { type: String, state: true },
    _currentPage: { type: Number, state: true },
    _itemsPerPage: { type: Number, state: true },
    _lang: { type: String, state: true },
  };

  static styles = css`
    :host {
      display: block;
      background: #f8f9fa;
      padding: 32px;
      font-family: 'Segoe UI', sans-serif;
    }

    h1 {
      color: #ff6600;
      font-weight: 600;
      font-size: 28px;
      margin-bottom: 24px;
    }

    h2 {
      color: #ff6600;
      font-weight: 500;
      font-size: 24px;
      margin-bottom: 24px;
    }
      
    table td:nth-child(2),
    table td:nth-child(3) {
        color: black;
    }

    .bulk-actions button {
      background: #d9534f;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 10px;
    }

    .bulk-actions button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    th, td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
      color: #666;
    }

  

    th {
      color: #ff6600;
      font-weight: 500;
    }

    tr:nth-child(even) {
      background: #fefefe;
    }

    tr:hover {
      background: #f5f5f5;
    }

    .flex {
      display: flex;
    }

    .actions {
      display: flex;
      gap: 8px;
      border-left: 1px solid #eee;
      padding-left: 8px;
    }

    .actions button {
      background: none;
      border: none;
      color: #ff6600;
      font-size: 1.1rem;
      cursor: pointer;
    }

    .actions button:hover {
      color: #cc5200;
    }

    .pagination {
      margin-top: 24px;
      text-align: center;
    }

    .pagination button {
      background: #ff6600;
      color: white;
      border: none;
      padding: 10px 16px;
      margin: 0 4px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 500;
    }

    .pagination button:disabled {
      background-color: #ccc;
      cursor: default;
    }

    @media (max-width: 768px) {
      table, thead, tbody, th, td, tr {
        display: block;
      }

      thead tr {
        display: none;
      }

      tr {
        margin-bottom: 12px;
        border: 1px solid #dee2e6;
        border-radius: 10px;
        background: white;
        padding: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      }

      td {
        display: flex;
        justify-content: space-between;
        padding: 12px 8px;
        border: none;
        border-bottom: 1px solid #eee;
      }

      table td:nth-child(2),
        table td:nth-child(3) {
            color: black;
        }

      td::before {
        content: attr(data-label);
        font-weight: 600;
        color: #555;
      }
    }
  `;

  constructor() {
    super();

    // Initialize state variables
    this.employees = [];
    this._filteredEmployees = [];
    this._selectedIds = [];
    this._viewMode = 'table'; // possible future modes
    this._searchTerm = '';
    this._currentPage = 1;
    this._itemsPerPage = 5;
    this._lang = i18n.getCurrentLanguage();

    // Listen for employee data updates from store
    this._unsubscribe = employeeStore.subscribe((employees) => {
      this.employees = employees;
      this._applyFilterAndPagination();
    });

    // Listen for language changes globally
    window.addEventListener('language-changed', this._handleLanguageChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up listeners to avoid memory leaks
    if (this._unsubscribe) this._unsubscribe();
    window.removeEventListener('language-changed', this._handleLanguageChange);
  }

  _handleLanguageChange = (event) => {
    this._lang = event.detail;
    this.requestUpdate();
  };

  // Filter employees based on search term and apply pagination
  _applyFilterAndPagination() {
    const lowerSearch = this._searchTerm.toLowerCase();

    this._filteredEmployees = this.employees.filter(emp => {
      return (
        emp.firstName.toLowerCase().includes(lowerSearch) ||
        emp.lastName.toLowerCase().includes(lowerSearch) ||
        emp.emailAddress.toLowerCase().includes(lowerSearch) ||
        emp.department.toLowerCase().includes(lowerSearch) ||
        emp.position.toLowerCase().includes(lowerSearch)
      );
    });

    const maxPage = Math.ceil(this._filteredEmployees.length / this._itemsPerPage);

    // Adjust current page if it exceeds max pages
    if (this._currentPage > maxPage) {
      this._currentPage = maxPage || 1;
    }
  }

  // Navigate back one page
  _goToPreviousPage() {
    if (this._currentPage > 1) {
      this._currentPage--;
    }
  }

  // Navigate forward one page
  _goToNextPage() {
    const maxPage = Math.ceil(this._filteredEmployees.length / this._itemsPerPage);
    if (this._currentPage < maxPage) {
      this._currentPage++;
    }
  }

  // Routing helpers for navigation
  _goToAddEmployee() {
    Router.go('/add-employee');
  }

  _goToEditEmployee(id) {
    Router.go(`/edit-employee/${id}`);
  }

  // Show a confirmation modal and delete a single employee if confirmed
  async _deleteEmployee(id) {
    const confirmed = await this._showConfirmationModal(
      i18n.getTranslation('confirmDeleteTitle'),
      i18n.getTranslation('confirmDeleteMessage'),
      'confirm'
    );

    if (!confirmed) return;

    const success = employeeStore.deleteEmployee(id);
    this._emitEmployeeEvent(
      'employee-deleted',
      success ? i18n.getTranslation('employeeDeletedSuccess') : i18n.getTranslation('employeeNotFound'),
      success ? 'success' : 'error'
    );
  }

  // Bulk delete selected employees
  async _deleteSelectedEmployees() {
    if (this._selectedIds.length === 0) return;

    const confirmed = await this._showConfirmationModal(
      i18n.getTranslation('confirmDeleteTitle'),
      i18n.getTranslation('confirmBulkDeleteMessage'),
      'confirm'
    );

    if (!confirmed) return;

    // Delete all selected
    this._selectedIds.forEach(id => employeeStore.deleteEmployee(id));
    this._selectedIds = [];

    this._emitEmployeeEvent('employees-deleted', i18n.getTranslation('employeeDeletedSuccess'), 'success');
  }

  // Toggle selection of a single employee
  _toggleSelection(id, checked) {
    if (checked) {
      if (!this._selectedIds.includes(id)) {
        this._selectedIds = [...this._selectedIds, id];
      }
    } else {
      this._selectedIds = this._selectedIds.filter(selectedId => selectedId !== id);
    }
  }

  // Select or deselect all visible employees
  _toggleSelectAllVisible(e) {
    const visibleIds = this._getVisibleEmployees().map(emp => emp.id);
    if (e.target.checked) {
      this._selectedIds = Array.from(new Set([...this._selectedIds, ...visibleIds]));
    } else {
      this._selectedIds = this._selectedIds.filter(id => !visibleIds.includes(id));
    }
  }

  // Check if all visible employees are selected
  _areAllVisibleSelected() {
    const visibleIds = this._getVisibleEmployees().map(emp => emp.id);
    return visibleIds.every(id => this._selectedIds.includes(id));
  }

  // Get employees for the current page
  _getVisibleEmployees() {
    const startIdx = (this._currentPage - 1) * this._itemsPerPage;
    return this._filteredEmployees.slice(startIdx, startIdx + this._itemsPerPage);
  }

  // Helper to emit custom events for employee actions
  _emitEmployeeEvent(eventName, message, type) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail: { message, type },
      bubbles: true,
      composed: true,
    }));
  }

  // Show a modal dialog and return the user's response as a promise
  _showConfirmationModal(title, message, type, hideCancel = false) {
    return new Promise(resolve => {
      const modal = document.createElement('confirmation-modal');
      Object.assign(modal, { title, message, type, hideCancel });

      const onModalResult = e => {
        resolve(e.detail);
        modal.removeEventListener('modal-result', onModalResult);
        modal.remove();
      };

      modal.addEventListener('modal-result', onModalResult);
      document.body.appendChild(modal);
    });
  }

  render() {
    const visibleEmployees = this._getVisibleEmployees();
    const totalPages = Math.ceil(this._filteredEmployees.length / this._itemsPerPage);

    return html`
      <h2>${i18n.getTranslation('employeeList')}</h2>

      <table>
        <thead>
          <tr>
            <th><input type="checkbox" @change=${this._toggleSelectAllVisible} .checked=${this._areAllVisibleSelected()} /></th>
            <th>${i18n.getTranslation('firstName')}</th>
            <th>${i18n.getTranslation('lastName')}</th>
            <th>${i18n.getTranslation('dateOfEmployment')}</th>
            <th>${i18n.getTranslation('dateOfBirth')}</th>
            <th>${i18n.getTranslation('phoneNumber')}</th>
            <th>${i18n.getTranslation('emailAddress')}</th>
            <th>${i18n.getTranslation('department')}</th>
            <th>${i18n.getTranslation('position')}</th>
            <th>${i18n.getTranslation('actions')}</th>
          </tr>
        </thead>
        <tbody>
          ${visibleEmployees.map(emp => html`
            <tr>
              <td>
                <input
                  type="checkbox"
                  .checked=${this._selectedIds.includes(emp.id)}
                  @change=${e => this._toggleSelection(emp.id, e.target.checked)}
                />
              </td>
              <td>${emp.firstName}</td>
              <td>${emp.lastName}</td>
              <td>${emp.dateOfEmployment}</td>
              <td>${emp.dateOfBirth}</td>
              <td>${emp.phoneNumber}</td>
              <td>${emp.emailAddress}</td>
              <td>${emp.department}</td>
              <td>${emp.position}</td>
              <td class="actions">
                <button @click=${() => this._goToEditEmployee(emp.id)} title="Edit">✏️</button>
                <button @click=${() => this._deleteEmployee(emp.id)} title="Delete">🗑️</button>
              </td>
            </tr>
          `)}
        </tbody>
      </table>

      <div class="bulk-actions">
        <button
          ?disabled=${this._selectedIds.length === 0}
          @click=${this._deleteSelectedEmployees}
        >
          🗑️ Delete Selected
        </button>
      </div>

      <div class="pagination">
        <button ?disabled=${this._currentPage === 1} @click=${this._goToPreviousPage}>${i18n.getTranslation('previous')}</button>
        <span>${this._currentPage} / ${totalPages || 1}</span>
        <button ?disabled=${this._currentPage === totalPages} @click=${this._goToNextPage}>${i18n.getTranslation('next')}</button>
      </div>
    `;
  }
}

customElements.define('employee-list', EmployeeList);
