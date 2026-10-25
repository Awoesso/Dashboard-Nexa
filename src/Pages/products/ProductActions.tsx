import {
  Eye,
  Loader2,
} from "lucide-react";

import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";

interface Props {
  loading?: boolean;
  isCreating?: boolean;
  onReview: () => void;
}

const ProductActions = ({
  loading = false,
  isCreating = false,
  onReview,
}: Props) => {
  /* =========================================================
     SKELETON
  ========================================================= */

  if (loading) {
    return (
      <section className="w-full! min-w-0! rounded-2xl! border! border-gray-200! bg-white! p-4! shadow-sm! sm:p-5!">
        <div className="animate-pulse! space-y-2.5!">
          <div className="skeleton h-10! w-full! rounded-xl!" />
          <div className="skeleton h-10! w-full! rounded-xl!" />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full! min-w-0! rounded-2xl! border! border-gray-200! bg-white! p-4! shadow-sm! transition-all! duration-200! sm:p-5!">
      <div className="flex! flex-col! gap-2.5!">
        {/* REVIEW */}

        <Button
          type="button"
          disabled={isCreating}
          onClick={onReview}
          className="inline-flex! h-10! w-full! items-center! justify-center! gap-2! rounded-xl! text-[11px]! font-semibold! transition-all! duration-150! active:scale-[0.99]!"
        >
          {isCreating ? (
            <Loader2
              size={14}
              className="animate-spin!"
            />
          ) : (
            <Eye
              size={14}
              strokeWidth={1.9}
            />
          )}

          {isCreating
            ? "Création en cours…"
            : "Vérifier le produit"}
        </Button>

        {/* CANCEL */}

        <Link
          to="/dashboard/marketplace"
          className="
            inline-flex!
            h-10!
            w-full!
            items-center!
            justify-center!
            rounded-xl!
            border!
            border-gray-200!
            bg-white!
            px-4!
            text-[11px]!
            font-semibold!
            text-gray-600!
            transition-all!
            duration-150!
            hover:border-gray-300!
            hover:bg-gray-50!
            hover:text-gray-900!
            active:scale-[0.99]!
          "
        >
          Cancel
        </Link>
      </div>
    </section>
  );
};

export default ProductActions;