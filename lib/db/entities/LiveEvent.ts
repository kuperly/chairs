import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Manufacturer } from './Manufacturer';
import { Product } from './Product';

export enum EventStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  PURCHASE_WINDOW = 'purchase_window',
  CLOSED = 'closed',
}

@Entity('live_events')
export class LiveEvent extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  scheduledStartTime: Date;

  @Column({ type: 'timestamp' })
  scheduledEndTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  purchaseWindowEndTime: Date | null;

  @Column({ nullable: true })
  thumbnailUrl: string | null;

  @ManyToOne(() => Manufacturer, manufacturer => manufacturer.liveEvents)
  manufacturer: Manufacturer;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'event_featured_products',
    joinColumn: { name: 'eventId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  featuredProducts: Product[];

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ nullable: true })
  agoraChannelName: string | null;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date | null;

  @Column({ default: 0 })
  viewerCount: number;
}
