const { client } = require("../config/redis");
const getRandomSong = require("./getRandomSong");

const proceedToNextRound = async (io, room_id) => {
  const room = await client.HGETALL(`rooms:${room_id}:details`);
  const isLastRound = Number(room.current_round) > Number(room.total_songs);

  if (isLastRound) {
    io.to(room_id).emit("game-ended");

    await client.del([
      `rooms:${room_id}:details`,
      `rooms:${room_id}:current_song`,
      `rooms:${room_id}:scores`,
    ]);

    return;
  }

  const songs = await getRandomSong(4);
  const selectedSong = songs[0];
  const answerOptions = songs.map((song) => song.title);

  const players = await client.zRangeWithScores(
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

  const guessingDurationStr = await client.HGET(
    `rooms:${room_id}:details`,
    "guessing_duration",
  );
  const guessingDuration = Number(guessingDurationStr) || 15;
  const endAt = Date.now() + guessingDuration * 1000;

  await client.HSET(`rooms:${room_id}:current_song`, {
    video_url: selectedSong.video_url,
    title: selectedSong.title,
    end_at: endAt.toString(),
    answer_options: JSON.stringify(answerOptions),
  });

  // Beritahu semua pemain: Lagu Mulai!
  io.to(room_id).emit("game-playing", {
    status: "playing",
    current_song: { video_url: selectedSong.video_url },
    target_end_at: endAt,
    server_time: Date.now(),
    answer_options: answerOptions,
    players: formattedPlayers,
  });

  // --- LOGIKA PERGANTIAN OTOMATIS ---
  // Server menunggu sampai durasi habis + sedikit jeda
  setTimeout(async () => {
    // 1. Beritahu semua orang ronde berakhir dan kasih tahu jawabannya
    io.to(room_id).emit("round-ended", {
      correct_answer: selectedSong.title,
    });

    // 2. Beri jeda 5 detik agar pemain bisa lihat jawaban & leaderboard
    setTimeout(async () => {
      await client.hIncrBy(`rooms:${room_id}:details`, "current_round", 1);

      proceedToNextRound(io, room_id);
    }, 5000);
  }, guessingDuration * 1000);
};

module.exports = proceedToNextRound;
