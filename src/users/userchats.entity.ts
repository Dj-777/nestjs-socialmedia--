import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';

  @Entity()
  export class Chat extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    senderemail: string;
  
    @Column()
    reciveremail: string;

    @Column('simple-array')
    Message:string[];

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
}