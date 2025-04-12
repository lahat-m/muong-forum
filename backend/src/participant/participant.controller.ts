import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, InternalServerErrorException } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) { }

  @ApiBody({
    description: 'Participant registration data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        sex: { type: 'string' },
        eventId: { type: 'number' },
      },
      required: ['name', 'email', 'phone', 'sex', 'eventId'],
    },
  })
  @Post('register-participant')
  @ApiOperation({ summary: 'Create a participant' })
  create(@Body() createParticipantDto: CreateParticipantDto) {
    console.log('Received DTO:', createParticipantDto);
    return this.participantService.create(createParticipantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all participants' })
  findAll() {
    return this.participantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a participant by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.participantService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete participant by ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.participantService.remove(id);
  }
}