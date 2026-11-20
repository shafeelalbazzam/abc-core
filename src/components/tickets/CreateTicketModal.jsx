import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  AlertCircle,
  FileText,
  Send,
  User,
  AlertTriangle,
  UploadCloud,
  Image as ImageIcon,
  File,
  Trash2,
  Paperclip,
  CheckCircle2,
  Link as LinkIcon,
  Shield
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';

export default function CreateTicketModal({ isOpen, onClose, onCreateTicket, currentUser, teamMembers = [] }) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    subject: '',
    requesterName: '',
    requesterEmail: '',
    department: 'IT',
    category: 'Software',
    priority: 'Medium',
    assigneeName: '',
    description: '',
    attachments: []
  });

  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Check if current user is IT department / admin or regular employee
  const isITDept =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'it_support' ||
    (currentUser?.department && (
      currentUser.department.toLowerCase().trim() === 'it' ||
      currentUser.department.toLowerCase().trim() === 'it department' ||
      currentUser.department.toLowerCase().includes('it')
    )) ||
    (currentUser?.role && (
      currentUser.role.toLowerCase().includes('it') ||
      currentUser.role.toLowerCase().includes('software') ||
      currentUser.role.toLowerCase().includes('support') ||
      currentUser.role.toLowerCase().includes('engineer') ||
      currentUser.role.toLowerCase().includes('admin')
    ));
  const isReadOnlyEmployee = currentUser?.role === 'employee' && !isITDept;

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
    if (isOpen) {
      setFormData({
        subject: '',
        requesterName: currentUser?.name || '',
        requesterEmail: currentUser?.email || '',
        department: currentUser?.department || 'IT',
        category: 'Software',
        priority: 'Medium',
        description: '',
        attachments: []
      });
      setUrlInput('');
      setShowUrlInput(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (e) => {
        const newAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'application/octet-stream',
          isImage: isImg,
          url: e.target.result,
          uploadedAt: 'Just now'
        };

        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment]
        }));
      };

      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        // For non-images, just read data or set generic
        reader.readAsDataURL(file);
      }
    });
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newAttachment = {
      id: `att-${Date.now()}`,
      name: urlInput.split('/').pop() || 'Remote Asset',
      size: 'Remote URL',
      type: 'image/jpeg',
      isImage: true,
      url: urlInput,
      uploadedAt: 'Just now'
    };

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment]
    }));

    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveAttachment = (id) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id)
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.requesterName.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    onCreateTicket({
      ...formData,
      tags: [formData.category.replace(/\s+/g, ''), formData.department],
    });

    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-neutral-950 w-full max-w-2xl rounded-lg shadow-2xl border transition-all duration-150 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-200 ${isAlerting
          ? 'animate-windows-shake border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/30'
          : 'border-neutral-200 dark:border-neutral-800'
          }`}
      >
        {/* Windows Dialog Attention Warning when clicking outside */}
        {isAlerting && (
          <div className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Active Dialog: Please click Close (✕), Cancel, or Submit to respond.</span>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Raise New IT Support Incident
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Log employee ticket with diagnostic logs, screenshots, and SLA tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm overflow-y-auto max-h-[75vh]">
          {/* Requester Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                Requester Name *
              </label>
              <input
                type="text"
                required
                readOnly={isReadOnlyEmployee}
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                placeholder="e.g. Fatima Al Shamsi"
                className={`w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 ${isReadOnlyEmployee ? 'cursor-not-allowed opacity-80 bg-neutral-100 dark:bg-neutral-800/60' : ''
                  }`}
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                Corporate Email *
              </label>
              <input
                type="email"
                required
                readOnly={isReadOnlyEmployee}
                value={formData.requesterEmail}
                onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                placeholder="fatima@albazzam.com"
                className={`w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 ${isReadOnlyEmployee ? 'cursor-not-allowed opacity-80 bg-neutral-100 dark:bg-neutral-800/60' : ''
                  }`}
              />
              {isReadOnlyEmployee && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
                  ✓ Verified employee account ({currentUser.email})
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700"
              >
                <option value="IT">IT</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="HR">HR</option>
                <option value="Facility Management">Facility Management</option>
              </select>
            </div>
          </div>

          {/* Ticket Subject */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">
              Incident Summary / Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Outlook authentication loop on exchange server"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 font-medium"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700"
              >

                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Mail">Mail</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                Priority / Urgency
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700"
              >
                <option value="Low">Low — Routine enquiry</option>
                <option value="Medium">Medium — Standard staff request</option>
                <option value="High">High — Operations affected</option>
                <option value="Urgent">Urgent — Critical production system downtime</option>
              </select>
            </div>
          </div>

          {/* Assign Engineer / Staff (IT Department Only) */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Assign Engineer / Staff (IT Department)</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                IT Dept Only
              </span>
            </label>
            <select
              value={formData.assigneeName || ''}
              onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
            >
              <option value="">Unassigned (IT Support Pool)</option>
              {itStaffMembers.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name} — {member.role || 'IT Support'} ({member.department || 'IT Department'})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide exact error codes, stack traces, URL endpoints, or steps to reproduce..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 leading-relaxed font-sans"
            />
          </div>

          {/* FILE / PHOTO ATTACHMENT SECTION */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Upload Files, Screenshots & Photos ({formData.attachments.length})</span>
              </label>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'Hide URL' : 'Add image URL'}</span>
              </button>
            </div>

            {/* Quick URL Adder */}
            {showUrlInput && (
              <div className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-800 text-xs">
                <input
                  type="url"
                  placeholder="Paste direct screenshot or image URL (https://...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.log,.txt,.csv,.json,.zip"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-lg border-2 border-dashed cursor-pointer text-center transition-colors ${isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-neutral-300 dark:border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
            >
              <UploadCloud className="w-7 h-7 mx-auto text-neutral-400 dark:text-neutral-500 mb-1.5" />
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Click to browse files or drag & drop screenshots / logs here
              </div>
              <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
                PNG, JPG, WebP, PDF, LOG, JSON up to 25 MB
              </div>
            </div>

            {/* Attachment Preview Chips */}
            {formData.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {formData.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {att.isImage ? (
                        <div className="w-9 h-9 rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-300 dark:border-neutral-700">
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                          <File className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {att.name}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-500">{att.size}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAttachment(att.id);
                      }}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-rose-500 transition-colors"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold border border-neutral-300 dark:border-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Ticket to Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
