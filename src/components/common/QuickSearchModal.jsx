import React, { useState, useEffect } from 'react';
import { Search, Ticket, Globe, FileText, Megaphone, Users, X, ArrowRight, AlertTriangle } from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';

export default function QuickSearchModal({
  isOpen,
  onClose,
  tickets,
  cmsPages,
  articles,
  banners,
  onSelectTicket,
  onNavigateToTab
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedTickets = tickets.filter(
    (t) =>
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      t.subject.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const matchedPages = cmsPages.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const matchedArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-neutral-950 w-full max-w-2xl rounded-lg shadow-2xl border transition-all duration-150 overflow-hidden flex flex-col text-slate-900 dark:text-neutral-200 ${isAlerting
            ? 'animate-windows-shake border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/30'
            : 'border-slate-200 dark:border-neutral-800'
          }`}
      >
        {isAlerting && (
          <div className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Active Dialog: Press ESC or click Close (✕) to exit search.</span>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-neutral-800 gap-3 bg-slate-50/80 dark:bg-neutral-900/50">
          <Search className="w-5 h-5 text-slate-400 dark:text-neutral-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type ticket ID, page title, or article keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
            title="Close search"
          >
            <X className="w-4 h-4" />
          </button>
          <kbd className="text-xs bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 px-2 py-0.5 rounded text-slate-500 dark:text-neutral-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-4">
          {query.trim() === '' && (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-neutral-500 font-mono">
              Start typing to search tickets, website pages, news articles, or press ESC to exit.
            </div>
          )}

          {/* Matched Tickets */}
          {matchedTickets.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-neutral-400 px-2 block">
                Support Tickets
              </span>
              {matchedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    onSelectTicket(ticket);
                    onClose();
                  }}
                  className="p-3 rounded hover:bg-slate-100 dark:hover:bg-neutral-900 cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-neutral-800"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{ticket.id}</span>
                    <span className="text-sm text-slate-900 dark:text-neutral-200 truncate">{ticket.subject}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono shrink-0 ml-2">{ticket.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Pages */}
          {matchedPages.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-neutral-400 px-2 block">
                Website CMS Pages
              </span>
              {matchedPages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => {
                    onNavigateToTab('cms', 'pages');
                    onClose();
                  }}
                  className="p-3 rounded hover:bg-slate-100 dark:hover:bg-neutral-900 cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-neutral-800"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-900 dark:text-neutral-200 truncate">{page.title}</span>
                    <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 truncate">{page.slug}</span>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono shrink-0 ml-2">{page.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Articles */}
          {matchedArticles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-neutral-400 px-2 block">
                Articles & Announcements
              </span>
              {matchedArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    onNavigateToTab('cms', 'articles');
                    onClose();
                  }}
                  className="p-3 rounded hover:bg-slate-100 dark:hover:bg-neutral-900 cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-neutral-800"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-900 dark:text-neutral-200 truncate">{article.title}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono shrink-0 ml-2">{article.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
