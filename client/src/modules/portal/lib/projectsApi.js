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
  orderBy,
} from "firebase/firestore";

/*
  PURE FIRESTORE HELPER FILE
  Role-aware.
*/

/* =====================================================
   LIST PROJECTS (ROLE-AWARE)
===================================================== */

export async function listProjects(profile) {
  if (!profile?.uid) return [];

  const role = profile.role;
  const isStaff = role === "admin" || role === "staff";

  let q;

  if (isStaff) {
    q = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(
      collection(db, "projects"),
      where("clientUid", "==", profile.uid),
      orderBy("createdAt", "desc")
    );
  }

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/* =====================================================
   GET PROJECT
===================================================== */

export async function getProject(id) {
  if (!id) return null;

  const ref = doc(db, "projects", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

/* =====================================================
   UPDATE PROJECT
===================================================== */

export async function updateProject(id, updates) {
  if (!id) throw new Error("updateProject: missing id");

  const ref = doc(db, "projects", id);

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/* =====================================================
   SUBSCRIBE TO PROJECTS (REALTIME LIST)
===================================================== */

export function subscribeToProjects(profile, callback) {
  if (!profile?.uid) {
    callback([]);
    return () => {};
  }

  const role = profile.role;
  const isStaff = role === "admin" || role === "staff";

  let q;

  if (isStaff) {
    q = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(
      collection(db, "projects"),
      where("clientUid", "==", profile.uid)
    );
  }

  return onSnapshot(
    q,
    (snap) => {
      const projects = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(projects);
    },
    (err) => {
      console.error("subscribeToProjects error:", err);
      callback([]);
    }
  );
}

/* =====================================================
   SUBSCRIBE TO SINGLE PROJECT
===================================================== */

export function subscribeToProject(id, callback) {
  if (!id) {
    callback(null);
    return () => {};
  }

  const ref = doc(db, "projects", id);

  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error("subscribeToProject error:", err);
      callback(null);
    }
  );
}

/* =====================================================
   CONVERT MESSAGE → PROJECT
===================================================== */

export async function convertMessageToProject(messageId, projectInput = {}) {
  if (!messageId) {
    throw new Error("convertMessageToProject: missing messageId");
  }

  const created = await addDoc(collection(db, "projects"), {
    title: projectInput.title || projectInput.clientName || "New Project",
    description: projectInput.description || "",
    clientUid: projectInput.clientUid || null,
    clientName: projectInput.clientName || "",
    clientEmail: projectInput.clientEmail || "",
    status: "active",
    phase: "discovery",
    source: "message",
    sourceMessageId: messageId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "messages", messageId), {
    status: "converted",
    convertedAt: serverTimestamp(),
    projectId: created.id,
  });

  return { projectId: created.id };
}

/* =====================================================
   CONVERT LEAD → PROJECT (THIS WAS MISSING)
===================================================== */

export async function convertLeadToProject(lead) {
  if (!lead) throw new Error("Missing lead");

  const created = await addDoc(collection(db, "projects"), {
    title: lead.company || lead.name || "New Project",
    description: lead.notes || "",
    clientName: lead.name || "",
    clientEmail: lead.email || "",
    clientPhone: lead.phone || "",
    clientUid: null,
    status: "active",
    phase: "discovery",
    source: "lead",
    sourceLeadId: lead.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "leads", lead.id), {
    status: "converted",
    convertedToProjectId: created.id,
    updatedAt: serverTimestamp(),
  });

  return created.id;
}