import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  // Strictly detect if running inside Electron desktop application
  const isElectron = typeof window !== 'undefined' && (
    Boolean(window.electronAPI) ||
    navigator.userAgent.toLowerCase().includes('electron') ||
    window.location.search.includes('desktop=true')
  );

  useEffect(() => {
    if (isElectron && window.electronAPI?.isMaximized) {
      window.electronAPI.isMaximized().then(setIsMaximized);
    }
  }, [isElectron]);

  // If opened in a web browser, DO NOT render the taskbar with close, minimize, maximize
  if (!isElectron) {
    return null;
  }

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
      setIsMaximized(!isMaximized);
    } else {
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    } else {
      if (confirm('Close desktop application?')) {
        window.close();
      }
    }
  };

  return (
    <header className="app-drag-region h-9 bg-slate-100 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 flex items-center justify-between pl-3 pr-0 select-none z-50 shrink-0">
      {/* Left: Window Drag Region & App Descriptor */}
      <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-neutral-400">
        {/* Company Official Logo Centered in White Rectangle Badge */}

        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-700 shrink-0"></span>
        <span className="font-semibold text-slate-800 dark:text-neutral-200 font-sans tracking-tight">
          Al Bazzam Enterprise IT Operations Suite
        </span>
      </div>

      {/* Right: Windows Application Frame Controls (Minimize, Maximize, Close) */}
      <div className="app-no-drag flex items-center h-full">
        <button
          onClick={handleMinimize}
          className="w-11 h-full flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-11 h-full flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-full flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-white hover:bg-rose-600 transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
