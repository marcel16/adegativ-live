import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
      },
    });

    const company = await this.prisma.company.create({
      data: {
        userId: user.id,
        name: `${dto.name}'s Company`,
      },
    });

    const trialDays = parseInt(process.env.TRIAL_DAYS || '3');
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    const freePlan = await this.prisma.plan.findFirst({ where: { status: 'ACTIVE' }, orderBy: { priceMonthly: 'asc' } });

    if (freePlan) {
      await this.prisma.subscription.create({
        data: {
          companyId: company.id,
          planId: freePlan.id,
          status: 'TRIAL',
          trialEndsAt,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.isBlocked) throw new UnauthorizedException('Account is blocked');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (session.user.isBlocked) throw new UnauthorizedException('Account is blocked');

    await this.prisma.session.delete({ where: { id: session.id } });

    return this.generateTokens(session.user.id, session.user.email, session.user.role);
  }

  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { refreshToken } });
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    });

    const refreshToken = uuidv4();
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRATION || '7d';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(refreshExpiresIn));

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
