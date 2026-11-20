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
  Sparkles,
  ChevronDown,
  ChevronUp,
  Images,
  Eye,
  ArrowRight,
  Building2,
  Zap,
  Paintbrush,
  ShieldCheck,
  DoorClosed,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';
import ConfirmDialog from '../common/ConfirmDialog';

// ============================================================================
// PREDEFINED SERVICES TAXONOMY WITH MANDATORY SUBCATEGORIES
// ============================================================================
export const SERVICE_TAXONOMY = {
  'Integrated Facilities Management': {
    category: 'Core',
    badge: 'Integrated FM',
    defaultTagline: 'Total corporate facility management and real estate asset preservation.',
    defaultDescription: 'Unified operations, maintenance, energy management, and occupant experience solutions tailored for premium commercial and residential complexes.',
    defaultSubcategories: [
      // {
      //   id: 'sub-ifm-1',
      //   name: 'Hard FM & Infrastructure Operations',
      //   description: 'Preventive and corrective maintenance for core MEP and building physical assets.',
      //   images: []
      // },
      // {
      //   id: 'sub-ifm-2',
      //   name: 'Soft FM & Hospitality Stewardship',
      //   description: 'Specialized deep cleaning, pest management, waste segregation, and reception services.',
      //   images: []
      // },
      // {
      //   id: 'sub-ifm-3',
      //   name: 'Energy & Sustainability Auditing',
      //   description: 'Smart energy monitoring, asset reliability engineering, and sustainability management.',
      //   images: []
      // }
    ]
  },
  'MEP Contracting': {
    category: 'Engineering',
    badge: 'MEP Contracting',
    defaultTagline: 'Complete mechanical, electrical, and plumbing engineering contracting.',
    defaultDescription: 'Certified electro-mechanical engineering solutions covering turnkey installations, commercial retrofits, and 24/7 technical operations across the UAE.',
    defaultSubcategories: [
      {
        id: 'sub-mep-1',
        name: 'Mechanical & HVAC Services',
        description: 'Chillers, central air handling units (AHU), FCUs, ductwork design, and climate control automation.',
        images: []
      },
      {
        id: 'sub-mep-2',
        name: 'Electrical Contracting & Panels',
        description: 'High, medium, and low voltage switchgear, transformer stations, backup generators, and distribution boards.',
        images: []
      },
      {
        id: 'sub-mep-3',
        name: 'Preventative Plumbing Networks',
        description: 'Industrial pumping stations, potable water pipework, sewage networks, and specialized water treatment.',
        images: []
      }
    ]
  },
  'Civil Works & Refurbishment': {
    category: 'Refurbishment',
    badge: 'Civil Contracting',
    defaultTagline: 'Turnkey structural renovation, architectural revamps, and surface protection.',
    defaultDescription: 'Full-spectrum civil construction, structural refurbishments, interior fit-outs, and durable waterproof envelope installations.',
    defaultSubcategories: [
      {
        id: 'sub-civil-1',
        name: 'Ceramic & Marble Tiling',
        description: 'Laser-leveled porcelain, Italian marble installation, high-traffic terrazzo, and diamond polishing.',
        images: []
      },
      {
        id: 'sub-civil-2',
        name: 'Internal & External Painting',
        description: 'Anti-carbonation protective coatings, weather-resistant facade paints, and decorative wall finishes.',
        images: []
      },
      {
        id: 'sub-civil-3',
        name: 'False Ceilings & Decorative Gypsum',
        description: 'Fire-rated acoustic tile systems, gypsum board bulkheads, ornate cornices, and indirect LED coves.',
        images: []
      },
      {
        id: 'sub-civil-4',
        name: 'Waterproofing Membrane & Coating',
        description: 'Torch-applied bitumen membranes, polyurethane elastomeric coatings, wet-area tanking, and leak injection.',
        images: []
      }
    ]
  },
  'Elevator & Escalator Maintenance': {
    category: 'Engineering',
    badge: 'Vertical Transport',
    defaultTagline: 'Certified elevator maintenance, modernization, and emergency rescue.',
    defaultDescription: 'Comprehensive lifecycle care for vertical transportation systems, ensuring 99.8% uptime, safety compliance, and passenger comfort.',
    defaultSubcategories: [
      {
        id: 'sub-elev-1',
        name: 'Extensive UAE Spare Parts Inventory',
        description: 'Direct access to OEM control boards, traction drives, safety gears, door operators, and wire ropes in stock.',
        images: []
      },
      {
        id: 'sub-elev-2',
        name: '24/7 Rapid Emergency Response',
        description: 'Sub-30-minute passenger entrapment response units stationed across UAE metropolitan sectors.',
        images: []
      },
      {
        id: 'sub-elev-3',
        name: 'Preventative Safety Audits',
        description: 'Third-party Civil Defense certification testing, full load governor safety trips, and brake inspection.',
        images: []
      },
      {
        id: 'sub-elev-4',
        name: 'Modernization & Retrofits',
        description: 'Regenerative VVVF drive retrofits, aesthetic cabin overhauls, smart destination dispatch, and controller upgrades.',
        images: []
      }
    ]
  },
  'Automated Security Systems': {
    category: 'Security',
    badge: 'Access Automation',
    defaultTagline: 'Smart entry automation, industrial shutters, and motorized barrier gates.',
    defaultDescription: 'Robust physical perimeter security, high-speed automated entrances, industrial roll-up closures, and parking control integration.',
    defaultSubcategories: [
      {
        id: 'sub-sec-1',
        name: 'Industrial & Commercial Rolling Shutters',
        description: 'Heavy-gauge galvanized steel, insulated fire-rated shutters, and motorized transparent retail shutters.',
        images: []
      },
      {
        id: 'sub-sec-2',
        name: 'Sectional Overhead Garage Doors',
        description: 'Polyurethane insulated panels, counterbalanced torsion springs, and automated wireless safety photo-eyes.',
        images: []
      },
      {
        id: 'sub-sec-3',
        name: 'Automatic Sliding & Swing Glass Doors',
        description: 'Dual-motion radar sensor activation, emergency breakout swing functions, and heavy-traffic operators.',
        images: []
      },
      {
        id: 'sub-sec-4',
        name: 'Automatic Parking Boom Barriers',
        description: 'High-torque brushless DC barrier gates with integrated RFID readers, ANPR cameras, and LED boom arms.',
        images: []
      }
    ]
  },
  'Aluminum, Carpentry & Glass Work': {
    category: 'Manufacturing',
    badge: 'Joinery & Glass',
    defaultTagline: 'Custom architectural metalwork, artisan carpentry, and structural glazing.',
    defaultDescription: 'Precision workshop craftsmanship delivering custom woodwork, structural curtain walls, aluminum pergolas, and bespoke joinery.',
    defaultSubcategories: [
      // {
      //   id: 'sub-alum-1',
      //   name: 'Architectural Aluminum Fabrication',
      //   description: 'Thermal-break window profiles, facade cladding, louvers, and weather-tight sliding systems.',
      //   images: []
      // },
      // {
      //   id: 'sub-alum-2',
      //   name: 'Custom Carpentry & Joinery',
      //   description: 'Solid wood doors, bespoke reception counters, executive cabinetry, and acoustic wall paneling.',
      //   images: []
      // },
      // {
      //   id: 'sub-alum-3',
      //   name: 'Structural Glass & Glazing',
      //   description: 'Tempered glass partitions, shower enclosures, spider glass facades, and glass balustrades.',
      //   images: []
      // },
      // {
      //   id: 'sub-alum-4',
      //   name: 'Curtain Wall & Skylight Systems',
      //   description: 'Double-glazed solar control curtain walling, structural silicone glazing, and glass canopies.',
      //   images: []
      // }
    ]
  }
};

