import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { CategoryKind } from '../enums/category-kind.enum';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    public kind: CategoryKind;

    @Column()
    public name: string;

    @Column({ type: 'varchar', nullable: true })
    public description: string | null;

    @Column()
    public iconName: string;

    @Column({ default: false })
    public shouldHideGames: boolean;

    @Column()
    public position: number;
}
