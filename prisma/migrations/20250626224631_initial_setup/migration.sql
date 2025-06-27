-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SignalType') THEN
        CREATE TYPE "SignalType" AS ENUM ('BUY', 'SELL', 'HOLD');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PositionStatus') THEN
        CREATE TYPE "PositionStatus" AS ENUM ('OPEN', 'CLOSED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AgentStatus') THEN
        CREATE TYPE "AgentStatus" AS ENUM ('IDLE', 'DEPLOYED');
    END IF;
END
$$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "shadowId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "weeklyPoints" INTEGER NOT NULL DEFAULT 0,
    "airdropPoints" INTEGER NOT NULL DEFAULT 0,
    "claimedMissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "claimedSpecialOps" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "wallet_address" TEXT,
    "wallet_type" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "x_handle" TEXT,
    "telegram_handle" TEXT,
    "youtube_handle" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Position" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "signalType" "SignalType" NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "status" "PositionStatus" NOT NULL,
    "openTimestamp" TEXT NOT NULL,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "expirationTimestamp" TEXT,
    "closePrice" DOUBLE PRECISION,
    "closeTimestamp" TEXT,
    "pnl" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserAgent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "status" "AgentStatus" NOT NULL,
    "deploymentEndTime" TEXT,
    CONSTRAINT "UserAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "_UserBadges" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_shadowId_key" ON "User"("shadowId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Badge_name_key" ON "Badge"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "UserAgent_userId_agentId_key" ON "UserAgent"("userId", "agentId");
CREATE UNIQUE INDEX IF NOT EXISTS "_UserBadges_AB_unique" ON "_UserBadges"("A", "B");
CREATE INDEX IF NOT EXISTS "_UserBadges_B_index" ON "_UserBadges"("B");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Position_userId_fkey') THEN
        ALTER TABLE "Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserAgent_userId_fkey') THEN
        ALTER TABLE "UserAgent" ADD CONSTRAINT "UserAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UserBadges_A_fkey') THEN
        ALTER TABLE "_UserBadges" ADD CONSTRAINT "_UserBadges_A_fkey" FOREIGN KEY ("A") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_UserBadges_B_fkey') THEN
        ALTER TABLE "_UserBadges" ADD CONSTRAINT "_UserBadges_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
