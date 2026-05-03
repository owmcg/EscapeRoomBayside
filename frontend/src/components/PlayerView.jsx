import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import MatrixEffect from './MatrixEffect';
import NetworkRadarEffect from './NetworkRadarEffect';
import ParticleGlitchEffect from './ParticleGlitchEffect';
import FailEffect from './FailEffect';

const PlayerView = ({ room, isSpectator = false }) => {
  const socket = useSocket();
  const [timeLeft, setTimeLeft] = useState(room?.timeLimit ? room.timeLimit * 60 : 3600);
  const [password, setPassword] = useState('');
  const [hints, setHints] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [lastGuess, setLastGuess] = useState('');
  const [newHintGlow, setNewHintGlow] = useState(false);
  const [showMatrixStart, setShowMatrixStart] = useState(false);
  const [showMatrixWin, setShowMatrixWin] = useState(false);
  const [showFailState, setShowFailState] = useState(false);
  const status = room?.status || 'waiting';
  const previousStatus = React.useRef(status);

  useEffect(() => {
    if (previousStatus.current === 'waiting' && status === 'active') {
      setShowMatrixStart(true);
      setTimeout(() => setShowMatrixStart(false), 3000);
    }
    if (status === 'finished' && previousStatus.current !== 'finished') {
       if (timeLeft <= 0) setShowFailState(true);
    }
    previousStatus.current = status;
  }, [status, timeLeft]);

  useEffect(() => {
    if (!socket) return;

    socket.on('timer_tick', (time) => setTimeLeft(time));
    socket.on('receive_hint', (hint) => {
       setHints((prev) => [...prev, hint]);
       setNewHintGlow(true);
       setTimeout(() => setNewHintGlow(false), 1500);
    });
    socket.on('guess_attempt', (guess) => {
       setLastGuess(guess);
       setTimeout(() => setLastGuess(''), 3000);
    });
    socket.on('password_rejected', (msg) => setFeedback(msg));
    socket.on('game_over', ({ success, message }) => {
      setFeedback(message);
      if (success) {
         setShowMatrixWin(true);
      } else {
         setShowFailState(true);
      }
    });

    return () => {
      socket.off('timer_tick');
      socket.off('receive_hint');
      socket.off('guess_attempt');
      socket.off('password_rejected');
      socket.off('game_over');
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (socket && room?.roomId) {
      socket.emit('submit_password', { roomId: room.roomId, password });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getThemeClass = (theme) => {
    if (theme === 'custom') return { text: 'text-white', border: 'border-white', input: 'text-gray-300' };
    if (theme === 'ransomware') return { text: 'text-red-500', border: 'border-red-500', input: 'text-red-300' };
    if (theme === 'ddos') return { text: 'text-yellow-500', border: 'border-yellow-500', input: 'text-yellow-300' };
    if (theme === 'phishing') return { text: 'text-cyan-500', border: 'border-cyan-500', input: 'text-cyan-300' };
    return { text: 'text-green-500', border: 'border-green-500', input: 'text-green-300' }; // breach default
  };
  const themeClass = getThemeClass(room?.theme);

  const customStyle = room?.theme === 'custom' ? { color: room.customThemeColor, borderColor: room.customThemeColor } : {};

  return (
    <div className={`bg-black ${themeClass.text} font-mono p-8 min-h-screen relative`} style={room?.theme === 'custom' ? { color: room.customThemeColor } : {}}>
      {showFailState && <FailEffect />}
      {room?.effect === 'matrix' && <MatrixEffect theme={room?.theme} customColor={room?.customThemeColor} />}
      {room?.effect === 'radar' && <NetworkRadarEffect theme={room?.theme} color={room?.customThemeColor} />}
      {room?.effect === 'glitch' && <ParticleGlitchEffect theme={room?.theme} color={room?.customThemeColor} />}
      
      {showMatrixStart && <MatrixEffect textOverlay="SYSTEM BREACH DETECTED" theme={room?.theme} customColor={room?.customThemeColor} />}
      {showMatrixWin && <MatrixEffect textOverlay="ACCESS GRANTED - ESCAPE COMPLETE" theme={room?.theme} customColor={room?.customThemeColor} />}
      
      <div className="relative z-10">
        <h1 className="text-3xl mb-4">Target System: {room?.theme?.toUpperCase() || 'UNKNOWN'}</h1>
      <div className={`text-5xl mb-8 border ${themeClass.border} inline-block p-4`} style={customStyle}>
        {status === 'active' ? formatTime(timeLeft) : (status === 'finished' ? 'SYSTEM TERMINATED' : (status === 'paused' ? 'SYSTEM PAUSED' : 'SYSTEM FROZEN'))}
      </div>

      <div className={`mb-8 p-4 transition-all duration-500 ${newHintGlow ? 'bg-white/20 shadow-[0_0_30px_rgba(255,255,255,0.5)] border shadow-inner' : ''}`}>
        <h3 className={`text-xl border-b ${themeClass.border} mb-2`} style={{ borderColor: customStyle.borderColor }}>System Comms / Hints</h3>
        {hints.length === 0 && <p className="text-gray-500">&gt; Waiting for signals...</p>}
        {hints.map((h, i) => <p key={i} className={i === hints.length - 1 && newHintGlow ? 'animate-pulse font-bold' : ''}>&gt; {h}</p>)}
      </div>

      {lastGuess && (
        <div className="mb-4 text-xl border border-red-500 p-2 animate-[pulse_0.4s_ease-in-out_3]">
          &gt; FAILED BREACH ATTEMPT DETECTED: <span className="text-red-500 line-through">{lastGuess}</span>
        </div>
      )}

      {!isSpectator ? (
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex gap-4">
            <span className="text-xl">&gt; root@system:~/decrypt#</span>
            <input 
              type="text" 
              className={`bg-transparent border-b ${themeClass.border} outline-none flex-grow text-xl ${themeClass.input}`}
              style={{ borderColor: customStyle.borderColor, color: customStyle.color }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status !== 'active'}
              autoFocus
            />
          </div>
          <p className="mt-4 text-red-500 font-bold">{feedback}</p>
        </form>
      ) : (
        <div className="mt-8 p-4 border border-gray-700 text-center opacity-50 relative z-50">
          <p className="text-xl font-bold">&gt; SPECTATOR TV MODE ACTIVE</p>
          <p className="font-mono mt-2">TERMINAL INPUT IS LOCKED.</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default PlayerView;
