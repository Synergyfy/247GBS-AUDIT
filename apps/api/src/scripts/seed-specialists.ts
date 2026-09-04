import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Specialist } from '../dashboard/specialists/entities/specialist.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function bootstrap() {
  console.log('--- Starting Specialist Seeding ---');
  const app = await NestFactory.createApplicationContext(AppModule);
  const specialistRepository = app.get<Repository<Specialist>>(getRepositoryToken(Specialist));

  const newSpecialists = [
    {
      name: "Dr. Elena Vance (DB Version)",
      role: "Forensic Operations Auditor",
      rating: 4.9,
      reviews: 124,
      expertise: ["Hospitality", "Logistics"],
      status: "Available",
      experience: "15+ Years",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaDB"
    },
    {
      name: "Marcus Thorne (DB Version)",
      role: "Supply Chain Optimization",
      rating: 5.0,
      reviews: 89,
      expertise: ["Manufacturing", "Retail"],
      status: "In Call",
      experience: "12 Years",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusDB"
    },
    {
      name: "Sarah Jenkins (DB Version)",
      role: "Financial Efficiency Expert",
      rating: 4.8,
      reviews: 215,
      expertise: ["FinTech", "Service Industry"],
      status: "Available",
      experience: "18 Years",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahDB"
    },
    {
      name: "Julian Voss (DB Version)",
      role: "Strategic Resource Planner",
      rating: 4.9,
      reviews: 56,
      expertise: ["Energy", "Infrastructure"],
      status: "Out of Office",
      experience: "10 Years",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=JulianDB"
    }
  ];

  for (const prof of newSpecialists) {
    const existing = await specialistRepository.findOne({ where: { name: prof.name } });
    if (!existing) {
      await specialistRepository.save(specialistRepository.create(prof));
      console.log(`[SUCCESS] Created specialist: ${prof.name}`);
    } else {
      console.log(`[SKIP] Specialist already exists: ${prof.name}`);
    }
  }

  console.log('--- Specialist Seeding Complete ---');
  await app.close();
}

bootstrap().catch(err => {
  console.error('--- Seeding Failed ---');
  console.error(err);
  process.exit(1);
});
