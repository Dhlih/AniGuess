import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { useParams } from "react-router-dom";
import { FaTrophy, FaClock, FaPaperPlane } from "react-icons/fa";

const Playing = () => {
  const { roomId } = useParams();

  const players = [
    { name: "Dhlih", correct: 1, wrong: 1, score: 120 },
    { name: "Zoro", correct: 0, wrong: 2, score: 0 },
    { name: "Luffy", correct: 3, wrong: 0, score: 450 },
  ];

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
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span
                    className={`text-lg font-black ${
                      index === 0 ? "text-yellow-500" : "text-gray-500"
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">
                      {player.name}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {player.correct} Correct • {player.wrong} Wrong
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
          {/* Video Player Placeholder */}
          <Card className="overflow-hidden bg-black border-none shadow-2xl aspect-video flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div className="z-20 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#5F9598] border-t-transparent animate-spin mb-4 mx-auto" />
              <p className="text-sm font-medium tracking-widest text-gray-300 uppercase">
                Waiting for Audio...
              </p>
            </div>
            {/* Room Indicator */}
            <div className="absolute top-4 left-4 z-20 bg-black/50 px-3 py-1 rounded-full text-xs border border-white/10">
              Room: <span className="text-[#5F9598] font-mono">{roomId}</span>
            </div>
          </Card>

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Blue Bird - Naruto",
              "Gurenge - Demon Slayer",
              "Unravel - Tokyo Ghoul",
              "Silhouette - Naruto",
            ].map((option, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-16 justify-start px-6 bg-white/5 border-white/10 hover:bg-[#5F9598] hover:text-white hover:border-transparent transition-all duration-300 rounded-2xl text-left font-medium group"
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
          {/* Timer Card */}
          <Card className="bg-[#5F9598] border-none p-6 text-center shadow-lg shadow-[#5F9598]/20">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FaClock className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Time Remaining
              </span>
            </div>
            <h2 className="text-5xl font-black font-mono">24</h2>
          </Card>

          {/* Chat Card */}
          <Card className="bg-white/5 border-white/10 flex flex-col h-[400px]">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">
                Live Chat
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-white">
              <div className="text-sm">
                <span className="text-[#5F9598] font-bold">Luffy:</span> Gampang
                banget! 🍖
              </div>
              <div className="text-sm">
                <span className="text-gray-400 font-bold">Zoro:</span> Gue
                nyasar ke room mana ini?
              </div>
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
              <Input
                placeholder="Type a message..."
                className="bg-white/5 border-white/10 text-sm focus:ring-[#5F9598] text-white"
              />
              <Button size="icon" className="bg-[#5F9598] hover:bg-[#4d7a7d]">
                <FaPaperPlane className="text-xs" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Playing;
