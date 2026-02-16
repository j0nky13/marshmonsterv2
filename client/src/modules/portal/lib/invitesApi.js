import { httpsCallable } from "firebase/functions";
import { functions } from "../../../lib/firebase";

/*
  INVITES API (Cloud Function based)
  -----------------------------------
  All invite logic goes through backend functions.
*/

/* ==============================
   Create Invite (Admin only)
============================== */
export async function createInvite({ email, role }) {
  if (!email) throw new Error("Email required");

  const fn = httpsCallable(functions, "createInvite");

  const result = await fn({
    email: email.trim().toLowerCase(),
    role: role || "user",
  });

  return result.data;
}

/* ==============================
   List Invites (Admin only)
============================== */
export async function listInvites() {
  const fn = httpsCallable(functions, "listInvites");
  const result = await fn();
  return result.data || [];
}

/* ==============================
   Revoke Invite
============================== */
export async function revokeInvite(email) {
  const fn = httpsCallable(functions, "revokeInvite");
  const result = await fn({ email });
  return result.data;
}

/* ==============================
   Mark Invite Resent
============================== */
export async function markInviteResent(email) {
  const fn = httpsCallable(functions, "markInviteResent");
  const result = await fn({ email });
  return result.data;
}