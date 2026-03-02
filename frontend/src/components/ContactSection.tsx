import React from 'react';
import { MessageCircle, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaContacts } from '../hooks/useQueries';

export default function ContactSection() {
  const { data: mediaContacts, isLoading } = useMediaContacts();

  const whatsappNumber = mediaContacts?.whatsappNumber || '';
  const instagramProfile = mediaContacts?.instagramProfile || '';

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : '#';

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-terracotta text-sm font-semibold tracking-[0.25em] uppercase">
            Get in Touch
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mt-2">
            Contact
          </h2>
          <div className="w-16 h-1 bg-terracotta mx-auto mt-4 rounded-full" />
          <p className="text-charcoal/65 text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Ready to bring your vision to life? Let's create something extraordinary together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Cards */}
          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="bg-cream border border-warm-border rounded-2xl p-6 hover:border-terracotta/40 hover:shadow-warm-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-charcoal">WhatsApp</h3>
                  {isLoading ? (
                    <Skeleton className="h-5 w-40 mt-1 rounded" />
                  ) : (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-charcoal/70 hover:text-terracotta transition-colors text-sm mt-1 block"
                    >
                      {whatsappNumber || 'Not set'}
                    </a>
                  )}
                  <p className="text-charcoal/50 text-xs mt-1">Available for quick consultations</p>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-cream border border-warm-border rounded-2xl p-6 hover:border-terracotta/40 hover:shadow-warm-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-charcoal">Instagram</h3>
                  {isLoading ? (
                    <Skeleton className="h-5 w-48 mt-1 rounded" />
                  ) : (
                    <a
                      href={instagramProfile || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-charcoal/70 hover:text-terracotta transition-colors text-sm mt-1 block break-all"
                    >
                      {instagramProfile || 'Not set'}
                    </a>
                  )}
                  <p className="text-charcoal/50 text-xs mt-1">Follow for latest work & updates</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-cream border border-warm-border rounded-2xl p-6 hover:border-terracotta/40 hover:shadow-warm-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-charcoal">Location</h3>
                  <p className="text-charcoal/70 text-sm mt-1">Rajasthan, India</p>
                  <p className="text-charcoal/50 text-xs mt-1">Available for projects across India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dark CTA Panel */}
          <div className="bg-charcoal rounded-2xl p-8 flex flex-col justify-center">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-4 leading-tight">
              Let's Create Something Beautiful Together
            </h3>
            <p className="text-cream/70 text-sm sm:text-base leading-relaxed mb-8">
              Whether it's a mural, interior decoration, or a custom canvas — I bring your vision to life with passion and precision.
            </p>
            <div className="space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
                  <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
                </>
              ) : (
                <>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-semibold py-3 px-6 rounded-xl transition-all w-full"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat on WhatsApp
                  </a>
                  {instagramProfile && (
                    <a
                      href={instagramProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 border border-cream/30 hover:border-cream/60 text-cream font-semibold py-3 px-6 rounded-xl transition-all w-full hover:bg-white/5"
                    >
                      <Instagram className="w-5 h-5" />
                      Follow on Instagram
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
