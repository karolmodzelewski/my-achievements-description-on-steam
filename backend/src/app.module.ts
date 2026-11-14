import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import type { PostgresDataSourceOptions } from 'typeorm/driver/postgres/PostgresDataSourceOptions';

import { validationSchemaConfig } from './configs/validation-schema.config';
import { PRODUCTION_STAGE } from './constants/stage.constants';
import { seedOneHundredPercentCategory } from './seeds/one-hundred-percent-category.seed';
import { GameModule } from './modules/game/game.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DescriptionModule } from './modules/description/description.module';

const databaseLogger = new Logger('Database', { timestamp: true });

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env.stage.${process.env.STAGE}`,
            validationSchema: validationSchemaConfig,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow<string>('DB_HOST'),
                port: configService.getOrThrow<number>('DB_PORT'),
                username: configService.getOrThrow<string>('DB_USERNAME'),
                password: configService.getOrThrow<string>('DB_PASSWORD'),
                database: configService.getOrThrow<string>('DB_DATABASE'),
                autoLoadEntities: true,
                synchronize: configService.getOrThrow<string>('STAGE') !== PRODUCTION_STAGE,
            }),
            dataSourceFactory: async (options?: DataSourceOptions) => {
                if (!options) {
                    throw new Error('Database options are missing');
                }

                const dataSource = await new DataSource(options).initialize();
                const { host, port, database } = options as PostgresDataSourceOptions;

                databaseLogger.log(`Connected to database '${database}' at ${host}:${port}`);

                await seedOneHundredPercentCategory(dataSource);

                return dataSource;
            },
        }),
        CategoriesModule,
        GameModule,
        DescriptionModule,
    ],
})
export class AppModule {}
