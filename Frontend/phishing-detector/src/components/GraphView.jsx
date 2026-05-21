import React, { useEffect, useState, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { Search, Filter, X } from 'lucide-react';

const GraphView = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref for debouncing
  const timeoutRef = useRef(null);
  const fetchGraph = useCallback(async (query, score) => {
    setLoading(true);
    setError(null);
    try {
      // Pass search and filter parameters safely to the backend
      const ORCHESTRATOR_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/graph/network`, {
        params: {
          search: query || undefined,
          minScore: score > 0 ? score : undefined
        }
      });
      setGraphData(res.data);
    } catch (err) {
      console.error("Error fetching graph:", err);
      setError("Failed to load map data. Ensure the backend is connected.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchGraph('', 0);
  }, [fetchGraph]);

  // Handle Search Input with Debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchGraph(val, minScore);
    }, 500);
  };

  // Handle Score Filter Change
  const handleScoreChange = (e) => {
    const score = parseInt(e.target.value);
    setMinScore(score);
    fetchGraph(search, score);
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setMinScore(0);
    fetchGraph('', 0);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-700 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-white font-semibold text-lg">Threat Network Map</h2>
          <p className="text-slate-400 text-xs mt-1">
            Visualizing relationships between URLs and Hosting IPs
          </p>
        </div>
        
        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search domain or IP..." 
              value={search}
              onChange={handleSearchChange}
              className="bg-slate-800 border border-slate-600 text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none w-56 placeholder-slate-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={minScore} 
              onChange={handleScoreChange}
              className="bg-slate-800 border border-slate-600 text-sm text-white rounded-lg pl-9 pr-8 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
            >
              <option value={0}>All Risks</option>
              <option value={30}>Suspicious + (30+)</option>
              <option value={60}>Phishing Only (60+)</option>
            </select>
          </div>

          {(search || minScore > 0) && (
            <button 
              onClick={clearFilters}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Clear Filters"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex gap-4 text-xs bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
          <span className="flex items-center gap-1.5 text-red-500"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High Risk URL</span>
          <span className="flex items-center gap-1.5 text-green-500"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Safe URL</span>
          <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> IPv4 / Host</span>
        </div>
        <div className="text-xs text-slate-500">
          {graphData.nodes.length} Nodes | {graphData.links.length} Edges
        </div>
      </div>
      
      {/* Container */}
      <div className="h-[500px] w-full bg-slate-800 rounded-lg overflow-hidden relative border border-slate-700">
        {loading && (
          <div className="absolute inset-0 bg-slate-800/80 z-10 flex items-center justify-center backdrop-blur-sm">
             <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-slate-400">
            <X size={48} className="text-red-500/50 mb-4" />
            <p>{error}</p>
          </div>
        ) : graphData.nodes.length === 0 && !loading ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-slate-500">
            <Search size={48} className="text-slate-600 mb-4" opacity={0.5} />
            <p className="text-lg font-medium text-slate-400">No matching threat nodes found</p>
            <p className="text-sm mt-1">Try adjusting your search query or lowering the risk threshold.</p>
          </div>
        ) : (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel={(node) => `${node.type}: ${node.id} ${node.score ? '(Risk: '+node.score+')' : ''}`}
            nodeColor={(node) => {
              if (node.type === 'IP') return '#60a5fa'; // Blue for IP
              return node.score >= 60 ? '#ef4444' : node.score >= 30 ? '#fbbf24' : '#4ade80'; // Red/Yellow/Green for URL
            }}
            nodeRelSize={6}
            linkColor={() => '#475569'}
            linkDirectionalParticles={2}
            linkLabel={(link) => `first_seen: ${link.first_seen}, last_seen: ${link.last_seen}, scans: ${link.scan_count}`}
          />
        )}
      </div>
    </div>
  );
};

export default GraphView;