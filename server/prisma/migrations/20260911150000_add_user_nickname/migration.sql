-- users 테이블에 nickname 컬럼 추가.
-- 시딩 시점 기준 users 테이블이 비어있어서 DEFAULT 없이 NOT NULL로 추가함.
ALTER TABLE "users" ADD COLUMN "nickname" TEXT NOT NULL;
