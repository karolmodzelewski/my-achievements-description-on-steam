import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CategoryType } from '../enums/category-type.enum';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public name: string;

    @Column()
    public hasNewAchievements: boolean;

    @Column('jsonb', { default: [] })
    public categories: CategoryType[];
}
