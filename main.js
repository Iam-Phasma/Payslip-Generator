import {
  clearLocalSession,
  ensureValidSession,
  persistSession,
} from "./dashboard/functions/auth-session.js";

const loginStatus = document.getElementById("login-status");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("toggle-password-btn");
const loginBtn = document.getElementById("login-btn");
const loginBtnText = document.getElementById("login-btn-text");
const loginBtnLottie = document.getElementById("login-btn-lottie");

let showLottieDelayTimer = null;
const LOADER_DELAY_MS = 1200;
const AUTH_REQUEST_TIMEOUT_MS = 15000;
const DASHBOARD_PATH = `${import.meta.env.BASE_URL}dashboard/dashboard.html`;

const setLoginLoading = (loading) => {
  loginBtn.disabled = loading;

  if (showLottieDelayTimer) {
    clearTimeout(showLottieDelayTimer);
    showLottieDelayTimer = null;
  }

  if (loading) {
    loginBtnText.textContent = "Signing in...";
    if (loginBtnLottie) {
      loginBtnLottie.style.display = "none";
      showLottieDelayTimer = setTimeout(() => {
        if (loginBtn.disabled) {
          loginBtnText.style.display = "none";
          loginBtnLottie.style.display = "block";
        }
      }, LOADER_DELAY_MS);
    }
    return;
  }

  loginBtnText.textContent = "Sign in";
  loginBtnText.style.display = "";
  if (loginBtnLottie) {
    loginBtnLottie.style.display = "none";
  }
};

const getSupabaseConfig = () => {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_PROJECT_URL ||
    "";
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    "";

  return {
    supabaseUrl: String(supabaseUrl).trim(),
    supabaseKey: String(supabaseKey).trim(),
  };
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const signInWithPassword = async ({ email, password, supabaseUrl, supabaseKey }) => {
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const response = await fetchWithTimeout(
    `${baseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    const errorMessage = payload?.msg || payload?.error_description || payload?.error || "Authentication failed.";
    throw new Error(errorMessage);
  }

  return payload;
};

const fetchUserProfile = async ({ userId, accessToken, supabaseUrl, supabaseKey }) => {
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const response = await fetchWithTimeout(
    `${baseUrl}/rest/v1/profiles?select=role,access_enabled&id=eq.${encodeURIComponent(userId)}&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Accept-Profile": "public",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const rows = await parseJsonSafe(response);
  return Array.isArray(rows) ? rows[0] || null : null;
};

const tryRedirectIfAlreadyLoggedIn = async () => {
  try {
    const session = await ensureValidSession({ validateIfUnexpired: true });
    if (session?.accessToken) {
      window.location.replace(DASHBOARD_PATH);
      return;
    }
  } catch {
    // Ignore and continue showing the login form.
  }

  clearLocalSession();
};

const showStatus = (message, type = "neutral") => {
  loginStatus.textContent = message;
  loginStatus.classList.remove("status--neutral", "status--success", "status--error", "hidden", "status--shake");
  loginStatus.classList.add(`status--${type}`);

  if (type === "error") {
    void loginStatus.offsetWidth;
    loginStatus.classList.add("status--shake");
  }
};

const handleLogin = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!email || !password) {
    showStatus("Please enter email and password.", "error");
    return;
  }

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
    if (!supabaseKey) missing.push("VITE_SUPABASE_ANON_KEY");
    showStatus(`Missing Supabase configuration: ${missing.join(", ")}.`, "error");
    return;
  }

  setLoginLoading(true);
  showStatus("Signing in...", "neutral");

  try {
    const authPayload = await signInWithPassword({
      email,
      password,
      supabaseUrl,
      supabaseKey,
    });

    const user = authPayload?.user;
    if (!user?.id) {
      throw new Error("Unable to load authenticated user.");
    }

    const profile = await fetchUserProfile({
      userId: user.id,
      accessToken: authPayload.access_token,
      supabaseUrl,
      supabaseKey,
    });

    if (profile?.access_enabled === false) {
      throw new Error("Your account access has been disabled. Please contact the administrator.");
    }

    persistSession(authPayload);
    showStatus("Signed in. Redirecting...", "success");
    setTimeout(() => {
      window.location.href = DASHBOARD_PATH;
    }, 300);
  } catch (error) {
    const message = String(error?.message || "Authentication failed.");
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid") || normalized.includes("credentials") || normalized.includes("authentication failed")) {
      showStatus("Invalid email or password.", "error");
    } else if (normalized.includes("email not confirmed")) {
      showStatus("Email not confirmed. Please verify your account first.", "error");
    } else if (normalized.includes("abort")) {
      showStatus("Sign in timed out. Please try again.", "error");
    } else {
      showStatus(message, "error");
    }
    setLoginLoading(false);
    return;
  }

  setLoginLoading(false);
};

if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    togglePasswordBtn.setAttribute("aria-pressed", isVisible ? "false" : "true");
    togglePasswordBtn.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", handleLogin);
}

[emailInput, passwordInput].forEach((input) => {
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  });
});

void tryRedirectIfAlreadyLoggedIn();
