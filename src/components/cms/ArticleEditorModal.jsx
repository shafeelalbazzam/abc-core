import React, { useState } from 'react';
import {
  X,
  Save,
  Globe,
  Eye,
  FileText,
  Image as ImageIcon,
  Calendar,
  CheckCircle2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';

export default function ArticleEditorModal({
  isOpen,
  onClose,
  article,
  onSaveArticle
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [formData, setFormData] = useState(
    article || {
      title: '',
      slug: '',
      category: 'Facilities Innovation',
      author: 'Tariq Al Mansoori',
      status: 'Published',
      publishDate: new Date().toISOString().split('T')[0],
      readTime: '4 min read',
      excerpt: '',
      content: `# Al Bazzam Facilities Update\n\nWrite your announcement or news article content here...`,
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      tags: ['Facilities', 'Sustainability']
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSaveArticle({
      ...formData,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });

    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-neutral-950 w-full max-w-5xl h-[88vh] rounded-lg shadow-2xl border transition-all duration-150 flex flex-col overflow-hidden text-slate-800 dark:text-neutral-200 ${isAlerting
            ? 'animate-windows-shake border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/30'
            : 'border-slate-200 dark:border-neutral-800'
          }`}
      >
        {/* Windows Dialog Attention Warning when clicking outside */}
        {isAlerting && (
          <div className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Active Dialog: Please click Close (✕) or Save & Publish to dismiss this editor.</span>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {article ? 'Edit Website Article / News' : 'Draft New Group News Article'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">Manage public corporate publication on albazzam.com</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'write' ? 'preview' : 'write')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 rounded text-xs font-semibold transition-colors border border-slate-200 dark:border-neutral-700"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{activeTab === 'write' ? 'Preview' : 'Edit Source'}</span>
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Publish</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'write' ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-slate-500 dark:text-neutral-400 mb-1">Article Headline *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Al Bazzam Group Expands Eco-Facility Operations Across UAE"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded text-slate-900 dark:text-neutral-200 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 dark:text-neutral-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded text-slate-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Facilities Innovation">Facilities Innovation</option>
                    <option value="Sustainability & ESG">Sustainability & ESG</option>
                    <option value="Corporate Milestones">Corporate Milestones</option>
                    <option value="Technology & BMS">Technology & BMS</option>
                    <option value="Press Releases">Press Releases</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 dark:text-neutral-400 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. eco-facility-expansion"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded text-slate-900 dark:text-neutral-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 dark:text-neutral-400 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded text-slate-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 dark:text-neutral-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded text-slate-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft (In Review)</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 dark:text-neutral-400 mb-1">Brief Excerpt (SEO Summary)</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Summary for search engines and social cards..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 dark:text-neutral-400 mb-1">Article Body (Markdown)</label>
                <textarea
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded text-slate-900 dark:text-neutral-200 font-mono text-sm leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>
            </form>
          ) : (
            /* Live Preview Mode */
            <div className="max-w-3xl mx-auto space-y-6 py-4">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 uppercase">
                  {formData.category}
                </span>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {formData.title || 'Untitled Article'}
                </h1>
                <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono flex items-center gap-2">
                  <span>By {formData.author}</span>
                  <span>•</span>
                  <span>{formData.publishDate}</span>
                  <span>•</span>
                  <span>{formData.readTime}</span>
                </div>
              </div>

              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt={formData.title}
                  className="w-full h-64 object-cover rounded-lg border border-slate-200 dark:border-neutral-800 shadow-sm"
                />
              )}

              <div className="max-w-none text-slate-700 dark:text-neutral-300 space-y-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {formData.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
