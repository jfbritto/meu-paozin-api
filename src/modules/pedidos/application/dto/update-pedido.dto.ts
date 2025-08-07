import { IsOptional, IsNumber, IsString, Min, Length, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';

export class UpdatePedidoDto {
  @ApiPropertyOptional({ 
    description: 'ID do cliente',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber({}, { message: 'Cliente ID deve ser um número' })
  cliente_id?: number;

  @ApiPropertyOptional({ 
    description: 'ID do tipo de pão',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tipo de pão ID deve ser um número' })
  tipo_pao_id?: number;

  @ApiPropertyOptional({ 
    description: 'Quantidade do pedido',
    example: 5,
    minimum: 1
  })
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser maior que zero' })
  quantidade?: number;

  @ApiPropertyOptional({ 
    description: 'Status do pedido',
    enum: StatusPedido,
    example: StatusPedido.ACEITO
  })
  @IsOptional()
  @IsEnum(StatusPedido, { message: 'Status deve ser um valor válido' })
  status?: StatusPedido;

  @ApiPropertyOptional({ 
    description: 'Preço total do pedido (calculado automaticamente)',
    example: 17.50,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({}, { message: 'Preço total deve ser um número' })
  @Min(0, { message: 'Preço total deve ser maior ou igual a zero' })
  preco_total?: number;

  @ApiPropertyOptional({ 
    description: 'Observações do pedido',
    example: 'Sem sal',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  @Length(0, 500, { message: 'Observações deve ter no máximo 500 caracteres' })
  observacoes?: string;
} 