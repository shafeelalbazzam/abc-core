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
export const normalizeTicketRecord = (d) => {
  if (!d) return null;

  // Load local unread overrides if available
  let cachedUnreadMap = {};
  if (typeof window !== 'undefined') {
    try {
      cachedUnreadMap = JSON.parse(localStorage.getItem('abc_unread_tickets') || '{}');
    } catch { }
  }

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

  const unreadResolved = d.id in cachedUnreadMap ? Boolean(cachedUnreadMap[d.id]) : Boolean(d.unread);
  const conv = Array.isArray(d.conversation) ? d.conversation : (Array.isArray(d.timeline) ? d.timeline : (Array.isArray(d.replies) ? d.replies : []));

  return {
    ...d,
    subject: d.title || d.subject || 'Untitled Incident',
    requester: normalizedRequester,
    unread: unreadResolved,
    isUnread: unreadResolved,
    timeline: conv,
    replies: conv,
    conversation: conv,
    assignee: d.assigned_to
      ? (typeof d.assigned_to === 'object' ? d.assigned_to : { name: d.assigned_to, email: '', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces' })
      : { name: 'IT Support Team', email: 'support@albazzam.com', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces' },
    createdAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recently',
    updatedAt: d.updated_at ? new Date(d.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
  };
};

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

  return data.map((d) => normalizeTicketRecord(d));
};

export const syncTicketToSupabase = async (ticket) => {
  const client = getSupabaseClient();
  if (!client) return;
  const isUnreadVal = ticket.isUnread !== undefined ? Boolean(ticket.isUnread) : Boolean(ticket.unread);
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
    conversation: ticket.timeline || ticket.replies || ticket.conversation || [],
    attachments: ticket.attachments || [],
    unread: isUnreadVal,
    updated_at: new Date().toISOString()
  };
  const { error } = await client
    .from('tickets')
    .upsert(payload);

  if (error) {
    console.error('Error syncing ticket to Supabase:', error.message);
  }
};

export const updateTicketUnreadStatusInSupabase = async (ticketId, isUnread) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client
      .from('tickets')
      .update({
        unread: Boolean(isUnread),
        updated_at: new Date().toISOString()
      })
      .eq('id', String(ticketId));

    if (error) {
      console.warn('Error updating ticket unread status in Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Exception updating ticket unread status:', err);
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

/**
 * Subscribe to live Realtime changes on public.tickets in Supabase
 */
export const subscribeToTicketsRealtime = (callbacks = {}) => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channelId = `tickets_realtime_${Math.random().toString(36).slice(2, 9)}`;
    const channel = client
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          const { eventType, new: newRec, old: oldRec } = payload;
          if (eventType === 'INSERT' && callbacks.onInsert && newRec) {
            callbacks.onInsert(normalizeTicketRecord(newRec));
          } else if (eventType === 'UPDATE' && callbacks.onUpdate && newRec) {
            callbacks.onUpdate(normalizeTicketRecord(newRec));
          } else if (eventType === 'DELETE' && callbacks.onDelete && oldRec) {
            callbacks.onDelete(oldRec.id);
          }
        }
      )
      .subscribe((status, err) => {
        if (callbacks.onStatusChange) {
          callbacks.onStatusChange(status, err);
        }
      });

    return () => {
      try {
        client.removeChannel(channel);
      } catch (err) {
        console.warn('Error removing realtime channel:', err);
      }
    };
  } catch (err) {
    console.warn('Could not initialize Supabase Realtime channel:', err);
    return null;
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
  return data.map((s) => {
    let subcategories = [];
    let images = [];
    let features = [];

    // 1. Direct columns if present (from updated schema)
    if (Array.isArray(s.subcategories) && s.subcategories.length > 0) {
      subcategories = s.subcategories;
    }
    if (Array.isArray(s.images) && s.images.length > 0) {
      images = s.images;
    }

    // 2. Fallback to deliverables JSONB object/array
    if (subcategories.length === 0 || images.length === 0) {
      if (s.deliverables && typeof s.deliverables === 'object' && !Array.isArray(s.deliverables)) {
        if (subcategories.length === 0) subcategories = Array.isArray(s.deliverables.subcategories) ? s.deliverables.subcategories : [];
        if (images.length === 0) images = Array.isArray(s.deliverables.images) ? s.deliverables.images : [];
        features = Array.isArray(s.deliverables.features) ? s.deliverables.features : [];
      } else if (Array.isArray(s.deliverables)) {
        if (s.deliverables.length > 0 && typeof s.deliverables[0] === 'object') {
          if (subcategories.length === 0) subcategories = s.deliverables;
        } else {
          features = s.deliverables;
        }
      }
    }

    if (images.length === 0 && s.image) {
      images = [s.image];
    }

    return {
      ...s,
      tagline: s.tagline || '',
      images,
      image: images[0] || s.image || '',
      subcategories,
      features: features.length > 0 ? features : subcategories.map((sc) => (typeof sc === 'object' ? sc.name : sc)),
      status: s.status || (s.active === false ? 'Inactive' : 'Active')
    };
  });
};

export const syncServiceToSupabase = async (service) => {
  const client = getSupabaseClient();
  if (!client) return;

  const images = Array.isArray(service.images) && service.images.length > 0
    ? service.images
    : (service.image ? [service.image] : []);

  const subcategories = Array.isArray(service.subcategories) ? service.subcategories : [];
  const features = Array.isArray(service.features) && service.features.length > 0
    ? service.features
    : subcategories.map((sc) => (typeof sc === 'object' ? sc.name : sc));

  const payload = {
    id: String(service.id || `srv-${Date.now()}`),
    title: service.title || 'Untitled Service',
    category: service.category || 'Engineering',
    badge: service.badge || '',
    tagline: service.tagline || '',
    description: service.description || '',
    images,
    subcategories,
    deliverables: {
      images,
      subcategories,
      features
    },
    icon: service.icon || 'Wrench',
    image: images[0] || service.image || '',
    status: service.status || 'Active',
    active: service.active !== undefined ? Boolean(service.active) : service.status !== 'Inactive',
    updated_at: new Date().toISOString()
  };

  const { error } = await client.from('services').upsert(payload);
  if (error) {
    // If the remote table has not yet run the migration adding images/subcategories columns:
    if (error.code === 'PGRST204') {
      const legacyPayload = {
        id: payload.id,
        title: payload.title,
        category: payload.category,
        badge: payload.badge,
        description: payload.description,
        deliverables: payload.deliverables,
        icon: payload.icon,
        image: payload.image,
        active: payload.active
      };
      const { error: legacyErr } = await client.from('services').upsert(legacyPayload);
      if (legacyErr) console.error('Error syncing service:', legacyErr.message);
    } else {
      console.error('Error syncing service:', error.message);
    }
  }
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
