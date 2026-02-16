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

/* =====================================================
   CREATE MESSAGE (PUBLIC)
===================================================== */

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
    senderUid: payload.senderUid || null,
    senderRole: payload.senderRole || "public",
    status: "new",
    read: false,
    convertedToProject: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/* =====================================================
   LIST MESSAGES (ROLE-AWARE)
===================================================== */

export async function listMessages(profile) {
  if (!profile?.uid) return [];

  const role = profile.role;
  const isStaff = role === "admin" || role === "staff";

  if (isStaff) {
    const q = query(
      collection(db, COLLECTION),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // CUSTOMER VIEW
  // Must include:
  // - messages where they are client
  // - messages they sent

  const q1 = query(
    collection(db, COLLECTION),
    where("clientUid", "==", profile.uid)
  );

  const q2 = query(
    collection(db, COLLECTION),
    where("senderUid", "==", profile.uid)
  );

  const [snap1, snap2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  const map = new Map();

  snap1.docs.forEach((d) => {
    map.set(d.id, { id: d.id, ...d.data() });
  });

  snap2.docs.forEach((d) => {
    map.set(d.id, { id: d.id, ...d.data() });
  });

  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
}

/* =====================================================
   LIST BY CLIENT (LEGACY SUPPORT)
===================================================== */

export async function listMessagesByClient(clientUid) {
  if (!clientUid) return [];

  const q = query(
    collection(db, COLLECTION),
    where("clientUid", "==", clientUid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/* =====================================================
   LIST RECENT (DASHBOARD)
===================================================== */

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

/* =====================================================
   UPDATE STATUS
===================================================== */

export async function updateMessageStatus(id, status) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    status,
    read: true,
  });
}

/* =====================================================
   MARK READ
===================================================== */

export async function markMessageRead(id) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { read: true });
}

/* =====================================================
   MARK CONVERTED 
===================================================== */

export async function markMessageConverted(id, projectId) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    convertedToProject: true,
    projectId,
  });
}

/* =====================================================
   DELETE
===================================================== */

export async function deleteMessage(id) {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}

/* =====================================================
   PORTAL REPLY
===================================================== */

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