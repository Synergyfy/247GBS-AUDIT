import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, LessThan, Raw } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AuditSession, AuditStatus } from '../audit/entities/audit-session.entity';
import { AdminDashboardResponseDto, AdminStatItemDto, AdminActivityItemDto, AdminAuditTrendDto, AdminAuditItemDto, AdminAuditMetricsDto, AdminUserItemDto } from './dto/admin-dashboard.dto';
import { AdminCreateUserDto, AdminUpdateUserDto, AdminCreateAuditDto, AdminUpdateAuditDto } from './dto/admin-actions.dto';
import { Invoice } from '../protocols/entities/invoice.entity';
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
  ) {}

  async verifyAdmin(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'Administrator') {
       throw new ForbiddenException('Access denied. Admin only.');
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

  async createUser(dto: AdminCreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('User with this email already exists.');

    const password = dto.password || Math.random().toString(36).slice(-8); 
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      status: 'Active',
    });

    return this.userRepository.save(user);
  }

  async updateUser(id: string, dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
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
      .select(`
        COUNT(CASE WHEN audit.status IN (:...activeStatuses) THEN 1 END), "totalActive"),
        COUNT(CASE WHEN audit.status = :completed THEN 1 END), "inReview"),
        COUNT(CASE WHEN audit.status = :completed AND audit.updatedAt >= :startOfMonth THEN 1 END), "completedThisMonth"),
        COUNT(CASE WHEN audit.status IN (:...activeStatuses) AND audit.dueDate < :now THEN 1 END), "overdue")
      `)
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
    if (audit.status === AuditStatus.IN_PROGRESS) return 65;
    if (audit.status === AuditStatus.SECTOR_SELECTED) return 30;
    return 10;
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
        .select('COALESCE(SUM(CAST(invoice.amount AS DECIMAL)), 0)', 'total')
        .getRawOne(),
      this.userRepository.count({ where: { createdAt: Between(thirtyDaysAgo, now) } }),
      this.userRepository.count({ where: { createdAt: Between(sixtyDaysAgo, thirtyDaysAgo) } }),
      this.auditRepository.count({ where: { createdAt: Between(thirtyDaysAgo, now) } }),
      this.auditRepository.count({ where: { createdAt: Between(sixtyDaysAgo, thirtyDaysAgo) } }),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('COALESCE(SUM(CAST(invoice.amount AS DECIMAL)), 0)', 'total')
        .where('invoice.date >= :start AND invoice.date <= :end', { start: thirtyDaysAgo, end: now })
        .getRawOne(),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('COALESCE(SUM(CAST(invoice.amount AS DECIMAL)), 0)', 'total')
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
}