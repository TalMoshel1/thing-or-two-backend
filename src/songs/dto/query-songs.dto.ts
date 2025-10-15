import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QuerySongsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Transform(({ value }) => parseInt(value))
  @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional() @Transform(({ value }) => parseInt(value))
  @IsInt() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['name','band','year'], default: 'band' })
  @IsOptional() @IsIn(['name','band','year'])
  sortBy?: 'name'|'band'|'year' = 'band';

  @ApiPropertyOptional({ enum: ['ASC','DESC'], default: 'ASC' })
  @IsOptional() @IsIn(['ASC','DESC'])
  order?: 'ASC'|'DESC' = 'ASC';

  @ApiPropertyOptional({ description: 'filter text across name/band/year' })
  @IsOptional() @IsString()
  q?: string;
}
