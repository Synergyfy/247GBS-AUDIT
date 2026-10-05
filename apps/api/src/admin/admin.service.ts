import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, LessThan, Raw } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { MailService, escapeHtml } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { AuditSession, AuditStatus } from '../audit/entities/audit-session.entity';
import { AdminDashboardResponseDto, AdminStatItemDto, AdminActivityItemDto, AdminAuditTrendDto, AdminAuditItemDto, AdminAuditMetricsDto, AdminUserItemDto } from './dto/admin-dashboard.dto';
import { AdminCreateUserDto, AdminUpdateUserDto, AdminCreateAuditDto, AdminUpdateAuditDto } from './dto/admin-actions.dto';
import { Invoice } from '../protocols/entities/invoice.entity';
import { PlatformSetting } from './entities/platform-setting.entity';
import { HelpResource } from './entities/help-resource.entity';
import { UpdateSettingsDto, CreateHelpResourceDto, UpdateHelpResourceDto } from './dto/settings.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditSession)
    private readonly auditRepository: Repository<AuditSession>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(PlatformSetting)
    private readonly settingsRepository: Repository<PlatformSetting>,
    @InjectRepository(HelpResource)
    private readonly helpRepository: Repository<HelpResource>,
    private readonly mailService: MailService,
  ) {}

  async verifyAdmin(userId: string): Promise<User> {
    if (!userId) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('Access denied. User not found.');
    }

    const role = (user.role || '').toLowerCase();
    if (role !== 'administrator' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    return user;
  }

  async getDashboardData(userId: string): Promise<AdminDashboardResponseDto> {
    await this.verifyAdmin(userId);

    const stats = await this.getStats();
    const activities = await this.getRecentActivities();
    const auditTrends = await this.getAuditTrends();

    return {
      stats,
      activities,
      auditTrends,
    };
  }

  // --- Users ---

  async getUsers(search?: string): Promise<AdminUserItemDto[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere('(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)', { 
        search: `%${search}%` 
      });
    }

    const users = await queryBuilder.getMany();

    return users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      status: user.status || 'Active',
      joinDate: user.createdAt.toLocaleDateString(),
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${user.firstName}`,
    }));
  }

  async createUser(
    dto: AdminCreateUserDto,
  ): Promise<{ user: Omit<User, 'password'>; generatedPassword?: string; inviteSent: boolean }> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('User with this email already exists.');

    const generated = dto.password ? undefined : randomBytes(16).toString('hex');
    const password = dto.password || generated!;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      status: 'Active',
    });

    const saved = await this.userRepository.save(user);
    // Never log the plaintext password. Returned once so the admin UI can show
    // a one-time copy modal; also emailed as an invite when mail is enabled.
    let inviteSent = false;
    if (generated && dto.sendInvite !== false) {
      try {
        if (this.mailService.isEnabled()) {
          const loginUrl = process.env.FRONTEND_URL || 'http://localhost:9009';
          await this.mailService.send({
            to: saved.email,
            subject: 'Your 247GBS Audit account is ready',
            text: `An administrator created your account.\n\nEmail: ${saved.email}\nTemporary password: ${generated}\n\nSign in at ${loginUrl} and change your password immediately.`,
            html: `<p>An administrator created your account.</p><p>Email: ${escapeHtml(saved.email)}<br/>Temporary password: <code>${escapeHtml(generated)}</code></p><p>Sign in at <a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a> and change your password immediately.</p>`,
          });
          inviteSent = true;
        }
      } catch {
        inviteSent = false;
      }
    }
    const { password: _omit, ...safeUser } = saved as User & { password?: string };
    return generated
      ? { user: safeUser, generatedPassword: generated, inviteSent }
      : { user: safeUser, inviteSent };
  }

  async updateUser(id: string, dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { password, role, ...rest } = dto as any;
    Object.assign(user, rest);
    if (role !== undefined) {
      const normalized = String(role).toLowerCase();
      if (normalized !== 'user' && normalized !== 'admin' && normalized !== 'administrator') {
        throw new BadRequestException('Invalid role.');
      }
      user.role = role;
    }
    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters.');
      }
      user.password = await bcrypt.hash(password, 10);
    }
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
  }

  // --- Audits ---

  async getAudits(filter?: string, search?: string): Promise<AdminAuditItemDto[]> {
    const queryBuilder = this.auditRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (filter && filter !== 'All') {
      if (filter === 'Completed') {
        queryBuilder.andWhere('audit.status = :status', { status: AuditStatus.COMPLETED });
      } else if (filter === 'In Progress') {
        queryBuilder.andWhere('audit.status IN (:...statuses)', { 
          statuses: [AuditStatus.IN_PROGRESS, AuditStatus.SECTOR_SELECTED, AuditStatus.TRIAGE_COMPLETED] 
        });
      }
    }

    if (search) {
      queryBuilder.andWhere('(user.businessName ILIKE :search OR audit.id::text ILIKE :search)', { 
        search: `%${search}%` 
      });
    }

    const audits = await queryBuilder.getMany();

    return audits.map(audit => ({
      id: audit.id,
      company: audit.user?.businessName || 'Unknown Business',
      type: audit.auditType || 'General Audit',
      stage: this.mapStatusToStage(audit.status),
      progress: this.calculateProgress(audit),
      status: this.mapStatusToFrontendStatus(audit.status),
      dueDate: audit.dueDate ? audit.dueDate.toLocaleDateString() : 'N/A',
      assignee: audit.assignee || 'Unassigned',
    }));
  }

  async createAudit(dto: AdminCreateAuditDto): Promise<AuditSession> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const audit = this.auditRepository.create({
      userId: dto.userId,
      auditType: dto.auditType,
      status: AuditStatus.TRIAGE_COMPLETED,
      assignee: dto.assignee,
      dueDate: dto.dueDate,
      sectorId: dto.sectorId,
      groupId: dto.groupId || dto.categoryId,
      businessTypeId: dto.businessTypeId || dto.subcategoryId,
    });

    return this.auditRepository.save(audit);
  }
  
  async getAudit(id: string): Promise<AuditSession> {
      const audit = await this.auditRepository.findOne({ where: { id }, relations: ['user'] });
      if (!audit) throw new NotFoundException('Audit not found');
      return audit;
  }

  async updateAudit(id: string, dto: AdminUpdateAuditDto): Promise<AuditSession> {
    const audit = await this.auditRepository.findOne({ where: { id } });
    if (!audit) throw new NotFoundException('Audit not found');

    if (dto.status) {
        // Ensure status is valid if strictly checking enum
    }

    Object.assign(audit, dto);
    return this.auditRepository.save(audit);
  }

  async deleteAudit(id: string): Promise<void> {
    const result = await this.auditRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Audit not found');
  }

  async getAuditMetrics(): Promise<AdminAuditMetricsDto> {
    const activeStatuses = [
      AuditStatus.IN_PROGRESS,
      AuditStatus.SECTOR_SELECTED,
      AuditStatus.TRIAGE_COMPLETED
    ];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const row = await this.auditRepository
      .createQueryBuilder('audit')
      .select('COUNT(CASE WHEN audit.status IN (:...activeStatuses) THEN 1 END)', 'totalActive')
      .addSelect('COUNT(CASE WHEN audit.status = :completed THEN 1 END)', 'inReview')
      .addSelect('COUNT(CASE WHEN audit.status = :completed AND audit.updatedAt >= :startOfMonth THEN 1 END)', 'completedThisMonth')
      .addSelect('COUNT(CASE WHEN audit.status IN (:...activeStatuses) AND audit.dueDate < :now THEN 1 END)', 'overdue')
      .setParameters({
        activeStatuses,
        completed: AuditStatus.COMPLETED,
        startOfMonth,
        now,
      })
      .getRawOne();

    return {
      totalActive: parseInt(row?.totalActive || '0', 10),
      inReview: parseInt(row?.inReview || '0', 10),
      completedThisMonth: parseInt(row?.completedThisMonth || '0', 10),
      overdue: parseInt(row?.overdue || '0', 10),
    };
  }

  private mapStatusToStage(status: AuditStatus): string {
    switch(status) {
        case AuditStatus.TRIAGE_COMPLETED: return 'Triage';
        case AuditStatus.SECTOR_SELECTED: return 'Sector Setup';
        case AuditStatus.IN_PROGRESS: return 'Analysis';
        case AuditStatus.COMPLETED: return 'Completed';
        default: return 'Draft';
    }
  }

  private mapStatusToFrontendStatus(status: AuditStatus): string {
     switch(status) {
        case AuditStatus.COMPLETED: return 'Completed';
        case AuditStatus.IN_PROGRESS: return 'In Progress';
        case AuditStatus.TRIAGE_COMPLETED:
        case AuditStatus.SECTOR_SELECTED: return 'In Progress';
        default: return 'Action Required';
     }
  }

  private calculateProgress(audit: AuditSession): number {
    if (audit.status === AuditStatus.COMPLETED) return 100;
    const answers = (audit as any).answers;
    const answeredCount = Array.isArray(answers)
      ? answers.length
      : answers && typeof answers === 'object'
        ? Object.keys(answers).length
        : 0;
    // Status gives the floor/ceiling; answered count interpolates within the band
    // so two audits with the same status but different completion differ.
    const band =
      audit.status === AuditStatus.IN_PROGRESS
        ? { min: 30, max: 95 }
        : audit.status === AuditStatus.SECTOR_SELECTED
          ? { min: 15, max: 30 }
          : { min: 5, max: 15 };
    if (answeredCount <= 0) return band.min;
    const scaled = band.min + Math.min(answeredCount, 12) * ((band.max - band.min) / 12);
    return Math.round(Math.min(band.max, Math.max(band.min, scaled)));
  }

  async getStats(): Promise<AdminStatItemDto[]> {
    const now = new Date();
    const activeStatuses = [AuditStatus.IN_PROGRESS, AuditStatus.SECTOR_SELECTED, AuditStatus.TRIAGE_COMPLETED];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const percent = ((current - previous) / previous) * 100;
      const sign = percent > 0 ? '+' : '';
      return `${sign}${percent.toFixed(1)}%`;
    };

    const getTrend = (current: number, previous: number) => {
      if (current === previous) return 'neutral';
      return current > previous ? 'up' : 'down';
    };

    // Run all independent queries in parallel
    const [
      totalUsers,
      pendingAudits,
      systemAlertsCount,
      revenueRow,
      usersCurrent,
      usersPrevious,
      auditsCurrent,
      auditsPrevious,
      revCurrentRow,
      revPreviousRow,
    ] = await Promise.all([
      this.userRepository.count(),
      this.auditRepository.count({
        where: activeStatuses.map(status => ({ status })),
      }),
      this.auditRepository.count({
        where: activeStatuses.map(status => ({ status, dueDate: LessThan(now) })),
      }),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select("COALESCE(SUM(CAST(NULLIF(REGEXP_REPLACE(invoice.amount, '[^0-9.]', '', 'g'), '') AS DECIMAL)), 0)", 'total')
        .getRawOne(),
      this.userRepository.count({ where: { createdAt: Between(thirtyDaysAgo, now) } }),
      this.userRepository.count({ where: { createdAt: Between(sixtyDaysAgo, thirtyDaysAgo) } }),
      this.auditRepository.count({ where: { createdAt: Between(thirtyDaysAgo, now) } }),
      this.auditRepository.count({ where: { createdAt: Between(sixtyDaysAgo, thirtyDaysAgo) } }),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select("COALESCE(SUM(CAST(NULLIF(REGEXP_REPLACE(invoice.amount, '[^0-9.]', '', 'g'), '') AS DECIMAL)), 0)", 'total')
        .where('invoice.date >= :start AND invoice.date <= :end', { start: thirtyDaysAgo, end: now })
        .getRawOne(),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select("COALESCE(SUM(CAST(NULLIF(REGEXP_REPLACE(invoice.amount, '[^0-9.]', '', 'g'), '') AS DECIMAL)), 0)", 'total')
        .where('invoice.date >= :start AND invoice.date < :end', { start: sixtyDaysAgo, end: thirtyDaysAgo })
        .getRawOne(),
    ]);

    const totalRevenue = parseFloat(revenueRow?.total || '0');
    const revCurrent = parseFloat(revCurrentRow?.total || '0');
    const revPrevious = parseFloat(revPreviousRow?.total || '0');

    const revenueStat: AdminStatItemDto = {
      label: 'Total Revenue',
      value: `£${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: calculateChange(revCurrent, revPrevious),
      trend: getTrend(revCurrent, revPrevious),
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    };

    const userStat: AdminStatItemDto = {
      label: 'Active Users',
      value: totalUsers.toString(),
      change: calculateChange(usersCurrent, usersPrevious),
      trend: getTrend(usersCurrent, usersPrevious),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    };

    const auditStat: AdminStatItemDto = {
      label: 'Pending Audits',
      value: pendingAudits.toString(),
      change: calculateChange(auditsCurrent, auditsPrevious),
      trend: getTrend(auditsCurrent, auditsPrevious),
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    };

    const alertStat: AdminStatItemDto = {
      label: 'System Alerts',
      value: systemAlertsCount.toString(),
      change: '0%', // Alerts usually fluctuate widely
      trend: 'neutral',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    };

    return [revenueStat, userStat, auditStat, alertStat];
  }

  async getRecentActivities(): Promise<AdminActivityItemDto[]> {
    const recentAudits = await this.auditRepository.find({
      take: 5,
      order: { updatedAt: 'DESC' },
      relations: ['user'],
    });

    return recentAudits.map(audit => {
      let action = 'updated audit';
      if (audit.status === AuditStatus.COMPLETED) action = 'completed audit';
      if (audit.status === AuditStatus.TRIAGE_COMPLETED) action = 'started new audit';

      return {
        user: audit.user ? `${audit.user.firstName} ${audit.user.lastName}` : 'Unknown User',
        action: action,
        target: audit.auditType || 'Audit Session',
        time: this.formatTimeAgo(audit.updatedAt),
        color: 'bg-blue-100 text-blue-600',
      };
    });
  }

  async getAuditTrends(): Promise<AdminAuditTrendDto[]> {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const rows = await this.auditRepository
      .createQueryBuilder('audit')
      .select("TO_CHAR(audit.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :start', { start: twelveMonthsAgo })
      .groupBy("TO_CHAR(audit.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(audit.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    const countMap = new Map<string, number>();
    for (const row of rows) {
      countMap.set(row.month, parseInt(row.count, 10));
    }

    const trends: AdminAuditTrendDto[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      trends.push({ month: monthName, count: countMap.get(key) || 0 });
    }

    return trends;
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  // --- Settings & Help Resources ---

  private stripUndefined<T extends object>(input: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
  }

  async getSettings(): Promise<PlatformSetting> {
    const existing = await this.settingsRepository.findOne({ where: { id: 'app' } });
    if (existing) return existing;
    const created = this.settingsRepository.create({ id: 'app' });
    return this.settingsRepository.save(created);
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<PlatformSetting> {
    const current = await this.getSettings();
    Object.assign(current, this.stripUndefined(dto));
    return this.settingsRepository.save(current);
  }

  async getHelpResources(): Promise<HelpResource[]> {
    return this.helpRepository.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  async createHelpResource(dto: CreateHelpResourceDto): Promise<HelpResource> {
    const resource = this.helpRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category ?? 'support',
      href: dto.href ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
    });
    return this.helpRepository.save(resource);
  }

  async updateHelpResource(id: string, dto: UpdateHelpResourceDto): Promise<HelpResource> {
    const resource = await this.helpRepository.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Help resource not found');
    Object.assign(resource, this.stripUndefined(dto));
    return this.helpRepository.save(resource);
  }

  async deleteHelpResource(id: string): Promise<void> {
    const result = await this.helpRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Help resource not found');
  }
}