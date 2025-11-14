import { auth, googleProvider, isFirebaseEnabled } from "@/lib/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

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
    console.error(
      "Admin password not configured. Please set VITE_ADMIN_PASSWORD in .env file"
    );
    return false;
  }
  return password === ADMIN_PASSWORD;
};

const GMAIL_AUTH_KEY = "gmailAuth";
const GMAIL_EMAIL_KEY = "gmailEmail";

const setLocalGmail = (email) => {
  if (typeof window === "undefined") return;
  if (email) {
    localStorage.setItem(GMAIL_AUTH_KEY, "authenticated");
    localStorage.setItem(GMAIL_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(GMAIL_AUTH_KEY);
    localStorage.removeItem(GMAIL_EMAIL_KEY);
  }
};

export const isValidGmail = (email) => {
  if (!email) return false;
  const emailLower = email.toLowerCase().trim();
  return (
    emailLower.endsWith("@gmail.com") || emailLower.endsWith("@googlemail.com")
  );
};

export const isGmailLoggedIn = () => {
  if (isFirebaseEnabled && auth) {
    const user = auth.currentUser;
    if (user && isValidGmail(user.email)) {
      return true;
    }
  }

  if (typeof window === "undefined") return false;
  const gmailAuth = localStorage.getItem(GMAIL_AUTH_KEY);
  const gmailEmail = localStorage.getItem(GMAIL_EMAIL_KEY);
  return gmailAuth === "authenticated" && gmailEmail && isValidGmail(gmailEmail);
};

export const getGmailEmail = () => {
  if (isFirebaseEnabled && auth && auth.currentUser) {
    return auth.currentUser.email || null;
  }
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GMAIL_EMAIL_KEY);
};

export const loginWithGmail = async (email) => {
  if (isFirebaseEnabled && auth && googleProvider) {
    const result = await signInWithPopup(auth, googleProvider);
    const userEmail = result.user?.email?.toLowerCase() || "";
    if (!isValidGmail(userEmail)) {
      await signOut(auth);
      setLocalGmail(null);
      throw new Error("Please sign in with a Gmail account.");
    }
    setLocalGmail(userEmail);
    return userEmail;
  }

  if (typeof window === "undefined") return null;
  if (isValidGmail(email)) {
    const normalized = email.trim().toLowerCase();
    setLocalGmail(normalized);
    return normalized;
  }

  throw new Error("Please enter a valid Gmail address (@gmail.com).");
};

export const logoutGmail = async () => {
  setLocalGmail(null);
  if (isFirebaseEnabled && auth) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out of Firebase:", error);
    }
  }
};

export const onGmailAuthStateChange = (callback) => {
  if (!isFirebaseEnabled || !auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

