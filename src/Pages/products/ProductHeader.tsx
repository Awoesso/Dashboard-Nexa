import {
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { ProductStatus } from "./ProductsNew";

interface ProductHeaderProps {
  status: ProductStatus;
  loading?: boolean;
}

const ProductHeaderSkeleton = () => {
  return (
    <header className="min-w-0!">
      <div className="flex! min-w-0! items-center! justify-between! gap-3!">
        <div className="min-w-0! flex! items-center! gap-2.5!">
          <div className="skeleton h-8! w-8! shrink-0! rounded-lg!" />

          <div className="min-w-0! space-y-1.5!">
            <div className="skeleton h-4! w-32! rounded-md!" />
            <div className="skeleton h-2.5! w-44! max-w-full! rounded-md!" />
          </div>
        </div>

        <div className="flex! shrink-0! items-center! gap-2!">
          <div className="skeleton hidden! h-9! w-20! rounded-lg! sm:block!" />
          <div className="skeleton h-9! w-24! rounded-lg!" />
        </div>
      </div>
    </header>
  );
};

const ProductHeader = ({
  status,
  loading = false,
}: ProductHeaderProps) => {
  if (loading) {
    return <ProductHeaderSkeleton />;
  }

  const isPublished = status === "published";

  return (
    <header className="min-w-0!">
      <div
        className="
          flex!
          min-w-0!
          items-center!
          justify-between!
          gap-3!
        "
      >
        {/* LEFT */}

        <div className="flex! min-w-0! items-center! gap-2.5!">
        

          <div className="min-w-0!">
            <div className="flex! min-w-0! items-center! gap-2!">
             

              <h1
            className="font-heading text-lg! font-semibold tracking-tight text-gray-800 sm:text-xl!"
              >
                Nouveau produit
              </h1>

            
            </div>

            <p
              
            >
              Créez et configurez votre produit.
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex! shrink-0! items-center! gap-1.5!">
          <Link
            to="/dashboard/home"
            className="
              hidden!
              h-9!
              items-center!
              justify-center!
              gap-1.5!
              rounded-full!
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
              active:scale-[0.98]!
              sm:inline-flex!
            "
          >
            Annuler
          </Link>

      
          {isPublished && (
            <div
              className="
                hidden!
                items-center!
                gap-1!
                text-[9px]!
                font-medium!
                text-green-600!
                lg:flex!
              "
            >
              <CheckCircle2
                size={12}
                strokeWidth={1.9}
              />
              Ready
            </div>
          )}
        </div>
      </div>

      <div className="mt-3! h-px! w-full! bg-gray-100!" />
    </header>
  );
};

export default ProductHeader;