import { useEffect, useState } from "react";
import {
  logout as apiLogout,
  me,
  getMemes,
  getScraps,
  addScrap,
  removeScrap,
  getRecentlyViewed,
  recordRecentlyViewed,
} from "../lib/api";
import { pathToView, viewToPath } from "../lib/routes";

function viewFromLocation() {
  return pathToView(window.location.pathname, new URLSearchParams(window.location.search));
}

export function useAppState() {
  // 첫 로드 시 현재 URL을 그대로 view로 해석 — 딥링크/새로고침이 어디서든 맞는 화면으로 뜨게 함.
  const [view, setViewRaw] = useState(viewFromLocation);
  // 로그인 세션은 이제 서버(httpOnly 쿠키)가 들고 있어서 localStorage엔 안 남김 —
  // 새로고침 시 /auth/me로 서버에 물어봐서 로그인 여부를 확인함(아래 useEffect).
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [memes, setMemes] = useState([]);
  const [memesLoading, setMemesLoading] = useState(true);
  // 스크랩은 이제 서버(DB)가 정본 — 로그인 필요, localStorage엔 더 이상 안 남김.
  const [scraps, setScraps] = useState([]);
  // 최근 본 밈도 스크랩과 동일 패턴: 서버(DB)가 정본, 로그인 시에만 채워짐 —
  // 비로그인 추적은 안 함(마이페이지가 어차피 로그인 필수라 도달 불가능한 경우라 단순화).
  const [recentlyViewed, setRecentlyViewed] = useState([]);

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

  // 밈 등록/수정/삭제(에디터·관리자) 직후처럼, 서버에서 바뀐 밈 목록을 화면 새로고침 없이 반영해야 할 때 씀.
  const refreshMemes = () => getMemes().then(setMemes).catch(() => {});

  useEffect(() => {
    const ids = user ? getScraps().then((list) => list.map((m) => m.id)) : Promise.resolve([]);
    ids.then(setScraps).catch(() => setScraps([]));
  }, [user]);

  useEffect(() => {
    const ids = user ? getRecentlyViewed().then((list) => list.map((m) => m.id)) : Promise.resolve([]);
    ids.then(setRecentlyViewed).catch(() => setRecentlyViewed([]));
  }, [user]);

  // 브라우저 뒤로가기(popstate)로 view가 바뀔 때는 URL이 이미 맞는 상태라 history를 다시 안 건드림 —
  // 그래서 실제 화면 갱신 로직은 따로 빼서 setView(사용자 액션)와 여기 둘 다에서 씀.
  const applyView = (v) => {
    setViewRaw(v);
    window.scrollTo?.(0, 0);
  };

  useEffect(() => {
    const onPopState = () => applyView(viewFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setView = (v) => {
    if (v.name === "detail" && user) {
      setRecentlyViewed((prev) => [v.id, ...prev.filter((id) => id !== v.id)].slice(0, 5));
      recordRecentlyViewed(v.id).catch(() => {
        /* 기록 실패해도 화면엔 큰 영향 없으니 조용히 무시 */
      });
    }
    const path = viewToPath(v);
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState(v, "", path);
    }
    applyView(v);
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
    refreshMemes,
    scraps,
    toggleScrap,
    recentlyViewed,
    logout,
  };
}
