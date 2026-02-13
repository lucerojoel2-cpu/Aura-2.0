
import React from 'react';

interface AuraCircleProps {
  isActive: boolean;
  level?: number; // 0 to 1
}

const AuraCircle: React.FC<AuraCircleProps> = ({ isActive, level = 0.2 }) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
      {/* Outer Gloomy rings */}
      <div className={`absolute inset-0 rounded-full border border-indigo-500/20 transition-all duration-1000 ${isActive ? 'scale-125 opacity-100' : 'scale-100 opacity-50'}`} />
      <div className={`absolute inset-4 rounded-full border border-purple-500/30 transition-all duration-1000 ${isActive ? 'scale-110 opacity-80' : 'scale-90 opacity-40'}`} />
      
      {/* Main Pulse */}
      <div 
        className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden transition-all duration-300 ${isActive ? 'shadow-[0_0_50px_rgba(129,140,248,0.5)]' : 'shadow-none'}`}
        style={{
          background: `radial-gradient(circle, rgba(99,102,241,${0.3 + level * 0.4}) 0%, rgba(168,85,247,0.1) 70%, rgba(0,0,0,0) 100%)`
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 aura-animate`} />
        
        {/* Particle/Fluid effect simulation */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-3/4 h-3/4 bg-white/5 rounded-full blur-2xl transition-transform duration-75`} style={{ transform: `scale(${1 + level})` }} />
        </div>
      </div>

      {/* Center visualizer bars when active */}
      {isActive && (
        <div className="absolute flex items-end gap-1 h-12">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-white/80 rounded-full animate-bounce"
                    style={{ 
                        height: `${20 + Math.random() * 80}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                    }} 
                />
            ))}
        </div>
      )}
    </div>
  );
};

export default AuraCircle;
