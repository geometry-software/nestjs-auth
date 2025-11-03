// app.module.ts (auth-service и products-service)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module'; // или ProductsModule
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'), // <-- строго string
        // опционально:
        // dbName: config.get<string>('MONGODB_DBNAME'),
      }),
    }),
    UsersModule,
    AuthModule
  ],
  controllers: [HealthController], // <— точно монтируем /api/health
})
export class AppModule {}
