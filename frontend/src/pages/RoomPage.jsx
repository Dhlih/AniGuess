import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import WaitingRoom from "./WaitingRoom";
import PlayingRoom from "./PlayingRoom";
import { UserContext } from "@/context/UserContext";

const RoomPage = () => {
  const [roomStatus, setRoomStatus] = useState("");
  const { username, userId } = useContext(UserContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const checkRoomAccess = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:3000/rooms/${id}/validate`,
        {
          params: { player_id: userId, player_username: username },
        },
      );
      const data = response.data.data;
      const isUserInRoom = data.is_player_in_room;

      if (!isUserInRoom) {
        console.log("tidak boleh masuk!")
        navigate("/rooms");
      }

      setRoomStatus(data.room_status);
    } catch (error) {
      console.log("Gagal mengambil status room", error);
    }
  };

  useEffect(() => {
    console.log(id, username, userId);
    checkRoomAccess();
  }, [userId, username]);

  return (
    <div>
      {roomStatus === "waiting" && (
        <WaitingRoom roomId={id} setRoomStatus={setRoomStatus} />
      )}
      {roomStatus === "playing" && <PlayingRoom />}
    </div>
  );
};

export default RoomPage;
