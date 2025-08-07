import { IsEmail, IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({ 
    description: 'Nome completo do cliente',
    example: 'João Silva',
    maxLength: 100
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  nome: string;

  @ApiProperty({ 
    description: 'Email do cliente',
    example: 'joao.silva@email.com',
    maxLength: 100
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiPropertyOptional({ 
    description: 'Telefone do cliente',
    example: '(11) 99999-9999',
    maxLength: 20
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @Length(10, 20, { message: 'Telefone deve ter entre 10 e 20 caracteres' })
  telefone?: string;

  @ApiPropertyOptional({ 
    description: 'Endereço do cliente',
    example: 'Rua das Flores, 123 - Centro'
  })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  endereco?: string;
} 