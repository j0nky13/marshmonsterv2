import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { onUserChanged } from "./lib/auth";
import { db } from "../../lib/firebase";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Inbox from "./pages/Inbox";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Pipeline from "./pages/Pipeline";


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

        if (snap.exists()) {
          setProfile({ uid: user.uid, ...snap.data() });
        } else {
          const newProfile = {
            email: user.email || "",
            role: "staff",
            active: true,
            createdAt: serverTimestamp(),
          };

          await setDoc(ref, newProfile);
          setProfile({ uid: user.uid, ...newProfile });
        }
      } catch (err) {
        console.error("Portal boot failed", err);
        setBootErr(err.message || "Portal boot failed");
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

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="max-w-lg w-full rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="text-sm font-semibold">Portal Error</div>
          <div className="text-xs text-red-300 mt-2">
            {bootErr || "Profile failed to load"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard profile={profile} />} />
        <Route path="/projects" element={<Projects profile={profile} />} />
        <Route
          path="/projects/:id"
          element={<ProjectDetail profile={profile} />}
        />
        <Route path="/inbox" element={<Inbox profile={profile} />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail profile={profile} />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/stats" element={<Stats profile={profile} />} />
        <Route path="/settings" element={<Settings profile={profile} />} />
      </Route>

      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}