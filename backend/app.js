// import modules
const express = require("express");
const app = express();
const cors = require("cors");

// import routes
const roomRoutes = require("./routes/roomRoutes");
const connectMongoDB = require("./config/mongodb");

require("dotenv").config();

const corsOptions = {
  origin: process.env.FRONTEND_URI,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

// middleware
app.use(express.json());
app.use(cors(corsOptions));

// database connection
connectMongoDB()

// routing
app.use("/rooms", roomRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
