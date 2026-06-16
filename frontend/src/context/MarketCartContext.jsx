import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "smartmeal.marketCart";
const MarketCartContext = createContext(null);

const loadCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to read market cart:", error);
    return [];
  }
};

export const MarketCartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item, quantity = 1) => {
    if (!item?.storeId || !item?.productId) {
      return { ok: false, reason: "invalid-item" };
    }

    if (items.length > 0 && items[0].storeId !== item.storeId) {
      return { ok: false, reason: "different-store" };
    }

    setItems((prev) => {
      const existing = prev.find((entry) => entry.productId === item.productId);
      if (existing) {
        return prev.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry,
        );
      }
      return [...prev, { ...item, quantity }];
    });

    return { ok: true };
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const summary = useMemo(() => {
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    return { quantity, subtotal };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      summary,
    }),
    [items, summary],
  );

  return (
    <MarketCartContext.Provider value={value}>
      {children}
    </MarketCartContext.Provider>
  );
};

export const useMarketCart = () => {
  const context = useContext(MarketCartContext);
  if (!context) {
    throw new Error("useMarketCart must be used within MarketCartProvider");
  }
  return context;
};
