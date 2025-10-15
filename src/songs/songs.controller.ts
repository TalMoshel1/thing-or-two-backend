import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SongsService } from './songs.service';
// import { Public } from '../auth/public.decorator';

@ApiTags('songs')
@ApiBearerAuth()
@Controller({ path: 'songs', version: '1' })
export class SongsController {
  constructor(private songs: SongsService) {}

  @Post('import')
  async import() {
    console.log('🔥 Controller import() reached');

    const path = process.env.CSV_FILE || '/app/data/Song_list.csv';
    return this.songs.importFromCsv(path);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', enum: ['name', 'band', 'year'], required: false })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  @ApiQuery({ name: 'q', required: false })
  async list(@Query() query: any) {
    return this.songs.list(query);
  }

  @Get('table')
  async table() {
    const items = await this.songs.listOrderedByBand();
    return { total: items.length, data: items };
  }
}
