import React, { useState } from 'react';
import { prototypes, patents, failures, fieldSites, disciplines } from '../data/archive';

interface Node {
  id: string;
  name: string;
  category: 'prototype' | 'patent' | 'failure' | 'site' | 'discipline';
  discipline?: string;
  x: number;
  y: number;
  color: string;
  radius: number;
}

interface Edge {
  source: string;
  target: string;
  color: string;
}

interface NetworkGraphProps {
  onSelectRecord?: (type: 'prototype' | 'patent' | 'failure' | 'site', id: string) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ onSelectRecord }) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  // Build representative nodes and edges
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Disciplines as central orbital hubs
  const disciplineColors: Record<string, string> = {
    'Perceptual Interfaces': '#06b6d4',
    'Signal Archaeology': '#38bdf8',
    'Generative Composition': '#a855f7',
    'Material Acoustics': '#10b981',
    'Public Listening Infrastructure': '#f59e0b',
    'Sub-Audible & Infrasonics': '#ef4444',
    'Speculative Radio': '#ec4899',
    'Cryptic Storage & Media': '#8b5cf6'
  };

  const discKeys = Object.keys(disciplineColors);
  discKeys.forEach((d, idx) => {
    const angle = (idx / discKeys.length) * Math.PI * 2;
    const r = 180;
    nodes.push({
      id: `DISC-${idx}`,
      name: d,
      category: 'discipline',
      x: 400 + Math.cos(angle) * r,
      y: 260 + Math.sin(angle) * r,
      color: disciplineColors[d] || '#10b981',
      radius: 14
    });
  });

  // Select representative prototypes (first 36)
  prototypes.slice(0, 36).forEach((p, idx) => {
    const discIdx = discKeys.indexOf(p.discipline);
    const centerAngle = discIdx >= 0 ? (discIdx / discKeys.length) * Math.PI * 2 : 0;
    const subAngle = centerAngle + ((idx % 5) - 2) * 0.28;
    const dist = 180 + 75 + ((idx % 3) * 35);
    const px = 400 + Math.cos(subAngle) * dist;
    const py = 260 + Math.sin(subAngle) * dist;

    nodes.push({
      id: p.id,
      name: p.codeName,
      category: 'prototype',
      discipline: p.discipline,
      x: Math.max(30, Math.min(770, px)),
      y: Math.max(30, Math.min(490, py)),
      color: disciplineColors[p.discipline] || '#10b981',
      radius: 7
    });

    if (discIdx >= 0) {
      edges.push({
        source: `DISC-${discIdx}`,
        target: p.id,
        color: 'rgba(16, 185, 129, 0.25)'
      });
    }

    // Link to patents
    if (p.linkedPatents && p.linkedPatents[0]) {
      edges.push({
        source: p.id,
        target: p.linkedPatents[0],
        color: 'rgba(56, 189, 248, 0.35)'
      });
    }
  });

  // Representative patents
  patents.slice(0, 18).forEach((pat, idx) => {
    const angle = (idx / 18) * Math.PI * 2;
    const dist = 320;
    const x = 400 + Math.cos(angle) * dist;
    const y = 260 + Math.sin(angle) * dist;
    nodes.push({
      id: pat.id,
      name: pat.id,
      category: 'patent',
      discipline: pat.primaryDiscipline,
      x: Math.max(25, Math.min(775, x)),
      y: Math.max(25, Math.min(495, y)),
      color: '#38bdf8',
      radius: 5
    });
  });

  // Representative incidents
  failures.slice(0, 8).forEach((f, idx) => {
    const angle = (idx / 8) * Math.PI * 2 + 0.3;
    const dist = 110;
    nodes.push({
      id: f.id,
      name: f.projectCode,
      category: 'failure',
      x: 400 + Math.cos(angle) * dist,
      y: 260 + Math.sin(angle) * dist,
      color: '#ef4444',
      radius: 6
    });
  });

  // Representative Field Sites
  fieldSites.slice(0, 6).forEach((s, idx) => {
    const angle = (idx / 6) * Math.PI * 2 + 0.6;
    const dist = 280;
    nodes.push({
      id: s.id,
      name: s.codename,
      category: 'site',
      x: 400 + Math.cos(angle) * dist,
      y: 260 + Math.sin(angle) * dist,
      color: '#f59e0b',
      radius: 8
    });
  });

  // Filter nodes based on selected discipline
  const filteredNodes = selectedDiscipline === 'ALL'
    ? nodes
    : nodes.filter(n => n.discipline === selectedDiscipline || n.category === 'discipline' || n.category === 'site');

  const activeNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target));

  const handleNodeClick = (node: Node) => {
    if (onSelectRecord && node.category !== 'discipline') {
      onSelectRecord(node.category, node.id);
    }
  };

  return (
    <div className="bg-[#05070a] border border-emerald-950/80 rounded-lg p-5 font-mono text-zinc-300">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-emerald-950/90 gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="font-bold tracking-widest text-emerald-400 text-sm">
              ZIAA INTERCONNECTED KNOWLEDGE & TAXONOMY GRAPH
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            CORRELATION MAP // PROTOTYPES ↔ SPECULATIVE PATENTS ↔ INCIDENTS ↔ FIELD INSTALLATIONS
          </p>
        </div>

        {/* Discipline filter chips */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setSelectedDiscipline('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              selectedDiscipline === 'ALL'
                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            ALL CLUSTERS
          </button>
          {disciplines.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDiscipline(d)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                selectedDiscipline === d
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-emerald-300 border border-zinc-800/80'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[8/5] max-h-[540px] bg-[#030508] border border-emerald-950/60 rounded-md overflow-hidden select-none">
        <svg viewBox="0 0 800 520" className="w-full h-full">
          {/* Background grid lines */}
          <defs>
            <radialGradient id="center-bg-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#042f2e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#030508" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="520" fill="url(#center-bg-glow)" />

          {/* Concentric orbital rings */}
          <circle cx="400" cy="260" r="110" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeDasharray="3,3" />
          <circle cx="400" cy="260" r="180" fill="none" stroke="rgba(16, 185, 129, 0.12)" strokeDasharray="4,4" />
          <circle cx="400" cy="260" r="280" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="5,5" />
          <circle cx="400" cy="260" r="340" fill="none" stroke="rgba(168, 85, 247, 0.06)" strokeDasharray="6,6" />

          {/* Edges */}
          {filteredEdges.map((e, idx) => {
            const sNode = nodes.find(n => n.id === e.source);
            const tNode = nodes.find(n => n.id === e.target);
            if (!sNode || !tNode) return null;
            return (
              <line
                key={`edge-${idx}`}
                x1={sNode.x}
                y1={sNode.y}
                x2={tNode.x}
                y2={tNode.y}
                stroke={e.color}
                strokeWidth={hoveredNode?.id === sNode.id || hoveredNode?.id === tNode.id ? 2 : 0.8}
              />
            );
          })}

          {/* Nodes */}
          {filteredNodes.map(node => {
            const isHovered = hoveredNode?.id === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
              >
                {/* Glow ring */}
                {isHovered && (
                  <circle
                    r={node.radius + 6}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                )}
                {/* Main Node */}
                <circle
                  r={isHovered ? node.radius + 2 : node.radius}
                  fill={node.color}
                  stroke="#05070a"
                  strokeWidth="2"
                  className="transition-all"
                />
                {/* Label for discipline / large nodes */}
                {(node.category === 'discipline' || isHovered) && (
                  <text
                    y={node.radius + 12}
                    textAnchor="middle"
                    fill={node.color}
                    fontSize={node.category === 'discipline' ? "8.5" : "9.5"}
                    fontWeight={node.category === 'discipline' ? "bold" : "normal"}
                    className="pointer-events-none drop-shadow-md"
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Inspector Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-3 bg-[#070b10]/95 border border-emerald-800/80 p-2.5 rounded shadow-xl text-xs backdrop-blur-md max-w-xs pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
              <span className="font-bold text-white uppercase">{hoveredNode.name}</span>
              <span className="text-[10px] text-zinc-400">[{hoveredNode.category.toUpperCase()}]</span>
            </div>
            {hoveredNode.discipline && (
              <div className="text-[10px] text-emerald-400 mt-1">Discipline: {hoveredNode.discipline}</div>
            )}
            <div className="text-[10px] text-zinc-500 mt-0.5">Click to view full dossier in archive.</div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-[#05080c]/85 border border-zinc-800/80 rounded p-2 text-[10px] space-y-1 backdrop-blur-sm pointer-events-none">
          <div className="font-bold text-zinc-400 pb-0.5 border-b border-zinc-800">NODE TAXONOMY</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> <span>Prototypes (128)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400"></span> <span>Patents (86)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span> <span>Black Vault Failures (18)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> <span>Field Sites (12)</span></div>
        </div>
      </div>
    </div>
  );
};
