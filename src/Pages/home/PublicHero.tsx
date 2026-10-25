import Btncomponents from "./Btncomponents";
import "./PublicHome.css";

const PublicHero = () => {
  return (
    <section className=" grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 my-16 p-4 lg:py-12 ">
      <div className="flex flex-col justify-end items-center lg:items-start gap-5">
        <h1 className="text-6xl flex items-center lg:items-start  text-black!  ">
          Votre boutique en ligne, simplement
        </h1>
        <p className="text-[17px]! text-black ">
          Créez votre boutique, présentez vos produits et suivez votre activité
          depuis un espace conçu pour vous accompagner au quotidien.
        </p>

        <div className="flex flex-wrap gap-4">
          <Btncomponents label="Créer votre compte" />
          <Btncomponents label="Découvrir les fonctionnalités" />
        </div>
      </div>
      <div>
        <img
          src="/HeroImage.webp"
          alt=""
          width={1600}
          height={978}
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
};

export default PublicHero;
