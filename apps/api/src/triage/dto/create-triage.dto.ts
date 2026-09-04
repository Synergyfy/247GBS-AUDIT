import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTriageDto {
  @ApiProperty({ example: 'yes', description: 'Do you have excess stock?' })
  @IsString()
  @IsOptional()
  hasExcessStock: string;

  @ApiProperty({ example: 45, description: 'Percentage of excess stock (0-100)' })
  @IsNumber()
  @IsOptional()
  stockExtent: number;

  @ApiProperty({ example: 'serious', description: 'Impact of excess stock' })
  @IsString()
  @IsOptional()
  stockImpact: string;

  @ApiProperty({ example: 'no', description: 'Do you have spare capacity?' })
  @IsString()
  @IsOptional()
  hasSpareCapacity: string;

  @ApiProperty({ example: 0, description: 'Percentage of spare capacity (0-100)' })
  @IsNumber()
  @IsOptional()
  capacityExtent: number;

  @ApiProperty({ example: 'not-yet', description: 'Impact of spare capacity' })
  @IsString()
  @IsOptional()
  capacityImpact: string;

  @ApiProperty({ example: 'very', description: 'Confidence in stock estimate' })
  @IsString()
  @IsOptional()
  confidenceStock: string;

  @ApiProperty({ example: 'fairly', description: 'Confidence in capacity estimate' })
  @IsString()
  @IsOptional()
  confidenceCapacity: string;

  @ApiProperty({ example: 'under-min-wage', description: 'Monthly staff cost range' })
  @IsString()
  @IsOptional()
  staffCost: string;

  @ApiProperty({ example: '10k-50k', description: 'Monthly turnover range' })
  @IsString()
  @IsOptional()
  monthlyTurnover: string;

  @ApiProperty({ example: '20k-50k', description: 'Stock value range' })
  @IsString()
  @IsOptional()
  stockValue: string;

  @ApiProperty({ example: 'yes', description: 'Ready to proceed?' })
  @IsString()
  @IsOptional()
  isReady: string;
}
