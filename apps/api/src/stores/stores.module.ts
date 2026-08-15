import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller.js';

@Module({ controllers: [StoresController] })
export class StoresModule {}
