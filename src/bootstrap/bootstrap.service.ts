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

    try {
      await this.dataSource.query(
        'TRUNCATE TABLE songs RESTART IDENTITY CASCADE',
      );

      const result = await this.songsService.importFromCsv(csvPath);
    } catch (err) {
    }
  }
}
