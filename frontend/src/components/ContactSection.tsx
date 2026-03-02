import React from 'react';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';
import { MapPin, Phone } from 'lucide-react';

const WHATSAPP_NUMBER = '917665854193';
const WHATSAPP_MESSAGE = encodeURIComponent('Hello Mudit Sharma');
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
const INSTAGRAM_URL = 'https://www.instagram.com/khudrangkalakaar';

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-terracotta text-sm font-semibold uppercase tracking-widest">Get In Touch</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2">Let's Create Together</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Have a project in mind? Reach out and let's bring your vision to life through art.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="bg-terracotta/10 rounded-xl p-3 shrink-0">
                <MapPin className="w-6 h-6 text-terracotta" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                <p className="text-gray-600 text-sm">Rajasthan, India</p>
                <p className="text-gray-500 text-xs mt-1">Available for projects across India</p>
              </div>
            </div>

            {/* WhatsApp Card */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4 hover:bg-green-50 transition-colors group"
            >
              <div className="bg-green-100 rounded-xl p-3 shrink-0 group-hover:bg-green-200 transition-colors">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                <p className="text-gray-600 text-sm">+91 76658 54193</p>
                <p className="text-gray-500 text-xs mt-1">Click to chat on WhatsApp</p>
              </div>
            </a>

            {/* Instagram Card */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4 hover:bg-pink-50 transition-colors group"
            >
              <div className="bg-pink-100 rounded-xl p-3 shrink-0 group-hover:bg-pink-200 transition-colors">
                <SiInstagram className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Instagram</h3>
                <p className="text-gray-600 text-sm">@khudrangkalakaar</p>
                <p className="text-gray-500 text-xs mt-1">Follow for latest artwork updates</p>
              </div>
            </a>
          </div>

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-terracotta to-terracotta-dark rounded-2xl p-8 flex flex-col justify-between text-white">
            <div>
              <h3 className="text-2xl font-bold mb-3">Ready to Start Your Project?</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                Whether it's a mural for your home, office, hotel, or any space — Mudit Sharma brings
                your vision to life with vibrant colors and artistic excellence.
              </p>
              <ul className="space-y-2 mb-8">
                {['Custom Murals & Wall Art', 'Hotel & Resort Decor', 'Commercial Spaces', 'Residential Projects'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                    <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-terracotta font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-colors w-full"
              >
                <SiWhatsapp className="w-5 h-5 text-green-600" />
                Chat on WhatsApp
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-white/40 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/10 transition-colors w-full"
              >
                <SiInstagram className="w-5 h-5" />
                View on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
