import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class UsersClientService {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  async validateUser(userId: string): Promise<void> {
    let response: { exists: boolean };

    try {
      response = await firstValueFrom(
        this.usersClient
          .send<{ exists: boolean }>('users.validate', { userId })
          .pipe(timeout(3000)),
      );
    } catch (error) {
      throw new ServiceUnavailableException('Users Service is unavailable');
    }

    if (!response || typeof response.exists !== 'boolean') {
      throw new ServiceUnavailableException(
        'Invalid response from Users Service',
      );
    }

    if (!response.exists) {
      throw new BadRequestException('User does not exist');
    }
  }
}
