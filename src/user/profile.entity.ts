import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gender: number;

  @Column()
  photo: string;

  @Column()
  address: string;

  @OneToOne(() => User,{onDelete:'CASCADE'})  //因为已经在user中设置级联删除了,如果在这也删除就会产生循环级联删除!
  @JoinColumn()   //表示这是一个新加的列,是外键
  user: User;
}
