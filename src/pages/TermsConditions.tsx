import { motion } from "framer-motion";
import PageBanner from "@/components/layout/PageBanner";
import SEO from "@/components/common/SEO";
import { FileCheck, ShieldAlert, Scale, AlertCircle, Mail, Phone, MapPin, CheckCircle2, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsConditions() {
  const lastUpdated = "22 October 2026";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="नियम एवं शर्तें (Terms and Conditions) — Nohar Vikash Manch"
        description="नोहर विकास मंच (Nohar Vikash Manch) की उपयोग की शर्तें और नियम। पोर्टल के उपयोग, सामग्री, ग्राम उद्योग डायरेक्टरी, विज्ञापन व दिशानिर्देशों की विस्तृत जानकारी।"
        keywords="terms and conditions, nohar vikash manch terms, नियम एवं शर्तें, नोहर विकास मंच, user terms nohar gwalpara"
      />

      <PageBanner
        pageKey="terms"
        title="नियम एवं शर्तें (Terms & Conditions)"
        subtitle="नोहर विकास मंच के उपयोग संबंधी नियम, दिशानिर्देश और कानूनी शर्तें।"
        icon={Scale}
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
              <FileCheck className="w-4 h-4 text-primary" />
              उपयोग की शर्तें (User Agreement)
            </span>
            <span>अंतिम संशोधन: <strong>{lastUpdated}</strong></span>
          </div>

          {/* Section 1: Acceptance */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
              स्वीकृति (Acceptance of Terms)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <strong>नोहर विकास मंच</strong> (https://noharvikashmanch.in) का उपयोग करने से पहले कृपया इन नियमों और शर्तों को ध्यानपूर्वक पढ़ें। इस वेबसाइट को एक्सेस करके या इसका उपयोग करके, आप इन नियमों एवं शर्तों से पूरी तरह बाध्य होने के लिए अपनी सहमति व्यक्त करते हैं।
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this portal.
            </p>
          </section>

          {/* Section 2: Purpose */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
              मंच का उद्देश्य (Purpose of Platform)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              यह मंच <strong>नोहर विकास युवक संघ</strong> (ग्राम नौहर, ग्वालपाड़ा, मधेपुरा) द्वारा संचालित एक गैर-लाभकारी, सामाजिक व सांस्कृतिक ग्रामीण डिजिटल प्लेटफ़ॉर्म है। इसका उद्देश्य ग्राम नौहर के सामाजिक उत्थान, सांस्कृतिक पर्वों (जैसे रामनवमी, दुर्गा पूजा), खेलकूद क्लब, पारदर्शी सार्वजनिक लेखा-जोखा और स्थानीय कुशल कारीगरों की डायरेक्टरी को जन-जन तक पहुँचाना है।
            </p>
          </section>

          {/* Section 3: Directory & Public Services */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
              ग्राम उद्योग व कामगार डायरेक्टरी (Worker Directory Disclaimer)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              "ग्राम उद्योग एवं कामगार डायरेक्टरी" में सूचीबद्ध जानकारी (शिक्षक, मिस्त्री, इलेक्ट्रीशियन, स्वास्थ्यकर्मी आदि) केवल ग्रामीणों और आगंतुकों की सुविधा के लिए साझा की गई है।
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>उपयोगकर्ताओं को सलाह दी जाती है कि वे किसी भी सेवा या कार्य को लेने से पूर्व स्वयं स्तर पर व्यक्ति और दरों का सत्यापन करें।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>नोहर विकास मंच किसी भी स्वतंत्र कामगार या उपयोगकर्ता के बीच हुए व्यक्तिगत लेन-देन या कार्य की गुणवत्ता के लिए प्रत्यक्ष या अप्रत्यक्ष रूप से उत्तरदायी नहीं है।</span>
              </li>
            </ul>
          </section>

          {/* Section 4: Public Accounts & Donations */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
              पारदर्शी लेखा-जोखा व दान (Donations & Transparency)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              गाँव के विकास या पर्व-त्योहारों के निमित्त दिया जाने वाला दान पूरी तरह स्वैच्छिक है। सामाजिक शुचिता और पारदर्शिता के तहत सभी आय-व्यय का विवरण पोर्टल के <Link to="/lekha-jokha" className="text-primary font-semibold hover:underline">लेखा-जोखा (Lekha-Jokha)</Link> सेक्शन में सार्वजनिक रूप से प्रदर्शित किया जाता है।
            </p>
          </section>

          {/* Section 5: Third-Party Links & Google AdSense */}
          <section className="space-y-3 bg-secondary/30 rounded-2xl p-5 sm:p-6 border border-border">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <AlertCircle className="w-6 h-6 text-accent" />
              तृतीय-पक्ष लिंक और विज्ञापन (Third-Party Links & Google AdSense)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              इस पोर्टल पर Google AdSense या अन्य तृतीय-पक्ष विज्ञापन और बाहरी सरकारी पोर्टल्स (जैसे बिहार भूमि, भू-नक्शा आदि) के लिंक हो सकते हैं।
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We have no control over the content, privacy policies, or practices of any third-party sites or services. Clicking on any third-party link or advertisement is done solely at your own discretion.
            </p>
          </section>

          {/* Section 6: User Conduct */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">6</span>
              उपयोगकर्ता आचरण (User Conduct)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              मंच का उपयोग करते समय आप निम्नलिखित पर सहमत होते हैं:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground list-disc pl-5">
              <li>किसी भी प्रकार की भ्रामक, अश्लील, अपमानजनक या असामाजिक सामग्री प्रेषित नहीं करेंगे।</li>
              <li>वेबसाइट के सर्वर या सुरक्षा तंत्र को बाधित करने का प्रयास नहीं करेंगे।</li>
              <li>समुदाय के आपसी सौहार्द, शांति और एकता को बनाए रखने में सहयोग करेंगे।</li>
            </ul>
          </section>

          {/* Section 7: Intellectual Property */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">7</span>
              बौद्धिक संपदा (Intellectual Property)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              इस पोर्टल पर प्रकाशित गाँव के ऐतिहासिक संस्मरण, तस्वीरें, लोगो एवं सामग्री नोहर विकास युवक संघ और संबंधित योगदानकर्ताओं की बौद्धिक धरोहर हैं। व्यावसायिक उपयोग के लिए पूर्व अनुमति आवश्यक है।
            </p>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-primary" />
              दायित्व की सीमा (Limitation of Liability)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              यह पोर्टल ग्रामीण जन-कल्याण हेतु "जैसा है" (As-Is) आधार पर संचालित है। यद्यपि हम सटीक व अद्यतन जानकारी प्रदान करने का हरसंभव प्रयास करते हैं, तथापि तकनीकी त्रुटि, इंटरनेट व्यवधान या किसी अन्य अनपेक्षित क्षति के लिए मंच उत्तरदायी नहीं होगा।
            </p>
          </section>

          {/* Section 9: Governing Law */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">9</span>
              कानूनी क्षेत्राधिकार (Governing Law & Jurisdiction)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              ये नियम एवं शर्तें भारत के विधि-विधानों के अधीन शासित होंगी। किसी भी प्रकार के विवाद की स्थिति में न्यायिक क्षेत्राधिकार जिला न्यायालय मधेपुरा (बिहार), भारत होगा।
            </p>
          </section>

          {/* Section 10: Contact Us */}
          <section className="pt-6 border-t border-border space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              संपर्क सूत्र (Contact Details)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              इन नियमों और शर्तों के संबंध में किसी भी जानकारी अथवा सुझाव हेतु आप हमसे संपर्क कर सकते हैं:
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
