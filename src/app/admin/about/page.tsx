'use client';
import { useEffect, useState } from 'react';
import { FiSave, FiPlus, FiX, FiImage, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';
import MediaUpload from '@/components/admin/MediaUpload';

const Section = ({ title, children }: any) => (
  <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4 mb-6">
    <h3 className="font-bold text-white text-lg border-b border-gray-800 pb-3 mb-4">{title}</h3>
    {children}
  </div>
);

const Input = ({ label, value, onChange, placeholder = '' }: any) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input 
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" 
    />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3 }: any) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <textarea 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      rows={rows}
      className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none" 
    />
  </div>
);

export default function AdminAboutPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        setSettings({
          ...d,
          skills: d.skills || [],
          experience: d.experience || []
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (res.ok) toast.success('About Me saved successfully!');
    else toast.error('Error saving About Me');
    setSaving(false);
  };

  const update = (field: string, value: any) => setSettings((p: any) => ({ ...p, [field]: value }));

  const addCustomSkill = () => {
    update('customSkills', [...(settings.customSkills || []), { name: '', percentage: 0, icon: '' }]);
  };
  const updateCustomSkill = (index: number, field: string, value: any) => {
    const newSkills = [...(settings.customSkills || [])];
    newSkills[index] = { ...newSkills[index], [field]: value };
    update('customSkills', newSkills);
  };
  const removeCustomSkill = (index: number) => {
    update('customSkills', settings.customSkills.filter((_: any, idx: number) => idx !== index));
  };

  const addExperience = () => {
    update('experience', [...(settings.experience || []), { year: '', title: '', description: '' }]);
  };
  const updateExperience = (index: number, field: string, value: string) => {
    const newExp = [...(settings.experience || [])];
    newExp[index] = { ...newExp[index], [field]: value };
    update('experience', newExp);
  };
  const removeExperience = (index: number) => {
    update('experience', settings.experience.filter((_: any, idx: number) => idx !== index));
  };

  const addAboutStat = () => update('aboutStats', [...(settings.aboutStats || []), { value: 0, suffix: '+', label: '' }]);
  const updateAboutStat = (index: number, field: string, val: any) => {
    const newStats = [...(settings.aboutStats || [])];
    newStats[index] = { ...newStats[index], [field]: val };
    update('aboutStats', newStats);
  };
  const removeAboutStat = (index: number) => update('aboutStats', settings.aboutStats.filter((_: any, idx: number) => idx !== index));

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!settings) return null;



  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">About Me Setup</h1>
          <p className="text-gray-400 text-sm">Customize your About Page context, image, and timeline</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Save Changes</>}
        </button>
      </div>

      <Section title="🖼️ Profile Image">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-40 h-48 relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-gray-800 flex-shrink-0 flex items-center justify-center">
            {settings.aboutImage ? (
              <Image src={settings.aboutImage} alt="Profile preview" fill className="object-cover" />
            ) : (
              <div className="text-gray-600 flex flex-col items-center gap-2">
                <FiImage size={32} />
                <span className="text-xs">No Image</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Image Upload</label>
              <MediaUpload 
                value={settings.aboutImage || ''} 
                onChange={(url) => update('aboutImage', url)} 
                folder="portfolio/about"
                label="Upload Profile Photo"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload your profile image directly to Cloudinary or paste a URL. For best results, use a portrait-oriented image (ratio 4:5).
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="📝 Page Headers & Context">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Top Subtitle" value={settings.aboutPageSubtitle} onChange={(v: string) => update('aboutPageSubtitle', v)} placeholder="About Me" />
          <Input label="Top Main Headline" value={settings.aboutPageHeadline} onChange={(v: string) => update('aboutPageHeadline', v)} placeholder="The Person Behind The Work" />
          <Input label="Skills Section Title" value={settings.aboutSkillsTitle} onChange={(v: string) => update('aboutSkillsTitle', v)} placeholder="Skills & Tools" />
          <Input label="Experience Section Title" value={settings.aboutExperienceTitle} onChange={(v: string) => update('aboutExperienceTitle', v)} placeholder="Experience" />
        </div>
        <hr className="my-4 border-gray-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Your Name" value={settings.aboutName} onChange={(v: string) => update('aboutName', v)} placeholder="Pratik Rajput" />
          <Input label="Your Title" value={settings.aboutTitle} onChange={(v: string) => update('aboutTitle', v)} placeholder="Creative Designer" />
        </div>
        <Textarea label="Bio / Detailed Story" value={settings.aboutBio} onChange={(v: string) => update('aboutBio', v)} rows={6} />
      </Section>

      <Section title="📊 About Stats">
        <div className="space-y-4">
          {(settings.aboutStats || []).map((stat: any, i: number) => (
            <div key={i} className="flex gap-4 items-start p-4 bg-[#0a0a0a] border border-gray-800 rounded-xl relative group">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Number Value</label>
                  <input type="number" value={stat.value || 0} onChange={e => updateAboutStat(i, 'value', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Suffix (e.g. +, k, M)</label>
                  <input value={stat.suffix || ''} onChange={e => updateAboutStat(i, 'suffix', e.target.value)} placeholder="+" className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <input value={stat.label || ''} onChange={e => updateAboutStat(i, 'label', e.target.value)} placeholder="Projects" className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none" />
                </div>
              </div>
              <button onClick={() => removeAboutStat(i)} className="text-gray-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Stat">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
          {(settings.aboutStats || []).length === 0 && (
            <p className="text-gray-500 text-sm italic py-2">No stats added. Default stats will be shown.</p>
          )}
        </div>
        <button onClick={addAboutStat} className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-gray-700 text-gray-400 rounded-xl text-sm font-medium hover:text-white hover:border-gray-500 hover:bg-white/5 transition-all">
          <FiPlus /> Add Stat Box
        </button>
      </Section>

      <Section title="⚡ Advanced Skills & Tools">
        <div className="space-y-4">
          {(settings.customSkills || []).map((skill: any, i: number) => (
            <div key={i} className="flex gap-4 items-start p-4 bg-[#0a0a0a] border border-gray-800 rounded-xl relative group">
              <div className="flex flex-col gap-3 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Skill Name</label>
                    <input 
                      value={skill.name || ''} onChange={e => updateCustomSkill(i, 'name', e.target.value)}
                      placeholder="e.g. Adobe Premiere Pro" className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Percentage (0-100)</label>
                    <input 
                      type="number" min="0" max="100"
                      value={skill.percentage || 0} onChange={e => updateCustomSkill(i, 'percentage', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Brand Icon Keyword</label>
                    <input 
                      value={skill.icon || ''} onChange={e => updateCustomSkill(i, 'icon', e.target.value.toLowerCase())}
                      placeholder="e.g. premiere, photoshop, react" className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none" 
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Uses simple-icons names.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => removeCustomSkill(i)} className="text-gray-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Skill">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
          {(settings.customSkills || []).length === 0 && (
            <p className="text-gray-500 text-sm italic py-2">No advanced skills added yet.</p>
          )}
        </div>
        <button onClick={addCustomSkill} className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-gray-700 text-gray-400 rounded-xl text-sm font-medium hover:text-white hover:border-gray-500 hover:bg-white/5 transition-all">
          <FiPlus /> Add Skill
        </button>
      </Section>

      <Section title="📈 Experience Timeline">
        <div className="space-y-4">
          {(settings.experience || []).map((exp: any, i: number) => (
            <div key={i} className="flex gap-4 items-start p-4 bg-[#0a0a0a] border border-gray-800 rounded-xl relative group">
              <div className="flex flex-col gap-3 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">Year/Duration</label>
                    <input 
                      value={exp.year || ''} onChange={e => updateExperience(i, 'year', e.target.value)}
                      placeholder="e.g. 2021 - Present" className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Role / Title</label>
                    <input 
                      value={exp.title || ''} onChange={e => updateExperience(i, 'title', e.target.value)}
                      placeholder="e.g. Senior Visual Designer" className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea 
                    value={exp.description || ''} onChange={e => updateExperience(i, 'description', e.target.value)} rows={2}
                    placeholder="Brief description of responsibilities..." className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none resize-none" 
                  />
                </div>
              </div>
              <button onClick={() => removeExperience(i)} className="text-gray-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Item">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
          {(settings.experience || []).length === 0 && (
            <p className="text-gray-500 text-sm italic py-2">No experience timeline added yet. Add items to show them on the About page.</p>
          )}
        </div>
        
        <button onClick={addExperience} className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-gray-700 text-gray-400 rounded-xl text-sm font-medium hover:text-white hover:border-gray-500 hover:bg-white/5 transition-all">
          <FiPlus /> Add Timeline Item
        </button>
      </Section>

      <div className="py-4">
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-bg text-white font-bold text-base hover:opacity-90 disabled:opacity-60">
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Save All Changes</>}
        </button>
      </div>
    </div>
  );
}
