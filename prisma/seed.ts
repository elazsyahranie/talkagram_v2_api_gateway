import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users: Prisma.UsersCreateInput[] = [];
  const password = await bcrypt.hash('123456', 10);
  for (let i = 0; i < 20; i++) {
    const name = faker.person.fullName();
    // const phone = faker.number.int({ min: 18, max: 20 }).toString();
    // console.dir(phone, { depth: null });
    const role = i < 5 ? 'Admin' : 'User';
    users.push({
      email: name.toLowerCase().replaceAll(' ', '_') + '@yopmail.com',
      name,
      username: name.toLowerCase().replaceAll(' ', '_'),
      password,
      role,
      phone: '08' + faker.phone.number().replace(/[^0-9]/g, ''),
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
