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
              <h1 className="app-page-title truncate! text-gray-900!">
                Paramètres
              </h1>
            </div>
          </div>

          <p className="app-page-description mt-1! max-w-2xl! text-gray-500!">
            Gérez votre compte, vos notifications et vos préférences de sécurité.
          </p>
        </div>
      </div>
    </header>
  );
};

export default SettingsHeader;