
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { STANTON_NODES, STANTON_LINKS } from '../constants';
import { Component } from '../types';

interface MapVisualizerProps {
  route: string[];
  components: Component[];
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ route, components }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;

    // Background Layer: Grid
    const g = svg.append("g");
    for (let i = 0; i <= width; i += 50) {
      g.append("line").attr("x1", i).attr("y1", 0).attr("x2", i).attr("y2", height).attr("stroke", "#0f172a").attr("stroke-width", 0.5);
    }
    for (let i = 0; i <= height; i += 50) {
      g.append("line").attr("x1", 0).attr("y1", i).attr("x2", width).attr("y2", i).attr("stroke", "#0f172a").attr("stroke-width", 0.5);
    }

    // Static Connections (System Links)
    svg.append("g")
      .selectAll("line")
      .data(STANTON_LINKS)
      .enter()
      .append("line")
      .attr("x1", d => STANTON_NODES.find(n => n.id === d.source)?.x || 0)
      .attr("y1", d => STANTON_NODES.find(n => n.id === d.source)?.y || 0)
      .attr("x2", d => STANTON_NODES.find(n => n.id === d.target)?.x || 0)
      .attr("y2", d => STANTON_NODES.find(n => n.id === d.target)?.y || 0)
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    // Helper: Find node by name or substring
    const findNode = (name: string) => {
      return STANTON_NODES.find(n => 
        n.name.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(n.id.toLowerCase()) ||
        (n.id === 'arc_corp' && name.toLowerCase().includes('area18')) ||
        (n.id === 'crusader' && name.toLowerCase().includes('orison')) ||
        (n.id === 'microtech' && name.toLowerCase().includes('new babbage')) ||
        (n.id === 'hurston' && name.toLowerCase().includes('lorville'))
      );
    };

    // Dynamic Route Layer
    if (route && route.length > 1) {
      const routePoints = route
        .map(locName => {
          const node = findNode(locName);
          return node ? { x: node.x, y: node.y } : null;
        })
        .filter(p => p !== null) as { x: number, y: number }[];

      if (routePoints.length > 1) {
        const lineGenerator = d3.line<{ x: number, y: number }>()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveBundle.beta(0.85));

        // Background Glow Path
        svg.append("path")
          .datum(routePoints)
          .attr("fill", "none")
          .attr("stroke", "#1e40af")
          .attr("stroke-width", 6)
          .attr("stroke-opacity", 0.3)
          .attr("d", lineGenerator);

        // Active Path
        const activePath = svg.append("path")
          .datum(routePoints)
          .attr("fill", "none")
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round")
          .attr("stroke-dasharray", "4,4")
          .attr("d", lineGenerator)
          .attr("class", "route-path");

        // Animate dash offset for flow effect
        activePath.append("animate")
          .attr("attributeName", "stroke-dashoffset")
          .attr("from", "100")
          .attr("to", "0")
          .attr("dur", "3s")
          .attr("repeatCount", "indefinite");
      }
    }

    // Nodes Layer
    const nodesGroup = svg.append("g")
      .selectAll("g")
      .data(STANTON_NODES)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodesGroup.append("circle")
      .attr("r", d => d.type === 'Planet' ? 10 : 5)
      .attr("fill", d => {
        const inRoute = route.some(loc => d.name.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(d.id.toLowerCase()));
        return inRoute ? "#1e3a8a" : "#0f172a";
      })
      .attr("stroke", d => {
         const isStart = route[0] && (d.name.toLowerCase().includes(route[0].toLowerCase()) || route[0].toLowerCase().includes(d.id.toLowerCase()));
         if (isStart) return "#10b981";
         const inRoute = route.some(loc => d.name.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(d.id.toLowerCase()));
         return inRoute ? "#3b82f6" : "#334155";
      })
      .attr("stroke-width", 2);

    nodesGroup.append("text")
      .attr("dy", d => d.type === 'Planet' ? 22 : 16)
      .attr("text-anchor", "middle")
      .attr("fill", d => route.includes(d.name) ? "#f8fafc" : "#475569")
      .attr("font-size", "8px")
      .attr("font-family", "Orbitron")
      .attr("style", "pointer-events: none;")
      .text(d => d.name.toUpperCase());

    // Shop Markers & Component Labels
    const locationCounts: Record<string, number> = {};
    
    components.forEach((comp, i) => {
      const node = findNode(comp.location);
      if (node) {
        const count = locationCounts[node.id] || 0;
        locationCounts[node.id] = count + 1;

        // Calculate offset to prevent overlap at same location
        const angle = (count * 45) * (Math.PI / 180);
        const radius = node.type === 'Planet' ? 18 : 12;
        const ox = Math.cos(angle) * radius;
        const oy = Math.sin(angle) * radius;

        const shopMarker = svg.append("g")
          .attr("transform", `translate(${node.x + ox}, ${node.y + oy})`);

        // Marker Point
        shopMarker.append("circle")
          .attr("r", 3)
          .attr("fill", "#f59e0b")
          .attr("stroke", "#020617")
          .attr("stroke-width", 1)
          .attr("class", "animate-pulse");

        // Label Background
        const labelText = comp.name.split(' ').slice(-1)[0]; // Just the last word to keep it clean
        const textNode = shopMarker.append("text")
          .attr("dx", 6)
          .attr("dy", 3)
          .attr("fill", "#fbbf24")
          .attr("font-size", "6px")
          .attr("font-family", "Orbitron")
          .attr("font-weight", "bold")
          .text(`${comp.type[0]}: ${labelText}`);

        // Small indicator line from shop to hub
        shopMarker.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", -ox)
          .attr("y2", -oy)
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 0.5)
          .attr("stroke-opacity", 0.4);
      }
    });

  }, [route, components]);

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-inner group">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-orbitron text-blue-400 uppercase tracking-tighter">NAV-SYS-V4.2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[8px] font-orbitron text-amber-500 uppercase tracking-tighter">Shop Nodes Active</span>
        </div>
      </div>
      
      <svg 
        ref={svgRef} 
        viewBox="0 0 800 500" 
        className="w-full h-auto max-h-[400px] transition-transform duration-700"
      />

      <div className="absolute bottom-4 right-4 flex gap-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-blue-500"></div>
          <span className="text-[7px] font-orbitron text-slate-500 uppercase">Quantum Link</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full border border-emerald-500"></div>
          <span className="text-[7px] font-orbitron text-slate-500 uppercase">Origin</span>
        </div>
      </div>
    </div>
  );
};
