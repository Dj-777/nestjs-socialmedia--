import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { authResetPasswordDto } from './dto/auth-resetpassword.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as bcrypt from "bcrypt"
import { JwtStrategy } from './jwt.strategy';
import { User } from 'src/users/user.entity';
import {  ReqResDto } from 'src/users/dto/reqres.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Body() authLoginDto: AuthLoginDto) {
    return this.authService.login(authLoginDto);
  }
  
  @Delete('logout/:email')
  async logout(@Param('email') email:string){
    return await this.authService.logout(email);
  }

  @Get('getforgetpasswordtoken/:email')
  async gettoken(@Param('email') email:string){
    return await this.authService.getforgetpasswordtoken(email);
  }

  @Post('forgetpassword/:email')
  async forgetpassword(@Param('email') email:string,@Body() authResetPasswordDto:authResetPasswordDto){
    return this.authService.forgetpassword(email,authResetPasswordDto)
  }



  @UseGuards(JwtAuthGuard)
  @Get()
  async test() {   
  return 'token is correct'
  }

 
  @Patch('resetpassword/:email')
  async updatepass(@Param('email') email:string,@Body() authResetPasswordDtos:authResetPasswordDto) {
     return await this.authService.resetpassword(email,authResetPasswordDtos); 
  }
  
  @UseGuards(JwtStrategy)
  @UseGuards(JwtAuthGuard)
  @Get('searchmember')
  async allmemeber()
  {
    return await this.authService.showallmember();
  }



  @Post('sendrequest/:senderemail/:reciveremail')
  async sendRequest(@Param('senderemail') senderemail:string,@Param('reciveremail')reciveremail:string ){
    return await this.authService.request(senderemail,reciveremail);
  }

  @Get('showrequest/:email')
  async showRequest(@Param('email') email:string, @Body() reqresdto:ReqResDto){
    return await this.authService.showRequest(email,reqresdto)
  }

  @Patch('requeststatus/:reciveremail/')
  async requestStaus(@Param('reciveremail') reciveremail:string,@Body() reqresdto:ReqResDto){
    return await this.authService.requestStatus(reciveremail,reqresdto)
  }


 
}
