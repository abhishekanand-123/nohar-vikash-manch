import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  MapPin,
  ExternalLink,
  PhoneCall,
  Activity,
  HeartPulse,
  Baby,
  Eye,
  Bone,
  Building2,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
} from "lucide-react";

interface CityInfo {
  id: string;
  nameEn: string;
  nameHi: string;
  distance: string;
  justdialUrl: string;
  description: string;
  badge: string;
  keyHospitals: string[];
}

interface DoctorCategory {
  id: string;
  titleHi: string;
  titleEn: string;
  icon: typeof Stethoscope;
  description: string;
  commonIssues: string[];
  recommendedCity: string;
}

const CITIES: CityInfo[] = [
  {
    id: "madhepura",
    nameEn: "Madhepura",
    nameHi: "मधेपुरा",
    distance: "~22 किमी (निकटतम जिला मुख्यालय)",
    justdialUrl:
      "https://www.justdial.com/Madhepura/Doctors/nct-10892680?trkid=49873-remotecity-fcat-catsle&term=Doctors&cbflg=&",
    description:
      "जननायक कर्पूरी ठाकुर मेडिकल कॉलेज अस्पताल (JNKTMCH), सदर अस्पताल मधेपुरा एवं मुख्य बाजार स्थित सभी अनुभवी डॉक्टर्स व पैथोलॉजी लैब्स।",
    badge: "निकटतम (Nearest)",
    keyHospitals: ["JNKTMCH मेडिकल कॉलेज", "सदर अस्पताल मधेपुरा", "कॉलेज चौक व बाजार क्लीनिक्स"],
  },
  {
    id: "saharsa",
    nameEn: "Saharsa",
    nameHi: "सहरसा",
    distance: "~38 किमी (समीपी मुख्य चिकित्सा केंद्र)",
    justdialUrl:
      "https://www.justdial.com/Saharsa/Doctors/nct-10892680?trkid=49873-remotecity-fcat-catsle&term=Doctors&cbflg=&",
    description:
      "कोसी प्रमंडल का बड़ा चिकित्सा केंद्र। सदर अस्पताल सहरसा, लॉर्ड बुद्धा कोसी मेडिकल कॉलेज, प्रसिद्ध सर्जन व बच्चों के विशेषज्ञ क्लीनिक्स।",
    badge: "कोसी प्रमंडल केंद्र",
    keyHospitals: ["सदर अस्पताल सहरसा", "लॉर्ड बुद्धा मेडिकल कॉलेज", "डी.बी. रोड व वीर कुंवर सिंह चौक"],
  },
  {
    id: "purnia",
    nameEn: "Purnia",
    nameHi: "पूर्णिया",
    distance: "~75 किमी (सीमांचल का प्रमुख सुपर स्पेशियलिटी हब)",
    justdialUrl:
      "https://www.justdial.com/Purnia/Doctors/nct-10892680?trkid=49873-remotecity-fcat-catsle&term=Doctors&cbflg=&",
    description:
      "सीमांचल का सबसे बड़ा मेडिकल हब। लाइन बाजार (Line Bazar) में 500+ विशेषज्ञ डॉक्टर, मल्टी-स्पेशियलिटी प्राइवेट अस्पताल, आईसीयू व आधुनिक जांच केंद्र।",
    badge: "सुपर-स्पेशियलिटी हब",
    keyHospitals: ["लाइन बाजार मेडिकल हब", "गवर्नमेंट मेडिकल कॉलेज पूर्णिया", "मैक्स 7 व सिटी केयर हॉस्पिटल्स"],
  },
  {
    id: "bhagalpur",
    nameEn: "Bhagalpur",
    nameHi: "भागलपुर",
    distance: "~85 किमी (अंग क्षेत्र का सबसे बड़ा मेडिकल कॉलेज)",
    justdialUrl:
      "https://www.justdial.com/Bhagalpur/Doctors/nct-10892680?trkid=49873-remotecity-fcat-catsle&term=Doctors&cbflg=&",
    description:
      "जवाहरलाल नेहरू मेडिकल कॉलेज एवं अस्पताल (JLNMCH मायागंज), तिलकामांझी व कचहरी रोड स्थित वरिष्ठ चिकित्सक व सुपर-स्पेशियलिटी सुविधाएं।",
    badge: "JLNMCH मायागंज",
    keyHospitals: ["JLNMCH (मायागंज अस्पताल)", "तिलकामांझी चौक हॉस्पिटल्स", "सदर अस्पताल भागलपुर"],
  },
];

