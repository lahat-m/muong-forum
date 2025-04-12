import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ParticipantController],
  providers: [ParticipantService],
  imports: [PrismaModule],
})
export class ParticipantModule { }
