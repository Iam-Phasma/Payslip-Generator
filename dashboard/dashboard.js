async function injectFragment(targetId, path) {
  const container = document.getElementById(targetId);
  if (!container) return;

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    container.innerHTML = await response.text();
  } catch (error) {
    container.innerHTML = "";
    console.error(error);
  }
}

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

(async function initDashboardShell() {
  await injectFragment("header-container", "header/header.html");
  await injectFragment("footer-container", "footer/footer.html");

  initHeaderDate();
  initFooterYear();
  initUserMenu();
  initSidebarToggle();
  initTabSwitching();
})();
