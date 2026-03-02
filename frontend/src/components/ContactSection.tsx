import { MessageCircle, Instagram, MapPin, Loader2 } from 'lucide-react';
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
    <section id="contact" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-accent font-medium text-sm uppercase tracking-widest">Get In Touch</span>
          <h2 className="text-4xl font-bold text-foreground mt-2 mb-4">Contact Me</h2>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Location */}
          <div className="bg-card rounded-2xl p-8 text-center shadow-card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Location</h3>
            <p className="text-muted-foreground text-sm">Rajasthan, India</p>
            <p className="text-muted-foreground text-sm">Available Pan India</p>
          </div>

          {/* WhatsApp */}
          <div className="bg-card rounded-2xl p-8 text-center shadow-card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm mb-3">{whatsappDisplay}</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                >
                  Chat Now
                </a>
              </>
            )}
          </div>

          {/* Instagram */}
          <div className="bg-card rounded-2xl p-8 text-center shadow-card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Instagram size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Instagram</h3>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm mb-3">
                  @{instagramProfile.replace(/.*instagram\.com\//, '').replace(/\/$/, '')}
                </p>
                <a
                  href={instagramProfile}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                >
                  Follow Me
                </a>
              </>
            )}
          </div>
        </div>

        {/* CTA Panel */}
        <div className="bg-accent rounded-2xl p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to Transform Your Space?</h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Let's discuss your vision and create something extraordinary together.
          </p>
          {isLoading ? (
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-8 py-3 rounded-full">
              <Loader2 size={16} className="animate-spin" />
              Loading...
            </div>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-accent font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              Start a Conversation
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
