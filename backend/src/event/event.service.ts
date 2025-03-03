import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class EventService {
	private readonly BASE_URL = '/uploads/'; // Change this to your actual base URL

	constructor(private readonly prisma: PrismaService) { }

	async create(createEventDto: CreateEventDto) {
		try {
			const event = await this.prisma.event.create({
				data: {
					eventPoster: createEventDto.eventPoster,
					title: createEventDto.title,
					eventFocus: createEventDto.eventFocus,
					description: createEventDto.description,
					guestName: createEventDto.guestName,
					date: createEventDto.date,
					location: createEventDto.location,
					locationType: createEventDto.locationType,
				},
			});
			return { status: 'success', message: 'Event created successfully', event };
		} catch (error) {
			console.error('Error creating event:', error);
			return { status: 'error', message: 'Failed to create event', error: error.message };
		}
	}

	async findAll() {
		const events = await this.prisma.event.findMany();
		const appUrl = process.env.APP_URL || 'http://localhost:3000';
		return events.map(event => ({
			...event,
			eventPoster: event.eventPoster ? `${appUrl}/${event.eventPoster}` : null,
		}));
	}

	async findOne(id: number) {
		const event = await this.prisma.event.findUnique({ where: { id } });
		if (!event) {
			throw new NotFoundException(`Event with ID ${id} not found`);
		}

		return {
			...event,
			eventPoster: event.eventPoster ? `${this.BASE_URL}${event.eventPoster}` : null,
		};
	}

	async update(id: number, updateEventDto: UpdateEventDto) {
		try {
			const existingEvent = await this.prisma.event.findUnique({ where: { id } });
			if (!existingEvent) {
				throw new NotFoundException(`Event with ID ${id} not found`);
			}

			const event = await this.prisma.event.update({
				where: { id },
				data: updateEventDto,
			});
			return { status: 'success', message: 'Event updated successfully', event };
		} catch (error) {
			console.error('Error updating event:', error);
			return { status: 'error', message: 'Failed to update event', error: error.message };
		}
	}

	async remove(id: number) {
		try {
			const existingEvent = await this.prisma.event.findUnique({ where: { id } });
			if (!existingEvent) {
				throw new NotFoundException(`Event with ID ${id} not found`);
			}

			await this.prisma.event.delete({ where: { id } });
			return { status: 'success', message: 'Event deleted successfully' };
		} catch (error) {
			console.error('Error deleting event:', error);
			return { status: 'error', message: 'Failed to delete event', error: error.message };
		}
	}
}