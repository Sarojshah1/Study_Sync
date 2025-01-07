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
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({limit: '10mb', extended: true }));
app.use(morgan("dev"));
app.use(express.static("./public"))
const server = http.createServer(app);
// const io = socketIo.init(server);
const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });
  app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
  
    // Join a room based on context_id
    socket.on('joinRoom', (context_id) => {
      console.log(`User joined room: ${context_id}`);
      socket.join(context_id);
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use("/api/user",require("./routes/userRoutes"));
app.use("/api/studyGroup",require("./routes/StudyGroupRoutes"))
app.use("/api/projects",require("./routes/ProjectRoutes"))
app.use("/api/task",require("./routes/taskRoutes"))
app.use('/api/chats', chatRoutes);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});