import { useEffect, useState } from "react";
import { ShieldCheck, UserCog, UserX } from "lucide-react";
import { apiFetch } from "../api/api";

const roles = ["admin", "staff", "customer", "blocked"];
const statuses = ["active", "pending", "blocked"];

export default function StaffTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await apiFetch("/users");
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      alert(error.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateUser(userId, updates) {
    setSavingId(userId);

    try {
      const data = await apiFetch(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });

      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? data.user : user))
      );
    } catch (error) {
      alert(error.message || "Failed to update user.");
    } finally {
      setSavingId("");
    }
  }

  if (loading) {
    return <div className="text-zinc-400">Loading staff...</div>;
  }

  const activeStaff = users.filter(
    (user) => user.role === "staff" && user.status === "active"
  ).length;

  const pendingUsers = users.filter((user) => user.status === "pending").length;
  const blockedUsers = users.filter((user) => user.status === "blocked").length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Admin Controls
        </p>

        <h1 className="text-3xl sm:text-5xl font-black mt-2">
          Staff & Users
        </h1>

        <p className="text-zinc-400 mt-4 max-w-3xl">
          Approve users, assign dashboard roles, and block unauthorized access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniStat
          icon={ShieldCheck}
          label="Active Staff"
          value={activeStaff}
        />

        <MiniStat
          icon={UserCog}
          label="Pending Users"
          value={pendingUsers}
        />

        <MiniStat
          icon={UserX}
          label="Blocked Users"
          value={blockedUsers}
        />
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <p className="font-black">User Access</p>
          <p className="text-sm text-zinc-500 mt-1">
            New users are created as blocked/pending until approved.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Last Login</th>
                <th className="text-left p-4">Created</th>
                <th className="text-left p-4">Quick Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr className="border-t border-zinc-800">
                  <td className="p-4 text-zinc-500" colSpan="6">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <td className="p-4">
                      <input
                        value={user.name || ""}
                        onChange={(e) =>
                          setUsers((prev) =>
                            prev.map((item) =>
                              item._id === user._id
                                ? { ...item, name: e.target.value }
                                : item
                            )
                          )
                        }
                        onBlur={(e) =>
                          updateUser(user._id, { name: e.target.value })
                        }
                        placeholder="Name"
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400"
                      />

                      <p className="text-zinc-500 text-xs mt-2">
                        {user.email || user.phone || "No contact"}
                      </p>
                    </td>

                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateUser(user._id, { role: e.target.value })
                        }
                        className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400 capitalize"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <select
                        value={user.status}
                        onChange={(e) =>
                          updateUser(user._id, { status: e.target.value })
                        }
                        className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400 capitalize"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4 text-zinc-300">
                      {formatDateTime(user.lastLoginAt)}
                    </td>

                    <td className="p-4 text-zinc-300">
                      {formatDateTime(user.createdAt)}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={savingId === user._id}
                          onClick={() =>
                            updateUser(user._id, {
                              role: "staff",
                              status: "active"
                            })
                          }
                          className="rounded-xl bg-lime-400 text-black font-bold px-3 py-2 hover:bg-lime-300 disabled:opacity-50"
                        >
                          Make Staff
                        </button>

                        <button
                          disabled={savingId === user._id}
                          onClick={() =>
                            updateUser(user._id, {
                              role: "customer",
                              status: "active"
                            })
                          }
                          className="rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold px-3 py-2 hover:bg-zinc-800 disabled:opacity-50"
                        >
                          Make Customer
                        </button>

                        <button
                          disabled={savingId === user._id}
                          onClick={() =>
                            updateUser(user._id, {
                              role: "blocked",
                              status: "blocked"
                            })
                          }
                          className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold px-3 py-2 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          Block
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <div className="bg-lime-400 text-black rounded-2xl p-3">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-zinc-500 text-sm">{label}</p>
          <p className="text-3xl font-black">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}