import PublicCadreService from "./PublicCadreService";
import PublicHeader from "./PublicHeader";
import  PublicHero from "./PublicHero";
import "./PublicHome.css";
import PublicFooter from "./PublicFooter";

const PublicHome = () => {
  return (
    <main className=" px-4 sm:px-6 lg:px-24 ">
      <div className="h-17">
        <PublicHeader />
      </div>

      <section className=" px-6 sm:px-8 ">
        <PublicHero />
        <PublicCadreService />
        <PublicFooter/>
      </section>
    </main>
  );
};

export default PublicHome;