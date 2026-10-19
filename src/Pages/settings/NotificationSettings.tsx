import { useState } from "react";
import {
  Check,
  CreditCard,
  Bell,
  Package,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import usePushNotifications from "@/hooks/usePushNotifications";

type NotificationPreferences = {
  orders: boolean;
  payments: boolean;
  products: boolean;
  security: boolean;
};

const DEFAULT_SETTINGS: NotificationPreferences = {
  orders: true,
  payments: true,
  products: false,
  security: true,
};

const STORAGE_KEY = "orion-notification-settings";

const NotificationSettings = () => {
  const {
    supported,
    permission,
    enabled,
    loading: pushLoading,
    error: pushError,
    enable,
    disable,
  } = usePushNotifications();

  const [settings, setSettings] =
    useState<NotificationPreferences>(() => {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return DEFAULT_SETTINGS;
      }

      try {
        const parsed = JSON.parse(saved);

        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    });

  const [saved, setSaved] = useState(false);

  const updateSetting = (
    key: keyof NotificationPreferences,
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings),
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <section className="w-full! min-w-0!">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-5!">
        <div className="flex! items-center! gap-2.5!">
        

          <h2 className="font-heading! text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!">
            Notifications
          </h2>
        </div>

        <p className="mt-1! max-w-xl! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
          Choose which activities should generate notifications.
        </p>
      </div>

      {/* =====================================================
          SETTINGS LIST
      ===================================================== */}

      <div className="divide-y! divide-gray-200! border-y! border-gray-200!">
        <NotificationItem
          icon={
            <ShoppingCart
              size={15}
              strokeWidth={1.8}
            />
          }
          title="New orders"
          description="Receive notifications whenever a new order is placed."
          checked={settings.orders}
          onChange={() =>
            updateSetting("orders")
          }
        />

        <NotificationItem
          icon={
            <CreditCard
              size={15}
              strokeWidth={1.8}
            />
          }
          title="Payments"
          description="Get alerts for successful or failed payments."
          checked={settings.payments}
          onChange={() =>
            updateSetting("payments")
          }
        />

        <NotificationItem
          icon={
            <Package
              size={15}
              strokeWidth={1.8}
            />
          }
          title="Product activity"
          description="Receive updates about important product activity."
          checked={settings.products}
          onChange={() =>
            updateSetting("products")
          }
        />

        <NotificationItem
          icon={
            <ShieldCheck
              size={15}
              strokeWidth={1.8}
            />
          }
          title="Security alerts"
          description="Important notifications about your account and security."
          checked={settings.security}
          onChange={() =>
            updateSetting("security")
          }
        />
      </div>

      <div className="flex! min-w-0! items-center! justify-between! gap-4! border-b! border-gray-200! py-4!">
        <div className="flex! min-w-0! items-start! gap-3!">
          <div className="flex! h-8! w-8! shrink-0! items-center! justify-center! rounded-xl! bg-blue-50! text-blue-600!">
            <Bell size={15} strokeWidth={1.8} />
          </div>
          <div className="min-w-0!">
            <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
              Browser push notifications
            </p>
            <p className="mt-0.5! max-w-xl! text-[9px]! font-medium! leading-relaxed! text-gray-500! sm:text-[10px]!">
              {permission === "denied"
                ? "Notifications are blocked in your browser settings."
                : enabled
                  ? "Push notifications are enabled for this browser."
                  : "Allow this browser to send you push notifications."}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Browser push notifications"
          onClick={() => void (enabled ? disable() : enable())}
          disabled={!supported || permission === "denied" || pushLoading}
          className={`
            relative! h-6! w-11! shrink-0! rounded-full! transition-colors!
            focus:outline-none! focus:ring-1! focus:ring-blue-600/20!
            disabled:cursor-not-allowed! disabled:opacity-50!
            ${enabled ? "bg-blue-600!" : "bg-gray-300!"}
          `}
        >
          <span
            className={`
              absolute! top-1! h-4! w-4! rounded-full! bg-white! shadow-sm!
              transition-transform! duration-200!
              ${enabled ? "translate-x-6!" : "translate-x-1!"}
            `}
          />
        </button>
      </div>

      {pushError && (
        <p role="alert" className="mt-2! text-[10px]! text-red-600!">
          {pushError}
        </p>
      )}

      {/* =====================================================
          FEEDBACK
      ===================================================== */}

      {saved && (
        <div className="mt-4! flex! items-center! gap-2! text-green-600!">
          <Check
            size={14}
            strokeWidth={2.2}
          />

          <p className="text-[10px]! font-semibold! sm:text-[11px]!">
            Notification preferences saved.
          </p>
        </div>
      )}

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="mt-5! flex! justify-end!">
        <button
          type="button"
          onClick={handleSave}
          className="
            inline-flex!
            h-10!
            w-full!
            items-center!
            justify-center!
            gap-1.5!
            rounded-xl!
            bg-blue-600!
            px-4!
            text-[10px]!
            font-semibold!
            text-white!
            transition-all!
            duration-150!
            hover:bg-blue-700!
            active:scale-[0.99]!
            sm:w-auto!
            sm:text-[11px]!
          "
        >
          <Check
            size={13}
            strokeWidth={2.1}
          />

          Save preferences
        </button>
      </div>
    </section>
  );
};

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const NotificationItem = ({
  icon,
  title,
  description,
  checked,
  onChange,
}: NotificationItemProps) => {
  return (
    <div className="flex! min-w-0! items-center! justify-between! gap-4! py-4!">
      <div className="flex! min-w-0! flex-1! items-start! gap-3!">
        {/* ICON */}

        <div
          className={`
            flex!
            h-8!
            w-8!
            shrink-0!
            items-center!
            justify-center!
            rounded-xl!
            ${
              checked
                ? "bg-blue-50! text-blue-600!"
                : "bg-gray-50! text-gray-500!"
            }
          `}
        >
          {icon}
        </div>

        {/* TEXT */}

        <div className="min-w-0!">
          <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
            {title}
          </p>

          <p className="mt-0.5! max-w-xl! text-[9px]! font-medium! leading-relaxed! text-gray-500! sm:text-[10px]!">
            {description}
          </p>
        </div>
      </div>

      {/* SWITCH */}

    <button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={`Toggle ${title}`}
  onClick={onChange}
  className={`
    relative!
    h-6!
    w-11!
    shrink-0!
    rounded-full!
    transition-colors!
    duration-200!
    focus:outline-none!
    focus:ring-1!
    focus:ring-blue-600/20!
    ${
      checked
        ? "bg-blue-600!"
        : "bg-gray-300!"
    }
  `}
>
  <span
    className={`
      absolute!
      left-0!
      top-1!
      h-4!
      w-4!
      rounded-full!
      bg-white!
      shadow-sm!
      transition-transform!
      duration-200!
      ${
        checked
          ? "translate-x-6!"
          : "translate-x-1!"
      }
    `}
  />
</button>
    </div>
  );
};

export default NotificationSettings;