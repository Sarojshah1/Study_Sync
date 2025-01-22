const express = require('express');
const { connectionmongoDB } = require("./connection");
const fileUpload = require('express-fileupload');
const cors = require("cors");
const morgan = require("morgan");
const socketIo = require('./utils/socket');
const { Server } = require('socket.io');
const http = require('http');
const chatRoutes = require('./routes/chatRoutes');
const corsOptions = {
    origin: true, 
    credentials: true, 
    optionSuccessStatus: 201
};
const app = express();
const PORT = process.env.PORT || 3000;
connectionmongoDB("mongodb://localhost:27017/studysync");

app.use(express.json());
app.use(fileUpload());
app.use(cors(corsOptions));
app.use(express.urlencoded({limit: '10mb', extended: true }));
app.use(morgan("dev"));
app.use(express.static("./public"));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
});
app.set('io', io);
let activeRooms = {}; // Store active rooms with users
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room based on context_id (study group)
  socket.on('joinRoom', (context_id) => {
      if (!context_id) {
          console.error('Invalid context_id');
          return;
      }
      console.log(`User with socket.id ${socket.id} joining room: ${context_id}`);
      socket.join(context_id);

      // Track the room and add the user to the list of active members
      if (!activeRooms[context_id]) {
          activeRooms[context_id] = [];
      }
      activeRooms[context_id].push(socket.id);

      socket.emit("joinedRoom", context_id);
      console.log(`Users in room ${context_id}: ${activeRooms[context_id].join(", ")}`);

      // Start a call if there are 5 users in the room
      if (activeRooms[context_id].length === 5) {
        io.to(context_id).emit('startCall', context_id); // Notify all users to start the call
      }
  });
  socket.on('typing', (context_id, userId) => {
    socket.broadcast.to(context_id).emit('userTyping', userId);  
  });

  // Handle incoming call
  socket.on('incomingCall', (callerId, context_id) => {
      if (!context_id) {
          console.error('Context ID is missing when sending incoming call');
          return;
      }

      // Log the incoming call
      console.log(`Incoming call from ${callerId} to room ${context_id}`);

      socket.broadcast.to(context_id).emit('incomingCall', {
        callerId,
        context_id
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Remove the user from activeRooms
      for (let context_id in activeRooms) {
          const index = activeRooms[context_id].indexOf(socket.id);
          if (index !== -1) {
              activeRooms[context_id].splice(index, 1);
              console.log(`User removed from room ${context_id}. Users remaining: ${activeRooms[context_id].join(", ")}`);
          }
      }
  });
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/studyGroup", require("./routes/StudyGroupRoutes"));
app.use("/api/projects", require("./routes/ProjectRoutes"));
app.use("/api/task", require("./routes/taskRoutes"));
app.use('/api/chats', chatRoutes);
app.use('/api/videoCall', require('./routes/videocall'));
app.use('/api/otp',require('./routes/Otproutes'));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
