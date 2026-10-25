import {
  Check,
  Globe,
  Lock,
} from "lucide-react";

import type { ReactNode } from "react";
import type { ProductStatus } from "./ProductsNew";

interface Props {
  status: ProductStatus;
  onChange: (status: ProductStatus) => void;
  loading?: boolean;
}

const ProductPublication = ({
  status,
  onChange,
  loading = false,
}: Props) => {
  /* =========================================================
     SKELETON
  ========================================================= */

  if (loading) {
    return (
      <section className="w-full! min-w-0! rounded-2xl! border! border-gray-200! bg-white! p-4! shadow-sm! sm:p-5!">
        <div className="animate-pulse! space-y-3!">
          <div className="skeleton h-3.5! w-24! rounded-md!" />

          <div className="skeleton h-[66px]! w-full! rounded-2xl!" />

          <div className="skeleton h-[66px]! w-full! rounded-2xl!" />
        </div>
      </section>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="w-full! min-w-0! rounded-2xl! border! border-gray-200! bg-white! p-4! shadow-sm! transition-all! duration-200! sm:p-5!">
      <div className="mb-4!">
        <h2 className="font-heading! text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!">
          Publication
        </h2>

        <p className="mt-0.5! text-[10px]! font-medium! text-gray-500! sm:text-[11px]!">
          Choisissez la manière dont ce produit apparaîtra dans votre boutique.
        </p>
      </div>

      <div className="space-y-2!">
        <PublicationOption
          active={status === "draft"}
          icon={<Lock size={15} strokeWidth={1.9} />}
          title="Brouillon"
          description="Le produit reste privé."
          onClick={() => onChange("draft")}
        />

        <PublicationOption
          active={status === "published"}
          icon={<Globe size={15} strokeWidth={1.9} />}
          title="Publié"
          description="Le produit est visible dans votre boutique."
          onClick={() => onChange("published")}
        />
      </div>
    </section>
  );
};

interface PublicationOptionProps {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const PublicationOption = ({
  active,
  icon,
  title,
  description,
  onClick,
}: PublicationOptionProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        flex!
        w-full!
        min-w-0!
        items-center!
        justify-between!
        gap-3!
        rounded-2xl!
        border!
        p-3!
        text-left!
        transition-all!
        duration-150!
        active:scale-[0.99]!
        focus:outline-none!
        focus:ring-2!
        focus:ring-blue-600/20!
        ${
          active
            ? "border-blue-200! bg-blue-50/50! ring-1! ring-blue-500/20!"
            : "border-gray-200! bg-[#fafafa]! hover:border-gray-300! hover:bg-white!"
        }
      `}
    >
      <div className="flex! min-w-0! flex-1! items-center! gap-2.5!">
        {/* ICON */}

        <span
          className={`
            flex!
            h-8!
            w-8!
            shrink-0!
            items-center!
            justify-center!
            rounded-xl!
            border!
            transition-colors!
            duration-150!
            ${
              active
                ? "border-blue-200! bg-white! text-blue-600!"
                : "border-gray-200! bg-white! text-gray-500!"
            }
          `}
        >
          {icon}
        </span>

        {/* TEXT */}

        <span className="min-w-0!">
          <span
            className={`
              block!
              truncate!
              text-[11px]!
              font-semibold!
              sm:text-xs!
              ${
                active
                  ? "text-blue-700!"
                  : "text-gray-900!"
              }
            `}
          >
            {title}
          </span>

          <span className="mt-0.5! block! truncate! text-[9px]! font-medium! text-gray-500! sm:text-[10px]!">
            {description}
          </span>
        </span>
      </div>

      {/* CHECK */}

      <span
        className={`
          flex!
          h-5!
          w-5!
          shrink-0!
          items-center!
          justify-center!
          rounded-full!
          border!
          transition-all!
          duration-150!
          ${
            active
              ? "border-blue-600! bg-blue-600! text-white!"
              : "border-gray-200! bg-white! text-transparent!"
          }
        `}
      >
        <Check
          size={11}
          strokeWidth={3}
        />
      </span>
    </button>
  );
};

export default ProductPublication;