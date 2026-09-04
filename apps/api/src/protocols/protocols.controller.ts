import { Controller, Get, Post, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ProtocolsService } from './protocols.service';
import { SecurityStatusDto, BillingInfoDto, NotificationSettingDto, UpdateNotificationDto } from './dto/protocols.dto';
import type { Request } from 'express';

@ApiTags('Protocols')
@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get('security')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Security Status', description: 'Returns 2FA status and key info.' })
  @ApiResponse({ status: 200, type: SecurityStatusDto })
  async getSecurity(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.protocolsService.getSecurityStatus(userId);
  }

  @Post('security/rotate-key')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Rotate Master Key', description: 'Rotates the vault encryption key.' })
  async rotateKey(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.protocolsService.rotateMasterKey(userId);
  }

  @Get('billing')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Billing Info', description: 'Returns subscription and invoice history.' })
  @ApiResponse({ status: 200, type: BillingInfoDto })
  async getBilling(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.protocolsService.getBillingInfo(userId);
  }

  @Get('notifications')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Notification Settings', description: 'Returns user notification preferences.' })
  @ApiResponse({ status: 200, type: [NotificationSettingDto] })
  async getNotifications(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.protocolsService.getNotifications(userId);
  }

  @Patch('notifications')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update Notification', description: 'Toggles a notification setting.' })
  async updateNotification(@Req() req: Request, @Body() dto: UpdateNotificationDto) {
    const userId = (req as any).user.sub;
    return this.protocolsService.updateNotification(userId, dto.title, dto.active);
  }

  @Post('tokens/purchase')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Purchase Tokens', description: 'Adds tokens to the user account.' })
  @ApiBody({ schema: { example: { amount: 10 } } })
  async purchaseTokens(@Req() req: Request, @Body() body: { amount?: number }) {
    const user = (req as any).user;
    const amount = body.amount && body.amount > 0 ? body.amount : 10;
    return this.protocolsService.purchaseTokens(amount, user.sub);
  }
}
