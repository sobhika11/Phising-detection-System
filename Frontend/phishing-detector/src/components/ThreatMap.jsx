import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { io } from 'socket.io-client';

const ThreatMap = ({ initialUrl }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const graphRef = useRef();

  useEffect(() => {
    // 1. Setup Initial Data based on input
    const initialData = {
      nodes: [
        { id: 'start', name: initialUrl || 'Enter URL', group: 1, val: 20 },
      ],
      links: []
    };
    setGraphData(initialData);

    // 2. Connect to WebSocket for real-time updates (Socket.io)
    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    socket.on('connect', () => {
      console.log('Connected to SecureInc Threat Intel Feed');
      // Ask backend to start investigating
      if (initialUrl) {
         socket.emit('start_investigation', { url: initialUrl });
      }
    });

    socket.on('graph_update', (newEntities) => {
      // newEntities: { nodes: [...], edges: [...] }
      setGraphData(prev => {
        const nodes = [...prev.nodes];
        const links = [...prev.links];
        
        // Merge new nodes
        newEntities.nodes.forEach(n => {
          if (!nodes.find(existing => existing.id === n.id)) {
            nodes.push(n);
          }
        });

        // Merge new edges
        newEntities.edges.forEach(e => {
           if (!links.find(existing => existing.source === e.source && existing.target === e.target)) {
             links.push(e);
           }
        });

        return { nodes, links };
      });
    });

    return () => socket.disconnect();
  }, [initialUrl]);

  return (
    <div className="threat-map-container" style={{ height: '500px', backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, color: '#38bdf8', fontWeight: 'bold' }}>
        Live Threat Map (SecureInc Intelligence)
      </div>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={node => {
          if (node.group === 1) return '#38bdf8'; // Target URL
          if (node.group === 2) return '#ef4444'; // Malicious IP/Domain
          if (node.group === 3) return '#fbbf24'; // Suspicious Entity
          return '#94a3b8'; // Unknown
        }}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={d => d.value * 0.001}
        enableZoomPanInteraction={true}
      />
    </div>
  );
};

export default ThreatMap;
