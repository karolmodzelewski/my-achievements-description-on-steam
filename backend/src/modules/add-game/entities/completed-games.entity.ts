import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { Category } from '../interface/category.interface';

@Entity()
export class CompletedGames {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public name: string;

    @Column('jsonb', { default: [] })
    public categories: Category[];
}
