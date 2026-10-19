import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  createProductWithAssets,
} from "@/services/productsService";

import ProductHeader from "@/Pages/products/ProductHeader";
import ProductDetails from "@/Pages/products/ProductDetails";
import ProductPricing from "@/Pages/products/ProductPricing";
import ProductInventory from "@/Pages/products/ProductInventory";
import ProductShipping from "@/Pages/products/ProductShipping";
import ProductOptions from "@/Pages/products/ProductOptions";
import ProductImages from "@/Pages/products/ProductImages";
import DigitalFileUpload from "@/Pages/products/DigitalFileUpload";
import ProductPreview from "@/Pages/products/ProductPreview";
import ProductPublication from "@/Pages/products/ProductPublication";
import ProductActions from "@/Pages/products/ProductActions";
import ProductReviewModal from "@/Pages/products/ProductReviewModal";

/* =========================================================
   TYPES
========================================================= */

export type ProductType =
  | "physical"
  | "digital";

export type ProductStatus =
  | "published"
  | "draft";

export interface ProductImage {
  id: string;
  file: File;
  preview: string;
}

export interface ProductFormData {
  productType: ProductType;
  status: ProductStatus;

  productName: string;
  brand: string;
  category: string;
  description: string;

  price: string;
  comparePrice: string;

  sku: string;

  trackInventory: boolean;
  stock: string;

  weight: string;
  length: string;
  width: string;
  height: string;

  hasOptions: boolean;
  optionName: string;
  optionValues: string[];
}

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_DESCRIPTION_LENGTH = 1000;

const INITIAL_FORM: ProductFormData = {
  productType: "physical",
  status: "published",

  productName: "",
  brand: "",
  category: "Electronics",
  description: "",

  price: "",
  comparePrice: "",

  sku: "",

  trackInventory: true,
  stock: "0",

  weight: "",
  length: "",
  width: "",
  height: "",

  hasOptions: false,
  optionName: "Color",
  optionValues: [""],
};

/* =========================================================
   COMPONENT
========================================================= */

