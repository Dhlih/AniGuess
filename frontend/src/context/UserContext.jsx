import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const getUserData = () => {
    setUsername(localStorage.getItem("aniguess_username"));
    setUserId(localStorage.getItem("aniguess_uid"));
  };

  const saveUserData = () => {
    if (username.length < 1) return;
    
    localStorage.setItem("aniguess_uid", window.crypto.randomUUID());
    localStorage.setItem("aniguess_username", username);

    navigate("/rooms");
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{ username, userId, setUsername, saveUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};
