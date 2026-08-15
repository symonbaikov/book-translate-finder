import { Module } from '@nestjs/common';
import { OpdsController } from './opds.controller.js';

@Module({ controllers: [OpdsController] })
export class OpdsModule {}
