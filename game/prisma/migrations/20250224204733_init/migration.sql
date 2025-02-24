-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerOneId" INTEGER NOT NULL,
    "playerTwoId" INTEGER,
    "playerOneScore" INTEGER NOT NULL DEFAULT 0,
    "playerTwoScore" INTEGER NOT NULL DEFAULT 0,
    "winnerId" INTEGER,
    "isWinnerAI" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "isPlayerTwoAI" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "gameMode" TEXT NOT NULL,
    "tournement" TEXT NOT NULL DEFAULT ''
);
