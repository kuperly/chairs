import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { OrderItem } from './OrderItem';
import { LiveEvent } from './LiveEvent';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User)
  customer: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ nullable: true })
  stripePaymentIntentId: string | null;

  @ManyToOne(() => LiveEvent, { nullable: true })
  purchasedDuringEvent: LiveEvent | null;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: any;
}
