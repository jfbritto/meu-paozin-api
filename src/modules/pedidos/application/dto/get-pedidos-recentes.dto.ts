import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPedidosRecentesDto {
  @ApiPropertyOptional({
    description: 'Número máximo de pedidos (padrão: 10, máximo: 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'O limite deve ser pelo menos 1' })
  @Max(100, { message: 'O limite não pode ser maior que 100' })
  limit?: number;
} 