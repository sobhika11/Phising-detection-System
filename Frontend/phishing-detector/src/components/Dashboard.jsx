import React from 'react';
import GraphView from '../components/GraphView';
import { Shield, Activity, Share2 } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Shield className="text-blue-600" /> Security Intelligence Dashboard
        </h1>
        <p className="text-slate-500">Real-time analysis of global phishing infrastructure.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Top Row: General Stats (Optional placeholder for your stats) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Scans</p>
            <p className="text-2xl font-bold text-slate-900">1,284</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Active Threats</p>
            <p className="text-2xl font-bold text-red-600">42</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Nodes Monitored</p>
            <p className="text-2xl font-bold text-blue-600">856</p>
          </div>
        </div>

        {/* The Graph Intelligence Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Share2 size={20} className="text-blue-500" /> Infrastructure Relationship Map
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Visualizing how individual URLs cluster around shared malicious servers.
              </p>
            </div>
          </div>
          
          {/* Our Graph Component */}
          <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-900">
            <GraphView />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;