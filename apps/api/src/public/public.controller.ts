import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Public Platform Settings',
    description: 'Admin-configurable landing/support content for public pages.',
  })
  @ApiResponse({ status: 200, description: 'Public settings.' })
  async getSettings() {
    return this.publicService.getSettings();
  }

  @Get('help-resources')
  @ApiOperation({
    summary: 'Help Resources',
    description: 'Active, admin-curated help/service/funding resources.',
  })
  @ApiQuery({ name: 'category', required: false, enum: ['support', 'service', 'funding', 'guide'] })
  @ApiResponse({ status: 200, description: 'Active help resources.' })
  async getHelpResources(@Query('category') category?: string) {
    return this.publicService.getHelpResources(category);
  }
}