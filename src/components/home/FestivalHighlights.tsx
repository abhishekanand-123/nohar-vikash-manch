import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import diwaliImg from "@/assets/diwali.jpg";
import holiImg from "@/assets/holi.jpg";
import chhathImg from "@/assets/chhath.jpg";
import kalipujaImg from "@/assets/kalipuja.jpg";
import ramnavamiImg from "@/assets/ramnavami.jpg";

const festivals = [
  { name: "Ramnavami", image: ramnavamiImg, desc: "Grand celebration at Lakshmi Narayan Aasthan" },
  { name: "Diwali", image: diwaliImg, desc: "Festival of lights celebrated with community feasts" },
  { name: "Holi", image: holiImg, desc: "Colors of joy across every lane of Nohar" },
  { name: "Chhath Puja", image: chhathImg, desc: "Sacred offerings to the Sun God" },
  { name: "Kali Puja", image: kalipujaImg, desc: "Night of devotion and spiritual energy" },
];

export default function FestivalHighlights() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold uppercase text-sm tracking-wide">Our Celebrations</span>
          <h2 className="text-section font-display font-bold mt-2 text-foreground">
            Festivals We Celebrate Together
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {festivals.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to="/festivals"
                className="block bg-card rounded-xl overflow-hidden shadow-card ring-1 ring-border hover:shadow-lg transition-shadow group"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg text-foreground">{f.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
