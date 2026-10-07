import Hero from "@/components/home/Hero";
import ManagedVideosSection from "@/components/common/ManagedVideosSection";
import VillageIntro from "@/components/home/VillageIntro";
import GramUdyogPreview from "@/components/home/GramUdyogPreview";
import FestivalHighlights from "@/components/home/FestivalHighlights";
import GalleryPreview from "@/components/home/GalleryPreview";
import VillageHeritage from "@/components/home/VillageHeritage";
import MapSection from "@/components/home/MapSection";
import SectionTracker from "@/components/analytics/SectionTracker";
import SEO from "@/components/common/SEO";

export default function Index() {
  return (
    <>
      <SEO
        title="Home — Nohar Digital Portal"
        description="Official digital portal of Village Nohar, Madhepura, Bihar. Managed by Nohar Vikash Yuvak Sangh for rural development, cultural festivals, sports, and transparent accounting."
        keywords="Nohar, Nohar Vikash Manch, Madhepura, Bihar, Village Nohar, Nohar Vikash Yuvak Sangh"
      />
      <SectionTracker sectionId="home-hero">
        <Hero />
      </SectionTracker>
      <ManagedVideosSection placement="home" heading="Videos" />
      <SectionTracker sectionId="home-intro">
        <VillageIntro />
      </SectionTracker>
      <SectionTracker sectionId="home-gram-udyog">
        <GramUdyogPreview />
      </SectionTracker>
      <SectionTracker sectionId="home-festivals">
        <FestivalHighlights />
      </SectionTracker>
      <SectionTracker sectionId="home-gallery">
        <GalleryPreview />
      </SectionTracker>
      <SectionTracker sectionId="home-heritage">
        <VillageHeritage />
      </SectionTracker>
      <SectionTracker sectionId="home-map">
        <MapSection />
      </SectionTracker>
    </>
  );
}
