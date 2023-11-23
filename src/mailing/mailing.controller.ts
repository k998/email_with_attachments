/* eslint-disable prettier/prettier */
import {
    Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { MailingService } from './mailing.service';

@Controller('mailing')
export class MailingController {
  constructor(readonly mailingService: MailingService) {}
  @Post('send-email')
  public sendMail(@Body() recieversEmail: string | Array<string>) {
      console.log(recieversEmail)
    this.mailingService.sendMail(recieversEmail);
  }

  @Get('object/url')
  public getUrl() {
    return this.mailingService.getObjectUrl();
  }
}
