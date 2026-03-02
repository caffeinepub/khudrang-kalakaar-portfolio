import { MapPin, Instagram, MessageCircle, Phone } from 'lucide-react';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';

export default function ContactSection() {
  const whatsappUrl = 'https://wa.me/?text=Hi%20Mudit%2C%20I%20am%20interested%20in%20your%20wall%20painting%20services.';

  return (
    <section id="contact" className="py-20 px-6 md:px-12 lg:px-20 bg-secondary">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-terracotta text-sm font-semibold tracking-widest uppercase mb-3">
            Get In Touch
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Let's Transform<br />Your Space
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-terracotta/40" />
            <div className="w-2 h-2 rounded-full bg-terracotta" />
            <div className="h-px w-12 bg-terracotta/40" />
          </div>
          <p className="text-foreground/60 text-base max-w-lg mx-auto">
            Available for Residential & Commercial Projects. Let's bring your vision to life.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Location */}
          <div className="bg-white rounded-sm p-8 text-center shadow-xs border border-border hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-terracotta-light rounded-sm flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-terracotta" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Location</h3>
            <p className="text-foreground/60 text-sm">Bikaner, Rajasthan</p>
          </div>

          {/* Instagram */}
          <div className="bg-white rounded-sm p-8 text-center shadow-xs border border-border hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-terracotta-light rounded-sm flex items-center justify-center mx-auto mb-4">
              <SiInstagram className="w-6 h-6 text-terracotta" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Instagram</h3>
            <a
              href="https://instagram.com/khudrangkalakaar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta text-sm font-medium hover:text-terracotta-dark transition-colors"
            >
              @khudrangkalakaar
            </a>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-sm p-8 text-center shadow-xs border border-border hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-terracotta-light rounded-sm flex items-center justify-center mx-auto mb-4">
              <SiWhatsapp className="w-6 h-6 text-terracotta" />
            </div>
            <h3 className="font-bold text-foreground mb-2">WhatsApp</h3>
            <p className="text-foreground/60 text-sm">[Add Number]</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-terracotta text-white font-semibold rounded-sm hover:bg-terracotta-dark transition-all duration-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 text-base"
            >
              <SiWhatsapp className="w-5 h-5" />
              Chat on WhatsApp
            </a>
            <a
              href="https://instagram.com/khudrangkalakaar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white border-2 border-terracotta text-terracotta font-semibold rounded-sm hover:bg-terracotta hover:text-white transition-all duration-200 text-base"
            >
              <SiInstagram className="w-5 h-5" />
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
