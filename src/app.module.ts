/*
 * @Description: 
 * @Author: Martin Pang
 * @Date: 2023-03-24 14:45:32
 */
import { Global, Logger, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogsModule } from './logs/logs.module';
import { RolesModule } from './roles/roles.module';

import { connectionParams } from '../ormconfig';

const envFilePath = `.env.${process.env.NODE_ENV || `development`}`;

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [() => dotenv.config({ path: '.env' })],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        DB_PORT: Joi.number().default(3306),
        DB_HOST: Joi.alternatives().try(
          Joi.string().ip(),
          Joi.string().domain(),
        ),
        DB_TYPE: Joi.string().valid('mysql', 'postgres'),
        DB_DATABASE: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_SYNC: Joi.boolean().default(false),
        LOG_ON: Joi.boolean(),
        LOG_LEVEL: Joi.string(),
      }),
    }),
    TypeOrmModule.forRoot(connectionParams),
    UserModule,
    LogsModule,
    RolesModule,
  ],
  controllers: [],
  providers: [Logger],
  exports: [Logger],
})
  /*详解module
  controllers:本模块注册的controller,用来匹配路由
  providers:本模块注册的service,用来进行业务逻辑
  imports:导入模块的列表,使本模块可以使用其他模块exports的service
  exports:本模块提供的provider(service),可以在其他模块中imports并使用本模块exports的service
  */
export class AppModule {}
