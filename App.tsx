
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Ship, LoadoutBuild, OptimizationPriority } from './types';
import { SHIPS, STANTON_NODES } from './constants';
import { ShipCard } from './components/ShipCard';
import { MapVisualizer } from './components/MapVisualizer';
import { getBuildRecommendation } from './services/geminiService';

const App: React.FC = () => {
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [startLocation, setStartLocation] = useState('Seraphim Station');
  const [locationSearch, setLocationSearch] = useState('');
  const [shipSearch, setShipSearch] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [priority, setPriority] = useState<OptimizationPriority>('shortest');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentBuild, setCurrentBuild] = useState<LoadoutBuild | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  const filteredLocations = useMemo(() => {
    if (!locationSearch) return [];
    const search = locationSearch.toLowerCase();
    return STANTON_NODES.filter(node => 
      node.name.toLowerCase().includes(search) || 
      node.id.toLowerCase().includes(search)
    ).slice(0, 8);
  }, [locationSearch]);

  const filteredShips = useMemo(() => {
    return SHIPS.filter(ship => 
      ship.name.toLowerCase().includes(shipSearch.toLowerCase()) || 
      ship.manufacturer.toLowerCase().includes(shipSearch.toLowerCase()) ||
      ship.focus.toLowerCase().includes(shipSearch.toLowerCase())
    );
  }, [shipSearch]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedShip || !userPrompt.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const build = await getBuildRecommendation(selectedShip.name, userPrompt, startLocation, priority);
      setCurrentBuild(build);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis module offline. Link established but request timed out.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedShip, userPrompt, startLocation, priority]);

  const reset = () => {
    setSelectedShip(null);
    setUserPrompt('');
    setCurrentBuild(null);
    setError(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchingLocation(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200">
      {/* Navigation Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 p-6 border-b md:border-b-0 md:border-r border-slate-800/50 overflow-y-auto max-h-screen sticky top-0 bg-[#020617]/80 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-black text-white uppercase tracking-tighter">
              CitizenForge
            </h1>
            <p className="text-[9px] font-orbitron text-blue-500 uppercase tracking-[0.2em] font-bold">Stanton Architect</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Mission Start Location */}
          <div className="space-y-4 relative" ref={searchRef}>
            <div className="flex justify-between items-center">
              <h2 className="font-orbitron text-[9px] text-slate-500 uppercase tracking-[0.3em]">Operational Start</h2>
              <span className="text-[8px] font-bold text-emerald-500 uppercase">SYS-LINK OK</span>
            </div>
            <div className="relative group">
              <input 
                type="text"
                placeholder={`Fix: ${startLocation}`}
                value={locationSearch}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  setIsSearchingLocation(true);
                }}
                onFocus={() => setIsSearchingLocation(true)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded px-4 py-2.5 text-xs text-slate-200 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 font-orbitron"
              />
              {isSearchingLocation && filteredLocations.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-slate-950 border border-slate-800 rounded shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                  {filteredLocations.map(node => (
                    <button
                      key={node.id}
                      onClick={() => {
                        setStartLocation(node.name);
                        setLocationSearch('');
                        setIsSearchingLocation(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[10px] font-orbitron text-slate-400 hover:bg-blue-600 hover:text-white transition-colors flex justify-between items-center group/item"
                    >
                      <span className="group-hover/item:translate-x-1 transition-transform">{node.name}</span>
                      <span className="text-[7px] opacity-40 uppercase tracking-widest">{node.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logistics Optimization */}
          <div className="space-y-4">
            <h2 className="font-orbitron text-[9px] text-slate-500 uppercase tracking-[0.3em]">Pathfinder Bias</h2>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-1 rounded border border-slate-800/50">
              <button 
                onClick={() => setPriority('shortest')}
                className={`py-2 rounded text-[9px] font-orbitron uppercase tracking-widest transition-all ${priority === 'shortest' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-600 hover:text-slate-400'}`}
              >
                Distance
              </button>
              <button 
                onClick={() => setPriority('cheapest')}
                className={`py-2 rounded text-[9px] font-orbitron uppercase tracking-widest transition-all ${priority === 'cheapest' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-600 hover:text-slate-400'}`}
              >
                Cost
              </button>
            </div>
          </div>

          {/* Fleet Registry */}
          <div className="space-y-4 pt-8 border-t border-slate-800/50">
            <div className="flex justify-between items-center">
              <h2 className="font-orbitron text-[9px] text-slate-500 uppercase tracking-[0.3em]">Fleet Registry</h2>
              <button onClick={reset} className="text-[8px] text-blue-500 hover:text-blue-400 transition-colors uppercase font-bold tracking-widest">Wipe Data</button>
            </div>
            
            <div className="relative">
              <input 
                type="text"
                placeholder="Search airframe..."
                value={shipSearch}
                onChange={(e) => setShipSearch(e.target.value)}
                className="w-full bg-slate-950/30 border border-slate-800/50 rounded px-4 py-2 text-xs text-slate-400 focus:border-blue-500/30 outline-none transition-all placeholder:text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredShips.map((ship) => (
                <ShipCard 
                  key={ship.id} 
                  ship={ship} 
                  isSelected={selectedShip?.id === ship.id} 
                  onSelect={setSelectedShip} 
                />
              ))}
              {filteredShips.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-[10px] font-orbitron text-slate-700 uppercase tracking-widest">No matching registry found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Tactical Analysis Canvas */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
        
        {!selectedShip ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="mb-8 relative">
              <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800 animate-pulse">
                <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-ping" />
            </div>
            <h2 className="font-orbitron text-2xl font-black text-white tracking-widest uppercase mb-4">Architect Module Ready</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md font-light">
              Select an airframe and define your mission profile. CitizenForge utilizes Gemini AI to compute optimal component arrays and logistics routes across the Stanton System.
            </p>
            <div className="mt-12 flex gap-12 border-t border-slate-900 pt-8">
              <div className="text-center">
                <p className="text-blue-500 font-orbitron text-lg">24.5k</p>
                <p className="text-[8px] text-slate-600 uppercase tracking-[0.2em] mt-1 font-bold">Stanton Telemetry</p>
              </div>
              <div className="text-center">
                <p className="text-blue-500 font-orbitron text-lg">Real-Time</p>
                <p className="text-[8px] text-slate-600 uppercase tracking-[0.2em] mt-1 font-bold">Logistics Calculation</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Command Interface */}
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-[10px] font-orbitron text-blue-500 uppercase tracking-[0.5em] mb-2 font-bold">Tactical Interface Layer</h2>
                  <div className="flex items-center gap-6">
                    <h3 className="text-5xl font-orbitron font-black text-white uppercase tracking-tighter">{selectedShip.name}</h3>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="text-left">
                      <p className="text-[8px] font-orbitron text-slate-600 uppercase tracking-widest">Status</p>
                      <p className="text-[10px] font-orbitron text-emerald-500 uppercase font-bold tracking-widest">Calibration Active</p>
                    </div>
                  </div>
                </div>
                <div className="flex bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-lg p-4 gap-12">
                   <div>
                     <p className="text-[8px] font-orbitron text-slate-600 uppercase mb-1">Departure Vector</p>
                     <p className="text-xs font-orbitron text-blue-400 uppercase tracking-widest font-bold">{startLocation}</p>
                   </div>
                   <div>
                     <p className="text-[8px] font-orbitron text-slate-600 uppercase mb-1">Analysis Focus</p>
                     <p className="text-xs font-orbitron text-blue-400 uppercase tracking-widest font-bold">{priority}</p>
                   </div>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Input mission profile and loadout requirements (e.g., 'Best shields for bunker defense' or 'Maximum DPS for PVP dogfighting')"
                  className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-8 text-slate-200 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all resize-none h-40 font-light placeholder:text-slate-800 text-lg leading-relaxed shadow-inner"
                />
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !userPrompt.trim()}
                  className={`absolute bottom-8 right-8 px-12 py-4 rounded-sm font-orbitron text-[10px] uppercase tracking-[0.3em] font-black transition-all
                    ${isAnalyzing || !userPrompt.trim() 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95'}`}
                >
                  {isAnalyzing ? "Processing..." : "Run Simulation"}
                </button>
              </div>
              {error && <p className="text-red-500 text-[10px] font-orbitron text-center uppercase tracking-widest animate-pulse">{error}</p>}
            </section>

            {/* Simulated Data Display */}
            {currentBuild && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                {/* Visual Mapping & Logistics */}
                <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-orbitron text-[10px] text-slate-500 uppercase tracking-[0.3em]">System Telemetry Map</h4>
                      <span className="text-[8px] text-blue-500 font-orbitron uppercase">Vector Layer 4.0</span>
                    </div>
                    <MapVisualizer 
                      route={currentBuild.route} 
                      components={currentBuild.components} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-lg backdrop-blur-sm">
                      <p className="text-[8px] font-orbitron text-slate-600 uppercase mb-2 tracking-widest">Q-Jumps Required</p>
                      <p className="text-3xl font-orbitron text-blue-400 font-black">{currentBuild.totalJumps}</p>
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-lg backdrop-blur-sm">
                      <p className="text-[8px] font-orbitron text-slate-600 uppercase mb-2 tracking-widest">Estimated Travel Time</p>
                      <p className="text-3xl font-orbitron text-blue-400 font-black truncate">{currentBuild.estimatedTravelTime}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/20 border border-slate-800/50 rounded-xl overflow-hidden backdrop-blur-md">
                    <div className="bg-slate-800/30 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                      <h5 className="font-orbitron text-[9px] text-slate-500 uppercase tracking-widest font-black">Flight Sequence</h5>
                    </div>
                    <div className="p-8 space-y-6">
                      {currentBuild.route.map((loc, i) => (
                        <div key={i} className="flex items-center gap-6 group">
                          <div className="relative flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-sm rotate-45 flex items-center justify-center text-[9px] font-black z-10 transition-all duration-500
                              ${i === 0 ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}>
                              <span className="-rotate-45">{i === 0 ? 'O' : i}</span>
                            </div>
                            {i < currentBuild.route.length - 1 && (
                              <div className="w-px h-12 bg-gradient-to-b from-blue-600/50 to-transparent mt-2 mb-2" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200 font-orbitron uppercase tracking-tighter">{loc}</p>
                            <p className="text-[8px] text-slate-600 uppercase tracking-[0.2em] font-bold">
                              {i === 0 ? 'Mission Origin' : `Quantum Junction ${i}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tactical Components Inventory */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                    <h4 className="font-orbitron text-[10px] text-slate-500 uppercase tracking-[0.3em]">Loadout Inventory</h4>
                    <div className="text-right">
                      <p className="text-[8px] font-orbitron text-slate-600 uppercase mb-1">Total Build Investment</p>
                      <p className="text-2xl font-orbitron text-blue-500 font-black tracking-tighter">
                        {currentBuild.totalCost.toLocaleString()} <span className="text-xs text-slate-600">UEC</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {currentBuild.components.map((comp, idx) => (
                      <div key={idx} className="bg-slate-900/40 border border-slate-800/80 rounded p-6 hover:border-blue-900 transition-all group relative overflow-hidden backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] px-2 py-1 bg-blue-600/10 rounded border border-blue-600/20 font-orbitron">
                            {comp.type}
                          </span>
                          <span className="text-[10px] font-orbitron text-slate-700 font-bold">SIZE {comp.size}</span>
                        </div>
                        <h5 className="font-orbitron text-slate-100 text-sm mb-2 group-hover:text-blue-400 transition-colors uppercase font-black tracking-tighter leading-tight">{comp.name}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mb-6 h-8 leading-relaxed font-light">{comp.description}</p>
                        
                        <div className="pt-6 border-t border-slate-800/50 space-y-3">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-600 uppercase font-orbitron tracking-widest text-[8px]">Authorized Vendor</span>
                            <span className="text-slate-300 font-bold uppercase tracking-tighter text-[11px]">{comp.shopName}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-600 uppercase font-orbitron tracking-widest text-[8px]">Stanton Hub</span>
                            <span className="text-blue-400 font-bold uppercase tracking-tighter text-[11px]">{comp.location}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] pt-1">
                            <span className="text-slate-600 uppercase font-orbitron tracking-widest text-[8px]">Standard UEC</span>
                            <span className="text-blue-500 font-orbitron font-black text-xs">{comp.price?.toLocaleString() || '---'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
