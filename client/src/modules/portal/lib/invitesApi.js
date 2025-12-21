import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const INVITES = "invites";

/**
 * Create an invite record (admin-only by rules)
 * role should be: "staff" | "user" | "admin" (admin allowed here, but we still guard self-creation elsewhere)
 */
export async function createInvite({ email, role = "staff" }) {
  if (!db) throw new Error("Firestore not initialized");
  if (!email) throw new Error("Email is required");

  const clean = String(email).trim().toLowerCase();

  // prevent spam/duplicates: if an active invite exists, reuse it
  const q = query(
    collection(db, INVITES),
    where("email", "==", clean),
    where("status", "==", "pending"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const existing = snap.docs[0];
    return { id: existing.id, ...existing.data() };
  }

  const docRef = await addDoc(collection(db, INVITES), {
    email: clean,
    role,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id };
}

export async function findPendingInviteByEmail(email) {
  if (!db) throw new Error("Firestore not initialized");
  if (!email) return null;

  const clean = String(email).trim().toLowerCase();
  const q = query(
    collection(db, INVITES),
    where("email", "==", clean),
    where("status", "==", "pending"),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}