// ============================================================================
// REUSABLE MULTI-IMAGE UPLOAD COMPONENT
// ============================================================================
function MultiImageUploader({
  images = [],
  onImagesChange,
  title = 'Service Gallery (Multiple Images)',
  hint = 'Upload multiple high-resolution photos (PNG, JPG, WebP) or paste image URLs'
}) {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Please select valid image files (PNG, JPG, WebP, SVG).');
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImagesChange([...images, e.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onImagesChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    onImagesChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 font-bold flex items-center gap-1.5">
          <Images className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {/* <span>{title}</span> */}
          {/* <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.2 rounded-full">
            {images.length} {images.length === 1 ? 'photo' : 'photos'}
          </span> */}
        </label>

        <div className="flex items-center gap-2">
          {/* <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Upload Photos</span>
          </button> */}
          {/* <span className="text-neutral-300 dark:text-neutral-700">•</span> */}
          {/* <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
          >
            {showUrlInput ? 'Hide URL' : '+ Image URL'}
          </button> */}
        </div>
      </div>

      {/* Hidden file input supporting MULTIPLE files */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Dropzone Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => {
          if (images.length === 0) fileInputRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-lg p-3 transition-colors ${isDragging
          ? 'border-emerald-500 bg-emerald-500/10'
          : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40'
          } ${images.length === 0 ? 'cursor-pointer py-5 text-center' : ''}`}
      >
        {images.length === 0 ? (
          <div className="space-y-1">
            <Upload className="w-6 h-6 mx-auto text-neutral-400 hover:text-emerald-500 transition-colors" />
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Drag & drop multiple photos or click to browse
            </p>
            <p className="text-[11px] text-neutral-500 font-mono">
              Supports multiple files (PNG, JPG, WebP)
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Gallery of Uploaded Images */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video sm:aspect-square rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shadow-2xs"
                >
                  <img
                    src={imgUrl}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold bg-black/70 text-white px-1 rounded pointer-events-none">
                    #{idx + 1}
                  </span>
                </div>
              ))}

              {/* Add more tile */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="aspect-video sm:aspect-square rounded-md border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white/60 dark:bg-neutral-900/60 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                title="Add more photos"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold">Add More</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
              <span>{images.length} photos ready for publication</span>
              <button
                type="button"
                onClick={() => onImagesChange([])}
                className="text-rose-500 hover:underline"
              >
                Clear all photos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* URL Input Popup */}
      {showUrlInput && (
        <div className="flex items-center gap-2 mt-2 animate-in fade-in">
          <div className="relative flex-1">
            <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste direct photo URL (https://...)"
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold shrink-0 transition-colors"
          >
            Add URL
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN SERVICES & SOLUTIONS TAB COMPONENT
// ============================================================================
export default function ServicesTab({
  services,
  onAddService,
  onUpdateService,
  onDeleteService
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Fullscreen Lightbox state
  const [lightboxData, setLightboxData] = useState(null); // { images: [], activeIndex: 0, title: '' }

  const categories = [
    'All',
    'Core',
    'Engineering',
    'Operations',
    'Refurbishment',
    'Security',
    'Manufacturing'
  ];

  const taxonomyKeys = Object.keys(SERVICE_TAXONOMY);

  // Form State
  const [formData, setFormData] = useState({
    title: 'MEP Contracting',
    category: 'Engineering',
    badge: 'MEP Contracting',
    tagline: '',
    description: '',
    images: [], // MULTIPLE images for main category
    subcategories: [], // Each with name, description, and images: []
    status: 'Active'
  });

  const [isCustomService, setIsCustomService] = useState(false);

  // Filter Services
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

  // Handle Preset Taxonomy Change
  const handleTaxonomySelect = (selectedPresetKey) => {
    if (selectedPresetKey === 'CUSTOM') {
      setIsCustomService(true);
      return;
    }

    setIsCustomService(false);
    const preset = SERVICE_TAXONOMY[selectedPresetKey];
    if (!preset) return;

    setFormData((prev) => ({
      ...prev,
      title: selectedPresetKey,
      category: preset.category,
      badge: preset.badge,
      tagline: preset.defaultTagline,
      description: preset.defaultDescription,
      subcategories: preset.defaultSubcategories.map((sub) => ({
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: sub.name,
        description: sub.description,
        images: []
      }))
    }));
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setIsCustomService(false);

    // Default to Integrated Facilities Management
    const defaultKey = 'Integrated Facilities Management';
    const preset = SERVICE_TAXONOMY[defaultKey];

    setFormData({
      title: defaultKey,
      category: preset.category,
      badge: preset.badge,
      tagline: preset.defaultTagline,
      description: preset.defaultDescription,
      images: [
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80'
      ],
      subcategories: preset.defaultSubcategories.map((sub) => ({
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: sub.name,
        description: sub.description,
        images: []
      })),
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);

    // Detect if title matches any taxonomy key
    const isMatchingPreset = taxonomyKeys.includes(service.title);
    setIsCustomService(!isMatchingPreset);

    // Normalize images array
    const mainImages = Array.isArray(service.images) && service.images.length > 0
      ? service.images
      : (service.image ? [service.image] : []);

    // Normalize subcategories array
    let subcategories = [];
    if (Array.isArray(service.subcategories) && service.subcategories.length > 0) {
      subcategories = service.subcategories.map((sc, idx) => ({
        id: sc.id || `sub-${Date.now()}-${idx}`,
        name: sc.name || (typeof sc === 'string' ? sc : 'Scope Item'),
        description: sc.description || '',
        images: Array.isArray(sc.images) ? sc.images : (sc.image ? [sc.image] : [])
      }));
    } else if (Array.isArray(service.features) && service.features.length > 0) {
      subcategories = service.features.map((feat, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        name: typeof feat === 'string' ? feat : 'Scope Item',
        description: '',
        images: []
      }));
    }

    setFormData({
      title: service.title || '',
      category: service.category || 'Engineering',
      badge: service.badge || '',
      tagline: service.tagline || '',
      description: service.description || '',
      images: mainImages,
      subcategories,
      status: service.status || 'Active'
    });
    setIsModalOpen(true);
  };

  // Add new subcategory to current form
  const handleAddSubcategory = () => {
    const newSub = {
      id: `sub-${Date.now()}`,
      name: 'New Subcategory Scope',
      description: 'Detail the operational scope and capabilities for this item.',
      images: []
    };
    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, newSub]
    }));
  };

  // Update specific subcategory
  const handleUpdateSubcategory = (index, updatedSub) => {
    setFormData((prev) => {
      const nextSubs = [...prev.subcategories];
      nextSubs[index] = updatedSub;
      return { ...prev, subcategories: nextSubs };
    });
  };

  // Remove specific subcategory
  const handleRemoveSubcategory = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const mainImages = formData.images.length > 0
      ? formData.images
      : ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80'];

    const featureList = formData.subcategories.map((sc) => sc.name);

    const servicePayload = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      badge: formData.badge.trim(),
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      images: mainImages,
      image: mainImages[0] || '',
      subcategories: formData.subcategories,
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
                <option
                  key={cat}
                  value={cat}
                  className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                >
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
        {filtered.map((service) => {
          const serviceImages = Array.isArray(service.images) && service.images.length > 0
            ? service.images
            : (service.image ? [service.image] : []);
          const coverImage = serviceImages[0] || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80';

          return (
            <div
              key={service.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-xs group"
            >
              {/* Service Cover Image + Multi-Image Count */}
              <div className="h-44 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative">
                <img
                  src={coverImage}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Category & Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white border border-white/20">
                    {service.category}
                  </span>
                  {service.badge && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-600/90 backdrop-blur-xs text-white">
                      {service.badge}
                    </span>
                  )}
                </div>

                {/* Multiple Images Badge / Button */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  {serviceImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLightboxData({ images: serviceImages, activeIndex: 0, title: service.title })}
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/75 hover:bg-black text-white border border-white/20 shadow-xs flex items-center gap-1 backdrop-blur-xs transition-colors"
                      title="View all photos"
                    >
                      <Images className="w-3 h-3 text-emerald-400" />
                      <span>{serviceImages.length}</span>
                    </button>
                  )}
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border shadow-xs ${service.status === 'Active'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-neutral-900/80 text-neutral-300 border-neutral-700'
                      }`}
                  >
                    ● {service.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip if multiple images exist */}
              {serviceImages.length > 1 && (
                <div className="px-3 py-1.5 bg-neutral-100/70 dark:bg-neutral-900/70 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 overflow-x-auto">
                  {serviceImages.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxData({ images: serviceImages, activeIndex: idx, title: service.title })}
                      className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 hover:ring-2 hover:ring-emerald-500 transition-all"
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {serviceImages.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setLightboxData({ images: serviceImages, activeIndex: 5, title: service.title })}
                      className="w-8 h-8 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono font-bold text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      +{serviceImages.length - 5}
                    </button>
                  )}
                </div>
              )}

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

                  {/* Subcategories & Deliverables List with Individual Images */}
                  {Array.isArray(service.subcategories) && service.subcategories.length > 0 ? (
                    <div className="pt-2 space-y-2 border-t border-neutral-200/80 dark:border-neutral-800/80">
                      <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 block">
                        Subcategories & Deliverables ({service.subcategories.length})
                      </span>
                      <div className="space-y-1.5">
                        {service.subcategories.slice(0, 4).map((sub, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-1.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate font-medium text-neutral-800 dark:text-neutral-200">
                                {sub.name}
                              </span>
                            </div>

                            {/* Subcategory Images Indicator */}
                            {Array.isArray(sub.images) && sub.images.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setLightboxData({ images: sub.images, activeIndex: 0, title: `${service.title} - ${sub.name}` })}
                                className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 shrink-0 hover:bg-emerald-600 hover:text-white transition-colors"
                                title="View subcategory photos"
                              >
                                <Images className="w-2.5 h-2.5" />
                                <span>{sub.images.length} photos</span>
                              </button>
                            )}
                          </div>
                        ))}
                        {service.subcategories.length > 4 && (
                          <p className="text-[11px] font-mono text-neutral-400">
                            +{service.subcategories.length - 4} more subcategories
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    Array.isArray(service.features) && service.features.length > 0 && (
                      <div className="pt-2 space-y-1.5 border-t border-neutral-200/80 dark:border-neutral-800/80">
                        {service.features.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500 dark:text-neutral-400">Updated: {service.lastUpdated || 'Recently'}</span>

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
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-sm text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 font-mono">
          No services match your search criteria.
        </div>
      )}

      {/* ==================================================================== */}
      {/* ADD / EDIT SERVICE MODAL WITH MULTI-IMAGE UPLOAD & SUBCATEGORIES     */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-neutral-950 w-full max-w-3xl max-h-[90vh] rounded-lg shadow-2xl border transition-all duration-150 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-200 ${isAlerting
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
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 shrink-0">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm overflow-y-auto">
              {/* Category / Main Service Preset Picker */}
              <div className="space-y-1.5 p-4 rounded-lg bg-emerald-50/50 dark:bg-neutral-900/60 border border-emerald-200/70 dark:border-neutral-800">
                <label className="block text-xs font-mono uppercase text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Choose Service Template / Main Category *</span>
                </label>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Select a core service line to automatically populate its official category, deliverables, and subcategories with multi-image upload options:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {taxonomyKeys.map((key) => {
                    const isSelected = !isCustomService && formData.title === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleTaxonomySelect(key)}
                        className={`p-2.5 rounded text-left border transition-all text-xs font-semibold flex items-center justify-between gap-1.5 ${isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-emerald-500'
                          }`}
                      >
                        <span className="truncate">{key}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}

                </div>
              </div>




              {/* ========================================================== */}
              {/* MAIN CATEGORY MULTI-IMAGE UPLOAD SECTION                    */}
              {/* ========================================================== */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 space-y-3">
                <MultiImageUploader
                  images={formData.images}
                  onImagesChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
                  title={`${formData.title || 'Main Service'} - Photos (Multiple Upload)`}
                  hint="Upload multiple cover photos, site images, or work references"
                />
              </div>

              {/* ========================================================== */}
              {/* SUBCATEGORIES SECTION WITH INDIVIDUAL MULTI-IMAGE UPLOADS   */}
              {/* ========================================================== */}
              {formData.subcategories.length === 0 ? null : <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Subcategories & Scope Items</span>
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Each subcategory has its own dedicated multiple image upload option.
                    </p>
                  </div>

                  {/* <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded text-xs font-mono font-bold hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subcategory</span>
                  </button> */}
                </div>


                <div className="space-y-4">
                  {formData.subcategories.map((sub, sIdx) => (
                    <div
                      key={sub.id || sIdx}
                      className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shadow-2xs"
                    >
                      {/* Static Subcategory Header */}
                      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                            {sIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                              {sub.name}
                            </h5>
                            <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider">
                              Static Subcategory Scope
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dedicated Subcategory Multiple Image Upload */}
                      <div className="pt-1">
                        <MultiImageUploader
                          images={sub.images || []}
                          onImagesChange={(subImgs) =>
                            handleUpdateSubcategory(sIdx, { ...sub, images: subImgs })
                          }
                          title={`${sub.name || `Subcategory #${sIdx + 1}`} - Photos (Multiple Upload)`}
                          hint="Attach multiple reference photos, certifications, or project examples"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>}



              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold border border-neutral-300 dark:border-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors shadow-xs"
                >
                  {editingService ? 'Save Changes' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* FULLSCREEN LIGHTBOX PHOTO VIEWER                                    */}
      {/* ==================================================================== */}
      {lightboxData && (
        <div
          onClick={() => setLightboxData(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-150"
        >
          {/* Lightbox Header */}
          <div className="w-full max-w-4xl flex items-center justify-between py-2 text-white px-2">
            <div>
              <h4 className="text-sm font-bold truncate max-w-lg">{lightboxData.title}</h4>
              <p className="text-xs text-neutral-400 font-mono">
                Photo {lightboxData.activeIndex + 1} of {lightboxData.images.length}
              </p>
            </div>
            <button
              onClick={() => setLightboxData(null)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Image Preview with Navigation */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[75vh] flex items-center justify-center overflow-hidden my-2"
          >
            <img
              src={lightboxData.images[lightboxData.activeIndex]}
              alt="Fullscreen View"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />

            {lightboxData.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxData((prev) => ({
                      ...prev,
                      activeIndex:
                        (prev.activeIndex - 1 + prev.images.length) % prev.images.length
                    }))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/20"
                  title="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxData((prev) => ({
                      ...prev,
                      activeIndex: (prev.activeIndex + 1) % prev.images.length
                    }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/20"
                  title="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Bar */}
          {lightboxData.images.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 overflow-x-auto max-w-3xl py-2 px-4 bg-black/50 rounded-lg border border-white/10"
            >
              {lightboxData.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxData((prev) => ({ ...prev, activeIndex: idx }))}
                  className={`w-12 h-12 rounded overflow-hidden shrink-0 transition-all border-2 ${lightboxData.activeIndex === idx
                    ? 'border-emerald-500 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Delete Service */}
      <ConfirmDialog
        isOpen={!!serviceToDelete}
        title="Delete Service & Solution"
        message={
          serviceToDelete
            ? `Are you sure you want to delete "${serviceToDelete.title}"? This will unpublish the service and all its subcategories from the public IT solutions catalog.`
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
