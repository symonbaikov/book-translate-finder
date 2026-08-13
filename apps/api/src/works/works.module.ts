import { Module } from '@nestjs/common';
import { WorksController } from './works.controller.js';

@Module({ controllers: [WorksController] })
export class WorksModule {}
