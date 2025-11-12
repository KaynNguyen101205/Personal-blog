const ADMIN_EMAIL = "namkhanh101205";
const USER_MODE_KEY = "userMode";
const ADMIN_EMAIL_KEY = "adminEmail";

export const isAdmin = () => {
  if (typeof window === "undefined") return false;
  const userMode = localStorage.getItem(USER_MODE_KEY);
  const adminEmail = localStorage.getItem(ADMIN_EMAIL_KEY);
  return userMode === "admin" && adminEmail === ADMIN_EMAIL;
};

export const setUserMode = (mode, email = null) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_MODE_KEY, mode);
  if (email) {
    localStorage.setItem(ADMIN_EMAIL_KEY, email);
  }
};

export const getUserMode = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_MODE_KEY);
};

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_MODE_KEY);
  localStorage.removeItem(ADMIN_EMAIL_KEY);
};

