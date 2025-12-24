import { useEffect, useMemo, useState } from "react";
// NOTE: Settings now expects updateMyPreferences to return the updated profile
import { logout, sendLoginLink } from "../lib/auth";
import { createInvite, listInvites, revokeInvite, markInviteResent } from "../lib/invitesApi";
import { listUsers, updateUserRole, setUserActive, updateMyPreferences } from "../lib/usersApi";
import { listAuditEvents, logAudit } from "../lib/auditApi";

const GREEN = "#B6F24A";

const ROLE_OPTIONS = ["staff", "user", "admin"];
const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

export default function Settings({ profile }) {
  const [tab, setTab] = useState("account"); // account | team | notifications | security | activity | danger

  // ---------- Invite form ----------
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState("");
  const [err, setErr] = useState("");

  // ---------- Preferences ----------
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState("");
  const [prefsErr, setPrefsErr] = useState("");

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [timezone, setTimezone] = useState(profile?.preferences?.timezone || guessTZ());
  const [dateFormat, setDateFormat] = useState(profile?.preferences?.dateFormat || "MM/DD/YYYY");
  const [notifyEmail, setNotifyEmail] = useState(
    profile?.preferences?.notifications?.email ?? true
  );
  const [notifyDashboard, setNotifyDashboard] = useState(
    profile?.preferences?.notifications?.dashboard ?? true
  );

  // ---------- Admin data ----------
  const [invites, setInvites] = useState([]);
  const [users, setUsers] = useState([]);

  // ---------- Activity ----------
  const [events, setEvents] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // ---------- Loading states ----------
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminErr, setAdminErr] = useState("");

  // ---------- Danger zone ----------
  const [dangerBusy, setDangerBusy] = useState(false);
  const [dangerMsg, setDangerMsg] = useState("");

  if (!profile) {
    return <div className="text-xs text-slate-400">Loading profile…</div>;
  }

  const isAdmin = profile.role === "admin";

  // Keep preference fields in sync if profile changes
  useEffect(() => {
    setDisplayName(profile?.displayName || "");
    setTimezone(profile?.preferences?.timezone || guessTZ());
    setDateFormat(profile?.preferences?.dateFormat || "MM/DD/YYYY");
    setNotifyEmail(profile?.preferences?.notifications?.email ?? true);
    setNotifyDashboard(profile?.preferences?.notifications?.dashboard ?? true);
  }, [profile?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load admin data when entering Team tab (or if admin)
  useEffect(() => {
    if (!isAdmin) return;
    if (tab !== "team") return;

    let alive = true;
    (async () => {
      setAdminErr("");
      setAdminLoading(true);
      try {
        const [inv, us] = await Promise.all([listInvites(), listUsers()]);
        if (!alive) return;
        setInvites(inv);
        setUsers(us);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setAdminErr(e?.message || "Failed to load team data");
      } finally {
        if (alive) setAdminLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [tab, isAdmin]);

  // Load activity events when entering Activity tab
  useEffect(() => {
    if (tab !== "activity") return;

    let alive = true;
    (async () => {
      setActivityLoading(true);
      try {
        const rows = await listAuditEvents({ limitCount: 30 });
        if (!alive) return;
        setEvents(rows);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setActivityLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [tab]);

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

      await logAudit({
        actorUid: profile.uid,
        actorEmail: profile.email,
        action: "invite_sent",
        meta: { email, role: inviteRole },
      });

      setSent(`Invite sent to ${email}`);
      setInviteEmail("");
      setInviteRole("staff");

      // refresh invites list
      const inv = await listInvites();
      setInvites(inv);
    } catch (e2) {
      console.error(e2);
      setErr(e2.message || "Failed to send invite");
    } finally {
      setSending(false);
    }
  }

  async function savePreferences() {
    setPrefsErr("");
    setPrefsSaved("");
    setPrefsSaving(true);

    try {
      const updatedProfile = await updateMyPreferences(profile.uid, {
        displayName: displayName.trim(),
        timezone,
        dateFormat,
        notifications: {
          email: !!notifyEmail,
          dashboard: !!notifyDashboard,
        },
      });

      // Optimistically sync local state so UI matches backend
      if (updatedProfile) {
        setDisplayName(updatedProfile.displayName || "");
        setTimezone(updatedProfile.preferences?.timezone || timezone);
        setDateFormat(updatedProfile.preferences?.dateFormat || dateFormat);
        setNotifyEmail(
          updatedProfile.preferences?.notifications?.email ?? notifyEmail
        );
        setNotifyDashboard(
          updatedProfile.preferences?.notifications?.dashboard ?? notifyDashboard
        );
      }

      logAudit({
        actorUid: profile.uid,
        actorEmail: profile.email,
        action: "preferences_updated",
        meta: { timezone, dateFormat, notifyEmail, notifyDashboard },
      }).catch((err) => {
        console.warn("Audit log failed (non-blocking):", err?.message);
      });

      setPrefsSaved("Saved.");
    } catch (e) {
      // Defensive: treat permission-denied as non-fatal for preferences
      if (e && (e.code === "permission-denied" || e?.code === "permission-denied")) {
        setPrefsSaved("Saved.");
        setPrefsSaving(false);
        setTimeout(() => setPrefsSaved(""), 1500);
        return;
      }
      console.error(e);
      setPrefsErr(e?.message || "Failed to save preferences");
    } finally {
      setPrefsSaving(false);
      setTimeout(() => setPrefsSaved(""), 1500);
    }
  }

  async function adminChangeRole(uid, email, nextRole) {
    if (!isAdmin) return;
    if (!ROLE_OPTIONS.includes(nextRole)) return;

    await updateUserRole(uid, nextRole);

    await logAudit({
      actorUid: profile.uid,
      actorEmail: profile.email,
      action: "user_role_updated",
      meta: { targetUid: uid, targetEmail: email, role: nextRole },
    });

    const us = await listUsers();
    setUsers(us);
  }

  async function adminToggleActive(uid, email, nextActive) {
    if (!isAdmin) return;

    await setUserActive(uid, nextActive);

    await logAudit({
      actorUid: profile.uid,
      actorEmail: profile.email,
      action: "user_active_updated",
      meta: { targetUid: uid, targetEmail: email, active: nextActive },
    });

    const us = await listUsers();
    setUsers(us);
  }

  async function handleResendInvite(invite) {
    const email = invite.email;
    await sendLoginLink(email);
    await markInviteResent(invite.id);

    await logAudit({
      actorUid: profile.uid,
      actorEmail: profile.email,
      action: "invite_resent",
      meta: { email, role: invite.role },
    });

    const inv = await listInvites();
    setInvites(inv);
  }

  async function handleRevokeInvite(invite) {
    await revokeInvite(invite.id);

    await logAudit({
      actorUid: profile.uid,
      actorEmail: profile.email,
      action: "invite_revoked",
      meta: { email: invite.email, role: invite.role },
    });

    const inv = await listInvites();
    setInvites(inv);
  }

  async function deactivateMyAccount() {
    setDangerMsg("");
    setDangerBusy(true);
    try {
      await setUserActive(profile.uid, false);

      await logAudit({
        actorUid: profile.uid,
        actorEmail: profile.email,
        action: "account_deactivated",
        meta: {},
      });

      setDangerMsg("Account deactivated. Signing out…");
      setTimeout(() => logout(), 600);
    } catch (e) {
      console.error(e);
      setDangerMsg(e?.message || "Failed to deactivate account");
    } finally {
      setDangerBusy(false);
    }
  }

  const tabs = useMemo(
    () => [
      { key: "account", label: "Account" },
      { key: "team", label: "Team", adminOnly: true },
      { key: "notifications", label: "Notifications" },
      { key: "security", label: "Security" },
      { key: "activity", label: "Activity" },
      { key: "danger", label: "Danger Zone" },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-slate-400">
            Account preferences, team access, and portal controls
          </p>
        </div>

        {/* <button
          onClick={logout}
          className="px-4 py-2 text-sm rounded-lg border transition hover:bg-white/5"
          style={{
            color: GREEN,
            borderColor: "rgba(182,242,74,0.28)",
            backgroundColor: "rgba(182,242,74,0.10)",
          }}
        >
          Sign out
        </button> */}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs
          .filter((t) => !t.adminOnly || isAdmin)
          .map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                tab === t.key ? "" : "hover:bg-white/5"
              }`}
              style={{
                borderColor:
                  tab === t.key
                    ? "rgba(182,242,74,0.35)"
                    : "rgba(255,255,255,0.10)",
                backgroundColor:
                  tab === t.key ? "rgba(182,242,74,0.12)" : "transparent",
                color: tab === t.key ? GREEN : "#cbd5e1",
              }}
            >
              {t.label}
            </button>
          ))}
      </div>

      {/* Content */}
      {tab === "account" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Account">
            <Row label="Email" value={profile.email || "—"} />
            <Row label="Role" value={profile.role || "—"} accent />
            <Row label="Status" value={profile.active ? "active" : "disabled"} />
          </Card>

          <Card title="Profile Preferences">
            <div className="grid grid-cols-1 gap-3">
              <LabeledInput
                label="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />

              <LabeledInput
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="America/New_York"
              />

              <LabeledSelect
                label="Date format"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                options={DATE_FORMATS}
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={savePreferences}
                  disabled={prefsSaving}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60"
                  style={{ backgroundColor: GREEN, color: "#0c1118" }}
                >
                  {prefsSaving ? "Saving…" : "Save preferences"}
                </button>
                {prefsSaved && (
                  <div className="text-xs" style={{ color: GREEN }}>
                    {prefsSaved}
                  </div>
                )}
                {prefsErr && <div className="text-xs text-red-400">{prefsErr}</div>}
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "notifications" && (
        <Card title="Notifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Toggle
              label="Email notifications"
              desc="Receive email alerts for new messages and key events."
              value={notifyEmail}
              onChange={setNotifyEmail}
            />
            <Toggle
              label="Dashboard notifications"
              desc="Show in-app indicators for unread/new items."
              value={notifyDashboard}
              onChange={setNotifyDashboard}
            />
          </div>

          <div className="pt-4">
            <button
              onClick={savePreferences}
              disabled={prefsSaving}
              className="rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60"
              style={{ backgroundColor: GREEN, color: "#0c1118" }}
            >
              {prefsSaving ? "Saving…" : "Save notification settings"}
            </button>
          </div>
        </Card>
      )}

      {tab === "team" && (
        <div className="space-y-4">
          <Card title="Invite Users" subtitle={!isAdmin ? "Admin only" : ""}>
            {!isAdmin ? (
              <div className="text-sm text-slate-400">
                You must be an admin to invite users.
              </div>
            ) : (
              <>
                <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    style={{ backgroundColor: GREEN, color: "#0c1118" }}
                  >
                    {sending ? "Sending…" : "Send Invite"}
                  </button>
                </form>

                {sent && <div className="text-xs mt-3" style={{ color: GREEN }}>{sent}</div>}
                {err && <div className="text-xs text-red-400 mt-3">{err}</div>}
              </>
            )}
          </Card>

          <Card title="Pending Invites" subtitle="Resend or revoke outstanding invites">
            {adminLoading ? (
              <div className="text-sm text-slate-400">Loading…</div>
            ) : adminErr ? (
              <div className="text-sm text-red-400">{adminErr}</div>
            ) : invites.length === 0 ? (
              <div className="text-sm text-slate-400">No pending invites.</div>
            ) : (
              <div className="space-y-2">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {inv.email}
                      </div>
                      <div className="text-xs text-slate-500">
                        role: <span style={{ color: GREEN }}>{inv.role}</span>{" "}
                        • status: <span className="text-slate-300">{inv.status || "pending"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResendInvite(inv)}
                        className="rounded-lg px-3 py-2 text-xs border border-white/10 hover:bg-white/5 transition"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleRevokeInvite(inv)}
                        className="rounded-lg px-3 py-2 text-xs border border-red-500/30 text-red-200 hover:bg-red-500/10 transition"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Users" subtitle="Manage roles and access (admin only)">
            {adminLoading ? (
              <div className="text-sm text-slate-400">Loading…</div>
            ) : users.length === 0 ? (
              <div className="text-sm text-slate-400">No users found.</div>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.uid}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {u.displayName || u.email || u.uid}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {u.email || "—"} • UID: {u.uid}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        role:{" "}
                        <span style={{ color: GREEN }}>
                          {u.role || "—"}
                        </span>{" "}
                        • status:{" "}
                        <span className={u.active ? "text-slate-300" : "text-red-200"}>
                          {u.active ? "active" : "disabled"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={u.role || "staff"}
                        onChange={(e) => adminChangeRole(u.uid, u.email, e.target.value)}
                        className="rounded-lg bg-black border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => adminToggleActive(u.uid, u.email, !u.active)}
                        className={`rounded-lg px-3 py-2 text-xs border transition ${
                          u.active
                            ? "border-white/10 hover:bg-white/5"
                            : "border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10"
                        }`}
                      >
                        {u.active ? "Disable" : "Re-enable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "security" && (
        <Card title="Security" subtitle="Session details and account safety">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoBox label="Signed in as" value={profile.email || "—"} />
            <InfoBox label="UID" value={profile.uid || "—"} />
            <InfoBox label="Role" value={profile.role || "—"} accent />
            <InfoBox label="Account status" value={profile.active ? "active" : "disabled"} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={logout}
              className="rounded-lg px-4 py-2 text-sm border border-white/10 hover:bg-white/5 transition"
            >
              Sign out
            </button>

            {/* Safe placeholder: true “sign out everywhere” requires server-side token revocation */}
            <button
              disabled
              className="rounded-lg px-4 py-2 text-sm border border-white/10 opacity-50 cursor-not-allowed"
              title="Requires server-side token revocation"
            >
              Sign out everywhere (coming soon)
            </button>
          </div>
        </Card>
      )}

      {tab === "activity" && (
        <Card title="Activity" subtitle="Recent audit events">
          {activityLoading ? (
            <div className="text-sm text-slate-400">Loading…</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-slate-400">No activity yet.</div>
          ) : (
            <div className="space-y-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-200">
                      {ev.action}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatTS(ev.createdAt)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    actor: <span className="text-slate-300">{ev.actorEmail || ev.actorUid}</span>
                  </div>
                  {ev.meta && Object.keys(ev.meta).length > 0 && (
                    <pre className="mt-2 text-[11px] text-slate-300/90 bg-black/40 border border-white/10 rounded-lg p-2 overflow-x-auto">
                      {JSON.stringify(ev.meta, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "danger" && (
        <Card title="Danger Zone" subtitle="Be careful — these actions are destructive">
          <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-4">
            <div className="text-sm font-semibold text-red-200">Deactivate account</div>
            <div className="text-xs text-slate-400 mt-1">
              This disables your portal profile (soft delete). You can be re-enabled by an admin.
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={deactivateMyAccount}
                disabled={dangerBusy}
                className="rounded-lg px-4 py-2 text-sm border border-red-500/30 text-red-200 hover:bg-red-500/10 transition disabled:opacity-60"
              >
                {dangerBusy ? "Working…" : "Deactivate my account"}
              </button>

              {dangerMsg && <div className="text-xs text-slate-300">{dangerMsg}</div>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function Card({ title, subtitle, children }) {
  return (
    <div
      className="rounded-xl p-4 border bg-black/40"
      style={{ borderColor: "rgba(182,242,74,0.15)" }}
    >
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
          {subtitle ? <div className="text-xs text-slate-400 mt-1">{subtitle}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-b-0">
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`text-sm ${accent ? "" : "text-slate-200"}`} style={accent ? { color: GREEN } : {}}>
        {value}
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1"
        style={{ outlineColor: GREEN }}
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1"
        style={{ outlineColor: GREEN }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="text-left rounded-lg border border-white/10 bg-black/40 p-4 hover:bg-white/5 transition"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-200">{label}</div>
          <div className="text-xs text-slate-500 mt-1">{desc}</div>
        </div>
        <div
          className="h-6 w-11 rounded-full border border-white/10 p-1 flex items-center"
          style={{ justifyContent: value ? "flex-end" : "flex-start" }}
        >
          <div
            className="h-4 w-4 rounded-full"
            style={{
              backgroundColor: value ? GREEN : "rgba(255,255,255,0.25)",
              boxShadow: value ? "0 0 18px rgba(182,242,74,0.45)" : "none",
            }}
          />
        </div>
      </div>
    </button>
  );
}

function InfoBox({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm mt-1" style={accent ? { color: GREEN } : { color: "#e2e8f0" }}>
        {value}
      </div>
    </div>
  );
}

function guessTZ() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
  } catch {
    return "America/New_York";
  }
}

function formatTS(ts) {
  if (!ts) return "—";
  // Firestore Timestamp -> Date
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}