const { client } = require("../config/redis");
const getRandomSong = require("../helper/getRandomSong");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("start-game", async ({ room_id }) => {
      const song = await getRandomSong();

      await client.HSET(`rooms:${room_id}:current_song`, song);
      await client.HSET(`rooms:${room_id}:details`, "status", "playing");

      io.to(room_id).emit("room-update", {
        status: "playing",
      });
    });

    socket.on(
      "submit-answer",
      async ({ room_id, player_answer, player_id, player_username }) => {
        const currentSongTitle = await client.HGET(
          `rooms:${room_id}:current_song`,
          "title",
        );

        if (player_answer === currentSongTitle) {
          await client.ZINCRBY(
            `rooms:${room_id}:scores`,
            100,
            `${player_id}:${player_username}`,
          );
        }

        const players = await client.ZRANGE_WITHSCORES(
          `rooms:${room_id}:scores`,
          0,
          -1,
        );

        const formattedPlayers = players.map((player) => {
          const [id, username] = player.value.split(":");
          return {
            id,
            username,
            score: player.score,
          };
        });

        io.to(room_id).emit("leaderboard-update", {
          players: formattedPlayers,
        });
      },
    );

    socket.on(
      "message",
      async ({ room_id, message, player_id, player_username }) => {
        io.to(room_id).emit("message", {
          player_id,
          player_username,
          message: message,
        });
      },
    );
  });
};
