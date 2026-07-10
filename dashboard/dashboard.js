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

(function initDashboardShell() {
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
