import { useContext } from "react";
import { AuthContext } from "../context/auth";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider");
  return context;
};
