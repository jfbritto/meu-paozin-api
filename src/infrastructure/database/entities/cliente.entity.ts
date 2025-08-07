import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('clientes')
export class Cliente {
  @ApiProperty({ description: 'ID único do cliente' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nome completo do cliente' })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  nome: string;

  @ApiProperty({ description: 'Email do cliente' })
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiPropertyOptional({ description: 'Telefone do cliente' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @Length(10, 20, { message: 'Telefone deve ter entre 10 e 20 caracteres' })
  telefone?: string;

  @ApiPropertyOptional({ description: 'Endereço do cliente' })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  endereco?: string;

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn({ name: 'data_criacao' })
  data_criacao: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'data_atualizacao' })
  data_atualizacao: Date;

  // Relacionamento com pedidos
  @OneToMany('Pedido', 'cliente')
  pedidos: any[];
} 