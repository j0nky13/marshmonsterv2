import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "messages";

/**
 * Create a message (public site)
 */
export async function createMessage(payload) {
  if (!payload?.email || !payload?.message) {
    throw new Error("Missing required fields");
  }

  await addDoc(collection(db, COLLECTION), {
    name: payload.name || "",
    email: payload.email,
    message: payload.message,
    source: payload.source || "unknown",
    page: payload.page || "",
    clientUid: payload.clientUid || null,
    senderRole: payload.senderRole || "public",
    status: "new",
    read: false,
    convertedToProject: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * List messages (portal inbox)
 */
export async function listMessages() {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/* ---------------- LIST BY CLIENT ---------------- */
export async function listMessagesByClient(clientUid) {
  if (!clientUid) return [];
  const q = query(
    collection(db, COLLECTION),
    where("clientUid", "==", clientUid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update message status (open / closed)
 */
export async function updateMessageStatus(id, status) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    status,
    read: true,
  });
}

/**
 * Mark message as read (when opened)
 */
export async function markMessageRead(id) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { read: true });
}

/**
 * Delete message (admin)
 */
export async function deleteMessage(id) {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}

/**
 * Get recent messages (for dashboard)
 */
export async function listRecentMessages(limitCount = 5) {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.slice(0, limitCount).map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/**
 * Mark message as converted to project (used later)
 */
export async function markMessageConverted(id, projectId) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    convertedToProject: true,
    projectId,
  });
}

/* ---------------- PORTAL REPLY ---------------- */
export async function sendPortalReply({ threadId, message, user }) {
  if (!threadId || !message || !user?.uid) {
    throw new Error("Missing reply data");
  }

  const ref = doc(db, COLLECTION, threadId);
  await updateDoc(ref, {
    lastReply: message,
    lastReplyBy: user.uid,
    lastReplyRole: user.role,
    status: "open",
    updatedAt: serverTimestamp(),
  });
}