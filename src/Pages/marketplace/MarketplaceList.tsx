import ProductRow, {
  type MarketplaceProduct,
  ProductRowSkeleton,
} from "./ProductRow";

type MarketplaceListProps = {
  products: MarketplaceProduct[];
  isLoading?: boolean;
  onDelete?: (
    product: MarketplaceProduct,
  ) => void;
};

const MarketplaceListSkeleton = () => {
  const rows = Array.from(
    { length: 6 },
    (_, index) => index,
  );

  return (
    <section className="min-w-0!">
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          hidden!
          items-center!
          gap-4!
          px-4!
          pb-2.5!
          text-[9px]!
          font-semibold!
          uppercase!
          tracking-[0.04em]!
          text-gray-500!
          sm:flex!
        "
      >
        <div className="min-w-0! flex-1!">
          Produit
        </div>

        <div className="w-28! shrink-0!">
          Price
        </div>

        <div className="w-16! shrink-0!">
          Sales
        </div>

        <div className="w-16! shrink-0!">
          Views
        </div>

        <div className="w-24! shrink-0!">
          Statut
        </div>

        <div className="w-16! shrink-0!" />
      </div>

      {/* =================================================
          LIST SKELETON
      ================================================= */}

      <div
        className="
          min-w-0!
          overflow-hidden!
          rounded-2xl!
          border!
          border-gray-200!
          bg-white!
        "
      >
        {rows.map((row) => (
          <ProductRowSkeleton
            key={row}
          />
        ))}
      </div>

      <div className="mt-2.5! px-1!">
        <div className="skeleton! h-2.5! w-16!" />
      </div>
    </section>
  );
};

const MarketplaceList = ({
  products,
  isLoading = false,
  onDelete,
}: MarketplaceListProps) => {
  if (isLoading) {
    return (
      <MarketplaceListSkeleton />
    );
  }

  return (
    <section className="relative! min-w-0!">
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          hidden!
          items-center!
          gap-4!
          px-4!
          pb-2.5!
          text-[9px]!
          font-semibold!
          uppercase!
          tracking-[0.04em]!
          text-gray-500!
          sm:flex!
        "
      >
        <div className="min-w-0! flex-1!">
          Produit
        </div>

        <div className="w-28! shrink-0!">
          Price
        </div>

        <div className="w-16! shrink-0!">
          Sales
        </div>

        <div className="w-16! shrink-0!">
          Views
        </div>

        <div className="w-24! shrink-0!">
          Status
        </div>

        <div className="w-16! shrink-0!" />
      </div>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <div
        className="
          relative!
          min-w-0!
          overflow-visible!
          rounded-2xl!
          border!
          border-gray-200!
          bg-white!
        "
      >
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-2.5! flex! min-h-4! items-center! justify-between! px-1!">
        <span className="text-[9px]! font-medium! text-gray-400!">
          {products.length}{" "}
          {products.length === 1
            ? "product"
            : "products"}
        </span>
      </div>
    </section>
  );
};

export default MarketplaceList;