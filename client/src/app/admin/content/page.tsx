'use client';
// Updated to include Contact Page fields
import { useEffect, useState } from 'react';
import { FiSave, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const Section = ({ title, children }: any) => (
  <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
    <h3 className="font-bold text-white text-lg border-b border-gray-800 pb-3">{title}</h3>
    {children}
  </div>
);

const Input = ({ label, field, type = 'text', placeholder = '', settings, update }: any) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input type={type} value={settings[field] || ''} onChange={e => update(field, e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
  </div>
);

const Textarea = ({ label, field, rows = 3, settings, update }: any) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <textarea value={settings[field] || ''} onChange={e => update(field, e.target.value)} rows={rows}
      className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none" />
  </div>
);

const Toggle = ({ label, field, settings, update }: any) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className={`w-10 h-6 rounded-full transition-all ${settings[field] ? 'bg-orange-500' : 'bg-gray-700'} relative`}
      onClick={() => update(field, !settings[field])}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[field] ? 'left-5' : 'left-1'}`} />
    </div>
    <span className="text-sm text-gray-300">{label}</span>
  </label>
);

export default function AdminContentPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    api('/api/settings').then(r => r.json()).then(d => { setSettings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await api('/api/settings', { method: 'PUT', json: settings });
    if (res.ok) toast.success('Settings saved!');
    else toast.error('Error saving');
    setSaving(false);
  };

  const update = (field: string, value: any) => setSettings((p: any) => ({ ...p, [field]: value }));

  const addSkill = () => {
    if (!newSkill.trim()) return;
    update('skills', [...(settings.skills || []), newSkill.trim()]);
    setNewSkill('');
  };

  const removeSkill = (i: number) => update('skills', settings.skills.filter((_: any, idx: number) => idx !== i));

  const updatePricingTier = (index: number, key: string, value: any) => {
    const updatedTiers = [...(settings.pricingTiers || [])];
    updatedTiers[index] = { ...updatedTiers[index], [key]: value };
    update('pricingTiers', updatedTiers);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!settings) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Content</h1>
          <p className="text-gray-400 text-sm">Edit all website content from here</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Save All</>}
        </button>
      </div>

      <Section title="🏠 Hero Section">
        <Input label="Main Headline" field="heroHeadline" settings={settings} update={update} />
        <Textarea label="Subheadline" field="heroSubheadline" rows={2} settings={settings} update={update} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Primary CTA Text" field="heroCtaText" settings={settings} update={update} />
          <Input label="Primary CTA Link" field="heroCtaLink" placeholder="/portfolio" settings={settings} update={update} />
          <Input label="Secondary CTA Text" field="heroSecondaryCtaText" settings={settings} update={update} />
          <Input label="Secondary CTA Link" field="heroSecondaryCtaLink" placeholder="/contact" settings={settings} update={update} />
        </div>
      </Section>

      <Section title="🔗 Social Links">
        <div className="grid grid-cols-2 gap-4">
          {[['Instagram', 'instagram'], ['YouTube', 'youtube'], ['LinkedIn', 'linkedin'], ['Behance', 'behance'], ['Twitter', 'twitter']].map(([label, field]) => (
            <Input key={field} label={label} field={field} placeholder={`https://...`} settings={settings} update={update} />
          ))}
        </div>
      </Section>

      <Section title="🔍 SEO">
        <Input label="Site Title (meta title)" field="seoTitle" settings={settings} update={update} />
        <Textarea label="Meta Description" field="seoDescription" rows={2} settings={settings} update={update} />
        <Input label="Keywords (comma separated)" field="seoKeywords" settings={settings} update={update} />
      </Section>

      <Section title="💳 Pricing Packages">
        <div className="space-y-6">
          {settings.pricingTiers?.map((tier: any, i: number) => (
            <div key={i} className="p-5 bg-[var(--card)] border border-white/5 rounded-2xl space-y-4">
              <div className="font-bold text-orange-500 text-sm tracking-widest uppercase">Package {i + 1}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name</label>
                  <input type="text" value={tier.name} onChange={e => updatePricingTier(i, 'name', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Price</label>
                  <input type="text" value={tier.price} onChange={e => updatePricingTier(i, 'price', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Features (comma separated)</label>
                <textarea rows={2} value={tier.features?.join(', ')} onChange={e => updatePricingTier(i, 'features', e.target.value.split(',').map((f: string) => f.trim()))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <div className={`w-10 h-6 rounded-full transition-all ${tier.isPopular ? 'bg-orange-500' : 'bg-gray-700'} relative`}
                  onClick={() => updatePricingTier(i, 'isPopular', !tier.isPopular)}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tier.isPopular ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm text-gray-300">Mark as Most Popular</span>
              </label>
            </div>
          ))}
        </div>
      </Section>

      <Section title="🎛️ Section Visibility">
        <div className="space-y-3">
          <Toggle label="Show Testimonials on Home" field="showTestimonials" settings={settings} update={update} />
          <Toggle label="Show Blog Section" field="showBlog" settings={settings} update={update} />
          <Toggle label="Show Services Section" field="showServices" settings={settings} update={update} />
          <Toggle label="Show Featured Projects on Home" field="showFeaturedProjects" settings={settings} update={update} />
          <Toggle label="Show Newsletter Signup" field="showNewsletter" settings={settings} update={update} />
        </div>
      </Section>

      <Section title="📞 Contact Page">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Main Headline" field="contactHeadline" settings={settings} update={update} />
          <Input label="Info Section Title" field="contactTitle" settings={settings} update={update} />
        </div>
        <Textarea label="Main Description" field="contactDescription" rows={3} settings={settings} update={update} />
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800/50">
          <Input label="Email Address" field="email" settings={settings} update={update} />
          <Input label="WhatsApp Number" field="whatsapp" settings={settings} update={update} />
          <Input label="Phone Number" field="phone" settings={settings} update={update} />
          <Input label="Physical Location" field="location" settings={settings} update={update} />
        </div>
      </Section>

      <Section title="📝 Footer">
        <Input label="Footer Copyright Text" field="footerText" settings={settings} update={update} />
      </Section>

      <button onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-bg text-white font-bold text-base hover:opacity-90 disabled:opacity-60">
        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Save All Changes</>}
      </button>
    </div>
  );
}
