import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  PlusCircle,
  ShieldAlert,
  Copy,
  Check,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';

export default function KbArticleModal({
  article,
  onClose,
  onNeedTicket
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-neutral-950 w-full max-w-2xl max-h-[85vh] rounded-lg shadow-2xl border transition-all duration-150 flex flex-col overflow-hidden text-slate-800 dark:text-neutral-200 ${isAlerting
            ? 'animate-windows-shake border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/30'
            : 'border-slate-200 dark:border-neutral-800'
          }`}
      >
        {/* Windows Dialog Attention Warning when clicking outside */}
        {isAlerting && (
          <div className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Active Dialog: Please click Close (✕) to dismiss this guide.</span>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                {article.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-neutral-400 ml-2.5 font-mono">
                {article.views} views • {article.helpfulScore} found helpful
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
              title="Copy Guide Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 leading-relaxed text-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              {article.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 font-mono">
              <span>Verified IT Staff Runbook</span>
              <span>•</span>
              <span>Last updated: {article.lastUpdated}</span>
            </div>
          </div>

          {/* Quick Checklist / Steps */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
              Diagnostic & Resolution Steps
            </h4>
            <div className="space-y-2.5 text-sm text-slate-700 dark:text-neutral-300">
              {article.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-slate-200 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-xs font-mono font-bold text-slate-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro-Tip Box */}
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-950 dark:text-neutral-300 space-y-1">
            <span className="font-bold text-emerald-800 dark:text-emerald-400 block font-mono">PRO-TIP FROM IT OPERATIONS:</span>
            <p className="text-slate-700 dark:text-neutral-300">
              If your corporate laptop shows credential sync errors or repeated SSO prompts, ensure you are connected to the Al Bazzam HQ internal network or have GlobalProtect VPN v5.2+ enabled.
            </p>
          </div>

          {/* Feedback & Escalate Action */}
          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">Did this solve your issue?</span>
              <button
                onClick={() => setFeedbackGiven('yes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${feedbackGiven === 'yes'
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
                  }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => setFeedbackGiven('no')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${feedbackGiven === 'no'
                  ? 'bg-rose-100 dark:bg-rose-900/50 border-rose-500 dark:border-rose-600 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
                  }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onNeedTicket && onNeedTicket();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Still Need Help? Raise Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
