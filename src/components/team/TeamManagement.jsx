import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  X,
  AlertTriangle,
  AlertCircle,
  UserCheck,
  Edit,
  Trash2,
  Filter,
  Phone,
  Shield,
  Upload,
  Image as ImageIcon,
  Building2,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWindowsModalAlert } from '../../utils/useWindowsModalAlert';
import ConfirmDialog from '../common/ConfirmDialog';
import { isSupabaseConfigured, getSupabaseClient } from '../../lib/supabaseClient';

export default function TeamManagement({
  teamMembers = [],
  onAddMember,
  onUpdateMember,
  onDeleteMember
}) {
  const { isAlerting, handleBackdropClick } = useWindowsModalAlert();
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Password visibility and validation state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // All Standard Departments
  const allDepartments = [
    'Admin',
    'IT Department',
    'Finance & Accounts',
    'HR',
    'Facilities Management'
  ];

  // Role Category mapping per Department
  const departmentRoles = {
    'Admin': [
      'Admin',
      'Staff Director'
    ],
    'IT Department': [
      'IT Support Lead',
      'Software Engineer',
      'IT Admin',
      'Both Above'
    ],
    'Finance & Accounts': [
      'Finance Manager',
      'Senior Accountant'
    ],
    'HR': [
      'HR Director'
    ],
    'Facilities Management': [
      'Facilities Operations Manager',
      'Client Relations & Support'
    ]
  };

  // Helper functions to identify Admin accounts
  const isMemberAdmin = (m) => {
    if (!m) return false;
    const r = (m.role || '').toLowerCase().trim();
    const d = (m.department || '').toLowerCase().trim();
    return r === 'admin' || r === 'administrator' || r === 'staff director' || d === 'admin';
  };

  const isMemberActiveAdmin = (m) => {
    return isMemberAdmin(m) && (m.status || 'Active') !== 'Inactive';
  };

  // Check if an active Admin already exists in team list (excluding the member currently being edited)
  const activeAdminMember = teamMembers.find((m) => isMemberActiveAdmin(m));
  const hasActiveAdminExcludingCurrent = teamMembers.some(
    (m) => isMemberActiveAdmin(m) && (!editingMember || m.id !== editingMember.id)
  );

  // Modal Department options: Remove 'Admin' if an active Admin already exists
  const modalDepartments = hasActiveAdminExcludingCurrent
    ? allDepartments.filter((dept) => dept !== 'Admin')
    : allDepartments;

  // Modal Role options: Remove 'Admin' and 'Staff Director' if an active Admin already exists
  const getModalRoles = (dept) => {
    const rawRoles = departmentRoles[dept] || ['Staff Member'];
    if (hasActiveAdminExcludingCurrent) {
      return rawRoles.filter((r) => {
        const lr = r.toLowerCase().trim();
        return lr !== 'admin' && lr !== 'staff director';
      });
    }
    return rawRoles;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'IT Department',
    role: 'IT Support Lead',
    status: 'Active',
    phone: ' ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    password: '',
    confirmPassword: ''
  });

  const filtered = teamMembers.filter((m) => {
    const term = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.role && m.role.toLowerCase().includes(term)) ||
      (m.department && m.department.toLowerCase().includes(term));
    const matchesDept = selectedDept === 'All Departments' || m.department === selectedDept;
    const matchesStatus = selectedStatus === 'All Status' || (m.status || 'Active') === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setPasswordError('');
    setEmailError('');
    setAdminError('');
    setShowPassword(false);
    setShowConfirmPassword(false);

    // If active admin already exists, default to 'IT Department'. If no active admin exists, default to 'Admin'.
    const defaultDept = hasActiveAdminExcludingCurrent ? 'IT Department' : 'Admin';
    const availableRoles = getModalRoles(defaultDept);

    setFormData({
      name: '',
      email: '',
      department: defaultDept,
      role: availableRoles[0] || 'IT Support Lead',
      status: 'Active',
      phone: '',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=100&h=100&fit=crop&crop=faces`,
      password: '',
      confirmPassword: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setPasswordError('');
    setEmailError('');
    setAdminError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    const memberDept = allDepartments.includes(member.department) ? member.department : 'IT Department';
    setFormData({
      name: member.name || '',
      email: member.email || '',
      department: memberDept,
      role: member.role || departmentRoles[memberDept]?.[0] || 'IT Support Lead',
      status: member.status === 'Inactive' ? 'Inactive' : 'Active',
      phone: member.phone || '',
      avatar: member.avatar || '',
      password: member.password || '',
      confirmPassword: member.password || ''
    });
    setIsModalOpen(true);
  };

  const handleDepartmentChange = (newDept) => {
    const roles = getModalRoles(newDept);
    const defaultRoleForDept = roles[0] || 'Staff Member';
    setFormData((prev) => ({
      ...prev,
      department: newDept,
      role: defaultRoleForDept
    }));
    if (adminError) setAdminError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        avatar: e.target.result
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

  const validateEmailIsUnique = async (emailToCheck) => {
    const clean = (emailToCheck || '').trim().toLowerCase();
    if (!clean) return true;

    // 1. Check local state
    const localMatch = teamMembers.find(
      (m) => (m.email || '').trim().toLowerCase() === clean && (!editingMember || m.id !== editingMember.id)
    );
    if (localMatch) {
      setEmailError(`A staff member with email "${emailToCheck.trim()}" already exists (${localMatch.name} - ${localMatch.role || 'Staff'}).`);
      return false;
    }

    // 2. Check live Supabase database
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        setIsCheckingEmail(true);
        try {
          const { data, error } = await client
            .from('team_members')
            .select('id, name, email, role')
            .ilike('email', clean)
            .maybeSingle();

          setIsCheckingEmail(false);
          if (data && (!editingMember || data.id !== editingMember.id)) {
            setEmailError(`Email "${emailToCheck.trim()}" is already registered to ${data.name} in database.`);
            return false;
          }
        } catch {
          setIsCheckingEmail(false);
        }
      }
    }

    setEmailError('');
    return true;
  };

  const validateAdminAvailability = async (memberData) => {
    // Only restrict if setting department to Admin or role to Admin/Staff Director and status is Active
    if (!isMemberAdmin(memberData) || memberData.status === 'Inactive') {
      setAdminError('');
      return true;
    }

    // 1. Check local state
    const localAdmin = teamMembers.find(
      (m) => isMemberActiveAdmin(m) && (!editingMember || m.id !== editingMember.id)
    );
    if (localAdmin) {
      setAdminError(`An active Admin already exists (${localAdmin.name} - ${localAdmin.email}). Only one active Admin account is permitted. Please deactivate or change the existing Admin first.`);
      return false;
    }

    // 2. Check live Supabase database
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('team_members')
            .select('id, name, email, role, department, status')
            .neq('status', 'Inactive');

          if (!error && Array.isArray(data)) {
            const remoteAdmin = data.find(
              (m) => isMemberActiveAdmin(m) && (!editingMember || m.id !== editingMember.id)
            );
            if (remoteAdmin) {
              setAdminError(`An active Admin account already exists in database (${remoteAdmin.name} - ${remoteAdmin.email}). Please deactivate the active Admin first.`);
              return false;
            }
          }
        } catch (err) {
          console.warn('Error checking remote admin status:', err);
        }
      }
    }

    setAdminError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    // Check single active admin rule
    const isAdminAllowed = await validateAdminAvailability(formData);
    if (!isAdminAllowed) return;

    // Check duplicate email
    const isEmailAvailable = await validateEmailIsUnique(formData.email);
    if (!isEmailAvailable) return;

    // Password validation logic
    if (!editingMember) {
      // Adding new staff: Password is required and must match
      if (!formData.password) {
        setPasswordError('Password is required for new staff account.');
        return;
      }
      if (formData.password.length < 6) {
        setPasswordError('Password must be at least 6 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Password and Confirm Password do not match.');
        return;
      }
    } else {
      // Editing existing staff: If user typed in password or confirm password, validate
      if (formData.password || formData.confirmPassword) {
        if (formData.password.length < 6) {
          setPasswordError('Password must be at least 6 characters long.');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setPasswordError('Password and Confirm Password do not match.');
          return;
        }
      }
    }

    setPasswordError('');

    // Separate confirmPassword out of saved object
    const { confirmPassword, ...memberPayload } = formData;
    const finalPassword = memberPayload.password || editingMember?.password || '';

    if (editingMember) {
      if (onUpdateMember) {
        onUpdateMember({
          ...editingMember,
          ...memberPayload,
          password: finalPassword,
          lastActive: 'Just updated'
        });
      }
    } else {
      if (onAddMember) {
        onAddMember({
          id: `usr-${Date.now()}`,
          ...memberPayload,
          password: finalPassword,
          ticketsAssigned: 0,
          lastActive: 'Just added'
        });
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (member) => {
    setMemberToDelete(member);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete && onDeleteMember) {
      onDeleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-neutral-900 dark:text-neutral-200 transition-colors">
      {/* Top Banner & Add CTA */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-white dark:bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Staff Directory & Access Management</span>
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Manage personnel across Admin, IT, Finance & Accounts, HR, and Facilities Management.
          </p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {activeAdminMember ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs font-mono font-semibold text-purple-700 dark:text-purple-300">
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Active Admin: {activeAdminMember.name} ({activeAdminMember.role || 'Admin'})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-mono font-semibold text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Admin Role: Available (No active admin configured)</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Filter and Search Bar: Integrated Department & Status Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 shadow-xs">
        <div className="relative flex-1 max-w-xl flex items-center">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search staff by name, email, role, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-sm text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2.5 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="All Departments" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                All Departments
              </option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="All Status" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                All Status
              </option>
              <option value="Active" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                Active
              </option>
              <option value="Inactive" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                Inactive
              </option>
            </select>
          </div>

          <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 pl-2">
            <strong>{filtered.length}</strong> staff
          </div>
        </div>
      </div>

      {/* Staff Grid with Add, Edit, Delete Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((member) => {
          const isActive = (member.status || 'Active') === 'Active';

          return (
            <div
              key={member.id}
              className="group border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-white dark:bg-neutral-950 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-150 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 p-0.5"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces';
                      }}
                    />
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono font-semibold">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Active / Inactive Status Badge */}
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`}></span>
                    <span>{isActive ? 'Active' : 'Inactive'}</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono border-t border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate text-neutral-800 dark:text-neutral-300">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Department:</span>
                    <span className="text-neutral-900 dark:text-neutral-200 font-medium">{member.department || 'IT Department'}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Direct Phone:</span>
                      <span className="text-neutral-800 dark:text-neutral-300 font-medium">{member.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Assigned Incidents:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{member.ticketsAssigned || 0} tickets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Staff Credentials:</span>
                    <span className="text-neutral-800 dark:text-neutral-300 font-medium flex items-center gap-1 text-[11px]">
                      <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Password Configured</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Row with Edit & Delete actions */}
              <div className="flex items-center justify-between pt-1 text-xs text-neutral-500 font-mono">
                <span className="text-[11px] text-neutral-400">Status: {isActive ? 'Active' : 'Inactive'}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors font-medium text-xs"
                    title="Edit staff member"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-colors font-medium text-xs"
                    title="Remove staff member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-500 dark:text-neutral-400 font-mono text-sm border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl">
            <Users className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            No staff members found matching your filters.
          </div>
        )}
      </div>

      {/* Add / Edit Staff Member Modal (with Windows Modal Alert behavior) */}
      {isModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-neutral-950 w-full max-w-lg rounded-lg shadow-2xl border transition-all duration-150 overflow-hidden text-neutral-900 dark:text-neutral-200 ${isAlerting
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
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{editingMember ? 'Edit Staff Member' : 'Add New Staff Member'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm max-h-[82vh] overflow-y-auto">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1.5 font-bold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tariq Al Mansoori"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700"
                />
              </div>

              {/* Corporate Work Email */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 font-bold">
                    Corporate Work Email *
                  </label>
                  {isCheckingEmail && (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 animate-pulse">
                      Checking email availability...
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (emailError) setEmailError('');
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      validateEmailIsUnique(e.target.value);
                    }
                  }}
                  placeholder="tariq@albazzam.com"
                  className={`w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border rounded text-neutral-900 dark:text-neutral-200 focus:outline-none transition-colors ${emailError
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10'
                    : 'border-neutral-300 dark:border-neutral-800 focus:border-neutral-700'
                    }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password & Confirm Password Section */}
              <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-neutral-800 dark:text-neutral-200 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Staff Login Password {editingMember ? '(Optional)' : '*'}</span>
                  </label>
                  {editingMember && (
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Leave empty to keep current password
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password Field */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">
                      Password {!editingMember && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingMember}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder={editingMember ? '•••••••• (keep existing)' : 'Enter staff password'}
                        className="w-full pl-3 pr-9 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">
                      Confirm Password {!editingMember && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required={!editingMember || !!formData.password}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder={editingMember ? '•••••••• (keep existing)' : 'Confirm staff password'}
                        className={`w-full pl-3 pr-9 py-2 bg-white dark:bg-neutral-900 border rounded text-xs text-neutral-900 dark:text-neutral-200 focus:outline-none font-mono ${formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-neutral-300 dark:border-neutral-800 focus:border-neutral-700'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Feedback / Error Indicator */}
                {passwordError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {formData.password && formData.confirmPassword && (
                  <div className="flex items-center gap-1.5 text-xs">
                    {formData.password === formData.confirmPassword ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-500 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-neutral-500 font-mono">
                  Minimum 6 characters. This password allows the staff member to sign in to the portal and console.
                </p>
              </div>

              {/* Admin Restriction / Availability Alert Banner */}
              {adminError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Admin Account Limitation:</strong>
                    <span>{adminError}</span>
                  </div>
                </div>
              )}



              {/* Department & Role Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Department Selection */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1.5 font-bold">
                    Department Category *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
                  >
                    {modalDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role (Set to Department Category) */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1.5 font-bold">
                    Role ({formData.department}) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value });
                      if (adminError) setAdminError('');
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
                  >
                    {getModalRoles(formData.department).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status (Active / Inactive) & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Status: Active or Inactive */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1.5 font-bold">
                    Status (Active / Inactive) *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700 text-xs font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Direct Phone */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1.5 font-bold">
                    Direct Phone / Extension
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder=""
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              {/* Image Upload Option */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-1.5 font-bold">
                  Staff Photo / Avatar (Upload Image)
                </label>

                {/* Upload & Dropzone Box */}
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

                  {formData.avatar ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={formData.avatar}
                          alt="Staff Preview"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo ready</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 text-xs bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded font-mono font-bold transition-colors"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
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
                        Click to upload staff photo or drag & drop
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct image URL fallback */}
                <div className="mt-2">
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400 pointer-events-none" />
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-emerald-500 placeholder-neutral-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold border border-neutral-300 dark:border-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors shadow-xs"
                >
                  {editingMember ? 'Save Changes' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete Staff Member */}
      <ConfirmDialog
        isOpen={!!memberToDelete}
        title="Remove Staff Member"
        message={
          memberToDelete
            ? `Are you sure you want to remove "${memberToDelete.name}" (${memberToDelete.role}) from the staff directory? This will revoke active system privileges.`
            : ''
        }
        confirmText="Delete Member"
        cancelText="Cancel"
        icon="trash"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}
