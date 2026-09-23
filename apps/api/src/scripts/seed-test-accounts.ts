import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../users/entities/user.entity';
import { NotificationSetting } from '../protocols/entities/notification-setting.entity';
import { BillingProfile } from '../protocols/entities/billing-profile.entity';
import { Invoice } from '../protocols/entities/invoice.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

async function bootstrap() {
  console.log('--- Starting Enhanced Test Account Seeding ---');
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const notificationRepository = app.get<Repository<NotificationSetting>>(getRepositoryToken(NotificationSetting));
  const billingRepository = app.get<Repository<BillingProfile>>(getRepositoryToken(BillingProfile));
  const invoiceRepository = app.get<Repository<Invoice>>(getRepositoryToken(Invoice));

  const testAccounts = [
    {
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      businessName: '247GBS Admin',
      role: 'Administrator',
    },
    {
      email: 'agent@test.com',
      firstName: 'Agent',
      lastName: 'User',
      businessName: '247GBS Agent',
      role: 'Agent',
    },
    {
      email: 'growth@test.com',
      firstName: 'Growth',
      lastName: 'Specialist',
      businessName: 'EcoGrowth Ltd',
      role: 'Tier 2: Growth Specialist',
    },
    {
      email: 'master@test.com',
      firstName: 'Master',
      lastName: 'Key',
      businessName: 'Secure Audit',
      role: 'Master Key Holder',
    },
  ];

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  for (const account of testAccounts) {
    let user = await userRepository.findOne({ where: { email: account.email } });
    if (!user) {
      user = userRepository.create({
        ...account,
        password: hashedPassword,
        status: 'Active',
        tokens: 22,
      });
      user = await userRepository.save(user);
      console.log(`[SUCCESS] Created account: ${account.email}`);
    } else {
        user.role = account.role;
        user.tokens = 22;
        await userRepository.save(user);
        console.log(`[UPDATE] Updated account: ${account.email}`);
    }

    // --- Seed Notifications ---
    const notifications = [
        { title: "Forensic Alerts", description: "Immediate notification of detected capacity leaks.", isActive: true },
        { title: "Strategic Insights", description: "Weekly AI-generated market trend analysis.", isActive: true },
        { title: "Specialist Messages", description: "Communications from verified network consultants.", isActive: false },
        { title: "Vault Security", description: "Alerts for master key rotation and access logs.", isActive: true },
        { title: "Billing Reports", description: "Invoices and credit balance notifications.", isActive: false },
    ];

    for (const n of notifications) {
        const existing = await notificationRepository.findOne({ where: { userId: user.id, title: n.title } });
        if (!existing) {
            await notificationRepository.save(notificationRepository.create({ ...n, userId: user.id }));
        }
    }

    // --- Seed Billing Profile ---
    let profile = await billingRepository.findOne({ where: { userId: user.id } });
    if (!profile) {
        profile = await billingRepository.save(billingRepository.create({
            userId: user.id,
            planName: account.role || 'Growth Specialist',
            price: '£499 / Month',
            last4: '4242',
            expiry: '12/28',
        }));

        // Seed Invoices
        const invoices = [
            { invoiceNumber: "#INV-902", date: "Jan 01, 2026", amount: "£499.00", status: "Paid" },
            { invoiceNumber: "#INV-841", date: "Dec 01, 2025", amount: "£499.00", status: "Paid" },
            { invoiceNumber: "#INV-720", date: "Nov 01, 2025", amount: "£499.00", status: "Paid" },
        ];
        for (const inv of invoices) {
            await invoiceRepository.save(invoiceRepository.create({ ...inv, billingProfileId: profile.id }));
        }
    }
  }

  console.log('--- Enhanced Seeding Complete ---');
  await app.close();
}

bootstrap().catch(err => {
  console.error('--- Seeding Failed ---');
  console.error(err);
  process.exit(1);
});
