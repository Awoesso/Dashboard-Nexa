import {
  Box,
  Check,
  ChevronRight,
  Image as ImageIcon,
  Package,
  Tag,
  Truck,
} from "lucide-react";

import type {
  ProductFormData,
  ProductImage,
} from "./ProductsNew";

interface ProductPreviewProps {
  form: ProductFormData;
  images: ProductImage[];
  digitalFile: File | null;
  loading?: boolean;
}

const formatPrice = (
  value: string,
) => {
  const amount = Number(
    value.replace(/\s/g, ""),
  );

  if (!Number.isFinite(amount)) {
    return "0 XOF";
  }

  return `${new Intl.NumberFormat(
    "fr-FR",
  ).format(amount)} XOF`;
};

const SummaryRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex! min-w-0! items-start! justify-between! gap-3!">
      <div className="flex! min-w-0! items-center! gap-2!">
        <span className="shrink-0! text-gray-400!">
          {icon}
        </span>

        <span className="truncate! text-[10px]! font-medium! text-gray-500! sm:text-[11px]!">
          {label}
        </span>
      </div>

      <div className="min-w-0! max-w-[65%]! text-right!">
        {children}
      </div>
    </div>
  );
};

const getStockLabel = (
  form: ProductFormData,
) => {
  if (!form.trackInventory) {
    return "Non suivi";
  }

  if (!form.stock.trim()) {
    return "Non renseigné";
  }

  const stock = Number(form.stock);

  if (!Number.isFinite(stock)) {
    return "Non renseignée";
  }

  if (stock <= 0) {
    return "Rupture de stock";
  }

  return `${stock} disponible${stock > 1 ? "s" : ""}`;
};

const getCompletion = (
  form: ProductFormData,
  images: ProductImage[],
  digitalFile: File | null,
) => {
  const checks = [
    Boolean(form.productName.trim()),
    Boolean(form.category.trim()),
    Boolean(form.description.trim()),
    Boolean(
      form.price.trim() &&
        Number(form.price) >= 0,
    ),
    images.length > 0,
    form.productType === "digital"
      ? Boolean(digitalFile)
      : !form.trackInventory ||
        Boolean(
          form.stock.trim() &&
            Number(form.stock) >= 0,
        ),
    form.hasOptions
      ? Boolean(
          form.optionName.trim() &&
            form.optionValues.some(
              (value) =>
                value.trim() !== "",
            ),
        )
      : true,
  ];

  const completed =
    checks.filter(Boolean).length;

  return Math.round(
    (completed / checks.length) *
      100,
  );
};

