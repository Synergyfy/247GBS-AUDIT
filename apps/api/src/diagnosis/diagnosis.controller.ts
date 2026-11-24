import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { DiagnosisService } from './diagnosis.service';

@ApiTags('Diagnosis')
@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Public()
  @Get('services')
  @ApiOperation({
    summary: 'List MCOM capabilities available for recommendation mapping',
  })
  listServices() {
    return this.diagnosisService.listServices();
  }

  @Public()
  @Get('default-config')
  @ApiOperation({
    summary: 'Default diagnosis categories and recommendation rules',
  })
  defaultConfig() {
    return this.diagnosisService.defaultConfig();
  }
}
