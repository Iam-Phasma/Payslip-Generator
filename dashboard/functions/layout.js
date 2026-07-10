export function initHeaderDate() {
  const dateElement = document.getElementById("header-date");
  if (!dateElement) return;

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateElement.textContent = `Today is ${new Date().toLocaleDateString("en-US", options)}`;
}

export function initFooterYear() {
  const yearElement = document.getElementById("footer-year");
  if (!yearElement) return;
  yearElement.textContent = String(new Date().getFullYear());
}

export function initUserMenu() {
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

export function initSidebarToggle() {
  const wrapper = document.getElementById("dashboard-wrapper");
  const sidebar = document.getElementById("dash-sidebar");
  const toggle = document.getElementById("dash-sidebar-toggle");
  if (!wrapper || !sidebar || !toggle) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    wrapper.classList.toggle("sidebar-collapsed");
  });
}

export function initTabSwitching() {
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
