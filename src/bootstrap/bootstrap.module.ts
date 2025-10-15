import { Module } from '@nestjs/common';
import { SongsModule } from '../songs/songs.module';
import { BootstrapService } from './bootstrap.service';

@Module({
  imports: [SongsModule],
  providers: [BootstrapService],
})
export class BootstrapModule {}
