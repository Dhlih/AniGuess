const { client } = require("../config/redis");
const getRandomSong = require("./getRandomSong");

const proceedToNextRound = async (io, room_id) => {
  const songs = await getRandomSong(4);
  const selectedSong = songs[0];
  const answerOptions = songs.map((song) => song.title);

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

  const guessingDurationStr = await client.HGET(
    `rooms:${room_id}:details`,
    "guessing_duration",
  );
  const guessingDuration = Number(guessingDurationStr) || 15;
  const endAt = Date.now() + guessingDuration * 1000;

  // Simpan data lagu ke Redis
  await client.HSET(`rooms:${room_id}:current_song`, {
    video_url: selectedSong.video_url,
    title: selectedSong.title,
    end_at: endAt.toString(),
    // Simpan sebagai string JSON agar mudah diambil kembali
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
    setTimeout(() => {
      // Cek apakah room masih ada (belum dihapus)
      // Jika masih ada, lanjut ke ronde berikutnya
      proceedToNextRound(io, room_id);
    }, 5000);
  }, guessingDuration * 1000);
};

module.exports = proceedToNextRound;
