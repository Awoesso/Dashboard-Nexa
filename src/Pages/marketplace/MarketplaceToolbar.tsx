import {
  ArrowDownUp,
  Search,
  X,
} from "lucide-react";

type MarketplaceToolbarProps = {
  search: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  isLoading?: boolean;
};

const MarketplaceToolbarSkeleton = () => {
  return (
    <div
      className="
        flex!
        min-w-0!
        flex-col!
        gap-3!
        sm:flex-row!
        sm:items-center!
        sm:justify-between!
      "
    >
      <div className="skeleton h-10! w-full! rounded-lg! sm:max-w-[520px]!" />

      <div className="skeleton h-10! w-28! shrink-0! rounded-lg!" />
    </div>
  );
};

const MarketplaceToolbar = ({
  search,
  sort,
  onSearchChange,
  onSortChange,
  isLoading = false,
}: MarketplaceToolbarProps) => {
  if (isLoading) {
    return <MarketplaceToolbarSkeleton />;
  }

  return (
    <div
      className="
        flex!
        min-w-0!
        flex-col!
        gap-3!
        sm:flex-row!
        sm:items-center!
        sm:justify-between!
      "
    >
      {/* SEARCH */}

      <div className="relative! min-w-0! flex-1! sm:max-w-[520px]!">
        <Search
          size={14}
          strokeWidth={1.8}
          className="
            pointer-events-none!
            absolute!
            left-3!
            top-1/2!
            -translate-y-1/2!
            text-gray-400!
          "
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
       
                placeholder="Rechercher..."
                className="
                  h-9!
                  w-[60%]!
                  rounded-full!
                  border!
                  border-gray-200!
                  bg-white!
                  pl-9!
                  pr-3!
                  text-xs!
                  font-semibold!
                  text-gray-800!
                  outline-none!
                  placeholder:font-medium!
                  placeholder:text-gray-400!
                  transition-all!
                  duration-150!
                  focus:border-gray-300!
                  focus:ring-2!
                  focus:ring-gray-900/5!
                "
        />

        {search && (
          <button
            type="button"
            onClick={() =>
              onSearchChange("")
            }
            aria-label="Effacer la recherche"
            className="
              absolute!
              right-2.5!
              top-1/2!
              inline-flex!
              h-6!
              w-6!
              -translate-y-1/2!
              items-center!
              justify-center!
              rounded-md!
              text-gray-400!
              transition-colors!
              duration-150!
              hover:bg-gray-100!
              hover:text-gray-700!
            "
          >
            <X
              size={12}
              strokeWidth={1.8}
            />
          </button>
        )}
      </div>

      {/* SORT */}

      <div className="relative! shrink-0!">
        <ArrowDownUp
          size={13}
          strokeWidth={1.8}
          className="
            pointer-events-none!
            absolute!
            left-3!
            top-1/2!
            -translate-y-1/2!
            text-gray-400!
          "
        />

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(
              event.target.value,
            )
          }
          className="
            h-10!
            w-full!
            appearance-none!
            rounded-lg!
            border!
            border-gray-200!
            bg-white!
            pl-8!
            pr-8!
            text-[10px]!
            font-semibold!
            text-gray-600!
            outline-none!
            transition-all!
            duration-150!
             focus:border-gray-300!
                  focus:ring-2!
                  focus:ring-gray-900/5!
            sm:w-auto!
            sm:min-w-[118px]!
          "
        >
          <option value="newest">
            Newest
          </option>

          <option value="oldest">
            Oldest
          </option>

          <option value="price-low">
            Price: Low
          </option>

          <option value="price-high">
            Price: High
          </option>

          <option value="best-selling">
            Best selling
          </option>
        </select>
      </div>
    </div>
  );
};

export default MarketplaceToolbar;