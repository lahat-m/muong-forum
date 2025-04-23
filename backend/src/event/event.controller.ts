import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { UploadEventPoster } from 'src/decorators/file-upload.decorator';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @ApiOperation({ summary: 'Create an event' })
  @Post()
  @UploadEventPoster()
  @ApiConsumes('multipart/form-data')
  create(@Body() createEventDto: CreateEventDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      // Save only the filename so the service can prepend BASE_URL
      createEventDto.eventPoster = file.filename;
    }
    return this.eventService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.findOne(+id);
  }

  @Patch(':id')
  @UploadEventPoster()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an event by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateEventDto: UpdateEventDto
  ) {
    if (file) {
      updateEventDto.eventPoster = file.filename;
    }
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event by ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.remove(id);
  }
}
