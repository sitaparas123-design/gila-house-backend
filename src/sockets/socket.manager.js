const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://restorentposback.softwaredemolive.live',
        'http://127.0.0.1:5173',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room based on role or orderId
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on('join_role', (role) => {
      socket.join(role);
      console.log(`User joined role room: ${role}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
