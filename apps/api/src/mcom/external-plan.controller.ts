import { Controller, Get, Post, Patch, Delete, Param, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { ExternalPlanService } from './external-plan.service';
import { CreateExternalPlanDto, UpdateExternalPlanDto, ExternalPlanResponseDto } from './dto/external-plan.dto';

@ApiTags('MCOM Billing - Plan Management')
@Controller('system/plans')
export class ExternalPlanController {
  constructor(private readonly externalPlanService: ExternalPlanService) {}

  private verifyApiKey(apiKey: string | undefined): void {
    const expectedKey = process.env.MCOM_API_KEY;
    if (!expectedKey) {
      throw new HttpException('MCOM_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (apiKey !== expectedKey) {
      throw new HttpException('Unauthorized: Invalid MCOM API Key', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all external plans for 247GBSAUDIT' })
  @ApiResponse({ type: [ExternalPlanResponseDto] })
  @ApiHeader({ name: 'x-mcom-solution-api-key', required: true, description: 'MCOM Solutions API Key' })
  async findAll(@Headers('x-mcom-solution-api-key') apiKey: string): Promise<ExternalPlanResponseDto[]> {
    this.verifyApiKey(apiKey);
    return this.externalPlanService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single external plan by ID' })
  @ApiResponse({ type: ExternalPlanResponseDto })
  @ApiHeader({ name: 'x-mcom-solution-api-key', required: true, description: 'MCOM Solutions API Key' })
  @ApiParam({ name: 'id', example: 'tier-1' })
  async findOne(
    @Headers('x-mcom-solution-api-key') apiKey: string,
    @Param('id') id: string,
  ): Promise<ExternalPlanResponseDto> {
    this.verifyApiKey(apiKey);
    return this.externalPlanService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new external plan' })
  @ApiResponse({ type: ExternalPlanResponseDto, status: 201 })
  @ApiHeader({ name: 'x-mcom-solution-api-key', required: true, description: 'MCOM Solutions API Key' })
  async create(
    @Headers('x-mcom-solution-api-key') apiKey: string,
    @Body() dto: CreateExternalPlanDto,
  ): Promise<ExternalPlanResponseDto> {
    this.verifyApiKey(apiKey);
    return this.externalPlanService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an external plan' })
  @ApiResponse({ type: ExternalPlanResponseDto })
  @ApiHeader({ name: 'x-mcom-solution-api-key', required: true, description: 'MCOM Solutions API Key' })
  @ApiParam({ name: 'id', example: 'tier-1' })
  async update(
    @Headers('x-mcom-solution-api-key') apiKey: string,
    @Param('id') id: string,
    @Body() dto: UpdateExternalPlanDto,
  ): Promise<ExternalPlanResponseDto> {
    this.verifyApiKey(apiKey);
    return this.externalPlanService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive (soft delete) an external plan' })
  @ApiResponse({ status: 204 })
  @ApiHeader({ name: 'x-mcom-solution-api-key', required: true, description: 'MCOM Solutions API Key' })
  @ApiParam({ name: 'id', example: 'tier-1' })
  async delete(
    @Headers('x-mcom-solution-api-key') apiKey: string,
    @Param('id') id: string,
  ): Promise<void> {
    this.verifyApiKey(apiKey);
    await this.externalPlanService.delete(id);
  }
}