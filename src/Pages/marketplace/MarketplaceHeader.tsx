

type MarketplaceHeaderProps = {
  isLoading?: boolean;
};

const MarketplaceHeaderSkeleton = () => {
  return (
    <div className="flex! min-w-0! items-center! justify-between! gap-3!">
      <div className="min-w-0! flex-1!">
        <div className="skeleton h-4! w-28! sm:h-5! sm:w-32!" />
        <div className="skeleton mt-1.5! h-2.5! w-48! max-w-full!" />
      </div>

      <div className="skeleton h-9! w-24! shrink-0! rounded-lg!" />
    </div>
  );
};

const MarketplaceHeader = ({
  isLoading = false,
}: MarketplaceHeaderProps) => {
  if (isLoading) {
    return <MarketplaceHeaderSkeleton />;
  }

  return (
    <header
      className="
        flex!
        min-w-0!
        items-center!
        justify-between!
        gap-3!
      "
    >
      <div className="min-w-0!">
        <div className="flex! min-w-0! items-center! gap-2!">
         

          <div className="min-w-0!">
            <h1
              className="app-page-title text-gray-800!"
            >
              Catalogue de produits
            </h1>

            <p
              className="app-page-description mt-0.5! truncate! text-gray-500!"
            >
              Consultez et gérez les produits de votre boutique.
            </p>
          </div>
        </div>
      </div>

     
    </header>
  );
};

export default MarketplaceHeader;