import { ApiProperty } from '@nestjs/swagger';

export class SpecialistDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviews: number;

  @ApiProperty({ type: [String] })
  expertise: string[];

  @ApiProperty()
  status: 'Available' | 'In Call' | 'Out of Office';

  @ApiProperty()
  experience: string;

  @ApiProperty()
  image: string;
}

export class SpecialistStatsDto {
  @ApiProperty()
  verifiedExperts: string;

  @ApiProperty()
  successfulDeployments: string;

  @ApiProperty()
  globalReach: string;

  @ApiProperty()
  avgResponseTime: string;
}
