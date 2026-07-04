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

const employeeEditModalTemplate = `
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

const cutoffModalTemplate = `
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

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function formatOrdinalDay(value) {
  const day = Number(value);
  if (!Number.isFinite(day) || day <= 0) return "";

  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function buildCutoffDayOptions({ includeEndOfMonth = false, minDay = 1, maxDay = 31 } = {}) {
  const options = [];
  const safeMinDay = Math.max(1, Math.min(31, Math.trunc(Number(minDay) || 1)));
  const safeMaxDay = Math.max(safeMinDay, Math.min(31, Math.trunc(Number(maxDay) || 31)));

  if (includeEndOfMonth) {
    options.push('<option value="0">End of month</option>');
  }

  for (let day = safeMinDay; day <= safeMaxDay; day += 1) {
    options.push(`<option value="${day}">${formatOrdinalDay(day)}</option>`);
  }

  return options.join("");
}

function normalizeCutoffDay(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(31, Math.max(1, Math.trunc(parsed)));
}

function normalizeSecondCutoffDay(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (Math.trunc(parsed) === 0) return 0;
  return Math.min(31, Math.max(1, Math.trunc(parsed)));
}

function getEffectiveDayForMonth(day, referenceDate = new Date()) {
  const normalized = normalizeSecondCutoffDay(day);
  const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
  if (normalized === 0) return lastDay;
  return Math.min(normalized, lastDay);
}

function getCutoffDayValue(cutoff, key, legacyKey, fallback, { allowEndOfMonth = false } = {}) {
  if (cutoff && cutoff[key] !== null && cutoff[key] !== undefined) {
    return allowEndOfMonth
      ? normalizeSecondCutoffDay(cutoff[key], fallback)
      : normalizeCutoffDay(cutoff[key], fallback);
  }

  if (cutoff && legacyKey && cutoff[legacyKey]) {
    const legacyDate = new Date(cutoff[legacyKey]);
    if (!Number.isNaN(legacyDate.getTime())) {
      return normalizeCutoffDay(legacyDate.getDate(), fallback);
    }
  }

  return fallback;
}

function resolveFirstCutoffRange(cutoff) {
  const fromDay = getCutoffDayValue(cutoff, "firstco_from_day", null, 1);
  const toDay = getCutoffDayValue(cutoff, "firstco_to_day", "firstco_day", 15);
  return {
    fromDay,
    toDay: Math.max(fromDay + 1, toDay),
  };
}

function getSecondCutoffLabelFromTo(fromDay, toDay, referenceDate = new Date()) {
  const normalizedFrom = normalizeCutoffDay(fromDay, 1);
  const normalizedTo = normalizeCutoffDay(toDay, 15);
  const monthLastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
  const computedStart = Math.min(normalizedTo + 1, monthLastDay);
  const computedEnd = normalizedFrom === 1 ? monthLastDay : normalizedFrom - 1;
  const endLabel = normalizedFrom === 1 ? "End of month" : formatOrdinalDay(computedEnd);

  if (computedStart <= computedEnd) {
    return `${formatOrdinalDay(computedStart)} to ${endLabel}`;
  }

  return `${formatOrdinalDay(computedStart)} to ${endLabel} (next cycle)`;
}

function buildCutoffTagMap(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    const tag = String(entry?.tag || "").trim();
    if (tag) {
      map.set(tag, entry);
    }
  });
  return map;
}

function getCutoffRangeLabels(cutoffEntry) {
  const firstRange = resolveFirstCutoffRange(cutoffEntry || {});
  return {
    firstCoLabel: `${formatOrdinalDay(firstRange.fromDay)} to ${formatOrdinalDay(firstRange.toDay)}`,
    secondCoLabel: getSecondCutoffLabelFromTo(firstRange.fromDay, firstRange.toDay),
  };
}

function getEmployeeCutoffDisplay(employee, cutoffByTag) {
  const employeeTag = String(employee?.cutoff_tag || "").trim();
  const taggedEntry = employeeTag ? cutoffByTag.get(employeeTag) : null;

  if (taggedEntry) {
    const labels = getCutoffRangeLabels(taggedEntry);
    return {
      tagLabel: employeeTag,
      firstCoLabel: labels.firstCoLabel,
      secondCoLabel: labels.secondCoLabel,
    };
  }

  return {
    tagLabel: employeeTag,
    firstCoLabel: "Not set",
    secondCoLabel: "Not set",
  };
}

