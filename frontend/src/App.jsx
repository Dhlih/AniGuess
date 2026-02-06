import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import { UserContext, UserProvider } from "./context/userContext";
import { useContext, useEffect } from "react";
import axios from "axios";

import Home from "./pages/Home";
import ListRooms from "./pages/ListRooms";
import RoomPage from "./pages/RoomPage";

const AppRoutes = () => {
  const { username, userId, isLoading } = useContext(UserContext);
  const hasCredentials = username && userId;

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/rooms"
        element={hasCredentials ? <ListRooms /> : <Navigate to="/" />}
      />

      <Route
        path="/rooms/:id"
        element={hasCredentials ? <RoomPage /> : <Navigate to="/" />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <UserProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </UserProvider>
  );
};

export default App;
