import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Supabase Data Service
 * Provides automated CRUD for tickets, services, careers, trusted partners, and staff.
 * If Supabase is not yet configured, returns null/handles gracefully so the app
 * uses the built-in state/localStorage seamlessly.
 */

// ==========================================
// TICKETS
// ==========================================
export const fetchTicketsFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching tickets from Supabase:', error.message);
    return null;
  }
  return data.map((d) => {
    let normalizedRequester = {
      name: 'Staff Member',
      email: '',
      department: d.department || 'General',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
    };
    if (typeof d.requester === 'object' && d.requester !== null) {
      normalizedRequester = {
        name: d.requester.name || 'Staff Member',
        email: d.requester.email || '',
        department: d.requester.department || d.department || 'General',
        avatar: d.requester.avatar || normalizedRequester.avatar
      };
    } else if (typeof d.requester === 'string' && d.requester.trim()) {
      if (d.requester.includes('@')) {
        normalizedRequester.email = d.requester.trim();
        normalizedRequester.name = d.requester.split('@')[0];
      } else {
        normalizedRequester.name = d.requester.trim();
      }
    }

    return {
      ...d,
      subject: d.title || d.subject || 'Untitled Incident',
      requester: normalizedRequester,
      isUnread: Boolean(d.unread),
      timeline: d.conversation || d.timeline || [],
      assignee: d.assigned_to
        ? (typeof d.assigned_to === 'object' ? d.assigned_to : { name: d.assigned_to, email: '', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces' })
        : { name: 'IT Support Team', email: 'support@albazzam.com', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces' },
      createdAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recently',
      updatedAt: d.updated_at ? new Date(d.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
    };
  });
};

export const syncTicketToSupabase = async (ticket) => {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = {
    id: String(ticket.id || `TICK-${Date.now()}`),
    title: ticket.title || ticket.subject || 'Untitled Incident',
    description: ticket.description || '',
    category: ticket.category || 'Software',
    department: ticket.department || ticket.requester?.department || 'IT Department',
    priority: ticket.priority || 'Medium',
    status: ticket.status || 'Open',
    requester: ticket.requester || {},
    assigned_to: ticket.assignee?.name || ticket.assigned_to || '',
    conversation: ticket.timeline || ticket.conversation || [],
    attachments: ticket.attachments || [],
    unread: Boolean(ticket.unread || ticket.isUnread),
    updated_at: new Date().toISOString()
  };
  const { error } = await client
    .from('tickets')
    .upsert(payload);

  if (error) {
    console.error('Error syncing ticket to Supabase:', error.message);
  }
};

export const deleteTicketFromSupabase = async (ticketId) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('tickets')
    .delete()
    .eq('id', String(ticketId));

  if (error) {
    console.error('Error deleting ticket from Supabase:', error.message);
  }
};

// ==========================================
// SERVICES
// ==========================================
export const fetchServicesFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Error fetching services from Supabase:', error.message);
    return null;
  }
  return data.map((s) => ({
    ...s,
    features: s.deliverables || s.features || [],
    status: s.active === false ? 'Inactive' : 'Active'
  }));
};

export const syncServiceToSupabase = async (service) => {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = {
    id: String(service.id || `srv-${Date.now()}`),
    title: service.title || 'Untitled Service',
    category: service.category || 'Core',
    badge: service.badge || '',
    description: service.description || '',
    deliverables: service.deliverables || service.features || [],
    icon: service.icon || 'Wrench',
    image: service.image || '',
    active: service.active !== undefined ? Boolean(service.active) : service.status !== 'Inactive'
  };
  const { error } = await client.from('services').upsert(payload);
  if (error) console.error('Error syncing service:', error.message);
};

export const deleteServiceFromSupabase = async (serviceId) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('services')
    .delete()
    .eq('id', String(serviceId));

  if (error) {
    console.error('Error deleting service from Supabase:', error.message);
  }
};

// ==========================================
// CAREERS
// ==========================================
export const fetchCareersFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('careers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching careers from Supabase:', error.message);
    return null;
  }
  return data.map((c) => ({
    ...c,
    employmentType: c.type || c.employmentType || 'Full Time',
    status: c.active === false ? 'Closed' : 'Open',
    requirements: c.requirements || []
  }));
};

export const syncCareerToSupabase = async (career) => {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = {
    id: String(career.id || `job-${Date.now()}`),
    title: career.title || 'Untitled Opening',
    department: career.department || 'Operation Dept',
    location: career.location || 'Abu Dhabi / Dubai, UAE',
    type: career.type || career.employmentType || 'Full Time',
    experience: career.experience || '3+ Years',
    qualification: career.qualification || 'Degree / Diploma',
    description: career.description || '',
    responsibilities: career.responsibilities || [],
    requirements: career.requirements || [],
    active: career.active !== undefined ? Boolean(career.active) : career.status !== 'Closed'
  };
  const { error } = await client.from('careers').upsert(payload);
  if (error) console.error('Error syncing career:', error.message);
};

export const deleteCareerFromSupabase = async (careerId) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('careers')
    .delete()
    .eq('id', String(careerId));

  if (error) {
    console.error('Error deleting career from Supabase:', error.message);
  }
};

// ==========================================
// TRUSTED PARTNERS
// ==========================================
export const fetchPartnersFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('trusted_partners')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Error fetching partners from Supabase:', error.message);
    return null;
  }
  return data.map((p) => ({
    ...p,
    websiteUrl: p.website_url || p.websiteUrl || ''
  }));
};

export const syncPartnerToSupabase = async (partner) => {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = {
    id: String(partner.id || `prt-${Date.now()}`),
    name: partner.name || 'Untitled Partner',
    logo: partner.logo || '',
    website_url: partner.websiteUrl || partner.website_url || '',
    description: partner.description || '',
    active: partner.active !== false
  };
  const { error } = await client.from('trusted_partners').upsert(payload);
  if (error) console.error('Error syncing partner:', error.message);
};

export const deletePartnerFromSupabase = async (partnerId) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('trusted_partners')
    .delete()
    .eq('id', String(partnerId));

  if (error) {
    console.error('Error deleting partner from Supabase:', error.message);
  }
};

// ==========================================
// TEAM MEMBERS
// ==========================================
export const fetchTeamMembersFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Error fetching team members from Supabase:', error.message);
    return null;
  }
  return data.map((m) => ({
    ...m,
    ticketsAssigned: m.tickets_assigned || m.ticketsAssigned || 0,
    lastActive: m.last_active || m.lastActive || 'Just now'
  }));
};

export const syncTeamMemberToSupabase = async (member) => {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = {
    id: String(member.id || `usr-${Date.now()}`),
    name: member.name || 'Staff Member',
    email: member.email,
    password: member.password || 'password123',
    department: member.department || 'IT Department',
    role: member.role || 'IT Support Lead',
    status: member.status || 'Active',
    phone: member.phone || '',
    avatar: member.avatar || '',
    tickets_assigned: member.ticketsAssigned || member.tickets_assigned || 0,
    last_active: member.lastActive || member.last_active || 'Just now'
  };
  const { error } = await client.from('team_members').upsert(payload);
  if (error) console.error('Error syncing team member:', error.message);
};

export const deleteTeamMemberFromSupabase = async (memberId) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('team_members')
    .delete()
    .eq('id', String(memberId));

  if (error) {
    console.error('Error deleting team member from Supabase:', error.message);
  }
};
