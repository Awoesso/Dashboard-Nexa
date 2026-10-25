import {
  Eye,
  MoreHorizontal,
  Package,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export type MarketplaceProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  price: number;
  currency: string;
  status:
    | "draft"
    | "published"
    | "archived";
  sales_count?: number;
  view_count?: number;
  image_url?: string | null;
  created_at?: string;
};

type ProductRowProps = {
  product: MarketplaceProduct;
  onDelete?: (
    product: MarketplaceProduct,
  ) => void;
};

/* =========================================================
   SKELETON
========================================================= */

const ProductRowSkeleton = () => {
  return (
    <article
      className="
        border-b!
        border-gray-100!
        bg-white!
        last:border-b-0!
      "
    >
      <div
        className="
          flex!
          min-w-0!
          items-center!
          gap-3!
          px-3!
          py-3!
          sm:gap-4!
          sm:px-4!
          sm:py-3.5!
        "
      >
        <div className="skeleton! h-11! w-11! shrink-0! rounded-xl! sm:h-12! sm:w-12!" />

        <div className="min-w-0! flex-1!">
          <div className="skeleton! h-3! w-32! max-w-[75%]!" />

          <div className="skeleton! mt-1.5! h-2! w-44! max-w-[90%]!" />
        </div>

        <div className="hidden! shrink-0! sm:block! sm:w-28!">
          <div className="skeleton! h-3! w-14!" />
        </div>

        <div className="hidden! shrink-0! lg:block! lg:w-16!">
          <div className="skeleton! h-3! w-6!" />
        </div>

        <div className="hidden! shrink-0! lg:block! lg:w-16!">
          <div className="skeleton! h-3! w-6!" />
        </div>

        <div className="hidden! w-24! shrink-0! md:block!">
          <div className="skeleton! h-2.5! w-16!" />
        </div>

        <div className="skeleton! h-8! w-16! shrink-0! rounded-lg!" />
      </div>
    </article>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ProductRow = ({
  product,
  onDelete,
}: ProductRowProps) => {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     CLOSE MENU OUTSIDE
  ======================================================= */

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent,
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, [isMenuOpen]);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isMenuOpen]);

  /* =======================================================
     DATA
  ======================================================= */

  const formattedPrice =
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(
      Number(product.price),
    );

  const statusConfig = {
    published: {
      label: "Publié",
      dot: "bg-green-500!",
    },
    draft: {
      label: "Brouillon",
      dot: "bg-gray-400!",
    },
    archived: {
      label: "Archivé",
      dot: "bg-gray-300!",
    },
  } as const;

  const status =
    statusConfig[product.status];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      className="
        group!
        min-w-0!
        border-b!
        border-gray-200!
        bg-white!
        transition-colors!
        duration-150!
        hover:bg-[#fafafa]!
        last:border-b-0!
      "
    >
      <div
        className="
          flex!
          min-w-0!
          items-center!
          gap-3!
          px-3!
          py-3!
          sm:gap-4!
          sm:px-4!
          sm:py-3.5!
        "
      >
        {/* =================================================
            IMAGE
        ================================================= */}

        <Link
          to={`/dashboard/marketplace/${product.id}`}
          aria-label={`View ${product.name}`}
          className="
            relative!
            h-11!
            w-11!
            shrink-0!
            overflow-hidden!
            rounded-xl!
            border!
            border-gray-100!
            bg-[#fafafa]!
            sm:h-12!
            sm:w-12!
          "
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="
                h-full!
                w-full!
                object-cover!
                transition-transform!
                duration-200!
                group-hover:scale-[1.02]!
              "
            />
          ) : (
            <div className="flex! h-full! w-full! items-center! justify-center! text-gray-300!">
              <Package
                size={18}
                strokeWidth={1.5}
              />
            </div>
          )}
        </Link>

        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div className="min-w-0! flex-1!">
          <Link
            to={`/dashboard/marketplace/${product.id}`}
            className="block! min-w-0!"
          >
            <p
              className="
                truncate!
                text-[11px]!
                font-semibold!
                tracking-tight!
                text-gray-700!
                transition-colors!
                duration-150!
                group-hover:text-gray-900!
                sm:text-xs!
              "
            >
              {product.name}
            </p>
          </Link>

          <div
            className="
              mt-1!
              flex!
              min-w-0!
              items-center!
              gap-1.5!
            "
          >
            <span className="truncate! text-[9px]! font-medium! text-gray-400!">
              {product.category ||
                "Sans catégorie"}
            </span>

            {product.description && (
              <>
                <span className="shrink-0! text-[9px]! text-gray-300!">
                  ·
                </span>

                <span className="hidden! min-w-0! truncate! text-[9px]! font-medium! text-gray-400! xl:block!">
                  {product.description}
                </span>
              </>
            )}
          </div>
        </div>

        {/* =================================================
            PRICE
        ================================================= */}

        <div className="hidden! min-w-0! shrink-0! sm:block! sm:w-28!">
          <p className="flex! items-baseline! gap-1.5! truncate! text-xs! font-semibold! tracking-tight! text-gray-700!">
            <span className="truncate!">
              {formattedPrice}
            </span>

            <span className="shrink-0! text-[9px]! font-medium! text-gray-400!">
              {product.currency}
            </span>
          </p>
        </div>

        {/* =================================================
            SALES
        ================================================= */}

        <div className="hidden! shrink-0! lg:block! lg:w-16!">
          <p className="text-[11px]! font-semibold! text-gray-800!">
            {product.sales_count ??
              0}
          </p>
        </div>

        {/* =================================================
            VIEWS
        ================================================= */}

        <div className="hidden! shrink-0! lg:block! lg:w-16!">
          <p className="text-[11px]! font-semibold! text-gray-800!">
            {product.view_count ??
              0}
          </p>
        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        <div className="hidden! w-24! shrink-0! items-center! md:flex!">
          <div className="flex! items-center! gap-1.5!">
            <span
              className={`
                h-1.5!
                w-1.5!
                shrink-0!
                rounded-full!
                ${status.dot}
              `}
            />

            <span className="text-[9px]! font-medium! text-gray-500!">
              {status.label}
            </span>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          ref={menuRef}
          className="
            relative!
            flex!
            shrink-0!
            items-center!
            gap-0.5!
          "
        >
          {/* VIEW */}

          <Link
            to={`/dashboard/marketplace/${product.id}`}
            aria-label={`View ${product.name}`}
            className="
              inline-flex!
              h-8!
              w-8!
              items-center!
              justify-center!
              rounded-lg!
              text-gray-400!
              transition-colors!
              duration-150!
              hover:bg-gray-100!
              hover:text-gray-700!
              active:scale-[0.97]!
              sm:opacity-50!
              sm:group-hover:opacity-100!
            "
          >
            <Eye
              size={14}
              strokeWidth={1.8}
            />
          </Link>

          {/* MORE */}

          <button
            type="button"
            aria-label={`More actions for ${product.name}`}
            aria-expanded={
              isMenuOpen
            }
            onClick={() =>
              setIsMenuOpen(
                (current) =>
                  !current,
              )
            }
            className="
              inline-flex!
              h-8!
              w-8!
              items-center!
              justify-center!
              rounded-lg!
              text-gray-400!
              transition-colors!
              duration-150!
              hover:bg-gray-100!
              hover:text-gray-700!
              active:scale-[0.97]!
              sm:opacity-50!
              sm:group-hover:opacity-100!
            "
          >
            {isMenuOpen ? (
              <X
                size={14}
                strokeWidth={1.8}
              />
            ) : (
              <MoreHorizontal
                size={14}
                strokeWidth={1.8}
              />
            )}
          </button>

          {/* =================================================
              DROPDOWN
          ================================================= */}

          {isMenuOpen && (
            <div
              className="
                absolute!
                right-0!
                top-[calc(100%+6px)]!
                z-30!
                w-54!
                overflow-hidden!
                rounded-xl!
                border!
                border-gray-200!
                bg-white!
                p-2!
                shadow-lg!
              "
            >
              {/* VIEW PRODUCT */}

              <Link
                to={`/dashboard/marketplace/${product.id}`}
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="
                  flex!
                  w-full!
                  items-center!
                  gap-2!
                  rounded-lg!
                  px-2.5!
                  py-2!
                  text-left!
                  text-[12px]!
                  font-semibold!
                  text-gray-600!
                  transition-colors!
                  duration-150!
                  hover:bg-gray-50!
                  hover:text-gray-900!
                "
              >
             
                View product
              </Link>

              {/* EDIT */}

              <Link
                to={`/dashboard/marketplace/${product.id}/edit`}
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="
                  flex!
                  w-full!
                  items-center!
                  gap-2!
                  rounded-lg!
                  px-2.5!
                  py-2!
                  text-[12px]!
                  font-semibold!
                  text-gray-600!
                  transition-colors!
                  duration-150!
                  hover:bg-gray-50!
                  hover:text-gray-900!
                "
              >
              

                Modifier le produit
              </Link>

              <div className="my-1! h-px! bg-gray-100!" />

              {/* DELETE */}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete?.(product);
                }}
                className="
                  flex!
                  w-full!
                  items-center!
                  gap-2!
                  rounded-lg!
                  px-2.5!
                  py-2!
                  text-left!
                  text-[12px]!
                  font-semibold!
                  text-red-600!
                  transition-colors!
                  duration-150!
                  hover:bg-red-100!
                "
              >
                <Trash2
                  size={13}
                  strokeWidth={1.8}
                />

                Supprimer le produit
              </button>
            </div>
          )}
        </div>

        {/* =================================================
            MOBILE META
        ================================================= */}

        <div className="flex! min-w-0! shrink-0! md:hidden!">
          <div className="text-right!">
            <p className="truncate! text-xs! font-semibold! tracking-tight! text-gray-700!">
              {formattedPrice}{" "}
              <span className="text-[9px]! font-medium! text-gray-400!">
                {product.currency}
              </span>
            </p>

            <div className="mt-0.5! flex! items-center! justify-end! gap-1.5!">
              <span
                className={`
                  h-1.5!
                  w-1.5!
                  rounded-full!
                  ${status.dot}
                `}
              />

              <span className="text-[9px]! font-medium! text-gray-400!">
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductRow;

export {
  ProductRowSkeleton,
};