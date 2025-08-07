import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Length, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';

export class CreatePedidoDto {
  @ApiProperty({ 
    description: 'ID do cliente',
    example: 1,
    minimum: 1
  })
  @IsNumber({}, { message: 'Cliente ID deve ser um número' })
  @IsNotEmpty({ message: 'Cliente ID é obrigatório' })
  cliente_id: number;

  @ApiProperty({ 
    description: 'ID do tipo de pão',
    example: 1,
    minimum: 1
  })
  @IsNumber({}, { message: 'Tipo de pão ID deve ser um número' })
  @IsNotEmpty({ message: 'Tipo de pão ID é obrigatório' })
  tipo_pao_id: number;

  @ApiProperty({ 
    description: 'Quantidade do pedido',
    example: 5,
    minimum: 1
  })
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser maior que zero' })
  quantidade: number;

  @ApiPropertyOptional({ 
    description: 'Status do pedido (padrão: REALIZADO)',
    enum: StatusPedido,
    example: StatusPedido.REALIZADO,
    default: StatusPedido.REALIZADO
  })
  @IsOptional()
  @IsEnum(StatusPedido, { message: 'Status deve ser um valor válido' })
  status?: StatusPedido;

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