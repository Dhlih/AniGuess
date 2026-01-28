const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  anime_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Anime",
    required: true,
  },
  video_url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Song", songSchema);
