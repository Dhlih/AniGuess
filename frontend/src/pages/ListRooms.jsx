import React, { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  FaArrowLeft,
  FaMusic,
  FaUsers,
  FaSearch,
  FaPlus,
  FaClock,
} from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { SocketContext } from "@/context/SocketContext";
import { UserContext } from "@/context/userContext";

const ListRooms = () => {
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [guessingDuration, setGuessingDuration] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const socket = useContext(SocketContext);
  const { username, userId } = useContext(UserContext);
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!maxPlayers || !totalSongs || !guessingDuration) return;

    try {
      const response = await axios.post("http://127.0.0.1:3000/rooms", {
        max_players: Number(maxPlayers),
        total_songs: Number(totalSongs),
        guessing_duration: Number(guessingDuration),
        host_id: userId,
        host_username: username,
      });

      const roomId = response.data.data.room_id;
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error("Error saat create room:", error);
    }
  };

  const getRoomsData = async () => {
    const idQuery = searchParams.get("id") || "";
    const response = await axios.get(
      `http://127.0.0.1:3000/rooms?id=${idQuery}`,
    );
    setData(response.data.data);
  };

  const joinRoom = async (roomId) => {
    try {
      socket.emit("join-room", {
        room_id: roomId,
        player_id: userId,
        player_username: username,
      });
    } catch (error) {
      console.error("Error saat join room:", error);
    }
  };

  useEffect(() => {
    getRoomsData();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#04121a] p-6">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
            >
              <FaArrowLeft className="text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Browse Rooms
              </h1>
              <p className="text-gray-400 text-sm">
                Find a place to listen together
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group flex items-center gap-4">
              <div>
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search room ID..."
                  className="bg-[#061E29]/50 border-white/10 text-white pl-10 pr-4 py-6 w-full md:w-64 rounded-xl"
                  onChange={(e) => setSearchParams({ id: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      getRoomsData();
                    }
                  }}
                />
              </div>

              <Button
                className="bg-[#5F9598] hover:bg-[#4d7a7d] text-white px-6 py-6 rounded-xl font-semibold flex gap-2 items-center transition-all hover:scale-105"
                onClick={() => {
                  setShowModal(true);
                }}
              >
                <FaPlus />
                <span>Create Room</span>
              </Button>
            </div>

            {/* MODAL CREATE ROOM */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogContent className="bg-[#0b2633] border-white/10 text-white sm:max-w-[425px] rounded-2xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#5F9598]">
                    Configure Room
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Set up your room settings before inviting players.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  {/* Input Durasi */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <FaClock className="text-[#5F9598]" /> Guessing Duration
                      (sec)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 20"
                      onChange={(evt) => setGuessingDuration(evt.target.value)}
                      className="bg-white/5 border-white/10 py-6 focus:ring-[#5F9598]"
                    />
                  </div>

                  {/* Input Jumlah Lagu */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <FaMusic className="text-[#5F9598]" /> Number of Songs
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      onChange={(evt) => setTotalSongs(evt.target.value)}
                      className="bg-white/5 border-white/10 py-6 focus:ring-[#5F9598]"
                    />
                  </div>

                  {/* Input Jumlah Orang */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <FaUsers className="text-[#5F9598]" /> Max Players
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 5"
                      onChange={(evt) => setMaxPlayers(evt.target.value)}
                      className="bg-white/5 border-white/10 py-6 focus:ring-[#5F9598]"
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    className="w-full py-6 bg-[#5F9598] hover:bg-[#4d7a7d] font-bold text-lg rounded-xl transition-all shadow-lg shadow-[#5f9598]/20"
                    onClick={() => createRoom()}
                  >
                    Launch Room
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Grid Room (tetap sama seperti sebelumnya) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.rooms?.map((room, index) => (
            <Card
              key={index}
              className="bg-[#112b36]/40 border-white/5 backdrop-blur-sm text-white transition-all hover:-translate-y-2 group"
            >
              <CardContent className="p-6 space-y-6">
                <h3 className="text-2xl font-mono font-bold text-[#5F9598]">
                  {room?.room_id}
                </h3>
                <div className="flex items-center justify-between text-gray-300 text-sm">
                  <div className="flex items-center gap-2">
                    <FaMusic className="text-gray-500" />{" "}
                    <span>{room?.total_songs} Songs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-gray-500" />{" "}
                    <span>
                      {room?.total_player}/{room?.max_players}
                    </span>
                  </div>
                </div>
                <Link to={`/rooms/${room?.room_id}`} className="block">
                  <Button
                    className="w-full py-6 bg-white/5 group-hover:bg-[#5F9598] border border-white/10 group-hover:border-transparent text-white rounded-xl transition-all font-bold"
                    onClick={() => joinRoom(room?.room_id)}
                  >
                    Join Room
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListRooms;
