import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateTipoPaoDto {
  @ApiProperty({ 
    description: 'Nome do tipo de pão',
    example: 'Pão de Queijo',
    maxLength: 50
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(2, 50, { message: 'Nome deve ter entre 2 e 50 caracteres' })
  nome: string;

  @ApiPropertyOptional({ 
    description: 'Descrição detalhada do tipo de pão',
    example: 'Pão de queijo tradicional mineiro, feito com polvilho azedo'
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @ApiProperty({ 
    description: 'Preço base do tipo de pão (aceita formato brasileiro: 50,00 ou 50.00)',
    example: '3,50',
    minimum: 0
  })
  @IsNotEmpty({ message: 'Preço base é obrigatório' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return value;
    }

    // Se for string, converter para número
    if (typeof value === 'string') {
      // Remover todos os caracteres não numéricos exceto vírgula e ponto
      let cleanValue = value.replace(/[^\d,.-]/g, '');
      
      // Se tiver vírgula, assumir que é separador decimal (formato brasileiro)
      if (cleanValue.includes(',')) {
        // Se tiver ponto também, remover o ponto (ex: 1.234,56)
        if (cleanValue.includes('.')) {
          cleanValue = cleanValue.replace(/\./g, '');
        }
        // Substituir vírgula por ponto
        cleanValue = cleanValue.replace(',', '.');
      }
      
      // Converter para número
      const numericValue = parseFloat(cleanValue);
      
      // Verificar se é um número válido
      if (isNaN(numericValue)) {
        throw new Error('Valor monetário inválido');
      }
      
      return numericValue;
    }

    // Se já for número, retornar como está
    if (typeof value === 'number') {
      return value;
    }

    return value;
  })
  @IsNumber({}, { message: 'Preço base deve ser um número válido' })
  @Min(0, { message: 'Preço base deve ser maior ou igual a zero' })
  precoBase: number;

  @ApiPropertyOptional({ 
    description: 'Indica se o tipo de pão está ativo',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
} 