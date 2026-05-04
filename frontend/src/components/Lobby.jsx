import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Lobby = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    theme: 'phishing',
    timeLimit: 15,
    finalPassword: '',
    customThemeColor: '#00ff00',
    effect: 'matrix'
  });

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('join_lobby');
    
    socket.on('lobby_update', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    socket.on('room_created', (roomId) => {
      navigate(`/room/${roomId}`);
    });

    return () => {
      socket.off('lobby_update');
      socket.off('room_created');
    };
  }, [socket, navigate]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    socket.emit('create_room', newRoom);
  };

  const joinRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="bg-black text-green-500 font-mono p-8 min-h-screen">
      <h1 className="text-4xl mb-6 border-b border-green-500 pb-2">Active Target Systems (Lobby)</h1>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-xl">&gt; Select a network to infiltrate...</p>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-900 border border-green-500 px-4 py-2 hover:bg-green-700 text-green-100"
        >
          {showCreateForm ? 'Cancel' : 'Host New Mission'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="border border-green-500 p-4 mb-8 bg-black">
          <h2 className="text-2xl mb-4">Initialize New Room</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Room Name:</label>
              <input type="text" required className="bg-gray-900 border border-green-500 text-green-300 px-2 py-1 w-full outline-none" 
                value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
            </div>
            <div>
              <label className="block mb-1">Theme:</label>
              <select className="bg-gray-900 border border-green-500 text-green-300 px-2 py-1 w-full outline-none" 
                value={newRoom.theme} onChange={e => setNewRoom({...newRoom, theme: e.target.value})}>
                <option value="phishing">Phishing</option>
                <option value="ransomware">Ransomware</option>
                <option value="ddos">DDoS</option>
                <option value="breach">Data Breach</option>
                <option value="custom">Custom Array...</option>
              </select>
            </div>
            
            {newRoom.theme === 'custom' && (
              <>
                <div>
                  <label className="block mb-1">Custom Color (HEX):</label>
                  <div className="flex gap-2">
                    <input type="color" className="bg-gray-900 border border-green-500 h-8 w-12 cursor-pointer"
                      value={newRoom.customThemeColor} onChange={e => setNewRoom({...newRoom, customThemeColor: e.target.value})} />
                    <input type="text" className="bg-gray-900 border border-green-500 text-green-300 px-2 w-full outline-none font-mono"
                      value={newRoom.customThemeColor} onChange={e => setNewRoom({...newRoom, customThemeColor: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Animation Effect:</label>
                  <select className="bg-gray-900 border border-green-500 text-green-300 px-2 py-1 w-full outline-none" 
                    value={newRoom.effect} onChange={e => setNewRoom({...newRoom, effect: e.target.value})}>
                    <option value="matrix">Digital Rain (Matrix)</option>
                    <option value="radar">Network Radar</option>
                    <option value="glitch">Particle Glitch</option>
                    <option value="none">None (Blank)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block mb-1">Time Limit (mins):</label>
              <input type="number" required min="1" max="60" className="bg-gray-900 border border-green-500 text-green-300 px-2 py-1 w-full outline-none"
                value={newRoom.timeLimit} onChange={e => setNewRoom({...newRoom, timeLimit: e.target.value})} />
            </div>
            <div>
              <label className="block mb-1">Final Password:</label>
              <input type="text" required className="bg-gray-900 border border-green-500 text-green-300 px-2 py-1 w-full outline-none"
                value={newRoom.finalPassword} onChange={e => setNewRoom({...newRoom, finalPassword: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-green-700 border border-green-400 px-4 py-2 text-white hover:bg-green-600">
            Initialize
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length === 0 ? (
          <p className="text-gray-500">&gt; No active networks detected.</p>
        ) : (
          rooms.map(room => (
            <div key={room.roomId} className="border border-green-500 p-4 hover:shadow-[0_0_15px_rgba(0,255,0,0.5)] hover:border-green-300 transition-all">
              <h3 className="text-2xl mb-2">{room.name}</h3>
              <p>ID: {room.roomId}</p>
              <p>Theme: {room.theme}</p>
              <p>Status: {room.status}</p>
              <p>Players: {room.players?.length || 0}</p>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => joinRoom(room.roomId)}
                  className="flex-grow border border-green-500 px-4 py-1 hover:bg-green-900"
                >
                  BREACH
                </button>
                <button 
                  onClick={() => navigate(`/room/${room.roomId}?mode=view`)}
                  className="border border-green-500 px-4 py-1 hover:bg-green-900 text-gray-400"
                >
                  SPECTATE (TV)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Lobby;
