import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Category } from './category.entity';

@Entity()
export class Wallpaper {
    @PrimaryGeneratedColumn()
    public id: number;

    // Null until the first wallpaper is generated
    @Column({ type: 'varchar', nullable: true })
    public text: string | null;

    @Column({ type: 'integer', nullable: true })
    public excludedCategoryId: number | null;

    @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'excludedCategoryId' })
    public excludedCategory?: Category | null;

    @Column({ default: true })
    public isAutoGenerateEnabled: boolean;

    @Column({ default: false })
    public isDesktopUpdateEnabled: boolean;
}
