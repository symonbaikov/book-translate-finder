import { Module } from '@nestjs/common';
import { CoversController } from './covers.controller.js';

@Module({ controllers: [CoversController] })
export class CoversModule {}
