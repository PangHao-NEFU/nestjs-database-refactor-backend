/*
 * @Description:
 * @Author: Martin Pang
 * @Date: 2023-03-24 14:45:32
 */
import {
  Column,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  Generated,
} from 'typeorm';
import { Logs } from '../logs/logs.entity';
import { Roles } from '../roles/roles.entity';
import { Profile } from './profile.entity';

@Entity('user')
export class User {
  //每个entity都对应数据库的一张表,所以通过数据源.manager.find(User)就可以拿到所有表中数据
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  // typescript -> 数据库 关联关系 Mapping
  @OneToMany(() => Logs, (logs) => logs.user)
  logs: Logs[];

  @ManyToMany(() => Roles, (roles) => roles.users, { cascade: ['insert'] })
  @JoinTable({ name: 'users_roles' }) //指定了多对多的连接表和连接表名
  roles: Roles[];

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true }) //一对一数据应该级联
  profile: Profile;
}
