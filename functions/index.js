const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/* ============================
  Helpers
============================ */
function requireAuth(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Not signed in.");
  }
  return context.auth;
}

async function getUserProfile(uid) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  return { ref, snap, data: snap.exists ? snap.data() : null };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Admin check that works EVEN if claims are broken
async function requireAdmin(context) {
  const auth = requireAuth(context);

  const claimRole = auth.token?.role;
  if (claimRole === "admin") return auth;

  const { data } = await getUserProfile(auth.uid);
  if (data?.role === "admin" && data?.active === true) return auth;

  throw new functions.https.HttpsError("permission-denied", "Admin only.");
}

/* ============================
    NEW: Sync/Repair Claims
  - Reads users/{uid}
  - Requires users/{uid}.active === true
  - Sets custom claims role based on server truth
============================ */
exports.syncClaims = functions.https.onCall(async (data, context) => {
  const auth = requireAuth(context);

  const { data: user } = await getUserProfile(auth.uid);

  if (!user) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "No user profile exists for this account."
    );
  }

  if (user.active !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Account inactive."
    );
  }

  const role = String(user.role || "user").trim();
  if (!["admin", "staff", "user"].includes(role)) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Invalid role on server."
    );
  }

  await admin.auth().setCustomUserClaims(auth.uid, { role });

  // Touch updatedAt so you can see it changed
  await db.collection("users").doc(auth.uid).set(
    {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      email: normalizeEmail(user.email || auth.token?.email || ""),
      role,
      active: true,
    },
    { merge: true }
  );

  return { ok: true, role };
});

/* ============================
  (Optional) Admin changes role
============================ */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  const uid = String(data?.uid || "").trim();
  const role = String(data?.role || "").trim();

  if (!uid) throw new functions.https.HttpsError("invalid-argument", "uid required.");
  if (!["admin", "staff", "user"].includes(role)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid role.");
  }

  await admin.auth().setCustomUserClaims(uid, { role });

  await db.collection("users").doc(uid).set(
    {
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true };
});

/* ============================
  Admin creates an invite (kept)
============================ */
exports.createInvite = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  const email = normalizeEmail(data?.email);
  const role = String(data?.role || "user").trim();

  if (!email) throw new functions.https.HttpsError("invalid-argument", "Email required.");
  if (!["admin", "staff", "user"].includes(role)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid role.");
  }

  const inviteRef = db.collection("invites").doc(email);
  await inviteRef.set(
    {
      email,
      role,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true };
});

/* ============================
  Accept invite (kept)
  - For NEW USERS ONLY
  - NOT required at login anymore
============================ */
exports.acceptInvite = functions.https.onCall(async (data, context) => {
  const auth = requireAuth(context);
  const email = normalizeEmail(auth.token?.email);

  if (!email) {
    throw new functions.https.HttpsError("failed-precondition", "Missing auth email.");
  }

  const userRef = db.collection("users").doc(auth.uid);
  const userSnap = await userRef.get();

  const inviteRef = db.collection("invites").doc(email);
  const invSnap = await inviteRef.get();

  if (!invSnap.exists) {
    // If they already have a profile, just sync claims instead of failing.
    if (userSnap.exists) {
      const u = userSnap.data() || {};
      if (u.active !== true) {
        throw new functions.https.HttpsError("permission-denied", "Account inactive.");
      }
      const role = String(u.role || "user").trim();
      await admin.auth().setCustomUserClaims(auth.uid, { role });
      return { ok: true, role, mode: "existing" };
    }

    throw new functions.https.HttpsError("permission-denied", "No invite found.");
  }

  const inv = invSnap.data() || {};
  if (inv.status !== "pending") {
    throw new functions.https.HttpsError("failed-precondition", "Invite not pending.");
  }

  const role = String(inv.role || "user").trim();
  if (!["admin", "staff", "user"].includes(role)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid role.");
  }

  await admin.auth().setCustomUserClaims(auth.uid, { role });

  await userRef.set(
    {
      email,
      role,
      active: true,
      displayName: inv.name || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await inviteRef.set(
    {
      status: "accepted",
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      acceptedUid: auth.uid,
    },
    { merge: true }
  );

  return { ok: true, role, mode: "invite" };
});

/* ============================
  Admin: list invites (kept)
============================ */
exports.listInvites = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  const snap = await db.collection("invites").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

/* ============================
  Admin: revoke invite (kept)
============================ */
exports.revokeInvite = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  const email = normalizeEmail(data?.email);
  if (!email) throw new functions.https.HttpsError("invalid-argument", "Email required");

  await db.collection("invites").doc(email).set({ status: "revoked" }, { merge: true });
  return { ok: true };
});

/* ============================
  Admin: mark invite resent (kept)
============================ */
exports.markInviteResent = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  const email = normalizeEmail(data?.email);
  if (!email) throw new functions.https.HttpsError("invalid-argument", "Email required");

  await db.collection("invites").doc(email).set(
    { lastSentAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );

  return { ok: true };
});