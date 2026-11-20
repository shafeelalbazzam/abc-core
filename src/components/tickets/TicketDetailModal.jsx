import React, { useState } from 'react';
import {
  X,
  Send,
  Lock,
  MessageSquare,
  Clock,
  User,
  Shield,
  Tag,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CornerDownRight,
  ExternalLink,
  Sparkles,
  BookOpen,
  Check,
  Star,
  UploadCloud,
  File,
  Edit,
  Trash2
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';
import { groupMessagesByDate } from '../../utils/dateGrouping';
import EditTicketModal from './EditTicketModal';
import ConfirmDialog from '../common/ConfirmDialog';

export default function TicketDetailModal({
  ticket,
  currentUser,
  onClose,
  onAddReply,
  onEditReply,
  onDeleteReply,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateAssignee,
  onEditTicket,
  onDeleteTicket,
  teamMembers,
  currentUserRole = 'support', // 'support' | 'employee'
  onAddAttachment
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rating, setRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Edit and Delete Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit and Delete Individual Note / Message State
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Filter ONLY IT Department staff members for assignment
  const itStaffMembers = teamMembers.filter((m) => {
    const dept = (m.department || '').toLowerCase().trim();
    const role = (m.role || '').toLowerCase().trim();
    return (
      dept === 'it' ||
      dept === 'it department' ||
      dept.includes('it') ||
      role.includes('it') ||
      role.includes('support') ||
      role.includes('software') ||
      role.includes('engineer') ||
      role.includes('admin') ||
      role.includes('developer')
    );
  });

  if (!ticket) return null;

  const handleUploadToTicket = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !ticket) return;

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
          onAddAttachment(ticket.id, newAtt);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const getDynamicAuthor = () => {
    if (currentUser?.name) {
      if (currentUserRole === 'support') {
        const deptOrRole = currentUser.department || currentUser.role || 'IT Support';
        return `${currentUser.name} (${deptOrRole})`;
      }
      return currentUser.name;
    }
    return currentUserRole === 'support' ? 'IT Support Specialist' : (ticket.requester?.name || 'Requester');
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

  const handleSend = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!replyText.trim()) return;

    onAddReply(ticket.id, {
      content: replyText.trim(),
      isInternal: currentUserRole === 'support' ? isInternalNote : false,
      author: getDynamicAuthor(),
      role: getDynamicRole(),
      time: 'Just now'
    });

    setReplyText('');
  };

  const handleCannedResponse = (text) => {
    setReplyText((prev) => (prev ? prev + '\n' + text : text));
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    const finalNote = resolutionSummary.trim() || 'Issue investigated and resolved. System verified functional.';

    onAddReply(ticket.id, {
      content: `✅ RESOLUTION DETAILS:\n${finalNote}`,
      isInternal: false,
      author: getDynamicAuthor(),
      role: getDynamicRole(),
      time: 'Just now'
    });

    onUpdateStatus(ticket.id, 'Resolved');
    setIsResolving(false);
  };

  const getPlaybookAdvice = (category) => {
    switch (category) {
      case 'Network & VPN':
        return {
          title: 'VPN / Gateway Saturation Playbook',
          text: 'Common root cause: APAC Cluster AP-02 memory overflow or home DNS cache timeouts. Run `ipconfig /flushdns` on client machine or re-route gateway tunnel to secondary node.',
          quickFix: 'We identified high memory saturation on gateway cluster AP-02. We cleared the routing table and re-routed your connection through the secondary gateway. Please reconnect now.'
        };
      case 'Website CMS Bug':
        return {
          title: 'CMS Upload & Payload Playbook',
          text: 'Error 413 indicates client_max_body_size limit in Nginx reverse proxy. Verify image WebP compression is below 8 MB.',
          quickFix: 'The image exceeded the 5 MB direct proxy buffer. We have increased the CDN edge buffer to 15 MB. Please retry uploading your asset.'
        };
      case 'Software & Licenses':
        return {
          title: 'License Provisioning Playbook',
          text: 'Check Adobe Admin Console or Okta SSO group membership. Verify manager email approval in ticket attachments.',
          quickFix: 'Adobe Creative Cloud enterprise seat has been provisioned to your corporate email. Please sign out and sign back in to activate your apps.'
        };
      default:
        return {
          title: 'Standard Diagnostics Playbook',
          text: 'Confirm device OS version, employee workstation ID, and verify if user has rebooted since password/permission sync.',
          quickFix: 'We verified the system logs and updated your account profile permissions. Please reboot your workstation once to apply changes.'
        };
    }
  };

  const playbook = getPlaybookAdvice(ticket.category);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-neutral-950 w-full max-w-5xl h-[88vh] rounded-lg shadow-2xl border transition-all duration-150 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-200 ${isAlerting
          ? 'animate-windows-shake border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/30'
          : 'border-neutral-200 dark:border-neutral-800'
          }`}
      >
        {/* Windows Dialog Attention Warning when clicking outside */}
        {isAlerting && (
          <div className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Active Dialog: Please click Close (✕) to dismiss this ticket window.</span>
          </div>
        )}

        {/* Top Header */}
        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800/60">
              {ticket.id}
            </span>

            {currentUserRole === 'support' && (
              <div className="flex items-center gap-2">
                <select
                  value={ticket.status}
                  onChange={(e) => onUpdateStatus(ticket.id, e.target.value)}
                  className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-semibold rounded text-neutral-800 dark:text-neutral-200 focus:outline-none"
                >
                  <option value="Open">Status: Open</option>
                  <option value="In Progress">Status: In Progress</option>
                  <option value="Waiting on Customer">Status: Waiting on Customer</option>
                  <option value="Resolved">Status: Resolved</option>
                  <option value="Closed">Status: Closed</option>
                </select>

                <select
                  value={ticket.priority}
                  onChange={(e) => onUpdatePriority(ticket.id, e.target.value)}
                  className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-semibold rounded text-neutral-800 dark:text-neutral-200 focus:outline-none"
                >
                  <option value="Low">Priority: Low</option>
                  <option value="Medium">Priority: Medium</option>
                  <option value="High">Priority: High</option>
                  <option value="Urgent">Priority: Urgent</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-mono font-semibold transition-colors border border-neutral-300 dark:border-neutral-700"
              title="Edit incident details"
            >
              <Edit className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Edit</span>
            </button>

            {currentUserRole === 'support' && (
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-mono font-semibold transition-colors"
                title="Delete this incident"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-1"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Split: Ticket Conversation + Sidebar Details */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Left Pane: Ticket History & Conversation */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50/50 dark:bg-neutral-950">
            {/* Ticket Subject & Header */}
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{ticket.category}</span>
                <span>•</span>
                <span>Raised {ticket.createdAt}</span>
                <span>•</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">SLA: {ticket.slaDue}</span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                {ticket.subject}
              </h2>
            </div>

            {/* Conversation Flow */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Original Description */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{ticket.requester?.name || 'Requester'} (Requester)</span>
                  <span>{ticket.createdAt}</span>
                </div>
                <p className="text-sm text-neutral-800 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {/* Attachments & Evidence Section */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 uppercase">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Evidence & Attachments ({ticket.attachments?.length || 0})</span>
                  </span>

                  <label className="cursor-pointer text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Attach Photo / File</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.log,.txt,.json,.zip"
                      onChange={handleUploadToTicket}
                      className="hidden"
                    />
                  </label>
                </div>

                {ticket.attachments && ticket.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ticket.attachments.map((att) => (
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
                    No attachments uploaded. Click "Attach Photo / File" to add screenshots or logs.
                  </div>
                )}
              </div>

              {/* Message Timeline with WhatsApp-style Date Bucketing */}
              {groupMessagesByDate(ticket.replies || ticket.timeline || [], ticket.created_at || ticket.createdAt).map((group) => (
                <div key={group.dateKey} className="space-y-3">
                  {/* WhatsApp Centered Date Divider */}
                  <div className="flex items-center justify-center my-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wide bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-2xs border border-neutral-300/60 dark:border-neutral-700/60">
                      {group.dateLabel}
                    </span>
                  </div>

                  {/* Messages in this date group */}
                  {group.messages.map((reply) => {
                    const isBeingEdited = editingNoteId === reply.id;

                    return (
                      <div
                        key={reply.id}
                        className={`p-4 rounded-lg border space-y-1.5 ${reply.isInternal
                          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-950 dark:text-amber-200'
                          : reply.author?.includes('Support')
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
                            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-2xs'
                          }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
                            {reply.isInternal && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                            {formatMsgAuthor(reply.author)}
                            <span className="text-neutral-500 font-normal">({reply.role})</span>
                            {reply.edited && (
                              <span className="text-[10px] text-neutral-400 italic font-normal">(edited)</span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500">{reply.formattedTime || reply.time}</span>
                            {currentUserRole === 'support' && !isBeingEdited && (
                              <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNoteId(reply.id);
                                    setEditingNoteText(reply.content);
                                  }}
                                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-emerald-600 transition-colors"
                                  title="Edit note"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNoteToDelete({ ticketId: ticket.id, noteId: reply.id })}
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
                                    onEditReply(ticket.id, reply.id, editingNoteText.trim());
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
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Bottom Reply Composer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
              <form onSubmit={handleSend} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Add Response
                  </span>

                  {currentUserRole === 'support' && (
                    <label className="flex items-center gap-2 text-xs font-mono cursor-pointer text-amber-600 dark:text-amber-400">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Internal staff note only</span>
                    </label>
                  )}
                </div>

                <div className="relative flex items-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors p-1.5 pr-2 gap-2 shadow-2xs">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Type response here (Enter to send)..."
                    className="flex-1 bg-transparent border-0 p-2 text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none font-sans min-h-[46px] max-h-32"
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

                  {currentUserRole === 'support' && (
                    <button
                      type="button"
                      onClick={() => handleCannedResponse(playbook.quickFix)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-semibold"
                    >
                      + Insert Playbook Fix
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Ticket Metadata & Knowledge Playbook */}
          <div className="w-full lg:w-80 p-5 bg-neutral-100/60 dark:bg-neutral-900/30 overflow-y-auto space-y-5 shrink-0 border-l border-neutral-200 dark:border-neutral-800">
            {/* Requester Info Card */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-white dark:bg-neutral-950 space-y-2.5 shadow-2xs">
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 block">
                Requester Profile
              </span>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {ticket.requester?.name || 'Staff Member'}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 font-mono space-y-1">
                <div>Email: {ticket.requester?.email || 'N/A'}</div>
                <div>Department: {ticket.requester?.department || 'General'}</div>
                <div>Asset ID: {ticket.requester?.device || 'Assigned Workstation'}</div>
              </div>
            </div>

            {/* Playbook Advisor */}
            <div className="border border-emerald-200 dark:border-neutral-800 rounded-lg p-4 bg-emerald-50/50 dark:bg-neutral-950 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>{playbook.title}</span>
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {playbook.text}
              </p>
            </div>

            {/* Assignee Control (IT Department Personnel Only) */}
            {currentUserRole === 'support' && (
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-white dark:bg-neutral-950 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 block">
                    Assigned Engineer
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                    IT Dept Only
                  </span>
                </div>
                <select
                  value={ticket.assignee?.name || ticket.assignee?.id || ''}
                  onChange={(e) => onUpdateAssignee(ticket.id, e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none"
                >
                  <option value="">Unassigned (IT Support Pool)</option>
                  {itStaffMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role || 'IT Support'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Ticket Modal */}
      <EditTicketModal
        isOpen={isEditing}
        ticket={ticket}
        onClose={() => setIsEditing(false)}
        onSave={(updatedTicket) => {
          if (onEditTicket) onEditTicket(updatedTicket);
          setIsEditing(false);
        }}
        teamMembers={teamMembers}
      />

      {/* Confirm Delete Incident Dialog */}
      <ConfirmDialog
        isOpen={isDeleting}
        title="Delete Incident"
        message={`Are you sure you want to permanently delete incident "${ticket.id}: ${ticket.subject || ticket.title}"? All conversation messages and attachments will be deleted.`}
        confirmText="Delete Incident"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (onDeleteTicket) {
            onDeleteTicket(ticket.id);
            setIsDeleting(false);
            onClose();
          }
        }}
        onCancel={() => setIsDeleting(false)}
      />

      {/* Confirm Delete Note / Response Dialog */}
      <ConfirmDialog
        isOpen={!!noteToDelete}
        title="Delete Incident Note"
        message="Are you sure you want to delete this incident note / response? This action cannot be undone."
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
