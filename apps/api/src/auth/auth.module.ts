import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { BookmarksController } from './bookmarks.controller.js';

@Module({ controllers: [AuthController, BookmarksController] })
export class AuthModule {}
