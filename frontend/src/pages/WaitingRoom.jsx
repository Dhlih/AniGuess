import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FaPlay, FaTrash, FaUser, FaCrown, FaLink } from "react-icons/fa";
import { SocketContext } from "@/context/SocketContext";
import { UserContext } from "@/context/userContext";

const WaitingRoom = ({ roomId, setRoomStatus }) => {
  const [data, setData] = useState();
  const socket = useContext(SocketContext);
  const { username, userId } = useContext(UserContext);

  const startGame = async () => {
    socket.emit("start-game", {
      room_id: roomId,
    });

    socket.on("room-update", (data) => {
      setRoomStatus(data.status);
    });
  };

  useEffect(() => {
    socket.emit("join-room", {
      room_id: roomId,
      player_id: userId,
      player_username: username,
    });

    socket.on("players-update", (data) => {
      setData(data);
    });

    return () => {
      socket.off("players-update");
    };
  }, [socket, roomId, username, userId]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-[#04121a] p-5 selection:bg-[#5F9598]/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute w-64 h-64 bg-[#5F9598]/10 rounded-full blur-[100px] -top-10 -left-10" />
      <div className="absolute w-64 h-64 bg-[#1D546D]/20 rounded-full blur-[100px] -bottom-10 -right-10" />

      <Card className="max-w-2xl w-full bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl text-white rounded-2xl overflow-hidden relative z-10">
        <CardHeader className="pt-10 pb-6 px-8 flex flex-row justify-between items-end border-b border-white/5">
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Lobby Room
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="bg-[#5F9598]/10 border-[#5F9598]/30 text-[#5F9598] px-3 py-1"
              >
                ID: {roomId}
              </Badge>
              <button className="text-gray-500 hover:text-white transition-colors">
                <FaLink className="text-sm" />
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
              Players
            </p>
            <p className="text-2xl font-bold">
              {data?.total_players} / {data?.max_players}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 ml-1">
              Waiting for players...
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data?.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#5F9598]/20 rounded-lg">
                      <FaUser className="text-[#5F9598]" />
                    </div>
                    <span className="font-medium tracking-wide">
                      {player.id === userId ? "Me" : player.username}
                    </span>
                  </div>
                  {player.id === data?.host_id && (
                    <Badge className="bg-yellow-500/20 text-yellow-500 border-none flex gap-1 items-center px-2 py-0.5">
                      <FaCrown className="text-[10px]" /> Host
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        {userId === data?.host_id && (
          <CardFooter className="flex flex-col sm:flex-row items-center gap-4 p-8 pt-4 border-t border-white/5 bg-black/20">
            <Button
              className="w-full sm:w-1/2 py-7 bg-[#5F9598] hover:bg-[#4d7a7d] text-white rounded-xl font-bold flex gap-2 items-center justify-center transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#5F9598]/20"
              onClick={() => startGame()}
            >
              <FaPlay className="text-xs" /> Start Game
            </Button>

            <Button
              variant="destructive"
              className="w-full sm:w-1/2 py-7 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl font-bold flex gap-2 items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
            >
              <FaTrash /> Delete Room
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default WaitingRoom;
