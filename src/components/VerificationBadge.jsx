import { BadgeCheck, Clock } from "lucide-react";
import { MockTag } from "./MockTag";

/* 목록/카드에서 쓰는 작은 인증마크. 인증 안 된 항목은 그냥 안 보이는 게 맞아서 null 반환.
   브랜드 그라데이션(트렌드)과 구분되게 에메랄드 톤을 써서 "신뢰/검증"이라는 의미를 색으로도 전달함. */
export function VerificationBadge({ verification }) {
  if (!verification?.verified) return null;
  return (
    <span className="pill bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70 shrink-0 gap-1">
      <BadgeCheck size={12} /> 에디터 인증
    </span>
  );
}

/* 상세 페이지용 전체 섹션. 인증 여부와 무관하게 항상 렌더링해서
   "이 항목은 아직 실시간/미검증 트랙"이라는 상태 자체도 보여줌. */
export function VerificationSection({ verification }) {
  const verified = verification?.verified;
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-1 h-5 rounded-full brand-gradient" />
        <h2 className="font-serif-kr text-xl">에디터 인증</h2>
        <MockTag />
      </div>
      {verified ? (
        <div className="surface-card p-5 sm:p-6 ring-emerald-200/70">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BadgeCheck size={16} />
            </span>
            <h3 className="font-serif-kr text-base">에디터가 검수한 항목이야</h3>
          </div>
          <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
            이 배지는 "믿어달라"가 아니라 "확인할 수 있다"는 뜻이야. 아래 근거를 직접 확인해봐.
          </p>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs text-neutral-400 mb-1.5">출처</div>
              <ul className="space-y-1 text-neutral-800">
                {verification.sources.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-500 shrink-0">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            {verification.copyrightHolder && (
              <div>
                <div className="text-xs text-neutral-400 mb-1">원저작권자</div>
                <div className="text-neutral-800">{verification.copyrightHolder}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-neutral-400 mb-1">검수</div>
              <div className="text-neutral-800">
                {verification.reviewedBy} · {verification.reviewedAt}
              </div>
            </div>
            {verification.changeLog?.length > 0 && (
              <div className="pt-3 border-t border-neutral-100">
                <div className="text-xs text-neutral-400 mb-1.5 flex items-center gap-1">
                  <Clock size={11} /> 수정 이력
                </div>
                <ul className="space-y-1">
                  {verification.changeLog.map((c, i) => (
                    <li key={i} className="text-xs text-neutral-500">
                      {c.date} · {c.editor} — {c.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="surface-card p-5 text-sm text-neutral-500 leading-relaxed">
          아직 에디터 검수를 거치지 않은 실시간 트랙 항목이야. 유행이 지나거나 언급량이 충분히 쌓이면
          에디터가 출처를 검수해서 인증마크를 부여해.
        </div>
      )}
    </section>
  );
}
