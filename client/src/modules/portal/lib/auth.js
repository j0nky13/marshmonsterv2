// src/modules/portal/lib/auth.js
import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../../../lib/firebase";
import { findPendingInviteByEmail } from "./invitesApi";
import { ensureUserProfile } from "./profile";

const STORAGE_KEY = "mm_emailForSignIn";

function actionCodeSettings() {
  return {
    url: `${window.location.origin}/portal/login`,
    handleCodeInApp: true,
  };
}

export async function sendLoginLink(email) {
  if (!email) throw new Error("Email is required");
  await sendSignInLinkToEmail(auth, email, actionCodeSettings());
  window.localStorage.setItem(STORAGE_KEY, email);
  return true;
}

// Backwards compat
export async function login(email) {
  return sendLoginLink(email);
}

/**
 * OTP Step 2: complete login when user opens email link
 * ALSO: auto-provision /users/{uid} using invite role or default "staff"
 */
export async function completeEmailLogin() {
  const href = window.location.href;
  if (!isSignInWithEmailLink(auth, href)) return null;

  const email =
    window.localStorage.getItem(STORAGE_KEY) ||
    window.prompt("Confirm your email to finish signing in:");

  if (!email) throw new Error("Email confirmation cancelled");

  const result = await signInWithEmailLink(auth, email, href);
  window.localStorage.removeItem(STORAGE_KEY);

  // ✅ NEW: auto-provision profile
  try {
    const invite = await findPendingInviteByEmail(email);
    const role = invite?.role || "staff";
    await ensureUserProfile({ uid: result.user.uid, email: result.user.email, role });
  } catch (e) {
    // If rules block or something else, surface it—this is important during setup
    console.error("ensureUserProfile failed:", e);
  }

  return result.user;
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function onUserChanged(cb) {
  return onAuthStateChanged(auth, cb);
}

// Backwards-compat alias (PortalApp.jsx expects this name)
export const onUserChange = onUserChanged;

export async function logout() {
  await signOut(auth);
}