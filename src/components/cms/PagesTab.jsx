import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Eye,
  Layers,
  X,
  AlertTriangle
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';

export default function PagesTab({ pages, onTogglePublish, onUpdatePage, onAddPage }) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const [search, setSearch] = useState('');
  const [previewPage, setPreviewPage] = useState(null);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    template: 'Standard Content',
    seoTitle: '',
  });

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreatePage = (e) => {
    e.preventDefault();
    if (!newPageData.title.trim() || !newPageData.slug.trim()) return;

    onAddPage({
      ...newPageData,
      status: 'Draft',
      lastModified: 'Just now',
      author: 'Marcus Chen',
      views: '0 (New)',
      sectionsCount: 3,
    });

    setIsNewPageModalOpen(false);
    setNewPageData({ title: '', slug: '', template: 'Standard Content', seoTitle: '' });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & New Page Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Filter pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <button
          onClick={() => setIsNewPageModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Web Page</span>
        </button>
      </div>

      {/* Pages Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 shadow-xs">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 select-none">
            <tr>
              <th className="py-3 px-4 font-semibold">PAGE TITLE & SLUG</th>
              <th className="py-3 px-4 font-semibold">TEMPLATE</th>
              <th className="py-3 px-4 font-semibold">STATUS</th>
              <th className="py-3 px-4 font-semibold">SECTIONS</th>
              <th className="py-3 px-4 font-semibold">30-DAY VIEWS</th>
              <th className="py-3 px-4 font-semibold">LAST MODIFIED</th>
              <th className="py-3 px-4 text-right font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
            {filteredPages.map((page) => (
              <tr
                key={page.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
              >
                <td className="py-3.5 px-4">
                  <div className="font-sans font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{page.title}</span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono pl-6">
                    {page.slug}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs border border-neutral-200 dark:border-neutral-700">
                    {page.template}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <button
                    onClick={() => onTogglePublish(page.id)}
                    className={`text-xs font-bold px-2.5 py-1 rounded border transition-colors ${page.status === 'Published'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                      }`}
                  >
                    {page.status}
                  </button>
                </td>

                <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300 text-xs">
                  {page.sectionsCount} blocks
                </td>

                <td className="py-3.5 px-4 text-neutral-900 dark:text-neutral-200 text-xs font-bold">
                  {page.views}
                </td>

                <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 text-xs">
                  {page.lastModified}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setPreviewPage(page)}
                    className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Inspect metadata"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Page Preview Modal */}
      {previewPage && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-neutral-950 border w-full max-w-md rounded-lg p-5 space-y-4 shadow-xl transition-all duration-150 text-neutral-900 dark:text-neutral-200 ${isAlerting
              ? 'animate-windows-shake border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/30'
              : 'border-neutral-200 dark:border-neutral-800'
              }`}
          >
            {isAlerting && (
              <div className="bg-amber-500 text-neutral-950 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Active Dialog: Please click Close (✕) to dismiss.</span>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-neutral-900 dark:text-white text-base">Page Properties</h4>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Title:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{previewPage.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Route:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{previewPage.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Template:</span>
                <span className="text-neutral-700 dark:text-neutral-200">{previewPage.template}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">SEO Meta Title:</span>
                <span className="text-neutral-700 dark:text-neutral-200">{previewPage.seoTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Author:</span>
                <span className="text-neutral-700 dark:text-neutral-200">{previewPage.author}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setPreviewPage(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded text-xs font-mono font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Page Modal */}
      {isNewPageModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-neutral-950 border w-full max-w-md rounded-lg p-5 space-y-4 shadow-xl transition-all duration-150 text-neutral-900 dark:text-neutral-200 ${isAlerting
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
              <h4 className="font-bold text-neutral-900 dark:text-white text-base">Create New Web Page</h4>
              <button
                onClick={() => setIsNewPageModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">Page Title *</label>
                <input
                  type="text"
                  required
                  value={newPageData.title}
                  onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value })}
                  placeholder="e.g. Energy Management & Sustainability"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={newPageData.slug}
                  onChange={(e) => setNewPageData({ ...newPageData, slug: e.target.value })}
                  placeholder="/services/energy-management"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 font-mono text-xs focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">Template</label>
                <select
                  value={newPageData.template}
                  onChange={(e) => setNewPageData({ ...newPageData, template: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-neutral-700"
                >
                  <option value="Standard Content">Standard Content</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Service Showcase">Service Showcase</option>
                  <option value="Corporate Profile">Corporate Profile</option>
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPageModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
