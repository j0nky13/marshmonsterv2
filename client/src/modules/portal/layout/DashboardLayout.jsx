import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { tabConfig } from "../config/tabConfig";

export default function DashboardLayout({ user }) {
  const tabs = tabConfig[user?.role] || tabConfig.customer || [];

  const [activeTab, setActiveTab] = useState(() => {
    return (
      localStorage.getItem(`crmActiveTab:${user?.role}`) ||
      tabs?.[0]?.id ||
      "overview"
    );
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTabConfig = useMemo(() => {
    return tabs.find((tab) => tab.id === activeTab) || tabs[0];
  }, [activeTab, tabs]);

  if (!tabs.length || !activeTabConfig) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        No dashboard tabs found for this role.
      </div>
    );
  }

  const ActiveComponent = activeTabConfig.component;

  function handleSetActiveTab(tabId) {
    localStorage.setItem(`crmActiveTab:${user?.role}`, tabId);
    setActiveTab(tabId);
  }

  return (
    <div className="h-screen bg-black text-white lg:flex overflow-hidden">
      <Sidebar
        user={user}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <Topbar
          activeLabel={activeTabConfig.label}
          setMobileOpen={setMobileOpen}
        />

        <section className="p-4 sm:p-6 lg:p-8">
          <ActiveComponent user={user} role={user?.role} />
        </section>
      </main>
    </div>
  );
}