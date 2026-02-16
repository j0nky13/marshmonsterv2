import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../../../lib/firebase";

const STORAGE_KEY = "mm_emailForSignIn";

/* ================= ACTION SETTINGS ================= */

function actionCodeSettings() {
  return {
    url: `${window.location.origin}/portal/login`,
    handleCodeInApp: true,
  };
}

/* ================= SEND LINK ================= */

export async function sendLoginLink(email) {
  if (!email) throw new Error("Email is required");

  await sendSignInLinkToEmail(auth, email, actionCodeSettings());
  window.localStorage.setItem(STORAGE_KEY, email);
  return true;
}

export async function login(email) {
  return sendLoginLink(email);
}

/* ================= COMPLETE LOGIN ================= */

export async function completeEmailLogin() {
  const href = window.location.href;

  if (!isSignInWithEmailLink(auth, href)) {
    return null;
  }

  const email =
    window.localStorage.getItem(STORAGE_KEY) ||
    window.prompt("Confirm your email to finish signing in:");

  if (!email) throw new Error("Email confirmation cancelled");

  const result = await signInWithEmailLink(auth, email, href);

  window.localStorage.removeItem(STORAGE_KEY);

  await new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve();
      }
    });
  });

  return result.user;
}

/* ================= HELPERS ================= */

export function getCurrentUser() {
  return auth.currentUser;
}

export function onUserChanged(cb) {
  return onAuthStateChanged(auth, cb);
}

export const onUserChange = onUserChanged;

export async function logout() {
  await signOut(auth);
}