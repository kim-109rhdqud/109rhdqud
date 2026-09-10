import { useEffect, useState } from "react";
import { loadStored, saveStored } from "../lib/storage";

export function useAppState() {
  const [view, setViewRaw] = useState({ name: "home" });
  const [user, setUser] = useState(() => loadStored("user", null));
  const [scraps, setScraps] = useState(() => loadStored("scraps", []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => loadStored("recentlyViewed", []));

  useEffect(() => saveStored("user", user), [user]);
  useEffect(() => saveStored("scraps", scraps), [scraps]);
  useEffect(() => saveStored("recentlyViewed", recentlyViewed), [recentlyViewed]);

  const setView = (v) => {
    if (v.name === "detail") {
      setRecentlyViewed((prev) => [v.id, ...prev.filter((id) => id !== v.id)].slice(0, 5));
    }
    setViewRaw(v);
    window.scrollTo?.(0, 0);
  };

  const toggleScrap = (id) => {
    setScraps((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const logout = () => setUser(null);

  return { view, setView, user, setUser, scraps, toggleScrap, recentlyViewed, logout };
}
