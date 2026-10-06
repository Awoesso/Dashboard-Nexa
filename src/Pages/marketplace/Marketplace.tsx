import {
  useCallback,
  useEffect,
  useState,
} from "react";


import MarketplaceHeader from "./MarketplaceHeader";
import MarketplaceToolbar from "./MarketplaceToolbar";
import MarketplaceList from "./MarketplaceList";
import MarketplaceEmptyState from "./MarketplaceEmptyState";
import MarketplaceErrorState from "./MarketplaceErrorState";
import ProductDeleteModal from "./ProductDeleteModal";
import { supabase } from "@/lib/supabase";

import type {
  MarketplaceProduct,
} from "./ProductRow";

import {
  deleteMarketplaceProduct,
  getMarketplaceProducts,
} from "./marketplace.service";

/* =========================================================
   COMPONENT
========================================================= */

const Marketplace = () => {
  const [products, setProducts] = useState<
    MarketplaceProduct[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    sortBy,
    setSortBy,
  ] = useState("newest");

  const [
    productToDelete,
    setProductToDelete,
  ] = useState<
    MarketplaceProduct | null
  >(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadProducts = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);

        const data =
          await getMarketplaceProducts();

        setProducts(data);
      } catch (err) {
        console.error(
          "Marketplace load failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load products.",
        );
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadProducts();
    });
  }, [loadProducts]);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        void loadProducts(false);
      }, 250);
    };

    const channel = supabase
      .channel("marketplace-delivered-sales")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      void supabase.removeChannel(channel);
    };
  }, [loadProducts]);

  /* =======================================================
     DELETE REQUEST
  ======================================================= */

  const handleDeleteRequest = (
    product: MarketplaceProduct,
  ) => {
    setProductToDelete(product);
  };

  /* =======================================================
     DELETE CONFIRM
  ======================================================= */

  const handleDeleteConfirm =
    async () => {
      if (
        !productToDelete ||
        isDeleting
      ) {
        return;
      }

      try {
        setIsDeleting(true);

        await deleteMarketplaceProduct(
          productToDelete.id,
        );

        setProducts(
          (current) =>
            current.filter(
              (product) =>
                product.id !==
                productToDelete.id,
            ),
        );

        setProductToDelete(null);
      } catch (err) {
        console.error(
          "Delete product failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to delete the product.",
        );
      } finally {
        setIsDeleting(false);
      }
    };

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredProducts =
    products
      .filter((product) => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        return (
          product.name
            .toLowerCase()
            .includes(query) ||
          product.category
            ?.toLowerCase()
            .includes(query) ||
          product.description
            ?.toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "oldest":
            return (
              new Date(
                a.created_at || "",
              ).getTime() -
              new Date(
                b.created_at || "",
              ).getTime()
            );

          case "price-high":
            return (
              b.price - a.price
            );

          case "price-low":
            return (
              a.price - b.price
            );

          case "name":
            return a.name.localeCompare(
              b.name,
            );

          case "newest":
          default:
            return (
              new Date(
                b.created_at || "",
              ).getTime() -
              new Date(
                a.created_at || "",
              ).getTime()
            );
        }
      });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <div
        className="
          min-h-full!
          w-full!
          min-w-0!
          bg-[#fafafa]!
        "
      >
        <div
          className="
            mx-auto!
            w-full!
            max-w-[1400px]!
            px-3!
            py-3!
            sm:px-4!
            sm:py-5!
            lg:px-6!
            lg:py-6!
          "
        >
          {/* HEADER */}

          <MarketplaceHeader />

          {/* TOOLBAR */}

          <div className="mt-5!">
            <MarketplaceToolbar
              search={searchQuery}
              sort={sortBy}
              onSearchChange={setSearchQuery}
              onSortChange={setSortBy}
            />
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-4!">
              <MarketplaceErrorState
                message={error}
                onRetry={
                  loadProducts
                }
              />
            </div>
          )}

          {/* CONTENT */}

          {!error && (
            <div className="mt-5!">
              {!isLoading &&
              products.length ===
                0 ? (
                <MarketplaceEmptyState />
              ) : (
                <MarketplaceList
                  products={
                    filteredProducts
                  }
                  isLoading={
                    isLoading
                  }
                  onDelete={
                    handleDeleteRequest
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}

      {productToDelete && (
        <ProductDeleteModal
          productName={
            productToDelete.name
          }
          isDeleting={
            isDeleting
          }
          onClose={() => {
            if (!isDeleting) {
              setProductToDelete(
                null,
              );
            }
          }}
          onConfirm={
            handleDeleteConfirm
          }
        />
      )}
    </>
  );
};

export default Marketplace;