const DOCTOR_CATEGORIES: DoctorCategory[] = [
  {
    id: "physician",
    titleHi: "जनरल फिजिशियन व सामान्य रोग",
    titleEn: "General Physician",
    icon: Stethoscope,
    description: "बुखार, सर्दी, वायरल, डायबिटीज, ब्लड प्रेशर, संक्रमण एवं पेट दर्द की प्राथमिक चिकित्सा व परामर्श।",
    commonIssues: ["वायरल फीवर व डेंगू", "बीपी व शुगर जांच", "थायराइड व कमजोरी"],
    recommendedCity: "madhepura",
  },
  {
    id: "pediatrician",
    titleHi: "बाल रोग विशेषज्ञ (शिशु रोग)",
    titleEn: "Child Specialist / Pediatrician",
    icon: Baby,
    description: "नवजात शिशु से लेकर 18 वर्ष तक के बच्चों की बीमारी, टीकाकरण, विकास व पोषण संबंधी विशेष परामर्श।",
    commonIssues: ["बच्चों का टीकाकरण", "शिशु बुखार व खांसी", "कुपोषण व विकास"],
    recommendedCity: "saharsa",
  },
  {
    id: "gynecologist",
    titleHi: "स्त्री एवं प्रसूति रोग विशेषज्ञ",
    titleEn: "Gynecologist & Obstetrician",
    icon: HeartPulse,
    description: "गर्भावस्था की देखभाल, सुरक्षित प्रसव, महिला स्वास्थ्य समस्याएं व निःसंतानता संबंधी विशेषज्ञ परामर्श।",
    commonIssues: ["गर्भावस्था नियमित चेकअप", "सुरक्षित प्रसव सुविधाएं", "महिला स्वास्थ्य"],
    recommendedCity: "madhepura",
  },
  {
    id: "orthopedic",
    titleHi: "हड्डी, जोड़ व नस रोग",
    titleEn: "Orthopedic & Spine",
    icon: Bone,
    description: "हड्डी फ्रैक्चर, जोड़ों का दर्द, आर्थराइटिस, कमर व घुटने के दर्द का आधुनिक इलाज एवं प्लास्टर/सर्जरी।",
    commonIssues: ["हड्डी टूटना (Fracture)", "गठिया व जोड़ों का दर्द", "कमर व डिस्क समस्या"],
    recommendedCity: "purnia",
  },
  {
    id: "eye",
    titleHi: "नेत्र रोग विशेषज्ञ (आँखों के डॉक्टर)",
    titleEn: "Eye Specialist / Ophthalmologist",
    icon: Eye,
    description: "मोतियाबिंद ऑपरेशन, नजर का चश्मा, आँखों की रोशनी की जांच, लाली व एलर्जी का सटीक इलाज।",
    commonIssues: ["मोतियाबिंद जांच व सर्जरी", "नजर का चश्मा", "आँखों में जलन व एलर्जी"],
    recommendedCity: "saharsa",
  },
  {
    id: "emergency",
    titleHi: "24x7 आपातकालीन व अस्पताल",
    titleEn: "Emergency & ICU Care",
    icon: Activity,
    description: "गंभीर आपातकाल, एक्सीडेंट, दिल का दौरा, सांस फूलना एवं आईसीयू व वेंटीलेटर की तत्काल सुविधा।",
    commonIssues: ["आपातकालीन आईसीयू (ICU)", "एंबुलेंस एवं ट्रॉमा केयर", "ऑक्सीजन व आपातकालीन सेवा"],
    recommendedCity: "purnia",
  },
];

