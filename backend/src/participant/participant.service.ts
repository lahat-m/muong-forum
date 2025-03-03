import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ParticipantService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createParticipantDto: CreateParticipantDto) {
    try {
      const participant = await this.prisma.participant.create({
        data: {
          name: createParticipantDto.name,
          email: createParticipantDto.email,
          phone: createParticipantDto.phone,
          sex: createParticipantDto.sex,
        },
      });
      return { status: 'success', message: 'Participant created successfully', participant };
    } catch (error) {
      console.error('Error creating participant:', error);
      return { status: 'error', message: 'Failed to create participant', error: error.message };
    }
  }

  async findAll() {
    const participants = await this.prisma.participant.findMany();
    return participants.map(participant => ({
      ...participant,
    }));
  }

  async findOne(id: number) {
    const partipant = await this.prisma.participant.findUnique({ where: { id } });
    if (!partipant) {
      throw new NotFoundException(`Participant with ID ${id} not found`);
    }

    return {
      ...partipant,
    };
  }


  async remove(id: number) {
    try {
      const partipant = await this.prisma.participant.delete({ where: { id } });
      return { status: 'success', message: 'Participant deleted successfully', partipant };
    } catch (error) {
      console.error('Error deleting participant:', error);
      return { status: 'error', message: 'Failed to delete participant', error: error.message };
    }
  }
}
