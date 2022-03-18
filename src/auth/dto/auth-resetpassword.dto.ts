import { IsNotEmpty } from "class-validator";

export class authResetPasswordDto{
    @IsNotEmpty()
    password:string;

}