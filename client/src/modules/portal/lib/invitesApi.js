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
  where,
  limit,
} from "firebase/firestore";

/**
 * Create a new invite
 */
export async function createInvite({ email, role }) {
  const ref = collection(db, "invites");
  const docRef = await addDoc(ref, {
    email: email.toLowerCase(),
    role,
    status: "pending",
    createdAt: serverTimestamp(),
    resentAt: null,
  });

  return { id: docRef.id };
}

/**
 * List invites (admin)
 */
export async function listInvites() {
  const q = query(collection(db, "invites"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Mark invite resent (admin)
 */
export async function markInviteResent(inviteId) {
  const ref = doc(db, "invites", inviteId);
  await updateDoc(ref, {
    resentAt: serverTimestamp(),
  });
}

/**
 * Revoke invite (admin) - soft revoke
 */
export async function revokeInvite(inviteId) {
  const ref = doc(db, "invites", inviteId);
  await updateDoc(ref, {
    status: "revoked",
  });
}

/**
 * Find a pending invite by email
 * Used during auth/login
 */
export async function findPendingInviteByEmail(email) {
  if (!email) return null;

  const q = query(
    collection(db, "invites"),
    where("email", "==", email.toLowerCase()),
    where("status", "==", "pending"),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}