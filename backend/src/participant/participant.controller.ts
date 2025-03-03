import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ApiOperation } from '@nestjs/swagger';
@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) { }

  @ApiOperation({ summary: 'Create a participant' })
  @Post()
  create(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantService.create(createParticipantDto);
  }


  @Get()
  @ApiOperation({ summary: "Get all participants" })
  findAll() {
    return this.participantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Get a participant by ID" })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.participantService.findOne(id);
  }

  // @Patch(':id')
  // @ApiOperation ({ summary: "Update participant by ID"})
  // update(@Param('id', ParseIntPipe) id: number, @Body() updatePartipantDto: UpdatePartipantDto) {
  //   return this.participantService.update(id, updatePartipantDto);
  // }

  @Delete(':id')
  @ApiOperation({ summary: "Delete participant by ID" })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.participantService.remove(id);
  }
}