function getCutoffTableHeader() {
  return `
    <div class="function-cutoff-table-header">
      <span class="function-cutoff-header-tag">Tag</span>
      <span class="function-cutoff-header-first">First CO</span>
      <span class="function-cutoff-header-second">Second CO</span>
      <span class="function-cutoff-header-action">Actions</span>
    </div>
  `;
}

function renderCutoffTableRows(rows, options = {}) {
  const { emptyMessage = "No cut off entries found." } = options;
  if (!rows.length) {
    return `<p class="no-employees">${escapeHtml(emptyMessage)}</p>`;
  }

  return rows
    .map((cutoff) => {
      const firstRange = resolveFirstCutoffRange(cutoff);
      const firstCoLabel = `${formatOrdinalDay(firstRange.fromDay)} to ${formatOrdinalDay(firstRange.toDay)}`;
      const secondCoLabel = getSecondCutoffLabelFromTo(firstRange.fromDay, firstRange.toDay);

      return `
        <div class="function-cutoff-item">
          <span class="function-cutoff-tag">${escapeHtml(cutoff.tag || "Untitled")}</span>
          <span class="function-cutoff-date">${escapeHtml(firstCoLabel)}</span>
          <span class="function-cutoff-date">${escapeHtml(secondCoLabel)}</span>
          <div class="function-cutoff-actions">
            <button class="function-cutoff-edit-btn" type="button" data-cutoff-action="edit" data-id="${cutoff.id}" aria-label="Edit cut off" title="Edit cut off">
              <svg class="icon-line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-hidden="true" focusable="false">
                <path d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"></path>
              </svg>
            </button>
            <button class="function-cutoff-delete-btn" type="button" data-cutoff-action="delete" data-id="${cutoff.id}" aria-label="Delete cut off" title="Delete cut off">
              <svg class="icon-line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-hidden="true" focusable="false">
                <path d="M3 6h18"></path>
                <path d="M8 6V4h8v2"></path>
                <path d="M19 6l-1 14H6L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderCutoffTable(listElement, list, options = {}) {
  if (!listElement) return;
  listElement.innerHTML = `
    ${getCutoffTableHeader()}
    ${renderCutoffTableRows(list, options)}
  `;
}

async function fetchCutoffListFromSupabase() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in .env.",
    );
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const query = new URLSearchParams({
    select: "*",
    order: "tag.asc",
  });

  const response = await fetch(`${baseUrl}/rest/v1/cutoff_list?${query.toString()}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cut off load failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  return response.json();
}

async function createCutoffInSupabase(payload) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/rest/v1/cutoff_list`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "Content-Profile": "public",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cut off create failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function updateCutoffInSupabase(cutoffId, payload) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/rest/v1/cutoff_list?id=eq.${encodeURIComponent(cutoffId)}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "Content-Profile": "public",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cut off update failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function deleteCutoffInSupabase(cutoffId) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/rest/v1/cutoff_list?id=eq.${encodeURIComponent(cutoffId)}`, {
    method: "DELETE",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Content-Profile": "public",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cut off delete failed (${response.status}): ${errorText || "Unknown error"}`);
  }
}

function initCutoffModal(onCutoffSaved) {
  const modal = document.getElementById("cutoff-modal");
  const form = document.getElementById("cutoff-form");
  const tagInput = document.getElementById("cutoff-tag");
  const firstCoFromInput = document.getElementById("cutoff-firstco-from");
  const firstCoToInput = document.getElementById("cutoff-firstco-to");
  const secondCoPreviewInput = document.getElementById("cutoff-secondco-preview");

  if (!modal || !form || !tagInput || !firstCoFromInput || !firstCoToInput || !secondCoPreviewInput) return null;

  firstCoFromInput.innerHTML = buildCutoffDayOptions();

  const syncFirstCoToOptions = (fromDay, preferredToDay) => {
    const normalizedFrom = normalizeCutoffDay(fromDay, 1);
    const minToDay = Math.min(31, normalizedFrom + 1);
    firstCoToInput.innerHTML = buildCutoffDayOptions({ minDay: minToDay });

    const normalizedPreferredTo = normalizeCutoffDay(preferredToDay, minToDay);
    firstCoToInput.value = String(Math.max(minToDay, normalizedPreferredTo));
  };

  syncFirstCoToOptions(firstCoFromInput.value, firstCoToInput.value);

  let activeCutoffId = null;

  const syncSecondCoPreview = () => {
    const fromDay = normalizeCutoffDay(firstCoFromInput.value, 1);
    const toDay = normalizeCutoffDay(firstCoToInput.value, 15);
    secondCoPreviewInput.value = getSecondCutoffLabelFromTo(fromDay, toDay);
  };

  const closeModal = () => {
    activeCutoffId = null;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    form.reset();
    syncSecondCoPreview();
  };

  const openModal = (cutoff) => {
    activeCutoffId = cutoff?.id ?? null;
    const firstRange = resolveFirstCutoffRange(cutoff || {});
    tagInput.value = cutoff?.tag || "";
    firstCoFromInput.value = String(firstRange.fromDay);
    syncFirstCoToOptions(firstRange.fromDay, firstRange.toDay);
    syncSecondCoPreview();
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    tagInput.focus();
  };

  firstCoFromInput.addEventListener("change", () => {
    const normalizedFrom = String(normalizeCutoffDay(firstCoFromInput.value, 1));
    firstCoFromInput.value = normalizedFrom;
    syncFirstCoToOptions(normalizedFrom, firstCoToInput.value);
    syncSecondCoPreview();
  });

  firstCoToInput.addEventListener("change", () => {
    const normalizedFrom = normalizeCutoffDay(firstCoFromInput.value, 1);
    const minToDay = Math.min(31, normalizedFrom + 1);
    const normalizedTo = normalizeCutoffDay(firstCoToInput.value, minToDay);
    firstCoToInput.value = String(Math.max(minToDay, normalizedTo));
    syncSecondCoPreview();
  });

  modal.querySelectorAll("[data-cutoff-modal-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const tag = tagInput.value.trim();
    const firstcoFrom = normalizeCutoffDay(firstCoFromInput.value, 1);
    const firstcoTo = normalizeCutoffDay(firstCoToInput.value, 15);
    const monthLastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    if (!tag) {
      alert("Tag is required.");
      return;
    }

    if (firstcoTo <= firstcoFrom) {
      alert("First CO To must be greater than First CO From.");
      return;
    }

    if (firstcoTo === monthLastDay) {
      alert("First CO To cannot be the last day of the current month.");
      return;
    }

    form.querySelectorAll("button, input, select").forEach((control) => {
      control.disabled = true;
    });

    try {
      const payload = { tag, firstco_from_day: firstcoFrom, firstco_to_day: firstcoTo };
      const updated = activeCutoffId
        ? await updateCutoffInSupabase(activeCutoffId, payload)
        : await createCutoffInSupabase(payload);

      if (updated && typeof onCutoffSaved === "function") {
        onCutoffSaved(updated, activeCutoffId !== null);
      }

      closeModal();
    } catch (error) {
      console.error("Failed to save cut off:", error);
      alert(error instanceof Error ? error.message : "Failed to save cut off entry.");
    } finally {
      form.querySelectorAll("button, input, select").forEach((control) => {
        control.disabled = false;
      });
    }
  });

  return { openModal, closeModal };
}

