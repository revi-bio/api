import { Injectable } from '@nestjs/common';
import { GridFsStorage } from 'multer-gridfs-storage/lib/gridfs';

@Injectable()
export class FileService {
    gridFsStorage: GridFsStorage;

    constructor () {
        this.gridFsStorage = new GridFsStorage({
            url: '', // TODO: put mongo uri here
            file: (req, file) => {
                return new Promise((resolve, reject) => {
                    const filename = file.originalname.trim();
                    const fileInfo = {
                      filename: filename
                    };
                    resolve(fileInfo);
                });
              }
        });
    }

    createMulterOptions() {
        return {
            storage: this.gridFsStorage,
        };
    }

    async uploadFile(file: Express.Multer.File, options: any) {

    }
}
