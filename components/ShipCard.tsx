
import React, { useState } from 'react';
import { Ship } from '../types';

interface ShipCardProps {
  ship: Ship;
  isSelected: boolean;
  onSelect: (ship: Ship) => void;
}

export const ShipCard: React.FC<ShipCardProps> = ({ ship, isSelected, onSelect }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      onClick={() => onSelect(ship)}
      className={`relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border-2 
        ${isSelected ? 'border-blue-500 scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'}`}
    >
      <div className="relative w-full h-32 bg-slate-950 overflow-hidden">
        {ship.image && !imgError ? (
          <img 
            src={ship.image} 
            alt={ship.name} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 to-slate-950">
            <svg className="w-8 h-8 text-blue-900/50 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12M12 12L3 7M12 12l9-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-orbitron text-[9px] text-slate-600 uppercase tracking-widest">{ship.focus} AIRFRAME</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
      </div>
      
      <div className="p-3 bg-slate-900/90 relative">
        <div className="flex justify-between items-start">
          <h3 className="font-orbitron text-xs font-bold text-slate-100 truncate w-3/4 uppercase">{ship.name}</h3>
          <span className="text-[8px] font-orbitron text-blue-500 uppercase tracking-tighter">{ship.manufacturer.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">{ship.focus}</span>
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center rotate-45 border border-blue-400">
          <svg className="w-2.5 h-2.5 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};
