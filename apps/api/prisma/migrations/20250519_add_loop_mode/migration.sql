-- CreateEnum
CREATE TYPE "LoopMode" AS ENUM ('SEQUENTIAL', 'RANDOM');

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN "loopMode" "LoopMode" NOT NULL DEFAULT 'SEQUENTIAL';
