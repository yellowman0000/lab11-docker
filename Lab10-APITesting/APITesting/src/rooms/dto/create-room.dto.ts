import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, maxLength, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
    @ApiProperty({ example: 'Standard Room', description: 'Name of the room' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @ApiProperty({ example: 'A comfortable room with a double bed', description: 'Description of the room' })
    @IsString()
    @IsOptional()
    description!: string;

    @ApiProperty({ example: 2, description: 'Capacity of the room' })
    @IsNumber()
    @IsNotEmpty()
    capacity: number;

    @ApiProperty({ example: 100, description: 'Price per night of the room' })
    @IsNumber()
    @IsNotEmpty()
    price_per_night: number;

    @ApiPropertyOptional({ example: 'https://example.com/room.jpg', description: 'Image URL of the room' })
    @IsString()
    @IsOptional()
    image_url: string;

    @ApiPropertyOptional({ example: true, description: 'Is the room active?' })
    @IsBoolean()
    @IsOptional()
    is_active: boolean;
}
