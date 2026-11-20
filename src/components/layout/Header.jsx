import React, { useState } from 'react';
import {
  Bell,
  Plus,
  RefreshCw,
  LogOut,
  ChevronDown,
  Search
} from 'lucide-react';

export default function Header({
  activeTab,
  onOpenCreateTicket,
  onOpenCreateArticle,
  onOpenCreateBanner,
  onDeployWebsite,
  isDeploying,
  notificationCount = 3,
  currentUser,
  onLogout,
  onOpenQuickSearch
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'portal':
        return {
          title: 'Employee IT Helpdesk & Software Self-Help',
          subtitle: 'Report software bugs, request system permissions, VPN, or hardware setup',
        };
      case 'dashboard':
        return {
          title: 'IT Operations Command Center',
          subtitle: 'Centralized telemetry across software microservices, SLA metrics & support queue',
        };
      case 'tickets':
        return {
          title: currentUser?.role === 'employee' && !isITDept(currentUser) ? 'My IT & Software Requests' : 'Incident Triage & Diagnostics',
          subtitle: currentUser?.role === 'employee' && !isITDept(currentUser) ? 'Track live resolution milestones for your requests' : 'Manage software incidents, engineer assignments, and resolution runbooks',
        };
      case 'cms':
        return {
          title: 'Corporate Website CMS Studio',
          subtitle: 'Manage corporate IT services & solutions, career openings, and trusted partners',
        };
      case 'team':
        return {
          title: 'IT Engineering & Staff Directory',
          subtitle: 'Software engineers, DevOps architects, IT support specialists, and security analysts',
        };
      case 'settings':
        return {
          title: 'System & Gateway Configuration',
          subtitle: 'REST endpoints, real-time event sync, and organizational rules',
        };
      case 'facilities':
        return {
          title: 'Staff Facilities & Corporate Space Management',
          subtitle: 'Conference rooms, flexible hot desks, executive shuttle fleet, and facility maintenance',
        };
      default:
        return {
          title: 'Al Bazzam Enterprise Suite',
          subtitle: 'Corporate IT & Software Operations',
        };
    }
  };

  const { title, subtitle } = getHeaderDetails();

  return (
    <div className="h-16 px-6 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 z-30 select-none transition-colors">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block font-mono mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut in Header */}









        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 p-3.5 z-50 text-xs font-mono space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
                <span className="font-bold">SYSTEM ALERTS</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 cursor-pointer font-semibold" onClick={() => setShowNotifications(false)}>
                  Dismiss
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
                  <span className="text-rose-600 dark:text-rose-400 font-bold block mb-0.5">TICK-1042 Urgent</span>
                  <span className="text-neutral-600 dark:text-neutral-400 text-xs">VPN timeout on APAC Gateway cluster.</span>
                </div>
                <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">CDN Sync Complete</span>
                  <span className="text-neutral-600 dark:text-neutral-400 text-xs">CloudFront edge cache purged at 08:30 AM.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        {currentUser && (
          <div className="relative pl-2.5 border-l border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
              />
              <div className="hidden md:block text-left text-xs leading-none">
                <span className="font-bold text-neutral-900 dark:text-white block truncate max-w-[130px]">
                  {currentUser.name}
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold block mt-1">
                  {currentUser.role === 'admin'
                    ? 'Super Admin'
                    : isITDept(currentUser) || currentUser.role === 'it_support'
                      ? 'IT Department (Full Access)'
                      : currentUser.role === 'cms_editor'
                        ? 'CMS Editor'
                        : 'Employee'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 p-3 z-50 text-xs font-mono space-y-2.5">
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-200 dark:border-neutral-800">
                  <span className="font-bold text-neutral-900 dark:text-white block truncate">{currentUser.name}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 block truncate mt-0.5">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
