import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const ParticleGlitchEffect = ({ color = '#00ff00', theme }) => {
  const { epilepsySafe } = useSettings();
  const [glitches, setGlitches] = useState([]);

  const getThemeColor = () => {
    if (theme === 'custom' && color) return color;
    if (theme === 'ransomware') return '#ef4444';
    if (theme === 'ddos') return '#eab308';
    if (theme === 'phishing') return '#06b6d4';
    return '#22c55e';
  };

  useEffect(() => {
    if (epilepsySafe) return;

    const interval = setInterval(() => {
        // Randomly generate a glitch bar
        if (Math.random() > 0.3) {
            const newGlitch = {
                id: Date.now() + Math.random(),
                top: Math.random() * 100,
                height: Math.random() * 10 + 2,
                opacity: Math.random() * 0.5 + 0.1,
                left: Math.random() > 0.5 ? -10 : 10
            };
            
            setGlitches(prev => {
                const arr = [...prev, newGlitch];
                if (arr.length > 8) arr.shift(); // keep it clean
                return arr;
            });

            // Auto clean up individual glitch
            setTimeout(() => {
                setGlitches(prev => prev.filter(g => g.id !== newGlitch.id));
            }, 100 + Math.random() * 200);
        }
    }, 150);

    return () => clearInterval(interval);
  }, [epilepsySafe]);

  if (epilepsySafe) return null;

  const activeColor = getThemeColor();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {glitches.map(g => (
            <div 
                key={g.id}
                className="absolute w-full mix-blend-screen"
                style={{
                    backgroundColor: activeColor,
                    top: `${g.top}%`,
                    height: `${g.height}px`,
                    opacity: g.opacity,
                    transform: `translateX(${g.left}px)`
                }}
            />
        ))}
    </div>
  );
};

export default ParticleGlitchEffect;