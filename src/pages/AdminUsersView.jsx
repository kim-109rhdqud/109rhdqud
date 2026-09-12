import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { getUsers, updateUserRole } from "../lib/api";

const ROLE_LABEL = { user: "일반", editor: "에디터", admin: "관리자" };

export function AdminUsersView({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== "admin") {
    return <div className="max-w-md mx-auto px-5 py-20 text-center text-neutral-500">관리자 권한이 필요해.</div>;
  }

  const changeRole = (id, role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    updateUserRole(id, role).catch(() => {
      getUsers().then(setUsers);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-1 flex items-center gap-2">
        <ShieldCheck size={22} className="text-violet-500" /> 사용자 관리
      </h1>
      <p className="text-sm text-neutral-400 mb-8">역할을 바꾸면 즉시 적용돼(제보 승인/인증마크 갱신 권한).</p>

      {loading ? (
        <p className="text-sm text-neutral-400">불러오는 중...</p>
      ) : (
        <div className="surface-card divide-y divide-neutral-100 overflow-hidden">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 py-4 px-5">
              <div className="min-w-0">
                <div className="text-neutral-900 font-medium truncate">
                  {u.nickname} <span className="text-xs text-neutral-400">@{u.username}</span>
                </div>
                <div className="text-xs text-neutral-400 truncate">{u.email}</div>
              </div>
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value)}
                disabled={u.id === user.id}
                className="input-field w-auto py-1.5 bg-white text-sm shrink-0 disabled:opacity-50"
              >
                {Object.entries(ROLE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
