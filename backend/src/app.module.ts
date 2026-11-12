import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';

import { validationSchemaConfig } from './configs/validation-schema.config';
import { seedOneHundredPercentCategory } from './seeds/one-hundred-percent-category.seed';
import { GameModule } from './modules/game/game.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DescriptionModule } from './modules/description/description.module';

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
                synchronize: true,
            }),
            dataSourceFactory: async (options: DataSourceOptions) => {
                const dataSource = await new DataSource(options).initialize();

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
