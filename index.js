const express = require('express');
const { connectionmongoDB } = require("./connection");
const fileUpload = require('express-fileupload');
const cors = require("cors");
const morgan = require("morgan");
const corsOptions = {
    origin: true, // Replace with your client-side origin
    credentials: true, // Enable sending cookies with CORS
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

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use("/api/user",require("./routes/userRoutes"));
app.use("/api/studyGroup",require("./routes/StudyGroupRoutes"))
app.use("/api/projects",require("./routes/ProjectRoutes"))

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
