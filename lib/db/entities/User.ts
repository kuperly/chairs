import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role';
import { Manufacturer } from './Manufacturer';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @ManyToOne(() => Role, role => role.users)
  role: Role;

  @Column({ nullable: true })
  supabaseAuthId: string;

  @ManyToOne(() => Manufacturer, { nullable: true })
  manufacturer: Manufacturer | null;

  @Column({ default: true })
  isActive: boolean;
}
