import { db } from "../../../lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

/* ======================================================
   USERS
   ====================================================== */

/**
 * List all users (admin only)
 */
export async function listUsers() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update logged-in user's preferences (safe)
 * - Writes ONLY: displayName + preferences.* + updatedAt
 * - Never writes: email, role
 * - Merges preferences to avoid clobber
 * - Never reads the user doc (write-only)
 * - Returns an optimistic merged object
 */
export async function updateMyPreferences(uid, prefs = {}) {
  if (!uid) throw new Error("updateMyPreferences: missing uid");

  const ref = doc(db, "users", uid);

  // Build preferences payload optimistically (merge with supplied fields only)
  const nextPrefs = {};
  if (prefs.timezone !== undefined) nextPrefs.timezone = prefs.timezone;
  if (prefs.dateFormat !== undefined) nextPrefs.dateFormat = prefs.dateFormat;
  if (prefs.notifications !== undefined) {
    nextPrefs.notifications = { ...prefs.notifications };
  }

  const payload = {
    updatedAt: serverTimestamp(),
  };
  if (prefs.displayName !== undefined) {
    payload.displayName = prefs.displayName;
  }
  if (Object.keys(nextPrefs).length > 0) {
    payload.preferences = nextPrefs;
  }

  await updateDoc(ref, payload);

  // Return an optimistic merged object (not reading from Firestore)
  return {
    uid,
    ...(prefs.displayName !== undefined ? { displayName: prefs.displayName } : {}),
    preferences: {
      ...(nextPrefs || {}),
    },
  };
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId, role) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { role, updatedAt: serverTimestamp() });
}

/**
 * Enable / disable user (admin only)
 */
export async function setUserActive(userId, active) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { active, updatedAt: serverTimestamp() });
}

/* ======================================================
   INVITES
   ====================================================== */

export async function createInvite({ email, role }) {
  const ref = collection(db, "invites");
  const docRef = await addDoc(ref, {
    email: (email || "").trim().toLowerCase(),
    role,
    status: "pending",
    createdAt: serverTimestamp(),
    resentAt: null,
  });

  return { id: docRef.id };
}

export async function listInvites() {
  const q = query(collection(db, "invites"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markInviteResent(inviteId) {
  const ref = doc(db, "invites", inviteId);
  await updateDoc(ref, { resentAt: serverTimestamp() });
}

export async function revokeInvite(inviteId) {
  const ref = doc(db, "invites", inviteId);
  await updateDoc(ref, { status: "revoked" });
}