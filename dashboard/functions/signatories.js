import { escapeHtml } from "./helpers.js";
import {
  createSignatoryInSupabase,
  deleteSignatoryInSupabase,
  fetchEmployeesFromSupabase,
  fetchSignatoriesFromSupabase,
  updateSignatoryInSupabase,
} from "./supabase.js";

function buildEmployeeNameOptions(names, selectedValue = "") {
  const selected = String(selectedValue || "").trim();
  const options = ["<option value=\"\">Select employee</option>"];

  names.forEach((name) => {
    const escaped = escapeHtml(name);
    const isSelected = name === selected ? " selected" : "";
    options.push(`<option value="${escaped}"${isSelected}>${escaped}</option>`);
  });

  return options.join("");
}

function getSignatoryName(row, primaryKey, fallbackKey) {
  const primary = String(row?.[primaryKey] || "").trim();
  if (primary) return primary;
  return String(row?.[fallbackKey] || "").trim();
}

function getSignatoriesTableHeader() {
  return `
    <div class="function-signatory-table-header">
      <span class="function-signatory-header-tag">Tag</span>
      <span class="function-signatory-header-name">Prepared by</span>
      <span class="function-signatory-header-name">Checked by</span>
      <span class="function-signatory-header-name">Noted by</span>
      <span class="function-signatory-header-action">Actions</span>
    </div>
  `;
}

