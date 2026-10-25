import {
  Ruler,
  Weight,
} from "lucide-react";

import type { ProductFormData } from "@/Pages/products/ProductsNew";

interface ProductShippingProps {
  form: ProductFormData;
  updateForm: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => void;
}

const ProductShipping = ({
  form,
  updateForm,
}: ProductShippingProps) => {
  return (
    <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
      {/* HEADER */}
      <div className="mb-4! flex! items-start! gap-3!">
       
        <div className="min-w-0!">
          <h2 className="app-section-title text-gray-900!">
            Livraison
          </h2>

          <p className="mt-0.5! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
            Add the physical dimensions and weight of the product.
          </p>
        </div>
      </div>

      {/* WEIGHT */}
      <div className="mb-4!">
        <div className="mb-1.5! flex! items-center! gap-1.5!">
          <Weight
            size={13}
            strokeWidth={1.8}
            className="text-gray-500!"
          />

          <label className="text-[11px]! font-semibold! text-gray-700! sm:text-[12px]!">
            Poids
          </label>
        </div>

        <div className="relative!">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.weight}
            onChange={(event) =>
              updateForm(
                "weight",
                event.target.value,
              )
            }
            placeholder="0"
            className="
              h-10!
              w-full!
              rounded-lg!
              border!
              border-gray-200!
              bg-white!
              px-3!
              pr-12!
              text-[12px]!
              font-medium!
              text-gray-900!
              outline-none!
              transition!
              duration-150!
              placeholder:text-gray-400!
               focus:border-gray-300!                                            focus:ring-2!                                                             focus:ring-gray-900/5!
            "
          />

          <span className="pointer-events-none! absolute! right-3! top-1/2! -translate-y-1/2! text-[10px]! font-medium! text-gray-400!">
            kg
          </span>
        </div>
      </div>

      {/* DIMENSIONS */}
      <div>
        <div className="mb-2! flex! items-center! gap-1.5!">
          <Ruler
            size={13}
            strokeWidth={1.8}
            className="text-gray-500!"
          />

          <span className="text-[11px]! font-semibold! text-gray-700! sm:text-[12px]!">
            Dimensions
          </span>

          <span className="text-[10px]! font-medium! text-gray-400!">
            (cm)
          </span>
        </div>

        <div className="grid! grid-cols-1! gap-2! sm:grid-cols-3!">
          {/* LENGTH */}
          <div>
            <label className="mb-1! block! text-[10px]! font-medium! text-gray-500!">
              Longueur
            </label>

            <input
              type="number"
              min="0"
              step="0.1"
              value={form.length}
              onChange={(event) =>
                updateForm(
                  "length",
                  event.target.value,
                )
              }
              placeholder="0"
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
                 focus:border-gray-300!                                            focus:ring-2!                                                             focus:ring-gray-900/5!
              "
            />
          </div>

          {/* WIDTH */}
          <div>
            <label className="mb-1! block! text-[10px]! font-medium! text-gray-500!">
              Largeur
            </label>

            <input
              type="number"
              min="0"
              step="0.1"
              value={form.width}
              onChange={(event) =>
                updateForm(
                  "width",
                  event.target.value,
                )
              }
              placeholder="0"
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
                 focus:border-gray-300!                                            focus:ring-2!                                                             focus:ring-gray-900/5!
              "
            />
          </div>

          {/* HEIGHT */}
          <div>
            <label className="mb-1! block! text-[10px]! font-medium! text-gray-500!">
              Height
            </label>

            <input
              type="number"
              min="0"
              step="0.1"
              value={form.height}
              onChange={(event) =>
                updateForm(
                  "height",
                  event.target.value,
                )
              }
              placeholder="0"
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
                 focus:border-gray-300!                                            focus:ring-2!                                                             focus:ring-gray-900/5!
              "
            />
          </div>
        </div>
      </div>

      {/* NOTE */}
      <div className="mt-4! rounded-xl! border! border-gray-200! bg-[#fafafa]! px-3! py-2.5!">
        <p className="text-[10px]! font-medium! leading-relaxed! text-gray-500!">
          Les informations de livraison sont facultatives et peuvent être renseignées ultérieurement.
        </p>
      </div>
    </section>
  );
};

export default ProductShipping;

/* =========================================================
   SKELETON
========================================================= */

export const ProductShippingSkeleton = () => {
  return (
    <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
      <div className="mb-4! flex! items-start! gap-3!">
        <div className="skeleton! h-9! w-9! shrink-0! rounded-xl!" />

        <div className="min-w-0! flex-1!">
          <div className="skeleton! h-4! w-20! rounded-md!" />
          <div className="skeleton! mt-1.5! h-3! w-64! max-w-full! rounded-md!" />
        </div>
      </div>

      <div className="mb-4!">
        <div className="skeleton! mb-2! h-3! w-20! rounded-md!" />
        <div className="skeleton! h-10! w-full! rounded-lg!" />
      </div>

      <div>
        <div className="skeleton! mb-2! h-3! w-24! rounded-md!" />

        <div className="grid! grid-cols-1! gap-2! sm:grid-cols-3!">
          <div>
            <div className="skeleton! mb-1! h-3! w-14! rounded-md!" />
            <div className="skeleton! h-10! w-full! rounded-lg!" />
          </div>

          <div>
            <div className="skeleton! mb-1! h-3! w-14! rounded-md!" />
            <div className="skeleton! h-10! w-full! rounded-lg!" />
          </div>

          <div>
            <div className="skeleton! mb-1! h-3! w-14! rounded-md!" />
            <div className="skeleton! h-10! w-full! rounded-lg!" />
          </div>
        </div>
      </div>
    </section>
  );
};