import { useEffect, useMemo, useState } from "react";
import {
  MailPlus,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserRound,
  UserX
} from "lucide-react";
import {
  auth,
  sendSignInLinkToEmail
} from "../firebase/firebase";
import { apiFetch } from "../api/api";

const roles = ["admin", "staff", "customer", "blocked"];
const statuses = ["active", "pending", "blocked"];
const filters = ["all", "staff", "customers", "pending", "blocked"];

export default function StaffTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteOpen, setInviteOpen] = useState(true);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "customer",
    status: "active",
    sendEmail: true
  });
  const [inviteSaving, setInviteSaving] = useState(false);

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

  async function sendInviteEmail(email) {
    const actionCodeSettings = {
      url: `${window.location.origin}/portal`,
      handleCodeInApp: true
    };

    await sendSignInLinkToEmail(auth, email.toLowerCase().trim(), actionCodeSettings);
  }

  async function inviteUser(e) {
    e.preventDefault();
    setInviteSaving(true);

    try {
      if (!inviteForm.email.trim()) {
        throw new Error("Email is required.");
      }

      const data = await apiFetch("/users/invite", {
        method: "POST",
        body: JSON.stringify({
          name: inviteForm.name,
          email: inviteForm.email,
          role: inviteForm.role,
          status: inviteForm.status
        })
      });

      setUsers((prev) => {
        const exists = prev.some((user) => user._id === data.user._id);

        if (exists) {
          return prev.map((user) =>
            user._id === data.user._id ? data.user : user
          );
        }

        return [data.user, ...prev];
      });

      if (inviteForm.sendEmail) {
        await sendInviteEmail(inviteForm.email);
      }

      setInviteForm({
        name: "",
        email: "",
        role: "customer",
        status: "active",
        sendEmail: true
      });

      alert(
        inviteForm.sendEmail
          ? "User created and login link sent."
          : "User created."
      );
    } catch (error) {
      alert(error.message || "Failed to invite user.");
    } finally {
      setInviteSaving(false);
    }
  }

  const counts = useMemo(() => {
    return {
      staff: users.filter(
        (user) => user.role === "staff" && user.status === "active"
      ).length,
      customers: users.filter(
        (user) => user.role === "customer" && user.status === "active"
      ).length,
      pending: users.filter((user) => user.status === "pending").length,
      blocked: users.filter((user) => user.status === "blocked").length
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (activeFilter === "staff") {
      result = result.filter((user) => user.role === "staff");
    }

    if (activeFilter === "customers") {
      result = result.filter((user) => user.role === "customer");
    }

    if (activeFilter === "pending") {
      result = result.filter((user) => user.status === "pending");
    }

    if (activeFilter === "blocked") {
      result = result.filter((user) => user.status === "blocked");
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      result = result.filter((user) =>
        [user.name, user.email, user.phone, user.role, user.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    return result;
  }, [users, activeFilter, searchTerm]);

  if (loading) {
    return <div className="text-zinc-400">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Admin Controls
        </p>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black">Users</h1>

            <p className="text-zinc-400 mt-4 max-w-3xl">
              Create accounts, send secure login links, approve users, assign
              dashboard roles, and manage customer access.
            </p>
          </div>

          <button
            onClick={() => setInviteOpen((prev) => !prev)}
            className="rounded-2xl bg-lime-400 text-black px-5 py-3 font-black hover:bg-lime-300 flex items-center justify-center gap-2"
          >
            <MailPlus size={18} />
            {inviteOpen ? "Hide Invite" : "Invite User"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStat icon={ShieldCheck} label="Active Staff" value={counts.staff} />
        <MiniStat icon={UserRound} label="Customers" value={counts.customers} />
        <MiniStat icon={UserCog} label="Pending" value={counts.pending} />
        <MiniStat icon={UserX} label="Blocked" value={counts.blocked} />
      </div>

      {inviteOpen && (
        <form
          onSubmit={inviteUser}
          className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-5"
        >
          <div>
            <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
              Invite / Create User
            </p>
            <h2 className="text-2xl font-black mt-2">Add Portal Access</h2>
            <p className="text-zinc-500 mt-1 text-sm">
              This creates or updates the Mongo user record. If enabled, it also
              sends a Firebase email login link without Mailgun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Input
              label="Name"
              value={inviteForm.name}
              onChange={(value) =>
                setInviteForm((prev) => ({ ...prev, name: value }))
              }
              placeholder="Jane Customer"
            />

            <Input
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={(value) =>
                setInviteForm((prev) => ({ ...prev, email: value }))
              }
              placeholder="client@example.com"
            />

            <Select
              label="Role"
              value={inviteForm.role}
              onChange={(value) =>
                setInviteForm((prev) => ({ ...prev, role: value }))
              }
              options={roles.filter((role) => role !== "blocked")}
            />

            <Select
              label="Status"
              value={inviteForm.status}
              onChange={(value) =>
                setInviteForm((prev) => ({ ...prev, status: value }))
              }
              options={statuses.filter((status) => status !== "blocked")}
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-black border border-zinc-800 px-4 py-3">
            <input
              type="checkbox"
              checked={inviteForm.sendEmail}
              onChange={(e) =>
                setInviteForm((prev) => ({
                  ...prev,
                  sendEmail: e.target.checked
                }))
              }
            />
            <span className="text-zinc-300">
              Send secure Firebase login link now
            </span>
          </label>

          <button
            disabled={inviteSaving}
            className="rounded-2xl bg-lime-400 text-black px-6 py-3 font-black hover:bg-lime-300 disabled:opacity-50"
          >
            {inviteSaving ? "Creating..." : "Create / Invite User"}
          </button>
        </form>
      )}

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="font-black">User Directory</p>
              <p className="text-sm text-zinc-500 mt-1">
                Staff, customers, pending requests, and blocked accounts.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-black border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-white outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
                  activeFilter === filter
                    ? "bg-lime-400 text-black"
                    : "bg-black border border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                {filter === "all" ? "All Users" : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
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
              {filteredUsers.length === 0 ? (
                <tr className="border-t border-zinc-800">
                  <td className="p-4 text-zinc-500" colSpan="6">
                    No users match this view.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    savingId={savingId}
                    setUsers={setUsers}
                    updateUser={updateUser}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, savingId, setUsers, updateUser }) {
  return (
    <tr className="border-t border-zinc-800 hover:bg-zinc-900/50">
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
          onBlur={(e) => updateUser(user._id, { name: e.target.value })}
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
          onChange={(e) => updateUser(user._id, { role: e.target.value })}
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
          onChange={(e) => updateUser(user._id, { status: e.target.value })}
          className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400 capitalize"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </td>

      <td className="p-4 text-zinc-300">{formatDateTime(user.lastLoginAt)}</td>

      <td className="p-4 text-zinc-300">{formatDateTime(user.createdAt)}</td>

      <td className="p-4">
        <div className="flex flex-wrap gap-2">
          <ActionButton
            disabled={savingId === user._id}
            onClick={() =>
              updateUser(user._id, {
                role: "staff",
                status: "active"
              })
            }
            className="bg-lime-400 text-black hover:bg-lime-300"
          >
            Staff
          </ActionButton>

          <ActionButton
            disabled={savingId === user._id}
            onClick={() =>
              updateUser(user._id, {
                role: "customer",
                status: "active"
              })
            }
            className="bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800"
          >
            Customer
          </ActionButton>

          <ActionButton
            disabled={savingId === user._id}
            onClick={() =>
              updateUser(user._id, {
                role: "blocked",
                status: "blocked"
              })
            }
            className="bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
          >
            Block
          </ActionButton>
        </div>
      </td>
    </tr>
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

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm text-zinc-400 mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-sm text-zinc-400 mb-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400 capitalize"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`rounded-xl font-bold px-3 py-2 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
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