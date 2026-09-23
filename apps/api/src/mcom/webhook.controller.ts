import {
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { McomService } from './mcom.service';
import { UsersService } from '../users/users.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly processedBodies = new Set<string>();
  private readonly MAX_DEDUP_SIZE = 1000;

  constructor(
    private mcomService: McomService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'MCOM webhook receiver' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const signature = req.headers['x-webhook-signature'] as string;

      if (!signature) {
        throw new HttpException(
          'Missing webhook signature',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!this.mcomService.verifyWebhookSignature(rawBody, signature)) {
        throw new HttpException(
          'Invalid webhook signature',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const bodyHash = this.mcomService.hashBody(rawBody);
      if (this.processedBodies.has(bodyHash)) {
        return res.status(200).json({ received: true, duplicate: true });
      }

      if (this.processedBodies.size >= this.MAX_DEDUP_SIZE) {
        const firstHash = this.processedBodies.values().next().value;
        this.processedBodies.delete(firstHash);
      }
      this.processedBodies.add(bodyHash);

      const event = req.body;
      const eventType = event.event || event.type;
      const userId = event.data?.userId || event.data?.user_id;
      const membershipData = event.data?.membership || event.data;

      this.logger.log(
        `Processing webhook event: ${eventType} for user: ${userId}`,
      );

      if (!userId) {
        this.logger.warn(`Webhook event ${eventType} missing userId, skipping`);
        return res.status(200).json({ received: true, skipped: true });
      }

      const user = await this.usersService.findById(userId);
      if (!user) {
        this.logger.warn(`Webhook user ${userId} not found in local DB`);
        return res.status(200).json({ received: true, userNotFound: true });
      }

      switch (eventType) {
        case 'package.created':
        case 'package.renewed':
          await this.usersService.update(userId, {
            mcomMembershipStatus: 'active',
            mcomMembershipLevel:
              membershipData?.level ||
              membershipData?.membershipLevel ||
              user.mcomMembershipLevel,
            mcomMembershipTier:
              membershipData?.tier ||
              membershipData?.membershipTier ||
              user.mcomMembershipTier,
            mcomCanAccessVcard: true,
          });
          this.logger.log(
            `User ${userId} membership activated via ${eventType}`,
          );
          break;

        case 'package.cancelled':
        case 'package.expired':
          await this.usersService.update(userId, {
            mcomMembershipStatus: 'inactive',
            mcomCanAccessVcard: false,
          });
          this.logger.log(
            `User ${userId} membership deactivated via ${eventType}`,
          );
          break;

        case 'payment.failed':
          this.logger.warn(
            `Payment failed for user ${userId}: ${JSON.stringify(event.data)}`,
          );
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${eventType}`);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Webhook processing error: ${error.message}`);
      throw new HttpException(
        'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
