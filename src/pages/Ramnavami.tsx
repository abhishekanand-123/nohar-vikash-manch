import { motion } from "framer-motion";
import EventCountdown from "@/components/home/EventCountdown";
import ramnavamiImg from "@/assets/ramnavami.jpg";
import templeImg from "@/assets/temple.jpg";

export default function Ramnavami() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-accent font-semibold uppercase text-sm tracking-wide">श्री राम जन्मोत्सव</span>
          <h1 className="text-section font-display font-bold mt-2 text-foreground">Ramnavami Puja & Ashtajam</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            Every year, Ramnavami Puja and Ashtajam are organized at Lakshmi Narayan Aasthan in Village Nohar.
            This grand celebration brings the entire community together in devotion, music, and joy.
          </p>
        </motion.div>

        {/* Countdown */}
        <div className="max-w-xl mx-auto bg-card rounded-2xl p-8 shadow-card ring-1 ring-border mb-16">
          <h3 className="font-display font-bold text-xl mb-6 text-center text-foreground">Countdown to Ramnavami</h3>
          <EventCountdown />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={ramnavamiImg} alt="Ramnavami celebration" className="rounded-2xl shadow-card w-full" loading="lazy" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-bold text-2xl mb-4 text-foreground">About the Event</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Ramnavami is celebrated as the birth anniversary of Lord Shri Ram. At Lakshmi Narayan Aasthan,
                a 3-day grand puja is organized with Ashtajam — continuous 8-hour kirtan and bhajan sessions.
              </p>
              <p>
                Devotees from Nohar and nearby villages gather to participate in the celebrations. Community bhandara
                (free meal) is organized for all attendees, funded entirely by village donations.
              </p>
              <p>
                The event includes decorated pandals, flower garlands, night-long bhajan sandhya,
                and special puja rituals performed by learned pandits.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Gallery */}
        <div className="grid md:grid-cols-2 gap-6">
          <img src={templeImg} alt="Lakshmi Narayan Aasthan" className="rounded-2xl shadow-card w-full aspect-video object-cover" loading="lazy" />
          <img src={ramnavamiImg} alt="Ramnavami festivities" className="rounded-2xl shadow-card w-full aspect-video object-cover" loading="lazy" />
        </div>
      </div>
    </div>
  );
}
