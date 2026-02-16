import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const storage = getStorage();

/* ===============================
   Upload file
================================ */
export async function uploadProjectFile(projectId, file, user) {
  if (!projectId || !file) throw new Error("Missing project or file");

  const storageRef = ref(
    storage,
    `projectFiles/${projectId}/${Date.now()}-${file.name}`
  );

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, "projectFiles"), {
    projectId,
    name: file.name,
    size: file.size,
    contentType: file.type,
    path: storageRef.fullPath,
    url: downloadURL,
    uploadedBy: user?.uid || null,
    uploadedAt: serverTimestamp(),
  });

  return docRef.id;
}

/* ===============================
   Subscribe to project files
================================ */
export function subscribeToProjectFiles(projectId, callback) {
  if (!projectId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "projectFiles"),
    where("projectId", "==", projectId),
    orderBy("uploadedAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/* ===============================
   Delete file
================================ */
export async function deleteProjectFile(fileDoc) {
  if (!fileDoc?.id || !fileDoc?.path) return;

  const storageRef = ref(storage, fileDoc.path);

  await deleteObject(storageRef);
  await deleteDoc(doc(db, "projectFiles", fileDoc.id));
}