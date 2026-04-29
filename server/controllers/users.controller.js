// import User from "../models/User.js";

// export async function getUsers(req, res) {
//   try {
//     const users = await User.find({})
//       .select("name email phone role status lastLoginAt createdAt")
//       .sort({ createdAt: -1 });

//     res.json({ users });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to load users",
//       error: error.message
//     });
//   }
// }

// export async function updateUser(req, res) {
//   try {
//     const { id } = req.params;
//     const { name, role, status } = req.body;

//     const updates = {};

//     if (name !== undefined) updates.name = name;

//     if (role !== undefined) {
//       if (!["admin", "staff", "customer", "blocked"].includes(role)) {
//         return res.status(400).json({ message: "Invalid role." });
//       }

//       updates.role = role;
//     }

//     if (status !== undefined) {
//       if (!["active", "pending", "blocked"].includes(status)) {
//         return res.status(400).json({ message: "Invalid status." });
//       }

//       updates.status = status;
//     }

//     const user = await User.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true
//     }).select("name email phone role status lastLoginAt createdAt");

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     res.json({ user });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to update user",
//       error: error.message
//     });
//   }
// }


import User from "../models/User.js";

export async function getUsers(req, res) {
  try {
    const users = await User.find({})
      .select("name email phone role status lastLoginAt createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load users",
      error: error.message
    });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, role, status } = req.body;

    const updates = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (role !== undefined) {
      if (!["admin", "staff", "customer", "blocked"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role."
        });
      }

      updates.role = role;
    }

    if (status !== undefined) {
      if (!["active", "pending", "blocked"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status."
        });
      }

      updates.status = status;
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select("name email phone role status lastLoginAt createdAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
      error: error.message
    });
  }
}

export async function inviteUser(req, res) {
  try {
    const {
      email,
      name = "",
      role = "customer",
      status = "active"
    } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required."
      });
    }

    if (!["admin", "staff", "customer", "blocked"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role."
      });
    }

    if (!["active", "pending", "blocked"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name,
        role,
        status
      });
    } else {
      user.name = name || user.name;
      user.role = role;
      user.status = status;

      await user.save();
    }

    res.status(201).json({
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to invite user",
      error: error.message
    });
  }
}