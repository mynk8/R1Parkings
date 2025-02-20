/*
  Warnings:

  - You are about to drop the column `lotId` on the `parking_spots` table. All the data in the column will be lost.
  - You are about to drop the column `sensor_id` on the `parking_spots` table. All the data in the column will be lost.
  - Added the required column `parkingLotId` to the `parking_spots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sensorId` to the `parking_spots` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "parking_spots" DROP CONSTRAINT "parking_spots_lotId_fkey";

-- DropIndex
DROP INDEX "parking_spots_device_id_sensor_id_idx";

-- AlterTable
ALTER TABLE "parking_spots" DROP COLUMN "lotId",
DROP COLUMN "sensor_id",
ADD COLUMN     "parkingLotId" TEXT NOT NULL,
ADD COLUMN     "sensorId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "parking_spots_device_id_sensorId_idx" ON "parking_spots"("device_id", "sensorId");

-- AddForeignKey
ALTER TABLE "parking_spots" ADD CONSTRAINT "parking_spots_parkingLotId_fkey" FOREIGN KEY ("parkingLotId") REFERENCES "parking_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
