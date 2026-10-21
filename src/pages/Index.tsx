import Hero from "@/components/home/Hero";
import ManagedVideosSection from "@/components/common/ManagedVideosSection";
import VillageIntro from "@/components/home/VillageIntro";
import GramUdyogPreview from "@/components/home/GramUdyogPreview";
import FestivalHighlights from "@/components/home/FestivalHighlights";
import GalleryPreview from "@/components/home/GalleryPreview";
import VillageHeritage from "@/components/home/VillageHeritage";
import DoctorsDirectory from "@/components/home/DoctorsDirectory";
import MapSection from "@/components/home/MapSection";
import SectionTracker from "@/components/analytics/SectionTracker";
import SEO from "@/components/common/SEO";

export default function Index() {
  return (
    <>
      <SEO
        title="ग्राम नौहर, ग्वालपाड़ा (मधेपुरा, बिहार) — Nohar, Gwalpara"
        description="ग्राम नौहर, ग्वालपाड़ा (मधेपुरा, बिहार) का आधिकारिक डिजिटल मंच — Nohar Vikash Manch। नोहर विकास युवक संघ द्वारा संचालित ग्रामीण विकास, त्योहार, खेल क्लब, ग्राम उद्योग व पारदर्शी सार्वजनिक लेखा।"
        keywords="nohar, gwalpara, nohar gwalpara, nohar vikash, nohar vikash manch, gram nohar, nohar madhepura, gwalpara madhepura, nauhar, nohar bihar, नौहर, ग्वालपाड़ा, ग्वालपारा, मधेपुरा, बिहार, नोहर विकास मंच"
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
      <SectionTracker sectionId="home-doctors">
        <DoctorsDirectory />
      </SectionTracker>
      <SectionTracker sectionId="home-map">
        <MapSection />
      </SectionTracker>
    </>
  );
}
