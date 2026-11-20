import React, { useState, useEffect } from 'react';
import TitleBar from './components/layout/TitleBar';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import OverviewDashboard from './components/dashboard/OverviewDashboard';
import TicketManagement from './components/tickets/TicketManagement';
import TicketDetailModal from './components/tickets/TicketDetailModal';
import CreateTicketModal from './components/tickets/CreateTicketModal';
import CmsManagement from './components/cms/CmsManagement';
import TeamManagement from './components/team/TeamManagement';
import SettingsView from './components/settings/SettingsView';
import EmployeePortal from './components/employee/EmployeePortal';
import KbArticleModal from './components/kb/KbArticleModal';
import QuickSearchModal from './components/common/QuickSearchModal';
import NotificationToast from './components/common/NotificationToast';
import ConfirmDialog from './components/common/ConfirmDialog';
import LoginScreen from './components/auth/LoginScreen';

import {
  initialMetrics,
  initialTickets,
  initialCmsPages,
  initialBanners,
  initialArticles,
  initialMedia,
  initialTeam,
  initialKbArticles,
  navigationLinks as initialNavLinks,
  initialServices,
  initialCareers,
  initialTrustedPartners
} from './data/mockData';

import { isSupabaseConfigured } from './lib/supabaseClient';
import { broadcastIncidentEvent, subscribeToIncidentBus } from './utils/realtimeBus';
import {
  fetchTicketsFromSupabase,
  syncTicketToSupabase,
  deleteTicketFromSupabase,
  updateTicketUnreadStatusInSupabase,
  subscribeToTicketsRealtime,
  fetchServicesFromSupabase,
  syncServiceToSupabase,
  deleteServiceFromSupabase,
  fetchCareersFromSupabase,
  syncCareerToSupabase,
  deleteCareerFromSupabase,
  fetchPartnersFromSupabase,
  syncPartnerToSupabase,
  deletePartnerFromSupabase,
  fetchTeamMembersFromSupabase,
  syncTeamMemberToSupabase,
  deleteTeamMemberFromSupabase
} from './services/supabaseService';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('abc_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isITDept = (user) => {
    if (!user) return false;
    const d = (user.department || '').toLowerCase().trim();
    const r = (user.role || '').toLowerCase().trim();
    return (
      user.role === 'admin' ||
      d === 'it' ||
      d === 'it department' ||
      d.includes('it department') ||
      d.startsWith('it') ||
      r.includes('it') ||
      r.includes('admin') ||
      r === 'it_support'
    );
  };

  const [activeTab, setActiveTab] = useState(() => {
    return currentUser?.role === 'employee' && !isITDept(currentUser) ? 'portal' : 'dashboard';
  });

  const [cmsSubTab, setCmsSubTab] = useState('services');
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('abc_theme');
      return saved || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Core Data States
  const [metrics, setMetrics] = useState(initialMetrics);
  const [tickets, setTickets] = useState(initialTickets);
  const [services, setServices] = useState(initialServices);
  const [careers, setCareers] = useState(initialCareers);
  const [trustedPartners, setTrustedPartners] = useState(initialTrustedPartners);
  const [cmsPages, setCmsPages] = useState(initialCmsPages);
  const [banners, setBanners] = useState(initialBanners);
  const [articles, setArticles] = useState(initialArticles);
  const [media, setMedia] = useState(initialMedia);
  const [teamMembers, setTeamMembers] = useState(initialTeam);
  const [kbArticles, setKbArticles] = useState(initialKbArticles);
  const [navigationLinks, setNavigationLinks] = useState(initialNavLinks);

  // Modals & Popovers
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedKbArticle, setSelectedKbArticle] = useState(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Sync theme with HTML class & localStorage
  useEffect(() => {
    try {
      localStorage.setItem('abc_theme', theme);
    } catch { }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Ensure non-employee accounts (Admin & IT Support / IT Department) cannot stay on or navigate to employee portal
  useEffect(() => {
    if (currentUser && (currentUser.role !== 'employee' || isITDept(currentUser)) && activeTab === 'portal') {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

  // Track Supabase configuration version
  const [supabaseVersion, setSupabaseVersion] = useState(0);
  const [isRefreshingTickets, setIsRefreshingTickets] = useState(false);

  useEffect(() => {
    const handleConfigChange = () => setSupabaseVersion((v) => v + 1);
    window.addEventListener('abc_supabase_config_changed', handleConfigChange);
    window.addEventListener('storage', handleConfigChange);
    return () => {
      window.removeEventListener('abc_supabase_config_changed', handleConfigChange);
      window.removeEventListener('storage', handleConfigChange);
    };
  }, []);

  // Cross-tab / cross-window instant Realtime bus listener
  useEffect(() => {
    const unsubscribeBus = subscribeToIncidentBus((event) => {
      if (!event || !event.type) return;
      if (event.type === 'TICKET_INSERT' && event.data) {
        setTickets((prev) => {
          if (prev.some((t) => t.id === event.data.id)) return prev;
          return [event.data, ...prev];
        });
      } else if (event.type === 'TICKET_UPDATE' && event.data) {
        setTickets((prev) =>
          prev.map((t) => (t.id === event.data.id ? { ...t, ...event.data } : t))
        );
        setSelectedTicket((current) =>
          current && current.id === event.data.id ? { ...current, ...event.data } : current
        );
      } else if (event.type === 'TICKET_DELETE' && event.data) {
        setTickets((prev) => prev.filter((t) => t.id !== event.data));
        setSelectedTicket((current) => (current && current.id === event.data ? null : current));
      }
    });

    return () => {
      if (unsubscribeBus) unsubscribeBus();
    };
  }, []);

  // Main load from Supabase and Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const loadSupabaseData = async () => {
      try {
        const [remoteTickets, remoteServices, remoteCareers, remotePartners, remoteTeam] = await Promise.all([
          fetchTicketsFromSupabase(),
          fetchServicesFromSupabase(),
          fetchCareersFromSupabase(),
          fetchPartnersFromSupabase(),
          fetchTeamMembersFromSupabase()
        ]);

        if (remoteTickets && remoteTickets.length > 0) setTickets(remoteTickets);
        if (remoteServices && remoteServices.length > 0) setServices(remoteServices);
        if (remoteCareers && remoteCareers.length > 0) setCareers(remoteCareers);
        if (remotePartners && remotePartners.length > 0) setTrustedPartners(remotePartners);
        if (remoteTeam && remoteTeam.length > 0) setTeamMembers(remoteTeam);

        showToast({
          type: 'success',
          title: 'Supabase Cloud Synchronized',
          message: 'Connected to live Supabase PostgreSQL database.'
        });
      } catch (err) {
        console.warn('Could not load data from Supabase:', err);
      }
    };

    loadSupabaseData();

    // Subscribe to live Realtime updates from Supabase
    const unsubscribe = subscribeToTicketsRealtime({
      onInsert: (newTicket) => {
        setTickets((prev) => {
          if (prev.some((t) => t.id === newTicket.id)) return prev;
          return [newTicket, ...prev];
        });
      },
      onUpdate: (updatedTicket) => {
        setTickets((prev) =>
          prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
        );
        setSelectedTicket((current) =>
          current && current.id === updatedTicket.id ? { ...current, ...updatedTicket } : current
        );
      },
      onDelete: (deletedId) => {
        setTickets((prev) => prev.filter((t) => t.id !== deletedId));
        setSelectedTicket((current) => (current && current.id === deletedId ? null : current));
      }
    });

    // Background interval sync every 8 seconds as resilient fallback
    const interval = setInterval(async () => {
      try {
        const remote = await fetchTicketsFromSupabase();
        if (remote && Array.isArray(remote) && remote.length > 0) {
          setTickets((prev) => {
            const remoteMap = new Map(remote.map((r) => [r.id, r]));
            let changed = false;
            const updated = prev.map((local) => {
              const r = remoteMap.get(local.id);
              if (r) {
                remoteMap.delete(local.id);
                const localLen = (local.timeline || local.replies || []).length;
                const remoteLen = (r.timeline || r.replies || []).length;
                if (localLen !== remoteLen || local.status !== r.status || local.updated_at !== r.updated_at || local.isUnread !== r.isUnread) {
                  changed = true;
                  return { ...local, ...r };
                }
                return local;
              }
              return local;
            });
            if (remoteMap.size > 0) {
              changed = true;
              return [...remoteMap.values(), ...updated];
            }
            return changed ? updated : prev;
          });
        }
      } catch { }
    }, 8000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [supabaseVersion]);

  const handleRefreshTickets = async () => {
    setIsRefreshingTickets(true);
    try {
      if (isSupabaseConfigured()) {
        const remote = await fetchTicketsFromSupabase();
        if (remote && remote.length > 0) {
          setTickets(remote);
          showToast({ type: 'success', message: 'Incidents synchronized with Supabase.' });
        } else {
          showToast({ type: 'info', message: 'Incidents up to date.' });
        }
      } else {
        showToast({ type: 'info', message: 'Operating in local realtime mode.' });
      }
    } catch (e) {
      showToast({ type: 'error', message: 'Sync failed: ' + e.message });
    } finally {
      setIsRefreshingTickets(false);
    }
  };

  const showToast = (toastData) => {
    const payload = typeof toastData === 'object' ? toastData : { message: toastData };
    setToast(payload);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Auth Handlers
  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('abc_current_user', JSON.stringify(user));
    } catch { }

    // Auto-navigate to appropriate home tab based on role
    if (user.role === 'employee') {
      setActiveTab('portal');
    } else if (user.role === 'cms_editor') {
      setActiveTab('cms');
    } else {
      setActiveTab('dashboard');
    }

    showToast({
      type: 'success',
      icon: 'login',
      title: 'Sign In Successful',
      message: `Welcome back, ${user.name}! Connected to Al Bazzam Group IT Systems as ${user.roleTitle || user.role}.`
    });
  };

  const handleLogout = () => {
    setIsLogoutConfirmOpen(false);
    try {
      localStorage.removeItem('abc_current_user');
    } catch { }
    setCurrentUser(null);
    showToast({
      type: 'warning',
      icon: 'logout',
      title: 'Signed Out Successfully',
      message: 'You have been safely signed out of the corporate IT workspace.'
    });
  };

  // Ticket Handlers
  const handleToggleReadTicket = (ticketId, forcedStatus) => {
    let targetNextStatus = false;
    setTickets((prev) => {
      const updated = prev.map((t) => {
        if (t.id === ticketId) {
          targetNextStatus = forcedStatus !== undefined ? Boolean(forcedStatus) : !t.isUnread;
          return { ...t, isUnread: targetNextStatus, unread: targetNextStatus };
        }
        return t;
      });

      // 1. Immediately cache to localStorage so it survives page reloads
      try {
        const cached = JSON.parse(localStorage.getItem('abc_unread_tickets') || '{}');
        cached[ticketId] = targetNextStatus;
        localStorage.setItem('abc_unread_tickets', JSON.stringify(cached));
      } catch (e) {
        console.warn('Could not cache unread state:', e);
      }

      // 2. Persist to Supabase database
      updateTicketUnreadStatusInSupabase(ticketId, targetNextStatus);

      const targetTicket = updated.find((t) => t.id === ticketId);
      if (targetTicket) {
        broadcastIncidentEvent('TICKET_UPDATE', targetTicket);
      }

      return updated;
    });
  };

  const handleSelectTicket = (ticket) => {
    const latest = tickets.find((t) => t.id === ticket.id) || ticket;
    setSelectedTicket(latest);
    if (latest.isUnread) {
      handleToggleReadTicket(latest.id, false);
    }
  };

  const handleCreateTicket = (formData) => {
    const newId = `TICK-${1040 + tickets.length + 1}`;
    const matchedAssignee = teamMembers.find((m) => m.name === formData.assigneeName);
    const newTicket = {
      id: newId,
      subject: formData.subject,
      requester: {
        name: formData.requesterName,
        email: formData.requesterEmail,
        department: formData.department,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      },
      category: formData.category,
      priority: formData.priority,
      status: 'Open',
      assigned_to: formData.assigneeName || '',
      assignee: formData.assigneeName
        ? {
          name: formData.assigneeName,
          email: matchedAssignee?.email || 'support@albazzam.com',
          avatar: matchedAssignee?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces',
        }
        : {
          name: 'IT Support Team',
          email: 'support@albazzam.com',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces',
        },
      createdAt: new Date().toLocaleDateString(),
      updatedAt: 'Just now',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slaDue: formData.priority === 'Urgent' ? 'in 58 mins' : 'in 4 hours',
      tags: formData.tags || [],
      description: formData.description,
      attachments: formData.attachments || [],
      timeline: [
        {
          id: Date.now(),
          author: formData.requesterName,
          role: 'Requester',
          type: 'message',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
          content: formData.description,
        }
      ]
    };

    setTickets([newTicket, ...tickets]);
    syncTicketToSupabase(newTicket);
    broadcastIncidentEvent('TICKET_INSERT', newTicket);
    setMetrics((prev) => ({
      ...prev,
      activeTickets: prev.activeTickets + 1,
      unassignedTickets: prev.unassignedTickets + 1,
    }));
    showToast(`Ticket ${newId} submitted to IT Helpdesk! An agent will review shortly.`);
  };

  const handleAddReply = (ticketId, reply) => {
    const isAlexStatic = !reply.author || reply.author.includes('Alex Rivera') || reply.author.includes('Alex Rivers');
    const dynamicAuthor = isAlexStatic
      ? (currentUser?.name
          ? (currentUser.role === 'admin' || currentUser.role === 'it_support' || isITDept(currentUser)
              ? `${currentUser.name} (${currentUser.department || 'IT Support'})`
              : currentUser.name)
          : 'IT Support Specialist')
      : reply.author;

    const dynamicRole = isAlexStatic
      ? (currentUser?.role === 'employee' && !isITDept(currentUser) ? 'Requester' : (currentUser?.role || 'Support Engineer'))
      : (reply.role || 'Support Engineer');

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const newMsg = {
          ...reply,
          author: dynamicAuthor,
          role: dynamicRole,
          id: reply.id || Date.now(),
          timestamp: reply.timestamp || new Date().toISOString(),
          time: reply.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const nextTimeline = [...(t.timeline || t.replies || []), newMsg];
        return {
          ...t,
          updatedAt: 'Just now',
          updated_at: new Date().toISOString(),
          timeline: nextTimeline,
          replies: nextTimeline,
          conversation: nextTimeline
        };
      }
      return t;
    });

    setTickets(updated);
    const updatedTicket = updated.find((t) => t.id === ticketId);
    if (updatedTicket) {
      syncTicketToSupabase(updatedTicket);
      broadcastIncidentEvent('TICKET_UPDATE', updatedTicket);
    }
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(updatedTicket);
    }
    showToast(reply.isInternal ? 'Internal staff note saved.' : 'Message sent successfully.');
  };

  const handleEditReply = (ticketId, replyId, updatedContent) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const updateReplies = (list) =>
          (list || []).map((msg) =>
            msg.id === replyId
              ? { ...msg, content: updatedContent, edited: true, editedAt: new Date().toISOString() }
              : msg
          );
        const nextTimeline = updateReplies(t.timeline || t.replies || t.conversation);
        return {
          ...t,
          updated_at: new Date().toISOString(),
          updatedAt: 'Just now',
          timeline: nextTimeline,
          replies: nextTimeline,
          conversation: nextTimeline,
        };
      }
      return t;
    });

    setTickets(updated);
    const updatedTicket = updated.find((t) => t.id === ticketId);
    if (updatedTicket) {
      syncTicketToSupabase(updatedTicket);
      broadcastIncidentEvent('TICKET_UPDATE', updatedTicket);
    }
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(updatedTicket);
    }
    showToast('Note / response updated.');
  };

  const handleDeleteReply = (ticketId, replyId) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const filterReplies = (list) =>
          (list || []).filter((msg) => msg.id !== replyId);
        const nextTimeline = filterReplies(t.timeline || t.replies || t.conversation);
        return {
          ...t,
          updated_at: new Date().toISOString(),
          updatedAt: 'Just now',
          timeline: nextTimeline,
          replies: nextTimeline,
          conversation: nextTimeline,
        };
      }
      return t;
    });

    setTickets(updated);
    const updatedTicket = updated.find((t) => t.id === ticketId);
    if (updatedTicket) {
      syncTicketToSupabase(updatedTicket);
      broadcastIncidentEvent('TICKET_UPDATE', updatedTicket);
    }
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(updatedTicket);
    }
    showToast('Note / response deleted.');
  };

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return { ...t, status: newStatus, updatedAt: 'Just now' };
      }
      return t;
    });
    setTickets(updated);
    const updatedTicket = updated.find((t) => t.id === ticketId);
    if (updatedTicket) {
      syncTicketToSupabase(updatedTicket);
      broadcastIncidentEvent('TICKET_UPDATE', updatedTicket);
    }
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    showToast(`Ticket ${ticketId} status updated to "${newStatus}"`);
  };

  const handleUpdateTicketPriority = (ticketId, newPriority) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return { ...t, priority: newPriority, updatedAt: 'Just now' };
      }
      return t;
    });
    setTickets(updated);
    const updatedTicket = updated.find((t) => t.id === ticketId);
    if (updatedTicket) {
      syncTicketToSupabase(updatedTicket);
      broadcastIncidentEvent('TICKET_UPDATE', updatedTicket);
    }
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, priority: newPriority });
    }
    showToast(`Ticket ${ticketId} priority set to "${newPriority}"`);
  };

  const handleUpdateTicketAssignee = (ticketId, memberName) => {
    const member = teamMembers.find((m) => m.name === memberName);
    if (!member) return;

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignee: {
            name: member.name,
            email: member.email,
            avatar: member.avatar,
          },
          updatedAt: 'Just now',
        };
      }
      return t;
    });
    setTickets(updated);
    const updatedTicket = updated.find((t) => t.id === ticketId);
    if (updatedTicket) {
      syncTicketToSupabase(updatedTicket);
      broadcastIncidentEvent('TICKET_UPDATE', updatedTicket);
    }
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(updatedTicket);
    }
    showToast(`Ticket reassigned to ${memberName}`);
  };

  const handleAddAttachment = (ticketId, attachment) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const existing = t.attachments || [];
        return {
          ...t,
          attachments: [...existing, attachment],
          updatedAt: 'Just now'
        };
      }
      return t;
    });
    setTickets(updated);
    const updatedTicket = updated.find((t) => t.id === ticketId);
    if (updatedTicket) {
      syncTicketToSupabase(updatedTicket);
      broadcastIncidentEvent('TICKET_UPDATE', updatedTicket);
    }
    showToast(`Attached file "${attachment.name}" to ticket ${ticketId}`);
  };

  const handleEditTicket = (updatedTicket) => {
    const updated = tickets.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket, updatedAt: 'Just now' } : t));
    setTickets(updated);
    syncTicketToSupabase({ ...updatedTicket, updatedAt: new Date().toISOString() });
    broadcastIncidentEvent('TICKET_UPDATE', updatedTicket);
    if (selectedTicket && selectedTicket.id === updatedTicket.id) {
      setSelectedTicket({ ...selectedTicket, ...updatedTicket });
    }
    showToast(`Incident ${updatedTicket.id} updated successfully.`);
  };

  const handleDeleteTicket = (ticketId) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    deleteTicketFromSupabase(ticketId);
    broadcastIncidentEvent('TICKET_DELETE', ticketId);
    try {
      const cached = JSON.parse(localStorage.getItem('abc_unread_tickets') || '{}');
      if (ticketId in cached) {
        delete cached[ticketId];
        localStorage.setItem('abc_unread_tickets', JSON.stringify(cached));
      }
    } catch { }
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(null);
    }
    setMetrics((prev) => ({
      ...prev,
      activeTickets: Math.max(0, prev.activeTickets - 1)
    }));
    showToast({
      type: 'info',
      title: 'Incident Deleted',
      message: `Incident ${ticketId} has been permanently deleted.`
    });
  };

  // CMS Services Handlers
  const handleAddService = (newService) => {
    setServices([newService, ...services]);
    syncServiceToSupabase(newService);
    showToast(`Service "${newService.title}" created successfully.`);
  };

  const handleUpdateService = (updatedService) => {
    setServices(services.map((s) => (s.id === updatedService.id ? updatedService : s)));
    syncServiceToSupabase(updatedService);
    showToast(`Service "${updatedService.title}" updated.`);
  };

  const handleDeleteService = (serviceId) => {
    setServices(services.filter((s) => s.id !== serviceId));
    deleteServiceFromSupabase(serviceId);
    showToast('Service removed.');
  };

  // CMS Careers Handlers
  const handleAddCareer = (newJob) => {
    setCareers([newJob, ...careers]);
    syncCareerToSupabase(newJob);
    showToast(`Career opening "${newJob.title}" posted.`);
  };

  const handleUpdateCareer = (updatedJob) => {
    setCareers(careers.map((c) => (c.id === updatedJob.id ? updatedJob : c)));
    syncCareerToSupabase(updatedJob);
    showToast(`Career opening "${updatedJob.title}" updated.`);
  };

  const handleDeleteCareer = (jobId) => {
    setCareers(careers.filter((c) => c.id !== jobId));
    deleteCareerFromSupabase(jobId);
    showToast('Career opening deleted.');
  };

  // CMS Trusted Partners Handlers
  const handleAddPartner = (newPartner) => {
    setTrustedPartners([newPartner, ...trustedPartners]);
    syncPartnerToSupabase(newPartner);
    showToast(`Partner "${newPartner.name}" added.`);
  };

  const handleUpdatePartner = (updatedPartner) => {
    setTrustedPartners(trustedPartners.map((p) => (p.id === updatedPartner.id ? updatedPartner : p)));
    syncPartnerToSupabase(updatedPartner);
    showToast(`Partner "${updatedPartner.name}" updated.`);
  };

  const handleDeletePartner = (partnerId) => {
    setTrustedPartners(trustedPartners.filter((p) => p.id !== partnerId));
    deletePartnerFromSupabase(partnerId);
    showToast('Partner removed.');
  };

  // Legacy CMS Handlers
  const handleTogglePublishPage = (pageId) => {
    const updated = cmsPages.map((p) => {
      if (p.id === pageId) {
        const nextStatus = p.status === 'Published' ? 'Draft' : 'Published';
        return { ...p, status: nextStatus, lastModified: 'Just now' };
      }
      return p;
    });
    setCmsPages(updated);
    showToast('Page status updated.');
  };

  const handleAddPage = (newPage) => {
    const pageWithId = { ...newPage, id: `page-${Date.now()}` };
    setCmsPages([...cmsPages, pageWithId]);
    showToast(`Created page "${newPage.title}"`);
  };

  const handleSaveArticle = (artData) => {
    if (artData.id) {
      const updated = articles.map((a) => (a.id === artData.id ? artData : a));
      setArticles(updated);
      showToast(`Saved changes to "${artData.title}"`);
    } else {
      const newArticle = { ...artData, id: `art-${Date.now()}` };
      setArticles([newArticle, ...articles]);
      showToast(`Published article "${newArticle.title}"`);
    }
  };

  const handleDeleteArticle = (id) => {
    setArticles(articles.filter((a) => a.id !== id));
    showToast('Article deleted.');
  };

  const handleToggleStatusBanner = (id) => {
    const updated = banners.map((b) => {
      if (b.id === id) {
        return { ...b, status: b.status === 'Active' ? 'Draft' : 'Active' };
      }
      return b;
    });
    setBanners(updated);
    showToast('Banner status updated.');
  };

  const handleAddBanner = (newBan) => {
    setBanners([{ ...newBan, id: `ban-${Date.now()}` }, ...banners]);
    showToast(`Created banner "${newBan.headline}"`);
  };

  const handleDeleteBanner = (id) => {
    setBanners(banners.filter((b) => b.id !== id));
    showToast('Banner deleted.');
  };

  const handleUploadMedia = (newAsset) => {
    setMedia([newAsset, ...media]);
    showToast(`Asset "${newAsset.name}" uploaded to CDN.`);
  };

  const handleDeleteMedia = (id) => {
    setMedia(media.filter((m) => m.id !== id));
    showToast('Media asset removed.');
  };

  const handleCopyMediaUrl = (url) => {
    navigator.clipboard?.writeText(url);
    showToast('CDN Asset URL copied to clipboard.');
  };

  const handleAddTeamMember = (member) => {
    setTeamMembers([...teamMembers, member]);
    syncTeamMemberToSupabase(member);
    showToast(`Staff member "${member.name}" added to directory.`);
  };

  const handleUpdateTeamMember = (updatedMember) => {
    setTeamMembers(teamMembers.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    syncTeamMemberToSupabase(updatedMember);
    showToast(`Updated details for "${updatedMember.name}".`);
  };

  const handleDeleteTeamMember = (memberId) => {
    const member = teamMembers.find((m) => m.id === memberId);
    setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
    deleteTeamMemberFromSupabase(memberId);
    showToast(`Removed "${member ? member.name : 'staff member'}" from directory.`);
  };

  const handleDeployWebsite = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      showToast('Website production deployment complete! CloudFront CDN purged.');
      setMetrics((prev) => ({
        ...prev,
        lastWebsiteDeploy: 'Just now (v3.8.3)',
      }));
    }, 2500);
  };

  // If not logged in, show Login Screen with Toast Notification Bar
  if (!currentUser) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} teamMembers={teamMembers} />
        <NotificationToast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // Filter tickets:
  // Admin and IT Support triage staff can view all organizational tickets.
  // Standard employees strictly and exclusively see only tickets they requested.
  const isQueueStaff = currentUser?.role === 'admin' || currentUser?.role === 'it_support' || isITDept(currentUser);

  const userTickets = !isQueueStaff
    ? tickets.filter((t) => {
      if (!t) return false;
      const userEmail = (currentUser?.email || '').trim().toLowerCase();
      const userName = (currentUser?.name || '').trim().toLowerCase();

      let reqEmail = '';
      let reqName = '';

      if (typeof t.requester === 'object' && t.requester !== null) {
        reqEmail = (t.requester.email || '').trim().toLowerCase();
        reqName = (t.requester.name || '').trim().toLowerCase();
      } else if (typeof t.requester === 'string') {
        if (t.requester.includes('@')) {
          reqEmail = t.requester.trim().toLowerCase();
        } else {
          reqName = t.requester.trim().toLowerCase();
        }
      }

      const emailMatches = Boolean(userEmail && reqEmail && userEmail === reqEmail);
      const nameMatches = Boolean(userName && reqName && userName === reqName);

      return emailMatches || nameMatches;
    })
    : tickets;

  const urgentTicketCount = userTickets.filter(
    (t) => t.priority === 'Urgent' && t.status !== 'Resolved'
  ).length;

  return (
    <div className="h-screen w-screen flex flex-row bg-slate-100 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 overflow-hidden font-sans select-none">
      {/* 1. Complete Height Sidebar (Standard Professional Format) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cmsSubTab={cmsSubTab}
        setCmsSubTab={setCmsSubTab}
        ticketCount={userTickets.filter((t) => t.status !== 'Resolved').length}
        urgentTicketCount={urgentTicketCount}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onLogout={() => setIsLogoutConfirmOpen(true)}
      />

      {/* 2. Main Workstation Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-slate-50 dark:bg-neutral-950">
        {/* Desktop TitleBar (Only shown if running in desktop Electron app, returns null in browser) */}
        <TitleBar />

        {/* Header */}
        <Header
          activeTab={activeTab}
          onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
          onOpenCreateArticle={() => {
            setActiveTab('cms');
            setCmsSubTab('articles');
          }}
          onDeployWebsite={handleDeployWebsite}
          isDeploying={isDeploying}
          notificationCount={urgentTicketCount}
          currentUser={currentUser}
          onLogout={() => setIsLogoutConfirmOpen(true)}
          onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        />

        {/* View Container */}
        <main className="flex-1 overflow-hidden relative">
          {/* Employee Self-Service Portal View (Accessible by non-IT Employee only) */}
          {activeTab === 'portal' && currentUser.role === 'employee' && !isITDept(currentUser) && (
            <EmployeePortal
              currentUser={currentUser}
              myTickets={userTickets}
              kbArticles={kbArticles}
              onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
              onSelectTicket={handleSelectTicket}
              onOpenArticle={(art) => setSelectedKbArticle(art)}
            />
          )}

          {/* IT Support Tickets View (Accessible by Admin, IT Support, and Employee for their tickets) */}
          {activeTab === 'tickets' && (
            <TicketManagement
              tickets={userTickets}
              currentUser={currentUser}
              onSelectTicket={handleSelectTicket}
              onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onEditTicket={handleEditTicket}
              onDeleteTicket={handleDeleteTicket}
              teamMembers={teamMembers}
              currentUserRole={isQueueStaff ? 'support' : 'employee'}
              onAddReply={handleAddReply}
              onEditReply={handleEditReply}
              onDeleteReply={handleDeleteReply}
              onAddAttachment={handleAddAttachment}
              onToggleReadTicket={handleToggleReadTicket}
              onRefreshTickets={handleRefreshTickets}
              isRefreshingTickets={isRefreshingTickets}
            />
          )}

          {/* Overview Dashboard (Accessible by Admin, IT Support, CMS Editor, IT Department) */}
          {activeTab === 'dashboard' && (currentUser.role !== 'employee' || isITDept(currentUser)) && (
            <OverviewDashboard
              metrics={metrics}
              tickets={tickets}
              services={services}
              careers={careers}
              partners={trustedPartners}
              onSelectTicket={handleSelectTicket}
              onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
              onNavigateToTab={(tab, subTab) => {
                setActiveTab(tab);
                if (subTab) setCmsSubTab(subTab);
              }}
            />
          )}

          {/* CMS Management (Accessible by Admin, IT Support, CMS Editor, and IT Department) */}
          {activeTab === 'cms' && (currentUser.role === 'admin' || currentUser.role === 'it_support' || currentUser.role === 'cms_editor' || isITDept(currentUser)) && (
            <CmsManagement
              activeSubTab={cmsSubTab}
              setActiveSubTab={setCmsSubTab}
              services={services}
              onAddService={handleAddService}
              onUpdateService={handleUpdateService}
              onDeleteService={handleDeleteService}
              careers={careers}
              onAddCareer={handleAddCareer}
              onUpdateCareer={handleUpdateCareer}
              onDeleteCareer={handleDeleteCareer}
              partners={trustedPartners}
              onAddPartner={handleAddPartner}
              onUpdatePartner={handleUpdatePartner}
              onDeletePartner={handleDeletePartner}
            />
          )}

          {/* Team Management (Accessible by Admin, IT Support, and IT Department) */}
          {activeTab === 'team' && (currentUser.role === 'admin' || currentUser.role === 'it_support' || isITDept(currentUser)) && (
            <TeamManagement
              teamMembers={teamMembers}
              onAddMember={handleAddTeamMember}
              onUpdateMember={handleUpdateTeamMember}
              onDeleteMember={handleDeleteTeamMember}
            />
          )}

          {/* Settings View (Accessible by Admin and IT Department) */}
          {activeTab === 'settings' && (currentUser.role === 'admin' || isITDept(currentUser)) && (
            <SettingsView
              theme={theme}
              setTheme={setTheme}
              onShowToast={showToast}
            />
          )}


        </main>
      </div>

      {/* 3. Global Overlays & Modals */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          currentUser={currentUser}
          onClose={() => setSelectedTicket(null)}
          onAddReply={handleAddReply}
          onEditReply={handleEditReply}
          onDeleteReply={handleDeleteReply}
          onUpdateStatus={handleUpdateTicketStatus}
          onUpdatePriority={handleUpdateTicketPriority}
          onUpdateAssignee={handleUpdateTicketAssignee}
          onEditTicket={handleEditTicket}
          onDeleteTicket={handleDeleteTicket}
          teamMembers={teamMembers}
          currentUserRole={isQueueStaff ? 'support' : 'employee'}
          onAddAttachment={handleAddAttachment}
        />
      )}

      {selectedKbArticle && (
        <KbArticleModal
          article={selectedKbArticle}
          onClose={() => setSelectedKbArticle(null)}
          onNeedTicket={() => {
            setIsCreateTicketOpen(true);
          }}
        />
      )}

      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onCreateTicket={handleCreateTicket}
        currentUser={currentUser}
        teamMembers={teamMembers}
      />

      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        tickets={userTickets}
        cmsPages={cmsPages}
        articles={articles}
        banners={banners}
        onSelectTicket={handleSelectTicket}
        onNavigateToTab={(tab, subTab) => {
          setActiveTab(tab);
          if (subTab) setCmsSubTab(subTab);
        }}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="Sign Out Confirmation"
        message={`Are you sure you want to end your active session for ${currentUser?.name} (${currentUser?.roleTitle || currentUser?.role}) and sign out of the IT workstation?`}
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        icon="logout"
        variant="warning"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
