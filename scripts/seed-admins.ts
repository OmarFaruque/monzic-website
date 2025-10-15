
import { db } from '../lib/db';
import { admins } from '../lib/schema.ts';
import bcrypt from 'bcryptjs';

async function main() {
  const passwordAdmin = await bcrypt.hash('TempnowAdmin2024!', 10);
  const passwordManager = await bcrypt.hash('TempnowManager2024!', 10);

  await db.insert(admins).values([
    {
      fname: 'Admin',
      lname: 'User',
      email: 'admin@monzic.co.uk',
      phone: '1234567890',
      password: passwordAdmin,
      role: 'Admin',
    },
    {
      fname: 'Manager',
      lname: 'User',
      email: 'manager@monzic.co.uk',
      phone: '0987654321',
      password: passwordManager,
      role: 'Manager',
    },
  ]);
}

main();
