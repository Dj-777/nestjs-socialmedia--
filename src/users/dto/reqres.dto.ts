import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Statuss } from '../reqres.entity';
import { Field, registerEnumType } from "@nestjs/graphql"
import { type } from 'os';
export class ReqResDto {

  senderemail: string;
  reciveremail: string;
  @IsOptional()
  @IsEnum(Statuss)
  @Field(type => Statuss)
  public status: Statuss;
  //status:string;
}
