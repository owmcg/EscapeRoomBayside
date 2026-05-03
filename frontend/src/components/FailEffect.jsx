import React from 'react';
import { useSettings } from '../context/SettingsContext';

const FailEffect = () => {
  const { epilepsySafe } = useSettings();

  if (epilepsySafe) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-red-900/90 text-center border-8 border-red-500">
        <h2 className="text-5xl md:text-7xl text-white font-mono tracking-widest uppercase bg-black p-8">
          CRITICAL FAILURE<br/>SYSTEM LOCKED
        </h2>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-red-950/80">
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMTExIiAvPgo8L3N2Zz4=')] mix-blend-overlay"></div>
      
      <div className="relative z-10 p-8 border-8 border-red-600 bg-red-900 text-center animate-[pulse_0.4s_ease-in-out_infinite] blur-[0.5px]">
        <h2 className="text-5xl md:text-7xl text-black font-mono tracking-widest uppercase scale-y-[1.2]">
          SYSTEM LOCKED
        </h2>
        <p className="mt-4 text-3xl font-bold font-mono text-black">NETWORK COMPROMISED</p>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-red-600 mix-blend-color-burn opacity-30 animate-ping"></div>
    </div>
  );
};

export default FailEffect;