import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    PrismaModule,
    RoomsModule,
    AuthModule,
    // Configure CacheManager with Redis
    CacheModule.registerAsync({
      isGlobal: true, // Make cache module available globally
      useFactory: async () => ({
        // cache-manager v7 is Keyv-based; use @keyv/redis (not cache-manager-redis-yet)
        stores: [createKeyv('redis://127.0.0.1:6379')],
      }),
    }),
    // Configure Rate Limiting (Throttler)
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time to live in milliseconds (1 minute)
      limit: 30,  // Global max: 30 requests per minute
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }