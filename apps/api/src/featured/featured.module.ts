import { Module } from '@nestjs/common';
import { FeaturedController } from './featured.controller.js';

@Module({ controllers: [FeaturedController] })
export class FeaturedModule {}
