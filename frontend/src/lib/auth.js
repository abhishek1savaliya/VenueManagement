const USER_TOKEN_KEY = "auth_token";
const ADMIN_TOKEN_KEY = "admin_token";
const USER_COOKIE = "auth_token";
const ADMIN_COOKIE = "admin_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function setCookie(name, value, maxAge = COOKIE_MAX_AGE) {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function clearCookie(name) {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

/** Keep the middleware-readable cookie in sync with localStorage. */
export function syncAuthCookie() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (token) {
    setCookie(USER_COOKIE, token);
  }
}

export function syncAdminCookie() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    setCookie(ADMIN_COOKIE, token);
  }
}

/** Full-page redirect so middleware sees the auth cookie (router.push can race in production). */
export function redirectAfterAuth(path) {
  if (typeof window !== "undefined") {
    window.location.replace(path);
  }
}

export function getUserToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setUserToken(token) {
  localStorage.setItem(USER_TOKEN_KEY, token);
  setCookie(USER_COOKIE, token);
}

export function clearUserToken() {
  localStorage.removeItem(USER_TOKEN_KEY);
  clearCookie(USER_COOKIE);
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  setCookie(ADMIN_COOKIE, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  clearCookie(ADMIN_COOKIE);
}

export function getAuthHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

if (typeof window !== "undefined") {
  syncAuthCookie();
  syncAdminCookie();
}
