/*
AI Declaration:
I used Hermes Agent to help debug the unit testing for rooms(Failed).

Reflection:
I found that AI help me to find the bug in package.json. I didn't think that the problem is in the setup file.
*/

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

const mockPrismaService = {
  rooms: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a room and pass the dto to prisma', async () => {
      const dto: CreateRoomDto = {
        name: 'Deluxe Suite',
        description: 'A spacious luxury room with sea view',
        capacity: 2,
        price_per_night: 150,
        image_url: 'https://example.com/room.jpg',
        is_active: true,
      };

      const result = { id: 1, ...dto };
      mockPrismaService.rooms.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(prisma.rooms.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          capacity: dto.capacity,
          price_per_night: dto.price_per_night,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const result = [{ id: 1, name: 'Deluxe Suite' }];
      mockPrismaService.rooms.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findARoom', () => {
    it('should return a single room', async () => {
      const result = { id: 1, name: 'Deluxe Suite' };
      mockPrismaService.rooms.findUnique.mockResolvedValue(result);

      expect(await service.findARoom(1)).toBe(result);
      expect(prisma.rooms.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if room not found', async () => {
      mockPrismaService.rooms.findUnique.mockResolvedValue(null);

      await expect(service.findARoom(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('disable', () => {
    it('should set is_active to false', async () => {
      const room = { id: 1, name: 'Deluxe Suite', is_active: true };
      const result = { ...room, is_active: false };
      mockPrismaService.rooms.findUnique.mockResolvedValue(room);
      mockPrismaService.rooms.update.mockResolvedValue(result);

      expect(await service.disable(1)).toBe(result);
      expect(prisma.rooms.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { is_active: false },
      });
    });

    it('should throw NotFoundException if room not found', async () => {
      mockPrismaService.rooms.findUnique.mockResolvedValue(null);

      await expect(service.disable(999)).rejects.toThrow(NotFoundException);
      expect(prisma.rooms.update).not.toHaveBeenCalled();
    });
  });

  describe('enable', () => {
    it('should set is_active to true', async () => {
      const room = { id: 1, name: 'Deluxe Suite', is_active: false };
      const result = { ...room, is_active: true };
      mockPrismaService.rooms.findUnique.mockResolvedValue(room);
      mockPrismaService.rooms.update.mockResolvedValue(result);

      expect(await service.enable(1)).toBe(result);
      expect(prisma.rooms.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { is_active: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete a room', async () => {
      const result = { id: 1, name: 'Deluxe Suite' };
      mockPrismaService.rooms.findUnique.mockResolvedValue(result);
      mockPrismaService.rooms.delete.mockResolvedValue(result);

      expect(await service.remove(1)).toBe(result);
      expect(prisma.rooms.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if room not found', async () => {
      mockPrismaService.rooms.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(prisma.rooms.delete).not.toHaveBeenCalled();
    });
  });
});
