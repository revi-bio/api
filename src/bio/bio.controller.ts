import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  ImATeapotException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BioService } from './bio.service';
import { CurrentUser } from 'src/user/user.decorator';
import { UserService } from 'src/user/user.service';
import { JwtData } from 'src/types/JwtData';
import { CreateBioDto, EditBioDto } from './bio.validation';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';

@Controller('bio')
export class BioController {
  constructor(
    private readonly bioService: BioService,
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  async getBios(@CurrentUser() currentUser: JwtData) {
    const dbUser = await this.userService.fromJwtData(currentUser);
    const dbBioList = await this.bioService.findByUser(dbUser);

    const formattedData = dbBioList.map((bio) => {
      const { _id, _schemaVersion, __v, ...data } = bio.toJSON();

      return { ...data, views: 0, widgets: 99 };
    });

    return formattedData;
  }

  @Get(':handle')
  async getBio(@Param('handle') handle: string, @CurrentUser() currentUser: JwtData) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();

    const { _id, _schemaVersion, __v, ...data } = dbBio.depopulate('user').toJSON();

    return { ...data, views: 0, widgets: 99 };
  }

  @Get(':handle/pages')
  async getPages(@Param('handle') handle: string) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();

    const pages = await this.bioService.getPages(dbBio);

    return pages;
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

    const { _id, _schemaVersion, __v, ...data } = dbBio.depopulate('user').toJSON();

    return data;
  }

  @Post(':handle/pages')
  async addPages(@Param('handle') handle: string, @Body() body: [object]) {
    const dbBio = await this.bioService.findByHandle(handle);
    
    if (!dbBio) throw new NotFoundException();
    
    const { _id, _schemaVersion, __v, ...data } = dbBio.depopulate('user').toJSON();
    
    const dbBioWithPages = await this.bioService.addPages(dbBio, body);

    const { ...pagesData } = dbBioWithPages.pages[dbBioWithPages.pages.length - 1];
    
    return { ...pagesData };
  }

  @Post('widgetImg')
  @UseInterceptors(FileInterceptor('file'))
  async addImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new ImATeapotException();
    
    const dbFile = await this.fileService.uploadFile(file, 'widgetImg');

    return dbFile;
  }

  @Patch(':handle')
  async editBio(@Body() body: EditBioDto, @Param('handle') handle: string, @CurrentUser() currentUser: JwtData) {
    // TODO: make
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();

    for (const key in body) {
      dbBio[key] = body[key];
    }

    dbBio.markModified('widgets');
    await dbBio.save();

    const { _id, _schemaVersion, __v, ...data } = dbBio.depopulate('user').toJSON();

    return data;
  }

  @Patch(':handle/bioPfp')
  @UseInterceptors(FileInterceptor('file'))
  async changePfp(
    @Param('handle') handle: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() CurrentUser: JwtData,
  ) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();

    if (!file) throw new ImATeapotException();

    const dbFile = await this.fileService.uploadFile(file, 'bioPfp');

    dbBio.avatar = dbFile;

    await dbBio.save();

    return dbFile;
  }

  @Delete(':handle/bioPfp')
  async deleteBioPfp(@Param('handle') handle: string, @CurrentUser() currentUser: JwtData) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();

    dbBio.avatar = undefined;

    await dbBio.save();
  }

  @Delete(':handle')
  async deleteBio(@Param('handle') handle: string) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();

    await dbBio.deleteOne();
  }
}
