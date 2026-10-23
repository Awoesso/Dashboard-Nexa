type StatCardProps = {
  title: string;
  value: number;
  change: number | null;
  currency?: string;
  period?: string;
};

const StatCard = ({
  title,
  value,
  change,
  currency,
  period,
}: StatCardProps) => {
  const isComparable = change !== null;
  const isPositive = isComparable && change >= 0;
  const formattedValue = value.toLocaleString();

  return (
    <div
      className="
        flex
        min-w-0
        flex-1
        flex-col
        justify-between
        rounded-xl
        border border-gray-200
        bg-white
        px-3.5 py-3
        shadow-xs
        transition-colors
        duration-150
        hover:border-gray-300
        sm:px-4
      "
    >

      {/* Header */}

      <div className="flex min-w-0 items-center justify-between gap-2">

        <p className="min-w-0 truncate text-xs! font-semibold text-gray-700">
          {title}
        </p>

        {period && (
          <span className="shrink-0 text-[10px]! font-normal text-gray-400">
            {period}
          </span>
        )}

      </div>

      {/* Value + Change */}

      <div className="mt-2 flex min-w-0 items-end gap-2">

        <p className="min-w-0 truncate font-mono text-sm! font-semibold tracking-tight text-gray-900 sm:text-[20px]!">
 
          {currency && (
            <span className="mr-1 font-sans text-sm! font-medium text-gray-600">
              {currency}
            </span>
          )}
  {formattedValue}
       

        </p>

        {/* Change */}

        <span
          title={isComparable ? "Évolution par rapport à la période précédente" : "Comparaison indisponible"}
          className={`mb-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px]! font-medium ${
            !isComparable
              ? "bg-gray-100 text-gray-500"
              : isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {isComparable ? `${isPositive ? "+" : ""}${change.toFixed(1)}%` : "N/A"}
        </span>

      </div>

    </div>
  );
};

export default StatCard;