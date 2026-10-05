import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityStatusDto, BillingInfoDto, NotificationSettingDto } from './dto/protocols.dto';
import { NotificationSetting } from './entities/notification-setting.entity';
import { BillingProfile } from './entities/billing-profile.entity';
import { Invoice } from './entities/invoice.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProtocolsService {
  constructor(
    @InjectRepository(NotificationSetting)
    private readonly notificationRepository: Repository<NotificationSetting>,
    @InjectRepository(BillingProfile)
    private readonly billingRepository: Repository<BillingProfile>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly usersService: UsersService,
  ) {}

  async getSecurityStatus(userId: string): Promise<SecurityStatusDto> {
    const user = await this.usersService.findById(userId);
    return {
      is2FAEnabled: user?.isMfaEnabled ?? false,
      passwordStrength: 'Unknown',
      lastLogin: user?.lastLoginAt ? user.lastLoginAt.toISOString() : 'Never',
      masterKeyActive: user?.isMfaEnabled ?? false,
    };
  }

  async rotateMasterKey(userId: string): Promise<{ success: boolean; message: string }> {
    // TODO: implement real key rotation (re-derive AES key for MCOM token
    // storage and re-encrypt all stored tokens). Disabled until implemented.
    throw new HttpException('Master key rotation is not implemented yet', HttpStatus.NOT_IMPLEMENTED);
  }

  async getBillingInfo(userId: string): Promise<BillingInfoDto> {
    const profile = await this.billingRepository.findOne({
      where: { userId },
      relations: ['invoices'],
    });

    if (!profile) {
      return {
        planName: 'No Plan',
        price: '£0 / Month',
        last4: '----',
        expiry: '--/--',
        history: [],
      };
    }

    return {
      planName: profile.planName,
      price: profile.price,
      last4: profile.last4,
      expiry: profile.expiry,
      history: (profile.invoices || []).map((inv) => ({
        id: inv.invoiceNumber,
        date: inv.date,
        amount: inv.amount,
        status: inv.status,
      })),
    };
  }

  async getNotifications(userId: string): Promise<NotificationSettingDto[]> {
    const settings = await this.notificationRepository.find({ where: { userId } });
    if (settings.length === 0) {
        // Fallback for un-seeded users to show something
        return [
            { title: "Forensic Alerts", desc: "Immediate notification of detected capacity leaks.", active: true },
            { title: "Strategic Insights", desc: "Weekly AI-generated market trend analysis.", active: true },
        ];
    }
    return settings.map((s) => ({
      title: s.title,
      desc: s.description,
      active: s.isActive,
    }));
  }

  async updateNotification(userId: string, title: string, active: boolean): Promise<NotificationSettingDto[]> {
    const setting = await this.notificationRepository.findOne({ where: { userId, title } });
    if (setting) {
      setting.isActive = active;
      await this.notificationRepository.save(setting);
    } else {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId,
          title,
          description: title,
          isActive: active,
        }),
      );
    }
    return this.getNotifications(userId);
  }

  async purchaseTokens(amount: number, userId: string): Promise<{ balance: number }> {
    // No payment provider is integrated. Disable until Stripe (or equivalent)
    // verification exists to prevent free infinite credit minting.
    throw new HttpException('Token purchase is not available yet', HttpStatus.NOT_IMPLEMENTED);
  }
}
