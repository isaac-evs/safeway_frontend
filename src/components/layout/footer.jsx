'use client'

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="mr-3 h-10 w-10 rounded-full bg-gray-100 p-2">
                <Image
                  src="/logo.png"
                  alt="SafeWay logo"
                  width={28}
                  height={28}
                  className="h-full w-full opacity-70"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900">SafeWay</h2>
            </div>
            <p className="text-gray-600 max-w-md">
              Navigate your world with confidence. SafeWay helps you find the safest routes to your destination.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/#safety-map" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Safety Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contact@safeway.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                  contact@safeway.com
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} SafeWay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 