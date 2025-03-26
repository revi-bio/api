import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { ObjectId } from 'mongodb';

@Injectable()
export class FileService {
  private gridFsBucket: GridFSBucket;

  constructor(
    // private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.gridFsBucket = new GridFSBucket(this.connection.db);
  }

  async uploadFile(file: Express.Multer.File, type: string, identifier?: string): Promise<ObjectId> {
    const uploadStream = this.gridFsBucket.openUploadStream(file.originalname, {
      metadata: {
        contentType: file.mimetype,
        identifier,
        type,
      },
    });

    return await new Promise<ObjectId>((resolve, reject) => {
      uploadStream.end(file.buffer, () => {
        resolve(uploadStream.id);
      });
    });
  }

  async getFileByObjectId(id: ObjectId) {
    const file = this.gridFsBucket.find({ _id: id });
    return await file.next();
  }

  async getFileByIdentifier(identifier: string) {
    const file = this.gridFsBucket.find({ 'metadata.identifier': identifier });
    return await file.next();
  }

  async streamFile(id: ObjectId) {
    const stream = this.gridFsBucket.openDownloadStream(id);
    return stream;
  }
}
