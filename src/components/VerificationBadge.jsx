import { BadgeCheck } from "lucide-react";
import { MockTag } from "./MockTag";

/* 목록/카드에서 쓰는 작은 인증마크. 인증 안 된 항목은 그냥 안 보이는 게 맞아서 null 반환. */
export function VerificationBadge({ verification }) {
  if (!verification?.verified) return null;
  return (
    <span className="inline-flex items-center gap-1 border border-black bg-black text-white px-2 py-0.5 text-[11px] shrink-0">
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
      <div className="flex items-center gap-2 mb-5">
        <h2 className="font-serif-kr text-xl">에디터 인증</h2>
        <MockTag />
      </div>
      {verified ? (
        <div className="border border-black p-5">
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck size={16} />
            <h3 className="font-serif-kr text-base">에디터가 검수한 항목이야</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            이 배지는 "믿어달라"가 아니라 "확인할 수 있다"는 뜻이야. 아래 근거를 직접 확인해봐.
          </p>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs text-gray-400 mb-1">출처</div>
              <ul className="list-disc list-inside space-y-0.5 text-black">
                {verification.sources.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            {verification.copyrightHolder && (
              <div>
                <div className="text-xs text-gray-400 mb-1">원저작권자</div>
                <div className="text-black">{verification.copyrightHolder}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-gray-400 mb-1">검수</div>
              <div className="text-black">
                {verification.reviewedBy} · {verification.reviewedAt}
              </div>
            </div>
            {verification.changeLog?.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">수정 이력</div>
                <ul className="space-y-1">
                  {verification.changeLog.map((c, i) => (
                    <li key={i} className="text-xs text-gray-600">
                      {c.date} · {c.editor} — {c.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 p-5 text-sm text-gray-500 leading-relaxed">
          아직 에디터 검수를 거치지 않은 실시간 트랙 항목이야. 유행이 지나거나 언급량이 충분히 쌓이면
          에디터가 출처를 검수해서 인증마크를 부여해.
        </div>
      )}
    </section>
  );
}
