import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: "int" })
  age!: number;

  // 소프트 삭제를 위한 상태 값
  @Column({ type: "varchar", length: 20, default: "ACTIVE" })
  status!: string; // "ACTIVE" | "DELETED"
}
