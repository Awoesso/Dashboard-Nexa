import { useEffect } from "react";
import PublicCadreService from "./PublicCadreService";
import PublicHeader from "./PublicHeader";
import  PublicHero from "./PublicHero";
import "./PublicHome.css";
import PublicFooter from "./PublicFooter";

const PublicHome = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

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