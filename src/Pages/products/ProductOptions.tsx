import {
  Check,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import type { ProductFormData } from "@/Pages/products/ProductsNew";

interface ProductOptionsProps {
  form: ProductFormData;
  errors: Record<string, string>;
  updateForm: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => void;
}

const ProductOptions = ({
  form,
  errors,
  updateForm,
}: ProductOptionsProps) => {
  const handleOptionValueChange = (
    index: number,
    value: string,
  ) => {
    const nextValues = [...form.optionValues];

    nextValues[index] = value;

    updateForm(
      "optionValues",
      nextValues,
    );
  };

  const handleAddValue = () => {
    if (form.optionValues.length >= 10) {
      return;
    }

    updateForm(
      "optionValues",
      [...form.optionValues, ""],
    );
  };

  const handleRemoveValue = (
    index: number,
  ) => {
    const nextValues = form.optionValues.filter(
      (_, valueIndex) => valueIndex !== index,
    );

    updateForm(
      "optionValues",
      nextValues.length > 0
        ? nextValues
        : [""],
    );
  };

  return (
    <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
      {/* HEADER */}
      <div className="flex! items-start! justify-between! gap-3!">
        <div className="flex! min-w-0! items-start! gap-3!">
          <div className="flex! h-9! w-9! shrink-0! items-center! justify-center! rounded-xl! border! border-gray-200! bg-[#fafafa]! text-gray-600!">
            <SlidersHorizontal
              size={16}
              strokeWidth={1.9}
            />
          </div>

          <div className="min-w-0!">
            <h2 className="app-section-title text-gray-900!">
              Déclinaisons
            </h2>

            <p className="mt-0.5! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
              Ajoutez des variantes, comme la couleur, la taille ou le format.
            </p>
          </div>
        </div>

        {/* TOGGLE */}
        <button
          type="button"
          onClick={() =>
            updateForm(
              "hasOptions",
              !form.hasOptions,
            )
          }
          aria-pressed={form.hasOptions}
          className={`
            relative!
            h-6!
            w-11!
            shrink-0!
            rounded-full!
            transition!
            duration-150!
            ${
              form.hasOptions
                ? "bg-blue-600!"
                : "bg-gray-200!"
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
                form.hasOptions
                  ? "translate-x-5!"
                  : "translate-x-0!"
              }
            `}
          />
        </button>
      </div>

      {/* DISABLED STATE */}
      {!form.hasOptions && (
        <div className="mt-4! rounded-xl! border! border-gray-200! bg-[#fafafa]! px-3! py-3!">
          <div className="flex! items-center! gap-2!">
            <Check
              size={14}
              strokeWidth={2}
              className="text-gray-400!"
            />

            <p className="text-[11px]! font-medium! text-gray-500!">
              No product options enabled.
            </p>
          </div>
        </div>
      )}

      {/* ENABLED */}
      {form.hasOptions && (
        <div className="mt-4! space-y-4!">
          {/* OPTION NAME */}
          <div>
            <label className="mb-1.5! block! text-[11px]! font-semibold! text-gray-700! sm:text-[12px]!">
              Nom de la déclinaison
            </label>

            <input
              type="text"
              value={form.optionName}
              onChange={(event) =>
                updateForm(
                  "optionName",
                  event.target.value,
                )
              }
              placeholder="Couleur"
              className="
                h-10!
                w-full!
                rounded-lg!
                border!
                border-gray-200!
                bg-white!
                px-3!
                text-[12px]!
                font-medium!
                text-gray-900!
                outline-none!
                transition!
                duration-150!
                placeholder:text-gray-400!
                focus:border-blue-500!
                focus:ring-2!
                focus:ring-blue-500/10!
              "
            />

            {errors.optionName && (
              <p className="mt-1.5! text-[10px]! font-medium! text-red-600!">
                {errors.optionName}
              </p>
            )}
          </div>

          {/* VALUES */}
          <div>
            <div className="mb-1.5! flex! items-center! justify-between! gap-2!">
              <label className="text-[11px]! font-semibold! text-gray-700! sm:text-[12px]!">
                Values
              </label>

              <span className="text-[10px]! font-medium! text-gray-400!">
                {form.optionValues.length}/10
              </span>
            </div>

            <div className="space-y-2!">
              {form.optionValues.map(
                (value, index) => (
                  <div
                    key={`option-${index}`}
                    className="flex! min-w-0! items-center! gap-2!"
                  >
                    <input
                      type="text"
                      value={value}
                      onChange={(event) =>
                        handleOptionValueChange(
                          index,
                          event.target.value,
                        )
                      }
                      placeholder={`Value ${index + 1}`}
                      className="
                        h-10!
                        min-w-0!
                        flex-1!
                        rounded-lg!
                        border!
                        border-gray-200!
                        bg-white!
                        px-3!
                        text-[12px]!
                        font-medium!
                        text-gray-900!
                        outline-none!
                        transition!
                        duration-150!
                        placeholder:text-gray-400!
                        focus:border-blue-500!
                        focus:ring-2!
                        focus:ring-blue-500/10!
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveValue(
                          index,
                        )
                      }
                      disabled={
                        form.optionValues.length ===
                        1
                      }
                      aria-label={`Remove value ${index + 1}`}
                      className="
                        flex!
                        h-10!
                        w-10!
                        shrink-0!
                        items-center!
                        justify-center!
                        rounded-lg!
                        border!
                        border-gray-200!
                        bg-white!
                        text-gray-500!
                        transition!
                        duration-150!
                        hover:border-red-200!
                        hover:bg-red-50!
                        hover:text-red-600!
                        disabled:cursor-not-allowed!
                        disabled:opacity-40!
                      "
                    >
                      <Trash2
                        size={14}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                ),
              )}
            </div>

            {errors.optionValues && (
              <p className="mt-1.5! text-[10px]! font-medium! text-red-600!">
                {errors.optionValues}
              </p>
            )}

            <button
              type="button"
              onClick={handleAddValue}
              disabled={
                form.optionValues.length >= 10
              }
              className="
                mt-2.5!
                inline-flex!
                items-center!
                gap-1.5!
                rounded-md!
                px-2!
                py-1.5!
                text-[10px]!
                font-semibold!
                text-blue-600!
                transition!
                duration-150!
                hover:bg-blue-50!
                disabled:cursor-not-allowed!
                disabled:opacity-40!
              "
            >
              <Plus
                size={13}
                strokeWidth={2}
              />

              Add value
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductOptions;

/* =========================================================
   SKELETON
========================================================= */

export const ProductOptionsSkeleton = () => {
  return (
    <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
      <div className="flex! items-start! gap-3!">
        <div className="skeleton! h-9! w-9! shrink-0! rounded-xl!" />

        <div className="min-w-0! flex-1!">
          <div className="skeleton! h-4! w-20! rounded-md!" />
          <div className="skeleton! mt-1.5! h-3! w-64! max-w-full! rounded-md!" />
        </div>

        <div className="skeleton! h-6! w-11! shrink-0! rounded-full!" />
      </div>

      <div className="mt-4!">
        <div className="skeleton! h-10! w-full! rounded-lg!" />
      </div>

      <div className="mt-4! space-y-2!">
        <div className="skeleton! h-10! w-full! rounded-lg!" />
        <div className="skeleton! h-10! w-full! rounded-lg!" />
      </div>
    </section>
  );
};