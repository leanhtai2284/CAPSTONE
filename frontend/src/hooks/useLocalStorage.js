import { useState, useEffect, useCallback } from "react";

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw
        ? JSON.parse(raw)
        : typeof initialValue === "function"
        ? initialValue()
        : initialValue;
    } catch (err) {
      console.error(`useLocalStorage read error for ${key}:`, err);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      if (state === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (err) {
      console.error(`useLocalStorage write error for ${key}:`, err);
    }
  }, [key, state]);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`useLocalStorage remove error for ${key}:`, err);
    }
    setState(
      typeof initialValue === "function" ? initialValue() : initialValue
    );
  }, [key, initialValue]);

  return [state, setState, remove];
}

export default useLocalStorage;
