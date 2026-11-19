import React from 'react';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  ArrowUpRight,
  Server,
  Zap,
  TrendingUp,
  ShieldCheck,
  Plus,
  Layers,
  Briefcase,
  Handshake
} from 'lucide-react';

export default function OverviewDashboard({
  metrics,
  tickets,
  services = [],
  careers = [],
  partners = [],
  onSelectTicket,
  onOpenCreateTicket,
  onNavigateToTab
}) {
  const urgentTickets = tickets.filter(t => t.priority === 'Urgent' || t.status === 'Open').slice(0, 4);
  const openCareersCount = careers.filter(c => c.status === 'Open').length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-neutral-900 dark:text-neutral-200 transition-colors">
      {/* 1. Executive Operations Bar */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-white dark:bg-neutral-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/70 px-2.5 py-0.5 rounded">
              Al Bazzam Facilities Managment Group
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Central Command Hub</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Corporate IT Systems & Software Operations
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Monitoring mission-critical software services, incident triage queues, and corporate digital presence.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateTicket}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Incident</span>
          </button>

        </div>
      </div>

      {/* 2. Precision Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-neutral-500 dark:text-neutral-400">
            <span>ACTIVE INCIDENTS</span>
            <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white font-mono">{metrics.activeTickets}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-semibold">+4 unassigned</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono flex items-center justify-between pt-1 border-t border-neutral-200 dark:border-neutral-800/60">
            <span>Avg Response: <strong className="text-neutral-800 dark:text-neutral-200">{metrics.avgResponseTime}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{metrics.resolvedToday} resolved</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-neutral-500 dark:text-neutral-400">
            <span>SLA COMPLIANCE</span>
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{metrics.slaCompliance}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +1.2%
            </span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono pt-1 border-t border-neutral-200 dark:border-neutral-800/60">
            <span>Target: &gt;95% within SLA standard</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-neutral-500 dark:text-neutral-400">
            <span>LIVE IT SERVICES</span>
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white font-mono">{services.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{openCareersCount} open roles</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono pt-1 border-t border-neutral-200 dark:border-neutral-800/60">
            <span>Partners: <strong className="text-neutral-800 dark:text-neutral-200">{partners.length} Technology Alliances</strong></span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-neutral-500 dark:text-neutral-400">
            <span>INFRASTRUCTURE HEALTH</span>
            <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">99.98%</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">28ms latency</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono pt-1 border-t border-neutral-200 dark:border-neutral-800/60">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● All core gateways nominal</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Split: Priority Incidents vs CMS Services & Careers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Priority Incidents */}
        <div className="lg:col-span-7 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-white dark:bg-neutral-950 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">
                Priority Incident Triage ({urgentTickets.length})
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">Tickets approaching SLA limits</p>
            </div>

            <button
              onClick={() => onNavigateToTab('tickets')}
              className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-mono font-semibold flex items-center gap-1.5"
            >
              <span>View Queue</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
            {urgentTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="py-3.5 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/80 rounded cursor-pointer transition-colors flex items-start justify-between gap-4 group"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{ticket.id}</span>
                    <span className="text-neutral-400 dark:text-neutral-600">•</span>
                    <span className="text-neutral-600 dark:text-neutral-300">{ticket.category}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {ticket.subject}
                  </h4>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    From: <span className="text-neutral-800 dark:text-neutral-200">{ticket.requester.name}</span> ({ticket.requester.department})
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 font-mono">
                  <span className="text-xs text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded">
                    {ticket.slaDue}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): CMS Services & Open Roles */}
        <div className="lg:col-span-5 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-white dark:bg-neutral-950 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">
                Corporate CMS Overview
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">Services, Careers & Partners</p>
            </div>
            <button
              onClick={() => onNavigateToTab('cms', 'services')}
              className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-mono font-semibold"
            >
              Open Studio
            </button>
          </div>

          {/* Featured Service Preview */}
          {services[0] && (
            <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400">
                <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Featured Solution
                </span>
                <span>{services[0].category}</span>
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                {services[0].title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                {services[0].tagline || services[0].description}
              </p>
              <div className="pt-2.5 flex items-center justify-between text-xs font-mono border-t border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">{services[0].status}</strong></span>
                <span>{services[0].lastUpdated}</span>
              </div>
            </div>
          )}

          {/* Quick Careers List */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-neutral-500 dark:text-neutral-400 font-bold block">
                Active Job Postings ({openCareersCount})
              </span>
              <button
                onClick={() => onNavigateToTab('cms', 'careers')}
                className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View all
              </button>
            </div>
            {careers.slice(0, 3).map((job) => (
              <div
                key={job.id}
                onClick={() => onNavigateToTab('cms', 'careers')}
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer text-xs font-mono text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-[200px]">
                  {job.title}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/50 px-2 py-0.5 rounded shrink-0">
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
