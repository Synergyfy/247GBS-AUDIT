import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John', description: 'First name', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: '+44 20 7123 4567', description: 'Phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Global Corp', description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty({ example: 'London, UK', description: 'Location', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'www.globalcorp.com', description: 'Website URL', required: false })
  @IsString()
  @IsOptional()
  website?: string;
}
