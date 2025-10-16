import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Song } from './song.entity';
import * as fs from 'node:fs';
import csvParser from 'csv-parser';

@Injectable()
export class SongsService {
  private readonly logger = new Logger(SongsService.name);

  constructor(@InjectRepository(Song) private repo: Repository<Song>) {}

  async importFromCsv(csvPath: string) {
    if (!fs.existsSync(csvPath)) {
      throw new BadRequestException(`CSV not found at ${csvPath}`);
    }

    const rows: Array<{ name: string; band: string; year: number }> = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser({ separator: ';', skipLines: 0 }))
        .on('headers', (headers) => {})
        .on('data', (row: any) => {
          const name = row['Song Name']?.trim().toLowerCase();
          const band = row['Band']?.trim().toLowerCase();
          const year = parseInt(row['Year'] ?? '', 10);

          if (name && band && !isNaN(year)) {
            rows.push({ name, band, year });
          } else {
          }
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });

    if (rows.length === 0) {
      return { inserted: 0 };
    }

    await this.repo
      .createQueryBuilder()
      .insert()
      .into(Song)
      .values(rows)
      .orIgnore()
      .execute();

    return { inserted: rows.length };
  }

  async list(params: {
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'band' | 'year';
    order?: 'ASC' | 'DESC';
    q?: string;
  }) {
    const { page = 1, limit = 20, sortBy = 'band', order = 'ASC', q } = params;

    const qb = this.repo.createQueryBuilder('song');

    if (q) {
      qb.where('LOWER(song.name) ILIKE :q', { q: `%${q.toLowerCase()}%` })
        .orWhere('LOWER(song.band) ILIKE :q', { q: `%${q.toLowerCase()}%` })
        .orWhere('CAST(song.year AS TEXT) ILIKE :q', { q: `%${q}%` });
    }

    qb.orderBy(`song.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { page, limit, total, items };
  }

  async listOrderedByBand() {
    return this.repo.find({ order: { band: 'ASC', name: 'ASC' } });
  }
}
