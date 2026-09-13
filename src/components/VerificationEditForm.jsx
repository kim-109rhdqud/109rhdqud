import { useState } from "react";
import { PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import { updateVerification } from "../lib/api";

// 에디터/관리자 전용 인증마크 수정 폼. DetailView의 VerificationSection 아래 붙임.
// 서버는 PATCH할 때마다 필드를 통째로 교체(부분 병합 아님)하므로, 기존 값을 그대로 채워서 시작해야
// 손 안 댄 필드(원저작권자 등)가 빈 값으로 덮어써지지 않음.
export function VerificationEditForm({ meme, onUpdated }) {
  const v = meme.verification;
  const [verified, setVerified] = useState(!!v?.verified);
  const [sources, setSources] = useState(v?.sources?.length ? v.sources : [""]);
  const [copyrightHolder, setCopyrightHolder] = useState(v?.copyrightHolder ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateSource = (i, value) => {
    const next = [...sources];
    next[i] = value;
    setSources(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setDone(false);
    const cleanSources = sources.map((s) => s.trim()).filter(Boolean);
    if (verified && cleanSources.length < 2) {
      return setError("인증하려면 독립 출처가 2개 이상 필요해");
    }

    setSubmitting(true);
    try {
      await updateVerification(meme.id, {
        verified,
        sources: cleanSources,
        copyrightHolder: copyrightHolder.trim() || null,
        note: note.trim() || undefined,
      });
      setNote("");
      setDone(true);
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="surface-card p-5 sm:p-6 mt-4 ring-1 ring-violet-200/60">
      <h3 className="font-serif-kr text-base mb-3 flex items-center gap-1.5 text-violet-700">
        <ShieldCheck size={16} /> 에디터 전용 · 인증마크 수정
      </h3>
      <form onSubmit={submit} className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="rounded border-neutral-300"
          />
          인증됨으로 표시
        </label>

        <div>
          <span className="block text-xs text-neutral-400 mb-1.5">출처(인증하려면 2개 이상)</span>
          <div className="space-y-1.5">
            {sources.map((s, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  value={s}
                  onChange={(e) => updateSource(i, e.target.value)}
                  placeholder="출처 URL 또는 설명"
                  className="input-field !py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setSources(sources.filter((_, idx) => idx !== i))}
                  className="text-neutral-300 hover:text-rose-500 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSources([...sources, ""])}
            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 mt-1.5"
          >
            <PlusCircle size={13} /> 출처 추가
          </button>
        </div>

        <input
          value={copyrightHolder}
          onChange={(e) => setCopyrightHolder(e.target.value)}
          placeholder="원저작권자(선택)"
          className="input-field"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="수정 이력에 남길 메모(선택, 비우면 '검수 갱신')"
          className="input-field"
        />

        {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
        {done && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">반영됐어.</p>}
        <button type="submit" disabled={submitting} className="btn-secondary text-sm">
          {submitting ? "저장 중..." : "인증마크 갱신"}
        </button>
      </form>
    </div>
  );
}
