import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

const AdminPanel = ({ room }) => {
  const socket = useSocket();
  const [hint, setHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendHint = (e) => {
    e.preventDefault();
    if (hint.trim() && socket && room?.roomId) {
      socket.emit('send_hint', { roomId: room.roomId, hint });
      setHint('');
    }
  };

  const handleStartGame = () => {
    if (socket && room?.roomId) {
      socket.emit('start_game', room.roomId);
    }
  };

  const handlePauseGame = () => {
    if (socket && room?.roomId) {
      socket.emit('pause_game', room.roomId);
    }
  };

  const handleTimeChange = (change) => {
    if (socket && room?.roomId) {
      socket.emit('change_time', { roomId: room.roomId, change });
    }
  };

  const handleSetTime = (e) => {
    e.preventDefault();
    const timeVal = e.target.elements.newTime.value;
    if (timeVal && socket && room?.roomId) {
      socket.emit('set_time', { roomId: room.roomId, time: timeVal * 60 });
      e.target.reset();
    }
  };

  const handleDeleteRoom = () => {
    if (window.confirm("Are you sure you want to permanently delete this system?")) {
      socket.emit('delete_room', room.roomId);
    }
  };

  return (
    <div className="bg-green-950 border border-green-500 p-4 mb-6">
      <div className="flex justify-between items-start -mt-8 mb-2">
        <h2 className="text-xl text-green-300 font-mono uppercase bg-black px-2 inline-block border border-green-500">Game Master Terminal</h2>
        {room.status === 'finished' && (
          <button onClick={handleDeleteRoom} className="bg-red-800 text-white px-4 py-1 text-sm border border-red-500 hover:bg-red-600 font-mono">
            TERMINATE & DELETE SYSTEM
          </button>
        )}
      </div>
      
      <div className="mb-4 pb-4 border-b border-green-700 flex flex-wrap gap-4 items-center justify-between">
        <div>
          {room.status === 'waiting' && <p className="text-green-300 font-mono mb-2">System is waiting...</p>}
          {room.status === 'paused' && <p className="text-yellow-500 font-mono mb-2">System PAUSED.</p>}
          {(room.status === 'waiting' || room.status === 'paused') ? (
            <button 
              onClick={handleStartGame}
              className="bg-green-500 text-black px-6 py-2 font-bold font-mono hover:bg-green-400"
            >
               {room.status === 'paused' ? 'RESUME SCENARIO' : 'INITIATE SCENARIO'}
            </button>
          ) : (
            <button 
              onClick={handlePauseGame}
              className="bg-yellow-600 text-black px-6 py-2 font-bold font-mono hover:bg-yellow-500"
            >
               HALT SCENARIO (PAUSE)
            </button>
          )}
        </div>
        
        {room.status !== 'waiting' && room.status !== 'finished' && (
          <div className="flex flex-col items-end border border-green-500 p-2 bg-black gap-2">
            <span className="text-sm text-green-400">Time Override</span>
            <div className="flex gap-2">
              <button onClick={() => handleTimeChange(-60)} className="bg-red-800 px-3 hover:bg-red-600 text-white font-mono">-1m</button>
              <button onClick={() => handleTimeChange(60)} className="bg-green-800 px-3 hover:bg-green-600 text-white font-mono">+1m</button>
            </div>
            <form onSubmit={handleSetTime} className="flex gap-2 mt-1">
              <input type="number" name="newTime" placeholder="mins" min="1" className="w-16 bg-black border border-green-500 text-green-500 text-center font-mono outline-none" required />
              <button type="submit" className="bg-gray-800 text-white px-2 hover:bg-gray-600 font-mono text-sm">SET</button>
            </form>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center">
        <span className="text-green-500 font-mono py-1">&gt; Final Password: </span>
        {showPassword ? (
            <span className="text-white font-mono px-2">{room.finalPassword}</span>
        ) : (
            <span className="text-gray-500 font-mono px-2">********</span>
        )}
        <button onClick={() => setShowPassword(!showPassword)} className="bg-green-700 text-white font-bold font-mono px-2 py-1 text-xs ml-2 hover:bg-green-600 outline-none border border-green-400">
          {showPassword ? 'HIDE' : 'SHOW'}
        </button>
      </div>
      
      <form onSubmit={handleSendHint} className="flex gap-2">
        <span className="text-green-500 font-mono py-1">&gt; Broadcast Hint:</span>
        <input 
          type="text" 
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Enter data injection..."
          className="bg-black border border-green-500 text-green-300 px-2 py-1 flex-grow outline-none font-mono"
        />
        <button type="submit" className="bg-green-700 text-white font-bold font-mono px-4 py-1 hover:bg-green-600 outline-none border border-green-400">
          TRANSMIT
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;
