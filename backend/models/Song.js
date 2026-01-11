const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  anime_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  video_url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Song", songSchema);
