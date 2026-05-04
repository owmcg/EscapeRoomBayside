import React, { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

const MatrixEffect = ({ textOverlay, theme = 'breach', customColor = '#00ff00' }) => {
  const canvasRef = useRef(null);
  const { epilepsySafe } = useSettings();

  useEffect(() => {
    if (epilepsySafe) return; // Disable canvas animation in safe mode
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~';
    const fontSize = 16;
    let columns = canvas.width / fontSize;
    let drops = Array.from({ length: columns }).map(() => 1);

    const getThemeColor = () => {
      if (theme === 'custom') return customColor;
      if (theme === 'ransomware') return '#F00';
      if (theme === 'ddos') return '#FA0';
      if (theme === 'phishing') return '#0FF';
      return '#0F0';
    };

    const draw = () => {
      // Black BG with opacity for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = getThemeColor(); // Dynamic color
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop randomly to create varied cascade
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, epilepsySafe]);

  const getThemeTextClass = () => {
    if (theme === 'ransomware') return 'text-red-500 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)]';
    if (theme === 'ddos') return 'text-yellow-500 border-yellow-500 shadow-[0_0_30px_rgba(255,255,0,0.5)]';
    if (theme === 'phishing') return 'text-cyan-500 border-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.5)]';
    return 'text-green-500 border-green-500 shadow-[0_0_30px_rgba(0,255,0,0.5)]';
  };

  if (epilepsySafe) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/90">
        {textOverlay && (
          <div className={`relative z-10 p-8 bg-black border text-center ${getThemeTextClass().replace(/shadow-\[.*?\]/g, '')}`}>
            <h2 className="text-4xl md:text-6xl font-mono tracking-widest uppercase">
              {textOverlay}
            </h2>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 pointer-events-none flex items-center justify-center ${textOverlay ? 'z-50' : 'z-0 opacity-40 mix-blend-screen'}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      {textOverlay && (
        <div className={`relative z-10 p-8 bg-black border text-center ${getThemeTextClass()}`}>
          <h2 className="text-4xl md:text-6xl font-mono tracking-widest uppercase animate-pulse">
            {textOverlay}
          </h2>
        </div>
      )}
    </div>
  );
};

export default MatrixEffect;