import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  X,
  AlertTriangle
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';
import ConfirmDialog from '../common/ConfirmDialog';

export default function BannersTab({
  banners,
  onToggleStatus,
  onAddBanner,
  onDeleteBanner
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    subheadline: '',
    ctaText: 'Explore Services',
    ctaLink: '/services',
    position: 'Homepage Top Hero',
    schedule: 'Continuous',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.headline.trim()) return;

    onAddBanner(formData);
    setIsModalOpen(false);
    setFormData({
      name: '',
      headline: '',
      subheadline: '',
      ctaText: 'Explore Services',
      ctaLink: '/services',
      position: 'Homepage Top Hero',
      schedule: 'Continuous',
      imageUrl: '',
      status: 'Active',
    });
  };

  return (
    <div className="space-y-5 text-sm">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">
            Campaign Announcements & Hero Banners
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">
            Hero banners and global promotional alert strips displayed on albazzam.com
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Banner</span>
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div
            key={b.id}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-xs"
          >
            {b.imageUrl && (
              <div className="h-44 w-full overflow-hidden relative">
                <img
                  src={b.imageUrl}
                  alt={b.headline}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black/75 backdrop-blur-xs text-white border border-white/20">
                    {b.position}
                  </span>
                </div>
              </div>
            )}

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    Schedule: {b.schedule}
                  </span>
                  <button
                    onClick={() => onToggleStatus(b.id)}
                    className={`text-xs font-bold px-2.5 py-0.5 rounded border transition-colors ${b.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                      }`}
                  >
                    ● {b.status}
                  </button>
                </div>

                <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                  {b.headline}
                </h4>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                  {b.subheadline}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                <div className="text-neutral-600 dark:text-neutral-400">
                  CTA: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{b.ctaText}</span> ({b.ctaLink})
                </div>

                <button
                  onClick={() => setBannerToDelete(b)}
                  className="p-1 rounded text-neutral-400 hover:text-rose-600 transition-colors"
                  title="Remove banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Banner Modal */}
      {isModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-neutral-950 border w-full max-w-lg rounded-lg p-6 space-y-4 shadow-xl transition-all duration-150 text-neutral-900 dark:text-neutral-200 ${isAlerting
              ? 'animate-windows-shake border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/30'
              : 'border-neutral-200 dark:border-neutral-800'
              }`}
          >
            {isAlerting && (
              <div className="bg-amber-500 text-neutral-950 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Active Dialog: Please click Close (✕) or Cancel to dismiss.</span>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-neutral-900 dark:text-white text-base">Create New Hero Banner</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Total Facilities Management Solutions Since 1983"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 font-semibold focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">Subheadline</label>
                <textarea
                  rows={2}
                  value={formData.subheadline}
                  onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                  placeholder="Delivering world-class maintenance, HVAC, and commercial cleaning across the UAE."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-neutral-700 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">Target Link</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 text-xs font-mono focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">Background Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 text-xs font-mono focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Dialog for Delete Banner */}
      <ConfirmDialog
        isOpen={!!bannerToDelete}
        title="Delete Promotional Banner"
        message={
          bannerToDelete
            ? `Are you sure you want to remove banner "${bannerToDelete.headline || bannerToDelete.name}"?`
            : ''
        }
        confirmText="Delete Banner"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (bannerToDelete) {
            onDeleteBanner(bannerToDelete.id);
            setBannerToDelete(null);
          }
        }}
        onCancel={() => setBannerToDelete(null)}
      />
    </div>
  );
}
