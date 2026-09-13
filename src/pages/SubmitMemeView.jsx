import { useState } from "react";
import { Megaphone } from "lucide-react";
import { createSubmission } from "../lib/api";
import { CATEGORIES } from "../data/memes";

export function SubmitMemeView({ user, setView }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [oneLiner, setOneLiner] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-neutral-600 mb-4">밈을 제보하려면 로그인이 필요해.</p>
        <button onClick={() => setView({ name: "auth" })} className="btn-primary">
          로그인하러 가기
        </button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createSubmission({ name, category, oneLiner, sourceUrl });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-5 py-20 text-center pop-in">
        <div className="w-14 h-14 rounded-full brand-gradient text-white flex items-center justify-center mx-auto mb-5">
          <Megaphone size={22} />
        </div>
        <h1 className="font-serif-kr text-2xl mb-2">제보 접수 완료</h1>
        <p className="text-sm text-neutral-500 mb-8">에디터가 검토한 뒤 등록 여부를 결정할 거야.</p>
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setView({ name: "mySubmissions" })} className="btn-primary">
            내 제보 목록 보기
          </button>
          <button
            onClick={() => {
              setName("");
              setCategory(CATEGORIES[0]);
              setOneLiner("");
              setSourceUrl("");
              setDone(false);
            }}
            className="btn-secondary"
          >
            또 제보하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-serif-kr text-3xl mb-1 flex items-center gap-2">
        <Megaphone size={22} className="text-violet-500" /> 밈 제보하기
      </h1>
      <p className="text-sm text-neutral-400 mb-8">요즘 뜨는 밈·유행어·상품을 알려줘. 에디터가 검토 후 등록할게.</p>

      <div className="surface-card p-6 sm:p-7">
        <form onSubmit={submit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="밈 이름"
            required
            className="input-field"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field bg-white">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            value={oneLiner}
            onChange={(e) => setOneLiner(e.target.value)}
            placeholder="한줄 설명"
            required
            rows={3}
            className="input-field resize-none"
          />
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            type="url"
            placeholder="출처 링크 (원본 게시물/영상 등)"
            required
            className="input-field"
          />

          {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 py-2.5">
            {submitting ? "제출 중..." : "제보하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