function initFunctionTab() {
  const listElement = document.getElementById("cutoff-list");
  const addButton = document.getElementById("cutoff-add-btn");
  if (!listElement || !addButton) return;

  let cutoffEntries = [];
  let cutoffModal = null;

  const bindRowActions = () => {
    listElement.querySelectorAll("button[data-cutoff-action='edit']").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.getAttribute("data-id"));
        const target = cutoffEntries.find((entry) => Number(entry.id) === id);
        if (!target || !cutoffModal) return;
        cutoffModal.openModal(target);
      });
    });

    listElement.querySelectorAll("button[data-cutoff-action='delete']").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.getAttribute("data-id"));
        const target = cutoffEntries.find((entry) => Number(entry.id) === id);
        if (!target) return;

        const shouldDelete = confirm(`Delete cut off \"${target.tag || "Untitled"}\"?`);
        if (!shouldDelete) return;

        button.disabled = true;
        try {
          await deleteCutoffInSupabase(id);
          cutoffEntries = cutoffEntries.filter((entry) => Number(entry.id) !== id);
          refreshList();
        } catch (error) {
          console.error("Failed to delete cut off:", error);
          alert(error instanceof Error ? error.message : "Failed to delete cut off entry.");
        } finally {
          button.disabled = false;
        }
      });
    });
  };

  const refreshList = () => {
    renderCutoffTable(listElement, cutoffEntries, {
      emptyMessage: "No cut off entries yet. Add your first schedule.",
    });
    bindRowActions();
  };

  const handleCutoffSaved = (savedEntry, isEdit) => {
    if (isEdit) {
      cutoffEntries = cutoffEntries.map((entry) =>
        Number(entry.id) === Number(savedEntry.id) ? savedEntry : entry,
      );
    } else {
      cutoffEntries = [...cutoffEntries, savedEntry];
    }

    cutoffEntries.sort((left, right) => {
      const leftDay = getCutoffDayValue(left, "firstco_to_day", "firstco_day", 15);
      const rightDay = getCutoffDayValue(right, "firstco_to_day", "firstco_day", 15);
      return leftDay - rightDay;
    });
    refreshList();
  };

  cutoffModal = initCutoffModal(handleCutoffSaved);

  addButton.addEventListener("click", () => {
    if (!cutoffModal) return;
    cutoffModal.openModal(null);
  });

  fetchCutoffListFromSupabase()
    .then((rows) => {
      cutoffEntries = Array.isArray(rows) ? rows : [];
      refreshList();
    })
    .catch((error) => {
      console.error("Failed to load cut off list:", error);
      renderCutoffTable(listElement, [], {
        emptyMessage:
          error instanceof Error
            ? error.message
            : "Failed to load cut off list.",
      });
    });
}

