/*
  Warnings:

  - You are about to drop the column `gameMode` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `isPlayerTwoAI` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `isWinnerAI` on the `Game` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerOneId" INTEGER NOT NULL,
    "playerTwoId" INTEGER NOT NULL DEFAULT 0,
    "playerOneScore" INTEGER NOT NULL DEFAULT 0,
    "playerTwoScore" INTEGER NOT NULL DEFAULT 0,
    "winnerId" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tournement" INTEGER
);
INSERT INTO "new_Game" ("endedAt", "id", "playerOneId", "playerOneScore", "playerTwoId", "playerTwoScore", "startedAt", "status", "tournement", "winnerId") SELECT "endedAt", "id", "playerOneId", "playerOneScore", coalesce("playerTwoId", 0) AS "playerTwoId", "playerTwoScore", "startedAt", "status", "tournement", "winnerId" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
