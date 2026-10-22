import {
  Bell,
  Shield,
  User,
} from "lucide-react";

import type { SettingsTab } from "./Settings";

type SettingsTabsProps = {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

const tabs = [
  {
    id: "general" as SettingsTab,
    label: "General",
    icon: User,
  },
  {
    id: "notifications" as SettingsTab,
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "security" as SettingsTab,
    label: "Security",
    icon: Shield,
  },
];

const SettingsTabs = ({
  activeTab,
  onChange,
}: SettingsTabsProps) => {
  return (
    <div className="w-full! overflow-x-auto! mb-3 border-b! border-gray-200!">
      <nav
        className="flex! min-w-max! items-center! gap-5! sm:gap-6!"
        aria-label="Settings navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`
                relative!
                inline-flex!
                h-11!
                shrink-0!
                items-center!
                gap-1.5!
                border-b-2!
                text-[11px]!
                font-semibold!
                transition-colors!
                duration-150!
                sm:text-xs!
                ${
                  active
                    ? "border-blue-600! text-blue-600!"
                    : "border-transparent! text-gray-500! hover:text-gray-900!"
                }
              `}
            >
              <Icon
                size={14}
                strokeWidth={1.8}
              />

              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsTabs;