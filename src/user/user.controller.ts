/*
 * @Description:
 * @Author: Martin Pang
 * @Date: 2023-03-24 14:45:32
 */
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Inject,
  LoggerService,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserQuery,UserDto } from './dto/user.dto';


@Controller('user')
export class UserController {
  // private logger = new Logger(UserController.name);

  constructor(
    private userService: UserService, //服务注入
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.logger.log('UserController init');
  }

  @Get('/getAllUsers')
  getAllUsers(): any {
    this.logger.log(`请求getUsers成功`);
    return this.userService.findAll();
    // return this.userService.getUsers();
  }

  @Get('/getUsers')
  getUsers(@Query() query: UserQuery) {
    return this.userService.findUsers(query);
  }

  @Get('/profile')
  getUserProfile(@Query() query: any): any {
    //todo!
    return this.userService.findProfile(2);
  }

  @Get('/getUserById/:id')
  getUserById(@Param('id') id: number,) {
    return this.userService.findOneUserById(id);
  }

  @Post('addUser')
  addUser(@Body() userDto: UserDto): any {
    // todo 解析Body参数
    return this.userService.create(userDto);
  }

  @Patch('/:id')
  updateUser(@Param('id') userId: number, @Body() body: UserDto) {
    // todo 传递参数id
    // todo 异常处理
    return this.userService.update(userId, body as User);
  }

  @Delete('/:id')
  deleteUser(@Param() id: number): any {
    // todo 传递参数id
    return this.userService.remove(id);
  }




  //logsModule
  @Get('/logs')
  getUserLogs(): any {
    return this.userService.findUserLogs(2);
  }

  @Get('/logsByGroup')
  async getLogsByGroup(): Promise<any> {
    const res = await this.userService.findLogsByGroup(2);
    // return res.map((o) => ({
    //   result: o.result,
    //   count: o.count,
    // }));
    return res;
  }
}
