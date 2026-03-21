import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageBanner from "@/components/layout/PageBanner";
import { Info } from "lucide-react";
import HoverImagePreview from "@/components/common/HoverImagePreview";

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
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("members").select("*").order("created_at", { ascending: true });
      setMembers((data as Member[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const maxIndex = Math.max(0, members.length - visibleCount);

  const next = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  useEffect(() => {
    if (members.length <= visibleCount) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [next, members.length, visibleCount]);

  return (
    <div>
      <PageBanner
        pageKey="about"
        icon={Info}
        title="About Us"
        subtitle="Learn about Nohar Vikash Yuvak Sangh and our mission to develop Nohar village."
      />

      {/* Mission Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
          <span className="text-accent font-semibold uppercase text-sm tracking-wide">Who We Are</span>
          <h2 className="text-section font-display font-bold mt-2 mb-6 text-foreground">
            Nohar Vikash Yuvak Sangh
          </h2>
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

      {/* Members Auto Carousel */}
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
            <div className="relative max-w-5xl mx-auto">
              <div className="overflow-hidden rounded-2xl">
                <motion.div
                  className="flex gap-5"
                  animate={{ x: `-${current * (100 / visibleCount + 2)}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                >
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="shrink-0 bg-card rounded-2xl p-6 shadow-card ring-1 ring-border text-center hover:shadow-xl transition-shadow"
                      style={{ width: `calc(${100 / visibleCount}% - 1rem)` }}
                    >
                      {m.image ? (
                        <HoverImagePreview
                          src={m.image}
                          alt={m.name}
                          containerClassName="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-primary/20"
                          imageClassName="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center ring-4 ring-primary/20">
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

              {members.length > visibleCount && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i === current ? "bg-primary" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
