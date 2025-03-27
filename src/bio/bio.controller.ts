import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BioService } from './bio.service';
import { CurrentUser } from 'src/user/user.decorator';
import { JwtPayload } from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';
import { JwtData } from 'src/types/JwtData';

@Controller('bio')
export class BioController {
  constructor(
    private readonly bioService: BioService,
    private readonly userService: UserService,
  ) { }

  @Get()
  async getBios(@CurrentUser() currentUser: JwtData) {
    const dbUser = await this.userService.fromJwtData(currentUser);
    return await this.bioService.findByUser(dbUser);
  }

  @Get(':handle')
  async getBio(@Param('handle') handle, @CurrentUser() currentUser: JwtPayload) {
    const dbUser = await this.bioService.findByHandle(handle);
    const { _id, _schemaVersion, ...data } = dbUser.toJSON();

    return data;
  }

  @Post()
  async createBio() {

  }

  @Patch()
  async editBio() {

  }

  @Delete()
  async deleteBio() {

  }
}
