const { client } = require("../config/redis");
const proceedToNextRound = require("../helper/proceedToNexRound");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("start-game", async ({ room_id }) => {
      await client.HSET(`rooms:${room_id}:details`, {
        status: "playing",
        current_round: 1,
      });

      proceedToNextRound(io, room_id);

      io.to(room_id).emit("room-update", {
        status: "playing",
      });
    });

    socket.on(
      "submit-answer",
      async ({ room_id, player_answer, player_id, player_username }) => {
        const currentSong = await client.HGETALL(
          `rooms:${room_id}:current_song`,
        );
        const canGuess = Date.now() < Number(currentSong.end_at);

        if (canGuess && player_answer === currentSong.title) {
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

    socket.on("message", ({ room_id, message, player_id, player_username }) => {
      io.to(room_id).emit("message", {
        player_id,
        player_username,
        message,
      });
    });
  });
};
