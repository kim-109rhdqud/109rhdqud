import { useEffect, useState } from "react";
import { loadStored, saveStored } from "../lib/storage";
import { logout as apiLogout, me } from "../lib/api";

export function useAppState() {
  const [view, setViewRaw] = useState({ name: "home" });
  // 로그인 세션은 이제 서버(httpOnly 쿠키)가 들고 있어서 localStorage엔 안 남김 —
  // 새로고침 시 /auth/me로 서버에 물어봐서 로그인 여부를 확인함(아래 useEffect).
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [scraps, setScraps] = useState(() => loadStored("scraps", []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => loadStored("recentlyViewed", []));

  useEffect(() => {
    me().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

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

  const logout = () => {
    setUser(null);
    apiLogout().catch(() => {
      /* 쿠키 만료 등으로 이미 로그아웃 상태여도 화면상으론 로그아웃 처리하면 되니 무시 */
    });
  };

  return { view, setView, user, setUser, authChecked, scraps, toggleScrap, recentlyViewed, logout };
}
