import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller.js';

@Module({ controllers: [RecommendationsController] })
export class RecommendationsModule {}
