import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { FaPlay, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/userContext";

const Home = () => {
  const { username, setUsername, setUserId } = useContext(UserContext);
  const navigate = useNavigate();

  const saveUserData = () => {
    if (username.length < 1) return;

    const userId = window.crypto.randomUUID();

    localStorage.setItem("aniguess_uid", userId);
    localStorage.setItem("aniguess_username", username);

    setUserId(userId);
    setUsername(username);

    navigate("/rooms");
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-[#04121a] p-5 selection:bg-[#5F9598]/30 overflow-hidden">
      {/* Background Decor (Opsional: menambah kesan kedalaman) */}
      <div className="absolute w-64 h-64 bg-[#5F9598]/10 rounded-full blur-[100px] -top-10 -left-10" />
      <div className="absolute w-64 h-64 bg-[#1D546D]/20 rounded-full blur-[100px] -bottom-10 -right-10" />

      <Card className="max-w-md w-full bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl text-white rounded-2xl overflow-hidden">
        <CardHeader className="text-center pt-10 pb-6">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            AniGuess
          </h1>
          <p className="text-gray-400 text-sm mt-2 tracking-wide uppercase">
            LET'S TEST YOUR ANIME OPENING KNOWLEDGE
          </p>
        </CardHeader>

        <CardContent className="space-y-4 px-8">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-gray-500 ml-1">
              USERNAME
            </Label>
            <Input
              className="px-5 py-7 bg-white/5 border-white/10 focus:border-[#5F9598] focus:ring-[#5F9598] text-white rounded-xl placeholder:text-gray-600 transition-all"
              onChange={(evt) => setUsername(evt.target.value)}
              placeholder="Enter your username..."
              value={username || ""}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center gap-4 p-8 pt-4">
          <Button
            className="w-full md:w-1/2 py-7 bg-[#5F9598] hover:bg-[#4d7a7d] text-white rounded-xl font-bold flex gap-2 items-center justify-center transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#5F9598]/20"
            onClick={saveUserData}
          >
            <FaPlay className="text-xs" /> Solo Mode
          </Button>

          <Button
            className="w-full sm:w-1/2 py-7 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold flex gap-2 items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
            onClick={saveUserData}
          >
            <FaUsers /> Browse Rooms
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Home;
