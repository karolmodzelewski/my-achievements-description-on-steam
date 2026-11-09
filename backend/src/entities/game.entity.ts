import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import type { GameGroup } from './game-group.entity';
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

    @OneToMany('GameGroup', 'game')
    public groups: GameGroup[];
}
