import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Ship, LoadoutBuild, OptimizationPriority } from './types';
import { SHIPS, STANTON_NODES } from './constants';
import { ShipCard } from './components/ShipCard';
import { MapVisualizer } from './components/MapVisualizer';
import { getBuildRecommendation } from './services/geminiService';
import { getOfflineBuild } from './services/offlineBuildService';

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
  const [isOfflineMode, setIsOfflineMode] = useState(true); // Default to true as per user request

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
    if (!userPrompt.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setCurrentBuild(null);

    try {
      let build: LoadoutBuild | null = null;

      if (isOfflineMode) {
        // Try to find in the pre-calculated offline database
        build = await getOfflineBuild(selectedShip ? selectedShip.name : null, userPrompt);
        if (!build) throw new Error("No offline build found for this criteria.");
      } else {
        // Use Gemini Online
        build = await getBuildRecommendation(
          selectedShip ? selectedShip.name : null,
          userPrompt,
          startLocation,
          priority
        );
      }

      setCurrentBuild(build);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(isOfflineMode
        ? "Offline Engine Error: No pre-calculated data matches your query."
        : "Analysis module offline. Link established but request timed out."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedShip, userPrompt, startLocation, priority, isOfflineMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchingLocation(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-sm rotate-45 flex items-center justify-center border border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <svg className="w-6 h-6 text-white -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12M12 12L3 7M12 12l9-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-orbitron text-lg font-black tracking-[0.2em] uppercase">CitizenForge</h1>
            <p className="text-[9px] text-slate-500 font-orbitron uppercase tracking-widest">Loadout Architect // v4.5.0-LOCAL</p>
          </div>
        </div>

        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-2">
            <span className={`text-[8px] font-orbitron uppercase tracking-widest ${isOfflineMode ? 'text-blue-400' : 'text-slate-600'}`}>
              Offline Engine
            </span>
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`w-10 h-5 rounded-full relative transition-colors ${isOfflineMode ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isOfflineMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-orbitron text-slate-600 uppercase tracking-widest mb-1">System Status</p>
            <div className="flex items-center gap-2 justify-end">
              <span className={`text-[10px] font-orbitron uppercase font-bold tracking-widest ${isOfflineMode ? 'text-amber-500' : 'text-emerald-500'}`}>
                {isOfflineMode ? 'Local Cache' : 'Linked'}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOfflineMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-10 max-w-7xl">
        {/* Rest of the UI remains mostly the same, but optimized for the offline flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
          {/* Ship Selection Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="font-orbitron text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Airframe Database</h2>
              <span className="text-[9px] text-blue-500 font-orbitron uppercase font-bold px-2 py-0.5 border border-blue-500/20 rounded-sm">
                {filteredShips.length} Active
              </span>
            </div>

            <div className="relative group">
              <input
                type="text"
                value={shipSearch}
                onChange={(e) => setShipSearch(e.target.value)}
                placeholder="Search Chassis..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
              />
              <svg className="absolute right-4 top-3.5 w-4 h-4 text-slate-700 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <div
                onClick={() => setSelectedShip(null)}
                className={`relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border-2 p-4 flex flex-col items-center justify-center
                  ${selectedShip === null ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
              >
                <p className="font-orbitron text-xs font-bold uppercase tracking-widest text-center">Auto-Match (AI)</p>
                <p className="text-[8px] text-slate-600 uppercase mt-1">Cross-referencing database</p>
              </div>
              {filteredShips.map(ship => (
                <ShipCard
                  key={ship.id}
                  ship={ship}
                  isSelected={selectedShip?.id === ship.id}
                  onSelect={setSelectedShip}
                />
              ))}
            </div>
          </div>

          {/* Config & Intent Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Select */}
              <div className="space-y-3" ref={searchRef}>
                <label className="text-[8px] font-orbitron text-slate-500 uppercase tracking-widest font-black block">Origin Deployment</label>
                <div className="relative">
                  <button
                    onClick={() => setIsSearchingLocation(!isSearchingLocation)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-5 py-4 text-left flex justify-between items-center group hover:border-slate-700 transition-all"
                  >
                    <span className="font-orbitron text-sm uppercase tracking-widest text-slate-300">{startLocation}</span>
                    <svg className={`w-4 h-4 text-slate-600 transition-transform ${isSearchingLocation ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isSearchingLocation && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                      <div className="p-3 border-b border-slate-800">
                        <input
                          autoFocus
                          type="text"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          placeholder="Search Stanton Hubs..."
                          className="w-full bg-slate-950/50 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredLocations.map(node => (
                          <button
                            key={node.id}
                            onClick={() => {
                              setStartLocation(node.name);
                              setIsSearchingLocation(false);
                            }}
                            className="w-full px-5 py-3 text-left text-[10px] font-orbitron uppercase tracking-widest hover:bg-blue-600/10 hover:text-blue-400 transition-colors border-b border-slate-800/30 last:border-0"
                          >
                            {node.name} <span className="text-[8px] text-slate-600 ml-2">[{node.type}]</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority Select */}
              <div className="space-y-3">
                <label className="text-[8px] font-orbitron text-slate-500 uppercase tracking-widest font-black block">Optimization Routine</label>
                <div className="flex bg-slate-900/50 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setPriority('shortest')}
                    className={`flex-1 py-3 px-4 rounded font-orbitron text-[9px] uppercase tracking-widest transition-all
                      ${priority === 'shortest' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Shortest Distance
                  </button>
                  <button
                    onClick={() => setPriority('cheapest')}
                    className={`flex-1 py-3 px-4 rounded font-orbitron text-[9px] uppercase tracking-widest transition-all
                      ${priority === 'cheapest' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Lowest Cost (UEC)
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[8px] font-orbitron text-slate-500 uppercase tracking-widest font-black block">Analysis Parameters</label>
              <div className="relative">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder={isOfflineMode ? "Ask for a ship and build (e.g., 'Anvil Arrow Combat' or 'Fastest Aegis')" : "Input mission profile and loadout requirements"}
                  className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-slate-200 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all resize-none h-32 font-light placeholder:text-slate-700 text-lg leading-relaxed"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !userPrompt.trim()}
                  className={`absolute bottom-6 right-6 px-10 py-3 rounded-sm font-orbitron text-[9px] uppercase tracking-[0.2em] font-black transition-all
                    ${isAnalyzing || !userPrompt.trim()
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95'}`}
                >
                  {isAnalyzing ? "Processing..." : isOfflineMode ? "Cache Match" : "Run Analysis"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isAnalyzing && (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className={`w-16 h-16 border-2 rounded-full animate-ping ${isOfflineMode ? 'border-amber-500/20' : 'border-blue-500/20'}`} />
              <div className={`absolute inset-0 w-16 h-16 border-t-2 rounded-full animate-spin ${isOfflineMode ? 'border-amber-500' : 'border-blue-500'}`} />
            </div>
            <div className="text-center">
              <p className={`font-orbitron text-[10px] uppercase tracking-[0.5em] font-black animate-pulse ${isOfflineMode ? 'text-amber-500' : 'text-blue-500'}`}>
                {isOfflineMode ? 'Accessing Local Snapshot' : 'Syncing with SC-API'}
              </p>
              <p className="text-[8px] text-slate-600 font-orbitron uppercase tracking-widest mt-2">
                {isOfflineMode ? 'Running RTX 5090 Optimized Search...' : 'Accessing Star Citizen Global Database...'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-8 border border-red-500/30 bg-red-500/5 rounded-xl text-center mb-10">
            <p className="text-red-500 text-[10px] font-orbitron uppercase tracking-widest animate-pulse">{error}</p>
          </div>
        )}

        {currentBuild && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-8">
              <div>
                <p className={`text-[8px] font-orbitron uppercase tracking-[0.3em] mb-2 ${isOfflineMode ? 'text-amber-500' : 'text-blue-500'}`}>
                  {isOfflineMode ? 'Snapshot Recommendation' : 'Live Recommendation'}
                </p>
                <h3 className="text-4xl font-orbitron font-black text-white uppercase tracking-tighter">{currentBuild.ship}</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-2xl">{currentBuild.goal}</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg min-w-[150px]">
                  <p className="text-[8px] font-orbitron text-slate-600 uppercase mb-1">Total Cost</p>
                  <p className={`text-xl font-orbitron font-black ${isOfflineMode ? 'text-amber-500' : 'text-blue-500'}`}>
                    {currentBuild.totalCost.toLocaleString()} <span className="text-[10px]">UEC</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <h4 className="font-orbitron text-[10px] text-slate-500 uppercase tracking-[0.3em]">Logistics Map</h4>
                  <MapVisualizer
                    route={currentBuild.route}
                    components={currentBuild.components}
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <h4 className="font-orbitron text-[10px] text-slate-500 uppercase tracking-[0.3em]">Recommended Components</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentBuild.components.map((comp, idx) => (
                    <div key={idx} className={`bg-slate-900/40 border rounded p-5 transition-all group ${isOfflineMode ? 'border-amber-900/30 hover:border-amber-500' : 'border-slate-800 hover:border-blue-900'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border font-orbitron ${isOfflineMode ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-blue-500 bg-blue-500/10 border-blue-500/20'}`}>
                          {comp.type}
                        </span>
                        <span className="text-[9px] font-orbitron text-slate-700">S{comp.size}</span>
                      </div>
                      <h5 className="font-orbitron text-slate-100 text-xs mb-1 uppercase font-black">{comp.name}</h5>
                      <p className="text-[9px] text-slate-600 mb-4 h-6 overflow-hidden">{comp.description}</p>

                      <div className="pt-4 border-t border-slate-800/50 space-y-2">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-600 uppercase font-orbitron tracking-widest text-[7px]">Vendor</span>
                          <span className="text-slate-300 font-bold uppercase">{comp.shopName}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-600 uppercase font-orbitron tracking-widest text-[7px]">Location</span>
                          <span className={`font-bold uppercase ${isOfflineMode ? 'text-amber-500' : 'text-blue-400'}`}>{comp.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
