import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

interface UserResponse {
  id: string;
  email: string;
}

@Injectable()
export class UsersClientService {
  private readonly logger = new Logger(UsersClientService.name);

  constructor(
    @Inject('USERS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async findById(userId: string): Promise<UserResponse | null> {
    try {
      this.logger.log(`Fetching user: ${userId}`);

      const user = await firstValueFrom(
        this.client
          .send<UserResponse | null>('users.findById', { userId })
          .pipe(timeout(3000)),
      );

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException('Users Service is unavailable');
    }
  }
}
