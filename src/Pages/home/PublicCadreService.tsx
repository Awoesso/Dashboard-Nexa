import {
  Store,
  Palette,
  Package,
  Smartphone,
  ChartNoAxesCombined,
  Wallet,
} from "lucide-react";

const reasons = [
  {
    icon: Store,
    title: "Créez votre boutique",
    description:
      "Lancez votre activité et présentez vos produits sans avoir besoin de maîtriser la programmation.",
  },
  {
    icon: Palette,
    title: "Personnalisez votre boutique",
    description:
      "Choisissez un thème et créez une boutique qui reflète votre marque et votre identité.",
  },
  {
    icon: Package,
    title: "Gérez vos produits",
    description:
      "Organisez votre catalogue et gérez facilement les informations de vos produits.",
  },
  {
    icon: Smartphone,
    title: "Accessible sur tous les écrans",
    description:
      "Offrez à vos clients une expérience adaptée aux téléphones, tablettes et ordinateurs.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Suivez votre activité",
    description:
      "Retrouvez les informations essentielles de votre boutique dans un tableau de bord centralisé.",
  },
  {
    icon: Wallet,
    title: "Une offre accessible",
    description:
      "Choisissez une formule adaptée à vos besoins et faites évoluer votre activité à votre rythme.",
  },
];

export default function NexaReasons() {
  return (
    <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 py-15">
      {reasons.map(({ icon: Icon, title, description }) => (
        <article
          key={title}
          className="flex flex-col gap-5 border border-neutral-100 bg-white p-6 "
        >
          <div className="flex h-12 w-12 items-center justify-center ">
            <Icon size={25} strokeWidth={1.8} />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[17px] font-semibold text-black">
              {title}
            </h2>

            <p className="text-[15px] leading-6 text-neutral-600">
              {description}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
