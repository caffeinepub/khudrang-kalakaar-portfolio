import { MessageCircle, Instagram, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { useMediaContacts } from '../hooks/useQueries';

const DEFAULT_WHATSAPP = '917665854193';
const DEFAULT_INSTAGRAM = 'https://instagram.com/khudrangkalakaar';
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello, I came across your artwork portfolio and I'm interested in discussing a potential project. Could you please share more details about your services and availability?"
);

export default function ContactSection() {
  const { data: mediaContacts, isLoading } = useMediaContacts();

  const whatsappNumber = mediaContacts?.whatsappNumber || DEFAULT_WHATSAPP;
  const instagramProfile = mediaContacts?.instagramProfile || DEFAULT_INSTAGRAM;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${WHATSAPP_MESSAGE}`;
  const whatsappDisplay = whatsappNumber.startsWith('91')
    ? `+91 ${whatsappNumber.slice(2, 7)} ${whatsappNumber.slice(7)}`
    : `+${whatsappNumber}`;

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="terracotta-label mb-4">Get In Touch</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-4">
            Let's <span className="italic text-terracotta">Connect</span>
          </h2>
          <p className="font-body text-foreground/55 text-base max-w-md mx-auto leading-relaxed">
            Ready to transform your space? Reach out and let's discuss your vision.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {/* Location */}
          <div className="bg-background rounded-sm p-8 text-center border border-border hover:border-terracotta/30 hover:shadow-warm transition-all duration-300 group">
            <div className="w-12 h-12 bg-terracotta-muted rounded-sm flex items-center justify-center mx-auto mb-5 group-hover:bg-terracotta transition-colors duration-300">
              <MapPin size={20} className="text-terracotta group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-2">Location</h3>
            <p className="font-body text-foreground/55 text-sm">Rajasthan, India</p>
            <p className="font-body text-foreground/55 text-sm">Available Pan India</p>
          </div>

          {/* WhatsApp */}
          <div className="bg-background rounded-sm p-8 text-center border border-border hover:border-terracotta/30 hover:shadow-warm transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-50 rounded-sm flex items-center justify-center mx-auto mb-5 group-hover:bg-green-600 transition-colors duration-300">
              <MessageCircle size={20} className="text-green-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-2">WhatsApp</h3>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                <span className="font-body text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <p className="font-body text-foreground/55 text-sm mb-4">{whatsappDisplay}</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-body text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  Chat Now <ArrowRight size={12} />
                </a>
              </>
            )}
          </div>

          {/* Instagram */}
          <div className="bg-background rounded-sm p-8 text-center border border-border hover:border-terracotta/30 hover:shadow-warm transition-all duration-300 group">
            <div className="w-12 h-12 bg-pink-50 rounded-sm flex items-center justify-center mx-auto mb-5 group-hover:bg-pink-600 transition-colors duration-300">
              <Instagram size={20} className="text-pink-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-2">Instagram</h3>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                <span className="font-body text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <p className="font-body text-foreground/55 text-sm mb-4">
                  @{instagramProfile.replace(/.*instagram\.com\//, '').replace(/\/$/, '')}
                </p>
                <a
                  href={instagramProfile}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-body text-xs font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                >
                  Follow Me <ArrowRight size={12} />
                </a>
              </>
            )}
          </div>
        </div>

        {/* CTA Panel */}
        <div className="relative overflow-hidden bg-foreground rounded-sm p-10 md:p-14 text-center">
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-terracotta" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-terracotta/5 rounded-full -translate-x-8 translate-y-8" />
          <p className="terracotta-label mb-4 text-terracotta">Ready to Start?</p>
          <h3 className="font-display text-3xl md:text-4xl font-black text-background mb-4 leading-tight">
            Ready to Transform<br />
            <span className="italic text-terracotta">Your Space?</span>
          </h3>
          <p className="font-body text-background/50 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Let's discuss your vision and create something extraordinary together.
          </p>
          {isLoading ? (
            <div className="inline-flex items-center gap-2 bg-white/10 text-background px-8 py-3.5 rounded-full font-body">
              <Loader2 size={16} className="animate-spin" />
              Loading...
            </div>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-dark text-white font-body font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-warm-lg"
            >
              <MessageCircle size={16} />
              Start a Conversation
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
