import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Instagram, Facebook, Share2, Save, ExternalLink, CheckCircle2, Globe, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import SEO from "@/components/common/SEO";
import { Tables } from "@/integrations/supabase/types";

type PageBanner = Tables<"page_banners">;

export default function ManageSocialLinks() {
  const { isAdmin, isEditor } = useAuth();
  const canManage = isAdmin || isEditor;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLinks() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("page_banners")
          .select("*")
          .eq("page_key", "social_links")
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching social links:", error);
        }

        if (data) {
          setExistingId(data.id);
          setIsActive(data.is_active ?? true);
          let insta = data.title || "";
          let fb = data.subtitle || "";
          if (data.bg_image) {
            try {
              const parsed = JSON.parse(data.bg_image);
              if (parsed.instagram) insta = parsed.instagram;
              if (parsed.facebook) fb = parsed.facebook;
            } catch {
              // Ignore
            }
          }
          setInstagram(insta);
          setFacebook(fb);
        } else {
          // Defaults if not created yet
          setInstagram("https://www.instagram.com/");
          setFacebook("https://www.facebook.com/");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLinks();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canManage) {
      toast.error("आपको बदलाव सहेजने के लिए एडमिन या एडिटर अनुमतियों की आवश्यकता है।");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        page_key: "social_links",
        title: instagram.trim(),
        subtitle: facebook.trim(),
        bg_image: JSON.stringify({
          instagram: instagram.trim(),
          facebook: facebook.trim(),
        }),
        is_active: isActive,
      };

      if (existingId) {
        const { error } = await supabase
          .from("page_banners")
          .update(payload)
          .eq("id", existingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("page_banners")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;
        if (data) setExistingId(data.id);
      }

      await queryClient.invalidateQueries({ queryKey: ["social_links"] });
      toast.success("सोशल मीडिया लिंक्स (Instagram & Facebook) सफलतापूर्वक अपडेट हो गए!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving links";
      toast.error(`सेव करने में विफल: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <SEO title="सोशल मीडिया लिंक्स प्रबंधन — Admin" noindex={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2.5 text-foreground">
            <Share2 className="w-6 h-6 text-primary" />
            सोशल मीडिया लिंक्स प्रबंधन (Social Links)
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            यहाँ से आप Header (Navbar) और Footer में दिखने वाले Instagram और Facebook लिंक्स को आसानी से बदल सकते हैं।
          </p>
        </div>

        <Button
          onClick={() => handleSave()}
          disabled={saving || loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2 shadow-sm"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              सहेजा जा रहा है...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              सेव करें (Save Changes)
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Main settings card */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>सोशल मीडिया सेटिंग्स</span>
                <div className="flex items-center gap-2 font-normal text-sm">
                  <Label htmlFor="active-toggle" className="cursor-pointer text-muted-foreground">
                    {isActive ? "सक्रिय (Visible on Site)" : "अक्रिय (Hidden)"}
                  </Label>
                  <Switch
                    id="active-toggle"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </CardTitle>
              <CardDescription>
                आगंतुकों को अपने आधिकारिक Instagram पेज और Facebook प्रोफाइल/पेज पर रीडायरेक्ट करने के लिए सही URL दर्ज करें।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Instagram Field */}
              <div className="space-y-2">
                <Label htmlFor="instagram-url" className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                  <span>Instagram प्रोफाइल / पेज लिंक (URL)</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="instagram-url"
                      type="url"
                      placeholder="https://www.instagram.com/noharvikashmanch"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="font-mono text-sm pl-3 pr-8"
                    />
                  </div>
                  {instagram && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(instagram, "_blank", "noopener,noreferrer")}
                      title="लिंक टेस्ट करें (Open in New Tab)"
                      className="shrink-0"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  उदाहरण: <code className="bg-muted px-1.5 py-0.5 rounded">https://www.instagram.com/nohar_vikash</code>
                </p>
              </div>

              {/* Facebook Field */}
              <div className="space-y-2">
                <Label htmlFor="facebook-url" className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#1877F2] flex items-center justify-center text-white shadow-sm">
                    <Facebook className="w-3.5 h-3.5" />
                  </div>
                  <span>Facebook पेज / प्रोफाइल लिंक (URL)</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="facebook-url"
                      type="url"
                      placeholder="https://www.facebook.com/noharvikashmanch"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="font-mono text-sm pl-3 pr-8"
                    />
                  </div>
                  {facebook && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(facebook, "_blank", "noopener,noreferrer")}
                      title="लिंक टेस्ट करें (Open in New Tab)"
                      className="shrink-0"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  उदाहरण: <code className="bg-muted px-1.5 py-0.5 rounded">https://www.facebook.com/noharvikashmanch</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Card */}
          <Card className="bg-secondary/25 border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Eye className="w-4 h-4 text-primary" />
                लाइव पूर्वावलोकन (Live Preview)
              </CardTitle>
              <CardDescription className="text-xs">
                उपयोगकर्ता को Header और Footer में यह लिंक्स इस प्रकार दिखाई देंगे:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Header preview preview */}
              <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-primary">Nohar<span className="text-accent">Vikash</span>Manch</span>
                  <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">(Header Navbar Preview)</span>
                </div>
                <div className="flex items-center gap-2">
                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-secondary/80 text-foreground hover:text-pink-600 transition-colors flex items-center gap-1.5 text-xs font-medium"
                    >
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span className="hidden sm:inline">Instagram</span>
                    </a>
                  )}
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-secondary/80 text-foreground hover:text-blue-600 transition-colors flex items-center gap-1.5 text-xs font-medium"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span className="hidden sm:inline">Facebook</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Footer preview */}
              <div className="p-4 rounded-xl bg-foreground text-background flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-background/70 text-center sm:text-left">
                  <span>(Footer Preview) • सोशल मीडिया से जुड़ें:</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-background/10 hover:bg-background/20 text-background transition-colors flex items-center gap-1.5 text-xs font-medium"
                    >
                      <Instagram className="w-4 h-4 text-pink-400" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-background/10 hover:bg-background/20 text-background transition-colors flex items-center gap-1.5 text-xs font-medium"
                    >
                      <Facebook className="w-4 h-4 text-blue-400" />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "सेव किया जा रहा है..." : "बदलाव सेव करें"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
