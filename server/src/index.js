import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import memeRoutes from "./routes/memes.js";
import scrapRoutes from "./routes/scraps.js";
import submissionRoutes from "./routes/submissions.js";

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/memes", memeRoutes);
app.use("/scraps", scrapRoutes);
app.use("/submissions", submissionRoutes);

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
