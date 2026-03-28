import { motion } from "framer-motion";
import heroImg from "@/assets/nohar-banyan-tree.png";
import { Sprout, Users, Heart } from "lucide-react";

const highlights = [
  { icon: Sprout, title: "कृषि", desc: "धान, गेहूँ और मौसमी फसलें हमारी अर्थव्यवस्था की रीढ़ हैं।" },
  { icon: Users, title: "समुदाय", desc: "1000 से अधिक निवासी एकता और सद्भाव के साथ मिलकर जीवन का आनंद लेते हैं" },
  { icon: Heart, title: "शांति", desc: "एक ऐसा गाँव जो शांतिपूर्ण सहअस्तित्व और आपसी सम्मान के लिए जाना जाता है।" },
];

export default function VillageIntro() {
  return (
    <section className="py-14 sm:py-20 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <img
            src={heroImg}
            alt="Sacred banyan tree and village site at Nohar"
            className="rounded-2xl shadow-card ring-1 ring-black/5 w-full"
            loading="lazy"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-primary font-semibold uppercase text-sm tracking-wide">नौहर के बारे में</span>
          <h2 className="text-section font-display font-bold mt-2 mb-4 text-foreground">
            हमारा गाँव, हमारा गौरव
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 text-[15px] sm:text-base">
            नौहर एक कृषि प्रधान गाँव है, जो पोस्ट ग्वालपारा, जिला मधेपुरा (बिहार) में स्थित है। लगभग 1000 से अधिक लोगों की आबादी वाला यह गाँव शांति, एकता और भाईचारे का प्रतीक है। यहाँ के लोग आपसी प्रेम और सहयोग के साथ जीवन व्यतीत करते हैं तथा सभी त्योहारों को सामूहिक उत्साह और उमंग के साथ मनाते हैं। गाँव के विकास, सामाजिक कार्यों और सांस्कृतिक गतिविधियों का संचालन ‘नौहर विकास युवक संघ’ द्वारा किया जाता है, जो गाँव की प्रगति और एकता को निरंतर मजबूत बनाता है।

            पूर्वजों के अनुसार ‘नौहर’ नाम का अर्थ ‘नौ देवताओं का अवतार’ माना जाता है। यह गाँव अपनी गहरी धार्मिक आस्था और देवी-देवताओं की कृपा के लिए प्रसिद्ध है। यहाँ अनेक पवित्र देवस्थल स्थित हैं, जैसे — काली माता, भोले शंकरदानी, ब्रह्म स्थान, त्रिलोकी बाबा, लक्ष्मी नारायण बाबा, पंचमुखी हनुमान जी महाराज, बूढ़ी स्थान, दुर्गा जी तथा कार्तिक महाराज।

            इन सभी देवस्थलों की उपस्थिति नौहर गाँव को एक विशेष आध्यात्मिक पहचान प्रदान करती है। यहाँ श्रद्धालु दूर-दूर से आकर पूजा-अर्चना करते हैं और आशीर्वाद प्राप्त करते हैं, जिससे यह स्थान आस्था, श्रद्धा और संस्कृति का प्रमुख केंद्र बना हुआ है।"
          </p>
          <div className="space-y-4">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                  <h.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">{h.title}</h4>
                  <p className="text-sm text-muted-foreground">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
