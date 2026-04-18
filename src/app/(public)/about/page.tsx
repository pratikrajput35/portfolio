'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { SiFigma, SiDavinciresolve, SiCanva, SiReact, SiNextdotjs, SiTailwindcss, SiWebflow, SiWordpress } from 'react-icons/si';
import { FiImage, FiPenTool, FiFilm, FiVideo } from 'react-icons/fi';

const iconMap: Record<string, any> = {
  'photoshop': FiImage,
  'illustrator': FiPenTool,
  'after effects': FiFilm,
  'aftereffects': FiFilm,
  'premiere': FiVideo,
  'premiere pro': FiVideo,
  'figma': SiFigma,
  'davinci': SiDavinciresolve,
  'davinci resolve': SiDavinciresolve,
  'canva': SiCanva,
  'cinema 4d': FiFilm,
  'cinema4d': FiFilm,
  'react': SiReact,
  'nextjs': SiNextdotjs,
  'tailwind': SiTailwindcss,
  'webflow': SiWebflow,
  'wordpress': SiWordpress,
};

function SkillBar({ skill, index }: { skill: any, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = skill.icon ? iconMap[skill.icon.toLowerCase()] : null;
  const springValue = useSpring(0, { bounce: 0, duration: 2000 });
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      springValue.set(skill.percentage || 0);
    }
  }, [isInView, skill.percentage, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setCurrentValue(Math.round(latest));
    });
  }, [springValue]);

  return (
    <div ref={ref} className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-orange-500 text-xl" />}
          <span className="font-bold text-white text-sm">{skill.name}</span>
        </div>
        <motion.span className="font-bold text-orange-400 text-sm">{currentValue}%</motion.span>
      </div>
      <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden border border-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${skill.percentage}%` } : { width: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
        />
      </div>
    </div>
  );
}

function StatCounter({ stat, index }: { stat: any, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const springValue = useSpring(0, { bounce: 0, duration: 2000 });
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (isInView) springValue.set(stat.value || 0);
  }, [isInView, stat.value, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => setCurrentValue(Math.round(latest)));
  }, [springValue]);

  return (
    <div ref={ref} className="text-center p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
      <div className="text-2xl font-extrabold text-white">
        {currentValue}{stat.suffix}
      </div>
      <div className="text-[var(--muted)] text-xs mt-1">{stat.label}</div>
    </div>
  );
}

const defaultSkills = [
  { name: 'Adobe Photoshop', percentage: 95, icon: 'photoshop' },
  { name: 'Premiere Pro', percentage: 90, icon: 'premiere' },
  { name: 'Figma', percentage: 85, icon: 'figma' },
  { name: 'DaVinci Resolve', percentage: 80, icon: 'davinci' },
];

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  const name = settings?.aboutName || 'Pratik Rajput';
  const pageSubtitle = settings?.aboutPageSubtitle || 'About Me';
  const pageHeadline = settings?.aboutPageHeadline || 'The Person Behind The Work';
  const skillsTitle = settings?.aboutSkillsTitle || 'Skills & Tools';
  const experienceTitle = settings?.aboutExperienceTitle || 'Experience';
  const title = settings?.aboutTitle || 'Creative Designer & Video Editor';
  const bio = settings?.aboutBio || 'I\'m a passionate creative professional specializing in graphic design and video editing. With 3+ years of experience, I\'ve helped brands tell their stories through stunning visuals and compelling video content.';
  const customSkills = settings?.customSkills?.length > 0 ? settings.customSkills : defaultSkills;
  const image = settings?.aboutImage;

  return (
    <div className="site-container section-pad">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-3">{pageSubtitle}</p>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">{pageHeadline}</h1>
      </motion.div>

      {/* Bio Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center mb-24">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2">
          <div className="relative">
            <div className="aspect-[4/5] relative rounded-3xl overflow-hidden bg-[var(--card)] border border-[var(--border)]">
              {image ? (
                <Image src={image} alt={name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full gradient-bg opacity-20 flex items-center justify-center">
                  <div className="text-8xl font-extrabold text-orange-500/40">{name[0]}</div>
                </div>
              )}
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 gradient-bg rounded-2xl opacity-30 blur-xl" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold mb-1">{name}</h2>
            <p className="gradient-text font-semibold text-lg">{title}</p>
          </div>
          <p className="text-[var(--muted)] leading-relaxed text-lg">{bio}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {(settings?.aboutStats || [
              { value: 50, suffix: '+', label: 'Projects' },
              { value: 30, suffix: '+', label: 'Clients' },
              { value: 3, suffix: '+', label: 'Years' }
            ]).map((stat: any, i: number) => (
              <StatCounter key={i} stat={stat} index={i} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-12 text-center">{skillsTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {customSkills.map((skill: any, i: number) => (
            <SkillBar key={i} skill={skill} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Experience Timeline */}
      {settings?.experience?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-extrabold mb-8 text-center">{experienceTitle}</h2>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
            {settings.experience.map((exp: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-12 pb-8"
              >
                <div className="absolute left-0 top-0 w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                  <div className="text-orange-400 text-sm font-medium mb-1">{exp.year}</div>
                  <h3 className="font-bold">{exp.title}</h3>
                  <p className="text-[var(--muted)] text-sm mt-1">{exp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
