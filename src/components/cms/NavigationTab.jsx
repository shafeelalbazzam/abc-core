import React, { useState } from 'react';
import {
  MenuSquare,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function NavigationTab({ links, onUpdateLinks }) {
  const [items, setItems] = useState(links);
  const [newLabel, setNewLabel] = useState('');
  const [newPath, setNewPath] = useState('');
  const [isExternal, setIsExternal] = useState(false);

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...items];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
    onUpdateLinks(updated);
  };

  const moveDown = (index) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
    onUpdateLinks(updated);
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLabel.trim() || !newPath.trim()) return;

    const newLink = {
      id: Date.now(),
      label: newLabel,
      path: newPath,
      isExternal,
      order: items.length + 1,
      status: 'Active',
    };

    const updated = [...items, newLink];
    setItems(updated);
    onUpdateLinks(updated);

    setNewLabel('');
    setNewPath('');
    setIsExternal(false);
  };

  const handleDelete = (id) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    onUpdateLinks(updated);
  };

  return (
    <div className="space-y-5 text-sm">
      {/* Top Banner */}
      <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <h3 className="font-bold text-neutral-900 dark:text-white text-base">
          Primary Header & Footer Menus
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Order and configure navigation links across the public albazzam.com website.
        </p>
      </div>

      {/* Navigation Reordering List */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 divide-y divide-neutral-200 dark:divide-neutral-800 shadow-xs">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                {index + 1}
              </span>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white text-sm">{item.label}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono ml-3">{item.path}</span>
              </div>
              {item.isExternal && (
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>External</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title="Move link up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title="Move link down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-rose-600 transition-colors ml-2"
                title="Delete link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Link Strip */}
      <form
        onSubmit={handleAddLink}
        className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 flex flex-col sm:flex-row sm:items-center gap-3 shadow-xs"
      >
        <div className="flex-1">
          <input
            type="text"
            required
            placeholder="Link Label (e.g. ESG & Sustainability)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="flex-1">
          <input
            type="text"
            required
            placeholder="Target Route (/sustainability)"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 font-mono focus:outline-none focus:border-neutral-700"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={isExternal}
            onChange={(e) => setIsExternal(e.target.checked)}
            className="rounded accent-emerald-600 w-4 h-4"
          />
          <span>New Tab</span>
        </label>

        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Link</span>
        </button>
      </form>
    </div>
  );
}
