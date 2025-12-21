import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const COLLECTION = "projects";

/* ---------------- LIST ---------------- */
export async function listProjects() {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------- GET ---------------- */
export async function getProject(id) {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Project not found");
  return { id: snap.id, ...snap.data() };
}

/* ---------------- UPDATE ---------------- */
export async function updateProject(id, updates) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/* ---------------- CONVERT MESSAGE → PROJECT ---------------- */
export async function convertMessageToProject(message, form) {
  // Guard against double conversion
  const q = query(
    collection(db, COLLECTION),
    where("sourceMessageId", "==", message.id)
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error("Message already converted to a project");
  }

  const budgetNumber =
    form?.budget === "" || form?.budget == null ? null : Number(form.budget);

  const pagesNumber =
    form?.pages === "" || form?.pages == null ? 1 : Number(form.pages);

  const docRef = await addDoc(collection(db, COLLECTION), {
    title: form?.title?.trim() || form?.siteName?.trim() || "New Website Project",

    clientName: message.name || "Anonymous",
    clientEmail: message.email,
    description: message.message,

    // requirements
    pages: Number.isFinite(pagesNumber) ? pagesNumber : 1,
    goal: form?.goal || "",
    domain: form?.domain || "",
    graphics: !!form?.graphics,

    budget: Number.isFinite(budgetNumber) ? budgetNumber : null,
    timeline: form?.timeline || "",
    notes: form?.notes || "",

    status: "active",
    source: "message",
    sourceMessageId: message.id,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}