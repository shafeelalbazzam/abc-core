import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  Users,
  MapPin,
  Clock,
  DollarSign,
  X,
  AlertTriangle,
  FileText,
  Filter
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';
import ConfirmDialog from '../common/ConfirmDialog';

export default function CareersTab({
  careers,
  onAddCareer,
  onUpdateCareer,
  onDeleteCareer
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState(null);
  const [careerToDelete, setCareerToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Operation Dept',
    location: 'Abu Dhabi, UAE',
    employmentType: 'Full Time',
    experience: '3+ years',
    salaryRange: 'Competitive Package',
    qualification: 'Diploma / Relevant Engineering Credential',
    description: '',
    requirements: '',
    status: 'Open',
    applicantsCount: 0
  });

  const departments = [
    'All',
    'Operation Dept',
    'Purchase Dept',
    'Engineering Dept',
    'Administration'
  ];

  const filtered = careers.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'All' || job.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingCareer(null);
    setFormData({
      title: '',
      department: 'Operation Dept',
      location: 'Abu Dhabi, UAE',
      employmentType: 'Full Time',
      experience: '3+ years',
      salaryRange: 'Competitive Package',
      qualification: 'Diploma / Trade Certificate',
      description: 'Join Al Bazzam Facilities Management Group to supervise, execute, and deliver world-class facilities operations.',
      requirements: 'Experience in commercial or residential facilities operations\nValid UAE trade credentials or engineering diploma\nStrong communication and agility under pressure',
      status: 'Open',
      applicantsCount: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingCareer(job);
    setFormData({
      title: job.title || '',
      department: job.department || 'Operation Dept',
      location: job.location || 'Abu Dhabi, UAE',
      employmentType: job.employmentType || 'Full Time',
      experience: job.experience || '3+ years',
      salaryRange: job.salaryRange || 'Competitive Package',
      qualification: job.qualification || 'Diploma / Relevant Trade Credential',
      description: job.description || '',
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join('\n')
        : (job.requirements || ''),
      status: job.status || 'Open',
      applicantsCount: job.applicantsCount || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const reqList = formData.requirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {
      id: editingCareer ? editingCareer.id : `job-${Date.now()}`,
      title: formData.title,
      department: formData.department,
      location: formData.location,
      employmentType: formData.employmentType,
      experience: formData.experience,
      salaryRange: formData.salaryRange,
      description: formData.description,
      requirements: reqList,
      status: formData.status,
      applicantsCount: Number(formData.applicantsCount) || 0,
      postedDate: editingCareer ? editingCareer.postedDate : 'Nov 18, 2026'
    };

    if (editingCareer) {
      onUpdateCareer(payload);
    } else {
      onAddCareer(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <div className="relative flex-1 max-w-xl flex items-center">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search job postings by role, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-52 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
          {/* Integrated Department Filter Button on Right of Search Bar */}
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                  {dept === 'All' ? 'All Departments' : dept}
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
          <span>Post New Opening</span>
        </button>
      </div>

      {/* Careers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((job) => (
          <div
            key={job.id}
            className="group relative bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200"
          >
            {/* Card Header */}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {job.department}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${job.status === 'Open'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : job.status === 'In Review'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                    }`}
                >
                  {job.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {job.employmentType}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                {job.description}
              </p>

              {/* Compensation & Experience Tag */}
              {job.salaryRange && (
                <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      {job.salaryRange}
                    </span>
                    <span className="text-[11px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-700 dark:text-neutral-300">
                      {job.experience}
                    </span>
                  </div>
                </div>
              )}

              {/* Requirements preview */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="text-[11px] font-mono uppercase font-bold text-neutral-500 dark:text-neutral-400">
                    Key Requirements ({job.requirements.length}):
                  </div>
                  <ul className="space-y-1">
                    {job.requirements.slice(0, 2).map((req, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{req}</span>
                      </li>
                    ))}
                    {job.requirements.length > 2 && (
                      <li className="text-[11px] font-mono text-neutral-400 italic pl-5">
                        +{job.requirements.length - 2} more qualification criteria
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-neutral-900 dark:text-white">
                  {job.applicantsCount}
                </span>{' '}
                applicants
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(job)}
                  className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  title="Edit Job Opening"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCareerToDelete(job)}
                  className="p-1.5 rounded hover:bg-rose-500/20 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-500 dark:text-neutral-400 font-mono text-sm border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            No career openings found matching your criteria.
          </div>
        )}
      </div>

      {/* Windows Alert Modal for Add / Edit Career */}
      {isModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden transition-transform duration-100 ${isAlerting ? 'animate-windows-shake ring-4 ring-rose-500/40' : ''
              }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-neutral-900 dark:text-white uppercase tracking-wider">
                  {editingCareer ? 'Edit Job Opening' : 'Post New Career Opening'}
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Software Architect (React / Node.js)"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Operation Dept">Operation Dept</option>
                    <option value="Purchase Dept">Purchase Dept</option>
                    <option value="Engineering Dept">Engineering Dept</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Location & Model
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Dubai HQ • Hybrid"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g. 5+ years"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Salary Range (Monthly)
                  </label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="e.g. AED 24,000 - 32,000 / month"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Review">In Review</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Job Overview Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the core mission and scope of this role..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Requirements & Qualifications (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="5+ years building React & Node.js microservices&#10;Kubernetes & Docker container deployment experience&#10;Deep understanding of PostgreSQL and Redis caching"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
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
                  {editingCareer ? 'Update Opening' : 'Publish Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Dialog for Delete Job */}
      <ConfirmDialog
        isOpen={!!careerToDelete}
        title="Delete Career Opening"
        message={
          careerToDelete
            ? `Are you sure you want to delete the job opening for "${careerToDelete.title}" (${careerToDelete.department})? This position will be removed from the careers portal.`
            : ''
        }
        confirmText="Delete Opening"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={() => {
          if (careerToDelete) {
            onDeleteCareer(careerToDelete.id);
            setCareerToDelete(null);
          }
        }}
        onCancel={() => setCareerToDelete(null)}
      />
    </div>
  );
}
