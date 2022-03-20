import { Controller, Get, Post, Body, Param } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { User } from './user.entity';
import { UserChatsDto } from './dto/userchats.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Get(':id')
  // show(@Param('id') id: string) {
  //   return this.usersService.showById(+id);
  // }

  @Post('chat/:senderemail/:reciveremail')
  chat(@Param('senderemail') senderemail: string, @Param('reciveremail') reciveremail: string, @Body() userchatsdto: UserChatsDto) {
    return this.usersService.chatToUser(senderemail, reciveremail, userchatsdto)
  }

}

