const { client } = require("../config/redis");
const Song = require("../models/Song");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", async ({ room_id, player_username, player_id }) => {
      socket.join(room_id);

      await client.ZADD(`rooms:${room_id}:scores`, {
        score: 0,
        value: `${player_id}:${player_username}`,
      });

      const room = await client.HGETALL(`rooms:${room_id}:details`);
      const hostId = room.host_id;
      const players = await client.ZRANGE_WITHSCORES(
        `rooms:${room_id}:scores`,
        0,
        -1,
      );

      const formattedPlayers = players.map((player) => {
        const id = player.value.split(":")[0];
        const username = player.value.split(":")[1];
        return {
          id,
          username,
          score: player.score,
        };
      });

      if (room.status === "playing") {
        const song = await Song.aggregate([
          { $sample: { size: 1 } },

          {
            $lookup: {
              from: "animes", // Nama koleksi tujuan di MongoDB (biasanya huruf kecil & jamak)
              localField: "anime_id", // Field di model Song
              foreignField: "_id", // Field di model Anime
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

        const timerLeft = await client.HGET(
          `rooms:${room_id}:details`,
          "guessing_duration",
        );

        io.to(room_id).emit("game-playing", {
          players: formattedPlayers,
          timer_left: timerLeft,
          current_song: song[0],
        });
      } else if (room.status === "waiting") {
        io.to(room_id).emit("players-update", {
          players: formattedPlayers,
          total_players: formattedPlayers.length,
          max_players: room.max_players,
          host_id: hostId,
        });
      }
    });
  });
};
