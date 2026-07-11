import "./functions/server-status-banner.js";
import { clearLocalSession, ensureValidSession } from "./functions/auth-session.js";
import { initCreateTab } from "./functions/create.js";
import { initFunctionTab } from "./functions/cutoff.js";
import { initEmployeesTab } from "./functions/employees.js";
import { initSignatoriesTab } from "./functions/signatories.js";
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
  signatoryModalTemplate,
} from "./functions/templates.js";

const LOGIN_PATH = `${import.meta.env.BASE_URL}index.html`;

(async function initDashboardShell() {
  try {
    const session = await ensureValidSession({ validateIfUnexpired: true });
    if (!session?.accessToken) {
      clearLocalSession();
      window.location.replace(LOGIN_PATH);
      return;
    }
  } catch {
    clearLocalSession();
    window.location.replace(LOGIN_PATH);
    return;
  }

  injectFragment("header-container", headerTemplate);
  injectFragment("footer-container", footerTemplate);
  injectFragment("cutoff-modal-root", cutoffModalTemplate);
  injectFragment("employee-edit-modal-root", employeeEditModalTemplate);
  injectFragment("signatory-modal-root", signatoryModalTemplate);

  initHeaderDate();
  initFooterYear();
  initUserMenu();
  initSidebarToggle();
  initTabSwitching();
  initCreateTab();
  initFunctionTab();
  initSignatoriesTab();
  initEmployeesTab();
})();
