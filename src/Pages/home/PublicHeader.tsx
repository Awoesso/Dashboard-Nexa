import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Btncomponents from "./Btncomponents";

const navigationLinks = [
  { label: "Produits", to: "/" },
  { label: "Tarification", to: "/" },
  { label: "Ressources", to: "/" },
  { label: "À propos", to: "/" },
];

const menuVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.22, staggerChildren: 0.09 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: 36 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
  exit: { opacity: 0, x: 24, transition: { duration: 0.16 } },
};

const PublicHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-80 flex h-17 w-full items-center justify-between bg-white/15 px-4 backdrop-blur-md sm:px-6 lg:px-24">
      <div className="flex items-center gap-10">
        <Link
          to="/"
          className="relative text-xl font-semibold text-gray-900"
          onClick={closeMenu}
        >
          Nexa
        </Link>

        <nav aria-label="Navigation principale" className="hidden gap-8 lg:flex">
          {navigationLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm text-gray-600! hover:text-blue-900!"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-6 lg:flex">
          <Link
            to="/signin"
            className="text-sm hover:text-blue-900! whitespace-nowrap"
          >
            Connexion
          </Link>
          <Link to="/signup">
            <Btncomponents label="Essayez Nexa gratuitement" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          aria-controls="public-mobile-menu"
          onClick={() => setIsOpen((open) => !open)}
          className="relative z-100 flex h-11 w-11 items-center justify-center rounded-full   text-gray-900 lg:hidden"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {isOpen ? <X size={21} /> : <Menu size={21} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      </header>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="public-mobile-menu"
              key="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu principal"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="fixed inset-x-0 bottom-0 top-17 z-1000 overflow-y-auto bg-gradient-to-b from-white to-white! text-black lg:hidden"
            >
              <div className="mx-auto flex min-h-[calc(100svh-4.25rem)] w-full max-w-7xl flex-col justify-center px-7 pb-10 pt-10 sm:px-12 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20 lg:px-24 lg:py-20">
                <div className="mb-12 lg:mb-0">
                  <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
                    Accédez à votre espace ou créez votre compte pour commencer.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link
                      to="/signin"
                      onClick={closeMenu}
                      className="text-sm font-medium text-white hover:text-blue-300"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMenu}
                      className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white! "
                    >
                      Créer un compte <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>

                <motion.nav
                  aria-label="Liens du menu"
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col"
                >
                  {navigationLinks.map((item, index) => (
                    <motion.div key={item.label} variants={linkVariants}>
                      <Link
                        to={item.to}
                        onClick={closeMenu}
                        className="group flex items-center gap-5 border-b border-white/15 py-4 text-3xl font-medium text-black transition-colors hover:text-blue-300 sm:text-4xl"
                      >
                        <span className="w-7 text-xs font-normal text-black/60">
                          0{index + 1}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        <ArrowUpRight
                          size={22}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </Link>
                    </motion.div>
                  ))}
              </motion.nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default PublicHeader;