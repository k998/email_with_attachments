/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';
import { config } from './config';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MailingService {
  private readonly logger: Logger;
  private readonly baseBucket = config.MINIO_BUCKET;

  public get client() {
    return this.minio.client;
  }

  constructor(
    private readonly minio: MinioService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    this.logger = new Logger('MinioStorageService');
  }

  private async setTransport() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    // const accessToken: string = await new Promise((resolve, reject) => {
    //   oauth2Client.getAccessToken((err, token) => {
    //     if (err) {
    //       reject('Failed to create access token');
    //     }
    //     resolve(token);
    //   });
    // });

    const config: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('EMAIL'),
        clientId: this.configService.get('CLIENT_ID'),
        clientSecret: this.configService.get('CLIENT_SECRET'),
        accessToken: this.configService.get('ACCESS_TOKEN'),
      },
    };
    this.mailerService.addTransporter('gmail', config);
  }

  public async sendMail(recieversEmail: string | Array<string>) {
    await this.setTransport();
    this.mailerService
      .sendMail({
        transporterName: 'gmail',
        to: 'tejas.a998@gmail.com', // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'Verficiaction Code', // Subject line
        template: 'action',
        context: {
          // Data to be sent to template engine..
          code: '38320',
        },
        attachments: [
          {
            filename: 'sample.pdf',
            content:
                    "90IDEgMCBSDQovSW5mbyAxMCAwIFINCj4+DQoNCnN0YXJ0eHJlZg0KMjcxNA0KJSVFT0YNCg==",
            encoding:'base64'
          },
        ],
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async delete(objetName: string, baseBucket: string) {
    this.client.removeObject(
      baseBucket,
      objetName,
      void function (err, res) {
        if (err)
          throw new HttpException(
            'Oops Something wrong happend',
            HttpStatus.BAD_REQUEST,
          );
      },
    );
  }

  async getObjectUrl() {
    const fileName = 'sample.pdf';
    const bucketName = 'send-email';
    const expiration = 60 * 5; // URL valid for 5 minutes (adjust as needed)

    try {
      // Generate a presigned URL for the Minio object
      const presignedUrl = await this.client.presignedGetObject(
        bucketName,
        fileName,
        expiration,
      );
      // Return the MinIO url for that object
      return presignedUrl;
    } catch (err) {
      throw new HttpException(
        'Unable to fetch file from minIo',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
