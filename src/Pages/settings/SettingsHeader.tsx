import {
  Settings2,
} from "lucide-react";

const SettingsHeader = () => {
  return (
    <header className="w-full! min-w-0!">
      <div className="flex! min-w-0! flex-col! gap-3! sm:flex-row! sm:items-center! sm:justify-between!">
        {/* =====================================================
            TITLE
        ===================================================== */}

        <div className="min-w-0!">
          <div className="flex! min-w-0! items-center! gap-2.5!">
            <div className="flex! h-8! w-8! shrink-0! items-center! justify-center! text-gray-500!">
              <Settings2
                size={15}
                strokeWidth={1.9}
              />
            </div>

            <div className="min-w-0!">
              <h1 className="font-heading! truncate! text-lg! font-semibold! tracking-tight! text-gray-900! sm:text-xl!">
                Settings
              </h1>
            </div>
          </div>

          <p className="mt-1! max-w-2xl! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
            Manage your account, notifications and security preferences.
          </p>
        </div>
      </div>
    </header>
  );
};

export default SettingsHeader;