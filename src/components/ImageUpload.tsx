'use client';

import { useRef } from 'react';
import { fileToBase64 } from '@/lib/pdf';

interface ImageUploadProps {
  value: string;
  onChange: (base64: string) => void;
  label: string;
  hint?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, label, hint, className = '' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }
    const base64 = await fileToBase64(file);
    onChange(base64);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt={label} className="h-24 object-contain border border-gray-200 rounded-lg p-2 bg-white" />
          <button
            type="button"
            onClick={() => { onChange(''); if (inputRef.current) inputRef.current.value = ''; }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-gray-500">Click to upload</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
