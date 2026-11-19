import React from 'react';
import { AlertTriangle, Trash2, LogOut, X, ShieldAlert } from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirmation Required',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  icon = 'trash', // 'trash' | 'logout' | 'alert'
  onConfirm,
  onCancel,
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();

  if (!isOpen) return null;

  const renderIcon = () => {
    if (icon === 'logout') {
      return (
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
          <LogOut className="w-5 h-5" />
        </div>
      );
    }
    if (variant === 'danger' || icon === 'trash') {
      return (
        <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>
    );
  };

  const getConfirmButtonClasses = () => {
    if (variant === 'danger' || icon === 'trash') {
      return 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs';
    }
    if (icon === 'logout' || variant === 'warning') {
      return 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs';
    }
    return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs';
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden transition-transform duration-100 ${
          isAlerting ? 'animate-windows-shake ring-4 ring-rose-500/40' : ''
        }`}
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              System Confirmation
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-6 flex items-start gap-4">
          {renderIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">
              {title}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded text-xs font-mono font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-xs font-mono font-bold transition-colors ${getConfirmButtonClasses()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
