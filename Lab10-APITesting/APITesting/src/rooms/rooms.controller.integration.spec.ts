import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { NotFoundException, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

// Mock RoomsService
const mockRoomsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findARoom: jest.fn(),
    disable: jest.fn(),
    enable: jest.fn(),
    remove: jest.fn(),
};

describe('RoomsController Integration', () => {
    let controller: RoomsController;
    let service: RoomsService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RoomsController],
            providers: [
                {
                    provide: RoomsService,
                    useValue: mockRoomsService
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .overrideInterceptor(CacheInterceptor)
            .useValue({ intercept: (ctx: ExecutionContext, next: any) => next.handle() })
            .compile();

        controller = module.get<RoomsController>(RoomsController);
        service = module.get<RoomsService>(RoomsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create and return the result', async () => {
            const dto: CreateRoomDto = {
                name: 'Deluxe Suite',
                description: 'A spacious luxury room with sea view',
                capacity: 2,
                price_per_night: 150,
                image_url: 'https://example.com/room.jpg',
                is_active: true,
            };
            const result = { id: 1, ...dto };
            mockRoomsService.create.mockResolvedValue(result);

            expect(await controller.create(dto)).toBe(result);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll and return rooms', async () => {
            const result = [{ id: 1, name: 'Deluxe Suite' }];
            mockRoomsService.findAll.mockResolvedValue(result);

            expect(await controller.findAll()).toBe(result);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findARoom', () => {
        it('should call service.findARoom and return the room', async () => {
            const result = { id: 1, name: 'Deluxe Suite' };
            mockRoomsService.findARoom.mockResolvedValue(result);

            expect(await controller.findARoom(1)).toBe(result);
            expect(service.findARoom).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if room not found', async () => {
            mockRoomsService.findARoom.mockRejectedValue(new NotFoundException('Room 999 not found'));

            await expect(controller.findARoom(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should call service.remove and return the deleted room', async () => {
            const result = { id: 1, name: 'Deluxe Suite' };
            mockRoomsService.remove.mockResolvedValue(result);

            expect(await controller.remove(1)).toBe(result);
            expect(service.remove).toHaveBeenCalledWith(1);
        });

        it('should propagate NotFoundException if room not found', async () => {
            mockRoomsService.remove.mockRejectedValue(new NotFoundException('Room 999 not found'));

            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
