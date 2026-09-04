import { Controller, Get, Req, UseGuards, ForbiddenException, Query, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AdminService } from './admin.service';
import { AdminDashboardResponseDto, AdminStatItemDto, AdminActivityItemDto, AdminAuditTrendDto, AdminAuditItemDto, AdminAuditMetricsDto, AdminUserItemDto } from './dto/admin-dashboard.dto';
import { AdminCreateUserDto, AdminUpdateUserDto, AdminCreateAuditDto, AdminUpdateAuditDto } from './dto/admin-actions.dto';
import type { Request } from 'express';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private getUserId(req: Request): string {
    const user = (req as any).user;
    if (!user || !user.sub) throw new ForbiddenException();
    return user.sub;
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Full Admin Dashboard', description: 'Returns all dashboard data aggregated.' })
  @ApiResponse({ type: AdminDashboardResponseDto })
  async getDashboard(@Req() req: Request) {
    return this.adminService.getDashboardData(this.getUserId(req));
  }

  // --- Users ---

  @Get('users')
  @ApiOperation({ summary: 'Get All Users', description: 'Returns a list of users.' })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ type: [AdminUserItemDto] })
  async getUsers(
    @Req() req: Request,
    @Query('search') search?: string
  ) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.getUsers(search);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create User', description: 'Create a new user/admin.' })
  async createUser(@Req() req: Request, @Body() dto: AdminCreateUserDto) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update User', description: 'Update user details.' })
  async updateUser(@Req() req: Request, @Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete User', description: 'Remove a user.' })
  async deleteUser(@Req() req: Request, @Param('id') id: string) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.deleteUser(id);
  }

  // --- Audits ---

  @Get('audits')
  @ApiOperation({ summary: 'Get All Audits', description: 'Returns a list of audits with filtering.' })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ type: [AdminAuditItemDto] })
  async getAudits(
    @Req() req: Request,
    @Query('filter') filter?: string,
    @Query('search') search?: string
  ) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.getAudits(filter, search);
  }

  @Post('audits')
  @ApiOperation({ summary: 'Create Audit', description: 'Initiate a new audit session.' })
  async createAudit(@Req() req: Request, @Body() dto: AdminCreateAuditDto) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.createAudit(dto);
  }

  @Get('audits/metrics')
  @ApiOperation({ summary: 'Get Audit Metrics', description: 'Returns summary metrics for the audits page.' })
  @ApiResponse({ type: AdminAuditMetricsDto })
  async getAuditMetrics(@Req() req: Request) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.getAuditMetrics();
  }

  @Get('audits/:id')
  @ApiOperation({ summary: 'Get Audit Details', description: 'Get full audit details.' })
  async getAudit(@Req() req: Request, @Param('id') id: string) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.getAudit(id);
  }

  @Patch('audits/:id')
  @ApiOperation({ summary: 'Update Audit', description: 'Update audit status or details.' })
  async updateAudit(@Req() req: Request, @Param('id') id: string, @Body() dto: AdminUpdateAuditDto) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.updateAudit(id, dto);
  }

  @Delete('audits/:id')
  @ApiOperation({ summary: 'Delete Audit', description: 'Remove an audit.' })
  async deleteAudit(@Req() req: Request, @Param('id') id: string) {
    await this.adminService.verifyAdmin(this.getUserId(req));
    return this.adminService.deleteAudit(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get Dashboard Stats', description: 'Returns main statistics cards.' })
  @ApiResponse({ type: [AdminStatItemDto] })
  async getStats(@Req() req: Request) {
     await this.adminService.verifyAdmin(this.getUserId(req));
     return this.adminService.getStats();
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get Recent Activities', description: 'Returns recent system activities.' })
  @ApiResponse({ type: [AdminActivityItemDto] })
  async getActivities(@Req() req: Request) {
     await this.adminService.verifyAdmin(this.getUserId(req));
     return this.adminService.getRecentActivities();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get Audit Trends', description: 'Returns audit volume trends.' })
  @ApiResponse({ type: [AdminAuditTrendDto] })
  async getTrends(@Req() req: Request) {
     await this.adminService.verifyAdmin(this.getUserId(req));
     return this.adminService.getAuditTrends();
  }
}