import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage/lib/gridfs';
import { GridFSBucket } from 'mongodb';
import { ObjectId } from 'mongodb';

@Injectable()
export class FileService {
  private gridFsStorage: GridFsStorage;
  private gridFsBucket: GridFSBucket;

  constructor(
    // private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.gridFsBucket = new GridFSBucket(this.connection.db);
    /*
    this.gridFsStorage = new GridFsStorage({
      db: connection.db as any,
      file: async (req, file) => {
        const filename = file.originalname.trim();
        const fileInfo = {
          filename: filename,
        };

        return fileInfo;
      },
    });
    */
  }

  createMulterOptions() {
    return {
      storage: this.gridFsStorage,
    };
  }

  async uploadFile(file: Express.Multer.File, options: any) {
    const uploadStream = this.gridFsBucket.openUploadStream(file.originalname, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    return await new Promise((resolve, reject) => {
      uploadStream.end(file.buffer, () => {
        resolve(uploadStream.id);
      });
    });
  }

  async getFile(id: ObjectId) {
    const file = this.gridFsBucket.find({ _id: id });
    return await file.next();
  }

  async streamFile(id: ObjectId) {
    const stream = this.gridFsBucket.openDownloadStream(id);
    return stream;
  }
}
