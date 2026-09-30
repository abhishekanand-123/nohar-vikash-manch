import { useState, useEffect } from "react";
import { Bell, Send, CheckCircle2, Smartphone, Monitor, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
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

export default function ManageNotifications() {
  const [title, setTitle] = useState("🎉 रामनवमी महोत्सव 2026 की तैयारियाँ शुरू!");
  const [body, setBody] = useState("गाँव नोहर में इस वर्ष रामनवमी महोत्सव धूमधाम से मनाया जाएगा। कार्यक्रम की रूपरेखा और समय सारिणी देखें।");
  const [url, setUrl] = useState("/ramnavami");
  const [isSending, setIsSending] = useState(false);
  const [installCount, setInstallCount] = useState<number>(0);
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
    fetchInstallCount();
  }, []);

  const fetchInstallCount = async () => {
    setLoadingInstalls(true);
    try {
      const { count, error } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "app_installed");

      if (!error && typeof count === "number") {
        setInstallCount(count);
      }
    } catch (err) {
      console.warn("Could not fetch install count:", err);
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
        
        // Add to history
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
            Push Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            मोबाइल और डेस्कटॉप ॲप यूज़र्स को सीधे सूचनाएँ व घोषणाएँ भेजें।
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Total App Installs</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              {loadingInstalls ? "..." : `${installCount} Devices`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">फोन व पीसी में इंस्टॉल्ड ॲप्स</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Notification Status</CardDescription>
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
            <CardDescription className="text-xs font-medium">Broadcasts Sent</CardDescription>
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
                यह संदेश यूज़र के मोबाइल/कंप्यूटर की स्क्रीन पर पॉपअप के रूप में दिखाई देगा।
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
                <label className="text-xs font-semibold text-foreground">Target URL (क्लिक करने पर खुलने वाला पेज)</label>
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Push Notification
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sent History */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Sent Notifications History</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 divide-y divide-border">
              {sentHistory.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-foreground truncate">{item.title}</h5>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{item.body}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                        Link: {item.url}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{item.sentAt}</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview on Mobile / Desktop */}
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
