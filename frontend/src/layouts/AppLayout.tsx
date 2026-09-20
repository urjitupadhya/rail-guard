import React from 'react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import ThreatAlert from '../components/ThreatAlert';
import { useSimStore } from '../store/simulationStore';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  const { showThreatAlert, isSidebarOpen, setSidebarOpen } = useSimStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          />
        )}

        {/* Sidebar Container */}
        <div
          className={`fixed lg:static top-16 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-2.5 sm:p-4 relative w-full">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#22C55E 1px, transparent 1px), linear-gradient(90deg, #22C55E 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      {showThreatAlert && <ThreatAlert />}
    </div>
  );
}
