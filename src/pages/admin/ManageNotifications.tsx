import { useState, useEffect } from "react";
import { Bell, Send, CheckCircle2, Smartphone, Monitor, Sparkles, RefreshCw, AlertCircle, Radio, Clock, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sendAppNotification, requestNotificationPermission, getNotificationPermission } from "@/lib/pushNotifications";
import { supabase } from "@/integrations/supabase/client";

interface SentNotification {
  id: string;
  title: string;
  body: string;
  url: string;
  sentAt: string;
  status: string;
}

interface InstallRecord {
  id: string;
  device_type: string | null;
  browser: string | null;
  occurred_at: string;
  city?: string | null;
}

export default function ManageNotifications() {
  const [title, setTitle] = useState("🎉 रामनवमी महोत्सव 2026 की तैयारियाँ शुरू!");
  const [body, setBody] = useState("गाँव नोहर में इस वर्ष रामनवमी महोत्सव धूमधाम से मनाया जाएगा। कार्यक्रम की रूपरेखा और समय सारिणी देखें।");
  const [url, setUrl] = useState("/ramnavami");
  const [isSending, setIsSending] = useState(false);
  const [installCount, setInstallCount] = useState<number>(0);
  const [recentInstalls, setRecentInstalls] = useState<InstallRecord[]>([]);
  const [loadingInstalls, setLoadingInstalls] = useState(true);
  const [sentHistory, setSentHistory] = useState<SentNotification[]>([
    {
      id: "1",
      title: "🏏 नोहर प्रीमियर लीग (NPL) मैच शेड्यूल जारी!",
      body: "नोहर स्पोर्ट्स क्लब का पहला मैच रविवार को सुबह 9 बजे से खेला जाएगा।",
      url: "/sports",
      sentAt: "Today, 11:30 AM",
      status: "Delivered",
    },
    {
      id: "2",
      title: "🙏 नोहर विकास मंच में आपका स्वागत है!",
      body: "गाँव के विकास में सहयोग करें और सभी नए अपडेट्स से जुड़े रहें।",
      url: "/about",
      sentAt: "Yesterday, 04:15 PM",
      status: "Delivered",
    },
  ]);

  useEffect(() => {
    fetchInstallData();

    // Setup Supabase Realtime subscription for live updates
    const channel = supabase
      .channel("analytics_events_installs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_events",
          filter: "event_type=eq.app_installed",
        },
        (payload) => {
          setInstallCount((prev) => prev + 1);
          if (payload.new) {
            setRecentInstalls((prev) => [payload.new as InstallRecord, ...prev.slice(0, 9)]);
            toast.info("🎉 नया ॲप इंस्टॉल हुआ (New App Installed)!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInstallData = async () => {
    setLoadingInstalls(true);
    try {
      // 1. Total Count
      const { count, error } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "app_installed");

      if (!error && typeof count === "number") {
        setInstallCount(count);
      }

      // 2. Recent List
      const { data: list } = await supabase
        .from("analytics_events")
        .select("id, device_type, browser, occurred_at, city")
        .eq("event_type", "app_installed")
        .order("occurred_at", { ascending: false })
        .limit(10);

      if (list) {
        setRecentInstalls(list as InstallRecord[]);
      }
    } catch (err) {
      console.warn("Could not fetch install data:", err);
    } finally {
      setLoadingInstalls(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("कृपया Title और Message भरें!");
      return;
    }

    const permission = getNotificationPermission();
    if (permission !== "granted") {
      const newPerm = await requestNotificationPermission();
      if (newPerm !== "granted") {
        toast.error("कृपया ब्राउज़र में नोटिफिकेशन की अनुमति (Permission) दें!");
        return;
      }
    }

    setIsSending(true);
    try {
      const success = await sendAppNotification({
        title,
        body,
        icon: "/pwa-192x192.png",
        data: { url: url || "/" },
      });

      if (success) {
        toast.success("✅ टेस्ट पुश नोटिफिकेशन स्क्रीन पर भेज दिया गया!");
        
        const newNotif: SentNotification = {
          id: Date.now().toString(),
          title,
          body,
          url,
          sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "Delivered",
        };
        setSentHistory([newNotif, ...sentHistory]);
      } else {
        toast.error("नोटिफिकेशन भेजने में समस्या आई।");
      }
    } catch (e) {
      toast.error("Error sending notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-primary" />
            Push Notifications & App Installs
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            मोबाइल और डेस्कटॉप ॲप यूज़र्स को सीधे सूचनाएँ भेजें और लाइव इंस्टॉल्स ट्रैक करें।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1.5 py-1 px-3 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Realtime Live Synced
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInstallData}
            disabled={loadingInstalls}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInstalls ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-semibold">Total App Installs</CardDescription>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
            <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              {loadingInstalls ? "..." : `${installCount} Devices`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">फोन व पीसी में इंस्टॉल्ड ॲप्स (Live Count)</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold">Notification Status</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">Service Worker & PWA Enabled</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold">Broadcasts Sent</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {sentHistory.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">हाल ही में भेजी गई सूचनाएँ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Notification Composer */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                नया नोटिफिकेशन बनाएँ (Compose Announcement)
              </CardTitle>
              <CardDescription className="text-xs">
                यह संदेश यूज़र के मोबाइल/कंप्यूटर की स्क्रीन पर सीधे पॉपअप होगा।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">शीर्षक (Title)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. 🎉 रामनवमी महोत्सव 2026"
                  maxLength={65}
                />
                <span className="text-[10px] text-muted-foreground">{title.length}/65 characters</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">संदेश विवरण (Message Body)</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="नोटिफिकेशन का मुख्य संदेश यहाँ लिखें..."
                  rows={3}
                  maxLength={180}
                />
                <span className="text-[10px] text-muted-foreground">{body.length}/180 characters</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target URL (पेज लिंक)</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/festivals या /sports"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleSendTestNotification}
                  disabled={isSending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 py-2.5 font-semibold"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Push Notification (सूचना भेजें)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent App Installs Live Table */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  Recent Installs (हाल के इंस्टॉल्स)
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  Total: {installCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {recentInstalls.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  अभी तक कोई नया इंस्टॉल डेटा दर्ज नहीं हुआ है। जब भी कोई यूज़र ॲप इनस्टॉल करेगा, वह यहाँ लाइव दिखेगा।
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentInstalls.map((inst) => (
                    <div key={inst.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          {inst.device_type === "mobile" ? (
                            <Smartphone className="w-3.5 h-3.5" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {inst.device_type === "mobile" ? "Mobile Phone" : "Desktop / Laptop"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {inst.browser ? inst.browser.slice(0, 45) + "..." : "Chrome Browser"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(inst.occurred_at).toLocaleDateString("hi-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview & Tips */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-card/80">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Live Mobile Notification Preview
              </CardTitle>
              <CardDescription className="text-xs">
                यूज़र के फ़ोन के लॉक स्क्रीन / नोटिफिकेशन बार में ऐसा दिखेगा:
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <img src="/pwa-icon.svg" alt="NVM" className="w-3.5 h-3.5 rounded" />
                    <span>Nohar Vikash Manch</span>
                  </div>
                  <span>अभी (Now)</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <img src="/pwa-icon.svg" alt="App" className="w-8 h-8 rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{title || "Notification Title"}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                      {body || "Your message body will be displayed right here."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick tips */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-2 text-xs text-foreground/90">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <AlertCircle className="w-4 h-4" />
                <span>पुश नोटिफिकेशन के सुझाव:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                <li>शीर्षक संक्षिप्त और आकर्षक रखें (उदा. मुख्य आयोजन या घोषणा)।</li>
                <li>संदेश में तारीख या समय का स्पष्ट उल्लेख करें।</li>
                <li>यूज़र नोटिफिकेशन पर क्लिक करके सीधे उस पेज पर पहुँच सकेगा।</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
