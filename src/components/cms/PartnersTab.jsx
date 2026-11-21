import React, { useState, useRef } from 'react';
import {
  Handshake,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  X,
  Upload,
  Image as ImageIcon,
  Building2,
  Globe,
  FileText
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';
import ConfirmDialog from '../common/ConfirmDialog';

export default function PartnersTab({
  partners,
  onAddPartner,
  onUpdatePartner,
  onDeletePartner
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Exactly 4 fields: name, logo, websiteUrl, description
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    websiteUrl: '',
    description: ''
  });

  const filtered = partners.filter((p) => {
    const term = search.toLowerCase();
    const matchesName = (p.name || '').toLowerCase().includes(term);
    const matchesDesc = (p.description || '').toLowerCase().includes(term);
    const matchesUrl = (p.websiteUrl || '').toLowerCase().includes(term);
    return matchesName || matchesDesc || matchesUrl;
  });

  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      logo: '',
      websiteUrl: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      logo: partner.logo || '',
      websiteUrl: partner.websiteUrl || '',
      description: partner.description || ''
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        logo: e.target.result
      }));
    };
    reader.readAsDataURL(file);
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let cleanUrl = (formData.websiteUrl || '').trim();
    if (cleanUrl === 'https://' || cleanUrl === 'http://') {
      cleanUrl = '';
    } else if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const payload = {
      id: editingPartner ? editingPartner.id : `ptr-${Date.now()}`,
      name: formData.name.trim(),
      logo: formData.logo,
      websiteUrl: cleanUrl,
      description: (formData.description || '').trim(),
    };

    if (editingPartner) {
      onUpdatePartner(payload);
    } else {
      onAddPartner(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Search & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <div className="relative flex-1 max-w-xl flex items-center">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search partners by company name or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((partner) => (
          <div
            key={partner.id}
            className="group relative bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200"
          >
            <div className="p-5 space-y-4">
              {/* Partner Logo & Name */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0 p-1">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {partner.name}
                  </h3>
                  {partner.websiteUrl && (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline truncate max-w-full"
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span className="truncate">{partner.websiteUrl.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Base Details / Description */}
              <div className="pt-1">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-3">
                  {partner.description || (
                    <span className="italic text-neutral-400">No base details provided.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Card Footer: Website Link & Actions */}
            <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
              {partner.websiteUrl ? (
                <a
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit Website</span>
                </a>
              ) : (
                <span className="text-neutral-400 italic">No URL</span>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(partner)}
                  className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  title="Edit Partner"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPartnerToDelete(partner)}
                  className="p-1.5 rounded hover:bg-rose-500/20 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Remove Partner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-500 dark:text-neutral-400 font-mono text-sm border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl">
            <Handshake className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            No trusted partners found matching your search.
          </div>
        )}
      </div>

      {/* Windows Alert Modal for Add / Edit Partner (Only 4 Fields) */}
      {isModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden transition-transform duration-100 ${isAlerting ? 'animate-windows-shake ring-4 ring-rose-500/40' : ''
              }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-neutral-900 dark:text-white uppercase tracking-wider">
                  {editingPartner ? 'Edit Trusted Partner' : 'Add Trusted Partner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form: Exactly 4 Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Field 1: Company Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1.5">
                  1. Company Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Cisco Systems, Microsoft Cloud Solutions"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Field 2: Logo Upload Option */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1.5">
                  2. Company Logo (Upload or URL)
                </label>

                {/* Upload / Preview Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${isDragging
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950/60'
                    }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {formData.logo ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={formData.logo}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Logo attached
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 text-xs bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded font-mono transition-colors"
                          >
                            Change Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, logo: '' }))}
                            className="px-2.5 py-1 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded font-mono transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer text-center py-2"
                    >
                      <Upload className="w-6 h-6 mx-auto mb-1.5 text-neutral-400 hover:text-emerald-500 transition-colors" />
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Click to browse or drag & drop logo
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        PNG, JPG, SVG, WebP up to 5MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct URL input fallback */}
                <div className="mt-2">
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400 pointer-events-none" />
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500 placeholder-neutral-400"
                    />
                  </div>
                </div>
              </div>

              {/* Field 3: Website URL (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                    3. Official Website URL
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono font-normal lowercase">(optional)</span>
                </div>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://company.com (optional)"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500 placeholder-neutral-400"
                  />
                </div>
              </div>

              {/* Field 4: Description / Partnership Scope (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                    4. Description / Alliance Details
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono font-normal lowercase">(optional)</span>
                </div>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of partnership scope, joint ventures, or technology alliance..."
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500 placeholder-neutral-400 resize-none font-sans"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded text-xs font-mono font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-colors shadow-xs"
                >
                  {editingPartner ? 'Save Changes' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Dialog for Delete Partner */}
      <ConfirmDialog
        isOpen={!!partnerToDelete}
        title="Delete Trusted Partner"
        message={
          partnerToDelete
            ? `Are you sure you want to remove "${partnerToDelete.name}" from trusted partners? This will remove their listing from public corporate channels.`
            : ''
        }
        confirmText="Delete Partner"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (partnerToDelete) {
            onDeletePartner(partnerToDelete.id);
            setPartnerToDelete(null);
          }
        }}
        onCancel={() => setPartnerToDelete(null)}
      />
    </div>
  );
}
