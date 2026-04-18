'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from 'framer-motion';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';

/* ─── Animation variants ────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((d) => setTestimonials(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const { scrollYProgress } = useScroll();
  const quoteY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  if (testimonials.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const t = testimonials[current];

  return (
    <section className="site-container mx-4 lg:mx-auto border-b border-[var(--border)] overflow-hidden">
      {/* Reduced padding specifically for testimonials */}
      <div className="py-24 md:py-32 w-full text-center max-w-5xl mx-auto relative cursor-default">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 relative z-10"
        >
          <motion.p variants={itemVariants} className="inline-block px-4 py-1.5 rounded-full glass-card text-[var(--muted)] text-xs font-semibold tracking-widest uppercase mb-6">
            Client Feedback
          </motion.p>
          <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 relative z-10">Testimonials</motion.h2>
          <motion.p variants={itemVariants} className="text-[var(--muted)] max-w-xl mx-auto font-light text-lg">Don't just take my word for it. Here's what others have to say.</motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center relative z-10"
          >
            <div className="relative glass p-10 md:p-14 lg:p-20 rounded-[2.5rem] bg-[var(--card)] shadow-2xl shadow-black/20">
              {/* Parallax Quotation Mark */}
              <motion.div 
                style={{ y: quoteY }}
                className="absolute -top-10 -left-6 md:-left-10 text-[180px] leading-none text-white/[0.03] font-serif select-none pointer-events-none"
              >
                "
              </motion.div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Star Rating */}
              <div className="flex gap-1 mb-8">
                {[...Array(testimonials[current].rating || 5)].map((_, i) => (
                  <FiStar key={i} className="text-orange-500 fill-orange-500" size={16} />
                ))}
              </div>
              
              <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-12 text-white">
                "{testimonials[current].content}"
              </p>
              
              <div className="flex items-center gap-4">
                {testimonials[current].avatar ? (
                  <Image src={testimonials[current].avatar} alt={testimonials[current].name} width={56} height={56} className="object-cover rounded-full grayscale border border-white/20" />
                ) : (
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center font-bold text-lg text-white border border-white/20">
                    {testimonials[current].name.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <div className="font-bold text-white tracking-wide">{testimonials[current].name}</div>
                  <div className="text-[var(--muted)] text-sm tracking-wide uppercase text-xs mt-1">{testimonials[current].role}</div>
                  {testimonials[current].company && (
                    <div className="text-orange-500 text-xs font-bold uppercase tracking-widest mt-1">{testimonials[current].company}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all border border-white/10 hover:border-white/30"
            aria-label="Previous testimonial"
          >
            <FiChevronLeft size={24} />
          </button>
          
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all rounded-full ${i === current ? 'w-8 h-2 bg-orange-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all border border-white/10 hover:border-white/30"
            aria-label="Next testimonial"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
        )}
      </div>
    </section>
  );
}
