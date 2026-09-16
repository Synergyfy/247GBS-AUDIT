import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SsoCallbackDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  state: string;
}

export class RefreshTokensDto {
  @ApiProperty()
  @IsString()
  userId: string;
}

export class WebhookEventDto {
  @ApiProperty()
  @IsString()
  event: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: any;
}
