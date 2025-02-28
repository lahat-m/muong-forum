import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsString } from "class-validator";

export enum LocationType {
    ONLINE = 'ONLINE',
    ONSITE = 'ONSITE',
}

export class CreateEventDto {

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    eventPoster?: string;

    
    @ApiProperty({ example: 'Event title', description: 'The title of the event' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Event Focus', description: 'The Focus of the event' })
    @IsString()
    eventFocus: string;

    @ApiProperty({ example: 'Event description', description: 'The description of the event' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'John Doe', description: 'The name of the guest' })
    @IsString()
    guestName: string;

    @ApiProperty({ example: 'Liberation Veteran', description: 'The Description of the guest' })
    @IsString()
    guestDesc: string;

    @ApiProperty({ example: '2021-12-31T23:59:59.999Z', description: 'The date of the event' })
    @IsDateString()
    date: string;  // Changed from Date to string

    @ApiProperty({ example: '10 Some Street, Las Vegas', description: 'The location of the event' })
    @IsString()
    location: string;

    @ApiProperty({ example: 'ONLINE', description: 'The location type of the event' })
    @IsEnum(LocationType)
    locationType: LocationType;
}