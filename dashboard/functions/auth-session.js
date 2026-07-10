const SESSION_STORAGE_KEYS = {
  accessToken: "supabase_access_token",
  refreshToken: "supabase_refresh_token",
  expiresAt: "supabase_expires_at",
  user: "supabase_user",
};

const AUTH_REQUEST_TIMEOUT_MS = 10_000;

export function getPublicSupabaseConfig() {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_PROJECT_URL || "";
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    "";

  return {
    supabaseUrl: String(supabaseUrl).trim(),
    supabaseKey: String(supabaseKey).trim(),
  };
}

function getBaseUrl() {
  return getPublicSupabaseConfig().supabaseUrl.replace(/\/$/, "");
}

function getNowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function getLocalValue(key) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function setLocalValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures so auth flow can still continue.
  }
}

function removeLocalValue(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

  return fetch(url, {
    ...options,
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  removeLocalValue(SESSION_STORAGE_KEYS.accessToken);
  removeLocalValue(SESSION_STORAGE_KEYS.refreshToken);
  removeLocalValue(SESSION_STORAGE_KEYS.expiresAt);
  removeLocalValue(SESSION_STORAGE_KEYS.user);
  removeLocalValue("admin_session_token");
}

export function readLocalSession() {
  const accessToken = getLocalValue(SESSION_STORAGE_KEYS.accessToken);
  const refreshToken = getLocalValue(SESSION_STORAGE_KEYS.refreshToken);
  const expiresAt = Number(getLocalValue(SESSION_STORAGE_KEYS.expiresAt) || "0");
  const userRaw = getLocalValue(SESSION_STORAGE_KEYS.user);

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : 0,
    user,
  };
}

export function persistSession(sessionPayload) {
  const accessToken = String(sessionPayload?.access_token || "").trim();
  const refreshToken = String(sessionPayload?.refresh_token || "").trim();
  const expiresAt = Number(sessionPayload?.expires_at || 0);
  const user = sessionPayload?.user || null;

  if (accessToken) {
    setLocalValue(SESSION_STORAGE_KEYS.accessToken, accessToken);
  }

  if (refreshToken) {
    setLocalValue(SESSION_STORAGE_KEYS.refreshToken, refreshToken);
  }

  if (Number.isFinite(expiresAt) && expiresAt > 0) {
    setLocalValue(SESSION_STORAGE_KEYS.expiresAt, String(expiresAt));
  }

  if (user) {
    setLocalValue(SESSION_STORAGE_KEYS.user, JSON.stringify(user));
  }
}

function isSessionExpired(session, skewSeconds = 30) {
  if (!session?.accessToken) return true;
  if (!Number.isFinite(session?.expiresAt) || session.expiresAt <= 0) return true;
  return session.expiresAt <= getNowInSeconds() + skewSeconds;
}

async function validateAccessToken(accessToken) {
  const { supabaseKey } = getPublicSupabaseConfig();
  const baseUrl = getBaseUrl();

  if (!accessToken || !supabaseKey || !baseUrl) {
    return false;
  }

  const response = await fetchWithTimeout(`${baseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  return response.ok;
}

async function refreshSession(refreshToken) {
  const { supabaseKey } = getPublicSupabaseConfig();
  const baseUrl = getBaseUrl();

  if (!refreshToken || !supabaseKey || !baseUrl) {
    return null;
  }

  const response = await fetchWithTimeout(`${baseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await parseJsonSafe(response);
  if (!payload?.access_token) {
    return null;
  }

  persistSession(payload);
  return readLocalSession();
}

export async function ensureValidSession(options = {}) {
  const { validateIfUnexpired = false } = options;
  const session = readLocalSession();

  if (!session.accessToken && !session.refreshToken) {
    return null;
  }

  if (!isSessionExpired(session)) {
    if (!validateIfUnexpired) {
      return session;
    }

    const isValid = await validateAccessToken(session.accessToken);
    if (isValid) {
      return session;
    }
  }

  if (!session.refreshToken) {
    clearLocalSession();
    return null;
  }

  const refreshed = await refreshSession(session.refreshToken);
  if (!refreshed?.accessToken || isSessionExpired(refreshed, 0)) {
    clearLocalSession();
    return null;
  }

  return refreshed;
}

export async function signOutSession() {
  const session = readLocalSession();
  const { supabaseKey } = getPublicSupabaseConfig();
  const baseUrl = getBaseUrl();

  if (!session.accessToken || !supabaseKey || !baseUrl) {
    return;
  }

  try {
    await fetchWithTimeout(`${baseUrl}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch {
    // Best effort only; local cleanup still logs the user out.
  }
}
