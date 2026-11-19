import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, LogIn, LogOut, Trash2 } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  if (!toast) return null;

  const isObject = typeof toast === 'object';
  const message = isObject ? toast.message : toast;
  const title = isObject && toast.title ? toast.title : null;
  const type = isObject && toast.type ? toast.type : 'success';
  const icon = isObject && toast.icon ? toast.icon : null;

  const renderIcon = () => {
    if (icon === 'login') {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <LogIn className="w-4 h-4" />
        </div>
      );
    }
    if (icon === 'logout') {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <LogOut className="w-4 h-4" />
        </div>
      );
    }
    if (icon === 'delete' || type === 'delete') {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'error') {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'warning') {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4" />
      </div>
    );
  };

  const getBorderAccent = () => {
    if (icon === 'logout' || type === 'warning') return 'border-l-4 border-l-amber-500';
    if (icon === 'delete' || type === 'error' || type === 'delete') return 'border-l-4 border-l-rose-500';
    return 'border-l-4 border-l-emerald-500';
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md pointer-events-auto transition-all duration-300">
      <div
        className={`flex items-start gap-3.5 p-4 bg-neutral-900/95 dark:bg-neutral-900/95 text-white rounded-xl shadow-2xl border border-neutral-700/80 backdrop-blur-md ${getBorderAccent()} animate-in fade-in slide-in-from-top-4 duration-200`}
        role="alert"
      >
        {renderIcon()}

        <div className="flex-1 min-w-0 pt-0.5">
          {title ? (
            <>
              <h4 className="text-xs font-mono font-bold tracking-wide uppercase text-neutral-200 mb-0.5">
                {title}
              </h4>
              <p className="text-xs text-neutral-300 leading-snug">
                {message}
              </p>
            </>
          ) : (
            <p className="text-xs font-medium text-neutral-100 leading-snug">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0 -mr-1 -mt-1"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
