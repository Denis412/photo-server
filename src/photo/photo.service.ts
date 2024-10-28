import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';
import { PhotoResponse } from 'src/photo/interfaces/photo-response.interface';

@Injectable()
export class PhotoService {
  private logger = new Logger(PhotoService.name);

  constructor(private config: ConfigService) {}

  async save(
    file: Express.Multer.File,
    clientHash: string,
  ): Promise<PhotoResponse> {
    const mimeType = mime.lookup(file.originalname) || file.mimetype;

    if (!['image/jpeg'].includes(mimeType)) {
      this.logger.warn(`Недопустимый тип файла: ${mimeType}`);
      throw new BadRequestException('Недопустимый тип файла');
    }

    const hashSum = crypto.createHash('sha256');
    hashSum.update(file.buffer);
    const serverHash = hashSum.digest('hex');

    if (clientHash !== serverHash) {
      this.logger.warn('Хеш-суммы не совпадают. Данные могут быть повреждены.');
      throw new BadRequestException(
        'Данные повреждены: хеш-суммы не совпадают',
      );
    }

    const savePath = this.config.get<string>('PHOTO_SAVE_PATH');

    const date = new Date();
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);

    const dirPath = path.join(savePath, `${year}-${month}-${day}`);

    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }

    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(dirPath, uniqueFilename);

    const startTime = Date.now();
    await fs.promises.writeFile(filePath, file.buffer);
    const endTime = Date.now();
    const saveTime = endTime - startTime;

    if (saveTime > 50) {
      this.logger.warn(
        `Время сохранения файла (${saveTime} мс) превышает допустимое.`,
      );
    }

    this.logger.log(
      `Фото сохранено: ${filePath}, время сохранения: ${saveTime} мс`,
    );

    return {
      message: 'Фото успешно сохранено',
      filename: uniqueFilename,
    };
  }
}
