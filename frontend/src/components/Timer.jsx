import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";
import { Card } from "./ui/card";

const Timer = ({ targetEndAt, serverTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!targetEndAt || !serverTime) return;

    const timeOffset = Date.now() - serverTime;

    const interval = setInterval(() => {
      const adjustedNow = Date.now() - timeOffset;
      const difference = targetEndAt - adjustedNow;
      const seconds = Math.max(0, Math.ceil(difference / 1000));

      setTimeLeft(seconds);

      // Berhenti jika sudah 0
      if (seconds <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Jalankan kalkulasi pertama secara manual agar UI langsung terisi
    const initialAdjustedNow = Date.now() - timeOffset;
    const initialSeconds = Math.max(
      0,
      Math.ceil((targetEndAt - initialAdjustedNow) / 1000),
    );
    setTimeLeft(initialSeconds);

    // Cleanup function
    return () => clearInterval(interval);
  }, [targetEndAt, serverTime]);

  return (
    <Card className="bg-[#5F9598] border-none p-6 text-center shadow-lg shadow-[#5F9598]/20">
      <div className="flex items-center justify-center gap-3 mb-2 text-white">
        {/* Ikon jam hanya berdenyut jika waktu masih ada */}
        <FaClock className={timeLeft > 0 ? "animate-pulse" : ""} />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">
          Time Remaining
        </span>
      </div>
      <h2
        className={`text-5xl font-black font-mono  ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}
      >
        {timeLeft}
      </h2>
    </Card>
  );
};

export default Timer;
