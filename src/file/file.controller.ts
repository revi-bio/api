import { Controller, Get, Param, StreamableFile, Res } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { FileService } from './file.service';
import { ObjectId } from 'mongodb';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Get(':id')
  async getFile(@Param('id') id: string) {
    const objid = new ObjectId(id);
    const fileStream = await this.fileService.streamFile(objid);
    const fileData = await this.fileService.getFileByObjectId(objid);
    return new StreamableFile(fileStream, {
      type: fileData.metadata.contentType,
    });
  }
}
