import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrophy, FaClock, FaPaperPlane } from "react-icons/fa";
import { SocketContext } from "@/context/SocketContext";
import { UserContext } from "@/context/UserContext";
import ReactPlayer from "react-player"; // Pastikan import ini
import Timer from "@/components/Timer";

const PlayingRoom = () => {
  const [data, setData] = useState("");
  const [answerOptions, setAnswerOptions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteBtn, setShowUnmuteBtn] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [roundEnded, setRoundEnded] = useState(false);

  const { id: roomId } = useParams();
  const navigate = useNavigate()

  const socket = useContext(SocketContext);
  const { username, userId } = useContext(UserContext);

  const sendMessage = async () => {
    if (chatInput.trim().length === 0) return;

    console.log("mengirimkan pesan", chatInput);

    socket.emit("message", {
      player_id: userId,
      player_username: username,
      message: chatInput,
      room_id: roomId,
    });

    setChatInput("");
  };

  const handleUnmute = () => {
    setIsMuted(false);
    setShowUnmuteBtn(false);
  };

  const submitAnswer = async (answer) => {
    if (!userAnswer) {
      setUserAnswer(answer);

      socket.emit("submit-answer", {
        player_answer: answer,
        player_username: username,
        player_id: userId,
        room_id: roomId,
      });
    } else {
      alert("Anda sudah mengirim jawaban!");
    }
  };

  useEffect(() => {
    socket.emit("join-room", {
      room_id: roomId,
      player_id: userId,
      player_username: username,
    });

    socket.on("game-playing", ({ players, ...incomingData }) => {
      setCorrectAnswer("");
      setRoundEnded(false);

      setData(incomingData);
      setPlayers(players);

      console.log(incomingData);
      setAnswerOptions(incomingData.answer_options);

      const rawUrl = incomingData.current_song.video_url;
      setVideoUrl(rawUrl);
    });

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
      console.log("pesan : ", data);
    });

    socket.on("round-ended", (data) => {
      setUserAnswer("");
      setRoundEnded(true);
      setCorrectAnswer(data.correct_answer);
    });

    socket.on("game-ended", () => {
      navigate("/rooms")
    })

    socket.on("leaderboard-update", ({ players }) => {
      setPlayers(players);
    });

    return () => {
      socket.off("game-playing");
      socket.off("leaderboard-update");
      socket.off("message");
    };
  }, [roomId, socket, userId, username]);

  return (
    <div className="w-full min-h-screen bg-[#04121a] text-white p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Leaderboard */}
        <Card className="lg:col-span-3 bg-white/5 border-white/10 backdrop-blur-md border-none h-fit">
          <div className="p-5 border-b border-white/10 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            <h2 className="font-bold text-xl tracking-tight text-white">
              Leaderboard
            </h2>
          </div>
          <CardContent className="p-4 space-y-4">
            {players
              ?.sort(
                (currPlayer, nextPlayer) => nextPlayer.score - currPlayer.score,
              )
              .map((player, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span
                    className={`text-lg font-black ${index === 0 ? "text-yellow-500" : "text-gray-500"}`}
                  >
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">
                      {player.username}
                    </p>
                  </div>
                  <span className="font-mono text-[#5F9598] font-bold">
                    {player.score}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* CENTER COLUMN: Main Game Area */}
        <div className="lg:col-span-6 space-y-6">
          {/* Video Player Section */}
          <Card className="overflow-hidden bg-black border-none shadow-2xl aspect-video relative group flex items-center justify-center">
            {videoUrl ? (
              <div className="w-full h-full relative ">
                <ReactPlayer
                  key={videoUrl}
                  src={videoUrl}
                  width="100%"
                  height="100%"
                  playing={true}
                  muted={isMuted} // Menggunakan state
                  playsinline={true}
                  config={{
                    youtube: {
                      playerVars: { autoplay: 1, controls: 0 },
                    },
                  }}
                  onPlay={() => {
                    // Jika browser mengizinkan, coba langsung unmute
                    // Tapi biasanya tetap butuh klik user
                    console.log("Video playing...");
                  }}
                  className="pointer-events-none"
                />

                {/* Tombol Unmute Overlay */}
                {showUnmuteBtn && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Button
                      onClick={handleUnmute}
                      className="bg-[#5F9598] hover:bg-[#4d7a7d] text-white px-4 py-6 rounded-2xl text-lg font-bold shadow-2xl animate-bounce"
                    >
                      🔊 TURN ON AUDIO
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="z-20 text-center">
                <div className="w-20 h-20 rounded-full border-4 border-[#5F9598] border-t-transparent animate-spin mb-4 mx-auto" />
                <p className="text-sm font-medium tracking-widest text-gray-300 uppercase">
                  Waiting for Song...
                </p>
              </div>
            )}

            {/* Overlay Gradient (Optional: Menutupi visual video jika ingin audio-only) */}
            {/* <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
                <p className="text-[#5F9598] font-bold">GUESS THE SONG!</p>
            </div> */}

            <div className="absolute top-4 left-4 z-20 bg-black/50 px-3 py-1 rounded-full text-xs border border-white/10">
              Room: <span className="text-[#5F9598] font-mono">{roomId}</span>
            </div>
          </Card>

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {answerOptions?.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                className={`h-16 justify-start px-6 bg-white/5 border-white/10 hover:bg-[#5F9598] hover:text-white hover:border-transparent transition-all duration-300 rounded-2xl text-left font-medium group 
                  ${option === userAnswer ? "bg-[#5F9598]" : ""} ${roundEnded ? (correctAnswer === option ? "bg-green-400" : "bg-red-400") : ""}`}
                onClick={() => {
                  submitAnswer(option);
                }}
              >
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3 group-hover:bg-white/20">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Timer & Chat */}
        <div className="lg:col-span-3 space-y-6">
          <Timer
            targetEndAt={data.target_end_at}
            serverTime={data.server_time}
          />
          <Card className="bg-white/5 border-white/10 flex flex-col flex-1 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Chat
              </h3>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 min-h-48 max-h-48 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 ">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`w-full flex ${msg.player_id === userId ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col">
                    <p
                      className="text-[11px] font-bold mb-1 ml-1"
                      style={{ color: msg.color || "#5F9598" }}
                    >
                      {msg.player_id === userId ? "Me" : msg.player_username}
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-3 py-2 shadow-sm">
                      <p className="text-sm text-gray-200 break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Chat Area */}
            <div className="p-3 border-t border-white/10 bg-black/20">
              <form
                className="flex gap-2"
                onSubmit={(e) => e.preventDefault()} // Logika kirim silakan Anda tambahkan nanti
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-white/5 border-white/10 text-sm focus:ring-[#5F9598] text-white rounded-xl h-10"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-[#5F9598] hover:bg-[#4d7a7d] shrink-0 rounded-xl h-10 w-10"
                  onClick={() => sendMessage()}
                >
                  <FaPaperPlane className="text-xs" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayingRoom;
