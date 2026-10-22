import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GeneralSettings from "./GeneralSettings";
import NotificationSettings from "./NotificationSettings";
import SecuritySettings from "./SecuritySettings";

import SettingsTabs from "./SettingsTabs";
import SettingsHeader from "./SettingsHeader";

export type SettingsTab =
  | "general"
  | "notifications"
  | "security";

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLegacyStoreTab = searchParams.get("tab") === "store";
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("general");

  useEffect(() => {
    if (isLegacyStoreTab) {
      navigate("/dashboard/store", { replace: true });
    }
  }, [isLegacyStoreTab, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;

      case "notifications":
        return <NotificationSettings />;

      case "security":
        return <SecuritySettings />;

      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen! bg-[#fafafa] px-3! py-4! overflow-y-hidden sm:px-4! sm:py-5! lg:px-6! lg:py-6!">
      <div className="mx-auto! w-full! max-w-[1200px]!">
        <SettingsHeader />

        <div className="mt-5! overflow-hidden rounded-2xl! shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <SettingsTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <main className="min-w-0!">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;