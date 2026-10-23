import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { UserAuth } from "../Context/Authcontext";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { isLoading } = UserAuth();

  const handleToggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const handleOpenMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen! w-full! items-center justify-center bg-gray-100! px-4!">
        <div className="text-center">
          <div className="inline-block! h-8! w-8! animate-spin! rounded-full! border-4! border-gray-300! border-t-blue-600!" />
          <p className="mt-4! text-sm! text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative! min-h-screen! w-full! overflow-x-hidden! bg-gray-100!">

      {/* =====================================================
          DESKTOP
      ===================================================== */}

      <div
        className={`
          hidden!
          h-screen!
          w-full!
          overflow-hidden!
          lg:grid!
          lg:transition-[grid-template-columns]!
          lg:duration-300!
          lg:ease-out!
          ${
            collapsed
              ? "lg:grid-cols-[68px_minmax(0,1fr)]!"
              : "lg:grid-cols-[260px_minmax(0,1fr)]!"
          }
        `}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggleSidebar}
        />

        <div className="flex! h-screen! flex-col! min-w-0! w-full! overflow-y-auto! overflow-x-hidden!">
          <Navbar />

          <main className="min-w-0! w-full! flex-1!">
            <Outlet />
          </main>
        </div>
      </div>

      {/* =====================================================
          MOBILE
      ===================================================== */}

      <div className="block! min-h-screen! w-full! lg:hidden!">

        {/* Navbar */}

        <div className="sticky! top-0! z-40! w-full!">
          <Navbar
            onMenuClick={handleOpenMobileSidebar}
          />
        </div>

        {/* Main */}

        <main className="min-h-[calc(100vh-4rem)]! min-w-0! w-full! max-w-full! overflow-x-hidden!">
          <Outlet />
        </main>

        {/* =================================================
            MOBILE SIDEBAR
        ================================================= */}

        <div
          className={`
            fixed!
            inset-0!
            z-50!
            transition-opacity!
            duration-300!
            ease-out!
            ${
              mobileSidebarOpen
                ? "pointer-events-auto! opacity-100!"
                : "pointer-events-none! opacity-0!"
            }
          `}
        >
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close navigation"
            onClick={handleCloseMobileSidebar}
            className="
              absolute!
              inset-0!
              cursor-default!
              bg-black/30!
              backdrop-blur-[2px]!
            "
          />

          {/* SIDEBAR */}

          <aside
            className={`
              absolute!
              inset-y-0!
              left-0!
              h-screen!
              w-65!
              max-w-[86vw]!
              overflow-hidden!
              bg-white!
              shadow-[8px_0_30px_rgba(0,0,0,0.12)]!

              transform!
              transition-transform!
              duration-300!
              ease-[cubic-bezier(0.22,1,0.36,1)]!

              ${
                mobileSidebarOpen
                  ? "translate-x-0!"
                  : "-translate-x-full!"
              }
            `}
          >
            <Sidebar
              collapsed={false}
              onToggle={handleCloseMobileSidebar}
              mobile
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;