function compareEmployees(sortMode, left, right) {
  const leftActive = left.is_active !== false ? 1 : 0;
  const rightActive = right.is_active !== false ? 1 : 0;
  const nameCompare = String(left.name || "").localeCompare(String(right.name || ""), undefined, {
    sensitivity: "base",
  });

  if (sortMode === "za") return -nameCompare;
  if (sortMode === "inactive-first") {
    if (leftActive !== rightActive) return leftActive - rightActive;
    return nameCompare;
  }
  if (sortMode === "active-first") {
    if (leftActive !== rightActive) return rightActive - leftActive;
    return nameCompare;
  }

  return nameCompare;
}

function getSupabaseConfig() {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_PROJECT_URL || "";
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    "";

  return {
    supabaseUrl,
    supabaseKey,
  };
}

function getEmployeesTableHeader() {
  return `
    <div class="employee-table-header">
      <span class="employee-header-select">
        <input id="employee-select-all" class="employee-select-checkbox" type="checkbox" aria-label="Select all visible employees" title="Select all visible employees" />
      </span>
      <span class="employee-header-name">Name</span>
      <span class="employee-header-position">Position</span>
      <span class="employee-header-status">Status</span>
      <span class="employee-header-first-co">First CO Range</span>
      <span class="employee-header-second-co">Second CO Range</span>
      <span class="employee-header-action">Actions</span>
    </div>
  `;
}

