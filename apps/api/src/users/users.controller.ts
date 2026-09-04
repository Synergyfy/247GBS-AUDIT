import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get User Profile', description: 'Retrieves the authenticated user\'s profile details.' })
  @ApiResponse({
    status: 200,
    description: 'User profile.',
    schema: {
      example: {
        id: 'uuid-123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        businessName: 'Global Corp',
        phone: '+44 123',
        location: 'London',
        website: 'example.com',
        role: 'Administrator',
        tokens: 12
      }
    }
  })
  async getProfile(@Req() req: Request) {
    const user = (req as any).user;
    return this.usersService.findById(user.sub);
  }

  @Patch('profile')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update User Profile', description: 'Updates the authenticated user\'s profile information.' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
    const user = (req as any).user;
    await this.usersService.update(user.sub, updateProfileDto);
    return this.usersService.findById(user.sub);
  }
}
