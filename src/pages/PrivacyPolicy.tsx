import { motion } from "framer-motion";
import PageBanner from "@/components/layout/PageBanner";
import SEO from "@/components/common/SEO";
import { ShieldCheck, Lock, Cookie, Eye, Mail, Phone, MapPin, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  const lastUpdated = "22 October 2026";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="गोपनीयता नीति (Privacy Policy) — Nohar Vikash Manch"
        description="नोहर विकास मंच (Nohar Vikash Manch) की आधिकारिक गोपनीयता नीति। जानें कि हम उपयोगकर्ता डेटा, कुकीज़ और Google AdSense विज्ञापनों का प्रबंधन कैसे करते हैं।"
        keywords="privacy policy, nohar vikash manch privacy, गोपनीयता नीति, नोहर विकास मंच, google adsense privacy policy, nohar gwalpara"
      />

      <PageBanner
        pageKey="privacy"
        title="गोपनीयता नीति (Privacy Policy)"
        subtitle="नोहर विकास मंच आपके डेटा की सुरक्षा, पारदर्शिता और निजता के प्रति पूर्णतः समर्पित है।"
        icon={ShieldCheck}
      />

      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-3xl border border-border/80 shadow-card p-6 sm:p-10 md:p-12 space-y-8 text-foreground"
        >
          {/* Header Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 font-medium text-foreground">
              <FileText className="w-4 h-4 text-primary" />
              आधिकारिक नीति दस्तावेज़ (Official Legal Document)
            </span>
            <span>अंतिम संशोधन: <strong>{lastUpdated}</strong></span>
          </div>

          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
              प्रस्तावना (Introduction)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <strong>नोहर विकास मंच</strong> (https://noharvikashmanch.in) <strong>नोहर विकास युवक संघ</strong> (ग्राम नौहर, प्रखंड ग्वालपाड़ा, जिला मधेपुरा, बिहार) द्वारा संचालित एक गैर-व्यावसायिक ग्रामीण विकास, सांस्कृतिक और सामाजिक डिजिटल मंच है।
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              At Nohar Vikash Manch, accessible from https://noharvikashmanch.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Nohar Vikash Manch and how we use it.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
              हम कौन सी जानकारी एकत्र करते हैं (Information We Collect)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              जब आप हमारी वेबसाइट का उपयोग करते हैं, तो हम निम्नलिखित प्रकार की जानकारी एकत्र कर सकते हैं:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>स्वैच्छिक व्यक्तिगत जानकारी:</strong> जब आप ग्राम उद्योग डायरेक्टरी में नाम दर्ज कराते हैं, दान (Donation) करते हैं या संपर्क फ़ॉर्म भरते हैं, तो आपका नाम, फ़ोन नंबर, ईमेल और पता।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>लॉग फ़ाइलें (Log Files):</strong> IP पता, ब्राउज़र प्रकार, इंटरनेट सेवा प्रदाता (ISP), तारीख और समय का मोहर, रेफरिंग/एग्जिट पेज और क्लिक्स की संख्या (यह डेटा गैर-व्यक्तिगत होता है और केवल साइट विश्लेषण हेतु उपयोग होता है)।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>डिवाइस जानकारी:</strong> स्क्रीन रिज़ॉल्यूशन, ऑपरेटिंग सिस्टम और डिवाइस मॉडल ताकि मोबाइल व डेस्कटॉप दोनों पर बेहतर अनुभव दिया जा सके।</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Google AdSense & DoubleClick Cookie (Crucial for AdSense) */}
          <section className="space-y-3 bg-secondary/30 rounded-2xl p-5 sm:p-6 border border-border">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <Cookie className="w-6 h-6 text-accent" />
              Google AdSense और तृतीय-पक्ष विज्ञापन (Google AdSense & DoubleClick Cookie)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Google हमारी साइट पर एक तृतीय-पक्ष विक्रेता (Third-Party Vendor) है। यह हमारी साइट पर विज्ञापनों को प्रदर्शित करने के लिए कुकीज़ (Cookies), विशेष रूप से DART कुकीज़ का उपयोग करता है:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground list-disc pl-5">
              <li>
                Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to noharvikashmanch.in and/or other sites on the Internet.
              </li>
              <li>
                उपयोगकर्ता Google विज्ञापन सेटिंग्स पर जाकर व्यक्तिगत विज्ञापनों (Personalized Advertising) को अक्षम (Opt-out) कर सकते हैं:{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold underline"
                >
                  https://www.google.com/settings/ads
                </a>
              </li>
              <li>
                वैकल्पिक रूप से, आप{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold underline"
                >
                  www.aboutads.info
                </a>{" "}
                पर जाकर तीसरे पक्ष के वेंडर्स द्वारा रुचि-आधारित विज्ञापन के लिए कुकीज़ के उपयोग से बाहर निकल सकते हैं।
              </li>
            </ul>
          </section>

          {/* Section 4: Cookies & Web Beacons */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
              कुकीज़ और वेब बीकन (Cookies and Web Beacons)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              किसी भी अन्य वेबसाइट की तरह, Nohar Vikash Manch 'cookies' का उपयोग करता है। इन कुकीज़ का उपयोग आगंतुकों की प्राथमिकताओं (जैसे भाषा चयन Hindi/English/Maithili) और वेबसाइट के उन पेजों की जानकारी संग्रहीत करने के लिए किया जाता है जिन्हें विज़िटर ने एक्सेस किया है।
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              आप अपने ब्राउज़र की सेटिंग्स के माध्यम से कुकीज़ को निष्क्रिय करना चुन सकते हैं। विशिष्ट वेब ब्राउज़रों के साथ कुकी प्रबंधन के बारे में अधिक विस्तृत जानकारी ब्राउज़र की संबंधित वेबसाइटों पर मिल सकती है।
            </p>
          </section>

          {/* Section 5: Third Party Privacy Policies */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">5</span>
              तृतीय-पक्ष गोपनीयता नीतियां (Third Party Privacy Policies)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Nohar Vikash Manch की गोपनीयता नीति अन्य विज्ञापनदाताओं या वेबसाइटों पर लागू नहीं होती है। इसलिए, हम आपको अधिक विस्तृत जानकारी के लिए इन तृतीय-पक्ष विज्ञापन सर्वरों (जैसे Google AdSense, YouTube, आदि) की संबंधित गोपनीयता नीतियों से परामर्श करने की सलाह देते हैं।
            </p>
          </section>

          {/* Section 6: Children's Information (COPPA) */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">6</span>
              बच्चों की सुरक्षा (Children's Information)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              इंटरनेट का उपयोग करते समय बच्चों के लिए सुरक्षा जोड़ना हमारी प्राथमिकता का एक और हिस्सा है। Nohar Vikash Manch 13 वर्ष से कम उम्र के बच्चों से जानबूझकर कोई भी व्यक्तिगत पहचान योग्य जानकारी एकत्र नहीं करता है। यदि आपको लगता है कि आपके बच्चे ने हमारी वेबसाइट पर इस प्रकार की जानकारी प्रदान की है, तो हम आपको तुरंत हमसे संपर्क करने के लिए प्रोत्साहित करते हैं और हम तुरंत ऐसी जानकारी को हटाने का प्रयास करेंगे।
            </p>
          </section>

          {/* Section 7: Data Security */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <Lock className="w-6 h-6 text-primary" />
              डेटा सुरक्षा (Data Security)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              हम आपके व्यक्तिगत डेटा को अनधिकृत पहुंच, परिवर्तन, प्रकटीकरण या विनाश से बचाने के लिए सुरक्षित HTTPS एन्क्रिप्शन, सुरक्षित डेटाबेस और आधुनिक उद्योग मानकों का पालन करते हैं।
            </p>
          </section>

          {/* Section 8: Consent */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">8</span>
              सहमति (Consent)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              हमारी वेबसाइट का उपयोग करके, आप हमारी गोपनीयता नीति के लिए अपनी सहमति देते हैं और इसके नियमों से सहमत होते हैं।
            </p>
          </section>

          {/* Section 9: Contact Us */}
          <section className="pt-6 border-t border-border space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              संपर्क करें (Contact Us)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              यदि आपके पास हमारी गोपनीयता नीति के संबंध में कोई प्रश्न या सुझाव हैं, तो कृपया हमसे संपर्क करने में संकोच न करें:
            </p>
            <div className="bg-secondary/40 rounded-2xl p-5 sm:p-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span>संस्था:</span>
                <span>नोहर विकास युवक संघ (Nohar Vikash Yuvak Sangh)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>ग्राम नौहर, पोस्ट ग्वालपाड़ा (Nohar, Gwalpara), जिला मधेपुरा, बिहार - 852115</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:abhi96anand@gmail.com" className="text-primary hover:underline">
                  abhi96anand@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+918770824752" className="text-primary hover:underline">
                  +91 8770824752
                </a>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
