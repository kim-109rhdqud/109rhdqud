#!/bin/bash
# 클라우드 Claude Code 세션 시작 시 의존성 설치 — 매 세션이 새 컨테이너라 node_modules가 없음.
# npm install 대신 npm ci: 컨테이너의 npm 버전이 달라서 install이 package-lock.json을 매번 다시 써버림(libc 필드 등).
# ci는 lock 파일 그대로 설치하고 파일을 안 건드림. 서버 쪽은 postinstall로 prisma generate까지 같이 돌림(DB 연결 불필요).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm ci --no-audit --no-fund

cd "$CLAUDE_PROJECT_DIR/server"
npm ci --no-audit --no-fund
