const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// In-memory store for active rooms
const activeRooms = {}; 

const sanitizeRoom = (room) => {
  const { timerInterval, ...safeRoom } = room;
  return safeRoom;
};

const getSanitizedRooms = () => {
  return Object.values(activeRooms).map(sanitizeRoom);
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- LOBBY LOGIC ---
  socket.on('join_lobby', () => {
    socket.join('lobby');
    socket.emit('lobby_update', getSanitizedRooms());
  });

  socket.on('create_room', (roomData) => {
    const roomId = Math.random().toString(36).substring(2, 9);
    const newRoom = { ...roomData, roomId, host: socket.id, players: [], status: 'waiting', timeLeft: roomData.timeLimit * 60 };
    activeRooms[roomId] = newRoom;
    
    io.to('lobby').emit('lobby_update', getSanitizedRooms());
    socket.emit('room_created', roomId);
  });

  // --- ROOM LOGIC ---
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    if(activeRooms[roomId]) {
      activeRooms[roomId].players.push(socket.id);
      io.to(roomId).emit('room_state_update', sanitizeRoom(activeRooms[roomId]));
    }
  });

  socket.on('start_game', (roomId) => {
    const room = activeRooms[roomId];
    if (room && room.host === socket.id && (room.status === 'waiting' || room.status === 'paused')) {
      room.status = 'active';
      io.to(roomId).emit('room_state_update', sanitizeRoom(room));

      if (room.timerInterval) clearInterval(room.timerInterval);

      // Start Timer
      room.timerInterval = setInterval(() => {
        room.timeLeft -= 1;
        io.to(roomId).emit('timer_tick', room.timeLeft);
        
        if (room.timeLeft <= 0) {
          clearInterval(room.timerInterval);
          room.status = 'finished';
          io.to(roomId).emit('game_over', { success: false, message: 'SYSTEM COMPROMISED. Time ran out.', theme: room.theme });
        }
      }, 1000);
    }
  });

  socket.on('pause_game', (roomId) => {
    const room = activeRooms[roomId];
    if (room && room.host === socket.id && room.status === 'active') {
      clearInterval(room.timerInterval);
      room.status = 'paused';
      io.to(roomId).emit('room_state_update', sanitizeRoom(room));
    }
  });

  socket.on('change_time', ({ roomId, change }) => {
    const room = activeRooms[roomId];
    if (room && room.host === socket.id) {
      room.timeLeft += change;
      if (room.timeLeft < 0) room.timeLeft = 0;
      io.to(roomId).emit('timer_tick', room.timeLeft);
      if(room.timeLeft === 0 && room.status === 'active') {
         clearInterval(room.timerInterval);
         room.status = 'finished';
         io.to(roomId).emit('game_over', { success: false, message: 'SYSTEM COMPROMISED. Time ran out.', theme: room.theme });
      }
    }
  });

  socket.on('set_time', ({ roomId, time }) => {
    const room = activeRooms[roomId];
    if (room && room.host === socket.id) {
      room.timeLeft = parseInt(time, 10);
      if (room.timeLeft < 0) room.timeLeft = 0;
      io.to(roomId).emit('timer_tick', room.timeLeft);
      if(room.timeLeft === 0 && room.status === 'active') {
         clearInterval(room.timerInterval);
         room.status = 'finished';
         io.to(roomId).emit('game_over', { success: false, message: 'SYSTEM COMPROMISED. Time ran out.', theme: room.theme });
      }
    }
  });

  socket.on('submit_password', ({ roomId, password }) => {
    const room = activeRooms[roomId];
    if (room && room.status === 'active') {
      io.to(roomId).emit('guess_attempt', password);
      if (password === room.finalPassword) {
        clearInterval(room.timerInterval);
        room.status = 'finished';
        io.to(roomId).emit('game_over', { success: true, message: 'ACCESS GRANTED. You have escaped!' });
      } else {
        socket.emit('password_rejected', 'INVALID CREDENTIALS');
      }
    }
  });

  socket.on('delete_room', (roomId) => {
    const room = activeRooms[roomId];
    if (room && room.host === socket.id) {
      delete activeRooms[roomId];
      io.to('lobby').emit('lobby_update', getSanitizedRooms());
      io.to(roomId).emit('room_deleted');
    }
  });

  socket.on('send_hint', ({ roomId, hint }) => {
    io.to(roomId).emit('receive_hint', hint);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
