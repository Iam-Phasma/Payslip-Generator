export function getSupabaseConfig() {
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

const SUPABASE_REQUEST_TIMEOUT_MS = 8_000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function supabaseRequest(url, options = {}, requestLabel = "Request") {
  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error;

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`${requestLabel} timed out. Supabase took too long to respond.`);
      }

      if (!(error instanceof TypeError)) {
        throw error;
      }

      if (attempt === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 400));
      }
    }
  }

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "your Supabase project";
    }
  })();

  throw new Error(
    `${requestLabel} failed due to a network error while reaching ${host}. Check internet, DNS, or VITE_SUPABASE_URL.`,
    { cause: lastError },
  );
}

export async function fetchCutoffListFromSupabase() {
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

  const response = await supabaseRequest(
    `${baseUrl}/rest/v1/cutoff_list?${query.toString()}`,
    {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
    },
    },
    "Cut off load",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cut off load failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  return response.json();
}

export async function createCutoffInSupabase(payload) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const response = await supabaseRequest(
    `${baseUrl}/rest/v1/cutoff_list`,
    {
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
    },
    "Cut off create",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cut off create failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

export async function updateCutoffInSupabase(cutoffId, payload) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const response = await supabaseRequest(
    `${baseUrl}/rest/v1/cutoff_list?id=eq.${encodeURIComponent(cutoffId)}`,
    {
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
    },
    "Cut off update",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cut off update failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

export async function deleteCutoffInSupabase(cutoffId) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const response = await supabaseRequest(
    `${baseUrl}/rest/v1/cutoff_list?id=eq.${encodeURIComponent(cutoffId)}`,
    {
    method: "DELETE",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Content-Profile": "public",
    },
    },
    "Cut off delete",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cut off delete failed (${response.status}): ${errorText || "Unknown error"}`);
  }
}

export async function fetchEmployeesFromSupabase() {
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

  const response = await supabaseRequest(
    `${baseUrl}/rest/v1/employees?${query.toString()}`,
    {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
    },
    },
    "Employees load",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Employees load failed (${response.status}): ${errorText || "Unknown error"}`);
  }

  return response.json();
}

export async function updateEmployeeInSupabase(employeeId, payload) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const baseUrl = String(supabaseUrl).replace(/\/$/, "");
  const response = await supabaseRequest(
    `${baseUrl}/rest/v1/employees?id=eq.${encodeURIComponent(employeeId)}`,
    {
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
    },
    "Employees update",
  );

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
