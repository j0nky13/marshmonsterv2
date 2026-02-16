import { httpsCallable } from "firebase/functions";
import { functions } from "../../../lib/firebase";

/* ======================================================
   USERS (Cloud Function Only)
   ====================================================== */

/**
 * List all users (admin only)
 */
export async function listUsers() {
  const fn = httpsCallable(functions, "listUsers");
  const result = await fn();
  return result.data || [];
}

/**
 * Update logged-in user's preferences
 * (handled fully server-side)
 */
export async function updateMyPreferences(uid, prefs = {}) {
  if (!uid) throw new Error("updateMyPreferences: missing uid");

  const fn = httpsCallable(functions, "updateMyPreferences");

  const result = await fn({
    uid,
    prefs,
  });

  return result.data;
}

export async function updateUserRole(userId, role) {
  const fn = httpsCallable(functions, "updateUserRole");
  const result = await fn({ uid: userId, role });
  return result.data;
}

export async function setUserActive(userId, active) {
  const fn = httpsCallable(functions, "setUserActive");
  const result = await fn({ uid: userId, active });
  return result.data;
}