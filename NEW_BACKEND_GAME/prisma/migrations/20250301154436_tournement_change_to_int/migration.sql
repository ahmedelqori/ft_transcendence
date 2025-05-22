/*
  Warnings:

  - You are about to alter the column `tournement` on the `Game` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
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
    "tournement" INTEGER
);
INSERT INTO "new_Game" ("endedAt", "gameMode", "id", "isPlayerTwoAI", "isWinnerAI", "playerOneId", "playerOneScore", "playerTwoId", "playerTwoScore", "startedAt", "status", "tournement", "winnerId") SELECT "endedAt", "gameMode", "id", "isPlayerTwoAI", "isWinnerAI", "playerOneId", "playerOneScore", "playerTwoId", "playerTwoScore", "startedAt", "status", "tournement", "winnerId" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
