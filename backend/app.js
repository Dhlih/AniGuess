const express = require("express");
const app = express();
const mongoose = require("mongoose");
const redis = require("redis");

require("dotenv").config();

// middleware
app.use(express.json());

// database config
const client = redis.createClient();

client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Redis Connected!"));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await client.connect({ url: process.env.REDIS_URI });
    console.log("Connected to database MongoDB and Redis");
  } catch (error) {
    console.log("Failed to connect to database", error);
  }
};

connectDB();

app.get("/", async (req, res) => {
  res.json({ msg: "hello" });
});

app.get("/rooms", (req, res) => {
  const { room_id } = req.query;
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
