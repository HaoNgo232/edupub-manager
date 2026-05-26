import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { sanitizeUser } from '../utils/sanitize';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() userPayload: JwtPayload) {
    const user = await this.usersService.findOneById(userPayload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return sanitizeUser(user);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() userPayload: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(userPayload.sub, updateUserDto);
    return sanitizeUser(user);
  }
}
