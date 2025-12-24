import { db } from "../../../lib/firebase";
import {
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Write an audit event (simple + useful)
 */
export async function logAudit({ actorUid, actorEmail, action, meta }) {
  await addDoc(collection(db, "audit_events"), {
    actorUid: actorUid || "",
    actorEmail: actorEmail || "",
    action,
    meta: meta || {},
    createdAt: serverTimestamp(),
  });
}

/**
 * Read audit events
 */
export async function listAuditEvents({ limitCount = 30 } = {}) {
  const q = query(
    collection(db, "audit_events"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}