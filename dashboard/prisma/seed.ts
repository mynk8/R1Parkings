import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create DLF Mall parking lot
  const dlfMall = await prisma.parkingLot.upsert({
    where: { id: "dlf-mall" },
    update: {},
    create: {
      id: "dlf-mall",
      name: "DLF MALL",
      location: "Sector 18, Noida, Uttar Pradesh, India",
      parkingSpots: {
        create: [
          ...Array(20)
            .fill(null)
            .map((_, i) => ({
              sensorId: i + 1,
              deviceId: "DLF-SENSOR",
              tagDetected: Math.random() > 0.5,
              plateNumber:
                Math.random() > 0.5
                  ? `DL-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000)}`
                  : null,
            })),
        ],
      },
    },
  });

  // Create IGI Airport parking lot
  const igiAirport = await prisma.parkingLot.upsert({
    where: { id: "igi-airport" },
    update: {},
    create: {
      id: "igi-airport",
      name: "Indira Gandhi Airport",
      location: "New Delhi, Delhi 110037, India",
      parkingSpots: {
        create: [
          ...Array(30)
            .fill(null)
            .map((_, i) => ({
              sensorId: i + 1,
              deviceId: "IGI-SENSOR",
              tagDetected: Math.random() > 0.5,
              plateNumber:
                Math.random() > 0.5
                  ? `DL-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000)}`
                  : null,
            })),
        ],
      },
    },
  });

  // Create Ambience Mall parking lot
  const ambienceMall = await prisma.parkingLot.upsert({
    where: { id: "ambience-mall" },
    update: {},
    create: {
      id: "ambience-mall",
      name: "Ambience Mall",
      location: "Vasant Kunj, New Delhi, Delhi 110070, India",
      parkingSpots: {
        create: [
          ...Array(25)
            .fill(null)
            .map((_, i) => ({
              sensorId: i + 1,
              deviceId: "AMB-SENSOR",
              tagDetected: Math.random() > 0.5,
              plateNumber:
                Math.random() > 0.5
                  ? `DL-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000)}`
                  : null,
            })),
        ],
      },
    },
  });

  console.log({ dlfMall, igiAirport, ambienceMall });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
