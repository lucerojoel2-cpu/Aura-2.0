
import React, { useState } from 'react';
import { AppMode } from './types';
import ChatWindow from './components/ChatWindow';
import LiveMode from './components/LiveMode';
import { MessageSquare, Radio, Settings as SettingsIcon, Scale } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col bg-[#020617]">
      {/* Fondo Dinámico con tonos profesionales */}
      <div className="absolute inset-0 aura-gradient pointer-events-none z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full aura-animate" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full aura-animate" style={{ animationDelay: '-4s' }} />

      {/* Cabecera */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Scale size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight leading-none">Aura <span className="text-blue-400 font-light ml-1">| IURYNEX</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-medium">El Derecho que piensa contigo</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setMode(AppMode.CHAT)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === AppMode.CHAT ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <MessageSquare size={16} /> Consulta Legal
          </button>
          <button 
            onClick={() => setMode(AppMode.LIVE)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === AppMode.LIVE ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Radio size={16} /> Orientación en Vivo
          </button>
        </nav>

        <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Estado</span>
                <span className="text-[12px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Conectado
                </span>
            </div>
            <button className="p-2.5 rounded-xl glass text-slate-400 hover:text-white transition-colors border border-white/5" title="Configuración">
                <SettingsIcon size={20} />
            </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {mode === AppMode.CHAT && <ChatWindow />}
        {mode === AppMode.LIVE && <LiveMode onClose={() => setMode(AppMode.CHAT)} />}
      </main>

      {/* Navegación Móvil */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-20 glass rounded-full p-2 flex gap-4 shadow-2xl border border-white/10">
        <button 
            onClick={() => setMode(AppMode.CHAT)}
            className={`p-3 rounded-full transition-all ${mode === AppMode.CHAT ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400'}`}
            title="Chat"
        >
          <MessageSquare size={24} />
        </button>
        <button 
            onClick={() => setMode(AppMode.LIVE)}
            className={`p-3 rounded-full transition-all ${mode === AppMode.LIVE ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400'}`}
            title="En Vivo"
        >
          <Radio size={24} />
        </button>
        <button className="p-3 rounded-full text-slate-400" title="Ajustes">
          <SettingsIcon size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
