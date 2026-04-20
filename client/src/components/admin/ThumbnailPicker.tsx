'use client';
import { useRef, useState } from 'react';
import { FiUpload, FiCheck, FiImage } from 'react-icons/fi';
import { parseYouTubeId } from '@/components/VideoEmbed';

interface ThumbnailPickerProps {
  videoUrl?: string;
  provider?: 'youtube' | 'drive' | null;
  current: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string | null>;
  uploading?: boolean;
}

export default function ThumbnailPicker({
  videoUrl, provider, current, onChange, onUpload, uploading = false,
}: ThumbnailPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCustom, setUploadingCustom] = useState(false);

  // Build YouTube auto-thumbnail options from YouTube's image CDN (no API key needed!)
  const youtubeThumbs = (() => {
    if (provider !== 'youtube' || !videoUrl) return [];
    const id = parseYouTubeId(videoUrl);
    if (!id) return [];
    return [
      { url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, label: 'Max Res' },
      { url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,     label: 'HQ' },
      { url: `https://img.youtube.com/vi/${id}/1.jpg`,             label: 'Frame 1' },
      { url: `https://img.youtube.com/vi/${id}/2.jpg`,             label: 'Frame 2' },
      { url: `https://img.youtube.com/vi/${id}/3.jpg`,             label: 'Frame 3' },
    ];
  })();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCustom(true);
    const url = await onUpload(file);
    if (url) onChange(url);
    setUploadingCustom(false);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const isUploading = uploading || uploadingCustom;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Thumbnail / Cover Image <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-400/50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
        >
          <FiUpload size={11} />
          {uploadingCustom ? 'Uploading...' : 'Upload Custom'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* YouTube auto-frames */}
      {youtubeThumbs.length > 0 && (
        <div className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-3 space-y-2">
          <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
            🎬 <span>YouTube auto-thumbnails — click any frame to use as cover:</span>
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {youtubeThumbs.map((t, i) => {
              const isSelected = current === t.url;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(t.url)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group ${
                    isSelected
                      ? 'border-orange-500 ring-1 ring-orange-500/50'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.url}
                    alt={t.label}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                        <FiCheck size={11} className="text-white" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[9px] text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-600">Or upload your own custom thumbnail above ↑</p>
        </div>
      )}

      {/* For Drive/no video — show empty upload zone */}
      {youtubeThumbs.length === 0 && !current && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full aspect-video border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-orange-500/60 hover:text-orange-400 transition-all"
        >
          <FiImage size={28} />
          <div className="text-center">
            <p className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Upload cover image'}</p>
            <p className="text-xs text-gray-600 mt-0.5">PNG, JPG, WEBP · max 10MB</p>
          </div>
        </button>
      )}

      {/* Selected thumbnail preview */}
      {current && (
        <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="Selected thumbnail" className="w-full aspect-video object-cover" />
          <div className="absolute bottom-2 left-2 bg-green-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
            <FiCheck size={9} /> Selected
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-sm transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
