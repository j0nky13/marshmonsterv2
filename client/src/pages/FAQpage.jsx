

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'What services does Marsh Monster offer?',
    answer: 'We provide full-stack web development, custom backend dashboards, and scalable infrastructure tailored to your business.'
  },
  {
    question: 'How long does a typical project take?',
    answer: 'Most projects are delivered within 2–4 weeks depending on complexity and scope.'
  },
  {
    question: 'What’s included in a web design package?',
    answer: 'We include design, responsive layout, SEO basics, user testing, and launch support. Hosting and backend are available too.'
  },
  {
    question: 'Do you offer maintenance and updates?',
    answer: 'Yes, we offer post-launch support plans so your site stays fast, secure, and bug-free.'
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <motion.div
    className="bg-[#1c1c1e] p-6 rounded-xl border border-lime-400 shadow-[0_0_20px_rgba(163,255,131,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(163,255,131,0.7)]"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
  >
    <button
      onClick={onClick}
      className="w-full text-left text-xl font-semibold text-lime-400"
    >
      {question}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="mt-3 text-base text-white leading-relaxed"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <p>{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FAQpage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] px-4 sm:px-8 py-20">
        <motion.h1
          className="text-4xl sm:text-6xl font-extrabold text-center bg-gradient-to-r from-lime-400 via-blurple to-green-400 bg-clip-text text-transparent drop-shadow-lg mb-14"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h1>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
          <div className="md:w-1/3 text-white text-lg leading-relaxed">
            <p className="bg-[#111] p-4 rounded-lg shadow-inner border border-neutral-700">
              Have questions? Here’s a helpful guide to what we offer, how long things take, and what’s included.
            </p>
          </div>

          <div className="md:w-2/3 space-y-6">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQpage;