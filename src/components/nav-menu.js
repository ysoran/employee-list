import { LitElement, html, css } from 'lit';
import { i18n } from '../i18n.js';

class NavMenu extends LitElement {
  static properties = {
    _currentPath: { type: String, state: true },
    _lang: { type: String, state: true },
  };

  constructor() {
    super();
    // Initialize current path and language
    this._currentPath = window.location.pathname;
    this._lang = i18n.getCurrentLanguage();

    // Update current path when router location changes
    window.addEventListener('vaadin-router-location-changed', (e) => {
      this._currentPath = e.detail.location.pathname;
      // console.log('Route changed to', this._currentPath); // Debug route changes
    });
  }

  static styles = css`
    :host {
      display: block;
      background-color: #fff;
      border-bottom: 1px solid #e0e0e0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      font-family: 'Segoe UI', sans-serif;
    }

    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 32px;
      background-color: #fff;
    }

    .left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo {
      height: 40px;
    }

    .app-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .right {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .right a {
      color: #ff6600;
      font-weight: 500;
      text-decoration: none;
      position: relative;
      padding: 4px 2px;
      transition: color 0.2s ease;
    }

    .right a::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -2px;
      height: 2px;
      background-color: #ff6600;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.2s ease;
    }

    .right a:hover::after,
    .right a.active::after {
      transform: scaleX(1);
    }

    .lang-switcher button {
      background: none;
      border: none;
      font-weight: 500;
      font-size: 0.95rem;
      color: #ff6600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background-color 0.2s;
    }

    .lang-switcher button:hover {
      background-color: rgba(255, 102, 0, 0.05);
    }

    @media (max-width: 768px) {
      nav {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
      }

      .right {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
      }
    }
  `;

  // Change language when user clicks button
  _setLanguage(lang) {
    i18n.setLanguage(lang);
    this._lang = lang;

    // Let the rest of the app know language has changed
    this.dispatchEvent(new CustomEvent('language-changed', {
      detail: lang,
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const otherLang = this._lang === 'en' ? 'tr' : 'en';

    return html`
      <nav>
        <div class="left">
          <img src="/assets/ing.webp" alt="Logo" class="logo" />
          <span class="app-title">ING</span>
        </div>
        <div class="right">
          <a href="/employees" class=${this._currentPath === '/employees' ? 'active' : ''}>
            ${i18n.getTranslation('listEmployees')}
          </a>
          <a href="/add-employee" class=${this._currentPath === '/add-employee' ? 'active' : ''}>
            ${i18n.getTranslation('addEmployee')}
          </a>
          <div class="lang-switcher">
            <button @click=${() => this._setLanguage(otherLang)}>
              ${otherLang.toUpperCase()}
            </button>
          </div>
        </div>
      </nav>
    `;
  }
}

customElements.define('nav-menu', NavMenu);
