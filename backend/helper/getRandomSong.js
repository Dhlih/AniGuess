const Song = require("../models/Song");

const getRandomSong = async () => {
  const song = await Song.aggregate([
    { $sample: { size: 1 } },

    {
      $lookup: {
        from: "animes",
        localField: "anime_id",
        foreignField: "_id",
        as: "anime", // Nama field baru untuk hasilnya
      },
    },
    { $unwind: "$anime" },
    {
      $project: {
        video_url: 1,
        title: "$anime.title", // Memindahkan title anime ke level utama agar rapi
        _id: 0,
      },
    },
  ]);

  return song[0]
};

module.exports = getRandomSong;
