import Hero from "@/components/home/Hero";
import ManagedVideosSection from "@/components/common/ManagedVideosSection";
import VillageIntro from "@/components/home/VillageIntro";
import GramUdyogPreview from "@/components/home/GramUdyogPreview";
import FestivalHighlights from "@/components/home/FestivalHighlights";
import GalleryPreview from "@/components/home/GalleryPreview";
import MapSection from "@/components/home/MapSection";
import SectionTracker from "@/components/analytics/SectionTracker";
import SEO from "@/components/common/SEO";

export default function Index() {
  return (
    <>
      <SEO
        title="मुख्य पृष्ठ — ग्राम नोहर डिजिटल पोर्टल"
        description="ग्राम नोहर (मधेपुरा, बिहार) का आधिकारिक डिजिटल मंच। नोहर विकास युवक संघ द्वारा संचालित ग्रामीण विकास, त्योहार, खेल क्लब, ग्राम उद्योग व पारदर्शी सार्वजनिक लेखा।"
        keywords="नोहर, नोहर विकास मंच, मधेपुरा, बिहार, Nohar Vikash Manch, Gram Nohar, Madhepura"
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
      <SectionTracker sectionId="home-map">
        <MapSection />
      </SectionTracker>
    </>
  );
}
