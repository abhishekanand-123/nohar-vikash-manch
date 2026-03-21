import { motion } from "framer-motion";
import EventCountdown from "@/components/home/EventCountdown";
import ramnavamiImg from "@/assets/ramnavami.jpg";
import templeImg from "@/assets/temple.jpg";
import PageBanner from "@/components/layout/PageBanner";

export default function Ramnavami() {
  return (
    <div>
      <PageBanner
        pageKey="ramnavami"
        title="Ramnavami Puja & Ashtajam"
        subtitle="श्री राम जन्मोत्सव — Grand celebration at Lakshmi Narayan Aasthan, Village Nohar."
      />

      <div className="container mx-auto px-6 py-20">
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
