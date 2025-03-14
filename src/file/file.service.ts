import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage/lib/gridfs';
import { GridFSBucket } from 'mongodb';

@Injectable()
export class FileService {
  private gridFsStorage: GridFsStorage;
  private gridFsBucket: GridFSBucket;

  constructor(
    // private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.gridFsBucket = new GridFSBucket(this.connection.db);
    this.gridFsStorage = new GridFsStorage({
      db: connection,
      file: async (req, file) => {
        const filename = file.originalname.trim();
        const fileInfo = {
          filename: filename,
        };

        return fileInfo;
      },
    });
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
        resolve(file);
      });
    });
  }

  async getFile(id: string) {
    return this.gridFsBucket.find({ id });
  }
}
