/*
AI Declaration:
I used antigravity inline suggestions to fill some code for more faster development and use AI to ask how to fix some error.

Reflection:
The AI inline suggestion or prediction is more useful for development because it help me to
write the code faster without repeat typing and it help me to find the way to solve the error and more undestand.
*/

import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('RoomsController', () => {
  let controller: RoomsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
