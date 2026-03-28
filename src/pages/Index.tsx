import Hero from "@/components/home/Hero";
import ManagedVideosSection from "@/components/common/ManagedVideosSection";
import VillageIntro from "@/components/home/VillageIntro";
import FestivalHighlights from "@/components/home/FestivalHighlights";
import GalleryPreview from "@/components/home/GalleryPreview";
import MapSection from "@/components/home/MapSection";
import SectionTracker from "@/components/analytics/SectionTracker";

export default function Index() {
  return (
    <>
      <SectionTracker sectionId="home-hero">
        <Hero />
      </SectionTracker>
      <ManagedVideosSection placement="home" heading="Videos" />
      <SectionTracker sectionId="home-intro">
        <VillageIntro />
      </SectionTracker>
      <SectionTracker sectionId="home-festivals">
        <FestivalHighlights />
      </SectionTracker>
      <SectionTracker sectionId="home-gallery">
        <GalleryPreview />
      </SectionTracker>
      <SectionTracker sectionId="home-map">
        <MapSection />
      </SectionTracker>
    </>
  );
}
