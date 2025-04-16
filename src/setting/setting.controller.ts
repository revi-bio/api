import { Body, Controller, Get, Post } from '@nestjs/common';
import { JwtData } from 'src/types/JwtData';
import { Settings } from 'src/types/schema/SettingContainer';
import { CurrentUser } from 'src/user/user.decorator';
import { SettingService } from './setting.service';
import { UserService } from 'src/user/user.service';

@Controller('setting')
export class SettingController {
  constructor(
    private readonly settingService: SettingService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getSettings(@CurrentUser() currentUser: JwtData) {
    const user = await this.userService.fromJwtData(currentUser);
    return await this.settingService.getSettings(user);
  }

  @Post()
  async setSettings(@Body() body: Settings, @CurrentUser() currentUser: JwtData) {
    const user = await this.userService.fromJwtData(currentUser);
    await this.settingService.setSettings(user, body);
  }
}
