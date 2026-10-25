import {
  PackageOpen,
} from "lucide-react";

import ProductRow, {
  type MarketplaceProduct,
} from "../marketplace/ProductRow";

type MarketplaceListProps = {
  products: MarketplaceProduct[];
};

const MarketplaceList = ({
  products,
}: MarketplaceListProps) => {
  return (
    <div className="min-w-0! overflow-hidden! rounded-2xl! border! border-gray-200! bg-white!">

      {/* ===============================================
          TABLE HEADER
      =============================================== */}

      <div
        className="
          hidden!
          items-center!
          gap-4!
          border-b!
          border-gray-200!
          bg-[#fafafa]!
          px-4!
          py-2.5!
          text-[9px]!
          font-semibold!
          uppercase!
          tracking-wide!
          text-gray-400!
          sm:flex!
        "
      >
        <div className="min-w-0! flex-1!">
          Product
        </div>

        <div className="w-32! shrink-0!">
          Price
        </div>

        <div className="w-20! shrink-0!">
          Ventes
        </div>

        <div className="w-28! shrink-0!">
          Stock
        </div>

        <div className="w-28! shrink-0!">
          Statut
        </div>
      </div>

      {/* ===============================================
          PRODUCTS
      =============================================== */}

      <div className="min-w-0!">
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* ===============================================
          FOOTER
      =============================================== */}

      <div className="flex! items-center! justify-between! border-t! border-gray-100! px-3! py-3! sm:px-4!">
        <div className="flex! items-center! gap-1.5!">
          <PackageOpen
            size={12}
            strokeWidth={1.8}
            className="text-gray-400!"
          />

          <span className="text-[9px]! font-medium! text-gray-400!">
            {products.length} products
          </span>
        </div>
      </div>

    </div>
  );
};

export default MarketplaceList;