function renderSignatoriesRows(rows, options = {}) {
  const { emptyMessage = "No signatories found." } = options;
  if (!rows.length) {
    return `<p class="no-employees">${escapeHtml(emptyMessage)}</p>`;
  }

  return rows
    .map((row) => {
      return `
        <div class="function-signatory-item">
          <span class="function-signatory-tag">${escapeHtml(row.tag || "Untitled")}</span>
          <span class="function-signatory-name">${escapeHtml(getSignatoryName(row, "prp_by", "prp") || "Not set")}</span>
          <span class="function-signatory-name">${escapeHtml(getSignatoryName(row, "chk_by", "chk") || "Not set")}</span>
          <span class="function-signatory-name">${escapeHtml(getSignatoryName(row, "ntd_by", "ntd") || "Not set")}</span>
          <div class="function-signatory-actions">
            <button class="function-signatory-edit-btn" type="button" data-signatory-action="edit" data-id="${row.id}" aria-label="Edit signatory" title="Edit signatory">
              <svg class="icon-line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-hidden="true" focusable="false">
                <path d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"></path>
              </svg>
            </button>
            <button class="function-signatory-delete-btn" type="button" data-signatory-action="delete" data-id="${row.id}" aria-label="Delete signatory" title="Delete signatory">
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

function renderSignatoriesTable(listElement, rows, options = {}) {
  if (!listElement) return;
  listElement.innerHTML = `
    ${getSignatoriesTableHeader()}
    ${renderSignatoriesRows(rows, options)}
  `;
}

function initSignatoryModal(onSaved) {
  const modal = document.getElementById("signatory-modal");
  const form = document.getElementById("signatory-form");
  const title = document.getElementById("signatory-modal-title");
  const tagInput = document.getElementById("signatory-tag");
  const prpInput = document.getElementById("signatory-prp");
  const chkInput = document.getElementById("signatory-chk");
  const ntdInput = document.getElementById("signatory-ntd");

  if (!modal || !form || !title || !tagInput || !prpInput || !chkInput || !ntdInput) {
    return null;
  }

  let activeId = null;
  let employeeNames = [];
  let activeEntry = null;

  const syncNameOptions = (values = {}) => {
    const prpValue = getSignatoryName(values, "prp_by", "prp");
    const chkValue = getSignatoryName(values, "chk_by", "chk");
    const ntdValue = getSignatoryName(values, "ntd_by", "ntd");

    const options = buildEmployeeNameOptions(employeeNames);
    prpInput.innerHTML = options;
    chkInput.innerHTML = options;
    ntdInput.innerHTML = options;

    prpInput.value = prpValue;
    chkInput.value = chkValue;
    ntdInput.value = ntdValue;
  };

  const setEmployeeNames = (names) => {
    employeeNames = [...new Set((Array.isArray(names) ? names : []).map((name) => String(name || "").trim()).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
    syncNameOptions();
  };

  const closeModal = () => {
    activeId = null;
    activeEntry = null;
    title.textContent = "Signatory Entry";
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    form.reset();
    syncNameOptions();
  };

  const openModal = (entry) => {
    activeId = entry?.id ?? null;
    activeEntry = entry || null;
    title.textContent = activeId ? "Edit Signatory Entry" : "Signatory Entry";
    tagInput.value = entry?.tag || "";
    syncNameOptions(entry || {});
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    tagInput.focus();
  };

  modal.querySelectorAll("[data-signatory-modal-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const tag = String(tagInput.value || "").trim();
    const prpBy = String(prpInput.value || "").trim();
    const chkBy = String(chkInput.value || "").trim();
    const ntdBy = String(ntdInput.value || "").trim();

    if (!tag || !prpBy || !chkBy || !ntdBy) {
      alert("Tag, PRP, CHK, and NTD are required.");
      return;
    }

    form.querySelectorAll("button, input, select").forEach((control) => {
      control.disabled = true;
    });

    try {
      const payload =
        activeEntry && !("prp_by" in activeEntry) && !("chk_by" in activeEntry) && !("ntd_by" in activeEntry)
          ? {
              tag,
              prp: prpBy,
              chk: chkBy,
              ntd: ntdBy,
            }
          : {
              tag,
              prp_by: prpBy,
              chk_by: chkBy,
              ntd_by: ntdBy,
            };

      const saved = activeId
        ? await updateSignatoryInSupabase(activeId, payload)
        : await createSignatoryInSupabase(payload);

      if (saved && typeof onSaved === "function") {
        onSaved(saved, activeId !== null);
      }

      closeModal();
    } catch (error) {
      console.error("Failed to save signatory:", error);
      alert(error instanceof Error ? error.message : "Failed to save signatory entry.");
    } finally {
      form.querySelectorAll("button, input, select").forEach((control) => {
        control.disabled = false;
      });
    }
  });

  return { openModal, setEmployeeNames };
}

export function initSignatoriesTab() {
  const listElement = document.getElementById("signatories-list");
  const addButton = document.getElementById("signatory-add-btn");
  if (!listElement || !addButton) return;

  let entries = [];
  let employeeNames = [];
  const modal = initSignatoryModal((savedEntry, isEdit) => {
    if (isEdit) {
      entries = entries.map((entry) => (Number(entry.id) === Number(savedEntry.id) ? savedEntry : entry));
    } else {
      entries = [...entries, savedEntry];
    }

    entries.sort((left, right) => String(left?.tag || "").localeCompare(String(right?.tag || ""), undefined, { sensitivity: "base" }));
    refresh();
  });

  const bindRowActions = () => {
    listElement.querySelectorAll("button[data-signatory-action='edit']").forEach((button) => {
      button.addEventListener("click", () => {
        if (!modal) return;
        const id = Number(button.getAttribute("data-id"));
        const target = entries.find((entry) => Number(entry.id) === id);
        if (!target) return;
        modal.openModal(target);
      });
    });

    listElement.querySelectorAll("button[data-signatory-action='delete']").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.getAttribute("data-id"));
        const target = entries.find((entry) => Number(entry.id) === id);
        if (!target) return;

        const shouldDelete = confirm(`Delete signatory "${target.tag || "Untitled"}"?`);
        if (!shouldDelete) return;

        button.disabled = true;
        try {
          await deleteSignatoryInSupabase(id);
          entries = entries.filter((entry) => Number(entry.id) !== id);
          refresh();
        } catch (error) {
          console.error("Failed to delete signatory:", error);
          alert(error instanceof Error ? error.message : "Failed to delete signatory entry.");
        } finally {
          button.disabled = false;
        }
      });
    });
  };

  const refresh = () => {
    renderSignatoriesTable(listElement, entries, {
      emptyMessage: "No signatory entries yet. Add your first signatory set.",
    });
    bindRowActions();
  };

  addButton.addEventListener("click", () => {
    if (!modal) return;
    modal.setEmployeeNames(employeeNames);
    modal.openModal(null);
  });

  fetchSignatoriesFromSupabase()
    .then((signatoryRows) => {
      entries = Array.isArray(signatoryRows) ? signatoryRows : [];
      entries.sort((left, right) => String(left?.tag || "").localeCompare(String(right?.tag || ""), undefined, { sensitivity: "base" }));

      refresh();
    })
    .catch((error) => {
      console.error("Failed to load signatories:", error);
      renderSignatoriesTable(listElement, [], {
        emptyMessage: error instanceof Error ? error.message : "Failed to load signatories.",
      });
    });

  fetchEmployeesFromSupabase()
    .then((employeeRows) => {

      employeeNames = Array.isArray(employeeRows)
        ? [
            ...new Set(
              employeeRows
                .filter((employee) => employee?.is_active !== false)
                .map((employee) => String(employee?.name || "").trim())
                .filter(Boolean),
            ),
          ]
            .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }))
        : [];

      if (modal) {
        modal.setEmployeeNames(employeeNames);
      }
    })
    .catch((error) => {
      console.error("Failed to load active employees for signatory dropdown:", error);
    });
}
