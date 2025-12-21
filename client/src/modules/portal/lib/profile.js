import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function getUserProfile(uid) {
  if (!db) throw new Error("Firestore not initialized");
  if (!uid) return null;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

export async function ensureUserProfile({ uid, email, role = "staff" }) {
  if (!db) throw new Error("Firestore not initialized");
  if (!uid) throw new Error("UID required");

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };

  const safeRole = role === "admin" ? "staff" : role;

  await setDoc(ref, {
    email: email || "",
    role: safeRole,
    displayName: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const created = await getDoc(ref);
  return { id: created.id, ...created.data() };
}