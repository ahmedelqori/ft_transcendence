-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerOneId" INTEGER NOT NULL,
    "playerTwoId" INTEGER NOT NULL DEFAULT 0,
    "playerOneScore" INTEGER NOT NULL DEFAULT 0,
    "playerTwoScore" INTEGER NOT NULL DEFAULT 0,
    "winnerId" INTEGER NOT NULL DEFAULT -1,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tournementId" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Game" ("endedAt", "id", "playerOneId", "playerOneScore", "playerTwoId", "playerTwoScore", "startedAt", "status", "tournementId", "winnerId") SELECT "endedAt", "id", "playerOneId", "playerOneScore", "playerTwoId", "playerTwoScore", "startedAt", "status", "tournementId", "winnerId" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
