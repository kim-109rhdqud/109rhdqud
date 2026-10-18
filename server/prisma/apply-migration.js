// 5432 포트가 막힌 네트워크(PC방 등)에선 `prisma migrate deploy`가 안 돼서 마이그레이션은 이 방식으로 통일함(CLAUDE.md "DB 스키마 변경" 참고).
// 대신: `migrate diff --script`로 뽑은 SQL 파일을 여기로 직접 실행함(443만 씀).
// 실행: node prisma/apply-migration.js prisma/migrations/<타임스탬프>_<이름>/migration.sql
import "dotenv/config";
import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("사용법: node prisma/apply-migration.js <migration.sql 경로>");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const sql = readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  console.log(`적용 완료: ${sqlPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
