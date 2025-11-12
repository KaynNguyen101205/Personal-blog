// Get admin password from environment variable
// In Vite, environment variables must be prefixed with VITE_ to be exposed to client
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";
const USER_MODE_KEY = "userMode";
const ADMIN_AUTH_KEY = "adminAuth";

export const isAdmin = () => {
  if (typeof window === "undefined") return false;
  const userMode = localStorage.getItem(USER_MODE_KEY);
  const adminAuth = localStorage.getItem(ADMIN_AUTH_KEY);
  return userMode === "admin" && adminAuth === "authenticated";
};

export const setUserMode = (mode, authenticated = false) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_MODE_KEY, mode);
  if (authenticated && mode === "admin") {
    localStorage.setItem(ADMIN_AUTH_KEY, "authenticated");
  }
};

export const getUserMode = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_MODE_KEY);
};

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_MODE_KEY);
  localStorage.removeItem(ADMIN_AUTH_KEY);
};

export const verifyAdminPassword = (password) => {
  if (!ADMIN_PASSWORD) {
    console.error("Admin password not configured. Please set VITE_ADMIN_PASSWORD in .env file");
    return false;
  }
  return password === ADMIN_PASSWORD;
};

const GMAIL_AUTH_KEY = "gmailAuth";
const GMAIL_EMAIL_KEY = "gmailEmail";

export const isGmailLoggedIn = () => {
  if (typeof window === "undefined") return false;
  const gmailAuth = localStorage.getItem(GMAIL_AUTH_KEY);
  const gmailEmail = localStorage.getItem(GMAIL_EMAIL_KEY);
  return gmailAuth === "authenticated" && gmailEmail && isValidGmail(gmailEmail);
};

export const isValidGmail = (email) => {
  if (!email) return false;
  const emailLower = email.toLowerCase().trim();
  return emailLower.endsWith("@gmail.com") || emailLower.endsWith("@googlemail.com");
};

export const loginWithGmail = (email) => {
  if (typeof window === "undefined") return false;
  if (isValidGmail(email)) {
    localStorage.setItem(GMAIL_AUTH_KEY, "authenticated");
    localStorage.setItem(GMAIL_EMAIL_KEY, email.trim().toLowerCase());
    return true;
  }
  return false;
};

export const getGmailEmail = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GMAIL_EMAIL_KEY);
};

export const logoutGmail = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GMAIL_AUTH_KEY);
  localStorage.removeItem(GMAIL_EMAIL_KEY);
};

