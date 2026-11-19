import React from 'react';
import {
  Layers,
  Briefcase,
  Handshake,
  Globe
} from 'lucide-react';
import ServicesTab from './ServicesTab';
import CareersTab from './CareersTab';
import PartnersTab from './PartnersTab';

export default function CmsManagement({
  activeSubTab = 'services',
  setActiveSubTab,
  // Services
  services = [],
  onAddService,
  onUpdateService,
  onDeleteService,
  // Careers
  careers = [],
  onAddCareer,
  onUpdateCareer,
  onDeleteCareer,
  // Partners
  partners = [],
  onAddPartner,
  onUpdatePartner,
  onDeletePartner,
}) {
  const subTabs = [
    { id: 'services', label: 'Services & Solutions', count: services.length, icon: Layers },
    { id: 'careers', label: 'Careers & Openings', count: careers.length, icon: Briefcase },
    { id: 'partners', label: 'Trusted Partners', count: partners.length, icon: Handshake },
  ];

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full text-neutral-900 dark:text-neutral-200 transition-colors">
      {/* Studio Header & Sub-Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-mono transition-colors whitespace-nowrap ${isActive
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-emerald-400 font-bold border border-neutral-300 dark:border-neutral-700 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-mono ${isActive
                    ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                    : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>


      </div>

      {/* Active Tab View */}
      {activeSubTab === 'services' && (
        <ServicesTab
          services={services}
          onAddService={onAddService}
          onUpdateService={onUpdateService}
          onDeleteService={onDeleteService}
        />
      )}

      {activeSubTab === 'careers' && (
        <CareersTab
          careers={careers}
          onAddCareer={onAddCareer}
          onUpdateCareer={onUpdateCareer}
          onDeleteCareer={onDeleteCareer}
        />
      )}

      {activeSubTab === 'partners' && (
        <PartnersTab
          partners={partners}
          onAddPartner={onAddPartner}
          onUpdatePartner={onUpdatePartner}
          onDeletePartner={onDeletePartner}
        />
      )}
    </div>
  );
}
