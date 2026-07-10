import chedLogo from "../../assets/CHED-Logo.webp";
import bagongPilipinasLogo from "../../assets/Bagong_Pilipinas_logo.webp";

export function injectFragment(targetId, html) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = html;
}

export const headerTemplate = `
<header class="sticky-header">
  <div class="sticky-header-content">
    <div class="sticky-header-left">
      <div class="sticky-header-logos" aria-hidden="true">
        <img src="${chedLogo}" alt="CHED Logo" class="sticky-header-logo">
        <img src="${bagongPilipinasLogo}" alt="Bagong Pilipinas logo" class="sticky-header-logo sticky-header-logo--secondary">
      </div>
      <div class="sticky-header-title-wrapper">
        <h1 class="sticky-header-title">CHEDRO IV COS Payslip Generator</h1>
        <p class="header-date" id="header-date"></p>
      </div>
    </div>

    <div class="sticky-header-actions">
      <button id="user-menu-btn" type="button" class="header-user-btn" title="User Menu">
        <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false" class="user-icon">
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
        </svg>
        <span class="header-user-name">Admin User</span>
      </button>

      <div id="header-popup-panel" class="header-popup-panel" aria-hidden="true">
        <div class="header-popup-content">
          <button class="header-popup-option" type="button">Settings</button>
          <button id="header-logout-btn" class="header-popup-option" type="button">Log Out</button>
        </div>
      </div>
    </div>
  </div>
</header>
`;

export const footerTemplate = `
<footer class="gov-footer">
  <div class="footer-content">
    <div class="footer-links" aria-label="Official links">
      <a href="https://ched.gov.ph/" target="_blank" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.1 5.39Z"/></svg>
        CHED Website
      </a>
      <a href="https://www.facebook.com/ched4" target="_blank" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12Z"/></svg>
        CHEDRO IV Facebook
      </a>
    </div>
    <div class="footer-note">
      <p class="footer-copyright"><span id="footer-year"></span> &middot; Commission on Higher Education Regional Office IV</p>
    </div>
  </div>
</footer>
`;

export const employeeEditModalTemplate = `
<div id="employee-edit-modal" class="employee-edit-modal" aria-hidden="true">
  <div class="employee-edit-modal-backdrop" data-modal-close></div>
  <div class="employee-edit-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="employee-edit-modal-title">
    <form id="employee-edit-form" class="employee-edit-form">
      <div class="employee-edit-modal-header">
        <div>
          <h3 id="employee-edit-modal-title">Edit employee</h3>
          <p id="employee-edit-modal-subtitle">Update the employee details and cutoff schedule.</p>
        </div>
      </div>

      <div class="employee-edit-grid">
        <label id="employee-edit-name-field" class="employee-edit-field">
          <span>Name</span>
          <input type="text" id="employee-edit-name" autocomplete="off" readonly />
        </label>

        <label id="employee-edit-position-field" class="employee-edit-field">
          <span>Position</span>
          <input type="text" id="employee-edit-position" autocomplete="off" required />
        </label>

        <label id="employee-edit-emp-stat-field" class="employee-edit-field">
          <span>Employment Type</span>
          <select id="employee-edit-emp-stat" required>
            <option value="">Select type</option>
            <option value="Plantilla">Plantilla</option>
            <option value="COS">COS</option>
          </select>
        </label>

        <label class="employee-edit-field">
          <span>Cut Off Tag</span>
          <select id="employee-edit-cutoff-tag" required></select>
        </label>

        <label class="employee-edit-field">
          <span>Cut Off Visualizer (Auto)</span>
          <input type="text" id="employee-edit-cutoff-visualizer" readonly />
        </label>
      </div>

      <div class="employee-edit-actions">
        <button type="button" class="employee-edit-secondary-btn" data-modal-close>Cancel</button>
        <button type="submit" class="employee-edit-primary-btn">Save</button>
      </div>
    </form>
  </div>
</div>
`;

export const cutoffModalTemplate = `
<div id="cutoff-modal" class="cutoff-modal" aria-hidden="true">
  <div class="cutoff-modal-backdrop" data-cutoff-modal-close></div>
  <div class="cutoff-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="cutoff-modal-title">
    <form id="cutoff-form" class="cutoff-form">
      <div class="cutoff-modal-header">
        <div>
          <h3 id="cutoff-modal-title">Cut Off Entry</h3>
          <p>Add or edit payroll cut off days.</p>
        </div>
      </div>

      <div class="cutoff-modal-grid">
        <label class="cutoff-modal-field cutoff-modal-field--full">
          <span>Tag</span>
          <input type="text" id="cutoff-tag" autocomplete="off" required />
        </label>

        <label class="cutoff-modal-field">
          <span>First CO From</span>
          <select id="cutoff-firstco-from" required></select>
        </label>

        <label class="cutoff-modal-field">
          <span>First CO To</span>
          <select id="cutoff-firstco-to" required></select>
        </label>

        <label class="cutoff-modal-field cutoff-modal-field--full">
          <span>Second CO (Auto)</span>
          <input type="text" id="cutoff-secondco-preview" readonly />
        </label>
      </div>

      <div class="cutoff-modal-actions">
        <button type="button" class="cutoff-modal-secondary-btn" data-cutoff-modal-close>Cancel</button>
        <button type="submit" class="cutoff-modal-primary-btn">Save</button>
      </div>
    </form>
  </div>
</div>
`;
