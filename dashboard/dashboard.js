import "./functions/server-status-banner.js";
import { initFunctionTab } from "./functions/cutoff.js";
import { initEmployeesTab } from "./functions/employees.js";
import {
  initFooterYear,
  initHeaderDate,
  initSidebarToggle,
  initTabSwitching,
  initUserMenu,
} from "./functions/layout.js";
import {
  cutoffModalTemplate,
  employeeEditModalTemplate,
  footerTemplate,
  headerTemplate,
  injectFragment,
} from "./functions/templates.js";

const LOGIN_PATH = "../index.html";

function hasUnexpiredLocalSession() {
  const accessToken = localStorage.getItem("supabase_access_token") || "";
  const expiresAt = Number(localStorage.getItem("supabase_expires_at") || "0");
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (!accessToken) return false;
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return false;
  return expiresAt > nowInSeconds;
}

(function initDashboardShell() {
  if (!hasUnexpiredLocalSession()) {
    window.location.replace(LOGIN_PATH);
    return;
  }

  injectFragment("header-container", headerTemplate);
  injectFragment("footer-container", footerTemplate);
  injectFragment("cutoff-modal-root", cutoffModalTemplate);
  injectFragment("employee-edit-modal-root", employeeEditModalTemplate);

  initHeaderDate();
  initFooterYear();
  initUserMenu();
  initSidebarToggle();
  initTabSwitching();
  initFunctionTab();
  initEmployeesTab();
})();
