'use client'

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-20 bg-white border-t border-gray-200">
      <div className="container mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready for Safer Urban Navigation?</h2>
          <p className="text-lg text-gray-600 mb-10">
            Join thousands of users who are navigating their cities more safely and efficiently with SafeWay.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="rounded-full bg-gray-100 px-8 py-4 text-gray-900 hover:bg-gray-200 transition-colors font-medium cursor-pointer">
              Sign Up For Free
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}