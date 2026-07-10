import {
  buildCutoffTagMap,
  compareEmployees,
  escapeHtml,
  getCutoffRangeLabels,
  getEmployeeCutoffDisplay,
} from "./helpers.js";
import {
  fetchCutoffListFromSupabase,
  fetchEmployeesFromSupabase,
  updateEmployeeInSupabase,
} from "./supabase.js";

function normalizeEmpStat(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "PLANTILLA") return "Plantilla";
  if (normalized === "COS") return "COS";
  return "";
}

function getEmployeesTableHeader() {
  return `
    <div class="employee-table-header">
      <span class="employee-header-select">
        <input id="employee-select-all" class="employee-select-checkbox" type="checkbox" aria-label="Select all visible employees" title="Select all visible employees" />
      </span>
      <span class="employee-header-name">Name</span>
      <span class="employee-header-position">Position</span>
      <span class="employee-header-emp-stat">Type</span>
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
      const empStat = normalizeEmpStat(employee.emp_stat);
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
          <span class="employee-emp-stat">${escapeHtml(empStat || "Not set")}</span>
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

function initEmployeeEditModal(onEmployeeUpdated, getCutoffEntries) {
  const modal = document.getElementById("employee-edit-modal");
  const form = document.getElementById("employee-edit-form");
  const titleElement = document.getElementById("employee-edit-modal-title");
  const subtitleElement = document.getElementById("employee-edit-modal-subtitle");
  const nameField = document.getElementById("employee-edit-name-field");
  const positionField = document.getElementById("employee-edit-position-field");
  const empStatField = document.getElementById("employee-edit-emp-stat-field");
  const nameInput = document.getElementById("employee-edit-name");
  const positionInput = document.getElementById("employee-edit-position");
  const empStatInput = document.getElementById("employee-edit-emp-stat");
  const cutoffTagInput = document.getElementById("employee-edit-cutoff-tag");
  const cutoffVisualizerInput = document.getElementById("employee-edit-cutoff-visualizer");

  if (
    !modal ||
    !form ||
    !titleElement ||
    !subtitleElement ||
    !nameField ||
    !positionField ||
    !empStatField ||
    !nameInput ||
    !positionInput ||
    !empStatInput ||
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
    empStatField.classList.remove("is-hidden");
    nameInput.disabled = false;
    positionInput.disabled = false;
    empStatInput.disabled = false;
    nameInput.readOnly = true;
    nameInput.required = false;
    positionInput.required = true;
    empStatInput.required = true;
    cutoffTagInput.required = true;
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
    let selectedEmpStat = "";

    if (isBulkEdit) {
      const tags = Array.from(
        new Set(
          bulkEmployees
            .map((item) => String(item?.cutoff_tag || "").trim())
            .filter((tag) => Boolean(tag)),
        ),
      );
      const empStats = Array.from(
        new Set(
          bulkEmployees
            .map((item) => normalizeEmpStat(item?.emp_stat))
            .filter((value) => Boolean(value)),
        ),
      );
      selectedTag = tags.length === 1 ? tags[0] : "";
      selectedEmpStat = empStats.length === 1 ? empStats[0] : "";
    } else {
      selectedTag = String(employee.cutoff_tag || "").trim();
      selectedEmpStat = normalizeEmpStat(employee.emp_stat);
    }

    activeBulkEmployeeIds = isBulkEdit ? bulkEmployees.map((item) => Number(item.id)).filter(Number.isFinite) : [];
    activeEmployeeId = isBulkEdit ? null : employee.id;

    if (isBulkEdit) {
      titleElement.textContent = `Edit ${activeBulkEmployeeIds.length} employees`;
      subtitleElement.textContent = "Bulk edit mode: Cut Off Tag and Employment Type can be changed.";
      nameField.classList.add("is-hidden");
      positionField.classList.add("is-hidden");
      empStatField.classList.remove("is-hidden");
      nameInput.disabled = true;
      positionInput.disabled = true;
      empStatInput.disabled = false;
      nameInput.readOnly = true;
      nameInput.required = false;
      positionInput.required = false;
      empStatInput.required = false;
      cutoffTagInput.required = false;
      nameInput.value = "";
      positionInput.value = "";
      empStatInput.value = selectedEmpStat;
    } else {
      titleElement.textContent = "Edit employee";
      subtitleElement.textContent = "Update the employee details and cutoff schedule.";
      nameField.classList.remove("is-hidden");
      positionField.classList.remove("is-hidden");
      empStatField.classList.remove("is-hidden");
      nameInput.disabled = false;
      positionInput.disabled = false;
      empStatInput.disabled = false;
      nameInput.readOnly = true;
      nameInput.required = false;
      positionInput.required = true;
      empStatInput.required = true;
      cutoffTagInput.required = true;
      nameInput.value = employee.name || "";
      positionInput.value = employee.position || "";
      empStatInput.value = selectedEmpStat;
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
    const selectedEmpStat = normalizeEmpStat(empStatInput.value);
    const selectedTag = String(cutoffTagInput.value || "").trim();

    if (!isBulkEdit && !trimmedPosition) {
      alert("Position is required.");
      return;
    }

    if (!isBulkEdit && !selectedTag) {
      alert("Select a cut off tag.");
      return;
    }

    if (!isBulkEdit && !selectedEmpStat) {
      alert("Select an employment type.");
      return;
    }

    const selectedEntry = selectedTag
      ? buildCutoffTagMap(getCurrentCutoffEntries()).get(selectedTag)
      : null;
    if (selectedTag && !selectedEntry) {
      alert("Selected cut off tag was not found. Refresh cut off list and try again.");
      return;
    }

    form.querySelectorAll("button, input, select").forEach((control) => {
      control.disabled = true;
    });

    try {
      let updatedRows = [];

      if (isBulkEdit) {
        const bulkPayload = {};
        if (selectedTag) {
          bulkPayload.cutoff_tag = selectedTag;
        }
        if (selectedEmpStat) {
          bulkPayload.emp_stat = selectedEmpStat;
        }

        if (Object.keys(bulkPayload).length === 0) {
          alert("Select a Cut Off Tag or Employment Type to apply in bulk.");
          return;
        }

        updatedRows = await Promise.all(
          activeBulkEmployeeIds.map((employeeId) =>
            updateEmployeeInSupabase(employeeId, bulkPayload),
          ),
        );
      } else {
        const updated = await updateEmployeeInSupabase(activeEmployeeId, {
          position: trimmedPosition,
          emp_stat: selectedEmpStat,
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

export function initEmployeesTab() {
  const listElement = document.getElementById("employee-list");
  const summaryElement = document.getElementById("employee-summary");
  const searchInput = document.getElementById("employee-search");
  const sortToggleButton = document.getElementById("employee-sort-toggle-btn");
  const sortPanel = document.getElementById("employee-sort-panel");
  const applySortButton = document.getElementById("employee-apply-sort-btn");
  const clearSortButton = document.getElementById("employee-clear-sort-btn");
  const filterToggleButton = document.getElementById("employee-filter-toggle-btn");
  const filterPanel = document.getElementById("employee-filter-panel");
  const applyFilterButton = document.getElementById("employee-apply-filter-btn");
  const clearFilterButton = document.getElementById("employee-clear-filter-btn");
  const positionFilter = document.getElementById("employee-position-filter");
  const statusFilter = document.getElementById("employee-status-filter");
  const empStatFilter = document.getElementById("employee-emp-stat-filter");
  const sortOrder = document.getElementById("employee-sort-order");
  const sortStatus = document.getElementById("employee-sort-status");

  if (
    !listElement ||
    !summaryElement ||
    !searchInput ||
    !sortToggleButton ||
    !sortPanel ||
    !applySortButton ||
    !clearSortButton ||
    !filterToggleButton ||
    !filterPanel ||
    !applyFilterButton ||
    !clearFilterButton ||
    !positionFilter ||
    !statusFilter ||
    !empStatFilter ||
    !sortOrder ||
    !sortStatus
  ) {
    return;
  }

  let allEmployees = [];
  let cutoffEntries = [];
  let cutoffByTag = new Map();
  let appliedPositionFilter = "";
  let appliedStatusFilter = "";
  let appliedEmpStatFilter = "";
  let activeSortOrder = "az";
  let activeSortStatus = "active-first";
  const selectedEmployeeIds = new Set();
  let employeeEditModal = null;

  const syncControlButtonStates = () => {
    const hasAppliedFilter = Boolean(appliedPositionFilter || appliedStatusFilter || appliedEmpStatFilter);
    const hasAppliedSort = activeSortOrder !== "az" || activeSortStatus !== "active-first";

    filterToggleButton.classList.toggle("active", hasAppliedFilter);
    sortToggleButton.classList.toggle("active", hasAppliedSort);
  };

  const positionMatches = (filterValue, positionValue) => {
    if (!filterValue) return true;
    return String(filterValue).toLowerCase() === String(positionValue || "").toLowerCase();
  };

  const syncPositionOptions = () => {
    const values = Array.from(
      new Set(
        allEmployees
          .map((employee) => String(employee.position || "").trim())
          .filter((value) => Boolean(value)),
      ),
    ).sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));

    positionFilter.innerHTML = [
      '<option value="">All positions</option>',
      ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
    ].join("");
  };

  const positionFilterValue = () => String(positionFilter.value || "").trim();

  const positionForCompare = (value) => String(value || "").trim();

  const openFilterPanel = () => {
    syncPositionOptions();
    positionFilter.value = appliedPositionFilter;
    statusFilter.value = appliedStatusFilter;
    empStatFilter.value = appliedEmpStatFilter;
    filterPanel.classList.add("show");
    filterPanel.setAttribute("aria-hidden", "false");
    sortPanel.classList.remove("show");
    sortPanel.setAttribute("aria-hidden", "true");
    positionFilter.focus();
  };

  const closeFilterPanel = () => {
    filterPanel.classList.remove("show");
    filterPanel.setAttribute("aria-hidden", "true");
  };

  const openSortPanel = () => {
    sortOrder.value = activeSortOrder;
    sortStatus.value = activeSortStatus;
    sortPanel.classList.add("show");
    sortPanel.setAttribute("aria-hidden", "false");
    filterPanel.classList.remove("show");
    filterPanel.setAttribute("aria-hidden", "true");
    sortOrder.focus();
  };

  const closeSortPanel = () => {
    sortPanel.classList.remove("show");
    sortPanel.setAttribute("aria-hidden", "true");
  };

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
    const positionValue = positionForCompare(appliedPositionFilter);
    const statusValue = appliedStatusFilter;
    const empStatValue = normalizeEmpStat(appliedEmpStatFilter);
    const sortOrderValue = activeSortOrder || "az";
    const sortStatusValue = activeSortStatus || "active-first";

    const filtered = allEmployees.filter((employee) => {
      const name = String(employee.name || "").toLowerCase();
      const position = String(employee.position || "").toLowerCase();
      const empStat = normalizeEmpStat(employee.emp_stat).toLowerCase();
      const positionRaw = positionForCompare(employee.position);
      const isActive = employee.is_active !== false;

      const matchesSearch =
        !searchValue || name.includes(searchValue) || position.includes(searchValue) || empStat.includes(searchValue);
      const matchesStatus =
        !statusValue ||
        (statusValue === "active" && isActive) ||
        (statusValue === "inactive" && !isActive);
      const matchesEmpStat = !empStatValue || normalizeEmpStat(employee.emp_stat) === empStatValue;
      const matchesPosition = positionMatches(positionValue, positionRaw);

      return matchesSearch && matchesStatus && matchesEmpStat && matchesPosition;
    });

    return filtered.sort((left, right) => {
      const leftActive = left.is_active !== false ? 1 : 0;
      const rightActive = right.is_active !== false ? 1 : 0;

      if (sortStatusValue === "active-first" && leftActive !== rightActive) {
        return rightActive - leftActive;
      }

      if (sortStatusValue === "inactive-first" && leftActive !== rightActive) {
        return leftActive - rightActive;
      }

      const nameCompare = String(left.name || "").localeCompare(String(right.name || ""), undefined, {
        sensitivity: "base",
      });

      return sortOrderValue === "za" ? -nameCompare : nameCompare;
    });
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
    const hasNoFilters = !searchInput.value.trim() && !appliedPositionFilter && !appliedStatusFilter && !appliedEmpStatFilter;
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
  filterToggleButton.addEventListener("click", () => {
    if (filterPanel.classList.contains("show")) {
      closeFilterPanel();
      return;
    }
    openFilterPanel();
  });

  sortToggleButton.addEventListener("click", () => {
    if (sortPanel.classList.contains("show")) {
      closeSortPanel();
      return;
    }
    openSortPanel();
  });

  applyFilterButton.addEventListener("click", () => {
    appliedPositionFilter = positionFilterValue();
    appliedStatusFilter = statusFilter.value;
    appliedEmpStatFilter = normalizeEmpStat(empStatFilter.value);
    syncControlButtonStates();
    applyFilters();
    closeFilterPanel();
  });

  clearFilterButton.addEventListener("click", () => {
    positionFilter.value = "";
    statusFilter.value = "";
    empStatFilter.value = "";
    appliedPositionFilter = "";
    appliedStatusFilter = "";
    appliedEmpStatFilter = "";
    syncControlButtonStates();
    applyFilters();
    closeFilterPanel();
  });

  applySortButton.addEventListener("click", () => {
    activeSortOrder = sortOrder.value || "az";
    activeSortStatus = sortStatus.value || "active-first";
    syncControlButtonStates();
    applyFilters();
    closeSortPanel();
  });

  clearSortButton.addEventListener("click", () => {
    activeSortOrder = "az";
    activeSortStatus = "active-first";
    sortOrder.value = "az";
    sortStatus.value = "active-first";
    syncControlButtonStates();
    applyFilters();
    closeSortPanel();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (
      filterPanel.classList.contains("show") &&
      !filterPanel.contains(target) &&
      !filterToggleButton.contains(target)
    ) {
      closeFilterPanel();
    }

    if (
      sortPanel.classList.contains("show") &&
      !sortPanel.contains(target) &&
      !sortToggleButton.contains(target)
    ) {
      closeSortPanel();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFilterPanel();
      closeSortPanel();
    }
  });

  Promise.all([
    fetchEmployeesFromSupabase(),
    loadCutoffEntries().catch((error) => {
      console.error("Failed to load cut off list for employee tab:", error);
      setCutoffEntries([]);
    }),
  ])
    .then(([rows]) => {
      allEmployees = Array.isArray(rows) ? rows : [];
      syncPositionOptions();
      syncControlButtonStates();
      applyFilters();
    })
    .catch((error) => {
      console.error("Failed to load employees:", error);
      showError(error instanceof Error ? error.message : "Failed to load employees.");
    });
}
