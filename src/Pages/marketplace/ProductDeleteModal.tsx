import {
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
} from "react";

interface ProductDeleteModalProps {
  productName: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ProductDeleteModal = ({
  productName,
  isDeleting = false,
  onClose,
  onConfirm,
}: ProductDeleteModalProps) => {
  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (isDeleting) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isDeleting,
    onClose,
  ]);

  return (
    <div
      className="
        fixed!
        inset-0!
        z-100!
        flex!
        items-center!
        justify-center!
        bg-black/35!
        px-3!
        py-6!
        backdrop-blur-[2px]!
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-title"
    >
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Fermer"
        onClick={() => {
          if (!isDeleting) {
            onClose();
          }
        }}
        className="absolute! inset-0!  cursor-default!"
      />

      {/* MODAL */}

      <div
        className="
          relative!
          z-10!
          w-full!
          max-w-md!
          overflow-hidden!
          rounded-2xl!
          border!
          border-gray-200!
          bg-white!
          shadow-xl!
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex! items-start! justify-between! gap-3! p-4! sm:p-5!">
          <div className="flex! min-w-0! items-start! gap-3!">
           
            <div className="min-w-0!">
              <h2
                id="delete-product-title"
                className="text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!"
              >
                Supprimer le produit
              </h2>

              <p className="mt-1! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
                Cette action est irréversible.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              isDeleting
            }
            aria-label="Fermer"
            className="
              flex!
              h-8!
              w-8!
              shrink-0!
              items-center!
              justify-center!
              rounded-lg!
              text-gray-400!
              transition!
              duration-150!
              hover:bg-gray-100!
              hover:text-gray-700!
              disabled:cursor-not-allowed!
              disabled:opacity-40!
            "
          >
            <X
              size={15}
              strokeWidth={1.9}
            />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="px-4! pb-4! sm:px-5!">
          <div
            className="
              rounded-xl!
             
             
              p-3!
            "
          >
            <div className="flex! items-start! gap-2.5!">
            

              <div className="min-w-0!">
                <p className="truncate! text-[11px]! font-semibold! text-gray-900!">
                  {productName}
                </p>

                <p className="mt-1! text-[11px]! font-medium! leading-relaxed! text-gray-500!">
                  Ce produit sera retiré de votre catalogue.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className="
            flex!
            flex-col-reverse!
            gap-2!
            border-t!
            border-gray-200!
            p-4!
            sm:flex-row!
            sm:justify-end!
            sm:p-5!
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={
              isDeleting
            }
            className="
              inline-flex!
              h-10!
              w-full!
              items-center!
              justify-center!
              rounded-full!
              border!
              border-gray-200!
              bg-white!
              px-4!
              text-[10px]!
              font-semibold!
              text-gray-600!
              transition!
              duration-150!
              hover:border-gray-300!
              hover:bg-gray-50!
              hover:text-gray-900!
              active:scale-[0.99]!
              disabled:cursor-not-allowed!
              disabled:opacity-50!
              sm:w-auto!
              sm:text-[11px]!
            "
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={
              isDeleting
            }
            className="
              inline-flex!
              h-10!
              w-full!
              items-center!
              justify-center!
              gap-1.5!
              rounded-full!
              bg-red-600!
              px-4!
              text-[10px]!
              font-semibold!
              text-white!
              transition!
              duration-150!
              hover:bg-red-700!
              active:scale-[0.99]!
              disabled:cursor-not-allowed!
              disabled:opacity-60!
              sm:w-auto!
              sm:text-[11px]!
            "
          >
            {isDeleting ? (
              <>
                <Loader2
                  size={13}
                  strokeWidth={2}
                  className="animate-spin!"
                />

                Suppression en cours…
              </>
            ) : (
              <>
                <Trash2
                  size={13}
                  strokeWidth={1.9}
                />

                Supprimer le produit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDeleteModal;