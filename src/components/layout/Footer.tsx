import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <Link to="/" className="inline-block font-display text-xl font-bold mb-4 hover:text-accent transition-colors">
              Nohar<span className="text-accent">Vikash</span>Manch
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
            नोहर विकास युवक संघ द्वारा संचालित। यह एक समुदाय है जो कृषि, शांति और मधेपुरा की जीवंत संस्कृति को समर्पित है।
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">महत्वपूर्ण लिंक</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/" className="hover:text-accent transition-colors">मुख्य पृष्ठ</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors">हमारे बारे में</Link></li>
              <li><Link to="/festivals" className="hover:text-accent transition-colors">त्योहार</Link></li>
              <li><Link to="/sports" className="hover:text-accent transition-colors">खेल क्लब</Link></li>
              <li><Link to="/gallery" className="hover:text-accent transition-colors">गैलरी</Link></li>
              <li><Link to="/donation" className="hover:text-accent transition-colors">दान</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>ग्राम – नोहर, पोस्ट – ग्वालपाड़ा, जिला – मधेपुरा, बिहार, भारत</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>abhi96anand@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+91 8770824752</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm text-background/50">
          © {new Date().getFullYear()} अभिषेक आनंद (Administration) नोहर विकास युवक संघ। सभी अधिकार सुरक्षित।
        </div>
      </div>
    </footer>
  );
}
