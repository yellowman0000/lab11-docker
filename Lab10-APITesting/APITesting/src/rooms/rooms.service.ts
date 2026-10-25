import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) { }
  private readonly logger = new Logger('RoomsService');

  async create(dto: CreateRoomDto) {
    this.logger.log(`Creating room: ${dto.name}...`);
    return await this.prisma.rooms.create({ data: dto });
  }

  async findAll() {
    this.logger.log(`Fetching all rooms`);
    return await this.prisma.rooms.findMany();
  }

  async findARoom(id: number) {
    this.logger.log(`Fetching room id=${id}`);
    const room = await this.prisma.rooms.findUnique({ where: { id } });
    if (!room) {
      this.logger.error(`Room ${id} cannot be found!`)
      throw new NotFoundException(`Room ${id} not found`);
    }
    return room;
  }

  async disable(id: number) {
    this.logger.log(`Disabling room id=${id}`);
    await this.findARoom(id);
    return this.prisma.rooms.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async enable(id: number) {
    this.logger.log(`Enabling room id=${id}`)
    await this.findARoom(id);
    return this.prisma.rooms.update({
      where: { id },
      data: { is_active: true },
    });
  }

  async remove(id: number) {
    this.logger.log(`Deleting room id=${id}`);
    await this.findARoom(id);
    return this.prisma.rooms.delete({
      where: { id },
    });
  }
}
