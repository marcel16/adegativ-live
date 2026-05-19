import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  private cache: Map<string, string | null> = new Map();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaults();
    await this.loadCache();
  }

  private async seedDefaults() {
    const defaults: { key: string; value: string; group: string; type: string; isSecret: boolean }[] = [
      { key: 'stripe_secret_key', value: process.env.STRIPE_SECRET_KEY || '', group: 'stripe', type: 'string', isSecret: true },
      { key: 'stripe_webhook_secret', value: process.env.STRIPE_WEBHOOK_SECRET || '', group: 'stripe', type: 'string', isSecret: true },
      { key: 'stripe_public_key', value: process.env.STRIPE_PUBLIC_KEY || '', group: 'stripe', type: 'string', isSecret: false },
      { key: 'asaas_api_key', value: process.env.ASAAS_API_KEY || '', group: 'asaas', type: 'string', isSecret: true },
      { key: 'asaas_env', value: process.env.ASAAS_ENV || 'sandbox', group: 'asaas', type: 'string', isSecret: false },
      { key: 'app_url', value: process.env.APP_URL || 'http://localhost:8080', group: 'app', type: 'string', isSecret: false },
      { key: 'app_name', value: process.env.APP_NAME || 'AdegaTV Live', group: 'app', type: 'string', isSecret: false },
      { key: 'trial_days', value: process.env.TRIAL_DAYS || '3', group: 'app', type: 'number', isSecret: false },
      { key: 'pairing_code_expiry_minutes', value: process.env.PAIRING_CODE_EXPIRY_MINUTES || '10', group: 'app', type: 'number', isSecret: false },
      { key: 'max_upload_size_mb', value: process.env.MAX_UPLOAD_SIZE_MB || '500', group: 'storage', type: 'number', isSecret: false },
      { key: 'default_storage_gb', value: process.env.DEFAULT_STORAGE_GB || '5', group: 'storage', type: 'number', isSecret: false },
      { key: 'smtp_host', value: process.env.SMTP_HOST || '', group: 'smtp', type: 'string', isSecret: false },
      { key: 'smtp_port', value: process.env.SMTP_PORT || '587', group: 'smtp', type: 'number', isSecret: false },
      { key: 'smtp_user', value: process.env.SMTP_USER || '', group: 'smtp', type: 'string', isSecret: false },
      { key: 'smtp_pass', value: process.env.SMTP_PASS || '', group: 'smtp', type: 'string', isSecret: true },
      { key: 'smtp_from', value: process.env.SMTP_FROM || 'noreply@adegatvlive.com', group: 'smtp', type: 'string', isSecret: false },
      { key: 'rate_limit_ttl', value: process.env.RATE_LIMIT_TTL || '60', group: 'app', type: 'number', isSecret: false },
      { key: 'rate_limit_max', value: process.env.RATE_LIMIT_MAX || '100', group: 'app', type: 'number', isSecret: false },
    ];

    for (const setting of defaults) {
      await this.prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }
  }

  private async loadCache() {
    const all = await this.prisma.setting.findMany();
    for (const s of all) {
      this.cache.set(s.key, s.value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.cache.has(key)) return this.cache.get(key) ?? null;
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (setting) {
      this.cache.set(key, setting.value);
      return setting.value;
    }
    return null;
  }

  async getWithDefault(key: string, defaultValue: string): Promise<string> {
    const val = await this.get(key);
    return val ?? defaultValue;
  }

  async set(key: string, value: string): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    this.cache.set(key, value);
  }

  async getAll(): Promise<{ id: string; key: string; value: string | null; group: string; type: string; isSecret: boolean; createdAt: Date; updatedAt: Date }[]> {
    return this.prisma.setting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  }

  async getByGroup(group: string) {
    return this.prisma.setting.findMany({
      where: { group },
      orderBy: { key: 'asc' },
    });
  }

  async delete(key: string): Promise<void> {
    await this.prisma.setting.delete({ where: { key } });
    this.cache.delete(key);
  }

  async refreshCache(): Promise<void> {
    this.cache.clear();
    await this.loadCache();
  }
}
