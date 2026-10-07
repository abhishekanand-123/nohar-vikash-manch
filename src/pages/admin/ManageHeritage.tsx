import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Landmark,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Sparkles,
} from "lucide-react";

export interface HeritageRecord {
  id: string;
  title: string;
  description: string;
  image: string | null;
  badge: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

const BADGE_OPTIONS = [
  "धरोहर",
  "प्राकृतिक धरोहर",
  "सांस्कृतिक धरोहर",
  "धार्मिक स्थल",
  "ऐतिहासिक पहचान",
  "सामाजिक पहचान",
  "गाँव का गौरव",
];

export default function ManageHeritage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<HeritageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<HeritageRecord | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("धरोहर");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("village_heritage")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error loading heritage items:", error);
      } else {
        setItems((data as HeritageRecord[]) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setBadge("धरोहर");
    setDisplayOrder(items.length + 1);
    setIsActive(true);
    setImageFile(null);
    setExistingImageUrl(null);
    setShowModal(true);
  };

  const openEditModal = (item: HeritageRecord) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setBadge(item.badge || "धरोहर");
    setDisplayOrder(item.display_order ?? 1);
    setIsActive(item.is_active ?? true);
    setImageFile(null);
    setExistingImageUrl(item.image);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Validation Error",
        description: "शीर्षक (Title) और विवरण (Description) भरना अनिवार्य है।",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        const uploadedUrl = await uploadFile(imageFile, "heritage");
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          toast({
            title: "Upload warning",
            description: "फोटो अपलोड नहीं हो सकी, कृपया पुनः प्रयास करें।",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      if (editingItem) {
        // Update existing record
        const { error } = await supabase
          .from("village_heritage")
          .update({
            title: title.trim(),
            description: description.trim(),
            badge: badge.trim(),
            display_order: Number(displayOrder),
            is_active: isActive,
            image: finalImageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "सफलतापूर्वक अपडेट हुआ!", description: "धरोहर की जानकारी सुरक्षित कर दी गई है।" });
      } else {
        // Insert new record
        const { error } = await supabase.from("village_heritage").insert({
          title: title.trim(),
          description: description.trim(),
          badge: badge.trim(),
          display_order: Number(displayOrder),
          is_active: isActive,
          image: finalImageUrl,
        });

        if (error) throw error;
        toast({ title: "धरोहर जोड़ी गई!", description: "नया धरोहर आइटम होमपेज पर दिखना शुरू हो जाएगा।" });
      }

      setShowModal(false);
      loadItems();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "त्रुटि (Error)",
        description: err.message || "डेटा सेव करने में समस्या आई।",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: HeritageRecord) => {
    if (!confirm(`क्या आप "${item.title}" को डिलीट करना चाहते हैं?`)) return;

    try {
      if (item.image && item.image.includes("/uploads/")) {
        await deleteFile(item.image);
      }

      const { error } = await supabase.from("village_heritage").delete().eq("id", item.id);
      if (error) throw error;

      toast({ title: "डिलीट हो गया", description: "धरोहर आइटम हटा दिया गया है।" });
      loadItems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "डिलीट करने में समस्या आई।",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (item: HeritageRecord) => {
    try {
      const nextStatus = !item.is_active;
      const { error } = await supabase
        .from("village_heritage")
        .update({ is_active: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (error) throw error;
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, is_active: nextStatus } : p)));
      toast({
        title: nextStatus ? "सक्रिय (Active)" : "छिपा दिया (Inactive)",
        description: `"${item.title}" का स्टेटस अपडेट कर दिया गया है।`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              गाँव की धरोहर और पहचान
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            होमपेज पर दिखने वाले हमारे गाँव के ऐतिहासिक, सांस्कृतिक और प्राकृतिक धरोहरों का प्रबंधन (Manage Heritage & Identity).
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            नई धरोहर जोड़ें
          </button>
        )}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <Landmark className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="font-semibold text-base text-foreground">अभी कोई धरोहर आइटम नहीं जुड़ा है</h3>
          <p className="text-sm text-muted-foreground mt-1">
            "नई धरोहर जोड़ें" बटन पर क्लिक करके गाँव का ऐतिहासिक मंदिर, बरगद का पेड़ या चौपाल जोड़ें।
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            पहला आइटम जोड़ें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                item.is_active ? "border-border shadow-sm hover:border-primary/40" : "border-border/40 opacity-70 bg-secondary/20"
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-xs">फोटो नहीं है</span>
                  </div>
                )}
                {item.badge && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm border border-white/20">
                    {item.badge}
                  </span>
                )}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 text-white backdrop-blur-sm">
                  क्रम #{item.display_order}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-foreground font-display line-clamp-1">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(item)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      item.is_active
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {item.is_active ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-muted-foreground" /> Hidden
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      title="Edit"
                      className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      title="Delete"
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm">
          <div className="bg-card w-full max-w-xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                {editingItem ? "धरोहर संपादित करें (Edit)" : "नई धरोहर जोड़ें (Add)"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  धरोहर का शीर्षक / Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. ऐतिहासिक बरगद का वृक्ष / प्राचीन शिव मंदिर"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Badge / Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    टैग / बैज (Badge Tag)
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {BADGE_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    क्रम संख्या (Display Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  विवरण / Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="इस धरोहर या गाँव की पहचान का ऐतिहासिक व सांस्कृतिक विवरण लिखें..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  फोटो अपलोड करें (Image)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                />
                {existingImageUrl && !imageFile && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>मौजूदा फोटो:</span>
                    <img src={existingImageUrl} alt="Current" className="w-10 h-10 object-cover rounded-lg border border-border" />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-foreground cursor-pointer">
                  होमपेज पर दिखाएँ (Show on Homepage)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-input text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? "अपडेट करें" : "सुरक्षित करें"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
