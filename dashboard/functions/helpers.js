export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function formatOrdinalDay(value) {
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

export function buildCutoffDayOptions({ includeEndOfMonth = false, minDay = 1, maxDay = 31 } = {}) {
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

export function normalizeCutoffDay(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(31, Math.max(1, Math.trunc(parsed)));
}

export function normalizeSecondCutoffDay(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (Math.trunc(parsed) === 0) return 0;
  return Math.min(31, Math.max(1, Math.trunc(parsed)));
}

export function getEffectiveDayForMonth(day, referenceDate = new Date()) {
  const normalized = normalizeSecondCutoffDay(day);
  const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
  if (normalized === 0) return lastDay;
  return Math.min(normalized, lastDay);
}

export function getCutoffDayValue(cutoff, key, legacyKey, fallback, { allowEndOfMonth = false } = {}) {
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

export function resolveFirstCutoffRange(cutoff) {
  const fromDay = getCutoffDayValue(cutoff, "firstco_from_day", null, 1);
  const toDay = getCutoffDayValue(cutoff, "firstco_to_day", "firstco_day", 15);
  return {
    fromDay,
    toDay: Math.max(fromDay + 1, toDay),
  };
}

export function getSecondCutoffLabelFromTo(fromDay, toDay, referenceDate = new Date()) {
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

export function buildCutoffTagMap(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    const tag = String(entry?.tag || "").trim();
    if (tag) {
      map.set(tag, entry);
    }
  });
  return map;
}

export function getCutoffRangeLabels(cutoffEntry) {
  const firstRange = resolveFirstCutoffRange(cutoffEntry || {});
  return {
    firstCoLabel: `${formatOrdinalDay(firstRange.fromDay)} to ${formatOrdinalDay(firstRange.toDay)}`,
    secondCoLabel: getSecondCutoffLabelFromTo(firstRange.fromDay, firstRange.toDay),
  };
}

export function getEmployeeCutoffDisplay(employee, cutoffByTag) {
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

export function compareEmployees(sortMode, left, right) {
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
