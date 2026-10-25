import { Controller, Get, Post, Body, Patch, Delete, Param, ParseIntPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

@ApiTags('rooms')
@ApiBearerAuth('access-token')
@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } }) // Rooms: 10 requests per minute
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'The room has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Deluxe Suite' },
        description: { type: 'string', example: 'A spacious luxury room with sea view' },
        capacity: { type: 'number', example: 2 },
        price_per_night: { type: 'number', example: 150 },
        image_url: { type: 'string', example: 'https://example.com/room.jpg' },
        is_active: { type: 'boolean', example: true },
        created_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
        updated_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['name should not be empty'] },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' },
      },
    },
  })
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000)
  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched all rooms.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Deluxe Suite' },
          description: { type: 'string', example: 'A spacious luxury room with sea view' },
          capacity: { type: 'number', example: 2 },
          price_per_night: { type: 'number', example: 150 },
          image_url: { type: 'string', example: 'https://example.com/room.jpg' },
          is_active: { type: 'boolean', example: true },
          created_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
          updated_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' },
      },
    },
  })
  findAll() {
    return this.roomsService.findAll();
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the room',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched room details.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Deluxe Suite' },
        description: { type: 'string', example: 'A spacious luxury room with sea view' },
        capacity: { type: 'number', example: 2 },
        price_per_night: { type: 'number', example: 150 },
        image_url: { type: 'string', example: 'https://example.com/room.jpg' },
        is_active: { type: 'boolean', example: true },
        created_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
        updated_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid ID parameter format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (numeric string is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Room not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Room 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' },
      },
    },
  })
  async findARoom(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomsService.findARoom(+id);
    if (!room) {
      throw new NotFoundException(`Room ${id} not found`);
    }
    return room;
  }

  @Patch(':id/disable')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Disable a room' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the room to disable',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The room has been successfully disabled.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Deluxe Suite' },
        description: { type: 'string', example: 'A spacious luxury room with sea view' },
        capacity: { type: 'number', example: 2 },
        price_per_night: { type: 'number', example: 150 },
        image_url: { type: 'string', example: 'https://example.com/room.jpg' },
        is_active: { type: 'boolean', example: false },
        created_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
        updated_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid ID parameter format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (numeric string is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Room not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Room 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' },
      },
    },
  })
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.disable(+id);
  }

  @Patch(':id/enable')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Enable a room' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the room to enable',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The room has been successfully enabled.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Deluxe Suite' },
        description: { type: 'string', example: 'A spacious luxury room with sea view' },
        capacity: { type: 'number', example: 2 },
        price_per_night: { type: 'number', example: 150 },
        image_url: { type: 'string', example: 'https://example.com/room.jpg' },
        is_active: { type: 'boolean', example: true },
        created_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
        updated_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid ID parameter format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (numeric string is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Room not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Room 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' },
      },
    },
  })
  enable(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.enable(+id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a room' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the room to delete',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The room has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Deluxe Suite' },
        description: { type: 'string', example: 'A spacious luxury room with sea view' },
        capacity: { type: 'number', example: 2 },
        price_per_night: { type: 'number', example: 150 },
        image_url: { type: 'string', example: 'https://example.com/room.jpg' },
        is_active: { type: 'boolean', example: false },
        created_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
        updated_at: { type: 'string', example: '2026-10-21T08:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid ID parameter format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (numeric string is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Room not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Room 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' },
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(+id);
  }
}

