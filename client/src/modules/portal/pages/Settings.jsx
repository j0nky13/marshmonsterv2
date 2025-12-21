// src/modules/portal/pages/Settings.jsx
import { useState } from "react";
import { logout, sendLoginLink } from "../lib/auth";
import { createInvite } from "../lib/invitesApi";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-xs text-slate-400">
            Account and portal controls
          </p>
        </div>

        <button
          onClick={logout}
          className="text-xs px-3 py-2 rounded border border-slate-700 hover:bg-slate-900"
        >
          Logout
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="text-xs text-slate-400">Signed in as</div>
        <div>{profile.email}</div>
        <div className="text-xs mt-1">
          Role: <span className="font-medium">{profile.role}</span>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="text-xs uppercase text-slate-400 mb-2">
          Invite Users (Admin)
        </div>

        {!isAdmin ? (
          <div className="text-xs text-slate-400">
            You must be an admin to invite users.
          </div>
        ) : (
          <form onSubmit={handleInvite} className="grid md:grid-cols-3 gap-2">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@company.com"
              className="rounded bg-black border border-slate-700 px-2 py-2 text-sm"
            />

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded bg-black border border-slate-700 px-2 py-2 text-sm"
            >
              <option value="staff">staff</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>

            <button
              disabled={sending}
              className="rounded bg-emerald-600 px-3 py-2 text-sm disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Invite"}
            </button>
          </form>
        )}

        {sent && <div className="text-xs text-emerald-400 mt-2">{sent}</div>}
        {err && <div className="text-xs text-red-400 mt-2">{err}</div>}
      </div>
    </div>
  );
}