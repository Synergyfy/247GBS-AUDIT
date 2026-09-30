import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { McomService } from './mcom.service';

@ApiTags('Ecosystem Catalog')
@Controller('ecosystem')
export class EcosystemController {
  constructor(private readonly mcomService: McomService) {}

  @Public()
  @Get('sectors')
  @ApiOperation({ summary: 'Get all ecosystem sectors from Central Hub Solution' })
  async getSectors() {
    return this.mcomService.getSectors();
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get categories from Central Hub Solution, optionally filtered by sectorId' })
  async getCategories(@Query('sectorId') sectorId?: string) {
    return this.mcomService.getCategories(sectorId);
  }

  @Public()
  @Get('subcategories')
  @ApiOperation({ summary: 'Get subcategories from Central Hub Solution, optionally filtered by categoryId' })
  async getSubcategories(@Query('categoryId') categoryId?: string) {
    return this.mcomService.getSubcategories(categoryId);
  }
}
