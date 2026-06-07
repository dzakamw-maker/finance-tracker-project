import React from 'react';
import { Wallet, Landmark, Plane } from 'lucide-react';

export default function RecordSelector({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'savings', label: 'Tabungan', icon: <Wallet size={18} />, color: 'primary' },
    { id: 'debts', label: 'Utang/Piutang', icon: <Landmark size={18} />, color: 'amber' },
    { id: 'itinerary', label: 'Itinerary', icon: <Plane size={18} />, color: 'purple' },
  ];

  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <label className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: 'var(--text-muted)' }}>
        Pilih Jenis Catatan
      </label>
      <div 
        className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl border backdrop-blur-sm"
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer
              ${activeTab === tab.id 
                ? 'bg-primary-600 text-white shadow-lg scale-[1.02]' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
