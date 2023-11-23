/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { ConfigService } from '@nestjs/config';
import { MailingController } from './mailing.controller';
import { MinioModule } from 'nestjs-minio-client';
import { config } from './config';

@Module({
    imports: [
    MinioModule.register({
      endPoint: config.MINIO_ENDPOINT,
      port: config.MINIO_PORT,
      useSSL: false,
      accessKey: config.MINIO_ACCESSKEY,
      secretKey: config.MINIO_SECRETKEY,
    }),
  ],
  providers: [MailingService, ConfigService],
  controllers: [MailingController],
})
export class MailingModule {}
