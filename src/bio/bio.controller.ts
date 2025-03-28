import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { BioService } from './bio.service';
import { CurrentUser } from 'src/user/user.decorator';
import { UserService } from 'src/user/user.service';
import { JwtData } from 'src/types/JwtData';
import { CreateBioDto } from './bio.validation';

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
  async getBio(@Param('handle') handle: string, @CurrentUser() currentUser: JwtData) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio)
      throw new NotFoundException();

    const { _id, _schemaVersion, ...data } = dbBio.toJSON();

    return data;
  }

  @Post()
  async createBio(@Body() body: CreateBioDto, @CurrentUser() currentUser: JwtData) {
    const { name, handle } = body;

    const dbUser = await this.userService.fromJwtData(currentUser);

    const dbBio = await this.bioService.createBio({
      name,
      handle,
      user: dbUser,
    });

    return dbBio.toJSON();
  }

  @Patch()
  async editBio() {
    // TODO: make
  }

  @Delete(':handle')
  async deleteBio(@Param('handle') handle: string) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio)
      throw new NotFoundException();

    await dbBio.deleteOne();
  }
}
