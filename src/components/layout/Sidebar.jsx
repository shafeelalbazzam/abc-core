import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  Globe,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LifeBuoy,
  FileText,
  Image,
  Megaphone,
  MenuSquare,
  LogOut,
  SlidersHorizontal,
  Layers,
  Briefcase,
  Handshake
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  cmsSubTab,
  setCmsSubTab,
  ticketCount,
  urgentTicketCount,
  isCollapsed,
  setIsCollapsed,
  theme,
  setTheme,
  currentUser,
  onLogout
}) {
  const role = currentUser?.role || 'employee';

  const getNavSections = () => {
    if (role === 'employee') {
      return [
        {
          heading: 'EMPLOYEE SERVICES',
          items: [
            {
              id: 'portal',
              label: 'Helpdesk & Self-Help',
              icon: LifeBuoy,
              badge: null,
            },
            {
              id: 'tickets',
              label: 'My Service Requests',
              icon: Ticket,
              badge: ticketCount,
              badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
            },
          ]
        }
      ];
    }

    if (role === 'cms_editor') {
      return [
        {
          heading: 'DIGITAL CONTENT',
          items: [
            {
              id: 'cms',
              label: 'Website CMS',
              icon: Globe,
              subItems: [
                { id: 'services', label: 'Services & Solutions', icon: Layers },
                { id: 'careers', label: 'Careers & Openings', icon: Briefcase },
                { id: 'partners', label: 'Trusted Partners', icon: Handshake },
              ]
            },
          ]
        }
      ];
    }

    // Admin & IT Support roles (Both have access to Tickets + CMS)
    return [
      {
        heading: 'OPERATIONS',
        items: [
          {
            id: 'dashboard',
            label: 'Command Center',
            icon: LayoutDashboard,
          },
          {
            id: 'tickets',
            label: 'Incident Triage & Queue',
            icon: Ticket,
            badge: ticketCount,
            badgeClass: urgentTicketCount > 0
              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
          },
        ]
      },
      {
        heading: 'DIGITAL PLATFORMS & CMS',
        items: [
          {
            id: 'cms',
            label: 'Website CMS Studio',
            icon: Globe,
            subItems: [
              { id: 'services', label: 'Services & Solutions', icon: Layers },
              { id: 'careers', label: 'Careers & Openings', icon: Briefcase },
              { id: 'partners', label: 'Trusted Partners', icon: Handshake },
            ]
          },
        ]
      },
      {
        heading: 'ORGANIZATION',
        items: [
          ...(role === 'admin' || role === 'it_support'
            ? [
              {
                id: 'team',
                label: 'Staff Directory',
                icon: Users,
              },
            ]
            : []),
          ...(role === 'admin'
            ? [
              {
                id: 'settings',
                label: 'System Settings',
                icon: Settings,
              },
            ]
            : []),
        ]
      }
    ];
  };

  const sections = getNavSections();

  return (
    <aside
      className={`h-full bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shrink-0 select-none transition-all duration-200 ${isCollapsed ? 'w-16' : 'w-64'
        }`}
    >
      {/* 1. Constant Top Brand Logo Header (Fixed & Never Scrolls) */}
      <div className="shrink-0 px-3 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center flex-1 min-w-0 py-1">
              <img
                src="./logo.png"
                alt="Al Bazzam Group IT & Enterprise Systems"
                className="h-13 w-auto max-w-[195px] object-contain block dark:hidden"
              />
              <img
                src="./logo-dark.png"
                alt="Al Bazzam Group IT & Enterprise Systems"
                className="h-13 w-auto max-w-[195px] object-contain hidden dark:block"
              />
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center p-0.5">
              <img
                src="./logo.png"
                alt="Al Bazzam"
                className="w-10 h-10 object-contain block dark:hidden"
              />
              <img
                src="./logo-dark.png"
                alt="Al Bazzam"
                className="w-10 h-10 object-contain hidden dark:block"
              />
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Scrollable Middle Navigation Menu (Only items scroll up/down) */}
      <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5">
        {/* Sectionalized Links */}
        <div className="space-y-5">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2 pb-1.5 text-[11px] font-mono font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                  {section.heading}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 relative ${isActive
                        ? 'bg-emerald-50 dark:bg-neutral-800 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs border border-emerald-200/50 dark:border-emerald-500/20'
                        : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'}`} />

                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.badge !== undefined && item.badge !== null && (
                            <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${item.badgeClass || 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r"></span>
                      )}
                    </button>

                    {/* Sub-items */}
                    {item.subItems && isActive && !isCollapsed && (
                      <div className="ml-6 pl-2.5 border-l border-neutral-200 dark:border-neutral-800 space-y-1 py-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = cmsSubTab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setCmsSubTab(sub.id)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${isSubActive
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-neutral-800 font-semibold border border-emerald-200/50 dark:border-emerald-500/20'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                            >
                              <span>{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile & Utilities */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950 space-y-2.5">
        {/* Theme Toggle Button Switch (ON = Dark, OFF = Light) */}
        {!isCollapsed ? (
          <div
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors select-none group"
            role="button"
            tabIndex={0}
            title={theme === 'dark' ? 'Dark Mode is ON (Click to turn OFF / switch to Light)' : 'Dark Mode is OFF (Click to turn ON / switch to Dark)'}
          >
            <div className="flex items-center gap-2">
              {theme != 'dark' ? <Sun className={`w-4 h-4 transition-transform group-hover:scale-110 ${theme === 'dark' ? 'text-emerald-400' : 'text-neutral-400'}`} /> : <Moon className={`w-4 h-4 transition-transform group-hover:scale-110 ${theme === 'dark' ? 'text-emerald-400' : 'text-neutral-400'}`} />}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>

              </div>
            </div>

            {/* Toggle Switch Button Track & Sliding Thumb (ON = Dark, OFF = Light) */}
            <div
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out flex items-center justify-center ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-2.5 h-2.5 text-emerald-700" />
                ) : (
                  <Sun className="w-2.5 h-2.5 text-amber-500" />
                )}
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center py-1.5 cursor-pointer select-none group"
            title={theme === 'dark' ? 'Dark Mode: ON' : 'Dark Mode: OFF'}
          >
            {/* Collapsed Toggle Button Switch */}
            <div
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out flex items-center justify-center ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                  }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-2 h-2 text-emerald-700" />
                ) : (
                  <Sun className="w-2 h-2 text-amber-500" />
                )}
              </span>
            </div>
          </div>
        )}

        {/* User Card */}
        <div className={`flex items-center justify-between p-2 rounded-md bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-2xs ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser?.avatar}
              alt=""
              className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700 shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                  {currentUser?.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold block truncate mt-0.5">
                  {currentUser?.roleTitle || currentUser?.role}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onLogout}
              className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
