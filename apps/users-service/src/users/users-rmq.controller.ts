import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { isUUID } from 'class-validator';
import { UsersService } from './users.service.js';

@Controller()
export class UsersRmqController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.validate')
  async validateUser(
    @Payload() data: { userId: string },
  ): Promise<{ exists: boolean }> {
    if (!data || !isUUID(data.userId)) {
      throw new RpcException('Invalid user ID');
    }

    return this.usersService.userExists(data.userId);
  }
}
