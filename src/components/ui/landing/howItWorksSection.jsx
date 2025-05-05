'use client'

import { motion } from "framer-motion";
import Image from "next/image";

export default function HowItWorksSection() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const steps = [
    {
      title: "Input Your Destination",
      description: "Enter your destination in the search bar to begin planning your journey."
    },
    {
      title: "View Real-Time Data",
      description: "Our platform collects and displays real-time information about urban incidents from social media and digital platforms."
    },
    {
      title: "Navigate Safely",
      description: "Receive optimal route suggestions that avoid dangerous areas and obstacles."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-t border-gray-200">
      <div className="container mx-auto px-6">
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center text-4xl font-bold mb-16 text-gray-900"
        >
          How SafeWay Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { 
                    duration: 0.6,
                    delay: index * 0.2
                  } 
                }
              }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative h-16 w-16 mb-6">
                <div className="absolute -inset-1 rounded-full bg-gray-100"></div>
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white border border-gray-200">
                  <span className="text-2xl font-bold text-gray-900">{index + 1}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}