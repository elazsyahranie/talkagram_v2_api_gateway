import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users: Prisma.UsersCreateInput[] = [];
  const password = await bcrypt.hash('123456', 10);
  for (let i = 0; i < 20; i++) {
    // const name = faker.person.fullName();
    const first_name = faker.person.firstName();
    const middle_name = faker.person.middleName();
    const last_name = faker.person.lastName();
    const name = `${first_name} ${middle_name} ${last_name}`;
    const username = name.toLowerCase().replaceAll(' ', '_');
    const email = name.toLowerCase().replaceAll(' ', '_') + '@yopmail.com';
    const phone = '08' + faker.phone.number().replace(/[^0-9]/g, '');

    const role = i < 5 ? 'Admin' : 'User';
    users.push({
      email,
      name,
      first_name,
      middle_name,
      last_name,
      username,
      password,
      role,
      phone,
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
