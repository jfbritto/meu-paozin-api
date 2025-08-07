import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Length, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StatusPedido {
  CANCELADO = 'CANCELADO',
  REALIZADO = 'REALIZADO',
  ACEITO = 'ACEITO',
  EM_PREPARO = 'EM_PREPARO',
  SAIU_PARA_ENTREGA = 'SAIU_PARA_ENTREGA',
  FINALIZADO = 'FINALIZADO'
}

@Entity('pedidos')
export class Pedido {
  @ApiProperty({ description: 'ID único do pedido' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID do cliente' })
  @Column({ type: 'int', nullable: false })
  @IsNumber({}, { message: 'Cliente ID deve ser um número' })
  @IsNotEmpty({ message: 'Cliente ID é obrigatório' })
  clienteId: number;

  @ApiProperty({ description: 'ID do tipo de pão' })
  @Column({ type: 'int', nullable: false })
  @IsNumber({}, { message: 'Tipo de pão ID deve ser um número' })
  @IsNotEmpty({ message: 'Tipo de pão ID é obrigatório' })
  tipoPaoId: number;

  @ApiProperty({ description: 'Quantidade do pedido' })
  @Column({ type: 'int', nullable: false })
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser maior que zero' })
  quantidade: number;

  @ApiProperty({ description: 'Preço total do pedido' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  @IsNumber({}, { message: 'Preço total deve ser um número' })
  @Min(0, { message: 'Preço total deve ser maior ou igual a zero' })
  precoTotal: number;

  @ApiProperty({ 
    description: 'Status do pedido',
    enum: StatusPedido,
    example: StatusPedido.REALIZADO
  })
  @Column({ 
    type: 'enum', 
    enum: StatusPedido, 
    nullable: false, 
    default: StatusPedido.REALIZADO 
  })
  @IsEnum(StatusPedido, { message: 'Status deve ser um valor válido' })
  status: StatusPedido;

  @ApiPropertyOptional({ description: 'Observações do pedido' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  @Length(0, 500, { message: 'Observações deve ter no máximo 500 caracteres' })
  observacoes?: string;

  @ApiProperty({ description: 'Data do pedido' })
  @CreateDateColumn({ name: 'data_pedido' })
  dataPedido: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn({ name: 'data_atualizacao' })
  dataAtualizacao: Date;

  // Relacionamentos
  @ManyToOne('Cliente', 'pedidos', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: any;

  @ManyToOne('TipoPao', 'pedidos', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tipo_pao_id' })
  tipoPao: any;
} 