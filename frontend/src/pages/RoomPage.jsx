import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import PlayerView from '../components/PlayerView';
import AdminPanel from '../components/AdminPanel';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  const [roomState, setRoomState] = useState(null);
  const [isHost, setIsHost] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const isSpectator = searchParams.get('mode') === 'view';

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join the specific room
    socket.emit('join_room', roomId);

    // Listen for room state updates
    socket.on('room_state_update', (state) => {
      setRoomState(state);
      if (state.host === socket.id) {
        setIsHost(true);
      }
    });

    socket.on('room_deleted', () => {
      navigate('/');
    });

    return () => {
      socket.off('room_state_update');
      socket.off('room_deleted');
    };
  }, [socket, roomId, navigate]);

  if (!roomState) {
    return <div className="bg-black text-green-500 font-mono p-8 min-h-screen text-2xl">&gt; Establishing connection to system {roomId}...</div>;
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="p-4 bg-black border-b border-green-500 flex justify-between items-center font-mono">
        <div>
          {(!isSpectator && roomState.status === 'waiting') || isSpectator || isHost ? (
            <button onClick={() => navigate('/')} className="text-green-500 hover:text-green-300 uppercase transition-colors">
              &lt; Return to Local Network (Lobby)
            </button>
          ) : null}
        </div>
        <span className="text-green-500 uppercase">
          ID: {roomId} | Players: {roomState.players?.length || 0} {isSpectator && '| MODE: SPECTATOR'}
        </span>
      </div>
      
      <div className="p-8">
        {isHost && !isSpectator && <AdminPanel room={roomState} />}
        <PlayerView room={roomState} isSpectator={isSpectator} />
      </div>
    </div>
  );
};

export default RoomPage;
