const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const pwd = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@adegatv.com' },
    update: {},
    create: { email: 'admin@adegatv.com', passwordHash: pwd, name: 'Admin', role: 'ADMIN', emailVerified: true },
  });
  console.log('Admin created: admin@adegatv.com');

  const plans = [
    { id: 'basico', name: 'Básico', description: 'Para pequenas adegas - até 2 TVs', priceMonthly: 49.90, priceYearly: 499.00, maxTvs: 2, maxStorageGb: 5, hasScheduling: true, sortOrder: 1 },
    { id: 'profissional', name: 'Profissional', description: 'Para distribuidoras - até 10 TVs', priceMonthly: 99.90, priceYearly: 999.00, maxTvs: 10, maxStorageGb: 20, hasScheduling: true, hasAnalytics: true, hasYoutubeImport: true, sortOrder: 2 },
    { id: 'premium', name: 'Premium', description: 'Para redes - TVs ilimitadas', priceMonthly: 199.90, priceYearly: 1999.00, maxTvs: 999, maxStorageGb: 100, hasScheduling: true, hasAnalytics: true, hasYoutubeImport: true, hasAiFeatures: true, sortOrder: 3 },
  ];
  for (const p of plans) {
    await prisma.plan.upsert({ where: { id: p.id }, update: p, create: p });
  }
  console.log('Plans created');

  const templates = [
    { name: 'Promoção de Cerveja', category: 'promocao', isDefault: true, config: { bgColor: '#FFD700', animation: 'fade' } },
    { name: 'Combo de Bebidas', category: 'combo', isDefault: true, config: { bgColor: '#FF6347', animation: 'slide' } },
    { name: 'Happy Hour', category: 'horario', isDefault: true, config: { bgColor: '#8A2BE2', animation: 'bounce' } },
  ];
  for (const t of templates) {
    await prisma.template.create({ data: t });
  }
  console.log('Templates created');
  console.log('Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
