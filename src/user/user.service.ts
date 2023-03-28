/*
 * @Description:
 * @Author: Martin Pang
 * @Date: 2023-03-24 14:45:32
 */
import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Logs } from '../logs/logs.entity';
import { UserDto, UserQuery } from './dto/user.dto';
import { conditionUtils } from '../utils/db.helper';
import { number } from 'joi';
import { async } from 'rxjs';
import { remove } from 'winston';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Logs) private readonly logsRepository: Repository<Logs>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }
  /*
   * @description: 根据查询条件查询user数据,注意查询条件可能有些为可选值
   * @return {*}
   * @param {UserQuery} userQuery
   */
  findUsers(userQuery: UserQuery) {
    let { limit, page, username, gender, role } = userQuery;
    const take = limit || 10; //设置每页条数
    const skip = ((page || 1) - 1) * take; //设置跳过的个数
    // return this.userRepository.find({   //罗里吧嗦的,还是用queryBuilder简单
    //   select: {
    //     //表示必须选择对象的哪些属性,可以是对象也可以是数组,比较简单就写数组,复杂写对象
    //     id: true,
    //     username: true,
    //     profile: {
    //       gender: true,
    //     },
    //   },
    //   relations: { profile: true, roles: true }, //联表查询,关系需要加载的entity,是leftjoin和leftjoinAndSelect的简写
    //   where: {
    //     username: username, //这三个条件是and
    //     profile: {
    //       gender: gender,
    //     },
    //     roles: {
    //       id: role,
    //     },
    //   },
    //   take, //一次拿多少数据
    //   skip, //从多少开始拿
    // });
    let obj = {
      //封装联表查询条件
      'user.username': username,
      'profile.gender': gender,
      'roles.id': role,
    };
    const queryBuilder = this.userRepository
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'roles'); //联表信息
    let newBuilder = conditionUtils<User>(queryBuilder, obj);
    return newBuilder.take(take).skip(skip).getMany();
  }

  findOneUserByName(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findOneUserById(id: bigint) {
    return this.userRepository.findOne({ where: { id } });
  }

  create(user:UserDto) {
    const userTmp = this.userRepository.create(user); //user可能是User的子集,所以使用create来创建并save
    try {
      const res = this.userRepository.save(userTmp);
      return res;
    } catch (err) {
      console.log(err);
      if (err.errno && err.errno === 1062) {
        throw new HttpException(err.sqlMessage, 500);
      }
    }
  }

  /*
   * @description: 更新用户部分信息
   * @return {*}
   * @param {number} id
   * @param {Partial} user
   */
  async update(id: bigint, user: Partial<User>) {
    const userTemp = await this.findProfile(id);
    const newUser = this.userRepository.merge(userTemp, user);
    return this.userRepository.save(newUser);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }

  findProfile(id: bigint) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        profile: true,
      },
    });
  }

  async findUserLogs(id: bigint) {
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
