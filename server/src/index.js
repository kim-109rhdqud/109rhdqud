import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import memeRoutes from "./routes/memes.js";
import scrapRoutes from "./routes/scraps.js";
import submissionRoutes from "./routes/submissions.js";
import userRoutes from "./routes/users.js";

const app = express();

const isProd = process.env.NODE_ENV === "production";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Vite 개발 서버는 포트가 자꾸 바뀌어서(5173이 이미 쓰이고 있으면 5174, 5175... 식으로 올라감)
// 매번 CLIENT_ORIGIN을 맞춰줘야 하는 게 번거로움 — 개발 중엔 localhost 아무 포트나 허용.
// 배포(프로덕션) 환경에서는 CLIENT_ORIGIN 하나만 정확히 허용함.
app.use(
  cors({
    origin: isProd ? CLIENT_ORIGIN : /^http:\/\/localhost:\d+$/,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/memes", memeRoutes);
app.use("/scraps", scrapRoutes);
app.use("/submissions", submissionRoutes);
app.use("/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "존재하지 않는 경로야" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  // 프로덕션에서는 Prisma/내부 에러 메시지를 그대로 노출하지 않음 (DB 구조 등 정보 유출 방지)
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "서버 오류가 발생했어"
      : err.message || "서버 오류가 발생했어";
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
