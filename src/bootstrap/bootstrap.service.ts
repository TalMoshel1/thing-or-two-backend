import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { SongsService } from '../songs/songs.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly songsService: SongsService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    const csvPath = process.env.CSV_FILE || '/app/data/Song_list.csv';
    this.logger.log('🚀 Starting CSV import process...');

    try {
      // ✅ 1. Truncate table before importing
      this.logger.log('🧹 Truncating songs table...');
      await this.dataSource.query('TRUNCATE TABLE songs RESTART IDENTITY CASCADE');
      this.logger.log('✅ Songs table truncated successfully.');

      // ✅ 2. Import from CSV
      const result = await this.songsService.importFromCsv(csvPath);
      this.logger.log('✅ CSV import complete: ' + JSON.stringify(result));
    } catch (err) {
      this.logger.error('⚠️ CSV import failed:', err.message);
    }
  }
}
