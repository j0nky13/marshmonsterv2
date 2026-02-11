import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

/* ---------- LIST ---------- */
export async function listLeads() {
  const q = query(
    collection(db, "leads"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ---------- GET SINGLE ---------- */
export async function getLead(id) {
  if (!id) return null;

  const ref = doc(db, "leads", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

/* ---------- LIVE SUBSCRIBE ---------- */
export function subscribeToLead(id, callback) {
  if (!id) {
    callback(null);
    return () => {};
  }

  const ref = doc(db, "leads", id);

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) callback(null);
    else callback({ id: snap.id, ...snap.data() });
  });
}

/* ---------- CREATE ---------- */
export async function createLead(data) {
  const ref = collection(db, "leads");

  const docRef = await addDoc(ref, {
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    company: data.company || "",

    status: "new",
    pipelineStage: "new", 
    source: data.source || "manual",
    notes: data.notes || "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    convertedToProjectId: null,
  });

  return docRef.id;
}

/* ---------- UPDATE ---------- */
export async function updateLead(id, updates) {
  if (!id) throw new Error("updateLead missing id");

  const ref = doc(db, "leads", id);

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/* ---------- PIPELINE STAGE ---------- */
/*
This is what your Pipeline UI NEEDS.
Without this — stage changes silently fail.
*/
export async function updateLeadStage(id, stage) {
  if (!id) throw new Error("updateLeadStage missing id");

  const ref = doc(db, "leads", id);

  await updateDoc(ref, {
    pipelineStage: stage,
    updatedAt: serverTimestamp(),
  });
}