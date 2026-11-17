import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchUser();
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};