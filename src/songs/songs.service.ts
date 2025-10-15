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
    this.logger.log(`📂 Starting CSV import from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      throw new BadRequestException(`❌ CSV not found at ${csvPath}`);
    }

    const rows: Array<{ name: string; band: string; year: number }> = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser({ separator: ';', skipLines: 0 }))
        .on('headers', (headers) => {
          this.logger.log(`📜 Headers detected: ${JSON.stringify(headers)}`);
        })
        .on('data', (row: any) => {
          const name = row['Song Name']?.trim().toLowerCase();
          const band = row['Band']?.trim().toLowerCase();
          const year = parseInt(row['Year'] ?? '', 10);

          if (name && band && !isNaN(year)) {
            rows.push({ name, band, year });
          } else {
            this.logger.warn(`⚠️ Skipping invalid row: ${JSON.stringify(row)}`);
          }
        })
        .on('end', () => {
          this.logger.log(`📦 Finished reading CSV. Parsed ${rows.length} valid rows.`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`❌ Error parsing CSV: ${err.message}`);
          reject(err);
        });
    });

    if (rows.length === 0) {
      this.logger.warn(`⚠️ CSV parsed successfully but contained 0 valid rows.`);
      return { inserted: 0 };
    }

    await this.repo
      .createQueryBuilder()
      .insert()
      .into(Song)
      .values(rows)
      .orIgnore()
      .execute();

    this.logger.log(`✅ Successfully inserted ${rows.length} songs.`);
    return { inserted: rows.length };
  }

  /**
   * Fetch songs with pagination, sorting, and optional search.
   * Matches /api/v1/songs GET
   */
async list(params: {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'band' | 'year';
  order?: 'ASC' | 'DESC';
  q?: string;
}) {
  const { page = 1, limit = 20, sortBy = 'band', order = 'ASC', q } = params;
  this.logger.log(
    `📊 Fetching songs | page=${page}, limit=${limit}, sortBy=${sortBy}, order=${order}, q=${q}`,
  );

  const qb = this.repo.createQueryBuilder('song');

  if (q) {
    qb.where('LOWER(song.name) ILIKE :q', { q: `%${q.toLowerCase()}%` })
      .orWhere('LOWER(song.band) ILIKE :q', { q: `%${q.toLowerCase()}%` })
      // ✅ allows partial numeric matches like '19' matching 1980, 1990 etc.
      .orWhere("CAST(song.year AS TEXT) ILIKE :q", { q: `%${q}%` });
  }

  qb.orderBy(`song.${sortBy}`, order)
    .skip((page - 1) * limit)
    .take(limit);

  const [items, total] = await qb.getManyAndCount();

  this.logger.log(`✅ Found ${items.length} songs (total: ${total})`);
  return { page, limit, total, items };
}


  async listOrderedByBand() {
    this.logger.log('📊 Fetching all songs ordered by band...');
    return this.repo.find({ order: { band: 'ASC', name: 'ASC' } });
  }
}
