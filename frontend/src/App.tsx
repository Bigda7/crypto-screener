import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from './services/api';
import { ShieldCheck, Activity, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkBackendHealth().then((isHealthy) => {
      setBackendStatus(isHealthy ? 'connected' : 'disconnected');
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
          <Activity className="w-8 h-8 animate-pulse" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Crypto Screener</h1>
          <p className="text-sm text-slate-400 mt-1">Spredo Full-Stack Intern Task</p>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-slate-400" />
            Backend API:
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            backendStatus === 'connected' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : backendStatus === 'checking'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              backendStatus === 'connected' ? 'bg-emerald-400' : backendStatus === 'checking' ? 'bg-amber-400' : 'bg-rose-400'
            }`} />
            {backendStatus.toUpperCase()}
          </span>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Iteration 1 scaffold verified</span>
        </div>
      </div>
    </div>
  );
};

export default App;
