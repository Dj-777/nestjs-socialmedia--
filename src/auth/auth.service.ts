/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Injectable,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { authResetPasswordDto } from './dto/auth-resetpassword.dto';
import { getConnection, getRepository } from 'typeorm';
import { ReqRes, Statuss } from 'src/users/reqres.entity';
import { ReqResDto } from 'src/users/dto/reqres.dto';
import { LogInUsers } from 'src/users/loginusersdetails.entity';
import { ForgetPassword } from 'src/users/forgetpassword.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  //LOGIN
  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);
    const payload = `${user.email},${user.id}`;
    const access_Token = this.jwtService.sign(payload);
    if (await LogInUsers.findOne({ where: { email: authLoginDto.email } })) {
      return 'You Are Already Loged Into System Please Make Sure You Logout First Before Login Again';
    } else {
      const saveusertologin = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(LogInUsers)
        .values({
          email: authLoginDto.email,
          password: authLoginDto.password,
          access_token: access_Token,
        })
        .execute();
      return {
        Yourdata: `${authLoginDto.email} and ${authLoginDto.password} and Access Token Is Needed For Reseting Password`,
        access_token: access_Token,
      };
    }
  }
  async validateUser(authLoginDto: AuthLoginDto): Promise<User> {
    const { email, password } = authLoginDto;
    const user = await User.findOne({ where: { email: email } });
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException();
    }
    return user;
  }
  //LOGIN

  //<--FORGETPASSWORD-->

  //GETFORGETPASSWORDTOKEN
  async getforgetpasswordtoken(email: string) {
    const payload = { email };
    const access_Token = this.jwtService.sign(payload);
    const saveusertoforgetpassword = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(ForgetPassword)
      .values({
        email: email,
        access_token: access_Token,
      })
      .execute();
    return {
      Message: `${email} You Have To Use Access_Token For Forget-Password Your Access Token Access Token Is`,
      Access_Token: access_Token,
    };
  }
  //GETFORGETPASSWORDTOKEN

  //FORGETPASSWORD
  async forgetpassword(
    email: string,
    authResetPasswordDto: authResetPasswordDto,
  ) {
    if (
      (await ForgetPassword.findOne({ where: { email: email } })) &&
      (await ForgetPassword.findOne({
        where: { access_token: authResetPasswordDto.access_token },
      }))
    ) {
      const hashPassword = await bcrypt.hash(authResetPasswordDto.password, 8);

      const updatepassword = await getConnection()
        .createQueryBuilder()
        .update(User)
        .set({
          password: hashPassword,
        })
        .where('email=:email', { email: email })
        .execute();

      const deleteaccesstoken = await getConnection()
        .createQueryBuilder()
        .delete()
        .from(ForgetPassword)
        .where('email = :email', { email: email })
        .andWhere('access_token = :access_token', {
          access_token: authResetPasswordDto.access_token,
        })
        .execute();

      return { Message: `${email} Your Password Is Sucessfully Updated` };
    } else {
      return `${email} Please Enter valid Access_Token`;
    }
  }
  //FORGETPASSWORD

  //<--FORGETPASSWORD-->

  //LOGOUT
  async logout(email: string) {
    if (await LogInUsers.findOne({ where: { email: email } })) {
      const logoutuser = await getConnection()
        .createQueryBuilder()
        .delete()
        .from(LogInUsers)
        .where('email = :email', { email: email })
        .execute();
      return `${email} You are Logedout Successfully From System`;
    } else {
      return 'Make Sure You are Login First';
    }
  }

  //LOGOUT

  //RESET PASSWORD
  async resetpassword(
    email: string,
    authResetPasswordDtos: authResetPasswordDto,
  ) {
    if (await LogInUsers.findOne({ where: { email: email } })) {
      // const user = await User.findOne({ where: { email: email } });
      if (
        (await LogInUsers.findOne({ where: { email: email } })) &&
        (await LogInUsers.findOne({
          where: { access_token: authResetPasswordDtos.access_token },
        }))
      ) {
        const hashPassword = await bcrypt.hash(
          authResetPasswordDtos.password,
          8,
        );

        const updatepassword = await getConnection()
          .createQueryBuilder()
          .update(User)
          .set({
            password: hashPassword,
          })
          .where('email=:email', { email: email })
          .execute();
        return { Message: `${email} Your Password Is Sucessfully Updated` };
      } else {
        return 'You have to enter correct Login Acceesstoken';
      }
    } else {
      return 'Make Sure You Loged Into System First';
    }
  }
  //RESET PASSWORD

  //SEARCH USERS IN TABLE
  async showallmember(emails: string) {
    if (await LogInUsers.findOne({ where: { email: emails } })) {
      const selectemails = await getConnection()
        .createQueryBuilder()
        .select('User.email')
        .from(User, 'User')
        .getMany();
      return {
        Message: `For Sending Requst To User Compulosry  Follow This Parteen:- localhost:8000/senderemail/reciveremail`,
        selectemails,
      };
    } else {
      return 'You Must Have To Login First';
    }
  }
  //SEARCH USERS IN TABLE

  //SEND REQUEST TO USERS
  async request(
    @Param('senderemail') senderemail: string,
    @Param('reciveremail') reciveremail: string,
  ) {
    if (
      (await User.findOne({ where: { email: senderemail } })) &&
      (await User.findOne({ where: { email: reciveremail } }))
    ) {
      // const chcekemails = await getConnection()
      //   .createQueryBuilder()
      //   .select("ReqRes.senderemail")
      //   .addSelect("ReqRes.reciveremail")
      //   .from(ReqRes, "ReqRes")
      //   .where("ReqRes.senderemail=:senderemail   ", { senderemail: senderemail })
      //   .andWhere("ReqRes.reciveremail=:reciveremail  ", { reciveremail: reciveremail })
      //   .getOne();

      // // console.log(chcekemails.senderemail)
      // // const chcekemails=await ReqRes.findOne({where:{senderemail:senderemail}}) && await ReqRes.findOne({where:{reciveremail:reciveremail}})

      // if (chcekemails.senderemail === "IsNull" && chcekemails.reciveremail === "IsNull ") {
      //   console.log("Ji app sahi ho")
      // }
      if (await LogInUsers.findOne({ where: { email: senderemail } })) {
        if (
          (await ReqRes.findOne({ where: { senderemail: senderemail } })) &&
          (await ReqRes.findOne({ where: { reciveremail: reciveremail } }))
        ) {
          const checkstatus = await getConnection()
            .createQueryBuilder()
            .select('ReqRes.status')
            .from(ReqRes, 'ReqRes')
            .where('ReqRes.senderemail=:senderemail ', {
              senderemail: senderemail,
            })
            .andWhere('ReqRes.reciveremail=:reciveremail ', {
              reciveremail: reciveremail,
            })
            .getOne();
          if (
            checkstatus.status === 'accepted' ||
            checkstatus.status === 'Pending'
          ) {
            return 'You have already send request';
          } else {
            await getConnection()
              .createQueryBuilder()
              .insert()
              .into(ReqRes)
              .values({
                senderemail: senderemail,
                reciveremail: reciveremail,
              })
              .execute();
            return `${senderemail} Successsfully send request to ${reciveremail}`;
          }
        } else if (
          (await ReqRes.findOne({ where: { senderemail: reciveremail } })) &&
          (await ReqRes.findOne({ where: { reciveremail: senderemail } }))
        ) {
          const checkstatus = await getConnection()
            .createQueryBuilder()
            .select('ReqRes.status')
            .from(ReqRes, 'ReqRes')
            .where('ReqRes.senderemail=:senderemail ', {
              senderemail: reciveremail,
            })
            .andWhere('ReqRes.reciveremail=:reciveremail ', {
              reciveremail: senderemail,
            })
            .getOne();

          if (
            checkstatus.status === 'accepted' ||
            checkstatus.status === 'Pending'
          ) {
            return 'You have already send request';
          } else {
            const user = await getConnection()
              .createQueryBuilder()
              .insert()
              .into(ReqRes)
              .values({
                senderemail: senderemail,
                reciveremail: reciveremail,
              })
              .execute();
            return `${senderemail} Successsfully send request to ${reciveremail}`;
          }
        } else {
          await getConnection()
            .createQueryBuilder()
            .insert()
            .into(ReqRes)
            .values({
              senderemail: senderemail,
              reciveremail: reciveremail,
            })
            .execute();
          return `${senderemail} Successsfully send request to ${reciveremail}`;
        }
      } else {
        return 'You Must Have To Login To SYstem BEfore Sending The Request';
      }
    } else {
      return 'User is Not Registred Please Registe Your Slf First';
    }
  }
  //SEND REQUEST TO USERS

  //SHOW REQUESTS

  async showRequest(
    @Param('email') email: string,
    @Body() reqresdto: ReqResDto,
  ) {
    if (await User.findOne({ where: { email: email } })) {
      if (await LogInUsers.findOne({ where: { email: email } })) {
        if (await ReqRes.findOne({ where: { reciveremail: email } })) {
          const statuspending = await ReqRes.findOne({
            where: { status: Statuss.Pending },
          });
          const user = await getRepository('ReqRes')
            .createQueryBuilder('ReqRes')
            .select('ReqRes.senderemail')
            .addSelect('ReqRes.status')
            .where('Reqres.reciveremail=:reciveremail', { reciveremail: email })
            .getMany();
          return {
            Message: `You Can Only Send The Request Again To ${Statuss.rejected} Status`,
            user,
          };
        } else {
          return 'YOU DONT HAVE ANY REQUEST';
        }
      } else {
        return 'You Have To Login Into System For Show The Request';
      }
    } else {
      return 'YOUR ACCOUNT IS NOT FOUND MAKE SURE YOU ARE REGISRED YOUR SELF...';
    }
  }
  //SHOW REQUEST

  //REQUEST STATUS
  async requestStatus(
    @Param('reciveremail') reciveremail: string,
    @Body() reqresdto: ReqResDto,
  ) {
    if (
      (await User.findOne({ where: { email: reqresdto.senderemail } })) &&
      (await User.findOne({ where: { email: reciveremail } }))
    ) {
      const checkstatus = await getConnection()
        .createQueryBuilder()
        .select('ReqRes.status')
        .from(ReqRes, 'ReqRes')
        .where('ReqRes.senderemail=:senderemail ', {
          senderemail: reqresdto.senderemail,
        })
        .andWhere('ReqRes.reciveremail=:reciveremail ', {
          reciveremail: reciveremail,
        })
        .getOne();
      if (reqresdto.status === 'rejected') {
        const deleterejecteduser = await getConnection()
          .createQueryBuilder()
          .delete()
          .from(ReqRes)
          .where('senderemail = :senderemail', {
            senderemail: reqresdto.senderemail,
          })
          .andWhere('reciveremail = :reciveremail', {
            reciveremail: reciveremail,
          })
          .execute();
        return {
          Message: `User data of ${reqresdto.senderemail} and ${reciveremail} is deleted`,
          deleterejecteduser,
        };
      } else {
        const user = await getConnection()
          .createQueryBuilder()
          .update(ReqRes)
          .set({
            senderemail: reqresdto.senderemail,
            status: reqresdto.status,
          })
          .where('reciveremail=:reciveremail', { reciveremail: reciveremail })
          .execute();
        return {
          Message: `You ${reqresdto.status} with request of sender:--> ${reciveremail} AND reciver:--> ${reqresdto.senderemail} `,
          user,
        };
      }
    } else {
      return 'MAKE SURE YOU ENTERED CORRECT USEREMAILS OR NAME';
    }
  }
  //REQUEST STATUS

  //Show My Friends
  async ShowFriends(email: string): Promise<any> {
    if (await User.findOne({ where: { email: email } })) {
      if (await LogInUsers.findOne({ where: { email: email } })) {
        const findsenderemail = await getConnection()
          .createQueryBuilder()
          .select('ReqRes.senderemail')
          .from(ReqRes, 'ReqRes')
          .where('ReqRes.senderemail=:senderemail', { senderemail: email })
          .getMany();

        const findreciveremail = await getConnection()
          .createQueryBuilder()
          .select('ReqRes.reciveremail')
          .from(ReqRes, 'ReqRes')
          .where('ReqRes.reciveremail=:reciveremail', { reciveremail: email })
          .getMany();

        const findrstatus = await getConnection()
          .createQueryBuilder()
          .select('ReqRes.status')
          .from(ReqRes, 'ReqRes')
          .where('ReqRes.status=:status', { status: Statuss.accepted })
          .getMany();

        if (findsenderemail || (findreciveremail && findrstatus)) {
          const selectreciverfriends = await getConnection()
            .createQueryBuilder()
            .select('ReqRes.reciveremail')
            .from(ReqRes, 'ReqRes')
            .where('ReqRes.senderemail=:senderemail', { senderemail: email })
            .getMany();

          const selectsenderfriends = await getConnection()
            .createQueryBuilder()
            .select('ReqRes.senderemail')
            .from(ReqRes, 'ReqRes')
            .where('ReqRes.reciveremail=:reciveremail', { reciveremail: email })
            .getMany();

          return { selectreciverfriends, selectsenderfriends };

          //return {findreciveremail,findsenderemail}
        }
        // if(await ReqRes.findOne({where:{senderemail:email}}) || await ReqRes.findOne({where:{reciveremail:email}}))
        // {

        //   const ShowFriends=await getConnection()
        //   .createQueryBuilder()
        //   .select("ReqRes.senderemail")
        //   .addSelect("ReqRes.reciveremail")
        //   .from(ReqRes,"ReqRes")
        //   .where("ReqRes.senderemail = :senderemail",{senderemail:email})
        //   .andWhere("ReqRes.reciveremail = :reciveremail",{reciveremail:email})
        //   .getMany()

        //   return ShowFriends;
        // }
        else {
          return 'You Dont Have Any Friends Make Friends By Sending The Request';
        }
      } else {
        return 'You Must Have TO Login Before Show The Friends';
      }
    } else {
      return 'Make Sure You Registred First';
    }

    //Show My Friends
  }
}
