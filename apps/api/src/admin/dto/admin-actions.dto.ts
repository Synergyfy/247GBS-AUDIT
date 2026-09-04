import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class AdminCreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  businessName?: string;

  @ApiProperty()
  @IsOptional()
  password?: string; // Optional, can generate random if not provided

  @ApiProperty()
  @IsOptional()
  role?: string;
}

export class AdminUpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  status?: string;
  
  @ApiProperty({ required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastName?: string;
}

export class AdminCreateAuditDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: string; // The business owner

  @ApiProperty()
  @IsNotEmpty()
  auditType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  assignee?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  dueDate?: Date;
}

export class AdminUpdateAuditDto extends PartialType(AdminCreateAuditDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  status?: string; // Map to AuditStatus enum in service
}
