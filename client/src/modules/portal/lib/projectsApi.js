import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/*
  NOTE:
  - This file MUST stay pure JS (no JSX, no React).
  - All functions here are Firestore helpers used by portal pages.
*/

/* ---------------- LIST (ADMIN) ---------------- */
export async function listProjects() {
  const projectsCol = collection(db, "projects");
  const snap = await getDocs(projectsCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------- LIST BY CLIENT UID (CUSTOMER) ---------------- */
export async function listProjectsByClient(clientUid) {
  if (!clientUid) return [];
  const projectsCol = collection(db, "projects");
  const q = query(projectsCol, where("clientUid", "==", clientUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------- GET ---------------- */
export async function getProject(id) {
  if (!id) return null;
  const ref = doc(db, "projects", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/* ---------------- UPDATE ---------------- */
export async function updateProject(id, updates) {
  if (!id) throw new Error("updateProject: missing id");
  if (!updates || typeof updates !== "object") {
    throw new Error("updateProject: updates must be an object");
  }
  const ref = doc(db, "projects", id);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

/* ---------------- SUBSCRIBE TO SINGLE PROJECT ---------------- */
export function subscribeToProject(id, callback) {
  if (!id) {
    callback(null);
    return () => {};
  }

  const ref = doc(db, "projects", id);
  const unsubscribe = onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) callback({ id: snap.id, ...snap.data() });
      else callback(null);
    },
    (err) => {
      console.error("subscribeToProject error:", err);
      callback(null);
    }
  );

  return unsubscribe;
}

/* ---------------- COMPAT: OLD CALL SITES ----------------
   Some older pages referenced profile.uid / profileUid.
   Keep this export so those pages don't crash, but prefer clientUid.
---------------------------------------------------------- */
export async function listProjectsForProfile(profile) {
  const uid = profile?.uid;
  if (!uid) return [];

  const projectsCol = collection(db, "projects");
  // First try modern field
  const q1 = query(projectsCol, where("clientUid", "==", uid));
  const snap1 = await getDocs(q1);
  if (!snap1.empty) return snap1.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Fallback for legacy field name
  const q2 = query(projectsCol, where("profileUid", "==", uid));
  const snap2 = await getDocs(q2);
  return snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------- CONVERT MESSAGE -> PROJECT ----------------
   This is used by Inbox to "Convert to project".
   - Creates a project document.
   - Marks the message as converted.

   Assumes your contact form writes to collection: "messages".
---------------------------------------------------------- */
export async function convertMessageToProject(messageId, projectInput = {}) {
  if (!messageId) throw new Error("convertMessageToProject: missing messageId");

  // Create project
  const projectsCol = collection(db, "projects");
  const created = await addDoc(projectsCol, {
    title: projectInput.title || projectInput.clientName || "New Project",
    description: projectInput.description || "",

    // Client identity (prefer these fields if provided)
    clientUid: projectInput.clientUid || null,
    clientName: projectInput.clientName || projectInput.name || "",
    clientEmail: projectInput.clientEmail || projectInput.email || "",

    status: projectInput.status || "active",
    phase: projectInput.phase || "discovery",

    // Link back to the original lead/message
    sourceMessageId: messageId,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Mark message converted
  const msgRef = doc(db, "messages", messageId);
  await updateDoc(msgRef, {
    status: "converted",
    convertedAt: serverTimestamp(),
    projectId: created.id,
  });

  return { projectId: created.id };
}

export async function convertLeadToProject(lead) {
  if (!lead) throw new Error("Missing lead");

  const projectsCol = collection(db, "projects");

  const created = await addDoc(projectsCol, {
    title: lead.company || lead.name || "New Project",
    description: lead.notes || "",

    clientName: lead.name,
    clientEmail: lead.email,
    clientPhone: lead.phone || "",

    clientUid: null, // filled later if they become a portal user

    status: "active",
    phase: "discovery",

    sourceLeadId: lead.id,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // mark lead converted
  const leadRef = doc(db, "leads", lead.id);

  await updateDoc(leadRef, {
    status: "converted",
    convertedToProjectId: created.id,
    updatedAt: serverTimestamp(),
  });

  return created.id;
}