const ProductsNew = () => {
  const navigate = useNavigate();

  /* =======================================================
     REFS
  ======================================================= */

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const digitalFileInputRef =
    useRef<HTMLInputElement>(null);

  const imagesRef =
    useRef<ProductImage[]>([]);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [isLoading, setIsLoading] =
    useState(true);

  const [showReview, setShowReview] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  /* =======================================================
     ASSETS
  ======================================================= */

  const [images, setImages] =
    useState<ProductImage[]>([]);

  const [digitalFile, setDigitalFile] =
    useState<File | null>(null);

  /* =======================================================
     ERRORS
  ======================================================= */

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] =
    useState<ProductFormData>(
      INITIAL_FORM,
    );

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 650);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     KEEP IMAGE REF UPDATED
  ======================================================= */

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  /* =======================================================
     CLEANUP PREVIEW URLS
  ======================================================= */

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(
        (image) => {
          URL.revokeObjectURL(
            image.preview,
          );
        },
      );
    };
  }, []);

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateForm = <
    K extends keyof ProductFormData
  >(
    key: K,
    value: ProductFormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[key];

      return next;
    });
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    const nextErrors: Record<
      string,
      string
    > = {};

    /* ---------------- Product name ---------------- */

    if (!form.productName.trim()) {
      nextErrors.productName =
        "Product name is required.";
    }

    /* ---------------- Price ---------------- */

    if (!form.price.trim()) {
      nextErrors.price =
        "Price is required.";
    } else {
      const price = Number(
        form.price.replace(/\s/g, ""),
      );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        nextErrors.price =
          "Enter a valid price.";
      }
    }

    /* ---------------- Compare price ---------------- */

    if (form.comparePrice.trim()) {
      const price = Number(
        form.price.replace(/\s/g, ""),
      );

      const comparePrice = Number(
        form.comparePrice.replace(
          /\s/g,
          "",
        ),
      );

      if (
        !Number.isFinite(
          comparePrice,
        ) ||
        comparePrice < 0
      ) {
        nextErrors.comparePrice =
          "Enter a valid compare price.";
      } else if (
        Number.isFinite(price) &&
        comparePrice < price
      ) {
        nextErrors.comparePrice =
          "Compare price must be higher than the selling price.";
      }
    }

    /* ---------------- Description ---------------- */

    if (
      form.description.length >
      MAX_DESCRIPTION_LENGTH
    ) {
      nextErrors.description =
        "Description is too long.";
    }

    /* ---------------- Inventory ---------------- */

    if (
      form.productType === "physical" &&
      form.trackInventory
    ) {
      if (form.stock === "") {
        nextErrors.stock =
          "Stock is required.";
      } else {
        const stock = Number(
          form.stock,
        );

        if (
          !Number.isFinite(stock) ||
          stock < 0
        ) {
          nextErrors.stock =
            "Enter a valid stock quantity.";
        }
      }
    }

    /* ---------------- Options ---------------- */

    if (form.hasOptions) {
      const validOptions =
        form.optionValues.filter(
          (value) =>
            value.trim() !== "",
        );

      if (!form.optionName.trim()) {
        nextErrors.optionName =
          "Option name is required.";
      }

      if (!validOptions.length) {
        nextErrors.optionValues =
          "Add at least one value.";
      }
    }

    /* ---------------- Digital file ---------------- */

    if (
      form.productType === "digital" &&
      !digitalFile
    ) {
      nextErrors.digitalFile =
        "Please select a digital file.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors,
      ).length === 0
    );
  };

  /* =======================================================
     REVIEW
  ======================================================= */

  const handleReview = () => {
    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    setShowReview(true);
  };

  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    handleReview();
  };

  /* =======================================================
     CREATE PRODUCT
  ======================================================= */

  const handleCreate = async () => {
    if (isCreating) {
      return;
    }

    /* -----------------------------------------------
       Revalidate before creation
    ----------------------------------------------- */

    const isValid =
      validateForm();

    if (!isValid) {
      setShowReview(false);
      return;
    }

    setIsCreating(true);

    setErrors((current) => {
      const next = {
        ...current,
      };

      delete next.submit;

      return next;
    });

    try {
      /* ---------------------------------------------
         PRICE
      --------------------------------------------- */

      const price = Number(
        form.price.replace(
          /\s/g,
          "",
        ),
      );

      /* ---------------------------------------------
         ONLY SEND DB-SUPPORTED PRODUCT FIELDS
         
         Current products table supports:
         name
         slug
         description
         category
         price
         compare_price
         currency
         status
         sales_count
         view_count
         created_at
      --------------------------------------------- */

      const comparePrice =
        form.comparePrice.trim()
          ? Number(
              form.comparePrice.replace(
                /\s/g,
                "",
              ),
            )
          : null;

      const productData = {
        name: form.productName.trim(),

        description:
          form.description.trim() ||
          null,

        category:
          form.category.trim() ||
          null,

        price,

        compare_price:
          comparePrice,

        currency: "XOF",

        status: form.status,
      };

      /* ---------------------------------------------
         CREATE PRODUCT + ASSETS
      --------------------------------------------- */

      const createdProduct =
        await createProductWithAssets(
          productData,
          {
            images: images.map(
              (image) => image.file,
            ),

            digitalFile:
              form.productType ===
              "digital"
                ? digitalFile
                : null,
          },
        );

      console.log(
        "Product created successfully:",
        createdProduct,
      );

      /* ---------------------------------------------
         SUCCESS
      --------------------------------------------- */

      setShowReview(false);

      navigate(
        "/dashboard/marketplace",
      );
    } catch (error) {
      console.error(
        "Create product failed:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create the product.";

      setErrors({
        submit: message,
      });

      setShowReview(false);
    } finally {
      setIsCreating(false);
    }
  };

  /* =======================================================
     IMAGES
  ======================================================= */

  const handleImagesChange = (
    nextImages: ProductImage[],
  ) => {
    setImages(nextImages);

    setErrors((current) => {
      if (!current.images) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next.images;

      return next;
    });
  };

  /* =======================================================
     DIGITAL FILE
  ======================================================= */

  const handleDigitalFileChange = (
    file: File | null,
  ) => {
    setDigitalFile(file);

    setErrors((current) => {
      if (!current.digitalFile) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next.digitalFile;

      return next;
    });
  };

  /* =======================================================
     PAGE SKELETON
  ======================================================= */

  if (isLoading) {
    return (
      <ProductsNewSkeleton />
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <div
        className="
          min-h-screen!
          w-full!
          bg-[#fafafa]!
          px-3!
          py-3!
          sm:px-4!
          sm:py-5!
          lg:px-6!
          lg:py-6!
        "
      >
        <form
          onSubmit={handleSubmit}
          className="min-w-0! animate-in!"
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <ProductHeader
            status={form.status}
          />

          {/* =================================================
              SUBMIT ERROR
          ================================================= */}

          {errors.submit && (
            <div
              className="
                mt-4!
                flex!
                min-w-0!
                items-start!
                gap-2.5!
                rounded-xl!
                border!
                border-red-200!
                bg-red-50!
                px-3.5!
                py-3!
                text-[11px]!
                font-semibold!
                text-red-600!
                sm:px-4!
              "
            >
              <AlertCircle
                size={15}
                strokeWidth={1.9}
                className="mt-0.5! shrink-0!"
              />

              <p className="min-w-0! flex-1!">
                {errors.submit}
              </p>
            </div>
          )}

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div
            className="
              mt-4!
              grid!
              min-w-0!
              grid-cols-1!
              gap-4!
              sm:mt-5!
              lg:grid-cols-[minmax(0,1fr)_320px]!
              xl:grid-cols-[minmax(0,1fr)_350px]!
              lg:gap-5!
            "
          >
            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div
              className="
                min-w-0!
                space-y-4!
              "
            >
              {/* PRODUCT DETAILS */}

              <ProductDetails
                form={form}
                errors={errors}
                updateForm={
                  updateForm
                }
              />

              {/* PRICING */}

              <ProductPricing
                form={form}
                errors={errors}
                updateForm={
                  updateForm
                }
              />

              {/* PHYSICAL PRODUCT */}

              {form.productType ===
                "physical" && (
                <>
                  <ProductInventory
                    form={form}
                    errors={errors}
                    updateForm={
                      updateForm
                    }
                  />

                  <ProductShipping
                    form={form}
                    updateForm={
                      updateForm
                    }
                  />
                </>
              )}

              {/* OPTIONS */}

              <ProductOptions
                form={form}
                errors={errors}
                updateForm={
                  updateForm
                }
              />

              {/* IMAGES */}

              <ProductImages
                images={images}
                fileInputRef={
                  fileInputRef
                }
                errors={errors}
                onChange={
                  handleImagesChange
                }
              />

              {/* DIGITAL FILE */}

              {form.productType ===
                "digital" && (
                <DigitalFileUpload
                  file={
                    digitalFile
                  }
                  inputRef={
                    digitalFileInputRef
                  }
                  error={
                    errors.digitalFile
                  }
                  onChange={
                    handleDigitalFileChange
                  }
                />
              )}
            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <aside
              className="
                min-w-0!
                space-y-4!
                lg:sticky!
                lg:top-4!
                lg:self-start!
              "
            >
              {/* PREVIEW */}

              <ProductPreview
                form={form}
                images={images}
                digitalFile={
                  digitalFile
                }
              />

              {/* PUBLICATION */}

              <ProductPublication
                status={
                  form.status
                }
                onChange={(
                  status,
                ) =>
                  updateForm(
                    "status",
                    status,
                  )
                }
              />

              {/* ACTIONS */}

              <ProductActions
                isCreating={
                  isCreating
                }
                onReview={
                  handleReview
                }
              />
            </aside>
          </div>
        </form>
      </div>

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {showReview && (
        <ProductReviewModal
          form={form}
          images={images}
          digitalFile={
            digitalFile
          }
          isCreating={
            isCreating
          }
          onClose={() => {
            if (!isCreating) {
              setShowReview(
                false,
              );
            }
          }}
          onCreate={
            handleCreate
          }
        />
      )}
    </>
  );
};

/* =========================================================
   PAGE SKELETON
========================================================= */

const ProductsNewSkeleton =
  () => {
    return (
      <div
        className="
          min-h-screen!
          w-full!
          bg-[#fafafa]!
          px-3!
          py-3!
          sm:px-4!
          sm:py-5!
          lg:px-6!
          lg:py-6!
        "
      >
        {/* HEADER */}

        <div className="flex! min-w-0! items-center! justify-between! gap-3!">
          <div className="flex! min-w-0! items-center! gap-3!">
            <div className="skeleton! h-8! w-8! shrink-0! rounded-lg!" />

            <div className="min-w-0!">
              <div className="skeleton! h-3! w-24! rounded-md!" />
              <div className="skeleton! mt-1.5! h-5! w-36! rounded-md!" />
            </div>
          </div>

          <div className="flex! shrink-0! gap-2!">
            <div className="skeleton! h-9! w-20! rounded-lg!" />
            <div className="skeleton! h-9! w-24! rounded-lg!" />
          </div>
        </div>

        {/* GRID */}

        <div
          className="
            mt-5!
            grid!
            grid-cols-1!
            gap-4!
            lg:grid-cols-[minmax(0,1fr)_320px]!
            xl:grid-cols-[minmax(0,1fr)_350px]!
            lg:gap-5!
          "
        >
          {/* LEFT */}

          <div className="min-w-0! space-y-4!">
            <PageSkeletonCard
              titleWidth="w-28!"
              descriptionWidth="w-64!"
              rows={4}
            />

            <PageSkeletonCard
              titleWidth="w-20!"
              descriptionWidth="w-52!"
              rows={2}
            />

            <PageSkeletonCard
              titleWidth="w-24!"
              descriptionWidth="w-60!"
              rows={2}
            />

            <PageSkeletonCard
              titleWidth="w-20!"
              descriptionWidth="w-56!"
              rows={3}
            />

            <div className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
              <div className="flex! items-start! gap-3!">
                <div className="skeleton! h-9! w-9! shrink-0! rounded-xl!" />

                <div className="min-w-0! flex-1!">
                  <div className="skeleton! h-4! w-28! rounded-md!" />
                  <div className="skeleton! mt-1.5! h-3! w-64! max-w-full! rounded-md!" />
                </div>
              </div>

              <div className="skeleton! mt-4! h-40! w-full! rounded-2xl!" />
            </div>
          </div>

          {/* RIGHT */}

          <div className="min-w-0! space-y-4!">
            <div className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
              <div className="flex! items-start! justify-between!">
                <div>
                  <div className="skeleton! h-3! w-20! rounded-md!" />
                  <div className="skeleton! mt-1.5! h-4! w-32! rounded-md!" />
                </div>

                <div className="skeleton! h-6! w-14! rounded-full!" />
              </div>

              <div className="skeleton! mt-4! h-20! w-full! rounded-2xl!" />

              <div className="mt-4! space-y-4!">
                <div className="flex! justify-between!">
                  <div className="skeleton! h-3! w-16! rounded-md!" />
                  <div className="skeleton! h-3! w-24! rounded-md!" />
                </div>

                <div className="flex! justify-between!">
                  <div className="skeleton! h-3! w-20! rounded-md!" />
                  <div className="skeleton! h-3! w-20! rounded-md!" />
                </div>

                <div className="flex! justify-between!">
                  <div className="skeleton! h-3! w-16! rounded-md!" />
                  <div className="skeleton! h-3! w-14! rounded-md!" />
                </div>
              </div>

              <div className="mt-4! border-t! border-gray-100! pt-4!">
                <div className="flex! justify-between!">
                  <div className="skeleton! h-3! w-20! rounded-md!" />
                  <div className="skeleton! h-3! w-8! rounded-md!" />
                </div>

                <div className="skeleton! mt-2.5! h-1.5! w-full! rounded-full!" />
              </div>
            </div>

            <div className="rounded-2xl! border! border-gray-200! bg-white! p-4!">
              <div className="skeleton! h-4! w-24! rounded-md!" />
              <div className="skeleton! mt-1.5! h-3! w-48! rounded-md!" />

              <div className="mt-4! space-y-2!">
                <div className="skeleton! h-14! w-full! rounded-xl!" />
                <div className="skeleton! h-14! w-full! rounded-xl!" />
              </div>
            </div>

            <div className="rounded-2xl! border! border-gray-200! bg-white! p-4!">
              <div className="skeleton! h-11! w-full! rounded-lg!" />
              <div className="skeleton! mt-2! h-10! w-full! rounded-lg!" />
            </div>
          </div>
        </div>
      </div>
    );
  };

/* =========================================================
   SKELETON CARD
========================================================= */

const PageSkeletonCard = ({
  titleWidth,
  descriptionWidth,
  rows,
}: {
  titleWidth: string;
  descriptionWidth: string;
  rows: number;
}) => {
  return (
    <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
      <div className="flex! items-start! gap-3!">
        <div className="skeleton! h-9! w-9! shrink-0! rounded-xl!" />

        <div className="min-w-0! flex-1!">
          <div
            className={`skeleton! h-4! ${titleWidth} rounded-md!`}
          />

          <div
            className={`skeleton! mt-1.5! h-3! ${descriptionWidth} max-w-full! rounded-md!`}
          />
        </div>
      </div>

      <div className="mt-4! grid! grid-cols-1! gap-3! sm:grid-cols-2!">
        {Array.from({
          length: rows,
        }).map((_, index) => (
          <div
            key={index}
            className={
              index ===
              rows - 1
                ? "sm:col-span-2!"
                : ""
            }
          >
            <div className="skeleton! mb-1.5! h-3! w-20! rounded-md!" />
            <div className="skeleton! h-10! w-full! rounded-lg!" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsNew;