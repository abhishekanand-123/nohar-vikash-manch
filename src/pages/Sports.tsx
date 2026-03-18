import { motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import sportsImg from "@/assets/sports.jpg";

const tournaments = [
  { name: "Nohar Premier League (Cricket)", status: "Upcoming", date: "April 2026" },
  { name: "Inter-Village Football Cup", status: "Completed", date: "January 2026" },
  { name: "Kabaddi Championship", status: "Upcoming", date: "May 2026" },
];

export default function Sports() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-primary font-semibold uppercase text-sm tracking-wide">Sports</span>
          <h1 className="text-section font-display font-bold mt-2 text-foreground">Nohar Sports Club</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Managed by Nohar Vikash Yuvak Sangh, our Sports Club promotes cricket, football, and other sports among the youth of Nohar.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <img src={sportsImg} alt="Village cricket match" className="rounded-2xl shadow-card w-full" loading="lazy" />
          <div>
            <h2 className="font-display font-bold text-2xl mb-4 text-foreground">Our Activities</h2>
            <div className="space-y-4">
              {[
                { icon: Trophy, title: "Cricket", desc: "Regular practice sessions and inter-village tournaments organized throughout the year." },
                { icon: Users, title: "Football", desc: "Football matches are played on the village ground with teams from neighboring areas." },
              ].map((a) => (
                <div key={a.title} className="flex items-start gap-4 bg-card rounded-xl p-5 shadow-card ring-1 ring-border">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <a.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{a.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
