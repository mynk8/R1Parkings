-- CreateTable
CREATE TABLE "parking_spots" (
    "id" SERIAL NOT NULL,
    "device_id" TEXT NOT NULL,
    "sensor_id" INTEGER NOT NULL,
    "tag_detected" BOOLEAN NOT NULL DEFAULT false,
    "plate_number" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parking_spots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parking_spots_device_id_sensor_id_idx" ON "parking_spots"("device_id", "sensor_id");

-- CreateIndex
CREATE INDEX "parking_spots_timestamp_idx" ON "parking_spots"("timestamp" DESC);
