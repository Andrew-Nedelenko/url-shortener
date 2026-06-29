import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  originalUrl!: string;

  @Column({ type: 'varchar', length: 6, unique: true })
  shortCode!: string;

  @Column({ type: 'int', default: 0 })
  visits!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
