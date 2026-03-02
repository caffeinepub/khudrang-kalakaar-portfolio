import React from 'react';
import { SiInstagram } from 'react-icons/si';

const INSTAGRAM_URL = 'https://www.instagram.com/khudrangkalakaar';
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(INSTAGRAM_URL)}`;

export default function QRSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-2">
            Follow on Instagram
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Scan QR to Visit Instagram</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-sm">
            Scan the QR code below to visit{' '}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta hover:underline font-medium"
            >
              @khudrangkalakaar
            </a>{' '}
            on Instagram and explore the latest artwork.
          </p>

          <div className="bg-white rounded-2xl shadow-md p-6 inline-flex flex-col items-center gap-4">
            <img
              src={QR_CODE_URL}
              alt="QR Code"
              width={200}
              height={200}
              className="rounded-lg"
            />
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-pink-600 font-semibold text-sm hover:text-pink-700 transition-colors"
            >
              <SiInstagram className="w-4 h-4" />
              @khudrangkalakaar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
