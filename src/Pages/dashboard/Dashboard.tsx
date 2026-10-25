import { lazy, Suspense, useState } from "react";
import { RotateCw } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import GlobalStatCard from "./GlobalStatCard";
import DocPerformance from "./DOCPERFORMANCE";
import DashWallet from "./DahWallet";
import RecentActivities from "./RecentActivities";
import { useProfile } from "@/Context/useProfile";

const DashChart = lazy(() => import("./DashChart"));

// ================= WELCOME MESSAGES =================


interface WelcomeMessage {
  title: string;
  subtitle: string;
}

const WELCOME_MESSAGES: WelcomeMessage[] = [
  {
    title: "Ravi de vous retrouver",
    subtitle: "Votre activité et vos produits sont réunis dans votre espace.",
  },
  {
    title: "Et si vous faisiez grandir votre activité ?",
    subtitle: "Consultez vos statistiques et ajoutez de nouveaux produits.",
  },
  {
    title: "Bienvenue dans votre espace",
    subtitle: "Suivez votre activité et gérez votre boutique en toute simplicité.",
  },
];

// ================= DASHBOARD =================

const Dashboard = () => {
  const [messageIndex, setMessageIndex] = useState(
    () => Math.floor(Math.random() * WELCOME_MESSAGES.length),
  );
  const currentMessage = WELCOME_MESSAGES[messageIndex];

  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    refreshProfile,
  } = useProfile();
  const {
    analytics,
    stats,
    topProducts,
    activities,
    refreshKey,
    periodOptions,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
  } = useDashboard();

  // ================= LOADING SKELETON =================

  if (profileLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <section>
            <div className="skeleton h-5 w-48 rounded-md sm:h-6 sm:w-56" />
            <div className="skeleton mt-2 h-3 w-64 max-w-full rounded-md sm:h-3.5 sm:w-80" />
          </section>

          {/* Grid Skeleton */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
            {/* Left Column */}
            <div className="grid min-w-0 gap-4">
              <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="skeleton h-7 w-7 shrink-0 rounded-full" />
                    <div className="skeleton h-3 w-32 rounded-md sm:h-3.5 sm:w-36" />
                  </div>
                  <div className="skeleton h-7 w-16 shrink-0 rounded-full sm:h-8 sm:w-20" />
                </div>

                <div className="mt-3 min-w-0 overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="rounded-xl border border-gray-100 p-3">
                        <div className="skeleton h-3 w-16 rounded-md" />
                        <div className="skeleton mt-2 h-6 w-20 rounded-md" />
                        <div className="skeleton mt-2 h-2.5 w-14 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="skeleton h-3.5 w-36 rounded-md" />
                    <div className="skeleton mt-1.5 h-2.5 w-48 rounded-md" />
                  </div>
                  <div className="skeleton h-7 w-16 rounded-md" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="skeleton h-2.5 w-full rounded-full" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="skeleton h-8 rounded-lg" />
                    <div className="skeleton h-8 rounded-lg" />
                    <div className="skeleton h-8 rounded-lg" />
                  </div>
                  <div className="skeleton h-20 w-full rounded-xl" />
                </div>
              </section>

              <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="skeleton h-3.5 w-28 rounded-md" />
                    <div className="skeleton mt-1.5 h-2.5 w-44 rounded-md" />
                  </div>
                  <div className="skeleton h-7 w-20 rounded-md" />
                </div>
                <div className="mt-5">
                  <div className="relative h-56 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40">
                    <div className="absolute inset-x-3 bottom-3 top-3 flex flex-col justify-between">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-px w-full" />
                      ))}
                    </div>
                    <div className="absolute bottom-6 left-4 right-4 flex h-36 items-end gap-2">
                      {[35, 50, 42, 67, 58, 75, 63, 82].map((height, i) => (
                        <div
                          key={i}
                          className="skeleton flex-1 rounded-t-md"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="skeleton h-2.5 w-16 rounded-md" />
                    <div className="flex gap-2">
                      <div className="skeleton h-2.5 w-12 rounded-md" />
                      <div className="skeleton h-2.5 w-12 rounded-md" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="grid min-w-0 gap-4">
              <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="skeleton h-3.5 w-20 rounded-md" />
                    <div className="skeleton mt-1.5 h-2.5 w-32 rounded-md" />
                  </div>
                  <div className="skeleton h-7 w-7 rounded-lg" />
                </div>
                <div className="mt-5">
                  <div className="skeleton h-7 w-32 rounded-md" />
                  <div className="skeleton mt-2 h-2.5 w-28 rounded-md" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="skeleton h-2.5 w-16 rounded-md" />
                    <div className="skeleton mt-2 h-4 w-20 rounded-md" />
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="skeleton h-2.5 w-16 rounded-md" />
                    <div className="skeleton mt-2 h-4 w-20 rounded-md" />
                  </div>
                </div>
                <div className="skeleton mt-4 h-9 w-full rounded-lg" />
              </section>

              <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="skeleton h-3.5 w-32 rounded-md" />
                    <div className="skeleton mt-1.5 h-2.5 w-40 rounded-md" />
                  </div>
                  <div className="skeleton h-6 w-14 rounded-md" />
                </div>
                <div className="mt-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <div className="skeleton h-2.5 w-24 rounded-md" />
                        <div className="skeleton mt-1.5 h-2 w-32 rounded-md" />
                      </div>
                      <div className="skeleton h-2.5 w-10 rounded-md" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= ERROR STATE =================

  if (profileError || dashboardError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
        <div className="bg-white p-5 text-center rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-red-600">
            {profileError
              ? "Impossible de charger votre profil."
              : "Impossible de charger le dashboard."}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {profileError ?? dashboardError}
          </p>
          <button
            type="button"
            onClick={() => {
              void refreshProfile();
              void refreshDashboard();
            }}
            className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ================= MAIN RENDER =================

  const firstName = profile?.first_name?.trim();

  return (
    <div className="min-h-screen bg-[#fafafa] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      {/* Header */}
      <section>
        <h1 className="app-page-title text-gray-800">
          {firstName ? `Bonjour, ${firstName} !` : "Bienvenue !"}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="app-page-description text-gray-700">
            {currentMessage.title}
          </p>
          <p className="app-page-description text-gray-500">
            {currentMessage.subtitle}
          </p>
          <button
            type="button"
            onClick={() =>
              setMessageIndex((index) => (index + 1) % WELCOME_MESSAGES.length)
            }
            aria-label="Afficher un autre message de bienvenue"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <RotateCw size={12} />
            Changer
          </button>
        </div>
      </section>

      {/* Grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        {/* Left Column */}
        <div className="grid min-w-0 gap-4">
          <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
                  <span className="text-[10px]">✦</span>
                </div>
                <span className="app-section-title truncate text-gray-900">
                  Résumé de votre activité
                </span>
              </div>

            </div>

            <div className="mt-3 min-w-0 overflow-hidden">
              <GlobalStatCard
                stats={stats}
                period="Depuis le début"
              />
            </div>
          </section>

          <div className="min-w-0">
            <DocPerformance products={topProducts} />
          </div>

          <div className="min-w-0">
            <Suspense fallback={null}>
              <DashChart
                analytics={analytics}
                periodOptions={periodOptions}
                refreshKey={refreshKey}
              />
            </Suspense>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid min-w-0 gap-4">
          <div className="min-w-0">
            <DashWallet />
          </div>

          <div className="min-w-0">
            <RecentActivities activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;