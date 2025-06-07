import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';

import './components/nav-menu.js';
import './components/employee-list.js';
import './components/employee-form.js';
import './components/confirmation-modal.js';

import { i18n } from './i18n.js';
import { employeeStore } from './employee-store.js';

class AppRoot extends LitElement {
  static properties = {
    _currentRoute: { type: String },
    _lang: { type: String, state: true },
    _showModal: { type: Boolean, state: true },
    _modalConfig: { type: Object, state: true },
    _modalResolve: { type: Function, state: true },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f4f7f6;
    }

    main {
      flex: 1;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    footer {
      background-color: #333;
      color: white;
      text-align: center;
      padding: 15px;
      margin-top: auto;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      font-size: 0.9rem;
      user-select: none;
    }

    @media (max-width: 768px) {
      main {
        padding: 10px;
      }
    }
  `;

  constructor() {
    super();
    this._currentRoute = '';
    this._lang = i18n.getCurrentLanguage();
    this._showModal = false;
    this._modalConfig = {};
    this._modalResolve = null;

    // Listen for some app-wide custom events from child components
    this.addEventListener('show-confirmation-modal', this._handleShowModal.bind(this));
    this.addEventListener('employee-added', this._handleEmployeeAction.bind(this));
    this.addEventListener('employee-updated', this._handleEmployeeAction.bind(this));
    this.addEventListener('employee-deleted', this._handleEmployeeAction.bind(this));
  }

  firstUpdated() {
    this._setupRouter();

    // Set initial language from html lang attribute or default to 'en'
    const initialLang = document.documentElement.lang || 'en';
    i18n.setLanguage(initialLang);
    this._lang = initialLang;

    // TODO: Consider persisting user language preference in localStorage
  }

  _setupRouter() {
    const outlet = this.shadowRoot.querySelector('main');
    if (!outlet) {
      console.error('Router outlet not found! Make sure <main> exists.');
      return;
    }

    const router = new Router(outlet);

    // Define routes and how to handle them
    router.setRoutes([
      { path: '/', redirect: '/employees' },
      {
        path: '/employees',
        component: 'employee-list',
        action: () => { this._currentRoute = '/employees'; },
      },
      {
        path: '/add-employee',
        component: 'employee-form',
        action: () => { this._currentRoute = '/add-employee'; },
      },
      {
        path: '/edit-employee/:employeeId',
        component: 'employee-form',
        action: (context, commands) => {
          this._currentRoute = `/edit-employee/${context.params.employeeId}`;
          return commands.component('employee-form', {
            employeeId: context.params.employeeId,
          });
        },
      },
      {
        path: '(.*)',
        component: 'div',
        action: (_ctx, commands) => {
          this._currentRoute = '/404';
          return commands.component('div').template(html`
            <h1>404 - ${i18n.getTranslation('pageNotFound')}</h1>
          `);
        },
      },
    ]);
  }

  _handleShowModal(event) {
    const { title, message, type, onConfirm } = event.detail;

    this._modalConfig = { title, message, type };
    this._showModal = true;
    this._modalResolve = onConfirm;
  }

  _handleModalResult(confirmed) {
    this._showModal = false;

    if (typeof this._modalResolve === 'function') {
      this._modalResolve(confirmed);
      this._modalResolve = null;
    }
  }

  _handleEmployeeAction(event) {
    const { message, type } = event.detail;

    this._modalConfig = {
      title: i18n.getTranslation('success'),
      message,
      type: type || 'info',
      hideCancel: true,
    };

    this._showModal = true;

    // Close modal automatically after 3 seconds
    setTimeout(() => {
      this._showModal = false;
    }, 3000);

    // Redirect back to employee list if we were on add/edit pages
    if (this._currentRoute.includes('add-employee') || this._currentRoute.includes('edit-employee')) {
      Router.go('/employees');
    }
  }

  _handleLanguageChange(event) {
    const newLang = event.detail;
    i18n.setLanguage(newLang);
    this._lang = newLang;
    this.requestUpdate();
  }

  render() {
    return html`
      <nav-menu @language-changed=${this._handleLanguageChange}></nav-menu>

      <main role="main">
        <!-- router outlet renders components here -->
      </main>

      ${this._showModal ? html`
        <confirmation-modal
          .title=${this._modalConfig.title}
          .message=${this._modalConfig.message}
          .type=${this._modalConfig.type}
          .hideCancel=${this._modalConfig.hideCancel}
          @modal-result=${this._handleModalResult}
        ></confirmation-modal>
      ` : ''}
    `;
  }
}

customElements.define('app-root', AppRoot);
