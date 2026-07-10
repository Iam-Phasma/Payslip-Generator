import {
  buildCutoffDayOptions,
  escapeHtml,
  formatOrdinalDay,
  getCutoffDayValue,
  getSecondCutoffLabelFromTo,
  normalizeCutoffDay,
  resolveFirstCutoffRange,
} from "./helpers.js";
import {
  createCutoffInSupabase,
  deleteCutoffInSupabase,
  fetchCutoffListFromSupabase,
  updateCutoffInSupabase,
} from "./supabase.js";

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

export function initFunctionTab() {
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
