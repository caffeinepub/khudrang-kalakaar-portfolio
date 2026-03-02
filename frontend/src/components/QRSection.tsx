import React from 'react';
import { SiInstagram } from 'react-icons/si';

const INSTAGRAM_URL = 'https://www.instagram.com/khudrangkalakaar';
const STATIC_QR_IMAGE = '/assets/generated/instagram-qr-khudrangkalakaar.dim_600x650.png';

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
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={STATIC_QR_IMAGE}
                alt="QR Code for @KHUDRANGKALAKAAR Instagram"
                width={260}
                height={260}
                className="rounded-lg object-contain"
              />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-pink-600 font-semibold text-sm hover:text-pink-700 transition-colors"
            >
              <SiInstagram className="w-4 h-4" />
              @KHUDRANGKALAKAAR
            </a>
            <p className="text-gray-400 text-xs">
              Or{' '}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta hover:underline font-medium"
              >
                click here
              </a>{' '}
              to open Instagram directly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
