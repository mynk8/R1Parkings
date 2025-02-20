/*
  Warnings:

  - Added the required column `lotId` to the `parking_spots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parking_spots" ADD COLUMN     "lotId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "parking_lots" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,

    CONSTRAINT "parking_lots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "parking_spots" ADD CONSTRAINT "parking_spots_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "parking_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
