import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { SongsService } from '../songs/songs.service';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private readonly songsService: SongsService) {}

  async onApplicationBootstrap() {
    const csvPath = process.env.CSV_FILE || '/app/data/Song_list.csv';
    this.logger.log('🚀 Starting CSV import process...');

    try {
      const result = await this.songsService.importFromCsv(csvPath);
      this.logger.log('✅ CSV import complete: ' + JSON.stringify(result));
    } catch (err) {
      this.logger.error('⚠️ CSV import failed:', err.message);
    }
  }
}
