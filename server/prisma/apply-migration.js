// 5432 포트가 막힌 네트워크(PC방 등)에선 `prisma migrate deploy`가 안 돼서 마이그레이션은 이 방식으로 통일함(CLAUDE.md "DB 스키마 변경" 참고).
// 대신: `migrate diff --script`로 뽑은 SQL 파일을 여기로 직접 실행함(443만 씀).
// 실행: node prisma/apply-migration.js prisma/migrations/<타임스탬프>_<이름>/migration.sql
//
// Neon의 WebSocket(Pool) 대신 HTTP(neon()) 모드를 씀 — 클라우드 Claude Code 컨테이너는 아웃바운드가 HTTP 프록시를 거치는데
// WebSocket은 그 프록시를 못 타서 연결이 끊김(2026-10-24 확인). HTTP 모드는 Node 22.21+의 NODE_USE_ENV_PROXY=1로 프록시를 탐.
// HTTP 모드는 한 요청에 한 문장만 보낼 수 있어서 SQL 파일을 ';' 기준으로 쪼개 순서대로 실행함(마이그레이션 SQL은 전부 단순 DDL이라 충분).
import "dotenv/config";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("사용법: node prisma/apply-migration.js <migration.sql 경로>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL이 없어 — server/.env 또는 환경변수로 넣어줘");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const statements = readFileSync(sqlPath, "utf8")
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log(`적용 완료: ${sqlPath} (${statements.length}개 문장)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
