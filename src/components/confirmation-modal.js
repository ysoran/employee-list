import { LitElement, html, css } from 'lit';
import { i18n } from '../i18n.js';

class ConfirmationModal extends LitElement {
  static properties = {
    title: { type: String },
    message: { type: String },
    type: { type: String },         // 'confirm' or 'info'
    hideCancel: { type: Boolean },  // whether to hide the cancel button
  };

  static styles = css`
    /* Background overlay behind the modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    .modal-overlay.show {
      opacity: 1;
    }

    /* Modal container */
    .modal-content {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      max-width: 400px;
      width: 90%;
      text-align: center;
      transform: translateY(-10px);
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
    }
    .modal-overlay.show .modal-content {
      transform: translateY(0);
      opacity: 1;
    }

    /* Title styling */
    h2 {
      margin: 0 0 12px;
      font-size: 1.5rem;
      color: #ff5c00;
    }

    /* Message paragraph */
    p {
      margin: 0 0 20px;
      font-size: 1rem;
      color: #333;
    }

    /* Buttons container */
    .modal-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* General button styles */
    button {
      padding: 12px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    /* Confirm button style */
    .confirm-btn {
      background-color: #ff5c00;
      color: white;
    }
    .confirm-btn:hover {
      background-color: #e64d00;
      transform: translateY(-2px);
    }

    /* Cancel button style */
    .cancel-btn {
      background-color: white;
      color: #555;
      border-color: #ccc;
    }
    .cancel-btn:hover {
      background-color: #f1f1f1;
      transform: translateY(-2px);
    }

    /* Responsive tweaks for small screens */
    @media (max-width: 480px) {
      .modal-content {
        padding: 20px;
      }
      h2 {
        font-size: 1.25rem;
      }
      p {
        font-size: 0.95rem;
      }
    }
  `;

  constructor() {
    super();
    this.title = '';
    this.message = '';
    this.type = 'confirm';    // Default modal type is confirm
    this.hideCancel = false;  // Show cancel button by default
  }

  firstUpdated() {
    // Slight delay before showing modal animation
    setTimeout(() => {
      const overlay = this.shadowRoot.querySelector('.modal-overlay');
      if (overlay) overlay.classList.add('show');
    }, 50);
  }

  _confirm() {
    this._dispatchResult(true);
  }

  _cancel() {
    this._dispatchResult(false);
  }

  _dispatchResult(value) {
    this.dispatchEvent(new CustomEvent('modal-result', {
      detail: value,
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    // Labels depending on modal type and localization
    const confirmLabel = this.type === 'info'
      ? i18n.getTranslation('ok')
      : i18n.getTranslation('yes');
    const cancelLabel = i18n.getTranslation('no');

    return html`
      <div class="modal-overlay">
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-message">
          <h2 id="modal-title">${this.title}</h2>
          <p id="modal-message">${this.message}</p>
          <div class="modal-buttons">
            <button class="confirm-btn" @click=${this._confirm} type="button">${confirmLabel}</button>
            ${this.type !== 'info' && !this.hideCancel
              ? html`<button class="cancel-btn" @click=${this._cancel} type="button">${cancelLabel}</button>`
              : ''}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('confirmation-modal', ConfirmationModal);
