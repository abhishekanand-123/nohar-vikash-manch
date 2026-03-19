import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
}

export default function About() {
  const [current, setCurrent] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const visibleCount = typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 3;

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("members").select("*").order("created_at", { ascending: true });
      setMembers((data as Member[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const maxIndex = Math.max(0, members.length - visibleCount);

  return (
    <div className="py-20">
      {/* Mission Section */}
      <section className="container mx-auto px-6 mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
          <span className="text-accent font-semibold uppercase text-sm tracking-wide">About Us</span>
          <h1 className="text-section font-display font-bold mt-2 mb-6 text-foreground">
            Nohar Vikash Yuvak Sangh
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Nohar Vikash Yuvak Sangh is a community organization dedicated to the holistic development of Village Nohar.
            We organize festivals, manage community infrastructure, promote sports, and work towards improving the quality of life for all residents.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-card rounded-2xl p-8 shadow-card ring-1 ring-border">
            <h3 className="font-display font-bold text-xl mb-4 text-primary">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To foster community development through collective efforts in agriculture, education, sports, and cultural preservation.
              We believe in the power of unity and aim to make Nohar a model village in Madhepura.
            </p>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-card ring-1 ring-border">
            <h3 className="font-display font-bold text-xl mb-4 text-accent">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              A self-reliant, progressive village where every resident has access to opportunities for growth,
              where our traditions are celebrated, and where the youth lead positive change.
            </p>
          </div>
        </div>
      </section>

      {/* Members Carousel */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold uppercase text-sm tracking-wide">Team</span>
            <h2 className="text-section font-display font-bold mt-2 text-foreground">Our Members</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No members added yet.</p>
          ) : (
            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <motion.div
                  className="flex gap-6"
                  animate={{ x: `-${current * (100 / visibleCount + 2)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="shrink-0 bg-card rounded-2xl p-6 shadow-card ring-1 ring-border text-center"
                      style={{ width: `calc(${100 / visibleCount}% - 1rem)` }}
                    >
                      {m.image ? (
                        <img src={m.image} alt={m.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                          <span className="font-display text-2xl font-bold text-primary">
                            {m.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                      )}
                      <h4 className="font-display font-semibold text-foreground">{m.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{m.role}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              <button
                onClick={() => setCurrent(Math.max(0, current - 1))}
                disabled={current === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 bg-card rounded-full shadow-card ring-1 ring-border disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrent(Math.min(maxIndex, current + 1))}
                disabled={current >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 bg-card rounded-full shadow-card ring-1 ring-border disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
