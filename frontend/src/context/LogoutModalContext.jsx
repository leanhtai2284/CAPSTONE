import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import LogoutModal from "../components/ui/LogoutModal";

const LogoutModalContext = createContext();

export const LogoutModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirmCallback, setOnConfirmCallback] = useState(() => () => {});

  const openLogoutModal = useCallback((onConfirm) => {
    setOnConfirmCallback(() => onConfirm || (() => {}));
    setIsOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <LogoutModalContext.Provider value={{ openLogoutModal, closeLogoutModal }}>
      {children}

      {/* GLOBAL MODAL MUST HAVE AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <LogoutModal
            onClose={closeLogoutModal}
            onConfirm={() => {
              onConfirmCallback();
              closeLogoutModal();
            }}
          />
        )}
      </AnimatePresence>
    </LogoutModalContext.Provider>
  );
};

export const useLogoutModal = () => useContext(LogoutModalContext);
