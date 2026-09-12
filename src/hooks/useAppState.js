import { useEffect, useState } from "react";
import { loadStored, saveStored } from "../lib/storage";
import { logout as apiLogout, me, getMemes, getScraps, addScrap, removeScrap } from "../lib/api";

export function useAppState() {
  const [view, setViewRaw] = useState({ name: "home" });
  // 로그인 세션은 이제 서버(httpOnly 쿠키)가 들고 있어서 localStorage엔 안 남김 —
  // 새로고침 시 /auth/me로 서버에 물어봐서 로그인 여부를 확인함(아래 useEffect).
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [memes, setMemes] = useState([]);
  const [memesLoading, setMemesLoading] = useState(true);
  // 스크랩은 이제 서버(DB)가 정본 — 로그인 필요, localStorage엔 더 이상 안 남김.
  const [scraps, setScraps] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => loadStored("recentlyViewed", []));

  useEffect(() => {
    me().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    getMemes()
      .then(setMemes)
      .catch(() => setMemes([]))
      .finally(() => setMemesLoading(false));
  }, []);

  useEffect(() => {
    const ids = user ? getScraps().then((list) => list.map((m) => m.id)) : Promise.resolve([]);
    ids.then(setScraps).catch(() => setScraps([]));
  }, [user]);

  useEffect(() => saveStored("recentlyViewed", recentlyViewed), [recentlyViewed]);

  const setView = (v) => {
    if (v.name === "detail") {
      setRecentlyViewed((prev) => [v.id, ...prev.filter((id) => id !== v.id)].slice(0, 5));
    }
    setViewRaw(v);
    window.scrollTo?.(0, 0);
  };

  const memeById = (id) => memes.find((m) => m.id === id);

  // 낙관적으로 먼저 바꾸고, 서버 요청이 실패하면(네트워크 오류 등) 원래 상태로 되돌림.
  const toggleScrap = (id) => {
    const wasScrapped = scraps.includes(id);
    setScraps((prev) => (wasScrapped ? prev.filter((x) => x !== id) : [...prev, id]));
    const request = wasScrapped ? removeScrap(id) : addScrap(id);
    request.catch(() => {
      setScraps((prev) => (wasScrapped ? [...prev, id] : prev.filter((x) => x !== id)));
    });
  };

  const logout = () => {
    setUser(null);
    apiLogout().catch(() => {
      /* 쿠키 만료 등으로 이미 로그아웃 상태여도 화면상으론 로그아웃 처리하면 되니 무시 */
    });
  };

  return {
    view,
    setView,
    user,
    setUser,
    authChecked,
    memes,
    memesLoading,
    memeById,
    scraps,
    toggleScrap,
    recentlyViewed,
    logout,
  };
}
