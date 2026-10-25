import type {
  ChangeEvent,
  RefObject,
} from "react";

import {
  Trash2,
  Upload,
  X,
} from "lucide-react";

import type { ProductImage } from "@/Pages/products/ProductsNew";

interface ProductImagesProps {
  images: ProductImage[];
  fileInputRef: RefObject<HTMLInputElement>;
  errors: Record<string, string>;
  onChange: (
    images: ProductImage[],
  ) => void;
}

const MAX_IMAGES = 8;

const ProductImages = ({
  images,
  fileInputRef,
  errors,
  onChange,
}: ProductImagesProps) => {
  const handleFiles = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      event.target.files || [],
    );

    if (!files.length) {
      return;
    }

    const remainingSlots =
      MAX_IMAGES - images.length;

    const selectedFiles = files
      .filter((file) =>
        file.type.startsWith("image/"),
      )
      .slice(0, remainingSlots);

    const nextImages: ProductImage[] =
      selectedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      }));

    if (nextImages.length > 0) {
      onChange([
        ...images,
        ...nextImages,
      ]);
    }

    event.target.value = "";
  };

  const handleRemove = (
    imageId: string,
  ) => {
    const imageToRemove = images.find(
      (image) => image.id === imageId,
    );

    if (imageToRemove) {
      URL.revokeObjectURL(
        imageToRemove.preview,
      );
    }

    onChange(
      images.filter(
        (image) => image.id !== imageId,
      ),
    );
  };

  const handleClearAll = () => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });
    onChange([]);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    const files = Array.from(
      event.dataTransfer.files || [],
    );

    if (!files.length) {
      return;
    }

    const remainingSlots =
      MAX_IMAGES - images.length;

    const selectedFiles = files
      .filter((file) =>
        file.type.startsWith("image/"),
      )
      .slice(0, remainingSlots);

    const nextImages: ProductImage[] =
      selectedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      }));

    if (nextImages.length > 0) {
      onChange([
        ...images,
        ...nextImages,
      ]);
    }
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
      {/* HEADER */}
      <div className="mb-4! flex! items-start! justify-between! gap-3!">
        <div className="flex! min-w-0! items-start! gap-3!">
          <div className="min-w-0!">
            <h2 className="app-section-title text-gray-900!">
              Product images
            </h2>

            <p className="mt-0.5! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
              Ajoutez des images nettes pour mettre votre produit en valeur.
            </p>
          </div>
        </div>

        <div className="flex! items-center! gap-2.5!">
          {images.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="
                flex!
                items-center!
                gap-1!
                rounded-md!
                px-2!
                py-1!
                text-[10px]!
                font-semibold!
                text-red-600!
                transition!
                duration-150!
                hover:bg-red-50!
              "
            >
              <Trash2 size={12} strokeWidth={2} />
              Delete all
            </button>
          )}

          <span className="shrink-0! text-[10px]! font-semibold! text-gray-400!">
            {images.length}/{MAX_IMAGES}
          </span>
        </div>
      </div>

      {/* DROPZONE */}
      {images.length === 0 && (
        <div
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={handleDrop}
          onClick={openPicker}
          className="
            group!
            cursor-pointer!
            rounded-2xl!
            border!
            border-dashed!
            border-gray-300!
            bg-[#fafafa]!
            px-4!
            py-6!
            text-center!
            transition!
            duration-150!
            hover:border-blue-300!
            hover:bg-blue-50/40!
          "
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openPicker();
            }}
            className="
              mt-3!
              inline-flex!
              items-center!
              gap-1.5!
              rounded-lg!
              border!
              border-gray-200!
              bg-white!
              px-3!
              py-2!
              text-[10px]!
              font-semibold!
              text-gray-700!
              transition!
              duration-150!
              hover:border-blue-200!
              hover:text-blue-600!
            "
          >
            <Upload
              size={13}
              strokeWidth={1.9}
            />
            Choose files
          </button>
          <p className="mt-3! text-[11px]! font-semibold! text-gray-700! sm:text-[12px]!">
            Cliquez pour sélectionner des images ou faites-les glisser ici.
          </p>

          <p className="mt-1! text-[10px]! font-medium! text-gray-400!">
            PNG, JPG or WEBP
          </p>
        </div>
      )}

      {/* INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFiles}
        className="hidden!"
      />

      {/* ERROR */}
      {errors.images && (
        <p className="mt-2! text-[10px]! font-medium! text-red-600!">
          {errors.images}
        </p>
      )}

      {/* PREVIEWS */}
      {images.length > 0 && (
        <div className="mt-4! grid! grid-cols-2! gap-2! sm:grid-cols-4!">
          {images.map(
            (image, index) => (
              <div
                key={image.id}
                className="
                  group!
                  relative!
                  aspect-square!
                  overflow-hidden!
                  rounded-xl!
                  border!
                  border-gray-200!
                  bg-[#fafafa]!
                "
              >
                <img
                  src={image.preview}
                  alt={`Product image ${index + 1}`}
                  className="h-full! w-full! object-cover!"
                />

                {/* INDEX */}
                <div className="absolute! left-2! top-2! rounded-md! bg-black/55! px-1.5! py-0.5! text-[9px]! font-semibold! text-white!">
                  {index + 1}
                </div>

                {/* REMOVE INDIVIDUAL IMAGE */}
                <button
                  type="button"
                  onClick={() =>
                    handleRemove(
                      image.id,
                    )
                  }
                  aria-label={`Remove image ${index + 1}`}
                  className="
                    absolute!
                    right-2!
                    top-2!
                    flex!
                    h-7!
                    w-7!
                    items-center!
                    justify-center!
                    rounded-md!
                    bg-white/95!
                    text-gray-600!
                    opacity-100!
                    shadow-sm!
                    transition!
                    duration-150!
                    hover:bg-red-50!
                    hover:text-red-600!
                    sm:opacity-0!
                    sm:group-hover:opacity-100!
                  "
                >
                  <X
                    size={13}
                    strokeWidth={2}
                  />
                </button>
              </div>
            ),
          )}
        </div>
      )}

      {/* INFO & ADD MORE */}
      <div className="mt-3! flex! flex-wrap! items-center! justify-between! gap-2!">
        <p className="text-[10px]! font-medium! text-gray-400!">
          The first image will be used as the main product image.
        </p>

        {images.length > 0 && (
          <button
            type="button"
            onClick={openPicker}
            disabled={
              images.length >= MAX_IMAGES
            }
            className="
              shrink-0!
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
            Ajouter d’autres images
          </button>
        )}
      </div>
    </section>
  );
};

export default ProductImages;

/* =========================================================
   SKELETON
========================================================= */

export const ProductImagesSkeleton = () => {
  return (
    <section className="rounded-2xl! border! border-gray-200! bg-white! p-4! sm:p-5!">
      <div className="mb-4! flex! items-start! gap-3!">
        <div className="skeleton! h-9! w-9! shrink-0! rounded-xl!" />

        <div className="min-w-0! flex-1!">
          <div className="skeleton! h-4! w-28! rounded-md!" />
          <div className="skeleton! mt-1.5! h-3! w-64! max-w-full! rounded-md!" />
        </div>
      </div>

      <div className="skeleton! h-40! w-full! rounded-2xl!" />

      <div className="mt-4! grid! grid-cols-2! gap-2! sm:grid-cols-4!">
        <div className="skeleton! aspect-square! rounded-xl!" />
        <div className="skeleton! aspect-square! rounded-xl!" />
        <div className="skeleton! aspect-square! rounded-xl!" />
        <div className="skeleton! aspect-square! rounded-xl!" />
      </div>
    </section>
  );
};