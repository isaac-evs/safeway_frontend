'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Privacy() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg.jpg"
          alt="City background"
          fill
          style={{ objectFit: "cover" }}
          quality={90}
          priority
        />
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col items-center mt-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-4xl mx-auto mt-20 p-8 rounded-2xl bg-white shadow-lg"
        >
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Privacy Policy</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect information that you provide directly to us, including your name, email address, and location data when you use our services. This information helps us provide you with a better experience and improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information is used to provide and improve our services, communicate with you, and ensure the security of our platform. We never sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 