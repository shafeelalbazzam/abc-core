import React, { useState } from 'react';
import {
  Search,
  Plus,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  MessageSquare,
  Sparkles,
  Paperclip,
  User,
  Star,
  Check,
  ChevronRight,
  ShieldAlert,
  Calendar,
  ArrowUpDown,
  UploadCloud,
  File,
  ExternalLink,
  Image as ImageIcon,
  X,
  RotateCcw,
  ChevronDown,
  Mail,
  MailOpen,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import EditTicketModal from './EditTicketModal';
import ConfirmDialog from '../common/ConfirmDialog';
import {
  groupMessagesByDate,
  formatWhatsAppListTimestamp,
  getWhatsAppDateLabel
} from '../../utils/dateGrouping';

export default function TicketManagement({
  tickets,
  currentUser,
  onSelectTicket,
  onOpenCreateTicket,
  onUpdateTicketStatus,
  onEditTicket,
  onDeleteTicket,
  teamMembers,
  currentUserRole = 'support',
  onAddReply,
  onEditReply,
  onDeleteReply,
  onAddAttachment,
  onToggleReadTicket,
  onRefreshTickets,
  isRefreshingTickets = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedReadFilter, setSelectedReadFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Edit and Delete State
  const [editingTicket, setEditingTicket] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Edit and Delete Individual Note / Message State
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Date Filter States
  const [selectedDateFilter, setSelectedDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'six_months' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Inspector States
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rating, setRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Active selected ticket
  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  // Filtering
  const filteredTickets = tickets.filter((t) => {
    const requesterName = typeof t.requester === 'object' && t.requester?.name ? t.requester.name : (typeof t.requester === 'string' ? t.requester : '');
    const matchesSearch =
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Waiting' || selectedStatus === 'Waiting on Customer') {
        matchesStatus = t.status === 'Waiting on Customer' || t.status === 'Waiting';
      } else {
        matchesStatus = t.status === selectedStatus;
      }
    }

    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;

    // Date-wise filtering: today | week (last 7D) | month (last 30D) | six_months (last 180D) | custom
    let matchesDate = true;
    const ticketDateStr = t.date || (t.createdAt?.includes('-') ? t.createdAt.split(' ')[0] : '2026-11-18');
    if (selectedDateFilter === 'today') {
      matchesDate = ticketDateStr === '2026-11-18';
    } else if (selectedDateFilter === 'week') {
      matchesDate = ticketDateStr >= '2026-11-11' && ticketDateStr <= '2026-11-18';
    } else if (selectedDateFilter === 'month') {
      matchesDate = ticketDateStr >= '2026-10-18' && ticketDateStr <= '2026-11-18';
    } else if (selectedDateFilter === 'six_months') {
      matchesDate = ticketDateStr >= '2026-05-18' && ticketDateStr <= '2026-11-18';
    } else if (selectedDateFilter === 'custom') {
      if (customStartDate && customEndDate) {
        matchesDate = ticketDateStr >= customStartDate && ticketDateStr <= customEndDate;
      } else if (customStartDate) {
        matchesDate = ticketDateStr >= customStartDate;
      } else if (customEndDate) {
        matchesDate = ticketDateStr <= customEndDate;
      }
    }

    // Read / Unread filtering
    let matchesRead = true;
    if (selectedReadFilter === 'unread') {
      matchesRead = t.isUnread === true;
    } else if (selectedReadFilter === 'read') {
      matchesRead = !t.isUnread;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesDate && matchesRead;
  });

  // Date sorting
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const dateA = a.date || a.createdAt?.split(' ')[0] || '';
    const dateB = b.date || b.createdAt?.split(' ')[0] || '';
    return sortOrder === 'newest' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  });

  const statuses = [
    { id: 'All', label: 'All Statuses' },
    { id: 'Open', label: 'Open' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Waiting on Customer', label: 'Waiting' },
    { id: 'Resolved', label: 'Resolved' }
  ];

  const dateOptions = [
    { id: 'all', label: 'All Dates' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Last Week (7D)' },
    { id: 'month', label: 'Last Month (30D)' },
    { id: 'six_months', label: 'Last 6 Months' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const categories = [
    'All Categories',
    'Mail',
    'Hardware',
    'Software',
    'Network',
    'Other'
  ];

  const unreadTotalCount = tickets.filter((t) => t.isUnread).length;

  const activeFiltersCount =
    (selectedStatus !== 'All' ? 1 : 0) +
    (selectedCategory !== 'All' && selectedCategory !== 'All Categories' ? 1 : 0) +
    (selectedDateFilter !== 'all' ? 1 : 0) +
    (selectedReadFilter !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedDateFilter('all');
    setSelectedReadFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const getDateFilterLabel = (id) => {
    const found = dateOptions.find((d) => d.id === id);
    return found ? found.label : id;
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500 ring-4 ring-rose-500/20';
      case 'High':
        return 'bg-amber-500 ring-4 ring-amber-500/20';
      case 'Medium':
        return 'bg-blue-500 ring-2 ring-blue-500/20';
      default:
        return 'bg-neutral-400 dark:bg-neutral-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30';
      case 'In Progress':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30';
      case 'Waiting on Customer':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30';
      case 'Resolved':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30';
      default:
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800';
    }
  };

  const getDynamicAuthor = () => {
    if (currentUser?.name) {
      if (currentUserRole === 'support') {
        const deptOrRole = currentUser.department || currentUser.role || 'IT Support';
        return `${currentUser.name} (${deptOrRole})`;
      }
      return currentUser.name;
    }
    return currentUserRole === 'support' ? 'IT Support Specialist' : (activeTicket?.requester?.name || 'Requester');
  };

  const getDynamicRole = () => {
    if (currentUserRole === 'support') {
      return currentUser?.role || 'Support Engineer';
    }
    return 'Requester';
  };

  const formatMsgAuthor = (author) => {
    if (!author || author.includes('Alex Rivera') || author.includes('Alex Rivers')) {
      return getDynamicAuthor();
    }
    return author;
  };

  const handleSendReply = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    if (onAddReply) {
      onAddReply(activeTicket.id, {
        content: replyText.trim(),
        isInternal: currentUserRole === 'support' ? isInternalNote : false,
        author: getDynamicAuthor(),
        role: getDynamicRole(),
        time: 'Just now'
      });
    }

    setReplyText('');
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    const finalNote = resolutionSummary.trim() || 'Verified resolved with requester.';

    if (onAddReply) {
      onAddReply(activeTicket.id, {
        content: `✅ RESOLUTION SUMMARY: ${finalNote}`,
        isInternal: false,
        author: getDynamicAuthor(),
        role: getDynamicRole(),
        time: 'Just now'
      });
    }

    onUpdateTicketStatus(activeTicket.id, 'Resolved');
    setIsResolving(false);
  };

  const getPlaybook = (category) => {
    switch (category) {
      case 'Mail':
        return {
          title: 'Exchange Online & Outlook Sync Diagnostics',
          fix: 'Rebuilt cached Exchange mode OST profile, cleared stale SMTP authentication tokens, and re-synced Microsoft 365 mailbox.'
        };
      case 'Hardware':
        return {
          title: 'Workstation & Peripheral Diagnostics',
          fix: 'Tested hardware bus diagnostics, re-seated display docking interconnects, and updated OEM firmware drivers.'
        };
      case 'Software':
        return {
          title: 'Enterprise Software & Licensing Troubleshooting',
          fix: 'Cleared application runtime cache, verified SCIM license assignment, and pushed latest certified application build.'
        };
      case 'Network':
      case 'Network & VPN':
        return {
          title: 'ZTNA Gateway & Core Switching Resolution',
          fix: 'Rerouted client subnet to Secondary Standby Tunnel B. Flushed local workstation DNS with ipconfig /flushdns.'
        };
      case 'Other':
        return {
          title: 'General IT Incident Resolution',
          fix: 'Conducted end-to-end service diagnostics, resolved configuration mismatch, and confirmed normal operation with requester.'
        };
      case 'Software & APIs':
        return {
          title: 'ERP Webhook & Reverse Proxy Timeout (502/504)',
          fix: 'Extended proxy_read_timeout to 60s on Nginx reverse proxy. Restarted failing Node.js webhook worker pod.'
        };
      case 'Software & Licenses':
        return {
          title: 'Adobe / Figma Enterprise Provisioning',
          fix: 'Allocated enterprise seat in Adobe Admin Console. Pushed product profile token through Okta SCIM sync.'
        };
      case 'Identity & SSO':
        return {
          title: 'Okta SSO / Azure AD Token Cache Desync',
          fix: 'Cleared cached credentials in Windows Credential Manager. Revoked stale refresh token in Okta Directory.'
        };
      case 'Database & Backend':
        return {
          title: 'PostgreSQL PgBouncer Connection Saturation',
          fix: 'Terminated leaked idle transactions and bumped max_client_conn on primary database pool.'
        };
      case 'DevOps & Cloud':
        return {
          title: 'Kubernetes Pod CPU Throttle & Memory Leak',
          fix: 'Triggered horizontal pod autoscaler (HPA) rollout and deployed patched container tag with regex fix.'
        };
      default:
        return {
          title: 'Enterprise Software Diagnostics',
          fix: 'Verified service uptime logs, refreshed user directory privileges, and validated endpoint connectivity.'
        };
    }
  };

  const currentPlaybook = getPlaybook(activeTicket?.category);

  const handleUploadToActiveTicket = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeTicket) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAtt = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'application/octet-stream',
          isImage: isImg,
          url: event.target.result,
          uploadedAt: 'Just now'
        };

        if (onAddAttachment) {
          onAddAttachment(activeTicket.id, newAtt);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 transition-colors">
      {/* LEFT PANE: High-Density Ticket List (Master) */}
      <div className="w-full md:w-96 lg:w-[440px] flex flex-col border-r border-neutral-200 dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-950">
        {/* Filter & Search Bar */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-700 dark:text-neutral-300 uppercase">
                {currentUserRole === 'employee' ? 'My Incidents' : 'Incident Queue'} ({sortedTickets.length})
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold" title="Live Supabase Realtime synchronization active">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Realtime</span>
              </span>

              {onRefreshTickets && (
                <button
                  type="button"
                  onClick={onRefreshTickets}
                  disabled={isRefreshingTickets}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-[10px] font-mono text-neutral-600 dark:text-neutral-300 transition-colors disabled:opacity-50"
                  title="Sync incidents from Supabase now"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingTickets ? 'animate-spin text-emerald-500' : 'text-neutral-400'}`} />
                  <span>{isRefreshingTickets ? 'Syncing...' : 'Sync'}</span>
                </button>
              )}
              {unreadTotalCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedReadFilter(selectedReadFilter === 'unread' ? 'all' : 'unread')}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors ${selectedReadFilter === 'unread'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border border-blue-500/30'
                    }`}
                  title="Click to toggle unread incidents only"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                  <span>{unreadTotalCount} unread</span>
                </button>
              )}
            </div>

            <button
              onClick={onOpenCreateTicket}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Incident</span>
            </button>
          </div>

          {/* Search Bar with Integrated Comprehensive Filter on Right */}
          <div className="relative">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by ID, keyword, requester..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700 font-sans"
                />
              </div>

              {/* Sort Toggle */}
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
                title={`Sort: ${sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-bold transition-colors shrink-0 ${activeFiltersCount > 0 || isFilterOpen
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-white text-emerald-700 text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                ) : (
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                )}
              </button>
            </div>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100 text-xs">
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5 font-bold font-mono uppercase text-neutral-800 dark:text-neutral-200">
                    <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Filter Incidents</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. Status Filter */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                    Incident Status
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {statuses.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStatus(st.id)}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${selectedStatus === st.id
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Date Filter */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-500" />
                    <span>Date Range</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {dateOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedDateFilter(opt.id)}
                        className={`px-2 py-1 rounded text-xs font-mono text-left transition-colors truncate ${selectedDateFilter === opt.id
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Inputs if Custom selected */}
                  {selectedDateFilter === 'custom' && (
                    <div className="flex items-center gap-2 pt-2 p-2 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
                      <div className="flex-1">
                        <span className="text-neutral-400 block mb-0.5">From:</span>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-neutral-400 block mb-0.5">To:</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Category Filter */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                    Category / System
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-neutral-200 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat === 'All Categories' ? 'All' : cat} className="bg-white dark:bg-neutral-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Message Read / Unread Status Filter */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-500" />
                    <span>Message Read / Unread Status</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'all', label: 'All Messages' },
                      { id: 'unread', label: `Unread (${unreadTotalCount})` },
                      { id: 'read', label: 'Read Only' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedReadFilter(opt.id)}
                        className={`px-2 py-1 rounded text-xs font-mono font-bold text-center transition-colors truncate ${selectedReadFilter === opt.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popover Footer: Reset & Done */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs font-mono text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-colors shadow-2xs"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Chips / Summary Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono animate-in fade-in duration-100">
              <span className="text-neutral-400">Active:</span>

              {selectedStatus !== 'All' && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  Status: {statuses.find((s) => s.id === selectedStatus)?.label || selectedStatus}
                  <button onClick={() => setSelectedStatus('All')} className="hover:text-rose-500 font-bold">×</button>
                </span>
              )}

              {selectedDateFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  Date: {getDateFilterLabel(selectedDateFilter)}
                  <button onClick={() => setSelectedDateFilter('all')} className="hover:text-rose-500 font-bold">×</button>
                </span>
              )}

              {selectedReadFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1 font-bold">
                  {selectedReadFilter === 'unread' ? '✉ Unread Only' : '✉ Read Only'}
                  <button onClick={() => setSelectedReadFilter('all')} className="hover:text-rose-500 font-bold">×</button>
                </span>
              )}

              {selectedCategory !== 'All' && selectedCategory !== 'All Categories' && (
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-rose-500 font-bold">×</button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-neutral-400 hover:text-rose-500 underline ml-auto text-[10px]"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Ticket List - Gmail-style Read / Unread UI */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800/80">
          {sortedTickets.map((ticket) => {
            const isSelected = activeTicket?.id === ticket.id;
            const isUnread = ticket.isUnread;

            return (
              <div
                key={ticket.id}
                onClick={() => {
                  setSelectedTicketId(ticket.id);
                  if (ticket.isUnread && onToggleReadTicket) {
                    onToggleReadTicket(ticket.id, false);
                  }
                }}
                className={`p-3.5 cursor-pointer transition-all border-l-4 group relative ${isSelected
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-neutral-800/90 text-neutral-900 dark:text-white shadow-2xs'
                  : isUnread
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-neutral-900/90 hover:bg-blue-50/80 dark:hover:bg-neutral-800/80 text-neutral-950 dark:text-white shadow-2xs'
                    : 'border-transparent bg-white dark:bg-neutral-950/70 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 font-normal'
                  }`}
              >
                {/* Top Row: Unread Indicator + ID + Status + Quick Envelope Toggle */}
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Gmail style Unread Dot */}
                    {isUnread ? (
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 ring-2 ring-blue-500/20"
                        title="Unread Incident"
                      ></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-transparent shrink-0"></span>
                    )}

                    <span className={`w-2 h-2 rounded-full ${getPriorityDot(ticket.priority)}`}></span>
                    <span className={`truncate ${isUnread ? 'font-extrabold text-neutral-950 dark:text-white' : 'font-semibold text-neutral-700 dark:text-neutral-400'}`}>
                      {ticket.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-mono font-bold ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>


                  </div>
                </div>

                {/* Subject Line - Bold when unread like Gmail */}
                <h4
                  className={`text-sm line-clamp-1 mb-1 ${isUnread
                    ? 'font-bold text-neutral-950 dark:text-white tracking-tight'
                    : 'font-normal text-neutral-700 dark:text-neutral-300'
                    }`}
                >
                  {ticket.subject}
                </h4>

                {/* Bottom Row - Requester & WhatsApp-style Time */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`truncate max-w-[210px] ${isUnread ? 'font-semibold text-neutral-900 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {(ticket.requester?.name || (typeof ticket.requester === 'string' ? ticket.requester : 'Staff Member'))} • {ticket.category}
                  </span>
                  <span className={`shrink-0 ${isUnread ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    {formatWhatsAppListTimestamp(ticket.updated_at || ticket.created_at || ticket.updatedAt, ticket.created_at)}
                  </span>
                </div>
              </div>
            );
          })}

          {sortedTickets.length === 0 && (
            <div className="p-8 text-center text-sm text-neutral-500 font-mono">
              No incidents match the active search or filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Instant Live Ticket Inspector (Detail) */}
      {activeTicket ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50/40 dark:bg-neutral-950">
          {/* Inspector Header */}
          <div className="px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900/40">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                {activeTicket.id}
              </span>

              {/* Read / Unread Inspector Toggle */}
              <button
                type="button"
                onClick={() => onToggleReadTicket && onToggleReadTicket(activeTicket.id, !activeTicket.isUnread)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors border ${activeTicket.isUnread
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                  : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                title={activeTicket.isUnread ? 'Click to mark as read' : 'Click to mark as unread'}
              >
                {activeTicket.isUnread ? (
                  <>
                    <MailOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Mark as Read</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Mark Unread</span>
                  </>
                )}
              </button>

              {currentUserRole === 'support' && (
                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => onUpdateTicketStatus(activeTicket.id, e.target.value)}
                    className="text-xs font-mono px-2.5 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-500"
                  >
                    <option value="Open">Status: Open</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Waiting on Customer">Status: Waiting</option>
                    <option value="Resolved">Status: Resolved</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">


              {/* Edit Ticket Button */}
              <button
                type="button"
                onClick={() => setEditingTicket(activeTicket)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-mono font-semibold transition-colors border border-neutral-300 dark:border-neutral-700"
                title="Edit incident details"
              >
                <Edit className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Edit</span>
              </button>

              {/* Delete Ticket Button */}
              {currentUserRole === 'support' && (
                <button
                  type="button"
                  onClick={() => setTicketToDelete(activeTicket)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-mono font-semibold transition-colors"
                  title="Delete this incident"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Inspector Content Body: Master Stream + Sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversation Stream */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-neutral-200 dark:border-neutral-800">
              {/* Ticket Headline Banner */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/20 space-y-2">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                  {activeTicket.subject}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  <span>Reported by: <strong className="text-neutral-800 dark:text-neutral-200">{activeTicket.requester?.name || 'Staff Member'}</strong> ({activeTicket.requester?.department || 'General'})</span>
                  <span>•</span>
                  <span>Category: {activeTicket.category}</span>
                  <span>•</span>
                  <span>Assigned: {activeTicket.assignee?.name || 'IT Support Team'}</span>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Initial Description */}
                <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{activeTicket.requester?.name || 'Requester'}</span>
                    <span>Initial Service Request</span>
                  </div>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                    {activeTicket.description}
                  </p>
                </div>

                {/* Evidence & Attachments Section */}
                <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 uppercase">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Evidence & Diagnostic Attachments ({activeTicket.attachments?.length || 0})</span>
                    </span>

                    {/* Quick upload file/photo button */}
                    <label className="cursor-pointer text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Attach Photo / File</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.log,.txt,.json,.zip"
                        onChange={handleUploadToActiveTicket}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {activeTicket.attachments && activeTicket.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeTicket.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {att.isImage ? (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-300 dark:border-neutral-700 block group"
                              >
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              </a>
                            ) : (
                              <div className="w-10 h-10 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                                <File className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-xs font-bold text-neutral-900 dark:text-white truncate block hover:underline"
                              >
                                {att.name}
                              </a>
                              <p className="text-[10px] font-mono text-neutral-500">{att.size}</p>
                            </div>
                          </div>

                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-emerald-600 transition-colors"
                            title="View / Download"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 rounded border border-dashed border-neutral-200 dark:border-neutral-800 text-center text-xs font-mono text-neutral-400">
                      No diagnostic photos or logs attached. Click "Attach Photo / File" above to add evidence.
                    </div>
                  )}
                </div>

                {/* WhatsApp-Style Timeline Messages with Date Dividers */}
                {groupMessagesByDate(activeTicket.timeline || [], activeTicket.created_at).map((group) => (
                  <div key={group.dateKey} className="space-y-3">
                    {/* Centered WhatsApp Sticky Date Divider */}
                    <div className="flex items-center justify-center my-3.5 sticky top-0 z-10 pointer-events-none">
                      <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-neutral-200/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 shadow-2xs backdrop-blur-xs border border-neutral-300/70 dark:border-neutral-700/70 tracking-wide">
                        {group.dateLabel}
                      </span>
                    </div>

                    {/* Messages under this Date */}
                    {group.messages.map((msg) => {
                      if (currentUserRole === 'employee' && msg.isInternal) return null;
                      const isBeingEdited = editingNoteId === msg.id;

                      return (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-lg text-sm space-y-2 ${msg.isInternal
                            ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-amber-950 dark:text-amber-200'
                            : msg.content.includes('✅ RESOLUTION')
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200'
                              : 'bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-2xs'
                            }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              {msg.isInternal && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-neutral-950">
                                  STAFF INTERNAL
                                </span>
                              )}
                              <span className="font-bold text-neutral-900 dark:text-white">{formatMsgAuthor(msg.author)}</span>
                              <span className="text-neutral-500">({msg.role})</span>
                              {msg.edited && (
                                <span className="text-[10px] text-neutral-400 italic font-mono">(edited)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-500 font-mono text-[11px] font-semibold">{msg._formattedTime || msg.time}</span>
                              {currentUserRole === 'support' && !isBeingEdited && (
                                <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(msg.id);
                                      setEditingNoteText(msg.content);
                                    }}
                                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-emerald-600 transition-colors"
                                    title="Edit note"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setNoteToDelete({ ticketId: activeTicket.id, noteId: msg.id })}
                                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-rose-600 transition-colors"
                                    title="Delete note"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {isBeingEdited ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                rows={3}
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                className="w-full text-xs font-sans p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditingNoteText('');
                                  }}
                                  className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono font-medium"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={!editingNoteText.trim()}
                                  onClick={() => {
                                    if (editingNoteText.trim() && onEditReply) {
                                      onEditReply(activeTicket.id, msg.id, editingNoteText.trim());
                                    }
                                    setEditingNoteId(null);
                                    setEditingNoteText('');
                                  }}
                                  className="px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold disabled:opacity-50"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap font-sans text-sm">{msg.content}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Employee Rating prompt if solved */}
                {activeTicket.status === 'Resolved' && currentUserRole === 'employee' && (
                  <div className="p-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-2.5">
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 block">
                      This facility request is marked resolved by our support engineers.
                    </span>
                    {ratingSubmitted ? (
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono flex items-center justify-center gap-1.5 font-bold">
                        <Check className="w-4 h-4" /> Thank you for rating our service!
                      </span>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">
                          How satisfied are you with the resolution time and support provided?
                        </p>
                        <div className="flex items-center justify-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => {
                                setRating(star);
                                setRatingSubmitted(true);
                              }}
                              className="p-1 text-amber-400 hover:scale-125 transition-transform"
                            >
                              <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Reply Composer */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-3">
                {currentUserRole === 'support' ? (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsInternalNote(false)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${!isInternalNote
                            ? 'bg-neutral-900 text-white dark:bg-neutral-800'
                            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                            }`}
                        >
                          Public Reply to Requester
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsInternalNote(true)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${isInternalNote
                            ? 'bg-amber-600 text-white'
                            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                            }`}
                        >
                          Private Staff Note
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReplyText(currentPlaybook.fix)}
                        className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Insert Playbook Fix
                      </button>
                    </div>

                    <form onSubmit={handleSendReply} className="space-y-1.5">
                      <div className="relative flex items-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors p-1.5 pr-2 gap-2 shadow-2xs">
                        <textarea
                          rows={2}
                          placeholder={isInternalNote ? "Write private staff note (Enter to send)..." : "Type reply to requester (Enter to send)..."}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(e);
                            }
                          }}
                          className="flex-1 bg-transparent border-0 p-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none resize-none font-sans min-h-[46px] max-h-32"
                        />

                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className={`px-3 py-2.5 rounded-md flex items-center justify-center gap-1.5 text-xs font-bold transition-all shrink-0 self-end mb-0.5 ${replyText.trim()
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                            }`}
                          title="Press Enter to send (or click here)"
                        >
                          <Send className="w-4 h-4" />
                          <span className="hidden sm:inline">{isInternalNote ? 'Save Note' : 'Send'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono px-1">
                        <span>Press <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px]">Enter ↵</kbd> to send • <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px]">Shift+Enter</kbd> for new line</span>
                      </div>
                    </form>
                  </>
                ) : (
                  <form onSubmit={handleSendReply} className="space-y-1.5">
                    <div className="relative flex items-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors p-1.5 pr-2 gap-2 shadow-2xs">
                      <textarea
                        rows={2}
                        placeholder="Reply to IT engineer (Enter to send)..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply(e);
                          }
                        }}
                        className="flex-1 bg-transparent border-0 p-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none resize-none font-sans min-h-[46px] max-h-32"
                      />

                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className={`px-3 py-2.5 rounded-md flex items-center justify-center gap-1.5 text-xs font-bold transition-all shrink-0 self-end mb-0.5 ${replyText.trim()
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                          }`}
                        title="Press Enter to send (or click here)"
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono px-1">
                      <span>Press <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px]">Enter ↵</kbd> to send • <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px]">Shift+Enter</kbd> for new line</span>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Meta & Diagnostic Sidebar */}
            <div className="w-72 p-4 space-y-5 text-xs font-mono border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto shrink-0 bg-neutral-50/50 dark:bg-neutral-900/10">
              {/* Playbook box */}
              <div className="p-3.5 rounded border border-emerald-200 dark:border-neutral-800 bg-emerald-50/50 dark:bg-neutral-900/60 space-y-2">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">
                  DIAGNOSTIC PLAYBOOK
                </span>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block font-sans">
                  {currentPlaybook.title}
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                  {currentPlaybook.fix}
                </p>
              </div>

              {/* Requester info */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-neutral-500 uppercase block font-bold">Requester</span>
                <div className="text-neutral-900 dark:text-neutral-100 font-sans font-bold text-sm">{activeTicket.requester?.name || 'Staff Member'}</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs">{activeTicket.requester?.email || 'N/A'}</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs">{activeTicket.requester?.department || 'General'}</div>
              </div>

              {/* SLA Status */}
              <div className="space-y-1.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-[11px] text-neutral-500 uppercase block font-bold">SLA Window</span>
                <div className="text-amber-600 dark:text-amber-400 font-bold text-sm">{activeTicket.slaDue}</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs">Target resolution: 4 hours</div>
              </div>

              {/* Mark as Resolved */}
              {currentUserRole === 'support' && activeTicket.status !== 'Resolved' && (
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  {!isResolving ? (
                    <button
                      onClick={() => setIsResolving(true)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <form onSubmit={handleConfirmResolve} className="space-y-2.5">
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-bold font-sans">Resolution Root Cause:</span>
                      <textarea
                        required
                        rows={2}
                        placeholder="Explain fix..."
                        value={resolutionSummary}
                        onChange={(e) => setResolutionSummary(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-900 dark:text-white resize-none font-sans"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsResolving(false)}
                          className="flex-1 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-neutral-500">
          Select an incident to view details
        </div>
      )}

      {/* Edit Ticket Modal */}
      <EditTicketModal
        isOpen={!!editingTicket}
        ticket={editingTicket}
        onClose={() => setEditingTicket(null)}
        onSave={(updatedTicket) => {
          if (onEditTicket) onEditTicket(updatedTicket);
          setEditingTicket(null);
        }}
        teamMembers={teamMembers}
      />

      {/* Confirm Delete Incident Dialog */}
      <ConfirmDialog
        isOpen={!!ticketToDelete}
        title="Delete Incident"
        message={
          ticketToDelete
            ? `Are you sure you want to permanently delete incident "${ticketToDelete.id}: ${ticketToDelete.subject || ticketToDelete.title}"? All conversation messages and attachments for this incident will be removed.`
            : ''
        }
        confirmText="Delete Incident"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (ticketToDelete && onDeleteTicket) {
            onDeleteTicket(ticketToDelete.id);
            if (activeTicket?.id === ticketToDelete.id) {
              const remaining = tickets.filter((t) => t.id !== ticketToDelete.id);
              setSelectedTicketId(remaining[0]?.id || null);
            }
            setTicketToDelete(null);
          }
        }}
        onCancel={() => setTicketToDelete(null)}
      />

      {/* Confirm Delete Note / Response Dialog */}
      <ConfirmDialog
        isOpen={!!noteToDelete}
        title="Delete Incident Note"
        message="Are you sure you want to delete this incident note / response? This cannot be undone."
        confirmText="Delete Note"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (noteToDelete && onDeleteReply) {
            onDeleteReply(noteToDelete.ticketId, noteToDelete.noteId);
          }
          setNoteToDelete(null);
        }}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
}
