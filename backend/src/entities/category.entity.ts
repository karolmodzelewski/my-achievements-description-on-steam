import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { CategoryType } from '../enums/category-type.enum';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public type: CategoryType;

    @Column()
    public iconName: string;

    @Column({ nullable: true })
    public description: string;
}
