'use client';
import { useRef, useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function MediaUpload({ value, onChange, folder = 'portfolio', label = 'Upload Image' }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('resourceType', file.type.startsWith('video') ? 'video' : 'image');
    
    const res = await api('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const toastId = toast.loading('Uploading...');
    try {
      const url = await uploadFile(file);
      onChange(url);
      toast.success('Upload complete!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. Check Next.js console.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <input 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" 
        />
        <button 
          type="button" 
          onClick={() => inputRef.current?.click()} 
          disabled={uploading}
          className="px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
        >
          <FiUpload size={16} /> {uploading ? 'Uploading...' : label}
        </button>
        <input 
          ref={inputRef} 
          type="file" 
          accept="image/*,video/*" 
          className="hidden" 
          onChange={handleUpload} 
        />
      </div>
    </div>
  );
}
