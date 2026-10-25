import {
  AlertCircle,
  RotateCcw,
} from "lucide-react";

type MarketplaceErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

const MarketplaceErrorState = ({
  message = "Nous ne pouvons pas charger vos produits pour le moment.",
  onRetry,
}: MarketplaceErrorStateProps) => {
  return (
    <div
      className="
        flex!
        min-h-[320px]!
        items-center!
        justify-center!
        px-4!
        py-10!
        sm:min-h-[380px]!
      "
    >
      <div className="w-full! max-w-sm! text-center!">
        <div
          className="
            mx-auto!
            flex!
            h-11!
            w-11!
            items-center!
            justify-center!
            rounded-xl!
            border!
            border-gray-200!
            bg-white!
            text-gray-400!
          "
        >
          <AlertCircle
            size={20}
            strokeWidth={1.7}
          />
        </div>

        <h3
          className="
            mt-3!
            font-heading!
            text-sm!
            font-semibold!
            tracking-tight!
            text-gray-900!
          "
        >
          Une erreur est survenue
        </h3>

        <p
          className="
            mt-1.5!
            text-[10px]!
            leading-5!
            text-gray-500!
            sm:text-[11px]!
          "
        >
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="
              mt-4!
              inline-flex!
              h-9!
              items-center!
              justify-center!
              gap-1.5!
              rounded-lg!
              border!
              border-gray-200!
              bg-white!
              px-3!
              text-[10px]!
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
            <RotateCcw
              size={12}
              strokeWidth={1.9}
            />

            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

export default MarketplaceErrorState;