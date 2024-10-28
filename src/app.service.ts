import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  serverRunInfo(): string {
    return 'Server is running!';
  }
}
