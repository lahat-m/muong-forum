import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilesService } from 'src/files/files.service';

@Module({
  providers: [StudentsService, PrismaService, FilesService],
  controllers: [StudentsController]
})
export class StudentsModule {}