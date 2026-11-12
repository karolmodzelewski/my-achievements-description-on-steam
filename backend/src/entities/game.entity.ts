import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Category } from './category.entity';
import type { GameGroup } from './game-group.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public name: string;

    @Column()
    public hasNewAchievements: boolean;

    @ManyToMany(() => Category)
    @JoinTable()
    public categories: Category[];

    @OneToMany('GameGroup', 'game')
    public groups: GameGroup[];
}
