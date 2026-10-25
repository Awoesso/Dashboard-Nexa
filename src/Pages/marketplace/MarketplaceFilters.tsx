import { Check, X } from "lucide-react";

export type MarketplaceFiltersState = {
  category: string;
  status: string;
  productType: string;
};

type MarketplaceFiltersProps = {
  filters: MarketplaceFiltersState;
  onChange: (
    filters: MarketplaceFiltersState,
  ) => void;
  onClear: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const MarketplaceFilters = ({
  filters,
  onChange,
  onClear,
  mobileOpen = false,
  onCloseMobile,
}: MarketplaceFiltersProps) => {
  const hasFilters =
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.productType !== "all";

  const updateFilter = (
    key: keyof MarketplaceFiltersState,
    value: string,
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const content = (
    <div className="space-y-5!">
      {/* Header */}

      <div className="flex! items-center! justify-between!">
        <div>
          <p className="text-[11px]! font-semibold! text-gray-900!">
            Filtres
          </p>

          <p className="mt-0.5! text-[9px]! text-gray-500!">
            Affinez la liste de vos produits.
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="
              text-[9px]!
              font-semibold!
              text-gray-500!
              transition-colors!
              duration-150!
              hover:text-gray-900!
            "
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Category */}

      <FilterGroup
        label="Catégorie"
        value={filters.category}
        options={[
          ["all", "Toutes les catégories"],
          ["electronics", "Électronique"],
          ["fashion", "Mode"],
          ["beauty", "Beauté"],
          ["home", "Maison"],
          ["other", "Autre"],
        ]}
        onChange={(value) =>
          updateFilter("category", value)
        }
      />

      {/* Product type */}

      <FilterGroup
        label="Type de produit"
        value={filters.productType}
        options={[
          ["all", "Tous les produits"],
          ["physical", "Physique"],
          ["digital", "Numérique"],
        ]}
        onChange={(value) =>
          updateFilter("productType", value)
        }
      />

      {/* Status */}

      <FilterGroup
        label="Statut"
        value={filters.status}
        options={[
          ["all", "Tous les statuts"],
          ["published", "Publié"],
          ["draft", "Brouillon"],
          ["archived", "Archivé"],
        ]}
        onChange={(value) =>
          updateFilter("status", value)
        }
      />

      {/* Mobile close */}

      {mobileOpen && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="
            flex!
            h-10!
            w-full!
            items-center!
            justify-center!
            gap-1.5!
            rounded-lg!
            bg-blue-600!
            text-[10px]!
            font-semibold!
            text-white!
            transition-colors!
            duration-150!
            hover:bg-blue-700!
          "
        >
          <Check size={13} />
          Apply filters
        </button>
      )}
    </div>
  );

  if (mobileOpen) {
    return (
      <div
        className="
          fixed!
          inset-0!
          z-[90]!
          flex!
          items-end!
          justify-center!
          bg-gray-950/30!
          p-3!
          backdrop-blur-sm!
          sm:hidden!
        "
      >
        <div
          className="
            w-full!
            max-w-lg!
            rounded-2xl!
            border!
            border-gray-200!
            bg-white!
            p-4!
            shadow-2xl!
            shadow-gray-950/10!
          "
        >
          <div className="mb-4! flex! items-center! justify-between!">
            <p className="font-heading! text-sm! font-semibold! tracking-tight! text-gray-900!">
              Filters
            </p>

            <button
              type="button"
              onClick={onCloseMobile}
              className="
                flex!
                h-7!
                w-7!
                items-center!
                justify-center!
                rounded-lg!
                text-gray-400!
                transition-colors!
                hover:bg-gray-100!
                hover:text-gray-700!
              "
              aria-label="Fermer les filtres"
            >
              <X size={14} />
            </button>
          </div>

          {content}
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden! min-w-0! lg:block!">
      <div className="rounded-2xl! border! border-gray-200! bg-white! p-4!">
        {content}
      </div>
    </aside>
  );
};

type FilterGroupProps = {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
};

const FilterGroup = ({
  label,
  value,
  options,
  onChange,
}: FilterGroupProps) => {
  return (
    <div>
      <p className="mb-2! text-[10px]! font-semibold! text-gray-700!">
        {label}
      </p>

      <div className="space-y-1!">
        {options.map(([optionValue, label]) => {
          const active =
            value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() =>
                onChange(optionValue)
              }
              className={`
                flex!
                w-full!
                items-center!
                justify-between!
                gap-3!
                rounded-lg!
                px-2.5!
                py-2!
                text-left!
                transition-colors!
                duration-150!
                ${
                  active
                    ? "bg-blue-50! text-blue-700!"
                    : "text-gray-500! hover:bg-gray-50! hover:text-gray-900!"
                }
              `}
            >
              <span className="truncate! text-[10px]! font-medium!">
                {label}
              </span>

              {active && (
                <Check
                  size={12}
                  strokeWidth={2.2}
                  className="shrink-0!"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceFilters;