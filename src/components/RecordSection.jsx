import { ArrowRight, CircleHelp, ExternalLink, Link2 } from "lucide-react";
import { GradeBadge } from "./GradeBadge";
import { GRADES } from "../data/grades";

function RecordLink({ url, children }) {
  if (!url) return <span>{children}</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-violet-600 hover:underline break-all">
      {children} <ExternalLink size={11} className="shrink-0" />
    </a>
  );
}

/* 상세 페이지의 "기록과 근거" 섹션. 아카이브 등급·최초 확인 기록·정점 시기·확산 경로·원본 소재 링크·미확인 항목을
   보여줌 — "데이터 수집 방안"(노션) 피드백의 문서 양식을 그대로 화면으로 옮긴 것. 미확인 항목은 숨기지 않고
   그대로 노출하는 게 핵심(인증마크와 같은 "직접 확인할 수 있다" 철학). 아무 정보도 없으면 안내 문구만. */
export function RecordSection({ meme }) {
  const { grade, firstRecord, peak, spreadPath = [], sourceLinks = [], unverified = [] } = meme;
  const hasAny = grade || firstRecord || peak || spreadPath.length > 0 || sourceLinks.length > 0 || unverified.length > 0;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-1 h-5 rounded-full brand-gradient" />
        <h2 className="font-serif-kr text-xl">기록과 근거</h2>
        <GradeBadge grade={grade} />
      </div>

      {!hasAny ? (
        <div className="surface-card p-5 text-sm text-neutral-500 leading-relaxed">
          아직 기록 정보가 없어. 에디터가 최초 확인 기록·정점 시기·확산 경로를 출처와 함께 채우면 여기에 표시돼.
        </div>
      ) : (
        <div className="surface-card p-5 sm:p-6 space-y-5 text-sm">
          {grade && <p className="text-xs text-neutral-500 leading-relaxed">{GRADES[grade].desc}</p>}

          {(firstRecord || peak) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {firstRecord && (
                <div>
                  <div className="text-xs text-neutral-400 mb-1">가장 이른 확인 기록</div>
                  <div className="text-neutral-900 font-medium">{firstRecord.date}</div>
                  <div className="text-neutral-600 mt-0.5">
                    <RecordLink url={firstRecord.url}>{firstRecord.source}</RecordLink>
                  </div>
                </div>
              )}
              {peak && (
                <div>
                  <div className="text-xs text-neutral-400 mb-1">정점 시기</div>
                  <div className="text-neutral-900 font-medium">{peak.date}</div>
                  <div className="text-neutral-600 mt-0.5">
                    <RecordLink url={peak.url}>{peak.evidence}</RecordLink>
                  </div>
                </div>
              )}
            </div>
          )}

          {spreadPath.length > 0 && (
            <div>
              <div className="text-xs text-neutral-400 mb-1.5">확산 경로</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {spreadPath.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    <span className="pill bg-neutral-100 text-neutral-700">{p}</span>
                    {i < spreadPath.length - 1 && <ArrowRight size={12} className="text-neutral-300" />}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sourceLinks.length > 0 && (
            <div>
              <div className="text-xs text-neutral-400 mb-1.5 flex items-center gap-1">
                <Link2 size={11} /> 원본 소재
              </div>
              <ul className="space-y-1">
                {sourceLinks.map((l, i) => (
                  <li key={i}>
                    <RecordLink url={l.url}>{l.title}</RecordLink>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-neutral-400 mt-1.5">원본은 저작권자 페이지로 연결만 해. 유행도감이 직접 보관하지 않아.</p>
            </div>
          )}

          {unverified.length > 0 && (
            <div className="pt-4 border-t border-neutral-100">
              <div className="text-xs text-amber-700 mb-1.5 flex items-center gap-1">
                <CircleHelp size={11} /> 아직 확인하지 못한 것
              </div>
              <ul className="space-y-1 text-neutral-600">
                {unverified.map((u, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-400 shrink-0">•</span> {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
