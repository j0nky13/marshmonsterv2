import { useState } from "react";
import { logout, sendLoginLink } from "../lib/auth";
import { createInvite } from "../lib/invitesApi";

const GREEN = "#B6F24A";

export default function Settings({ profile }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState("");
  const [err, setErr] = useState("");

  if (!profile) {
    return (
      <div className="text-xs text-slate-400">
        Loading profile…
      </div>
    );
  }

  const isAdmin = profile.role === "admin";

  async function handleInvite(e) {
    e.preventDefault();
    setErr("");
    setSent("");
    setSending(true);

    try {
      const email = inviteEmail.trim().toLowerCase();
      if (!email) throw new Error("Email required");

      await createInvite({ email, role: inviteRole });
      await sendLoginLink(email);

      setSent(`Invite sent to ${email}`);
      setInviteEmail("");
      setInviteRole("staff");
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to send invite");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-slate-400">
            Account and portal controls
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 text-sm rounded border transition"
          style={{
            color: GREEN,
            borderColor: "rgba(182,242,74,0.35)",
            backgroundColor: "rgba(182,242,74,0.12)",
          }}
        >
          Logout
        </button>
      </div>

      {/* PROFILE CARD */}
      <div
        className="rounded-xl p-4 border bg-black/40"
        style={{ borderColor: "rgba(182,242,74,0.15)" }}
      >
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Account
        </div>

        <div className="text-sm text-slate-200">{profile.email}</div>

        <div className="text-xs text-slate-400 mt-1">
          Role:{" "}
          <span
            className="font-medium"
            style={{ color: GREEN }}
          >
            {profile.role}
          </span>
        </div>
      </div>

      {/* INVITE USERS */}
      <div
        className="rounded-xl p-4 border bg-black/40"
        style={{ borderColor: "rgba(182,242,74,0.15)" }}
      >
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">
          Invite Users
        </div>

        {!isAdmin ? (
          <div className="text-sm text-slate-400">
            You must be an admin to invite users.
          </div>
        ) : (
          <form
            onSubmit={handleInvite}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@company.com"
              className="rounded-lg bg-black border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1"
              style={{ outlineColor: GREEN }}
            />

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-lg bg-black border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1"
              style={{ outlineColor: GREEN }}
            >
              <option value="staff">staff</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>

            <button
              disabled={sending}
              className="rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60"
              style={{
                backgroundColor: GREEN,
                color: "#0c1118",
              }}
            >
              {sending ? "Sending…" : "Send Invite"}
            </button>
          </form>
        )}

        {sent && (
          <div
            className="text-xs mt-3"
            style={{ color: GREEN }}
          >
            {sent}
          </div>
        )}

        {err && (
          <div className="text-xs text-red-400 mt-3">
            {err}
          </div>
        )}
      </div>
    </div>
  );
}