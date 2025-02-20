/*
  Warnings:

  - The primary key for the `parking_lots` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "parking_spots" DROP CONSTRAINT "parking_spots_lotId_fkey";

-- AlterTable
ALTER TABLE "parking_lots" DROP CONSTRAINT "parking_lots_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "parking_lots_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "parking_lots_id_seq";

-- AlterTable
ALTER TABLE "parking_spots" ALTER COLUMN "lotId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "parking_spots" ADD CONSTRAINT "parking_spots_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "parking_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
