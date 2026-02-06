// import modules
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

//  import socket handlers
const roomSocket = require("./sockets/roomSocket");
const gameSocket = require("./sockets/gameSocket");

// import routes
const roomRoutes = require("./routes/roomRoutes");

// import config
const connectMongoDB = require("./config/mongodb");
const { connectRedis } = require("./config/redis");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URI,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// middleware
const corsOptions = {
  origin: process.env.FRONTEND_URI,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

// database connection
connectMongoDB();
connectRedis();

// web socket
roomSocket(io);
gameSocket(io);

// routing
app.use("/rooms", roomRoutes);

server.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
