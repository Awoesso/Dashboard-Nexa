import {
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  User,
  Menu,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useEffect, useRef, useState } from "react";
import NotificationCenter from "@/components/Notifications/NotificationCenter";

interface UserMenuPillProps {
  avatarUrl: string;
  altText?: string;
  className?: string;
}

const UserMenuPill = ({
  avatarUrl,
  altText = "User avatar",
  className = "",
}: UserMenuPillProps) => {
  const [open, setOpen] = useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "click",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative! inline-block! text-left!"
    >
      {/* ================= USER BUTTON ================= */}

      <button
        type="button"
        aria-label="Ouvrir le menu du compte"
        aria-expanded={open}
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className={`
          inline-flex!
          h-9!
          items-center!
          gap-1.5!
          rounded-full!
          border!
          border-gray-200!
          bg-white!
          p-1!
          pr-1.5!
          transition-all!
          hover:border-gray-300!
          hover:bg-gray-50!
          focus:outline-none!
          focus:ring-2!
          focus:ring-orange-500/20!

          sm:h-10!
          sm:gap-2!
          sm:pr-2!

          ${className}
        `}
      >
        <img
          src={avatarUrl}
          alt={altText}
          className="
            h-7!
            w-7!
            rounded-full!
            object-cover!

            sm:h-8!
            sm:w-8!
          "
        />

        <ChevronDown
          size={15}
          className={`
            text-gray-500!
            transition-transform!
            duration-200!

            sm:size-[16px]!

            ${open ? "rotate-180!" : ""}
          `}
        />
      </button>

      {/* ================= DROPDOWN ================= */}

      {open && (
        <div
          className="
            absolute!
            right-0!
            z-50!
            mt-2!
            w-44!
            origin-top-right!
            rounded-xl!
            border!
            border-gray-200!
            bg-white!
            p-1.5!
            shadow-lg!
            ring-1!
            ring-black/5!

            sm:w-48!
          "
        >
          {/* Profile */}

          <button
            type="button"
            className="
              flex!
              w-full!
              items-center!
              gap-2!
              rounded-lg!
              px-2.5!
              py-2.5!
              text-left!
              text-[12px]!
              font-medium!
              text-gray-700!
              transition-colors!
              hover:bg-gray-100!

              sm:px-3!
              sm:text-sm!
            "
          >
            <User
              size={15}
              className="shrink-0! text-gray-500!"
            />

            <span>Profil</span>
          </button>

          {/* Settings */}

          <Link
          to="/dashboard/settings"
            type="button"
            className="
              flex!
              w-full!
              items-center!
              gap-2!
              rounded-lg!
              px-2.5!
              py-2.5!
              text-left!
              text-[12px]!
              font-medium!
              text-gray-700!
              transition-colors!
              hover:bg-gray-100!

              sm:px-3!
              sm:text-sm!
            "
          >
            <Settings
              size={15}
              className="shrink-0! text-gray-500!"
            />

            <span>Paramètres</span>
          </Link>

          <div className="my-1! h-px! bg-gray-100!" />

          {/* Logout */}

          <button
            type="button"
            className="
              flex!
              w-full!
              items-center!
              gap-2!
              rounded-lg!
              px-2.5!
              py-2.5!
              text-left!
              text-[12px]!
              font-medium!
              text-red-500!
              transition-colors!
              hover:bg-red-50!

              sm:px-3!
              sm:text-sm!
            "
          >
            <LogOut
              size={15}
              className="shrink-0!"
            />

            <span>Se déconnecter</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({
  onMenuClick,
}: NavbarProps) => {
  return (
    <header
      className="
        sticky!
        top-0!
        z-30!
        flex!
        h-16!
        w-full!
        items-center!
        justify-between!
        gap-2!
        border-b!
        border-gray-200!
        bg-[#fafafa]!
        px-3!
        py-2!

        sm:gap-3!
        sm:px-4!

        lg:px-5!
      "
    >
      {/* ================= LEFT SIDE ================= */}

      <div className="flex! min-w-0! items-center! gap-2!">

        {/* ================= MOBILE BURGER ================= */}

       <button
  type="button"
  onClick={onMenuClick}
  aria-label="Ouvrir le menu de navigation"
  className="
    group
    flex!
    h-9!
    w-9!
    shrink-0!
    items-center!
    justify-center!
    rounded-lg!
    
  
    text-gray-600!
    transition-all!
    duration-200!
    ease-out!


    active:scale-90!

    focus:outline-none!
    focus:ring-2!
    focus:ring-blue-500/20!

    lg:hidden!
  "
>
  <Menu
    size={18}
    strokeWidth={2}
    className="
      transition-transform!
      duration-200!
      group-hover:scale-105!
    "
  />
</button>

        {/* ================= TITLE ================= */}

        <h1
          className="
            min-w-0!
            truncate!
            text-base!
            font-semibold!
            text-gray-600!

            sm:text-xl!
          "
        >
          Tableau de bord
        </h1>
      </div>

      {/* ================= ACTIONS ================= */}

      <div
        className="
          flex!
          shrink-0!
          items-center!
          gap-1.5!

          sm:gap-3!

          lg:gap-4!
        "
      >
        {/* ================= NOTIFICATIONS ================= */}

        <NotificationCenter />

        {/* ================= USER ================= */}

        <UserMenuPill
          avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
        />

        {/* ================= ADD PRODUCT ================= */}

    
           <Link
              to="/dashboard/products/new"
              className="
                inline-flex!
                h-9!
                w-10!
                sm:w-auto!
                shrink-0!
                items-center!
                justify-center!
                gap-1.5!
                rounded-full!
                bg-blue-600!
                p-0!
                sm:px-3.5!
                text-[10px]!
                font-semibold!
                text-white!
                transition-all!
                duration-150!
                hover:bg-blue-700!
                active:scale-[0.99]!
                sm:text-[11px]!
              "
            >
              <Plus
                size={16}
                strokeWidth={2}
              />
    
              <span className="hidden sm:inline">Ajouter un produit</span>
            </Link>
      </div>
    </header>
  );
};

export default Navbar;