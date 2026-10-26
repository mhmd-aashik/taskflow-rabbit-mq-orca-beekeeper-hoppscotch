import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;

  const repository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    findByEmailOrUsername: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useFactory: (repo: UsersRepository) => new UsersService(repo),
          inject: [UsersRepository],
        },
        {
          provide: UsersRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('throws 404 when user does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.findOne('00000000-0000-4000-8000-000000000001'),
    ).rejects.toThrow(NotFoundException);
  });

  it('does not expose password hashes', async () => {
    repository.findById.mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000001',
      username: 'alex',
      email: 'alex@example.com',
      passwordHash: 'secret-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.findOne(
      '00000000-0000-4000-8000-000000000001',
    );

    expect(result).not.toHaveProperty('passwordHash');
    expect(result.username).toBe('alex');
  });

  it('hashes passwords with Argon2id', async () => {
    repository.findByEmailOrUsername.mockResolvedValue(null);

    repository.create.mockImplementation(async (data) => ({
      id: '00000000-0000-4000-8000-000000000001',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await service.create({
      username: 'alex',
      email: 'alex@example.com',
      password: 'SecurePassword123!',
    });

    const saved = repository.create.mock.calls[0][0];

    expect(saved.passwordHash).toMatch(/^\$argon2id\$/);
    expect(saved.passwordHash).not.toBe('SecurePassword123!');
  });
});
