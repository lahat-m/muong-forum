import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilesService } from 'src/files/files.service';
import { CacheService } from 'src/cache/cache.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
  ],
  providers: [StudentsService, PrismaService, FilesService, CacheService],
  controllers: [StudentsController]
})
export class StudentsModule {}