import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'songs' })
@Index(['band', 'name'])
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 300 })
  name: string;

  @Column({ name: 'band', type: 'varchar', length: 200 })
  band: string;

  @Column({ name: 'year', type: 'int' })
  year: number;
}
