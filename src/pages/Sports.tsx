import { motion } from "framer-motion";
import { Trophy, Users, Dribbble } from "lucide-react";
import sportsImg from "@/assets/sports.jpg";
import PageBanner from "@/components/layout/PageBanner";

const tournaments = [
  { name: "Nohar Premier League (Cricket)", status: "Upcoming", date: "April 2026" },
  { name: "Inter-Village Football Cup", status: "Completed", date: "January 2026" },
  { name: "Kabaddi Championship", status: "Upcoming", date: "May 2026" },
];

export default function Sports() {
  return (
    <div>
      <PageBanner
        icon={Dribbble}
        title="Sports Club"
        subtitle="Managed by Nohar Vikash Yuvak Sangh, promoting sports and fitness in Nohar."
      />

      <div className="container mx-auto px-6 py-20">
        {/* About + Image */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-bold text-2xl mb-4 text-foreground">Nohar Sports Club</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              The Nohar Sports Club, managed by Nohar Vikash Yuvak Sangh, encourages youth participation in cricket,
              football, and other sports activities. Regular tournaments and practice sessions are organized to keep the sporting spirit alive.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Trophy, title: "Cricket" },
                { icon: Users, title: "Football" },
              ].map((a) => (
                <div key={a.title} className="flex flex-col items-center gap-2 bg-card rounded-xl px-8 py-5 shadow-card ring-1 ring-border">
                  <a.icon className="w-6 h-6 text-primary" />
                  <span className="font-display font-semibold text-foreground text-sm">{a.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={sportsImg} alt="Village cricket match" className="rounded-2xl shadow-card w-full" loading="lazy" />
          </motion.div>
        </div>

        {/* Tournaments */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-2xl mb-6 text-center text-foreground">Tournament Announcements</h2>
          <div className="space-y-3">
            {tournaments.map((t) => (
              <div key={t.name} className="bg-card rounded-xl p-5 shadow-card ring-1 ring-border flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-foreground">{t.name}</h4>
                  <p className="text-sm text-muted-foreground">{t.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  t.status === "Upcoming" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
