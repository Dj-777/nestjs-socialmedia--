import {
  AfterInsert,
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Statuss {
  Pending = "Pending",
  accepted = 'accepted',
  rejected = 'rejected'
}
@Entity()
export class ReqRes extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderemail: string;

  @Column()
  reciveremail: string;

  @Column({ type: "enum", enum: Statuss, default: 'Pending', nullable: true }
    //   {
    //   name:'Status',type:'enum',enum:['Pending','accepted','rejected'],
    //   enumName:'Status',default:'Pending'
    // }
  )
  status: Statuss;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}