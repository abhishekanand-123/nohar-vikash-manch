import { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Award,
  Filter,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  fetchVillageServices,
  saveVillageService,
  deleteVillageService,
  VillageService,
} from "@/lib/servicesApi";
import { uploadFile } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import SEO from "@/components/common/SEO";

const DEFAULT_CATEGORIES = [
  "शिक्षक (Teacher)",
  "मिस्त्री (Mistri)",
  "इलेक्ट्रीशियन (Electrician)",
  "श्रमिक / मजदूर (Labor)",
  "प्लंबर (Plumber)",
  "स्वास्थ्य कर्मी / डॉक्टर (Health)",
  "कृषि विशेषज्ञ (Agriculture)",
  "दुकानदार / व्यापारी (Shopkeeper)",
  "वाहन चालक / ड्राइवर (Driver)",
  "अन्य (Other)",
];

export default function ManageGramUdyog() {
  const [services, setServices] = useState<VillageService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("शिक्षक (Teacher)");
  const [customCategory, setCustomCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const list = await fetchVillageServices();
    setServices(list);
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setCategory("शिक्षक (Teacher)");
    setCustomCategory("");
    setPhone("");
    setWhatsapp("");
    setSkill("");
    setExperience("");
    setAddress("ग्राम नोहर");
    setImage("");
    setDescription("");
    setIsActive(true);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: VillageService) => {
    setEditingId(item.id);
    setName(item.name);
    if (DEFAULT_CATEGORIES.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory("");
    } else {
      setCategory("अन्य (Other)");
      setCustomCategory(item.category);
    }
    setPhone(item.phone);
    setWhatsapp(item.whatsapp || item.phone);
    setSkill(item.skill || "");
    setExperience(item.experience || "");
    setAddress(item.address || "");
    setImage(item.image || "");
    setDescription(item.description || "");
    setIsActive(item.is_active !== false);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadFile(file, "gram-udyog");
      if (url) {
        setImage(url);
        toast.success("फोटो अपलोड हो गई!");
      }
    } catch (err: any) {
      toast.error(err?.message || "फोटो अपलोड करने में त्रुटि");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("कृपया नाम और फ़ोन नंबर दर्ज करें!");
      return;
    }

    const finalCategory = category === "अन्य (Other)" ? customCategory.trim() || "सामान्य सेवा" : category;

    setIsSaving(true);
    try {
      await saveVillageService({
        id: editingId || undefined,
        name: name.trim(),
        category: finalCategory,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        skill: skill.trim(),
        experience: experience.trim(),
        address: address.trim(),
        image: image.trim() || null,
        description: description.trim(),
        is_active: isActive,
      });

      toast.success(editingId ? "विवरण अपडेट हो गया!" : "नई सेवा जोड़ दी गई!");
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      toast.error("सेव करने में समस्या आई");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (confirm(`क्या आप वाकई "${itemName}" को हटाना चाहते हैं?`)) {
      await deleteVillageService(id);
      toast.success("हटा दिया गया!");
      await loadData();
    }
  };

  // Distinct categories from existing list
  const existingCategories = Array.from(new Set(services.map((s) => s.category)));

  // Filtered list
  const filtered = services.filter((s) => {
    const matchCat = categoryFilter === "all" || s.category.toLowerCase() === categoryFilter.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.skill && s.skill.toLowerCase().includes(q)) ||
      s.phone.includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <SEO
        title="ग्राम उद्योग प्रबंधन (Manage Gram Udyog) — Admin"
        description="गाँव के शिक्षक, मिस्त्री, लेबर, डॉक्टर व सभी कामगारों की डायरेक्टरी का प्रबंधन करें।"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-primary" />
            ग्राम उद्योग एवं सेवाएँ प्रबंधन
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            गाँव के शिक्षक, मिस्त्री, लेबर, डॉक्टर व सभी कामगारों की डायरेक्टरी का प्रबंधन करें।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/gram-udyog"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors border border-border"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live Page देखें
          </Link>
          <Button onClick={handleOpenAdd} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Plus className="w-4 h-4" />
            नया जोड़ें (Add Entry)
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाम, काम, या फ़ोन नंबर से खोजें..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> फ़िल्टर:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="text-xs bg-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">सभी श्रेणियाँ (All)</option>
            {existingCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Badge variant="outline" className="text-xs">
            कुल: {filtered.length}
          </Badge>
        </div>
      </div>

      {/* Services Table / Cards */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">सभी पंजीकृत सेवाएँ व कामगार</CardTitle>
          <CardDescription className="text-xs">
            यहाँ से आप किसी का भी नाम, फ़ोन नंबर, हुनर व श्रेणी बदल या हटा सकते हैं।
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              कोई प्रविष्टि (Entry) नहीं मिली।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-secondary/60 text-muted-foreground border-b border-border uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">नाम व श्रेणी</th>
                    <th className="py-3 px-4">फ़ोन / व्हाट्सएप</th>
                    <th className="py-3 px-4">हुनर व अनुभव</th>
                    <th className="py-3 px-4">पता / टोला</th>
                    <th className="py-3 px-4">स्थिति</th>
                    <th className="py-3 px-4 text-right">कार्य (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                              {item.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground">{item.name}</div>
                            <span className="text-[10px] text-primary font-medium">{item.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" /> {item.phone}
                          </div>
                          {item.whatsapp && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                              <MessageCircle className="w-2.5 h-2.5" /> {item.whatsapp}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-foreground truncate">{item.skill || "—"}</div>
                        {item.experience && (
                          <span className="text-[10px] text-muted-foreground">{item.experience}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{item.address || "ग्राम नोहर"}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            item.is_active !== false
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                              : "bg-destructive/10 text-destructive text-[10px]"
                          }
                        >
                          {item.is_active !== false ? "सक्रिय (Active)" : "निष्क्रिय"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id, item.name)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingId ? "विवरण संपादित करें (Edit Entry)" : "नई सेवा / कामगार जोड़ें (Add New Entry)"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              यह जानकारी वेबसाइट के &quot;ग्राम उद्योग एवं विकास&quot; पेज पर तुरंत दिखने लगेगी।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs">
            {/* Name */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground">पूरा नाम (Full Name) *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. रमेश कुमार शर्मा"
                required
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground">श्रेणी (Category) *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {category === "अन्य (Other)" && (
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="अपनी नई श्रेणी लिखें (उदा. दर्जी, बढ़ई, जनसेवा केंद्र)"
                  className="mt-1.5"
                  required
                />
              )}
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">फ़ोन नंबर (Phone Number) *</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="उदा. 9876543210"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">WhatsApp नंबर</label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="यदि अलग है तो लिखें"
                />
              </div>
            </div>

            {/* Skill / Work & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">हुनर / कार्य विवरण (Skill)</label>
                <Input
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="उदा. घर की वायरिंग, ट्यूशन 10वीं तक"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">अनुभव (Experience)</label>
                <Input
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="उदा. 5 वर्ष का अनुभव"
                />
              </div>
            </div>

            {/* Address / Tola */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground">पता / टोला (Address)</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="उदा. नोहर वार्ड 04, दुर्गा स्थान के पास"
              />
            </div>

            {/* Photo Upload or URL */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground">फोटो (Image / Photo)</label>
              <div className="flex items-center gap-2">
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="फ़ोटो URL या नीचे से अपलोड करें"
                  className="flex-1"
                />
                <label className="cursor-pointer bg-secondary hover:bg-secondary/80 border border-border px-3 py-2 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingImage ? "अपलोड हो रहा है..." : "फ़ाइल चुनें"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Extra Description */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground">अतिरिक्त विवरण (Description)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="काम का समय, विशेष सुविधाएँ या अन्य जानकारी..."
                rows={2}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="isActiveCheck" className="text-xs text-foreground font-medium cursor-pointer">
                वेबसाइट पर लाइव प्रदर्शित करें (Active Status)
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                रद्द करें (Cancel)
              </Button>
              <Button
                type="submit"
                disabled={isSaving || uploadingImage}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isSaving ? "सहेज रहा है..." : editingId ? "अपडेट करें" : "जोड़ें (Save)"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
