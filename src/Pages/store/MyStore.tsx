import { useState } from "react";
import StoreHeader from "@/components/store/StoreHeader";
import StoreInformationForm from "@/components/store/StoreInformationForm";
import StoreOverview from "@/components/store/StoreOverview";
import StorePublishPanel from "@/components/store/StorePublishPanel";
import StoreSidebar, { type StoreSection } from "@/components/store/StoreSidebar";
import { useStore } from "@/hooks/useStore";

const SECTION_IDS: Record<StoreSection, string> = {
  overview: "store-section-overview",
  information: "store-section-information",
  publication: "store-section-publication",
};

const MyStore = () => {
  const storeState = useStore();
  const [activeSection, setActiveSection] = useState<StoreSection>("overview");

  const selectSection = (section: StoreSection) => {
    setActiveSection(section);
    document.getElementById(SECTION_IDS[section])?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (storeState.loading) {
    return <section className="flex min-h-64 items-center justify-center text-[11px]! text-gray-500!" role="status">Chargement de votre boutique...</section>;
  }

  return (
    <div className="min-h-full! bg-[#fafafa]! px-3! py-4! sm:px-4! sm:py-5! lg:px-6! lg:py-6!">
      <div className="mx-auto! w-full! max-w-[1280px]!">
        <StoreHeader
          name={storeState.store?.name ?? ""}
          slug={storeState.store?.slug}
          status={storeState.store?.status ?? null}
          saving={storeState.saving}
          onSave={() => void storeState.save()}
          onPublish={() => selectSection("publication")}
        />

        {storeState.error && (
          <div className="mt-4 rounded-xl! border! border-red-200! bg-red-50! px-4 py-3 text-[11px]! text-red-700!" role="alert">
            {storeState.error}
          </div>
        )}

        <div className="mt-5! grid! gap-5! lg:grid-cols-[190px_minmax(0,1fr)]! lg:gap-7!">
          <aside className="min-w-0! lg:sticky! lg:top-5! lg:self-start!">
            <StoreSidebar activeSection={activeSection} onSelect={selectSection} />
          </aside>

          <main className="min-w-0! space-y-5!">
            <StoreOverview
              store={storeState.store}
              productCount={storeState.productCount}
              publishedCount={storeState.publishedProducts.length}
              onPublish={() => selectSection("publication")}
            />
            <StoreInformationForm
              values={storeState.form}
              errors={storeState.fieldErrors}
              saving={storeState.saving}
              message={storeState.message}
              onChange={storeState.updateForm}
              onSave={() => void storeState.save()}
            />
            <StorePublishPanel
              store={storeState.store}
              name={storeState.form.name}
              slug={storeState.form.slug}
              publishedCount={storeState.publishedProducts.length}
              saving={storeState.saving}
              error={storeState.error}
              message={storeState.message}
              onToggle={(published) => void storeState.setPublished(published)}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyStore;