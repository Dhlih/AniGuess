import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getUserData = () => {
    setUsername(localStorage.getItem("aniguess_username"));
    setUserId(localStorage.getItem("aniguess_uid"));

    setIsLoading(false);
  };

  useEffect(() => {
    getUserData();  
  }, []);

  return (
    <UserContext.Provider
      value={{ username, userId, setUsername, setUserId, isLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};
