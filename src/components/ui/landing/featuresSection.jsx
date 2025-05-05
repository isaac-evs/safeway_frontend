'use client'

import { motion } from "framer-motion";
import { SlMap, SlInfo  } from "react-icons/sl";
import { TbAlertTriangle } from 'react-icons/tb'

export default function FeaturesSection() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="features" className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center text-4xl font-bold mb-16 text-gray-900"
        >
          Navigate Smarter & Safer
        </motion.h2>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <div className="mb-4 rounded-full bg-gray-100 p-3 inline-block">
              <SlInfo className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Real-Time Updates</h3>
            <p className="text-gray-600">
              Get instant information about traffic incidents, roadblocks, and urban events from social media and digital platforms.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <div className="mb-4 rounded-full bg-gray-100 p-3 inline-block">
              <TbAlertTriangle className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Safety Alerts</h3>
            <p className="text-gray-600">
              Stay informed about dangerous areas and security incidents in your city for safe and efficient travel planning.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="mb-4 rounded-full bg-gray-100 p-3 inline-block">
              <SlMap className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Smart Navigation</h3>
            <p className="text-gray-600">
              Navigate efficiently with data from social media and digital platforms to avoid obstacles and restricted areas.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}