import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import EventCountdown from "./EventCountdown";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-8 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-accent font-semibold tracking-wide uppercase text-sm">
            Welcome to Nohar
          </span>
          <h1 className="text-hero mt-4 mb-6 font-display font-bold text-foreground">
            Empowering our{" "}
            <span className="text-primary">Village</span>, Preserving our{" "}
            <span className="text-accent">Culture</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-[50ch] mb-8 leading-relaxed">
            Managed by Nohar Vikash Yuvak Sangh. A community dedicated to agriculture,
            peace, and the vibrant spirit of Madhepura.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/festivals"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold shadow-card hover:opacity-90 transition-opacity text-sm"
            >
              Explore Festivals
            </Link>
            <Link
              to="/about"
              className="bg-card text-foreground px-8 py-4 rounded-2xl font-semibold shadow-card hover:shadow-lg transition-shadow text-sm ring-1 ring-border"
            >
              Join the Sangh
            </Link>
          </div>

          <div className="mt-10 flex gap-8">
            {[
              { num: "1,000+", label: "Residents" },
              { num: "5+", label: "Annual Festivals" },
              { num: "100%", label: "Community Funded" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-primary">{s.num}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-card rounded-[2.5rem] p-8 shadow-card overflow-hidden ring-1 ring-border">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-[2.5rem]" />
            <div className="relative flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <span className="bg-accent/10 text-accent px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Upcoming Event
                </span>
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-3xl font-display font-bold mb-2 text-foreground">Ramnavami Puja</h3>
                <p className="text-muted-foreground mb-6">Lakshmi Narayan Aasthan, Nohar</p>
                <EventCountdown />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