function renderEmployeeTableRows(rows, cutoffByTag, options = {}) {
  const { emptyMessage = "No employees match the current filters." } = options;
  const selectedIds = options.selectedIds instanceof Set ? options.selectedIds : new Set();
  if (!rows.length) {
    return `<p class="no-employees">${escapeHtml(emptyMessage)}</p>`;
  }

  return rows
    .map((employee) => {
      const isActive = employee.is_active !== false;
      const statusClass = isActive ? "active" : "inactive";
      const statusLabel = isActive ? "Active" : "Inactive";
      const toggleLabel = isActive ? "Hide" : "Unhide";
      const toggleButtonClass = isActive ? "employee-action-danger" : "";
      const cutoffDisplay = getEmployeeCutoffDisplay(employee, cutoffByTag);
      const firstTitle = cutoffDisplay.tagLabel
        ? ` title="Tag: ${escapeHtml(cutoffDisplay.tagLabel)}"`
        : "";
      const isSelected = selectedIds.has(Number(employee.id));

      return `
        <div class="employee-item">
          <span class="employee-select-cell">
            <input class="employee-select-checkbox" type="checkbox" data-action="select" data-id="${employee.id}" ${isSelected ? "checked" : ""} aria-label="Select ${escapeHtml(employee.name)}" />
          </span>
          <span class="employee-name">${escapeHtml(employee.name)}</span>
          <span class="employee-position">${escapeHtml(employee.position || "Not specified")}</span>
          <span class="employee-status-pill ${statusClass}">${statusLabel}</span>
          <span class="employee-first-co"${firstTitle}>${escapeHtml(cutoffDisplay.firstCoLabel)}</span>
          <span class="employee-second-co">${escapeHtml(cutoffDisplay.secondCoLabel)}</span>
          <div class="employee-item-actions">
            <button class="employee-action-btn" type="button" data-action="edit" data-id="${employee.id}" aria-label="Edit employee" title="Edit employee">
              <svg class="icon-line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-hidden="true" focusable="false">
                <path d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"></path>
              </svg>
            </button>
            <button class="employee-action-btn ${toggleButtonClass}" type="button" data-action="toggle" data-id="${employee.id}" aria-label="${toggleLabel} employee" title="${toggleLabel} employee">
              <svg class="icon-line" viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" focusable="false">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderEmployees(list, summaryElement, listElement, options = {}) {
  if (!summaryElement || !listElement) return;
  const { cutoffByTag = new Map(), selectedIds = new Set() } = options;

  const total = list.length;
  const active = list.filter((employee) => employee.is_active !== false).length;
  const inactive = total - active;

  summaryElement.textContent = `Total: ${total} | Active: ${active} | Inactive: ${inactive}`;
  listElement.innerHTML = `
    ${getEmployeesTableHeader()}
    ${renderEmployeeTableRows(list, cutoffByTag, { ...options, selectedIds })}
  `;
}

async function fetchEmployeesFromSupabase() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in .env.",
    );
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const query = new URLSearchParams({
    select: "*",
    order: "is_active.desc,name.asc",
  });

  const response = await fetch(`${baseUrl}/rest/v1/employees?${query.toString()}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Employees load failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  return response.json();
}

async function updateEmployeeInSupabase(employeeId, payload) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/rest/v1/employees?id=eq.${encodeURIComponent(employeeId)}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "Content-Profile": "public",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Employees update failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  const rows = await response.json();
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  }

  throw new Error(
    "Employees update did not return a row. This usually means RLS blocked the update or the record is not visible to your API role.",
  );
}

