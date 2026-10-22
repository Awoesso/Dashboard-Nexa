import Btncomponents from "./Btncomponents";
import "./PublicHome.css";

const PublicHero = () => {
  return (
    <section className=" grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 my-16 p-4 lg:py-12 ">
      <div className=" reveal flex flex-col justify-end items-center lg:items-start gap-5">
        <div>naza</div>
        <h1 className="text-6xl flex items-center lg:items-start  text-black!  ">
          Le logiciel métier pour les agences de conception
        </h1>
        <p className="text-[17px]! text-black ">
          Conçu pour simplifier la gestion de projet, ravir les clients et
          augmenter la rentabilité. Réservez votre démo gratuite ou
          inscrivez-vous dès aujourd’hui et bénéficiez de 30 % de
          réduction.{" "}
        </p>

        <div className="flex flex-wrap gap-4">
          <Btncomponents label="Commencer" />
          <Btncomponents label="Réserver une démo" />
        </div>
      </div>
      <div className=" reveal delay-200">
        <img src="/HeroImage.webp" alt="" />
      </div>
    </section>
  );
};

export default PublicHero;
