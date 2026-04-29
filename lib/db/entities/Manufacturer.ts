import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Product } from './Product';
import { LiveEvent } from './LiveEvent';

@Entity('manufacturers')
export class Manufacturer extends BaseEntity {
  @Column()
  companyName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ nullable: true })
  logoUrl: string | null;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isHidden: boolean;

  @OneToMany(() => User, user => user.manufacturer)
  teamMembers: User[];

  @OneToMany(() => Product, product => product.manufacturer)
  products: Product[];

  @OneToMany(() => LiveEvent, event => event.manufacturer)
  liveEvents: LiveEvent[];
}
