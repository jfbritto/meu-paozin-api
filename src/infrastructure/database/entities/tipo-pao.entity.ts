import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('tipos_pao')
export class TipoPao {
  @ApiProperty({ description: 'ID único do tipo de pão' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nome do tipo de pão' })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(2, 50, { message: 'Nome deve ter entre 2 e 50 caracteres' })
  nome: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada do tipo de pão' })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @ApiProperty({ description: 'Preço base do tipo de pão' })
  @Column({ name: 'preco_base', type: 'decimal', precision: 10, scale: 2, nullable: false })
  @IsNumber({}, { message: 'Preço base deve ser um número' })
  @Min(0, { message: 'Preço base deve ser maior ou igual a zero' })
  preco_base: number;

  @ApiProperty({ description: 'Indica se o tipo de pão está ativo' })
  @Column({ type: 'boolean', default: true })
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo: boolean;

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn({ name: 'data_criacao' })
  data_criacao: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'data_atualizacao' })
  data_atualizacao: Date;

  // Relacionamento com pedidos
  @OneToMany('Pedido', 'tipo_pao')
  pedidos: any[];
} 