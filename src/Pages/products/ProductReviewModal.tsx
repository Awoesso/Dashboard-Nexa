import {
  Check,
  FileText,
  X,
  Box,
  Tag,
  Package,
  Layers3,
} from "lucide-react";

import type {
  ProductFormData,
  ProductImage,
} from "@/Pages/products/ProductsNew";

interface Props {
  form: ProductFormData;
  images: ProductImage[];
  digitalFile: File | null;
  isCreating: boolean;
  onClose: () => void;
  onCreate: () => void;
}

const ProductReviewModal = ({
  form,
  images,
  digitalFile,
  isCreating,
  onClose,
  onCreate,
}: Props) => {
  const price = form.price
    ? `${Number(
        form.price.replace(/\s/g, ""),
      ).toLocaleString("fr-FR")} XOF`
    : "0 XOF";

  const comparePrice = form.comparePrice
    ? `${Number(
        form.comparePrice.replace(/\s/g, ""),
      ).toLocaleString("fr-FR")} XOF`
    : null;

  const previewImage =
    images[0]?.preview || "/dashboard-preview.png";

  const isPhysical = form.productType === "physical";

  return (
    <div className="fixed! inset-0! z-[100]! flex! items-center! justify-center! bg-black/45! p-3! backdrop-blur-sm! sm:p-5!">
      <div className="flex! max-h-[92vh]! w-full! max-w-3xl! flex-col! overflow-hidden! rounded-2xl! border! border-gray-200! bg-white! shadow-2xl!">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex! items-center! justify-between! border-b! border-gray-200! px-4! py-4! sm:px-6!">
          <div className="min-w-0!">
            <p className="text-[10px]! font-bold! uppercase! tracking-[0.12em]! text-blue-600!">
              Final review
            </p>

            <h2 className="mt-0.5! text-base! font-bold! tracking-tight! text-gray-900! sm:text-lg!">
              Vérifier le produit
            </h2>

            <p className="mt-1! text-[11px]! font-medium! text-gray-500!">
              Check your product before creating it.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="flex! h-8! w-8! shrink-0! items-center! justify-center! rounded-lg! text-gray-400! transition-colors! hover:bg-gray-100! hover:text-gray-700! disabled:opacity-50!"
          >
            <X size={17} />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="min-h-0! flex-1! overflow-y-auto! px-4! py-4! sm:px-6! sm:py-5!">
          {/* ===================================================
              PRODUCT HERO
          =================================================== */}

          <div className="grid! grid-cols-1! gap-4! sm:grid-cols-[180px_minmax(0,1fr)]!">
            {/* IMAGE */}

            <div className="overflow-hidden! rounded-xl! border! border-gray-200! bg-gray-50!">
              <div className="aspect-square!">
                <img
                  src={previewImage}
                  alt={form.productName || "Produit"}
                  className="h-full! w-full! object-cover!"
                />
              </div>

              {images.length > 1 && (
                <div className="border-t! border-gray-200! px-3! py-2!">
                  <span className="text-[10px]! font-semibold! text-gray-500!">
                    {images.length} product images
                  </span>
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}

            <div className="min-w-0! rounded-xl! border! border-gray-200! bg-gray-50/60! p-4!">
              <div className="flex! flex-wrap! items-center! gap-2!">
                <span className="rounded-full! bg-blue-50! px-2.5! py-1! text-[9px]! font-bold! uppercase! tracking-wide! text-blue-600!">
                  {form.category}
                </span>

                <span className="inline-flex! items-center! gap-1! rounded-full! border! border-gray-200! bg-white! px-2.5! py-1! text-[9px]! font-bold! capitalize! text-gray-600!">
                  {isPhysical ? (
                    <Box size={10} />
                  ) : (
                    <FileText size={10} />
                  )}

                  {form.productType}
                </span>

                <span className="rounded-full! border! border-gray-200! bg-white! px-2.5! py-1! text-[9px]! font-bold! capitalize! text-gray-600!">
                  {form.status}
                </span>
              </div>

              <h3 className="mt-3! line-clamp-2! text-lg! font-bold! tracking-tight! text-gray-900!">
                {form.productName || "Nom du produit"}
              </h3>

              {form.brand && (
                <p className="mt-1! text-xs! font-medium! text-gray-500!">
                  {form.brand}
                </p>
              )}

              <div className="mt-4! flex! flex-wrap! items-end! gap-2!">
                <span className="text-xl! font-extrabold! tracking-tight! text-gray-900!">
                  {price}
                </span>

                {comparePrice && (
                  <span className="pb-0.5! text-xs! font-medium! text-gray-400! line-through!">
                    {comparePrice}
                  </span>
                )}
              </div>

              <div className="mt-4! flex! items-center! gap-2! text-[10px]! font-medium! text-gray-500!">
                {isPhysical ? (
                  <>
                    <Package
                      size={12}
                      className="text-gray-400!"
                    />
                    <span>
                      {form.trackInventory
                        ? `${form.stock || 0} unités en stock`
                        : "Stock non suivi"}
                    </span>
                  </>
                ) : (
                  <>
                    <FileText
                      size={12}
                      className="text-gray-400!"
                    />
                    <span>Livraison numérique</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ===================================================
              DETAILS
          =================================================== */}

          <div className="mt-5!">
            <div className="mb-2.5! flex! items-center! gap-2!">
              <div className="flex! h-6! w-6! items-center! justify-center! rounded-lg! bg-gray-900! text-white!">
                <Layers3 size={12} />
              </div>

              <h3 className="text-xs! font-bold! text-gray-900!">
                Product details
              </h3>
            </div>

            <div className="grid! grid-cols-1! gap-2! sm:grid-cols-2!">
              <ReviewItem
                label="Référence"
                value={form.sku || "Non renseignée"}
              />

              <ReviewItem
                label="Catégorie"
                value={form.category}
              />

              <ReviewItem
                label="Type"
                value={form.productType}
              />

              <ReviewItem
                label="Statut"
                value={form.status}
              />
            </div>
          </div>

          {/* ===================================================
              DESCRIPTION
          =================================================== */}

          {form.description && (
            <div className="mt-5!">
              <div className="mb-2.5! flex! items-center! gap-2!">
                <div className="flex! h-6! w-6! items-center! justify-center! rounded-lg! bg-gray-900! text-white!">
                  <Tag size={12} />
                </div>

                <h3 className="text-xs! font-bold! text-gray-900!">
                  Description
                </h3>
              </div>

              <div className="rounded-xl! border! border-gray-200! bg-gray-50/60! p-3!">
                <p className="whitespace-pre-wrap! text-xs! leading-relaxed! text-gray-600!">
                  {form.description}
                </p>
              </div>
            </div>
          )}

          {/* ===================================================
              OPTIONS
          =================================================== */}

          {form.hasOptions &&
            form.optionValues.some(
              (value) => value.trim() !== "",
            ) && (
              <div className="mt-5!">
                <div className="mb-2.5! flex! items-center! gap-2!">
                  <div className="flex! h-6! w-6! items-center! justify-center! rounded-lg! bg-gray-900! text-white!">
                    <Tag size={12} />
                  </div>

                  <h3 className="text-xs! font-bold! text-gray-900!">
                    {form.optionName}
                  </h3>
                </div>

                <div className="flex! flex-wrap! gap-1.5!">
                  {form.optionValues
                    .filter(
                      (value) => value.trim() !== "",
                    )
                    .map((value, index) => (
                      <span
                        key={`${value}-${index}`}
                        className="rounded-lg! border! border-gray-200! bg-white! px-2.5! py-1.5! text-[10px]! font-semibold! text-gray-600!"
                      >
                        {value}
                      </span>
                    ))}
                </div>
              </div>
            )}

          {/* ===================================================
              SHIPPING
          =================================================== */}

          {isPhysical && (
            <div className="mt-5!">
              <div className="mb-2.5! flex! items-center! gap-2!">
                <div className="flex! h-6! w-6! items-center! justify-center! rounded-lg! bg-gray-900! text-white!">
                  <Package size={12} />
                </div>

                <h3 className="text-xs! font-bold! text-gray-900!">
                  Inventory & shipping
                </h3>
              </div>

              <div className="grid! grid-cols-1! gap-2! sm:grid-cols-2!">
                <ReviewItem
                  label="Stock"
                  value={
                    form.trackInventory
                      ? `${form.stock || 0} unités`
                      : "Non suivi"
                  }
                />

                <ReviewItem
                  label="Poids"
                  value={
                    form.weight
                      ? `${form.weight} kg`
                      : "Non renseigné"
                  }
                />

                <ReviewItem
                  label="Longueur"
                  value={
                    form.length
                      ? `${form.length}`
                      : "Non renseignée"
                  }
                />

                <ReviewItem
                  label="Largeur"
                  value={
                    form.width
                      ? `${form.width}`
                      : "Non renseignée"
                  }
                />
              </div>
            </div>
          )}

          {/* ===================================================
              DIGITAL FILE
          =================================================== */}

          {!isPhysical && digitalFile && (
            <div className="mt-5!">
              <div className="mb-2.5! flex! items-center! gap-2!">
                <div className="flex! h-6! w-6! items-center! justify-center! rounded-lg! bg-gray-900! text-white!">
                  <FileText size={12} />
                </div>

                <h3 className="text-xs! font-bold! text-gray-900!">
                  Fichier numérique
                </h3>
              </div>

              <div className="flex! items-center! gap-3! rounded-xl! border! border-gray-200! bg-gray-50/60! p-3!">
                <div className="flex! h-9! w-9! shrink-0! items-center! justify-center! rounded-lg! bg-white! text-gray-500!">
                  <FileText size={16} />
                </div>

                <div className="min-w-0!">
                  <p className="truncate! text-xs! font-bold! text-gray-900!">
                    {digitalFile.name}
                  </p>

                  <p className="mt-0.5! text-[10px]! font-medium! text-gray-400!">
                    {(
                      digitalFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="flex! flex-col-reverse! gap-2! border-t! border-gray-200! bg-white! p-3! sm:flex-row! sm:justify-end! sm:px-6! sm:py-4!">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="inline-flex! h-10! items-center! justify-center! rounded-xl! border! border-gray-200! bg-white! px-5! text-xs! font-bold! text-gray-600! transition-all! hover:border-gray-300! hover:text-gray-900! disabled:opacity-50!"
          >
            Retour
          </button>

          <button
            type="button"
            onClick={onCreate}
            disabled={isCreating}
            className="inline-flex! h-10! items-center! justify-center! gap-2! rounded-xl! bg-gray-900! px-5! text-xs! font-bold! text-white! transition-all! hover:bg-gray-800! disabled:cursor-not-allowed! disabled:opacity-60!"
          >
            {isCreating ? (
              <>
                <span className="h-3.5! w-3.5! animate-spin! rounded-full! border-2! border-white/30! border-t-white!" />
                Creating...
              </>
            ) : (
              <>
                <Check size={14} />
                Créer le produit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReviewItemProps {
  label: string;
  value: string;
}

const ReviewItem = ({
  label,
  value,
}: ReviewItemProps) => {
  return (
    <div className="min-w-0! rounded-xl! border! border-gray-200! bg-gray-50/60! p-3!">
      <p className="text-[9px]! font-bold! uppercase! tracking-[0.1em]! text-gray-400!">
        {label}
      </p>

      <p className="mt-1! truncate! text-xs! font-bold! capitalize! text-gray-900!">
        {value}
      </p>
    </div>
  );
};

export default ProductReviewModal;