const ProductPreview = ({
  form,
  images,
  digitalFile,
  loading = false,
}: ProductPreviewProps) => {
  if (loading) {
    return <ProductPreviewSkeleton/>;
  }

  const completion =
    getCompletion(
      form,
      images,
      digitalFile,
    );

  const firstImage =
    images[0]?.preview;

  const stockLabel =
    getStockLabel(form);

  const hasShippingData =
    form.weight.trim() ||
    form.length.trim() ||
    form.width.trim() ||
    form.height.trim();

  return (
    <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
      {/* HEADER */}
      <div className="mb-4! flex! items-start! justify-between! gap-3!">
        <div className="min-w-0!">
          <p className="text-[10px]! font-semibold! uppercase! tracking-[0.08em]! text-gray-400!">
            Live preview
          </p>

          <h2 className="mt-1! text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!">
            Product summary
          </h2>
        </div>

        <span className="shrink-0! rounded-full! border! border-blue-200! bg-blue-50! px-2! py-1! text-[9px]! font-semibold! text-blue-600!">
          Preview
        </span>
      </div>

      {/* PRODUCT IDENTITY */}
      <div className="rounded-2xl! border! border-gray-200! bg-[#fafafa]! p-3!">
        <div className="flex! min-w-0! items-center! gap-3!">
          {firstImage ? (
            <img
              src={firstImage}
              alt={
                form.productName ||
                "Aperçu du produit"
              }
              className="h-14! w-14! shrink-0! rounded-xl! border! border-gray-200! object-cover!"
            />
          ) : (
            <div className="flex! h-14! w-14! shrink-0! items-center! justify-center! rounded-xl! border! border-gray-200! bg-white! text-gray-300!">
              <ImageIcon
                size={20}
                strokeWidth={1.6}
              />
            </div>
          )}

          <div className="min-w-0! flex-1!">
            <h3 className="truncate! text-[12px]! font-semibold! tracking-tight! text-gray-900! sm:text-[13px]!">
              {form.productName.trim() ||
                "Produit sans titre"}
            </h3>

            <p className="mt-0.5! truncate! text-[10px]! font-medium! text-gray-500! sm:text-[11px]!">
              {form.category ||
                "Sans catégorie"}
            </p>

            <div className="mt-2! flex! min-w-0! flex-wrap! items-center! gap-1.5!">
              <span className="rounded-md! bg-white! px-2! py-1! text-[9px]! font-semibold! text-gray-600!">
                {form.productType ===
                "digital"
                  ? "Numérique"
                  : "Physique"}
              </span>

              {form.brand.trim() && (
                <span className="max-w-[110px]! truncate! rounded-md! bg-white! px-2! py-1! text-[9px]! font-semibold! text-gray-600!">
                  {form.brand.trim()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="mt-4! space-y-4!">
        {/* PRICE */}
        <SummaryRow
          icon={
            <Tag
              size={14}
              strokeWidth={1.8}
            />
          }
          label="Prix"
        >
          <div className="flex! flex-wrap! items-baseline! justify-end! gap-x-2! gap-y-0.5!">
            <span className="text-[12px]! font-semibold! tracking-tight! text-gray-900!">
              {formatPrice(form.price)}
            </span>

            {form.comparePrice.trim() && (
              <span className="text-[10px]! font-medium! text-gray-400! line-through!">
                {formatPrice(
                  form.comparePrice,
                )}
              </span>
            )}
          </div>
        </SummaryRow>

        {/* INVENTORY */}
        {form.productType ===
          "physical" && (
          <SummaryRow
            icon={
              <Package
                size={14}
                strokeWidth={1.8}
              />
            }
            label="Stock"
          >
            <div className="flex! items-center! justify-end! gap-2!">
              <span className="truncate! text-[10px]! font-semibold! text-gray-700!">
                {stockLabel}
              </span>

              <span
                className={`
                  h-1.5!
                  w-1.5!
                  shrink-0!
                  rounded-full!
                  ${
                    !form.trackInventory
                      ? "bg-gray-300!"
                      : Number(
                            form.stock,
                          ) > 0
                        ? "bg-green-500!"
                        : "bg-red-500!"
                  }
                `}
              />
            </div>
          </SummaryRow>
        )}

        {/* DIGITAL FILE */}
        {form.productType ===
          "digital" && (
          <SummaryRow
            icon={
              <Box
                size={14}
                strokeWidth={1.8}
              />
            }
            label="Fichier numérique"
          >
            <span
              className={`
                text-[10px]!
                font-semibold!
                ${
                  digitalFile
                    ? "text-green-600!"
                    : "text-gray-400!"
                }
              `}
            >
              {digitalFile
                ? "Ajouté"
                : "Manquant"}
            </span>
          </SummaryRow>
        )}

        {/* OPTIONS */}
        {form.hasOptions && (
          <SummaryRow
            icon={
              <ChevronRight
                size={14}
                strokeWidth={1.8}
              />
            }
            label={
              form.optionName.trim() ||
              "Déclinaisons"
            }
          >
            <div className="flex! flex-wrap! justify-end! gap-1!">
              {form.optionValues
                .filter(
                  (value) =>
                    value.trim() !== "",
                )
                .map(
                  (
                    value,
                    index,
                  ) => (
                    <span
                      key={`${value}-${index}`}
                      className="max-w-[90px]! truncate! rounded-md! bg-gray-100! px-1.5! py-1! text-[9px]! font-semibold! text-gray-600!"
                    >
                      {value}
                    </span>
                  ),
                )}
            </div>
          </SummaryRow>
        )}

        {/* SHIPPING */}
        {form.productType ===
          "physical" &&
          hasShippingData && (
            <SummaryRow
              icon={
                <Truck
                  size={14}
                  strokeWidth={1.8}
                />
              }
              label="Livraison"
            >
              <div className="text-[10px]! font-medium! text-gray-700!">
                {form.weight.trim() && (
                  <span>
                    {form.weight} kg
                  </span>
                )}

                {(form.length.trim() ||
                  form.width.trim() ||
                  form.height.trim()) && (
                  <span className="ml-1.5! text-gray-400!">
                    (
                    {form.length ||
                      "0"}
                    ×
                    {form.width ||
                      "0"}
                    ×
                    {form.height ||
                      "0"}{" "}
                    cm)
                  </span>
                )}
              </div>
            </SummaryRow>
          )}

        {/* IMAGES */}
        <SummaryRow
          icon={
            <ImageIcon
              size={14}
              strokeWidth={1.8}
            />
          }
          label="Galerie"
        >
          <span className="text-[10px]! font-semibold! text-gray-700!">
            {images.length} / 8
          </span>
        </SummaryRow>
      </div>

      {/* COMPLETION */}
      <div className="mt-4! border-t! border-gray-100! pt-4!">
        <div className="flex! items-center! justify-between! gap-3!">
          <div className="min-w-0!">
            <p className="text-[11px]! font-semibold! text-gray-900!">
              Completion
            </p>

            <p className="mt-0.5! text-[9px]! font-medium! text-gray-500!">
              Product setup progress.
            </p>
          </div>

          <span className="shrink-0! text-[10px]! font-semibold! text-blue-600!">
            {completion}%
          </span>
        </div>

        <div className="mt-2.5! h-1.5! w-full! overflow-hidden! rounded-full! bg-gray-100!">
          <div
            className="h-full! rounded-full! bg-blue-600! transition-all! duration-200!"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>

        <div className="mt-3! grid! grid-cols-2! gap-2!">
          <CompletionCheck
            done={Boolean(
              form.productName.trim(),
            )}
            label="Informations générales"
          />

          <CompletionCheck
            done={
              Boolean(
                form.price.trim(),
              ) &&
              Number(form.price) >= 0
            }
            label="Tarification"
          />

          <CompletionCheck
            done={
              form.productType ===
              "digital"
                ? Boolean(
                    digitalFile,
                  )
                : !form.trackInventory ||
                  Boolean(
                    form.stock.trim() &&
                      Number(
                        form.stock,
                      ) >= 0,
                  )
            }
            label={
              form.productType ===
              "digital"
                ? "Fichier"
                : "Stock"
            }
          />

          <CompletionCheck
            done={images.length > 0}
            label="Images"
          />
        </div>
      </div>
    </section>
  );
};

const CompletionCheck = ({
  done,
  label,
}: {
  done: boolean;
  label: string;
}) => {
  return (
    <div className="flex! min-w-0! items-center! gap-1.5!">
      <div
        className={`
          flex!
          h-4!
          w-4!
          shrink-0!
          items-center!
          justify-center!
          rounded-full!
          ${
            done
              ? "bg-green-50! text-green-600!"
              : "bg-gray-100! text-gray-400!"
          }
        `}
      >
        <Check
          size={10}
          strokeWidth={2.2}
        />
      </div>

      <span className="truncate! text-[9px]! font-medium! text-gray-500!">
        {label}
      </span>
    </div>
  );
};

export const ProductPreviewSkeleton=
  () => {
    return (
      <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
        {/* HEADER */}
        <div className="mb-4! flex! items-start! justify-between! gap-3!">
          <div className="min-w-0!">
            <div className="skeleton h-3! w-20! rounded-md!" />
            <div className="skeleton mt-1.5! h-4! w-32! rounded-md!" />
          </div>

          <div className="skeleton h-6! w-14! shrink-0! rounded-full!" />
        </div>

        {/* IDENTITY */}
        <div className="rounded-2xl! border! border-gray-200! bg-[#fafafa]! p-3!">
          <div className="flex! items-center! gap-3!">
            <div className="skeleton h-14! w-14! shrink-0! rounded-xl!" />

            <div className="min-w-0! flex-1!">
              <div className="skeleton h-4! w-3/4! rounded-md!" />
              <div className="skeleton mt-1.5! h-3! w-1/2! rounded-md!" />

              <div className="mt-2! flex! gap-1.5!">
                <div className="skeleton h-5! w-14! rounded-md!" />
                <div className="skeleton h-5! w-16! rounded-md!" />
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="mt-4! space-y-5!">
          <div className="flex! justify-between! gap-4!">
            <div className="skeleton h-3! w-16! rounded-md!" />
            <div className="skeleton h-4! w-24! rounded-md!" />
          </div>

          <div className="flex! justify-between! gap-4!">
            <div className="skeleton h-3! w-20! rounded-md!" />
            <div className="skeleton h-4! w-20! rounded-md!" />
          </div>

          <div className="flex! justify-between! gap-4!">
            <div className="skeleton h-3! w-16! rounded-md!" />
            <div className="skeleton h-4! w-14! rounded-md!" />
          </div>
        </div>

        {/* COMPLETION */}
        <div className="mt-4! border-t! border-gray-100! pt-4!">
          <div className="flex! justify-between!">
            <div>
              <div className="skeleton h-3! w-20! rounded-md!" />
              <div className="skeleton mt-1.5! h-2.5! w-28! rounded-md!" />
            </div>

            <div className="skeleton h-3! w-8! rounded-md!" />
          </div>

          <div className="skeleton mt-2.5! h-1.5! w-full! rounded-full!" />

          <div className="mt-3! grid! grid-cols-2! gap-2!">
            <div className="skeleton h-4! w-full! rounded-md!" />
            <div className="skeleton h-4! w-full! rounded-md!" />
            <div className="skeleton h-4! w-full! rounded-md!" />
            <div className="skeleton h-4! w-full! rounded-md!" />
          </div>
        </div>
      </section>
    );
  };

export default ProductPreview;