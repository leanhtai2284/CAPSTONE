import React, { createContext, useContext, useState, useCallback } from "react";
import LoadingModal from "../components/ui/LoadingModal";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((value) => {
    setIsLoading(value);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      <LoadingModal isOpen={isLoading} /> {/* ✅ Modal luôn nằm ở trên cùng */}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
