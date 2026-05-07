import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
