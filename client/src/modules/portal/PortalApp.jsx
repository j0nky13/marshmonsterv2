// src/modules/portal/PortalApp.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { onUserChanged } from "./lib/auth";
import { db } from "../../lib/firebase";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Inbox from "./pages/Inbox";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

export default function PortalApp() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootErr, setBootErr] = useState("");

  useEffect(() => {
    const unsub = onUserChanged(async (user) => {
      setBootErr("");
      setAuthUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        // If profile exists, use it
        if (snap.exists()) {
          setProfile({ uid: user.uid, ...snap.data() });
          setLoading(false);
          return;
        }

        // If profile does NOT exist, create it ONCE (no admin hardcode)
        // IMPORTANT: rules allow create only with role staff/user.
        const newProfile = {
          email: user.email || "",
          role: "staff",
          active: true,
          createdAt: serverTimestamp(),
        };

        await setDoc(ref, newProfile, { merge: false });

        // Re-read so we store the real saved doc
        const snap2 = await getDoc(ref);
        if (snap2.exists()) {
          setProfile({ uid: user.uid, ...snap2.data() });
        } else {
          setProfile({ uid: user.uid, ...newProfile, createdAt: null });
        }
      } catch (err) {
        console.error("Portal boot failed", err);
        setBootErr(err?.message || "Portal boot failed");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-slate-400 bg-black">
        Loading portal…
      </div>
    );
  }

  if (!authUser) {
    return <Login />;
  }

  // If we’re signed in but profile still failed, show a real error screen (not a crash)
  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="max-w-lg w-full rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="text-sm font-semibold">Portal Error</div>
          <div className="text-xs text-slate-400 mt-1">
            Signed in as: <span className="text-slate-200">{authUser?.email}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            UID: <span className="text-slate-200">{authUser?.uid}</span>
          </div>

          <div className="mt-3 text-xs text-red-300 bg-red-950/30 border border-red-800 rounded px-3 py-2">
            {bootErr || "No profile loaded."}
          </div>

          <div className="mt-3 text-xs text-slate-400">
            Fix: confirm Firestore rules allow creating/reading <code>users/{authUser?.uid}</code>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar user={profile} />

      <div className="flex flex-col flex-1">
        <Topbar user={profile} />

        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings profile={profile} />} />
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}