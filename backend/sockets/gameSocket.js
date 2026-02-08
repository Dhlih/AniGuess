const { client } = require("../config/redis");
const getRandomSong = require("../helper/getRandomSong");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("start-game", async ({ room_id }) => {
      const song = await getRandomSong();

      let guessingDuration = await client.HGET(
        `rooms:${room_id}:details`,
        "guessing_duration",
      );
      const endAt = Date.now() + guessingDuration * 1000;

      await client.HSET(`rooms:${room_id}:current_song`, {
        video_url: song.video_url,
        title: song.title,
        end_at: endAt,
      });
      await client.HSET(`rooms:${room_id}:details`, "status", "playing");

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
