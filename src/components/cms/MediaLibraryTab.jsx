import React, { useState } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Copy,
  Trash2,
  Check,
  FileText
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

export default function MediaLibraryTab({
  media,
  onUploadMedia,
  onDeleteMedia,
  onCopyUrl
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);

  const filtered = media.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', 'Brand Assets', 'Banners', 'Documents', 'Editorial'];

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      onUploadMedia({
        id: `med-${Date.now()}`,
        name: `bazzam-asset-${Math.floor(Math.random() * 900) + 100}.webp`,
        type: 'image/webp',
        size: '1.2 MB',
        dimensions: '1920 x 1080',
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'Marcus Chen',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        category: 'Editorial',
      });
      setIsUploading(false);
    }, 800);
  };

  const handleCopy = (id, url) => {
    onCopyUrl(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Upload Drop Strip */}
      <div
        onClick={handleSimulatedUpload}
        className="p-6 border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg text-center cursor-pointer transition-colors shadow-xs"
      >
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className={`w-8 h-8 ${isUploading ? 'text-emerald-600 dark:text-emerald-400 animate-bounce' : 'text-neutral-400'}`} />
          <span className="font-bold text-neutral-900 dark:text-white text-sm">
            {isUploading ? 'Uploading & Optimizing WebP Asset...' : 'Click to Upload Media Asset to Al Bazzam CDN'}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
            Directly synced to edge CDN bucket (WebP, PNG, SVG, PDF up to 15 MB)
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search media by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === c
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group shadow-xs"
          >
            <div className="h-40 bg-neutral-100 dark:bg-neutral-900 relative overflow-hidden flex items-center justify-center">
              {item.type.includes('image') ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <FileText className="w-12 h-12 text-neutral-400" />
              )}
              <span className="absolute bottom-2 left-2 text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white">
                {item.dimensions || item.size}
              </span>
            </div>

            <div className="p-3.5 space-y-2">
              <div className="truncate text-xs font-mono font-bold text-neutral-900 dark:text-white">
                {item.name}
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                <span>{item.category}</span>
                <span>{item.size}</span>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(item.id, item.url)}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-semibold"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy CDN URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setMediaToDelete(item)}
                  className="p-1 rounded text-neutral-400 hover:text-rose-600 transition-colors"
                  title="Delete media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog for Delete Media */}
      <ConfirmDialog
        isOpen={!!mediaToDelete}
        title="Delete Media Asset"
        message={
          mediaToDelete
            ? `Are you sure you want to permanently delete "${mediaToDelete.name}" from the corporate CDN storage?`
            : ''
        }
        confirmText="Delete Asset"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (mediaToDelete) {
            onDeleteMedia(mediaToDelete.id);
            setMediaToDelete(null);
          }
        }}
        onCancel={() => setMediaToDelete(null)}
      />
    </div>
  );
}
