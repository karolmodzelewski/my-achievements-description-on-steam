import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Game } from './game.entity';

@Entity()
export class GameGroup {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public hasNewAchievements: boolean;

    @ManyToOne(() => Game, (game) => game.groups, { onDelete: 'CASCADE' })
    public game: Game;
}
