import { createContext, useContext, useState, useEffect } from "react";

export const STORE_LIMIT = 15;
export const CUSTOMER_LIMIT = 4;
const STORAGE_KEY = "sc_inventory";

function getNextThursdayReset() {
  const now = new Date();
  const daysUntilThursday = (4 - now.getDay() + 7) % 7;
  const candidate = new Date(now);
  candidate.setDate(now.getDate() + daysUntilThursday);
  candidate.setHours(1, 0, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 7);
  }
  return candidate.getTime();
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function freshState() {
  const data = { weeklyOrdered: 0, resetAt: getNextThursdayReset() };
  save(data);
  return data;
}

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = load();
    if (saved && Date.now() < saved.resetAt) return saved;
    return freshState();
  });

  useEffect(() => {
    const check = () => {
      const saved = load();
      if (saved && Date.now() >= saved.resetAt) {
        const next = freshState();
        setState(next);
      }
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  const remaining = STORE_LIMIT - state.weeklyOrdered;
  const isSoldOut = remaining <= 0;

  function recordOrder(quantity) {
    setState((prev) => {
      const next = { ...prev, weeklyOrdered: prev.weeklyOrdered + quantity };
      save(next);
      return next;
    });
  }

  return (
    <InventoryContext.Provider
      value={{ weeklyOrdered: state.weeklyOrdered, remaining, isSoldOut, recordOrder }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used inside InventoryProvider");
  return ctx;
}
