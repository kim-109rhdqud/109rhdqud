import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// 표준 TCP(5432) 연결 대신 Neon의 HTTP/WebSocket 기반 드라이버를 씀.
// PC방 등 5432 포트를 막아둔 네트워크에서도 동작하게 하려는 목적 (443만 씀).
// 자세한 배경은 docs/BACKEND.md 참고.
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
