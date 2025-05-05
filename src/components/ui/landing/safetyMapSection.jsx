'use client'

import { motion } from "framer-motion";
import Image from "next/image";
import { SlCheck } from "react-icons/sl";
import { useTheme } from '../../../contexts/ThemeContext';

export default function SafetyMapSection() {
  const { darkMode, toggleDarkMode } = useTheme();
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="safety-map" className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="w-full lg:w-1/2 mb-10 lg:mb-0 lg:pr-12"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Interactive Safety Map</h2>
            <p className="text-lg text-gray-600 mb-6">
              Our platform provides an interactive map that displays real-time information about urban incidents, roadblocks, and safety concerns.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex-shrink-0 text-gray-600">
                  <SlCheck className="h-5 w-5" />
                </div>
                <p className="text-gray-600">Real-time incident reports from social media and digital sources</p>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex-shrink-0 text-gray-600">
                  <SlCheck className="h-5 w-5" />
                </div>
                <p className="text-gray-600">Color-coded indicators for safety levels in different areas</p>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex-shrink-0 text-gray-600">
                  <SlCheck className="h-5 w-5" />
                </div>
                <p className="text-gray-600">Detailed information about roadblocks, demonstrations, and urban events</p>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="w-full lg:w-1/2 relative"
          >
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="relative h-80 md:h-96 w-full">
                <div className="absolute inset-0 bg-gray-100"></div>
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <Image
                            src={darkMode ? "/safety-dark.png" : "/safety.png"}
                            alt="City skyline backdrop"
                            fill
                            quality={90}
                            priority
                          />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}