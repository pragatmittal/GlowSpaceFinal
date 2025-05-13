const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const Message = require('./models/Message.model');
const jwt = require('jsonwebtoken');


const users = new Map(); 
const roomParticipants = new Map(); 

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', async (socket) => {
    // Assign a unique guest ID and username if not provided
    let guestId = uuidv4();
    let guestNumber = Math.floor(1000 + Math.random() * 9000);
    let guestUsername = `Guest${guestNumber}`;
    let assignedUser = { id: guestId, username: guestUsername };

    socket.on('joinRoom', async ({ username, room }) => {
      try {
        // Use provided username or assign guest username
        const finalUsername = username && username.startsWith('Guest') ? username : guestUsername;
        users.set(socket.id, { username: finalUsername, room, id: guestId });
        socket.join(room);
        if (!roomParticipants.has(room)) {
          roomParticipants.set(room, new Set());
        }
        roomParticipants.get(room).add(socket.id);
        const chatHistory = await Message.find({ room })
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();
        const participants = Array.from(roomParticipants.get(room)).map(socketId => {
          const user = users.get(socketId);
          return {
            id: user.id,
            username: user.username,
            socketId: socketId
          };
        });
        socket.emit('chatHistory', {
          messages: chatHistory.reverse(),
          participants
        });
        io.to(room).emit('updateParticipants', participants);
        socket.to(room).emit('userJoined', {
          username: finalUsername,
          userId: guestId,
          timestamp: new Date()
        });
        // Send assigned guest ID and username to the client
        socket.emit('roomJoined', {
          room,
          userId: guestId,
          username: finalUsername,
          participants
        });
      } catch (error) {
        console.error('Error in joinRoom:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('chatMessage', async ({ room, message }) => {
      try {
        const sender = users.get(socket.id);
        if (!sender) return;
        const newMessage = new Message({
          room,
          senderId: sender.id,
          username: sender.username,
          message,
          timestamp: new Date()
        });
        await newMessage.save();
        const messageObj = {
          _id: newMessage._id,
          room,
          senderId: sender.id,
          username: sender.username,
          message,
          timestamp: newMessage.timestamp
        };
        io.to(room).emit('chatMessage', messageObj);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('privateMessage', ({ to, message }) => {
      try {
        const sender = users.get(socket.id);
        if (!sender) {
          console.error('Sender not found for socket:', socket.id);
          return;
        }

        const privateMessage = {
          from: sender.id,
          message,
          timestamp: new Date()
        };

        const targetSocket = Array.from(users.entries())
          .find(([_, user]) => user.id === to)?.[0];

        if (targetSocket) {
          io.to(targetSocket).emit('privateMessage', privateMessage);
        } else {
          console.error('Target user not found:', to);
        }
      } catch (error) {
        console.error('Error in privateMessage:', error);
        socket.emit('error', { message: 'Failed to send private message' });
      }
    });

    socket.on('typing', ({ room }) => {
      try {
        const sender = users.get(socket.id);
        if (!sender) return;

        socket.to(room).emit('userTyping', {
          userId: sender.id,
          username: sender.username,
          room
        });
      } catch (error) {
        console.error('Error in typing:', error);
      }
    });

    socket.on('stopTyping', ({ room }) => {
      try {
        const sender = users.get(socket.id);
        if (!sender) return;

        socket.to(room).emit('userStoppedTyping', {
          userId: sender.id,
          room
        });
      } catch (error) {
        console.error('Error in stopTyping:', error);
      }
    });

    socket.on('disconnect', () => {
      try {
        console.log('Client disconnected:', socket.id);
        const user = users.get(socket.id);
        if (user) {
          const { room } = user;
          
          if (roomParticipants.has(room)) {
            roomParticipants.get(room).delete(socket.id);
            
            const participants = Array.from(roomParticipants.get(room)).map(socketId => {
              const user = users.get(socketId);
              return {
                id: user.id,
                username: user.username,
                socketId: socketId
              };
            });
            
            io.to(room).emit('updateParticipants', participants);
          }
          
          users.delete(socket.id);
          
          socket.to(room).emit('userLeft', {
            username: user.username,
            userId: user.id,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });

  return io;
};

module.exports = initializeSocket; 