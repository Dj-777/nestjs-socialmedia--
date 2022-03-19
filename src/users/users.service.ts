import { Body, Injectable, Param } from '@nestjs/common';
import * as bcrypt from "bcrypt"
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';
import { authResetPasswordDto } from 'src/auth/dto/auth-resetpassword.dto';
import { Connection, getConnection, getRepository } from 'typeorm';
import { UserChatsDto } from './dto/userchats.dto';
import { Chat } from './userchats.entity';
import { check } from 'prettier';
import { ReqRes, Statuss } from "./reqres.entity";
import { send } from 'process';
@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const checkkemail=await User.findOne({where:{email:createUserDto.email}})
    if (checkkemail){
      return "you are already registred with this email"  
    }
    else
    {
          const user = User.create(createUserDto);
         await user.save();
        delete user.password;
        return user;
    }
  }
  async showById(id: number): Promise<User> {
    const user = await User.findOne(id);
    delete user.password;
    return user;
  }

  async chatToUser(@Param('senderemail') senderemail: string,
    @Param('reciveremail') reciveremail: string,
    @Body() userchatsdto: UserChatsDto) {

    if (await User.findOne({ email: senderemail }) && await User.findOne({ email: reciveremail })) {
      if (await ReqRes.findOne({ where: { senderemail: senderemail } }) && await ReqRes.findOne({ where: { reciveremail: reciveremail } }) || await ReqRes.findOne({ where: { senderemail: reciveremail } }) && await ReqRes.findOne({ where: { reciveremail: senderemail } })) {
        const json = await ReqRes.findOne({ where: { senderemail: senderemail } }) && await ReqRes.findOne({ where: { reciveremail: reciveremail } }) || await ReqRes.findOne({ where: { senderemail: reciveremail } }) && await ReqRes.findOne({ where: { reciveremail: senderemail } })
        const checkstatus = await getConnection()
          .createQueryBuilder()
          .select("ReqRes.status")
          .from(ReqRes, "ReqRes")
          .where("ReqRes.senderemail=:senderemail ", { senderemail: json.senderemail || reciveremail })
          .andWhere("ReqRes.reciveremail=:reciveremail ", { reciveremail: json.reciveremail || senderemail })
          // .where("ReqRes.senderemail=:senderemail || ReqRes.reciveremail=:reciveremail",{senderemail:senderemail}||{reciveremail:reciveremail} )
          // .andWhere("ReqRes.reciveremail=:reciveremail || ReqRes.senderemail=:senderemail",{reciveremail:reciveremail} ||{senderemail:reciveremail})
          // .andWhere("ReqRes.senderemail=:senderemail",{senderemail:reciveremail})
          // .andWhere("ReqRes.reciveremail=:reciveremail",{reciveremail:senderemail})
          .getOne();

        console.log(checkstatus)

        if (checkstatus.status === "accepted") {
          if (await ReqRes.findOne({ where: { senderemail: senderemail } }) && await ReqRes.findOne({ where: { reciveremail: reciveremail } }) || await ReqRes.findOne({ where: { senderemail: reciveremail } }) && await ReqRes.findOne({ where: { reciveremail: senderemail } })) {

            if (await Chat.findOne({ where: { senderemail: senderemail } }) && await Chat.findOne({ where: { reciveremail: reciveremail } })) {
              const checkforcjchats = await getConnection()
                .createQueryBuilder()
                .select("Chat.Message")
                .from(Chat, "Chat")
                .where("Chat.senderemail=:senderemail", { senderemail: senderemail || reciveremail })
                .andWhere("Chat.reciveremail=:reciveremail", { reciveremail: reciveremail || senderemail })
                .getOne();

              console.log(checkforcjchats.Message)

              const addPreviousplusNewMessage = checkforcjchats.Message.concat(userchatsdto.Message)
              console.log(addPreviousplusNewMessage)
              const user = await getConnection()
                .createQueryBuilder()
                .update(Chat)
                .set({
                  Message: addPreviousplusNewMessage
                })
                .where("senderemail=:senderemail", { senderemail: senderemail })
                .andWhere("reciveremail=:reciveremail", { reciveremail: reciveremail })
                .execute();
              return `${senderemail} message to ${reciveremail} is :-- ${userchatsdto.Message}`
            }
            else {
              const user = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Chat)
                .values({
                  senderemail: senderemail,
                  reciveremail: reciveremail,
                  Message: userchatsdto.Message
                })

                .execute();
              return `${senderemail} Message to ${reciveremail} is -->${userchatsdto.Message}`

            }

          }

        }
        else {
          console.log("not same")
          return { Message: 'Request may be in Pending State or May Be Rejected By the User' }
        }
      }
      else {
        return "User with this request not found"
      }

    }
    else {
      console.log("User is not registered")
    }



  }
}



// async resetpassword(id: number,@Body() authResetPasswordDtos:authResetPasswordDto) {
//   const hashPassword=await bcrypt.hash(authResetPasswordDtos.password,8)
//   const djj= {...authResetPasswordDtos,password:hashPassword};
//   await User.update(id,djj);
//   return authResetPasswordDtos.password;
// }