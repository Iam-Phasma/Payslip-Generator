import chedLogo from "../assets/CHED-Logo.webp";
import bagongPilipinasLogo from "../assets/Bagong_Pilipinas_logo.webp";

function injectFragment(targetId, html) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = html;
}

const headerTemplate = `
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
          <button class="header-popup-option" type="button">Log Out</button>
        </div>
      </div>
    </div>
  </div>
</header>
`;

const footerTemplate = `
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

function initHeaderDate() {
  const dateElement = document.getElementById("header-date");
  if (!dateElement) return;

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateElement.textContent = `Today is ${new Date().toLocaleDateString("en-US", options)}`;
}

function initFooterYear() {
  const yearElement = document.getElementById("footer-year");
  if (!yearElement) return;
  yearElement.textContent = String(new Date().getFullYear());
}

function initUserMenu() {
  const menuButton = document.getElementById("user-menu-btn");
  const popup = document.getElementById("header-popup-panel");
  if (!menuButton || !popup) return;

  menuButton.addEventListener("click", () => {
    popup.classList.toggle("show");
    popup.setAttribute("aria-hidden", popup.classList.contains("show") ? "false" : "true");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!popup.contains(target) && !menuButton.contains(target)) {
      popup.classList.remove("show");
      popup.setAttribute("aria-hidden", "true");
    }
  });
}

function initSidebarToggle() {
  const wrapper = document.getElementById("dashboard-wrapper");
  const sidebar = document.getElementById("dash-sidebar");
  const toggle = document.getElementById("dash-sidebar-toggle");
  if (!wrapper || !sidebar || !toggle) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    wrapper.classList.toggle("sidebar-collapsed");
  });
}

function initTabSwitching() {
  const tabs = Array.from(document.querySelectorAll(".dash-sidebar-tab"));
  const panes = Array.from(document.querySelectorAll(".dash-tab-pane"));

  tabs.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      const targetTab = tabButton.getAttribute("data-tab");
      if (!targetTab) return;

      tabs.forEach((btn) => {
        const isActive = btn === tabButton;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });

      panes.forEach((pane) => {
        pane.classList.toggle("active", pane.id === `tab-${targetTab}`);
      });
    });
  });
}

(function initDashboardShell() {
  injectFragment("header-container", headerTemplate);
  injectFragment("footer-container", footerTemplate);

  initHeaderDate();
  initFooterYear();
  initUserMenu();
  initSidebarToggle();
  initTabSwitching();
})();
