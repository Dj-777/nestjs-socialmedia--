import { Injectable } from '@nestjs/common';

import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const user = User.create(createUserDto);
    await user.save();
    delete user.password;
    return user;
  }

  async showById(id: number): Promise<User> {
    const user = await this.findById(id);

    delete user.password;
    return user;
  }

  async findById(id: number) {
    return await User.findOne(id);
  }

  async findByEmail(email: string) {
    return await User.findOne({
      where: {
        email: email,
      },
    });
  }
  async updateByid(id: number, createUserDto: CreateUserDto) {
    return await User.update(id, createUserDto);
  }
}
