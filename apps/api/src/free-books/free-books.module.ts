import { Module } from '@nestjs/common';
import { FreeBooksController } from './free-books.controller.js';

@Module({ controllers: [FreeBooksController] })
export class FreeBooksModule {}
