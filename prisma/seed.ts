import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users: Prisma.UsersCreateInput[] = [];
  const password = await bcrypt.hash('123456', 10);
  for (let i = 0; i < 105; i++) {
    const name = faker.person.fullName();
    const phone = faker.number.int({ min: 18, max: 20 }).toString();
    const role = i <= 5 ? 'Admin' : 'User';
    users.push({
      email: faker.internet.email(),
      name,
      username: name.toLowerCase().replaceAll(' ', '_'),
      password,
      role,
      phone: '08' + phone,
    });
  }

  await prisma.users.createMany({
    data: users,
  });

  // Add another one for stores!
  // RALAT: Nanti dulu aja, selesaikan CRUD untuk stores dulu aja!
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