function initEmployeeEditModal(onEmployeeUpdated, getCutoffEntries) {
  const modal = document.getElementById("employee-edit-modal");
  const form = document.getElementById("employee-edit-form");
  const titleElement = document.getElementById("employee-edit-modal-title");
  const subtitleElement = document.getElementById("employee-edit-modal-subtitle");
  const nameField = document.getElementById("employee-edit-name-field");
  const positionField = document.getElementById("employee-edit-position-field");
  const nameInput = document.getElementById("employee-edit-name");
  const positionInput = document.getElementById("employee-edit-position");
  const cutoffTagInput = document.getElementById("employee-edit-cutoff-tag");
  const cutoffVisualizerInput = document.getElementById("employee-edit-cutoff-visualizer");

  if (
    !modal ||
    !form ||
    !titleElement ||
    !subtitleElement ||
    !nameField ||
    !positionField ||
    !nameInput ||
    !positionInput ||
    !cutoffTagInput ||
    !cutoffVisualizerInput
  ) {
    return null;
  }

  let activeEmployeeId = null;
  let activeBulkEmployeeIds = [];

  const getCurrentCutoffEntries = () => (typeof getCutoffEntries === "function" ? getCutoffEntries() : []);

  const buildTagOptions = (entries, selectedTag = "") => {
    const normalizedSelectedTag = String(selectedTag || "").trim();
    const options = ["<option value=\"\">Select cut off tag</option>"];

    [...entries]
      .sort((left, right) => String(left?.tag || "").localeCompare(String(right?.tag || ""), undefined, { sensitivity: "base" }))
      .forEach((entry) => {
        const tag = String(entry?.tag || "").trim();
        if (!tag) return;
        const isSelected = tag === normalizedSelectedTag ? " selected" : "";
        options.push(`<option value="${escapeHtml(tag)}"${isSelected}>${escapeHtml(tag)}</option>`);
      });

    return options.join("");
  };

  const syncCutoffPreview = () => {
    const selectedTag = String(cutoffTagInput.value || "").trim();
    const cutoffByTag = buildCutoffTagMap(getCurrentCutoffEntries());
    const selectedEntry = selectedTag ? cutoffByTag.get(selectedTag) : null;

    if (!selectedEntry) {
      cutoffVisualizerInput.value = "";
      return;
    }

    const labels = getCutoffRangeLabels(selectedEntry);
    cutoffVisualizerInput.value = `First: ${labels.firstCoLabel} | Second: ${labels.secondCoLabel}`;
  };

  const closeModal = () => {
    activeEmployeeId = null;
    activeBulkEmployeeIds = [];
    titleElement.textContent = "Edit employee";
    subtitleElement.textContent = "Update the employee details and cutoff schedule.";
    nameField.classList.remove("is-hidden");
    positionField.classList.remove("is-hidden");
    nameInput.disabled = false;
    positionInput.disabled = false;
    nameInput.readOnly = true;
    nameInput.required = false;
    positionInput.required = true;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    form.reset();
  };

  const openModal = (employee, options = {}) => {
    const bulkEmployees = Array.isArray(options.bulkEmployees) ? options.bulkEmployees : [];
    const isBulkEdit = bulkEmployees.length > 1;

    if (!isBulkEdit && !employee) return;

    const cutoffEntries = getCurrentCutoffEntries();
    let selectedTag = "";

    if (isBulkEdit) {
      const tags = Array.from(
        new Set(
          bulkEmployees
            .map((item) => String(item?.cutoff_tag || "").trim())
            .filter((tag) => Boolean(tag)),
        ),
      );
      selectedTag = tags.length === 1 ? tags[0] : "";
    } else {
      selectedTag = String(employee.cutoff_tag || "").trim();
    }

    activeBulkEmployeeIds = isBulkEdit ? bulkEmployees.map((item) => Number(item.id)).filter(Number.isFinite) : [];
    activeEmployeeId = isBulkEdit ? null : employee.id;

    if (isBulkEdit) {
      titleElement.textContent = `Edit ${activeBulkEmployeeIds.length} employees`;
      subtitleElement.textContent = "Bulk edit mode: only Cut Off Tag can be changed.";
      nameField.classList.add("is-hidden");
      positionField.classList.add("is-hidden");
      nameInput.disabled = true;
      positionInput.disabled = true;
      nameInput.readOnly = true;
      nameInput.required = false;
      positionInput.required = false;
      nameInput.value = "";
      positionInput.value = "";
    } else {
      titleElement.textContent = "Edit employee";
      subtitleElement.textContent = "Update the employee details and cutoff schedule.";
      nameField.classList.remove("is-hidden");
      positionField.classList.remove("is-hidden");
      nameInput.disabled = false;
      positionInput.disabled = false;
      nameInput.readOnly = true;
      nameInput.required = false;
      positionInput.required = true;
      nameInput.value = employee.name || "";
      positionInput.value = employee.position || "";
    }

    cutoffTagInput.innerHTML = buildTagOptions(cutoffEntries, selectedTag);
    cutoffTagInput.value = selectedTag;
    syncCutoffPreview();
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    if (isBulkEdit) {
      cutoffTagInput.focus();
    } else {
      positionInput.focus();
    }
  };

  cutoffTagInput.addEventListener("change", syncCutoffPreview);

  modal.querySelectorAll("[data-modal-close]").forEach((closeButton) => {
    closeButton.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isBulkEdit = activeBulkEmployeeIds.length > 1;
    if (!isBulkEdit && !activeEmployeeId) return;

    const trimmedPosition = positionInput.value.trim();
    const selectedTag = String(cutoffTagInput.value || "").trim();

    if (!isBulkEdit && !trimmedPosition) {
      alert("Position is required.");
      return;
    }

    if (!selectedTag) {
      alert("Select a cut off tag.");
      return;
    }

    const selectedEntry = buildCutoffTagMap(getCurrentCutoffEntries()).get(selectedTag);
    if (!selectedEntry) {
      alert("Selected cut off tag was not found. Refresh cut off list and try again.");
      return;
    }

    form.querySelectorAll("button, input, select").forEach((control) => {
      control.disabled = true;
    });

    try {
      let updatedRows = [];

      if (isBulkEdit) {
        updatedRows = await Promise.all(
          activeBulkEmployeeIds.map((employeeId) =>
            updateEmployeeInSupabase(employeeId, {
              cutoff_tag: selectedTag,
            }),
          ),
        );
      } else {
        const updated = await updateEmployeeInSupabase(activeEmployeeId, {
          position: trimmedPosition,
          cutoff_tag: selectedTag,
        });
        updatedRows = updated ? [updated] : [];
      }

      if (updatedRows.length > 0) {
        if (typeof onEmployeeUpdated === "function") {
          updatedRows.forEach((row) => onEmployeeUpdated(row));
        }
        closeModal();
      }
    } catch (error) {
      console.error("Failed to edit employee:", error);
      alert(error instanceof Error ? error.message : "Failed to update employee.");
    } finally {
      form.querySelectorAll("button, input, select").forEach((control) => {
        control.disabled = false;
      });
    }
  });

  return { openModal, closeModal };
}

