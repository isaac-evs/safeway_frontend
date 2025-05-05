'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Terms() {
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
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Terms of Service</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using SafeWay, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Responsibilities</h2>
              <p className="text-gray-600 leading-relaxed">
                As a user of SafeWay, you are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to use our services in compliance with all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Service Modifications</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify or discontinue any part of our services at any time. We will make reasonable efforts to notify users of any significant changes to our services.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 