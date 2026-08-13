import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller.js';

@Module({ controllers: [SyncController] })
export class SyncModule {}