function initEmployeesTab() {
  const listElement = document.getElementById("employee-list");
  const summaryElement = document.getElementById("employee-summary");
  const searchInput = document.getElementById("employee-search");
  const statusFilter = document.getElementById("employee-status-filter");
  const sortOrder = document.getElementById("employee-sort-order");

  if (!listElement || !summaryElement || !searchInput || !statusFilter || !sortOrder) return;

  let allEmployees = [];
  let cutoffEntries = [];
  let cutoffByTag = new Map();
  const selectedEmployeeIds = new Set();
  let employeeEditModal = null;

  const setCutoffEntries = (rows) => {
    cutoffEntries = Array.isArray(rows) ? rows : [];
    cutoffByTag = buildCutoffTagMap(cutoffEntries);
  };

  const loadCutoffEntries = async () => {
    const rows = await fetchCutoffListFromSupabase();
    setCutoffEntries(rows);
  };

  const getFilteredSortedEmployees = () => {
    const searchValue = searchInput.value.trim().toLowerCase();
    const statusValue = statusFilter.value;
    const sortValue = sortOrder.value || "active-first";

    const filtered = allEmployees.filter((employee) => {
      const name = String(employee.name || "").toLowerCase();
      const position = String(employee.position || "").toLowerCase();
      const isActive = employee.is_active !== false;

      const matchesSearch =
        !searchValue || name.includes(searchValue) || position.includes(searchValue);
      const matchesStatus =
        !statusValue ||
        (statusValue === "active" && isActive) ||
        (statusValue === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((left, right) => compareEmployees(sortValue, left, right));
  };

  const syncSelectAllState = () => {
    const selectAll = listElement.querySelector("#employee-select-all");
    if (!selectAll) return;

    const filtered = getFilteredSortedEmployees();
    const visibleIds = filtered.map((employee) => Number(employee.id));
    const selectedVisibleCount = visibleIds.filter((id) => selectedEmployeeIds.has(id)).length;

    if (visibleIds.length === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
      selectAll.disabled = true;
      return;
    }

    selectAll.disabled = false;
    selectAll.checked = selectedVisibleCount === visibleIds.length;
    selectAll.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;
  };

  const applyFilters = () => {
    const currentIds = new Set(allEmployees.map((employee) => Number(employee.id)));
    [...selectedEmployeeIds].forEach((id) => {
      if (!currentIds.has(id)) {
        selectedEmployeeIds.delete(id);
      }
    });

    const filtered = getFilteredSortedEmployees();
    const hasNoFilters = !searchInput.value.trim() && !statusFilter.value;
    const emptyMessage =
      hasNoFilters && allEmployees.length === 0
        ? "Connected to Supabase, but no employee rows are visible. Check if data was imported or if RLS policies allow anon SELECT."
        : "No employees match the current filters.";

    renderEmployees(filtered, summaryElement, listElement, {
      emptyMessage,
      cutoffByTag,
      selectedIds: selectedEmployeeIds,
    });
    bindRowActions();
    syncSelectAllState();
  };

  const showError = (message) => {
    summaryElement.textContent = "Total: 0 | Active: 0 | Inactive: 0";
    listElement.innerHTML = `
      ${getEmployeesTableHeader()}
      <p class="employee-error">${escapeHtml(message)}</p>
    `;
  };

  const handleEmployeeUpdated = (updatedEmployee) => {
    allEmployees = allEmployees.map((employee) =>
      Number(employee.id) === Number(updatedEmployee.id) ? updatedEmployee : employee,
    );
    applyFilters();
  };

  employeeEditModal = initEmployeeEditModal(handleEmployeeUpdated, () => cutoffEntries);

  const bindRowActions = () => {
    const selectAll = listElement.querySelector("#employee-select-all");
    if (selectAll) {
      selectAll.addEventListener("change", () => {
        getFilteredSortedEmployees().forEach((employee) => {
          const id = Number(employee.id);
          if (selectAll.checked) {
            selectedEmployeeIds.add(id);
          } else {
            selectedEmployeeIds.delete(id);
          }
        });
        applyFilters();
      });
    }

    listElement.querySelectorAll("input[data-action='select']").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const id = Number(checkbox.getAttribute("data-id"));
        if (!Number.isFinite(id)) return;
        if (checkbox.checked) {
          selectedEmployeeIds.add(id);
        } else {
          selectedEmployeeIds.delete(id);
        }
        syncSelectAllState();
      });
    });

    listElement.querySelectorAll("button[data-action='toggle']").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.getAttribute("data-id"));
        const target = allEmployees.find((employee) => Number(employee.id) === id);
        if (!target) return;

        button.disabled = true;
        try {
          const updated = await updateEmployeeInSupabase(id, {
            is_active: !(target.is_active !== false),
          });

          if (updated) {
            allEmployees = allEmployees.map((employee) =>
              Number(employee.id) === Number(updated.id) ? updated : employee,
            );
            applyFilters();
          }
        } catch (error) {
          console.error("Failed to toggle employee status:", error);
          alert(error instanceof Error ? error.message : "Failed to update status.");
        } finally {
          button.disabled = false;
        }
      });
    });

    listElement.querySelectorAll("button[data-action='edit']").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.getAttribute("data-id"));
        const target = allEmployees.find((employee) => Number(employee.id) === id);
        if (!target) return;

        const bulkTargets = allEmployees.filter((employee) => selectedEmployeeIds.has(Number(employee.id)));
        const shouldBulkEdit = bulkTargets.length > 1;

        button.disabled = true;
        try {
          await loadCutoffEntries();
          if (employeeEditModal) {
            if (shouldBulkEdit) {
              employeeEditModal.openModal(null, { bulkEmployees: bulkTargets });
            } else {
              employeeEditModal.openModal(target);
            }
          }
        } catch (error) {
          console.error("Failed to load cut off list for employee editor:", error);
          alert(error instanceof Error ? error.message : "Failed to load cut off list.");
        } finally {
          button.disabled = false;
        }
      });
    });
  };

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  sortOrder.addEventListener("change", applyFilters);

  Promise.all([
    fetchEmployeesFromSupabase(),
    loadCutoffEntries().catch((error) => {
      console.error("Failed to load cut off list for employee tab:", error);
      setCutoffEntries([]);
    }),
  ])
    .then(([rows]) => {
      allEmployees = Array.isArray(rows) ? rows : [];
      applyFilters();
    })
    .catch((error) => {
      console.error("Failed to load employees:", error);
      showError(error instanceof Error ? error.message : "Failed to load employees.");
    });
}

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
