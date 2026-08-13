import { Module } from '@nestjs/common';
import { SearchController } from './search.controller.js';

@Module({ controllers: [SearchController] })
export class SearchModule {}
