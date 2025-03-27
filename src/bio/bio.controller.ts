import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BioService } from './bio.service';
import { CurrentUser } from 'src/user/user.decorator';
import { JwtPayload } from 'jsonwebtoken';

@Controller('bio')
export class BioController {
  constructor(private readonly bioService: BioService) { }

  @Get()
  async getBios() {

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
