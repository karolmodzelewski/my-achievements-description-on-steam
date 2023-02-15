import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';

import { validationSchemaConfig } from './configs/validation-schema.config';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env.stage.${process.env.STAGE}`,
            validationSchema: validationSchemaConfig,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                autoLoadEntities: true,
                synchronize: true,
            }),
            dataSourceFactory: async (options: DataSourceOptions) => await new DataSource(options).initialize(),
        }),
        CategoriesModule,
    ],
})
export class AppModule {}
