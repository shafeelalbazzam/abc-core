import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Eye
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ArticlesTab({
  articles,
  onOpenEditor,
  onDeleteArticle,
  onToggleStatus
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articleToDelete, setArticleToDelete] = useState(null);

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', 'Security', 'Engineering', 'Support & AI', 'Company News'];

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search news & articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-800 dark:text-neutral-300 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onOpenEditor(null)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold transition-colors shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((article) => (
          <div
            key={article.id}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-xs"
          >
            {article.coverImage && (
              <div className="h-44 w-full overflow-hidden">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                    {article.category}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    {article.readTime}
                  </span>
                </div>

                <h4 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-2">
                  {article.title}
                </h4>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
                <div className="text-neutral-500 dark:text-neutral-400">
                  By <span className="text-neutral-800 dark:text-neutral-200">{article.author}</span> • {article.publishDate}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenEditor(article)}
                    className="p-1.5 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Edit article"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setArticleToDelete(article)}
                    className="p-1.5 rounded text-neutral-400 hover:text-rose-600 transition-colors"
                    title="Delete article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog for Delete Article */}
      <ConfirmDialog
        isOpen={!!articleToDelete}
        title="Delete Knowledge Article"
        message={
          articleToDelete
            ? `Are you sure you want to permanently delete "${articleToDelete.title}"?`
            : ''
        }
        confirmText="Delete Article"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (articleToDelete) {
            onDeleteArticle(articleToDelete.id);
            setArticleToDelete(null);
          }
        }}
        onCancel={() => setArticleToDelete(null)}
      />
    </div>
  );
}
