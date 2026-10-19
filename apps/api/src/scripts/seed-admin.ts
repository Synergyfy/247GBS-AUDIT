import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User } from '../users/entities/user.entity';

// Seeds ONLY the platform administrator account. Unlike seed-test-accounts.ts
// this does not create any other users, so it is safe for a clean database.
const ADMIN = {
  email: 'admin@centralhubsolution.com',
  password: 'AdminPass2026!',
  firstName: 'Central Hub',
  lastName: 'Admin',
  businessName: 'Central Hub Solutions',
  role: 'Administrator',
};

async function bootstrap() {
  console.log('--- Seeding Admin User ---');
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const password = await bcrypt.hash(ADMIN.password, 10);
  let user = await userRepository.findOne({ where: { email: ADMIN.email } });

  if (!user) {
    user = await userRepository.save(
      userRepository.create({
        email: ADMIN.email,
        password,
        firstName: ADMIN.firstName,
        lastName: ADMIN.lastName,
        businessName: ADMIN.businessName,
        role: ADMIN.role,
        status: 'Active',
        tokens: 22,
      }),
    );
    console.log(`[SUCCESS] Created admin: ${ADMIN.email}`);
  } else {
    user.password = password;
    user.firstName = ADMIN.firstName;
    user.lastName = ADMIN.lastName;
    user.businessName = ADMIN.businessName;
    user.role = ADMIN.role;
    user.status = 'Active';
    await userRepository.save(user);
    console.log(`[UPDATE] Updated admin: ${ADMIN.email}`);
  }

  console.log('--- Admin Seeding Complete ---');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('--- Admin Seeding Failed ---');
  console.error(err);
  process.exit(1);
});
