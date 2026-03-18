import { motion } from "framer-motion";
import heroImg from "@/assets/hero-village.jpg";
import { Sprout, Users, Heart } from "lucide-react";

const highlights = [
  { icon: Sprout, title: "Agriculture", desc: "Rice, wheat, and seasonal crops form the backbone of our economy." },
  { icon: Users, title: "Community", desc: "1,000+ residents living in harmony, celebrating life together." },
  { icon: Heart, title: "Peace", desc: "A village known for its peaceful coexistence and mutual respect." },
];

export default function VillageIntro() {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <img
            src={heroImg}
            alt="Nohar Village landscape"
            className="rounded-2xl shadow-card w-full"
            loading="lazy"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-primary font-semibold uppercase text-sm tracking-wide">About Nohar</span>
          <h2 className="text-section font-display font-bold mt-2 mb-4 text-foreground">
            Our Village, Our Pride
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Nohar is an agriculture-based village located in Post Gwalpara, District Madhepura, Bihar.
            With a population of over 1,000 people, we live peacefully and celebrate every festival together.
            Our village development and social activities are managed by the organization "Nohar Vikash Yuvak Sangh."
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
