import {
  ArrowLeft,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  getMarketplaceProductById,
  type MarketplaceProduct,
} from "./marketplace.service";

const ProductDetailsSkeleton = () => {
  return (
    <div className="min-w-0!">
      {/* Top navigation */}
      <div className="mb-5! flex! items-center! justify-between! gap-3!">
        <div className="skeleton! h-3! w-24!" />
        <div className="skeleton! h-9! w-28! rounded-lg!" />
      </div>

      <div className="grid! min-w-0! gap-6! lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
        {/* Main */}
        <div className="min-w-0!">
          <div className="skeleton! aspect-[16/10]! w-full! rounded-2xl!" />

          <div className="mt-5!">
            <div className="skeleton! h-7! w-2/5!" />
            <div className="skeleton! mt-3! h-3! w-24!" />
          </div>

          <div className="mt-8! border-t! border-gray-100! pt-6!">
            <div className="skeleton! h-4! w-24!" />
            <div className="skeleton! mt-4! h-3! w-full!" />
            <div className="skeleton! mt-2! h-3! w-5/6!" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="min-w-0! space-y-4!">
          <div className="rounded-2xl! border! border-gray-200! bg-white! p-5!">
            <div className="skeleton! h-3! w-20!" />
            <div className="skeleton! mt-4! h-8! w-24!" />
          </div>

          <div className="rounded-2xl! border! border-gray-200! bg-white! p-5!">
            <div className="skeleton! h-3! w-28!" />

            <div className="mt-5! space-y-4!">
              <div className="flex! items-center! justify-between!">
                <div className="skeleton! h-2.5! w-16!" />
                <div className="skeleton! h-2.5! w-20!" />
              </div>

              <div className="flex! items-center! justify-between!">
                <div className="skeleton! h-2.5! w-16!" />
                <div className="skeleton! h-2.5! w-12!" />
              </div>

              <div className="flex! items-center! justify-between!">
                <div className="skeleton! h-2.5! w-16!" />
                <div className="skeleton! h-2.5! w-14!" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (date?: string) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const MarketplaceProductDetails = () => {
  const { productId } = useParams<{
    productId: string;
  }>();

  const [product, setProduct] = useState<MarketplaceProduct | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!productId) {
        setError("Produit introuvable.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await getMarketplaceProductById(productId);

        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Nous ne pouvons pas charger ce produit pour le moment.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex! min-h-[420px]! items-center! justify-center!">
        <div className="w-full! max-w-md! rounded-2xl! border! border-gray-200! bg-white! p-6! text-center!">
          <div className="mx-auto! flex! h-10! w-10! items-center! justify-center! rounded-xl! bg-gray-50!">
            <Tag className="h-4! w-4! text-gray-500!" />
          </div>

          <h2 className="mt-4! text-sm! font-semibold! text-gray-900!">
            Produit indisponible
          </h2>

          <p className="mt-2! text-xs! leading-5! text-gray-500!">
            {error || "Ce produit est introuvable."}
          </p>

          <Link
            to="/dashboard/marketplace"
            className="
              mt-5!
              inline-flex!
              items-center!
              gap-2!
              rounded-lg!
              border!
              border-gray-200!
              bg-white!
              px-3!
              py-2!
              text-xs!
              font-medium!
              text-gray-700!
              transition!
              duration-150!
              hover:border-gray-300!
              hover:bg-gray-50!
            "
          >
            <ArrowLeft className="h-3.5! w-3.5!" />
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

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

  const status = statusConfig[product.status];

  return (
    <div className="min-w-0! pb-8! bg-[#fafafa] px-4! pt-6! sm:px-6! lg:px-8!">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6! flex! min-w-0! items-center! justify-between! gap-4!">
        <Link
          to="/dashboard/marketplace"
          className="
            inline-flex!
            min-w-0!
            items-center!
            gap-2!
            text-xs!
            font-medium!
            text-gray-500!
            transition!
            duration-150!
            hover:text-gray-900!
          "
        >
          <ArrowLeft className="h-3.5! w-3.5! shrink-0!" />
          <span className="truncate!">Catalogue de produits</span>
        </Link>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          grid!
          min-w-0!
          gap-6!
          lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]!
        "
      >
        {/* =================================================
            MAIN COLUMN
        ================================================= */}

        <main className="min-w-0!">
          {/* HERO IMAGE */}

          <div
            className="
              overflow-hidden!
              rounded-xl!
              border!
              border-gray-200!
              bg-[#fafafa]!
            "
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="
                  block!
                  aspect-16/10!
                  w-full!
                  object-cover!
                "
              />
            ) : (
              <div
                className="
                  flex!
                  aspect-[16/10]!
                  w-full!
                  items-center!
                  justify-center!
                  bg-gray-50!
                "
              >
                <ImageIcon className="h-6! w-6! text-gray-300!" />
              </div>
            )}
          </div>

          {/* PRODUCT HEADING */}

       

          {/* DESCRIPTION */}

          <section className="mt-4! border-t! border-gray-100! pt-6!">
            <h2 className="text-sm! font-semibold! text-gray-900!">
              Description
            </h2>

            {product.description ? (
              <p className="mt-3! max-w-3xl! whitespace-pre-line! text-[13px]! leading-6! text-gray-600!">
                {product.description}
              </p>
            ) : (
              <p className="mt-3! text-xs! text-gray-400!">
                No description has been added.
              </p>
            )}
          </section>
        </main>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="min-w-0! space-y-4!">
          {/* PRICE */}

          {/* PRODUCT INFORMATION */}

          <section className="rounded-2xl! border! border-gray-200! bg-white! p-5!">
            <div className="flex! items-center! gap-2!">
              <div>
                <h2 className="text-sm! font-semibold! text-gray-900!">
                  Informations sur le produit
                </h2>

                <p className="mt-0.5! text-[10px]! text-gray-400!">
                  Informations générales
                </p>
              </div>
            </div>

            <div className="mt-5! divide-y! divide-gray-100!">


              <div className="flex! items-center! justify-between! gap-4! py-3! first:pt-0!">
                <span className="text-xs! text-gray-500!">Nom</span>

                <span className="truncate! text-right! text-xs! font-medium! text-gray-900!">
                  {product.name}
                </span>
              </div>



              <div className="flex! items-center! justify-between! gap-4! py-3! first:pt-0!">
                <span className="text-xs! text-gray-500!">Catégorie</span>

                <span className="truncate! text-right! text-xs! font-medium! text-gray-900!">
                  {product.category || "—"}
                </span>
              </div>

              <div className="flex! items-center! justify-between! gap-4! py-3!">
                <span className="text-xs! text-gray-500!">Statut</span>

                <span className="inline-flex! items-center! gap-1.5! text-xs! font-medium! text-gray-900!">
                  <span
                    className={`h-1.5! w-1.5! rounded-full! ${status.dot}`}
                  />
                  {status.label}
                </span>
              </div>

<div className="flex! items-center! justify-between! gap-4! py-3!">
                <span className="text-xs! text-gray-500!">Prix</span>

                <span className="text-xs! font-medium! text-gray-900!">
                  {product.price}
                </span>
              </div>
              <div className="flex! items-center! justify-between! gap-4! py-3!">
                <span className="text-xs! text-gray-500!">Devise</span>

                <span className="text-xs! font-medium! text-gray-900!">
                  {product.currency}
                </span>
              </div>
              <div className="flex! items-center! justify-between! gap-4! py-3!">
                <span className="text-xs! text-gray-500!">Ventes</span>

                <span className="text-xs! font-medium! text-gray-900!">
                  {product.sales_count}
                </span>
              </div>



              <div className="flex! items-center! justify-between! gap-4! py-3!">
                <span className="text-xs! text-gray-500!">Vues</span>

                <span className="text-xs! font-medium! text-gray-900!">
                  {product.view_count}
                </span>
              </div>

              <div className="flex! items-center! justify-between! gap-4! py-3! last:pb-0!">
                <span className="inline-flex! items-center! gap-1.5! text-xs! text-gray-500!">
                  Créé le
                </span>

                <span className="text-right! text-xs! font-medium! text-gray-900!">
                  {formatDate(product.created_at)}
                </span>
              </div>
            </div>
          </section>

          {/* PERFORMANCE */}
        </aside>
      </div>
    </div>
  );
};

export default MarketplaceProductDetails;
