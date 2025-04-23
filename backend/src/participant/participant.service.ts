import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
          registrations: {
            create: {
              event: {
                connect: { id: createParticipantDto.eventId },
              },
            },
          },
        },
      });
      return { status: 'success', message: 'Participant created successfully', participant };
    } catch (error) {
      console.error('Error creating participant:', error);
      throw new InternalServerErrorException('Failed to create participant');
    }
  }

  async findAll() {
    const participants = await this.prisma.participant.findMany({
      include: {
        registrations: {
          include: { event: true },
        },
      },
    });
    return participants;
  }

  async findOne(id: number) {
    const participant = await this.prisma.participant.findUnique({
      where: { id },
      include: {
        registrations: {
          include: { event: true },
        },
      },
    });
    if (!participant) {
      throw new NotFoundException(`Participant with ID ${id} not found`);
    }
    return participant;
  }

  async delete(id: number) {
    try {
      const participant = await this.prisma.participant.delete({ where: { id } });
      return { status: 'success', message: 'Participant deleted successfully', participant };
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw new InternalServerErrorException('Failed to delete participant');
    }
  }
}