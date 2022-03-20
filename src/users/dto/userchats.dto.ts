import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class UserChatsDto {

    senderemail: string;
    reciveremail: string;
    @IsNotEmpty()
    Message: string[];
}
