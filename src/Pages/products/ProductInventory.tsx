import {
  Hash,
} from "lucide-react";

import type {
  ProductFormData,
} from "./ProductsNew";

type ProductInventoryProps = {
  form: ProductFormData;
  errors: Record<string, string>;
  updateForm: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => void;
  loading?: boolean;
};

const ProductInventorySkeleton = () => {
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
        <div className="skeleton h-4! w-24! rounded-md!" />
        <div className="skeleton mt-1.5! h-2.5! w-48! max-w-full! rounded-md!" />
      </div>

      <div className="space-y-4! p-4! sm:p-5!">
        <div className="skeleton h-11! rounded-xl!" />

        <div className="grid! gap-4! sm:grid-cols-2!">
          <div>
            <div className="skeleton mb-2! h-2.5! w-12!" />
            <div className="skeleton h-10! rounded-lg!" />
          </div>

          <div>
            <div className="skeleton mb-2! h-2.5! w-24!" />
            <div className="skeleton h-10! rounded-lg!" />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductInventory = ({
  form,
  errors,
  updateForm,
  loading = false,
}: ProductInventoryProps) => {
  if (loading) {
    return <ProductInventorySkeleton />;
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
            Stock et références
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
          Suivez les quantités disponibles et les références de vos produits.
        </p>
      </div>

      {/* CONTENT */}

      <div className="space-y-4! p-4! sm:p-5!">
        {/* TRACK INVENTORY */}

        <div
          className={`
            flex!
            min-w-0!
            items-center!
            justify-between!
            gap-3!
            rounded-xl!
            border!
            px-3!
            py-2.5!
            transition-colors!
            duration-150!
            ${
              form.trackInventory
                ? "border-blue-100! bg-blue-50/30!"
                : "border-gray-200! bg-[#fafafa]!"
            }
          `}
        >
          <div className="flex! min-w-0! items-center! gap-2.5!">
          

            <div className="min-w-0!">
              <p
                className="
                  truncate!
                  text-[11px]!
                  font-semibold!
                  text-gray-900!
                "
              >
                Suivre le stock
              </p>

              <p
                className="
                  mt-0.5!
                  truncate!
                  text-[9px]!
                  font-medium!
                  text-gray-500!
                "
              >
                Suivez le nombre d’unités disponibles.
              </p>
            </div>
          </div>

       <button
  type="button"
  role="switch"
  aria-checked={form.trackInventory}
  aria-label="Suivre le stock"
  onClick={() =>
    updateForm(
      "trackInventory",
      !form.trackInventory,
    )
  }
  className={`
    relative!
    h-6!
    w-10!
    shrink-0!
    rounded-full!
    transition-colors!
    duration-150!
    focus:outline-none!
    focus:ring-2!
      focus:ring-blue-500/20!    ${
         form.trackInventory

                  ? "bg-blue-600!"

                  : "bg-gray-300!"
    }
  `}
>
  <span
    className={`
      absolute!
      left-0.5!
      top-0.5!
      h-5!
      w-5!
      rounded-full!
      bg-white!
      shadow-sm!
      transition!
      duration-150!
      ${
        form.trackInventory
          ? "translate-x-4!"
          : "translate-x-0!"
      }
    `}
  />
</button>
        </div>

        {/* STOCK + SKU */}

        <div className="grid! gap-4! sm:grid-cols-2!">
          <Field
            id="product-stock"
            label="Quantité en stock"
            value={form.stock}
            placeholder="0"
            type="number"
            disabled={!form.trackInventory}
            error={errors.stock}
            onChange={(value) =>
              updateForm("stock", value)
            }
          />

          <Field
            id="product-sku"
            label={
              <>
                SKU{" "}
                <span className="font-medium! text-gray-400!">
                  (Optional)
                </span>
              </>
            }
            value={form.sku}
            placeholder="SKU-001"
            icon={
              <Hash
                size={12}
                strokeWidth={1.8}
              />
            }
            onChange={(value) =>
              updateForm("sku", value)
            }
          />
        </div>

        {!form.trackInventory && (
          <div
            className="
              flex!
              items-center!
              gap-2!
              text-[9px]!
              font-medium!
              text-gray-500!
            "
          >
            <span className="h-1.5! w-1.5! shrink-0! rounded-full! bg-gray-300!" />
            Inventory tracking is disabled for this product.
          </div>
        )}
      </div>
    </section>
  );
};

const Field = ({
  id,
  label,
  value,
  placeholder,
  type = "text",
  icon,
  disabled = false,
  error,
  onChange,
}: {
  id: string;
  label: React.ReactNode;
  value: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
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
        {icon && (
          <span
            className="
              pointer-events-none!
              absolute!
              left-3!
              top-1/2!
              -translate-y-1/2!
              text-gray-400!
            "
          >
            {icon}
          </span>
        )}

        <input
          id={id}
          type={type}
          inputMode={
            type === "number"
              ? "numeric"
              : undefined
          }
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className={`
            h-10!
            w-full!
            min-w-0!
            rounded-lg!
            border!
            border-gray-200!
            bg-white!
            ${
              icon
                ? "pl-8! pr-3!"
                : "px-3!"
            }
            text-[11px]!
            font-medium!
            text-gray-900!
            outline-none!
            transition-all!
            duration-150!
            placeholder:text-gray-400!
            focus:border-gray-300!                                            focus:ring-2!                                                             focus:ring-gray-900/5!
            disabled:cursor-not-allowed!
            disabled:bg-gray-50!
            disabled:text-gray-400!
          `}
        />
      </div>

      {error && (
        <p className="mt-1.5! text-[9px]! font-medium! text-red-500!">
          {error}
        </p>
      )}
    </div>
  );
};

export default ProductInventory;