import { useState } from "react";
import { PlusCircle, Sparkles, Trash2 } from "lucide-react";
import { createMeme, updateMeme } from "../lib/api";
import { CATEGORIES } from "../data/memes";
import { GRADES } from "../data/grades";

function splitCsv(text) {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// 타임라인/관련 영상/관련 인물처럼 "행을 추가/삭제하는 목록" UI를 한 군데서 재사용.
function RowListField({ label, rows, setRows, fields, addLabel }) {
  const emptyRow = Object.fromEntries(fields.map((f) => [f.key, ""]));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="block text-xs text-neutral-400">{label}</span>
        <button
          type="button"
          onClick={() => setRows([...rows, emptyRow])}
          className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
        >
          <PlusCircle size={13} /> {addLabel}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-neutral-400">아직 추가된 항목이 없어(선택 사항).</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-2 bg-neutral-50 rounded-xl p-2.5">
              <div className={`flex-1 grid gap-1.5 ${fields.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                {fields.map((f) => (
                  <input
                    key={f.key}
                    value={row[f.key]}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], [f.key]: e.target.value };
                      setRows(next);
                    }}
                    placeholder={f.placeholder}
                    className="input-field !py-1.5 text-sm"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
                className="text-neutral-300 hover:text-rose-500 mt-1.5 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 등록과 수정을 같은 폼으로 처리함. editing(기존 밈)이 있으면 수정 모드 — 기존 값으로 채워서 시작하고,
// 서버가 필드를 통째로 교체하므로 손 안 댄 필드도 그대로 다시 보냄. id는 URL에 쓰여서 수정 불가.
export function RegisterMemeView({ user, setView, memes, refreshMemes, prefill, editing }) {
  const [id, setId] = useState(editing?.id ?? "");
  const [name, setName] = useState(editing?.name ?? prefill?.name ?? "");
  const [categories, setCategories] = useState(editing?.categories ?? (prefill?.category ? [prefill.category] : []));
  const [oneLiner, setOneLiner] = useState(editing?.oneLiner ?? prefill?.oneLiner ?? "");
  const [oneLineSummary, setOneLineSummary] = useState(editing?.oneLineSummary ?? "");
  const [whatIsIt, setWhatIsIt] = useState(editing?.whatIsIt ?? "");
  const [whyPopular, setWhyPopular] = useState(editing?.whyPopular ?? "");
  const [howToUse, setHowToUse] = useState(editing?.howToUse ?? "");
  const [platforms, setPlatforms] = useState(editing?.platforms.join(", ") ?? "");
  const [period, setPeriod] = useState(editing?.period ?? "");
  const [keywords, setKeywords] = useState(editing?.keywords.join(", ") ?? "");
  const [registeredAt, setRegisteredAt] = useState(
    (editing ? new Date(editing.registeredAt) : new Date()).toISOString().slice(0, 10),
  );
  const [buzz, setBuzz] = useState(editing?.popularity.buzz ?? 50);
  const [search, setSearch] = useState(editing?.popularity.search ?? 50);
  const [usage, setUsage] = useState(editing?.popularity.usage ?? 50);
  const [trend, setTrend] = useState(editing?.popularity.trend.join(",") ?? "");
  const [timeline, setTimeline] = useState(editing?.timeline ?? []);
  const [relatedVideos, setRelatedVideos] = useState(editing?.relatedVideos ?? []);
  const [relatedPeople, setRelatedPeople] = useState(editing?.relatedPeople ?? []);
  const [relatedMemeIds, setRelatedMemeIds] = useState(editing?.relatedMemeIds ?? []);
  // 아카이브 기록·근거(전부 선택). 날짜는 "2007" / "2007.03" / "2007.03.12" 문자열 — 2000년대 밈은 연/월만 확실한 경우가 많아서.
  const [grade, setGrade] = useState(editing?.grade ?? "");
  const [firstRecord, setFirstRecord] = useState({
    date: editing?.firstRecord?.date ?? "",
    source: editing?.firstRecord?.source ?? "",
    url: editing?.firstRecord?.url ?? "",
  });
  const [peak, setPeak] = useState({
    date: editing?.peak?.date ?? "",
    evidence: editing?.peak?.evidence ?? "",
    url: editing?.peak?.url ?? "",
  });
  const [spreadPath, setSpreadPath] = useState(editing?.spreadPath.join(", ") ?? "");
  const [sourceLinks, setSourceLinks] = useState(editing?.sourceLinks ?? []);
  const [unverified, setUnverified] = useState(editing?.unverified.join("\n") ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  if (!user || !["editor", "admin"].includes(user.role)) {
    return <div className="max-w-md mx-auto px-5 py-20 text-center text-neutral-500">에디터 권한이 필요해.</div>;
  }

  // 수정 중인 밈 자신은 관련 밈 후보에서 뺌.
  const otherMemes = memes.filter((m) => m.id !== editing?.id);

  const toggleCategory = (c) => {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const toggleRelated = (rid) => {
    setRelatedMemeIds((prev) => (prev.includes(rid) ? prev.filter((x) => x !== rid) : [...prev, rid]));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (categories.length === 0) return setError("카테고리를 하나 이상 선택해줘");
    const trendNums = splitCsv(trend)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    if (trendNums.length < 2) return setError("유행 추이 수치를 2개 이상 콤마로 구분해서 입력해줘 (예: 40,52,61)");

    const fields = {
      name,
      categories,
      oneLiner,
      oneLineSummary,
      whatIsIt,
      whyPopular,
      howToUse,
      platforms: splitCsv(platforms),
      period,
      keywords: splitCsv(keywords),
      registeredAt,
      buzz: Number(buzz),
      search: Number(search),
      usage: Number(usage),
      trend: trendNums,
      timeline: timeline.filter((t) => t.date && t.text),
      relatedVideos: relatedVideos.filter((v) => v.title && v.channel),
      relatedPeople: relatedPeople.filter((p) => p.name && p.reason && p.content),
      relatedMemeIds,
      grade: grade || null,
      firstRecord,
      peak,
      spreadPath: splitCsv(spreadPath),
      sourceLinks: sourceLinks.filter((l) => l.title || l.url),
      unverified: unverified
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      if (editing) {
        await updateMeme(editing.id, fields);
        await refreshMemes();
        setView({ name: "detail", id: editing.id });
        return;
      }
      const created = await createMeme({ id: id.trim(), submissionId: prefill?.submissionId, ...fields });
      await refreshMemes();
      setDone(created);
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
          <Sparkles size={22} />
        </div>
        <h1 className="font-serif-kr text-2xl mb-2">등록 완료</h1>
        <p className="text-sm text-neutral-500 mb-8">"{done.name}"이(가) 밈 사전에 새로 등록됐어.</p>
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setView({ name: "detail", id: done.id })} className="btn-primary">
            등록된 밈 보기
          </button>
          <button onClick={() => setView({ name: "submissionQueue" })} className="btn-secondary">
            제보 큐로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-1">{editing ? "밈 수정" : "밈 등록"}</h1>
      <p className="text-sm text-neutral-400 mb-8">
        {editing ? `"${editing.name}"의 내용을 고쳐서 저장해.` : "승인된 제보를 실제 밈 콘텐츠로 검수해서 등록해."}
      </p>

      {prefill?.sourceUrl && (
        <div className="surface-card p-4 mb-6 text-sm">
          <span className="text-neutral-400">제보자가 알려준 출처: </span>
          <a href={prefill.sourceUrl} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline break-all">
            {prefill.sourceUrl}
          </a>
        </div>
      )}

      <form onSubmit={submit} className="surface-card p-6 sm:p-7 space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs text-neutral-400 mb-1.5">
              {editing ? "고유 ID(링크가 깨지지 않게 수정 불가)" : "고유 ID(영문 소문자, URL에 씀)"}
            </span>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="예: ddujjonkku"
              required
              disabled={!!editing}
              className="input-field disabled:text-neutral-400 disabled:cursor-not-allowed"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-neutral-400 mb-1.5">이름</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
          </label>
        </div>

        <div>
          <span className="block text-xs text-neutral-400 mb-1.5">카테고리(1개 이상)</span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => toggleCategory(c)}
                className={`pill ring-1 transition-colors ${
                  categories.includes(c)
                    ? "bg-violet-100 text-violet-700 ring-violet-300"
                    : "bg-white text-neutral-500 ring-neutral-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <input value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} placeholder="한 줄 소개" required className="input-field" />
        <input
          value={oneLineSummary}
          onChange={(e) => setOneLineSummary(e.target.value)}
          placeholder="한 줄 요약(상세 페이지 하단 강조 문구)"
          required
          className="input-field"
        />
        <textarea
          value={whatIsIt}
          onChange={(e) => setWhatIsIt(e.target.value)}
          placeholder="이게 뭐야?"
          required
          rows={2}
          className="input-field resize-none"
        />
        <textarea
          value={whyPopular}
          onChange={(e) => setWhyPopular(e.target.value)}
          placeholder="왜 유행했어?"
          required
          rows={2}
          className="input-field resize-none"
        />
        <textarea
          value={howToUse}
          onChange={(e) => setHowToUse(e.target.value)}
          placeholder="어떻게 사용해?"
          required
          rows={2}
          className="input-field resize-none"
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={platforms}
            onChange={(e) => setPlatforms(e.target.value)}
            placeholder="주요 플랫폼(콤마 구분, 예: 인스타그램, 틱톡)"
            required
            className="input-field"
          />
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="유행 시기(예: 2025.02 ~ 진행중)"
            required
            className="input-field"
          />
        </div>
        <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="관련 키워드(콤마 구분)" required className="input-field" />
        <label className="block">
          <span className="block text-xs text-neutral-400 mb-1.5">등록 시점(트렌드 정렬 기준)</span>
          <input type="date" value={registeredAt} onChange={(e) => setRegisteredAt(e.target.value)} required className="input-field" />
        </label>

        <div>
          <span className="block text-xs text-neutral-400 mb-1.5">유행 지표 (Mock 성격 — 에디터 수동 입력)</span>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <label className="block">
              <span className="block text-[11px] text-neutral-400 mb-1">화제성</span>
              <input type="number" min="0" max="100" value={buzz} onChange={(e) => setBuzz(e.target.value)} className="input-field" />
            </label>
            <label className="block">
              <span className="block text-[11px] text-neutral-400 mb-1">검색량</span>
              <input type="number" min="0" max="100" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" />
            </label>
            <label className="block">
              <span className="block text-[11px] text-neutral-400 mb-1">사용 빈도</span>
              <input type="number" min="0" max="100" value={usage} onChange={(e) => setUsage(e.target.value)} className="input-field" />
            </label>
          </div>
          <input
            value={trend}
            onChange={(e) => setTrend(e.target.value)}
            placeholder="관심도 추이(콤마 구분, 2개 이상, 예: 40,52,61,70,78,82)"
            required
            className="input-field"
          />
        </div>

        <RowListField
          label="유래와 확산 과정 (선택)"
          rows={timeline}
          setRows={setTimeline}
          fields={[
            { key: "date", placeholder: "시기(예: 2025.02)" },
            { key: "text", placeholder: "무슨 일이 있었는지" },
          ]}
          addLabel="타임라인 추가"
        />
        <RowListField
          label="관련 영상 (선택)"
          rows={relatedVideos}
          setRows={setRelatedVideos}
          fields={[
            { key: "title", placeholder: "영상 제목" },
            { key: "channel", placeholder: "채널명" },
          ]}
          addLabel="영상 추가"
        />
        <RowListField
          label="관련 인물 (선택)"
          rows={relatedPeople}
          setRows={setRelatedPeople}
          fields={[
            { key: "name", placeholder: "이름/활동명" },
            { key: "reason", placeholder: "관련된 이유" },
            { key: "content", placeholder: "출처(영상명 등)" },
          ]}
          addLabel="인물 추가"
        />

        {/* 아카이브 기록·근거 — "데이터 수집 방안" 양식. 전부 선택이라 지금 유행 중인 밈은 비워두고 등록해도 됨. */}
        <div className="rounded-xl bg-neutral-50 ring-1 ring-neutral-200/70 p-4 space-y-4">
          <div>
            <span className="block text-sm font-medium text-neutral-800">기록과 근거 (선택 · 아카이브용)</span>
            <span className="block text-xs text-neutral-400 mt-0.5">
              과거 밈을 검증된 아카이브로 만들 때 채워. 날짜는 2007 / 2007.03 / 2007.03.12 형식.
            </span>
          </div>
          <label className="block">
            <span className="block text-xs text-neutral-400 mb-1.5">등급</span>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="input-field bg-white">
              <option value="">미분류 (아직 판정 안 함)</option>
              {Object.entries(GRADES).map(([k, g]) => (
                <option key={k} value={k}>
                  {g.label} — {g.desc}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="block text-xs text-neutral-400 mb-1.5">가장 이른 확인 기록</span>
            <div className="grid sm:grid-cols-[7rem_1fr] gap-1.5">
              <input value={firstRecord.date} onChange={(e) => setFirstRecord({ ...firstRecord, date: e.target.value })} placeholder="2007.03" className="input-field bg-white" />
              <input value={firstRecord.source} onChange={(e) => setFirstRecord({ ...firstRecord, source: e.target.value })} placeholder="출처 (예: 국립국어원 2007 신어 보고서)" className="input-field bg-white" />
            </div>
            <input value={firstRecord.url} onChange={(e) => setFirstRecord({ ...firstRecord, url: e.target.value })} placeholder="출처 링크 (선택, https://...)" className="input-field bg-white mt-1.5" />
          </div>
          <div>
            <span className="block text-xs text-neutral-400 mb-1.5">정점 시기</span>
            <div className="grid sm:grid-cols-[7rem_1fr] gap-1.5">
              <input value={peak.date} onChange={(e) => setPeak({ ...peak, date: e.target.value })} placeholder="2007.08" className="input-field bg-white" />
              <input value={peak.evidence} onChange={(e) => setPeak({ ...peak, evidence: e.target.value })} placeholder="근거 (예: 연말 결산 기사 '올해의 유행어' 선정)" className="input-field bg-white" />
            </div>
            <input value={peak.url} onChange={(e) => setPeak({ ...peak, url: e.target.value })} placeholder="근거 링크 (선택, https://...)" className="input-field bg-white mt-1.5" />
          </div>
          <label className="block">
            <span className="block text-xs text-neutral-400 mb-1.5">확산 경로 (콤마 구분, 순서대로)</span>
            <input value={spreadPath} onChange={(e) => setSpreadPath(e.target.value)} placeholder="예: 디시인사이드, 다음 카페, 방송" className="input-field bg-white" />
          </label>
          <RowListField
            label="원본 소재 링크 (재배포 대신 링크만)"
            rows={sourceLinks}
            setRows={setSourceLinks}
            fields={[
              { key: "title", placeholder: "제목 (예: 원본 영상)" },
              { key: "url", placeholder: "https://..." },
            ]}
            addLabel="링크 추가"
          />
          <label className="block">
            <span className="block text-xs text-neutral-400 mb-1.5">아직 확인하지 못한 것 (한 줄에 하나)</span>
            <textarea value={unverified} onChange={(e) => setUnverified(e.target.value)} placeholder={"예: 최초 발화자 미확인\n예: 2005년 이전 기록 못 찾음"} rows={2} className="input-field bg-white resize-none" />
          </label>
        </div>

        {otherMemes.length > 0 && (
          <div>
            <span className="block text-xs text-neutral-400 mb-1.5">관련 밈 (선택)</span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {otherMemes.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggleRelated(m.id)}
                  className={`pill ring-1 transition-colors ${
                    relatedMemeIds.includes(m.id)
                      ? "bg-violet-100 text-violet-700 ring-violet-300"
                      : "bg-white text-neutral-500 ring-neutral-200"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
          {editing ? (submitting ? "저장 중..." : "수정 저장") : submitting ? "등록 중..." : "밈으로 등록하기"}
        </button>
      </form>
    </div>
  );
}
