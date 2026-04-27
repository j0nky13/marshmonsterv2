// import User from "../models/User.js";

// export async function authMiddleware(req, res, next) {
//   try {
//     const devEmail = req.headers["x-dev-email"];

//     if (!devEmail) {
//       return res.status(401).json({
//         message: "Not authenticated"
//       });
//     }

//     let user = await User.findOne({ email: devEmail.toLowerCase() });

//     if (!user) {
//       user = await User.create({
//         email: devEmail.toLowerCase(),
//         name: "New User",
//         role: "blocked",
//         status: "pending"
//       });
//     }

//     user.lastLoginAt = new Date();
//     await user.save();

//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(500).json({
//       message: "Auth failed",
//       error: error.message
//     });
//   }
// }


import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    // TEMP fallback for local dev
    const devEmail = req.headers["x-dev-email"];

    let decoded = null;

    if (token) {
      decoded = await admin.auth().verifyIdToken(token);
    }

    if (!decoded && !devEmail) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const email = decoded?.email || devEmail?.toLowerCase();
    const firebaseUid = decoded?.uid;

    let user = await User.findOne({
      $or: [
        firebaseUid ? { firebaseUid } : null,
        email ? { email } : null
      ].filter(Boolean)
    });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        name: decoded?.name || "",
        role: "blocked",
        status: "pending"
      });
    }

    if (firebaseUid && !user.firebaseUid) {
      user.firebaseUid = firebaseUid;
    }

    user.lastLoginAt = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Auth failed",
      error: error.message
    });
  }
}