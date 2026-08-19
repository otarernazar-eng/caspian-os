import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const password = await bcrypt.hash('demo123', 10);

  // Organizations
  const orgGov = await prisma.organization.create({
    data: { name: 'Ministry of Transport', type: 'GOVERNMENT' },
  });
  const orgPort = await prisma.organization.create({
    data: { name: 'Aktau Port Authority', type: 'PORT' },
  });
  const orgLogistics = await prisma.organization.create({
    data: { name: 'Caspian Freight', type: 'LOGISTICS' },
  });

  // Users
  await prisma.user.create({
    data: {
      email: 'admin@caspian.os',
      password,
      role: 'ADMIN',
      name: 'System Admin',
    },
  });

  await prisma.user.create({
    data: {
      email: 'gov@caspian.os',
      password,
      role: 'GOVERNMENT',
      name: 'Minister Delegate',
      organizationId: orgGov.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'port@caspian.os',
      password,
      role: 'PORT_OPERATOR',
      name: 'Port Manager',
      organizationId: orgPort.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'logistics@caspian.os',
      password,
      role: 'LOGISTICS_OPERATOR',
      name: 'Logistics Dispatcher',
      organizationId: orgLogistics.id,
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      email: 'driver@caspian.os',
      password,
      role: 'DRIVER',
      name: 'Ilyas',
      organizationId: orgLogistics.id,
    },
  });

  const driverProfile = await prisma.driverProfile.create({
    data: {
      userId: driverUser.id,
      status: 'AVAILABLE',
    },
  });

  // Vehicle
  const truck = await prisma.vehicle.create({
    data: {
      licensePlate: 'KZ 123 ABC 12',
      type: 'TRUCK',
      capacity: 20000,
      organizationId: orgLogistics.id,
    },
  });

  // Shipment
  const shipment = await prisma.shipment.create({
    data: {
      trackingId: 'KZ-19281',
      status: 'IN_TRANSIT',
      origin: 'Aktau',
      destination: 'Atyrau',
      currentLat: 43.6481,
      currentLng: 51.1983,
      eta: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours from now
      originalEta: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours from now (delayed)
      vehicleId: truck.id,
      driverId: driverProfile.id,
    },
  });

  // Cargo
  const cargo = await prisma.cargo.create({
    data: {
      type: 'Refrigerated Fish',
      weight: 1200,
      temperature: 3.8,
      shipmentId: shipment.id,
    },
  });

  // Cargo Passport
  await prisma.cargoPassport.create({
    data: {
      cargoId: cargo.id,
      qrCode: 'QR-KZ-19281',
      status: 'VERIFIED',
    },
  });

  // Bottleneck
  await prisma.bottleneck.create({
    data: {
      location: 'Aktau Port Terminal',
      severity: 'RED',
      lat: 43.6481,
      lng: 51.1983,
      affectedCount: 47,
      averageDelay: 4.2,
      economicImpact: 18400000,
      rootCause: 'Vessel loading capacity',
    },
  });

  // Location Event
  await prisma.locationEvent.create({
    data: {
      shipmentId: shipment.id,
      lat: 43.6481,
      lng: 51.1983,
      status: 'CHECKPOINT',
    },
  });

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
