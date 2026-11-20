import React, { useState, useEffect } from 'react';
import {
  X,
  Edit,
  Save,
  AlertTriangle,
  User,
  Shield,
  Clock,
  Building2,
  FolderTree,
  AlertCircle
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';

export default function EditTicketModal({
  isOpen,
  ticket,
  onClose,
  onSave,
  teamMembers = []
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    department: 'IT Department',
    category: 'Software',
    priority: 'Medium',
    status: 'Open',
    assigneeName: '',
    requesterName: '',
    requesterEmail: ''
  });

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

  useEffect(() => {
    if (ticket && isOpen) {
      const requester = ticket.requester || {};
      const reqName = typeof requester === 'object' ? requester.name || '' : (typeof requester === 'string' ? requester : '');
      const reqEmail = typeof requester === 'object' ? requester.email || '' : '';

      setFormData({
        subject: ticket.subject || ticket.title || '',
        description: ticket.description || '',
        department: ticket.department || requester.department || 'IT Department',
        category: ticket.category || 'Software',
        priority: ticket.priority || 'Medium',
        status: ticket.status || 'Open',
        assigneeName: ticket.assignee?.name || ticket.assigned_to || '',
        requesterName: reqName,
        requesterEmail: reqEmail
      });
    }
  }, [ticket, isOpen]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) return;

    const matchedAssignee = teamMembers.find((m) => m.name === formData.assigneeName);

    const updatedTicket = {
      ...ticket,
      title: formData.subject.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      department: formData.department,
      category: formData.category,
      priority: formData.priority,
      status: formData.status,
      assigned_to: formData.assigneeName,
      assignee: formData.assigneeName
        ? {
          name: formData.assigneeName,
          email: matchedAssignee?.email || '',
          avatar: matchedAssignee?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces'
        }
        : { name: 'IT Support Team', email: 'support@albazzam.com', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces' },
      requester: {
        ...(typeof ticket.requester === 'object' ? ticket.requester : {}),
        name: formData.requesterName.trim() || ticket.requester?.name || 'Staff Member',
        email: formData.requesterEmail.trim() || ticket.requester?.email || '',
        department: formData.department
      },
      slaDue:
        formData.priority === 'Urgent'
          ? 'in 1 hour'
          : formData.priority === 'High'
            ? 'in 2 hours'
            : formData.priority === 'Medium'
              ? 'in 4 hours'
              : 'in 24 hours'
    };

    onSave(updatedTicket);
    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-neutral-950 w-full max-w-2xl rounded-lg shadow-2xl border transition-all duration-150 overflow-hidden text-neutral-900 dark:text-neutral-200 ${isAlerting
          ? 'animate-windows-shake border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/30'
          : 'border-neutral-200 dark:border-neutral-800'
          }`}
      >
        {isAlerting && (
          <div className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Active Dialog: Please click Close (✕) or Cancel to dismiss.</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Edit Incident Details</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {ticket.id}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Update classification, priority, assigned engineer, and status.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
          {/* Incident Subject / Title */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
              Incident Summary / Title *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Server response latency on cluster AP-02"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 font-medium"
            />
          </div>

          {/* Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Department *</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
              >
                <option value="IT Department">IT Department</option>
                <option value="Facilities Management">Facilities Management</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Category *</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
              >
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Network">Network</option>
                <option value="Mail">Mail</option>
                <option value="Facilities Management">Facilities Management</option>
                <option value="Access & Permissions">Access & Permissions</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Priority *</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
              >
                <option value="Low">Low — Routine enquiry (24h SLA)</option>
                <option value="Medium">Medium — Standard request (4h SLA)</option>
                <option value="High">High — Operations affected (2h SLA)</option>
                <option value="Urgent">Urgent — Critical production down (1h SLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Status *</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting on Customer">Waiting on Customer</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Assignee (IT Department Personnel Only) */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Assigned Engineer / Staff (IT Department)</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                IT Dept Only
              </span>
            </label>
            <select
              value={formData.assigneeName}
              onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
            >
              <option value="">Unassigned (IT Support Pool)</option>
              {itStaffMembers.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name} — {member.role || 'Staff'} ({member.department || 'IT Department'})
                </option>
              ))}
            </select>
          </div>

          {/* Requester Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded border border-neutral-200 dark:border-neutral-800">
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-semibold flex items-center gap-1">
                <User className="w-3 h-3 text-neutral-400" />
                <span>Requester Name</span>
              </label>
              <input
                type="text"
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                placeholder="Requester Full Name"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-900 dark:text-neutral-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">
                Requester Email
              </label>
              <input
                type="email"
                value={formData.requesterEmail}
                onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                placeholder="requester@albazzam.com"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-900 dark:text-neutral-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
              Incident Description & Diagnosis Notes
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the problem, error logs, or symptoms..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 font-sans text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold border border-neutral-300 dark:border-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
