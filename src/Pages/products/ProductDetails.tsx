import {
  Box,
  ChevronDown,
  FileText,

} from "lucide-react";

import type {
  ProductFormData,
} from "./ProductsNew";

type ProductDetailsProps = {
  form: ProductFormData;
  errors: Record<string, string>;
  updateForm: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => void;
  loading?: boolean;
};

const ProductDetailsSkeleton = () => {
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
      <div
        className="
          border-b!
          border-gray-100!
          px-4!
          py-3.5!
          sm:px-5!
        "
      >
        <div className="skeleton h-4! w-28! rounded-md!" />
        <div className="skeleton mt-1.5! h-2.5! w-48! max-w-full! rounded-md!" />
      </div>

      <div className="space-y-5! p-4! sm:p-5!">
        <div>
          <div className="skeleton mb-2! h-2.5! w-20!" />

          <div className="grid! grid-cols-2! gap-2.5!">
            <div className="skeleton h-16! rounded-xl!" />
            <div className="skeleton h-16! rounded-xl!" />
          </div>
        </div>

        <div className="grid! gap-4! sm:grid-cols-2!">
          <div>
            <div className="skeleton mb-2! h-2.5! w-24!" />
            <div className="skeleton h-10! rounded-lg!" />
          </div>

          <div>
            <div className="skeleton mb-2! h-2.5! w-20!" />
            <div className="skeleton h-10! rounded-lg!" />
          </div>
        </div>

        <div>
          <div className="skeleton mb-2! h-2.5! w-16!" />
          <div className="skeleton h-10! rounded-lg!" />
        </div>

        <div>
          <div className="skeleton mb-2! h-2.5! w-24!" />
          <div className="skeleton h-28! rounded-xl!" />
        </div>
      </div>
    </section>
  );
};

const inputClass = `
  h-10!
  w-full!
  min-w-0!
  rounded-lg!
  border!
  border-gray-200!
  bg-white!
  px-3!
  text-[11px]!
  font-medium!
  text-gray-900!
  outline-none!
  transition-all!
  duration-150!
  placeholder:text-gray-400!
  focus:border-gray-300!                   focus:ring-2!                   focus:ring-gray-900/5!
`;

