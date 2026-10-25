/*
AI Declaration:
I used Hermes Agent to help debug the E2E testing for rooms(Failed).

Reflection:
I found that AI help me to find the bug in package.json. I didn't think that the problem is in the setup file and
two real infrastructure faults.
*/

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppModule } from '../src/app.module';
import { CreateRoomDto } from '../src/rooms/dto/create-room.dto';

import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('RoomsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let accessToken: string;
    let createdRoomId: number | undefined;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            // Redis is not guaranteed to run during tests: stub the cache store.
            .overrideProvider(CACHE_MANAGER)
            .useValue({ get: jest.fn(), set: jest.fn(), del: jest.fn() })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        prisma = app.get<PrismaService>(PrismaService);

        // Seed an ADMIN user: POST/PATCH/DELETE /rooms require Role.ADMIN.
        const username = `test-admin-${Date.now()}`;
        const password = 'password123';
        await prisma.user.create({
            data: {
                username,
                password: await bcrypt.hash(password, 10),
                role: Role.ADMIN,
            },
        });

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username, password })
            .expect(200);

        accessToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
        if (createdRoomId) {
            await prisma.rooms.delete({ where: { id: createdRoomId } }).catch(() => { });
        }
        await prisma.user.deleteMany({ where: { username: { startsWith: 'test-admin-' } } }).catch(() => { });
        await app.close();
    });

    it('/rooms (POST) - Create Room', async () => {
        const createDto: CreateRoomDto = {
            name: `E2E Room ${Date.now()}`,
            description: 'Room created by the e2e test',
            capacity: 2,
            price_per_night: 150,
            image_url: 'https://example.com/room.jpg',
            is_active: true,
        };

        const response = await request(app.getHttpServer())
            .post('/rooms')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(createDto)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(createDto.name);
        createdRoomId = response.body.id;
    });

    it('/rooms (POST) - Fail Unauthorized', async () => {
        await request(app.getHttpServer())
            .post('/rooms')
            .send({ name: 'No token', capacity: 1, price_per_night: 10 })
            .expect(401);
    });

    it('/rooms (GET) - Get All Rooms', async () => {
        const response = await request(app.getHttpServer())
            .get('/rooms')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.find((r) => r.id === createdRoomId)).toBeDefined();
    });

    it('/rooms/:id (GET) - Get Single Room', async () => {
        const response = await request(app.getHttpServer())
            .get(`/rooms/${createdRoomId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(response.body.id).toBe(createdRoomId);
    });

    it('/rooms/:id/disable (PATCH) - Update Room', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/rooms/${createdRoomId}/disable`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(response.body.is_active).toBe(false);
    });

    it('/rooms/:id/enable (PATCH) - Fail Not Found', async () => {
        await request(app.getHttpServer())
            .patch('/rooms/999999/enable')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
    });

    it('/rooms/:id (DELETE) - Delete Room', async () => {
        await request(app.getHttpServer())
            .delete(`/rooms/${createdRoomId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        await request(app.getHttpServer())
            .get(`/rooms/${createdRoomId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);

        createdRoomId = undefined;
    });
});
