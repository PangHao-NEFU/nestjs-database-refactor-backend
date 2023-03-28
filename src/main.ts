// Copyright (c) 2022 toimc<admin@wayearn.com>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Logger,  } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 关闭整个nestjs日志
    // logger: false,
    // logger: ['error', 'warn'],
  });

  //全局过滤器捕获异常信息
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = new Logger();
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(logger, httpAdapter));


  app.setGlobalPrefix('api/v1');  //设定接口前缀为api/v1
  const port = 3000;
  await app.listen(port);
}
bootstrap();
