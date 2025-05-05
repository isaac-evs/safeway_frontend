'use client'

import { motion } from "framer-motion";
import { useState } from "react";

export default function TestimonialsSection() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const testimonials = [
    {
      text: "SafeWay has completely changed how I navigate through the city. I feel safer knowing about incidents in real-time.",
      author: "Sarah Johnson",
      role: "Daily Commuter"
    },
    {
      text: "As a fleet manager, this platform has improved our drivers' efficiency and safety. The real-time updates are incredibly valuable.",
      author: "Michael Rodriguez",
      role: "Fleet Manager"
    },
    {
      text: "The safety alerts have helped me avoid dangerous areas during my evening walks. It's like having local knowledge of every neighborhood.",
      author: "Emily Chen",
      role: "City Resident"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center text-4xl font-bold mb-16 text-gray-900"
        >
          What Our Users Say
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
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
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <svg className="h-8 w-8 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-600 mb-6">{testimonial.text}</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}