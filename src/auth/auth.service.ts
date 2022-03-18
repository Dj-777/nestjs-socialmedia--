import { Body, Injectable, Param, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt"
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { authResetPasswordDto } from './dto/auth-resetpassword.dto';
import { Connection, getConnection, getRepository } from 'typeorm';
import { ReqRes, Statuss } from 'src/users/reqres.entity';
import { ReqResDto } from 'src/users/dto/reqres.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);
    const payload = {
      userId: user.email,
    };
    return {
     access_token : this.jwtService.sign(payload),
    };
  }
  
  async validateUser(authLoginDto: AuthLoginDto): Promise<User> {
    const { email, password } = authLoginDto;
    const user = await User.findOne({where:{email:email}});
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException();
    }
    return user;
  }

  //RESET PASSWORD
  async resetpassword(id: number, authResetPasswordDtos:authResetPasswordDto) {
    const user = await User.findOne(id)
    if(user){
      const hashPassword=await bcrypt.hash(authResetPasswordDtos.password,8)
      const djj= {...authResetPasswordDtos,password:hashPassword};
    await User.update(id,djj); 
      return hashPassword;
    }
    else
    {
      return "user not found"
    }
  }
  //RESET PASSWORD

  

  //SEARCH USERS IN TABLE
  async showallmember(){
    const selectemails= await getConnection()
    .createQueryBuilder()
    .select("User.email")
    .from(User,"User")
    .getMany();
    return selectemails;
  }
  //SEARCH USERS IN TABLE



  //SEND REQUEST TO USERS
  async request(@Param('senderemail') senderemail:string,@Param('reciveremail')reciveremail:string ,@Body() reqresdto:ReqResDto ){
  if(await User.findOne({where:{email:senderemail}}) && await User.findOne({where:{email:reciveremail}})){  
    if(await ReqRes.findOne({where:{senderemail:senderemail}}) && await ReqRes.findOne({where:{reciveremail:reciveremail}})){
       return "You have already send request" 
    }
    else if(await ReqRes.findOne({where:{senderemail:reciveremail}}) && await ReqRes.findOne({where:{reciveremail:senderemail}})){
        return "You can't send request";
    }
    else{
      const user= await getConnection()
    .createQueryBuilder()
    .insert()
    .into(ReqRes)
    .values({
      senderemail:senderemail,
      reciveremail:reciveremail,

    })
    .execute();
    return user;
    }
  }
  else{
    return "User is Not Registred Please Registe Your Slf First"
  }
  }
//SEND REQUEST TO USERS


//SHOW REQUESTS

  async showRequest(@Param('email')email:string,@Body() reqresdto:ReqResDto ){
    if(await User.findOne({where:{email:email}})){
    
        if(await ReqRes.findOne({where:{reciveremail:email} })){
          const user= await getRepository("ReqRes")
          .createQueryBuilder("ReqRes")
          .select("ReqRes.senderemail")
          .where("Reqres.reciveremail=:reciveremail",{reciveremail:email})
          .getMany();
          return user;
        }
        else{
          return "YOU DONT HAVE ANY REQUEST"
        }
     }
     else{
      return "YOUR ACCOUNT IS NOT FOUND MAKE SURE YOU ARE REGISRED YOUR SELF..."
    }
   }
//SHOW REQUEST



//REQUEST STATUS
    async requestStatus(
      @Param('senderemail')senderemail:string,
      @Param('reciveremail')reciveremail:string,
      @Body() reqresdto:ReqResDto ){
        if(await User.findOne({where:{email:senderemail}}) && await User.findOne({where:{email:reciveremail}})){

          const user= await getConnection()
          .createQueryBuilder()
          .update(ReqRes)
          .set({
            status:reqresdto.status
            })
          .where("senderemail=:senderemail",{senderemail:senderemail})
          .andWhere("reciveremail=:reciveremail",{reciveremail:reciveremail})
          .where("senderemail=:senderemail",{senderemail:reciveremail})
          .andWhere("reciveremail=:reciveremail",{reciveremail:senderemail})
          .execute();
          return { Message:`You ${reqresdto.status} with request of sender:--> ${reciveremail} AND reciver:--> ${senderemail} `,user}; 
        } 
        else{
          return "MAKE SURE YOU ENTERED CORRECT USEREMAILS OR NAME"
        } 
    }
  //REQUEST STATUS     
  
      
}


  