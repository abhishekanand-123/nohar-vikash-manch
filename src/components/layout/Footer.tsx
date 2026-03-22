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
              Managed by Nohar Vikash Yuvak Sangh. A community dedicated to agriculture, peace, and the vibrant spirit of Madhepura.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/festivals" className="hover:text-accent transition-colors">Festivals</Link></li>
              <li><Link to="/sports" className="hover:text-accent transition-colors">Sports Club</Link></li>
              <li><Link to="/gallery" className="hover:text-accent transition-colors">Gallery</Link></li>
              <li><Link to="/donation" className="hover:text-accent transition-colors">Donation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Village Nohar, Post Gwalpara, Madhepura, Bihar, India</span>
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
          © {new Date().getFullYear()} Abhishek Anand — Nohar Vikash Yuvak Sangh. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
