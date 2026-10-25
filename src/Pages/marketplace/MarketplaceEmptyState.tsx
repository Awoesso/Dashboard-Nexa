import {
  PackageSearch,
  RotateCcw,
  SearchX,
} from "lucide-react";

type MarketplaceEmptyStateProps = {
  hasFilters?: boolean;
  onClearFilters?: () => void;
};

const MarketplaceEmptyState = ({
  hasFilters = false,
  onClearFilters,
}: MarketplaceEmptyStateProps) => {
  return (
    <div
      className="
        flex!
        min-h-[320px]!
        items-center!
        justify-center!
        px-4!
        py-10!
        sm:min-h-[380px]!
      "
    >
      <div className="w-full! max-w-sm! text-center!">
        <div
          className="
            mx-auto!
            flex!
            h-11!
            w-11!
            items-center!
            justify-center!
            rounded-xl!
            border!
            border-gray-200!
            bg-white!
            text-gray-400!
          "
        >
          {hasFilters ? (
            <SearchX
              size={20}
              strokeWidth={1.7}
            />
          ) : (
            <PackageSearch
              size={20}
              strokeWidth={1.7}
            />
          )}
        </div>

        <h3
          className="
            mt-3!
            font-heading!
            text-sm!
            font-semibold!
            tracking-tight!
            text-gray-900!
          "
        >
          {hasFilters
            ? "Aucun produit trouvé"
            : "Vous n’avez pas encore de produit"}
        </h3>

        <p
          className="
            mt-1.5!
            text-[10px]!
            leading-5!
            text-gray-500!
            sm:text-[11px]!
          "
        >
          {hasFilters
            ? "Veuillez modifier votre recherche ou l’effacer pour afficher d’autres produits."
            : "Ajoutez votre premier produit pour commencer à développer votre catalogue."}
        </p>

        {hasFilters &&
          onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="
                mt-4!
                inline-flex!
                h-9!
                items-center!
                justify-center!
                gap-1.5!
                rounded-lg!
                border!
                border-gray-200!
                bg-white!
                px-3!
                text-[10px]!
                font-semibold!
                text-gray-600!
                transition-all!
                duration-150!
                hover:border-gray-300!
                hover:bg-gray-50!
                hover:text-gray-900!
                active:scale-[0.99]!
              "
            >
              <RotateCcw
                size={12}
                strokeWidth={1.9}
              />

              Effacer la recherche
            </button>
          )}
      </div>
    </div>
  );
};

export default MarketplaceEmptyState;