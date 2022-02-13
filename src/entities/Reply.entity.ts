import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'replies' })
export class Reply extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'intent_name', nullable: false })
  intentName!: string;

  @Column({ name: 'text', nullable: false })
  text!: string;
}
