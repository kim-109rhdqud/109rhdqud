const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "유행도감 <onboarding@resend.dev>";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Resend HTTPS API를 fetch로 직접 호출 — SDK 의존성 없이 이 PC방 네트워크에서도
// 막히지 않는 443 포트만 쓰게 하려는 목적(CLAUDE.md의 Postgres 5432 차단 사례와 같은 이유).
export async function sendVerificationEmail(user, token) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY가 없어서 인증 메일을 못 보냄 (server/.env 확인)");
    return;
  }

  const verifyUrl = `${CLIENT_ORIGIN}/verify-email?token=${token}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: user.email,
      subject: "[유행도감] 이메일 인증을 완료해줘",
      html: `<p>안녕하세요, ${user.nickname}님!</p><p>아래 링크를 눌러 이메일 인증을 완료해주세요 (24시간 이내 유효):</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend 발송 실패 (${res.status}): ${body}`);
  }
}
