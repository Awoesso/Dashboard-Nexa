import { useState } from "react";
import {
  Wallet,
  Download,
  CircleCheck,
} from "lucide-react";

import type {
  DashboardActivity,
  DashboardActivityType,
} from "@/services/dashboard.service";

const activityStyles: Record<
  DashboardActivityType,
  {
    icon: typeof Wallet;
    container: string;
    iconColor: string;
  }
> = {
  order: {
    icon: Wallet,
    container: "bg-orange-100",
    iconColor: "text-orange-500",
  },

  notification: {
    icon: Download,
    container: "bg-blue-100",
    iconColor: "text-blue-500",
  },

  payment: {
    icon: CircleCheck,
    container: "bg-green-100",
    iconColor: "text-green-500",
  },
};

const formatRelativeTime = (
  createdAt: string
): string => {
  const time = new Date(createdAt).getTime();

  if (Number.isNaN(time)) {
    return "Récemment";
  }

  const diffMinutes = Math.max(
    0,
    Math.round(
      (Date.now() - time) / 60000
    )
  );

  if (diffMinutes < 1) {
    return "À l’instant";
  }

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `Il y a ${diffDays} j`;
  }

  return new Date(createdAt).toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
    }
  );
};

type RecentActivitiesProps = {
  activities?: DashboardActivity[];
};

type ActivityFilter = "today" | "yesterday" | "week";

const getActivityFilterStart = (filter: ActivityFilter): Date => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (filter === "yesterday") {
    start.setDate(start.getDate() - 1);
  } else if (filter === "week") {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
  }

  return start;
};

const getActivityFilterEnd = (filter: ActivityFilter): Date => {
  const end = getActivityFilterStart(filter);
  end.setDate(end.getDate() + (filter === "week" ? 7 : 1));
  return end;
};

const RecentActivities = ({
  activities = [],
}: RecentActivitiesProps) => {
  const [filter, setFilter] = useState<ActivityFilter>("today");
  const [showAll, setShowAll] = useState(false);
  const start = getActivityFilterStart(filter);
  const end = getActivityFilterEnd(filter);
  const filteredActivities = activities.filter((activity) => {
    const timestamp = new Date(activity.createdAt).getTime();
    return Number.isFinite(timestamp) && timestamp >= start.getTime() && timestamp < end.getTime();
  });
  const visibleActivities = showAll
    ? filteredActivities
    : filteredActivities.slice(0, 4);
  const filters: { id: ActivityFilter; label: string }[] = [
    { id: "today", label: "Aujourd’hui" },
    { id: "yesterday", label: "Hier" },
    { id: "week", label: "Cette semaine" },
  ];

  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-4">

      {/* Header */}

      <div className="flex min-w-0 items-center justify-between gap-3">

        <h2 className="min-w-0 truncate font-heading !text-[15px] font-semibold tracking-tight text-gray-900">
          Activité récente
        </h2>

        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((current) => !current)}
          className="shrink-0 rounded-full border border-gray-200 px-2.5 py-1 !text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          {showAll ? "Afficher moins" : "Tout afficher"}
        </button>

      </div>

      {/* Filter */}

      <div className="mt-3 flex w-full gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 sm:gap-1.5">

        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => {
              setFilter(id);
              setShowAll(false);
            }}
            className={`min-w-0 flex-1 rounded-full border px-1.5 py-2 !text-[11px] font-semibold transition-colors sm:!text-[11.5px] ${
              filter === id
                ? "border-gray-200 bg-white text-gray-800 shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}

      </div>

      {/* Activities */}

      <div className="mt-3 divide-y divide-gray-100">

        {filteredActivities.length === 0 ? (
          <div className="py-6 text-center text-[11px] text-gray-400">
            Aucune activité pour cette période.
          </div>
        ) : (
          visibleActivities.map((activity) => {
            const style = activityStyles[activity.type];
            const Icon = style.icon;

            return (
              <div
                key={activity.id}
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  py-2.5
                  sm:gap-2.5
                "
              >

                {/* Icon */}

                <div
                  className={`
                    flex
                    h-7 w-7
                    shrink-0
                    items-center justify-center
                    rounded-full
                    ${style.container}
                  `}
                >
                  <Icon
                    size={12}
                    strokeWidth={2}
                    className={style.iconColor}
                  />
                </div>

                {/* Content */}

                <div className="min-w-0 flex-1">

                  <p className="truncate !text-[12px] font-medium text-gray-800">
                    {activity.title}
                  </p>

                  <p className="truncate !text-[0.675rem] font-normal text-gray-400">
                    {activity.description}
                  </p>

                </div>

                {/* Time */}

                <span
                  className="
                    max-w-[55px]
                    shrink-0
                    truncate
                    !text-[9px]
                    font-semibold
                    text-gray-700
                    sm:max-w-none
                    sm:!text-[10px]
                  "
                >
                  {formatRelativeTime(activity.createdAt)}
                </span>

              </div>
            );
          })
        )}

      </div>

    </section>
  );
};

export default RecentActivities;