export default function DoctorsDirectory() {
  const [selectedCityId, setSelectedCityId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const filteredCities = useMemo(() => {
    if (selectedCityId === "all") return CITIES;
    return CITIES.filter((c) => c.id === selectedCityId);
  }, [selectedCityId]);

  const filteredCategories = useMemo(() => {
    if (selectedCategoryId === "all") return DOCTOR_CATEGORIES;
    return DOCTOR_CATEGORIES.filter((cat) => cat.id === selectedCategoryId);
  }, [selectedCategoryId]);

  const activeCityObj = useMemo(() => {
    return CITIES.find((c) => c.id === selectedCityId) || CITIES[0];
  }, [selectedCityId]);

  return (
    <section
      id="nearest-doctors-section"
      className="py-10 sm:py-16 bg-gradient-to-b from-secondary/30 via-background to-secondary/20 relative overflow-hidden"
    >
      {/* Decorative background glows */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[450px] h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold mb-3 shadow-xs">
            <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>अपने नजदीकी डॉक्टर व स्वास्थ्य सेवाएँ</span>
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-foreground tracking-tight">
            अपने नजदीकी डॉक्टर से बात करने व इलाज के लिए{" "}
            <span className="text-primary underline decoration-primary/40 underline-offset-4">
              यहाँ संपर्क करें
            </span>
          </h2>

          <p className="mt-3 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            ग्राम नौहर (मधेपुरा) के ग्रामीण भाइयों व बहनों की सुविधा के लिए निकटवर्ती शहरों —{" "}
            <strong className="text-foreground">मधेपुरा, सहरसा, पूर्णिया एवं भागलपुर</strong> के
            सत्यापित विशेषज्ञ चिकित्सकों, क्लीनिकों व अस्पतालों की आधिकारिक सूची।
          </p>
        </div>

        {/* 24x7 Emergency Helplines Strip */}
        <div className="bg-card/90 rounded-2xl p-4 ring-1 ring-border shadow-sm mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>24x7 आपातकालीन सरकारी हेल्पलाइन नंबर्स (Toll Free):</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold border border-red-500/20 transition-colors"
                title="108 एम्बुलेंस सेवा"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 108 (एम्बुलेंस)
              </a>
              <a
                href="tel:102"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-500/20 transition-colors"
                title="102 जननी एवं शिशु एम्बुलेंस"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 102 (प्रसूति वाहन)
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold border border-primary/20 transition-colors"
                title="112 राष्ट्रीय आपातकालीन नंबर"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 112 (इमरजेंसी)
              </a>
              <a
                href="tel:1075"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground font-bold border border-border hover:bg-muted transition-colors"
                title="1075 स्वास्थ्य हेल्पलाइन"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 1075 (हेल्थ)
              </a>
            </div>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              शहर चुनें (Select City):
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              दूरी नौहर से आधारित
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCityId("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-xs ring-1 ${
                selectedCityId === "all"
                  ? "bg-primary text-primary-foreground ring-primary shadow-sm"
                  : "bg-card text-foreground ring-border hover:bg-secondary"
              }`}
            >
              🌟 सभी शहर ({CITIES.length})
            </button>
            {CITIES.map((city) => {
              const isActive = selectedCityId === city.id;
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-xs ring-1 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-primary text-primary-foreground ring-primary shadow-sm"
                      : "bg-card text-foreground ring-border hover:bg-secondary"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{city.nameHi}</span>
                  <span className="text-[10px] opacity-75 font-normal">({city.nameEn})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* City Direct Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="bg-card rounded-2xl p-4 sm:p-5 ring-1 ring-border/80 shadow-card hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    <MapPin className="w-3 h-3" /> {city.distance}
                  </span>
                  <span className="text-[10px] font-semibold text-accent px-2 py-0.5 rounded-full bg-accent/10">
                    {city.badge}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>
                    {city.nameHi}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({city.nameEn})
                    </span>
                  </span>
                </h3>

                <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                  {city.description}
                </p>

                {/* Key Hospitals Tag Pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {city.keyHospitals.map((hosp, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md font-medium"
                    >
                      {hosp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Justdial Direct Action Link */}
              <div className="mt-4 pt-3 border-t border-border">
                <a
                  href={city.justdialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-xs"
                >
                  <span>{city.nameHi} के डॉक्टर देखें</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                </a>
                <span className="text-[10px] text-muted-foreground text-center block mt-1">
                  Justdial सत्यापित डॉक्टरों की सूची
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Doctor Specialties & Category Guidance */}
        <div className="bg-card rounded-3xl p-5 sm:p-8 ring-1 ring-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                रोग व विशेषज्ञता के अनुसार डॉक्टर (Medical Specialties)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                बीमारी के अनुसार सही विशेषज्ञ डॉक्टर चुनें और तुरंत परामर्श पाएँ।
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategoryId("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategoryId === "all"
                    ? "bg-secondary text-foreground font-bold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                सभी
              </button>
              {DOCTOR_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCategoryId === c.id
                      ? "bg-secondary text-foreground font-bold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {c.titleHi.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => {
              const IconComp = cat.icon;
              const targetCity =
                selectedCityId !== "all"
                  ? activeCityObj
                  : CITIES.find((c) => c.id === cat.recommendedCity) || CITIES[0];

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-secondary/30 ring-1 ring-border/60 hover:ring-primary/40 hover:bg-secondary/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm leading-tight">
                          {cat.titleHi}
                        </h4>
                        <span className="text-[11px] text-muted-foreground">{cat.titleEn}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                      {cat.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {cat.commonIssues.map((issue, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] text-foreground/80 bg-background px-2 py-0.5 rounded-md border border-border/70"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-primary" /> {issue}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      अनुशंसित: <strong className="text-foreground">{targetCity.nameHi}</strong>
                    </span>
                    <a
                      href={targetCity.justdialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>डॉक्टर खोजें</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Helpful Note */}
          <div className="mt-6 p-4 rounded-2xl bg-primary/5 ring-1 ring-primary/20 text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <span>
                <strong>महत्वपूर्ण सूचना:</strong> किसी भी गंभीर आपातकाल या दुर्घटना की स्थिति में
                पहले <strong>108 (एम्बुलेंस)</strong> या नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC
                ग्वालपाड़ा / सदर अस्पताल मधेपुरा) से संपर्क करें।
              </span>
            </div>
            <a
              href={CITIES[0].justdialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 whitespace-nowrap self-start sm:self-auto shadow-xs"
            >
              <span>मधेपुरा के डॉक्टर अभी देखें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
