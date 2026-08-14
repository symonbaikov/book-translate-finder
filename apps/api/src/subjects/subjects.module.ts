import { Module } from '@nestjs/common';
import { SubjectsController } from './subjects.controller.js';

@Module({ controllers: [SubjectsController] })
export class SubjectsModule {}
