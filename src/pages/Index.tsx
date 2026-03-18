import Hero from "@/components/home/Hero";
import VillageIntro from "@/components/home/VillageIntro";
import FestivalHighlights from "@/components/home/FestivalHighlights";
import GalleryPreview from "@/components/home/GalleryPreview";
import MapSection from "@/components/home/MapSection";

export default function Index() {
  return (
    <>
      <Hero />
      <VillageIntro />
      <FestivalHighlights />
      <GalleryPreview />
      <MapSection />
    </>
  );
}
