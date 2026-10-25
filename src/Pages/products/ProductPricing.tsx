import {
  Tag,
} from "lucide-react";

import type {
  ProductFormData,
} from "./ProductsNew";

type ProductPricingProps = {
  form: ProductFormData;
  errors: Record<string, string>;
  updateForm: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => void;
  loading?: boolean;
};

const ProductPricingSkeleton = () => {
  return (
    <section
      className="
        overflow-hidden!
        rounded-2xl!
        border!
        border-gray-200!
        bg-white!
      "
    >
      <div className="border-b! border-gray-100! px-4! py-3.5! sm:px-5!">
        <div className="skeleton h-4! w-20! rounded-md!" />
        <div className="skeleton mt-1.5! h-2.5! w-48! max-w-full! rounded-md!" />
      </div>

      <div className="space-y-4! p-4! sm:p-5!">
        <div className="grid! gap-4! sm:grid-cols-2!">
          <div>
            <div className="skeleton mb-2! h-2.5! w-12!" />
            <div className="skeleton h-10! rounded-lg!" />
          </div>

          <div>
            <div className="skeleton mb-2! h-2.5! w-28!" />
            <div className="skeleton h-10! rounded-lg!" />
          </div>
        </div>

        <div className="skeleton h-12! rounded-xl!" />
      </div>
    </section>
  );
};

const ProductPricing = ({
  form,
  errors,
  updateForm,
  loading = false,
}: ProductPricingProps) => {
  if (loading) {
    return <ProductPricingSkeleton />;
  }

  return (
    <section
      className="
        overflow-hidden!
        rounded-2xl!
        border!
        border-gray-200!
        bg-white!
      "
    >
      {/* HEADER */}

      <div
        className="
          border-b!
          border-gray-100!
          px-4!
          py-3.5!
          sm:px-5!
        "
      >
        <div className="flex! items-center! gap-1.5!">
        
          <h2
            className="
              text-[14px]!
              font-semibold!
              tracking-tight!
              text-gray-900!
            "
          >
            Pricing
          </h2>
        </div>

        <p
          className="
            mt-0.5!
            text-[10px]!
            font-medium!
            text-gray-500!
            sm:text-[11px]!
          "
        >
          Définissez le prix de vente de votre produit.
        </p>
      </div>

      {/* CONTENT */}

      <div className="space-y-4! p-4! sm:p-5!">
        <div className="grid! gap-4! sm:grid-cols-2!">
          {/* PRICE */}

          <PriceField
            id="product-price"
            label="Prix"
            value={form.price}
            placeholder="0"
            error={errors.price}
            onChange={(value) =>
              updateForm("price", value)
            }
          />

          {/* COMPARE PRICE */}

          <PriceField
            id="product-compare-price"
            label={
              <>
                Compare at price{" "}
                <span className="font-medium! text-gray-400!">
                  (Optional)
                </span>
              </>
            }
            value={form.comparePrice}
            placeholder="0"
            onChange={(value) =>
              updateForm(
                "comparePrice",
                value,
              )
            }
          />
        </div>

        {/* HINT */}

        <div
          className="
            flex!
            min-w-0!
            items-center!
            gap-2!
            rounded-xl!
            border!
            border-gray-100!
            bg-[#fafafa]!
            px-3!
            py-2.5!
          "
        >
          <Tag
            size={12}
            strokeWidth={1.8}
            className="shrink-0! text-gray-400!"
          />

          <p
            className="
              min-w-0!
              text-[9px]!
              font-medium!
              leading-4!
              text-gray-500!
            "
          >
            Prices are displayed in XOF.
          </p>
        </div>
      </div>
    </section>
  );
};

const PriceField = ({
  id,
  label,
  value,
  placeholder,
  error,
  onChange,
}: {
  id: string;
  label: React.ReactNode;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="min-w-0!">
      <label
        htmlFor={id}
        className="
          mb-1.5!
          block!
          text-[11px]!
          font-semibold!
          text-gray-700!
        "
      >
        {label}
      </label>

      <div className="relative!">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="
            h-10!
            w-full!
            min-w-0!
            rounded-lg!
            border!
            border-gray-200!
            bg-white!
            px-3!
            pr-12!
            text-[12px]!
            font-semibold!
            tabular-nums!
            text-gray-900!
            outline-none!
            transition-all!
            duration-150!
            placeholder:font-medium!
            placeholder:text-gray-400!
            focus:border-gray-300!                                            focus:ring-2!                                                             focus:ring-gray-900/5!
          "
        />

        <span
          className="
            pointer-events-none!
            absolute!
            right-3!
            top-1/2!
            -translate-y-1/2!
            text-[8px]!
            font-semibold!
            uppercase!
            tracking-wide!
            text-gray-400!
          "
        >
          XOF
        </span>
      </div>

      {error && (
        <p className="mt-1.5! text-[9px]! font-medium! text-red-500!">
          {error}
        </p>
      )}
    </div>
  );
};

export default ProductPricing;