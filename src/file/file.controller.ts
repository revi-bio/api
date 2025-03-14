import { Controller, Get, Param } from "@nestjs/common";
import { Public } from "src/auth/public.decorator";
import { FileService } from "./file.service";

@Controller('file')
export class FileController {
    
    constructor(private readonly fileService: FileService) {}

    @Public()
    @Get(':id')
    async getFile(@Param('id') id: string) {
        return 
    }
}
