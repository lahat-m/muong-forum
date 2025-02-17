import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventService {

	constructor (
		private readonly prisma: PrismaService
	) {}

	async create(createEventDto: CreateEventDto) {
		try {
			console.log(createEventDto)
			const event = await this.prisma.event.create({
				data: {
					title: createEventDto.title,
					description: createEventDto.description,
					date: createEventDto.date,
					location: createEventDto.location,
					locationType: createEventDto.locationType,
					guestName: createEventDto.guestName
				}
			});

			return {"status": "success", "message": "Event created successfully", "event": event};
		} catch (error) {
			console.log(error)
			return {"status": "error", "message": "Failed to create event"};
		}
	}

	async findAll() {
		return await this.prisma.event.findMany();
	}

	async findOne(id: number) {
		return await this.prisma.event.findUnique({
			where: {
				id: id
			}
		});
	}

	async update(id: number, updateEventDto: UpdateEventDto) {
		try {
			const event = await this.prisma.event.update({
				where: {
					id: id
				},
				data: updateEventDto
			});

			return {"status": "success", "message": "Event updated successfully", "event": event};
		} catch {
			return {"status": "error", "message": "Failed to update event"};
		}
	}

	async remove(id: number) {
		try {
			await this.prisma.event.delete({
				where: {
					id: id
				}
			});

			return {"status": "success", "message": "Event deleted successfully"};
		} catch {
			return {"status": "error", "message": "Failed to delete event"};
		}
	}
}
