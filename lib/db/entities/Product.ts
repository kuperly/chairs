import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Manufacturer } from './Manufacturer';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice: number | null;

  @Column({ type: 'simple-array' })
  imageUrls: string[];

  @Column({ default: 0 })
  stockQuantity: number;

  @Column()
  category: string;

  @ManyToOne(() => Manufacturer, manufacturer => manufacturer.products)
  manufacturer: Manufacturer;

  @Column({ default: true })
  isActive: boolean;
}
