import React, { useState } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Wifi,
  Key,
  Printer,
  Package,
  Wrench,
  Building2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { formatWhatsAppListTimestamp } from '../../utils/dateGrouping';

export default function EmployeePortal({
  currentUser,
  myTickets,
  kbArticles,
  onOpenCreateTicket,
  onSelectTicket,
  onOpenArticle
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredKb = kbArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const serviceCategories = [
    { title: 'Workstation & Network', desc: 'VPN, WiFi, Outlook, IP phone & connectivity', icon: Wifi },
    { title: 'Access & Security', desc: 'Door access badges, parking gate, Okta SSO, MFA', icon: Key },
    { title: 'Office Hardware & Print', desc: 'Follow-Me badge printers, scanners, monitors', icon: Printer },
    { title: 'Software & Licenses', desc: 'Adobe, Microsoft 365, CAFM, AutoCAD seats', icon: Package },
  ];

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full max-w-6xl mx-auto text-neutral-900 dark:text-neutral-200 transition-colors">
      {/* 1. Header Banner */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 bg-gradient-to-r from-emerald-50 via-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 px-2.5 py-1 rounded">
              Al Bazzam Service Desk
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Employee Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            How can the IT Department assist you, {currentUser.name.split(' ')[0]}?
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
            Submit IT service requests to our engineering team, request software access, track live resolution milestones, or follow runbooks to resolve issues.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateTicket}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Service Request</span>
          </button>
        </div>
      </div>

      {/* 2. Service Request Catalog Tiles */}
      <div className="space-y-3">
        <span className="text-xs font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400 font-bold block">
          Quick Request Categories
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={onOpenCreateTicket}
                className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:border-emerald-400 dark:hover:border-emerald-500/40 cursor-pointer transition-colors space-y-2.5 group shadow-xs"
              >
                <div className="w-10 h-10 rounded bg-emerald-50 dark:bg-neutral-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.title}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. My Open Service Requests Tracker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400 font-bold">
            Active Requests ({myTickets.length})
          </span>
          <button
            onClick={onOpenCreateTicket}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-bold"
          >
            + New Request
          </button>
        </div>

        {myTickets.length > 0 ? (
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950 shadow-xs">
            {myTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{ticket.id}</span>
                    <span className="text-neutral-400 dark:text-neutral-500">•</span>
                    <span className="text-neutral-600 dark:text-neutral-400">{ticket.category}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {ticket.subject}
                  </h4>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    Assigned to: <strong className="text-neutral-800 dark:text-neutral-200">{ticket.assignee?.name || 'IT Support Team'}</strong> • Updated {formatWhatsAppListTimestamp(ticket.updated_at || ticket.created_at || ticket.updatedAt, ticket.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${ticket.status === 'Resolved'
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800/80'
                      : ticket.status === 'In Progress'
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800/80'
                        : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800/80'
                      }`}
                  >
                    {ticket.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950">
            No pending service requests. Everything is operational.
          </div>
        )}
      </div>

      {/* 4. Knowledge Base Guides */}
      <div className="space-y-3">
        <span className="text-xs font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400 font-bold block">
          Self-Help & Troubleshooting Guides
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKb.map((art) => (
            <div
              key={art.id}
              onClick={() => onOpenArticle(art)}
              className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:border-emerald-400 dark:hover:border-emerald-500/40 cursor-pointer transition-colors space-y-2.5 group shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{art.category}</span>
                <span>{art.views} reads</span>
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {art.title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                {art.summary}
              </p>
              <div className="pt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <span>View Step-by-Step Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
