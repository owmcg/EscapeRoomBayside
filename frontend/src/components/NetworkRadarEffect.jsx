import React, { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

const NetworkRadarEffect = ({ color = '#00ff00', theme }) => {
  const canvasRef = useRef(null);
  const { epilepsySafe } = useSettings();

  const getThemeColor = () => {
    if (theme === 'custom' && color) return color;
    if (theme === 'ransomware') return '#ef4444';
    if (theme === 'ddos') return '#eab308';
    if (theme === 'phishing') return '#06b6d4';
    return '#22c55e'; // default green
  };

  const activeColor = getThemeColor();

  useEffect(() => {
    if (epilepsySafe) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = Math.max(cx, cy);
    
    let angle = 0;
    const blips = [];

    // Initialize random nodes (blips)
    for (let i = 0; i < 20; i++) {
        blips.push({
            r: Math.random() * maxRadius * 0.9,
            theta: Math.random() * Math.PI * 2,
            opacity: 0,
            size: Math.random() * 3 + 2
        });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      ctx.strokeStyle = `${activeColor}33`;
      ctx.lineWidth = 1;
      
      for(let r = 50; r < maxRadius; r += 50) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.stroke();

      // Radar Sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      
      ctx.fillStyle = `${activeColor}40`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, 0, 0.2);
      ctx.lineTo(0,0);
      ctx.fill();

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxRadius, 0);
      ctx.stroke();

      ctx.restore();

      // Blips
      blips.forEach(blip => {
        // Calculate diff between sweep angle and blip angle
        const sweepAngle = angle % (Math.PI * 2);
        let angleDiff = sweepAngle - blip.theta;
        if (angleDiff < 0) angleDiff += Math.PI * 2;

        // If the sweep just passed the blip, light it up
        if (angleDiff < 0.25 && angleDiff > 0) {
            blip.opacity = 1.0;
        }

        if (blip.opacity > 0) {
            const bx = cx + blip.r * Math.cos(blip.theta);
            const by = cy + blip.r * Math.sin(blip.theta);
            
            ctx.fillStyle = activeColor;
            ctx.globalAlpha = blip.opacity;
            ctx.beginPath();
            ctx.arc(bx, by, blip.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Text tag
            ctx.font = '10px monospace';
            ctx.fillText(`NODE.${Math.round(blip.r)}`, bx + 5, by - 5);
            
            ctx.globalAlpha = 1.0;
            blip.opacity -= 0.02; // Fade out
        }
      });

      angle += 0.03;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [epilepsySafe, activeColor]);

  if (epilepsySafe) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
    />
  );
};

export default NetworkRadarEffect;