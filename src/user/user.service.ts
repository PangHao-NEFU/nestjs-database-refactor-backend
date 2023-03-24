/*
 * @Description:
 * @Author: Martin Pang
 * @Date: 2023-03-24 14:45:32
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Logs } from '../logs/logs.entity';
import { UserQuery } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Logs) private readonly logsRepository: Repository<Logs>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  findUsers(userQuery: UserQuery) {
    let { limit, page, username, gender, role } = userQuery;
    const take = limit || 10;
    const skip = ((page || 1) - 1) * take;
    return this.userRepository.find({
      select: {
        //表示必须选择对象的哪些属性,可以是对象也可以是数组,比较简单就写数组,复杂写对象
        id: true,
        username: true,
        profile: {
          gender: true,
        },
      },
      relations: { profile: true, roles: true }, //联表查询,关系需要加载的entity,是join和joinAndSelect的简写
      where: {
        username: username,
        profile: {
          gender: gender,
        },
        roles: {
          id: role,
        },
      },
      take, //一次拿多少数据
      skip, //从多少开始拿
    });
  }

  findOneUserByName(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findOneUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  create(user: Partial<User>) {
    const userTmp = this.userRepository.create(user); //user可能是User的子集,所以使用create来创建并save
    return this.userRepository.save(userTmp);
  }

  async update(id: number, user: Partial<User>) {
    return this.userRepository.update(id, user);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }

  findProfile(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        profile: true,
      },
    });
  }

  async findUserLogs(id: number) {
    const user = await this.findOneUserById(id);
    return this.logsRepository.find({
      where: {
        user,
      },
      // relations: {
      //   user: true,
      // },
    });
  }

  findLogsByGroup(id: number) {
    // SELECT logs.result as rest, COUNT(logs.result) as count from logs, user WHERE user.id = logs.userId AND user.id = 2 GROUP BY logs.result;
    // return this.logsRepository.query(
    //   'SELECT logs.result as rest, COUNT(logs.result) as count from logs, user WHERE user.id = logs.userId AND user.id = 2 GROUP BY logs.result',
    // );
    return (
      this.logsRepository
        .createQueryBuilder('logs')
        .select('logs.result', 'result')
        .addSelect('COUNT("logs.result")', 'count')
        .leftJoinAndSelect('logs.user', 'user')
        .where('user.id = :id', { id })
        .groupBy('logs.result')
        .orderBy('count', 'DESC')
        .addOrderBy('result', 'DESC')
        .offset(2)
        .limit(3)
        // .orderBy('result', 'DESC')
        .getRawMany()
    );
  }
}
