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
  ForbiddenException,
  Headers,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { BioService } from './bio.service';
import { CurrentUser } from 'src/user/user.decorator';
import { UserService } from 'src/user/user.service';
import { JwtData } from 'src/types/JwtData';
import { CreateBioDto, EditBioDto, SubmitClickDto, SubmitViewDto } from './bio.validation';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';
import { Public } from 'src/auth/public.decorator';
import * as murmur from 'murmurhash3js';

@Controller('bio')
export class BioController {
  constructor(
    private readonly bioService: BioService,
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

  @Post(':handle/visitor/visitorid/click')
  async submitClick(
    @Body() body: string,
    @Headers('Challenge-Answer') challengeAnswer: number,
    @Param('handle') handle: string,
    @Param('visitorid') visitorId: string,
  ) {
    if (['link', 'steam', 'instagram', 'youtube'].includes(body))
      throw new BadRequestException();

    const dbBio = await this.bioService.findByHandle(handle);
    if (!dbBio) throw new NotFoundException();

    const container = await this.bioService.getTodaysVisitContainer(dbBio);
    
    // Find the visitor in the array
    let visitor = container.visits.find(v => v.visitorId === visitorId);
    
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }
    
    if (!visitor.challengeCompleted) {
      if (visitor.challengeAnswer != challengeAnswer)
        throw new UnauthorizedException();

      visitor.challengeCompleted = true;
    }

    visitor.clicks.push(body);
    container.markModified('visits');
    await container.save();
  }

  @Post(':handle/visitor/:visitorid/view')
  async submitView(
    @Headers('Challenge-Answer') challengeAnswer: number,
    @Param('handle') handle: string,
    @Param('visitorid') visitorId: string,
  ) {
    const dbBio = await this.bioService.findByHandle(handle);
    if (!dbBio) throw new NotFoundException();

    const container = await this.bioService.getTodaysVisitContainer(dbBio);
    
    // Find the visitor in the array
    let visitor = container.visits.find(v => v.visitorId === visitorId);
    
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }
    
    if (!visitor.challengeCompleted) {
      if (visitor.challengeAnswer != challengeAnswer)
        throw new UnauthorizedException();

      visitor.challengeCompleted = true;
    }

    container.markModified('visits');
    await container.save();
  }

  @Get(':handle/visitor/:visitorid/challenge')
  async requestChallenge(
    @Param('handle') handle: string,
    @Param('visitorid') visitorId: string,
    @Headers('X-Country-Code') countryCode: string = 'unknown',
    @Headers('Referer') referrer?: string,
  ) {
    const dbBio = await this.bioService.findByHandle(handle);
    if (!dbBio) throw new NotFoundException();

    const container = await this.bioService.getTodaysVisitContainer(dbBio);
    const answer = Math.ceil(Math.random() * 1000000);
    const challenge = murmur.x86.hash128(`secret`, answer);

    // Find the visitor in the array
    let visitor = container.visits.find(v => v.visitorId === visitorId);
    
    // If visitor exists, update it, otherwise create a new one
    if (visitor) {
      visitor.challengeAnswer = answer;
      visitor.challengeCompleted = false;
    } else {
      visitor = {
        visitorId,
        clicks: [],
        countryCode: countryCode || 'unknown',
        referrer: referrer,
        challengeAnswer: answer,
        challengeCompleted: false,
      };
      container.visits.push(visitor);
    }

    container.markModified('visits');
    await container.save();

    return challenge;
  }

  @Get()
  async getBios(@CurrentUser() currentUser: JwtData) {
    const dbUser = await this.userService.fromJwtData(currentUser);
    const dbBioList = await this.bioService.findByUser(dbUser);

    const formattedData = dbBioList.map((bio) => {
      const { _id, _schemaVersion, __v, pages, ...data } = bio.toJSON();
      const widgets = Array.isArray(pages)
        ? pages.reduce((total, page: { widgets?: any[] }) => total + (page.widgets?.length || 0), 0)
        : 0;
      return { ...data, views: 0, widgetsCount: widgets, pagesCount: pages.length };
    });

    return formattedData;
  }

  @Public()
  @Get(':handle')
  async getBio(@Param('handle') handle: string, @CurrentUser() currentUser: JwtData) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();

    const { _id, _schemaVersion, __v, pages, ...data } = dbBio.depopulate('user').toJSON();
    const widgets = Array.isArray(pages)
      ? pages.reduce((total, page: { widgets?: any[] }) => total + (page.widgets?.length || 0), 0)
      : 0;
    return { ...data, views: 0, widgetsCount: widgets, pagesCount: pages.length };
  }

  @Public()
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

    const { _id, _schemaVersion, __v, pages, ...data } = dbBio.depopulate('user').toJSON();

    return { ...data, views: 0, widgets: 0 };
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
    @CurrentUser() currentUser: JwtData,
  ) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();
    if (!file) throw new ImATeapotException();
    if (dbBio.user._id != currentUser.id) throw new ForbiddenException();

    const dbFile = await this.fileService.uploadFile(file, 'bioPfp');

    dbBio.avatar = dbFile;

    await dbBio.save();

    return dbFile;
  }

  @Patch(':handle/bioWallpaper')
  @UseInterceptors(FileInterceptor('file'))
  async changeWallpaper(
    @Param('handle') handle: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: JwtData,
  ) {
    const dbBio = await this.bioService.findByHandle(handle);

    if (!dbBio) throw new NotFoundException();
    if (!file) throw new ImATeapotException();
    if (dbBio.user._id != currentUser.id) throw new ForbiddenException();

    const dbFile = await this.fileService.uploadFile(file, 'bioWallpaper');

    dbBio.backgroundImage = dbFile;

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
