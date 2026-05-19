import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@adegatv.com' },
    update: {},
    create: {
      email: 'admin@adegatv.com',
      passwordHash: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log(`Admin created: ${admin.email}`);

  const plans = [
    {
      name: 'Básico',
      description: 'Para pequenas adegas - até 2 TVs e 1 filial',
      priceMonthly: 49.90,
      priceYearly: 499.00,
      annualDiscountPercent: 17,
      maxTvs: 2,
      maxAdegas: 1,
      maxStorageGb: 5,
      hasScheduling: true,
      hasAnalytics: false,
      isHighlighted: false,
      sortOrder: 1,
    },
    {
      name: 'Profissional',
      description: 'Para distribuidoras - até 10 TVs e 3 filiais',
      priceMonthly: 99.90,
      priceYearly: 999.00,
      annualDiscountPercent: 17,
      maxTvs: 10,
      maxAdegas: 3,
      maxStorageGb: 20,
      hasScheduling: true,
      hasAnalytics: true,
      hasYoutubeImport: true,
      isHighlighted: true,
      sortOrder: 2,
    },
    {
      name: 'Premium',
      description: 'Para redes - TVs e filiais ilimitadas',
      priceMonthly: 199.90,
      priceYearly: 1999.00,
      annualDiscountPercent: 17,
      maxTvs: 999,
      maxAdegas: 999,
      maxStorageGb: 100,
      hasScheduling: true,
      hasAnalytics: true,
      hasYoutubeImport: true,
      hasAiFeatures: true,
      isHighlighted: false,
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.name.toLowerCase() },
      update: plan,
      create: { id: plan.name.toLowerCase(), ...plan },
    });
  }

  console.log('Plans created');

  const templates = [
    { name: 'Promoção de Cerveja', category: 'promocao', isDefault: true, config: { bgColor: '#FFD700', animation: 'fade' } },
    { name: 'Combo de Bebidas', category: 'combo', isDefault: true, config: { bgColor: '#FF6347', animation: 'slide' } },
    { name: 'Oferta Relâmpago', category: 'oferta', isDefault: true, config: { bgColor: '#FF4500', animation: 'flash' } },
    { name: 'Preço do Dia', category: 'preco', isDefault: true, config: { bgColor: '#32CD32', animation: 'fade' } },
    { name: 'Happy Hour', category: 'horario', isDefault: true, config: { bgColor: '#8A2BE2', animation: 'bounce' } },
  ];

  for (const template of templates) {
    await prisma.template.create({ data: template });
  }

  console.log('Templates created');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
