import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

class UpdateUserDto extends PartialType(CreateUserDto) {}

export default UpdateUserDto;
