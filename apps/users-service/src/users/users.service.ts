import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersRepository } from './users.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  private toPublicUser(
    user: NonNullable<Awaited<ReturnType<UsersRepository['findById']>>>,
  ) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.repository.findByEmailOrUsername(
      dto.email,
      dto.username,
    );

    if (existing) {
      throw new ConflictException('Email or username already exists');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      const user = await this.repository.create({
        username: dto.username,
        email: dto.email,
        passwordHash,
      });

      return this.toPublicUser(user);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Email or username already exists');
      }

      throw error;
    }
  }

  async findAll() {
    const users = await this.repository.findAll();
    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: string) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const { password, ...rest } = dto;

    const data: Record<string, unknown> = { ...rest };

    if (password !== undefined) {
      data.passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
      });
    }

    try {
      const updated = await this.repository.update(id, data);

      if (!updated) {
        throw new NotFoundException('User not found');
      }

      return this.toPublicUser(updated);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Email or username already exists');
      }

      throw error;
    }
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}
