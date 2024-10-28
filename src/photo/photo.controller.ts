import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoResponse } from 'src/photo/interfaces/photo-response.interface';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('photo'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('hash') clientHash: string,
  ): Promise<PhotoResponse> {
    if (!clientHash) {
      throw new BadRequestException('Хеш-сумма не предоставлена');
    }

    return this.photoService.save(file, clientHash);
  }
}
