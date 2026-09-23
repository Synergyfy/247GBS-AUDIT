import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

// Security DTOs
export class SecurityStatusDto {
  @ApiProperty({ example: true, description: 'Is 2FA enabled?' })
  is2FAEnabled: boolean;

  @ApiProperty({ example: 'High', description: 'Password strength' })
  passwordStrength: string;

  @ApiProperty({ example: '2026-02-04T10:00:00Z', description: 'Last login timestamp' })
  lastLogin: string;

  @ApiProperty({ example: true, description: 'Is master key active?' })
  masterKeyActive: boolean;
}

// Billing DTOs
export class InvoiceDto {
  @ApiProperty({ example: '#INV-902' })
  id: string;

  @ApiProperty({ example: 'Jan 01, 2026' })
  date: string;

  @ApiProperty({ example: '£499.00' })
  amount: string;

  @ApiProperty({ example: 'Paid' })
  status: string;
}

export class BillingInfoDto {
  @ApiProperty({ example: 'Growth Specialist' })
  planName: string;

  @ApiProperty({ example: '£499 / Month' })
  price: string;

  @ApiProperty({ example: '•••• •••• •••• 4242' })
  last4: string;

  @ApiProperty({ example: '12/28' })
  expiry: string;

  @ApiProperty({ type: [InvoiceDto] })
  history: InvoiceDto[];
}

// Notification DTOs
export class NotificationSettingDto {
  @ApiProperty({ example: 'Forensic Alerts' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Immediate notification of detected capacity leaks.' })
  @IsString()
  desc: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean;
}

export class UpdateNotificationDto {
  @ApiProperty({ example: 'Forensic Alerts' })
  @IsString()
  title: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  active: boolean;
}
