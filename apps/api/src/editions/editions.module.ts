import { Module } from '@nestjs/common';
import { EditionsController } from './editions.controller.js';

@Module({ controllers: [EditionsController] })
export class EditionsModule {}
