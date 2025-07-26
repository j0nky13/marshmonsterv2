import { useState, useEffect, useMemo } from 'react';
import { lazy } from 'react';
const tabsContext = import.meta.glob('../components/tabs/*.tab.jsx', { eager: true });
const widgetsContext = import.meta.glob('../components/widgets/*.widget.jsx', { eager: true });

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'guest';

  const tabs = useMemo(() => {
    return Object.keys(tabsContext)
      .sort()
      .map((path) => {
        const name = path
          .split('/')
          .pop()
          .replace('.tab.jsx', '')
          .toLowerCase();
        return {
          key: name,
          label: name.charAt(0).toUpperCase() + name.slice(1),
          Component: tabsContext[path].default,
        };
      });
  }, []);

  const widgets = useMemo(() => {
    return Object.keys(widgetsContext).reduce((acc, path) => {
      const name = path.split('/').pop().replace('.widget.jsx', '');
      acc[name] = widgetsContext[path].default;
      return acc;
    }, {});
  }, []);

  return (
    <div className="flex min-h-screen bg-[#121212] text-white relative">
      {/* Backdrop overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container with spring-style easing */}
      <div className={`fixed top-0 left-0 h-screen w-64 z-30 transform-gpu transition-transform duration-700 ease-out md:static md:flex md:flex-col md:justify-between ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <aside
          className="h-full bg-[#1e1e1e] text-white shadow-lg flex flex-col p-6"
        >
          <div className="mb-10 flex items-center justify-center">
            <h1 className="text-3xl font-extrabold tracking-wide text-lime-400 select-none">Marsh Monster</h1>
          </div>
          <nav className="flex flex-col space-y-3 flex-grow">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSidebarOpen(false);
                }}
                className={`rounded-lg px-4 py-3 text-left font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                  activeTab === tab.key
                    ? 'text-lime-400 bg-[#222] shadow-inner'
                    : 'text-white hover:text-lime-400 hover:bg-[#222]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          {/* Logout */}
          <button
            onClick={() => console.log('logout')}
            className="mt-6 rounded-lg px-4 py-3 text-white hover:text-lime-400 hover:bg-[#222] transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            Logout
          </button>
        </aside>
      </div>

      <button
        className={`md:hidden fixed top-4 left-4 z-40 bg-gray-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 transition-opacity ${
          sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setSidebarOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:p-6 md:pt-6 md:ml-64">
        {tabs.map(
          (tab) =>
            tab.key === activeTab && (
              <div key={tab.key} className="bg-[#1e1e1e] border border-gray-700 p-6 rounded-lg">
                <tab.Component widgets={widgets} user={user} />
              </div>
            )
        )}
      </main>
    </div>
  );
}