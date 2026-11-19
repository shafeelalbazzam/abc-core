import React, { useState, useRef } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  Layers,
  X,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Filter,
  Sparkles
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ServicesTab({
  services,
  onAddService,
  onUpdateService,
  onDeleteService
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Categories aligned with albazzam-website.vercel.app
  const categories = [
    'All',
    'Core',
    'Engineering',
    'Operations',
    'Refurbishment',
    'Security',
    'Manufacturing'
  ];

  const [formData, setFormData] = useState({
    title: '',
    category: 'Engineering',
    badge: 'Asset Engineering',
    tagline: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80',
    features: '',
    status: 'Active'
  });

  const filtered = services.filter((s) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (s.title || '').toLowerCase().includes(term) ||
      (s.description || '').toLowerCase().includes(term) ||
      (s.category || '').toLowerCase().includes(term) ||
      (s.badge || '').toLowerCase().includes(term);
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      title: '',
      category: 'Engineering',
      badge: 'Asset Engineering',
      tagline: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80',
      features: 'Comprehensive HVAC & Chiller Plant Management\nElectrical High & Low Voltage Infrastructure (HT/LT)\nBuilding Automation, BMS & Control Panel Servicing\nPlumbing, Drainage & Water Supply Distribution',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      category: service.category || 'Engineering',
      badge: service.badge || 'Asset Engineering',
      tagline: service.tagline || '',
      description: service.description || '',
      image: service.image || '',
      features: Array.isArray(service.features)
        ? service.features.join('\n')
        : (service.features || ''),
      status: service.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        image: e.target.result
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
    if (file) processImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const featureList = formData.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const servicePayload = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      badge: formData.badge.trim(),
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      image: formData.image,
      features: featureList,
      status: formData.status,
      lastUpdated: 'Just now'
    };

    if (editingService) {
      onUpdateService(servicePayload);
    } else {
      onAddService(servicePayload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <div className="relative flex-1 max-w-xl flex items-center">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search services by title, category, badge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-52 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
          {/* Category Filter Button inside Search Bar */}
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                  {cat === 'All' ? 'All Services' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-xs group"
          >
            {/* Service Cover Image */}
            <div className="h-44 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white border border-white/20">
                  {service.category}
                </span>
                {service.badge && (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-600/90 backdrop-blur-xs text-white">
                    {service.badge}
                  </span>
                )}
              </div>

              <span
                className={`absolute top-2.5 right-2.5 text-xs font-mono font-bold px-2 py-0.5 rounded border shadow-xs ${service.status === 'Active'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-neutral-900/80 text-neutral-300 border-neutral-700'
                  }`}
              >
                ● {service.status || 'Active'}
              </span>
            </div>

            {/* Service Content */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-2">
                  {service.title}
                </h4>

                {service.tagline && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans line-clamp-1">
                    {service.tagline}
                  </p>
                )}

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans line-clamp-3">
                  {service.description}
                </p>

                {/* Features Checklist */}
                {Array.isArray(service.features) && service.features.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-neutral-200/80 dark:border-neutral-800/80">
                    {service.features.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <p className="text-[11px] font-mono text-neutral-400">
                        +{service.features.length - 3} more deliverables
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500 dark:text-neutral-400">Updated: {service.lastUpdated}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className="p-1.5 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Edit Service"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setServiceToDelete(service)}
                    className="p-1.5 rounded text-neutral-400 hover:text-rose-600 transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-sm text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 font-mono">
          No services match your search criteria.
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-neutral-950 w-full max-w-xl max-h-[88vh] rounded-lg shadow-2xl border transition-all duration-150 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-200 ${isAlerting
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

            <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{editingService ? 'Edit Corporate Service' : 'Add New Corporate Service'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm overflow-y-auto">
              {/* Service Title */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Hard Services, Soft Services, MEP Contracting"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 font-semibold focus:outline-none focus:border-neutral-700"
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-neutral-700"
                  >
                    <option value="Core">Core (Integrated FM)</option>
                    <option value="Engineering">Engineering (Hard, MEP, Elevators)</option>
                    <option value="Operations">Operations (Soft Services)</option>
                    <option value="Refurbishment">Refurbishment (Civil Works)</option>
                    <option value="Security">Security (Automated Doors & Gates)</option>
                    <option value="Manufacturing">Manufacturing (Aluminium & Glass)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Asset Engineering, Specialized Care"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                  High-Impact Summary / Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Full engineering asset care delivered by certified technicians..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                  Detailed Service Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive service description for client proposals and public website..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 leading-relaxed text-xs"
                />
              </div>

              {/* Image Upload Option */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1.5 font-bold">
                  Service Cover Image (Upload or URL)
                </label>

                {/* Dropzone Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${isDragging
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60'
                    }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {formData.image ? (
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={formData.image}
                          alt="Service Preview"
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Image attached</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 text-xs bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded font-mono font-bold transition-colors"
                          >
                            Change Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                            className="px-2.5 py-1 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded font-mono font-bold transition-colors"
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
                        Click to upload service photo or drag & drop
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        High-resolution PNG, JPG, WebP
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct Image URL input */}
                <div className="mt-2">
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400 pointer-events-none" />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500 placeholder-neutral-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Key Deliverables / Features */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                  Key Scope Deliverables (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Comprehensive HVAC & Chiller Plant Management&#10;Electrical High & Low Voltage Infrastructure (HT/LT)&#10;Building Automation, BMS & Control Panel Servicing"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 font-mono text-xs focus:outline-none focus:border-neutral-700"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-bold">
                  Publication Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 text-xs focus:outline-none focus:border-neutral-700"
                >
                  <option value="Active">Active (Published on live site)</option>
                  <option value="Draft">Draft (Hidden)</option>
                </select>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold border border-neutral-300 dark:border-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors shadow-xs"
                >
                  {editingService ? 'Save Changes' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete Service */}
      <ConfirmDialog
        isOpen={!!serviceToDelete}
        title="Delete Service & Solution"
        message={
          serviceToDelete
            ? `Are you sure you want to delete "${serviceToDelete.title}"? This will unpublish the service from the public IT solutions catalog.`
            : ''
        }
        confirmText="Delete Service"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (serviceToDelete) {
            onDeleteService(serviceToDelete.id);
            setServiceToDelete(null);
          }
        }}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
}