const ProductDetails = ({
  form,
  errors,
  updateForm,
  loading = false,
}: ProductDetailsProps) => {
  if (loading) {
    return <ProductDetailsSkeleton />;
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

    
      {/* CONTENT */}

      <div className="space-y-5! p-4! sm:p-5!">
        {/* PRODUCT TYPE */}

        <div>
          <div className="mb-2! flex! items-center! gap-1.5!">
         

            <label className="text-[11px]! font-semibold! text-gray-700!">
              Type de produit
            </label>
          </div>

          <div className="grid! grid-cols-2! gap-2.5!">
            <TypeOption
              active={form.productType === "physical"}
              icon={<Box size={15} strokeWidth={1.8} />}
              title="Physique"
              description="Livré à vos clients"
              onClick={() =>
                updateForm(
                  "productType",
                  "physical",
                )
              }
            />

            <TypeOption
              active={form.productType === "digital"}
              icon={
                <FileText
                  size={15}
                  strokeWidth={1.8}
                />
              }
              title="Numérique"
              description="Fourni sous forme de fichier"
              onClick={() =>
                updateForm(
                  "productType",
                  "digital",
                )
              }
            />
          </div>
        </div>

        {/* NAME + CATEGORY */}

        <div className="grid! min-w-0! gap-4! sm:grid-cols-2!">
          <Field
            id="product-name"
            label="Nom du produit"
            value={form.productName}
            placeholder="Exemple : sac en cuir"
            error={errors.productName}
            onChange={(value) =>
              updateForm("productName", value)
            }
          />

          <div className="min-w-0!">
            <label
              htmlFor="product-category"
              className="
                mb-1.5!
                block!
                text-[11px]!
                font-semibold!
                text-gray-700!
              "
            >
              Catégorie
            </label>

            <div className="relative!">
              <select
                id="product-category"
                value={form.category}
                onChange={(event) =>
                  updateForm(
                    "category",
                    event.target.value,
                  )
                }
                className={`${inputClass} appearance-none! pr-9!`}
              >
                <option value="">
                  Sélectionnez une catégorie
                </option>

                <option value="Electronics">
                  Électronique
                </option>

                <option value="Fashion">
                  Mode
                </option>

                <option value="Books">
                  Livres
                </option>

                <option value="Home">
                  Maison
                </option>

                <option value="Beauty">
                  Beauté
                </option>

                <option value="Sports">
                  Sport
                </option>

                <option value="Accessories">
                  Accessoires
                </option>

                <option value="Digital">
                  Numérique
                </option>

                <option value="Other">
                  Autre
                </option>
              </select>

              <ChevronDown
                size={13}
                strokeWidth={1.8}
                className="
                  pointer-events-none!
                  absolute!
                  right-3!
                  top-1/2!
                  -translate-y-1/2!
                  text-gray-400!
                "
              />
            </div>

            {errors.category && (
              <ErrorText>
                {errors.category}
              </ErrorText>
            )}
          </div>
        </div>

        {/* BRAND */}

        <Field
          id="product-brand"
          label={
            <>
              Marque{" "}
              <span className="font-medium! text-gray-400!">
                (Facultatif)
              </span>
            </>
          }
          value={form.brand}
          placeholder="Exemple : Samsung, Apple…"
          onChange={(value) =>
            updateForm("brand", value)
          }
        />

        {/* DESCRIPTION */}

        <div className="min-w-0!">
          <div className="mb-1.5! flex! items-center! justify-between! gap-3!">
            <div className="flex! items-center! gap-1.5!">
             

              <label
                htmlFor="product-description"
                className="
                  text-[11px]!
                  font-semibold!
                  text-gray-700!
                "
              >
                Description
              </label>
            </div>

            <span
              className="
                shrink-0!
                text-[9px]!
                font-medium!
                tabular-nums!
                text-gray-400!
              "
            >
              {form.description.length}/1000
            </span>
          </div>

          <textarea
            id="product-description"
            value={form.description}
            onChange={(event) =>
              updateForm(
                "description",
                event.target.value,
              )
            }
            placeholder="Décrivez votre produit…"
            rows={6}
            className="
              w-full!
              min-w-0!
              resize-none!
              rounded-lg!
              border!
              border-gray-200!
              bg-{#fafafa}!
              px-3!
              py-2.5!
              text-[11px]!
              font-medium!
              leading-5!
              text-gray-900!
              outline-none!
              transition-all!
              duration-150!
              placeholder:text-gray-400!
            focus:border-gray-300! 
                             
            focus:ring-2!   
                                            
            focus:ring-gray-900/5!
            "
          />

          {errors.description && (
            <ErrorText>
              {errors.description}
            </ErrorText>
          )}
        </div>
      </div>
    </section>
  );
};

const Field = ({
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
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={inputClass}
        />
      </div>

      {error && (
        <ErrorText>{error}</ErrorText>
      )}
    </div>
  );
};

const TypeOption = ({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        flex!
        min-w-0!
        items-center!
        gap-2.5!
        rounded-xl!
        border!
        px-3!
        py-3!
        text-left!
        transition-all!
        duration-150!
        active:scale-[0.995]!
        ${
          active
            ? "border-blue-500! bg-blue-50/40!"
            : "border-gray-200! bg-[#fafafa]! hover:border-gray-300! hover:bg-white!"
        }
      `}
    >
      <span
        className={`
          flex!
          h-8!
          w-8!
          shrink-0!
          items-center!
          justify-center!
          rounded-lg!
          border!
          ${
            active
              ? "border-blue-200! bg-white! text-blue-600!"
              : "border-gray-200! bg-white! text-gray-500!"
          }
        `}
      >
        {icon}
      </span>

      <span className="min-w-0!">
        <span
          className={`
            block!
            text-[11px]!
            font-semibold!
            ${
              active
                ? "text-gray-900!"
                : "text-gray-800!"
            }
          `}
        >
          {title}
        </span>

        <span
          className="
            mt-0.5!
            block!
            truncate!
            text-[9px]!
            font-medium!
            text-gray-500!
          "
        >
          {description}
        </span>
      </span>
    </button>
  );
};

const ErrorText = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <p className="mt-1.5! text-[9px]! font-medium! text-red-500!">
      {children}
    </p>
  );
};

export default ProductDetails;