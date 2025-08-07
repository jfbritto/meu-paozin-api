import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../../../../infrastructure/database/entities/cliente.entity';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';
import { KafkaProducerService } from '../../../../infrastructure/messaging/kafka/kafka-producer.service';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    // Verificar se já existe um cliente com o mesmo email
    const existingCliente = await this.clienteRepository.findOne({
      where: { email: createClienteDto.email }
    });

    if (existingCliente) {
      throw new ConflictException('Já existe um cliente com este email');
    }

    const cliente = this.clienteRepository.create(createClienteDto);
    const savedCliente = await this.clienteRepository.save(cliente);

    // Enviar evento para Kafka
    await this.kafkaProducer.sendClienteCreated(savedCliente);

    return savedCliente;
  }

  async findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find({
      order: { data_criacao: 'DESC' }
    });
  }

  async findActive(): Promise<Cliente[]> {
    return this.clienteRepository.find({
      where: { ativo: true },
      order: { data_criacao: 'DESC' }
    });
  }

  async findById(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id }
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return cliente;
  }

  async findByEmail(email: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { email }
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com email ${email} não encontrado`);
    }

    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findById(id);
    
    // Se o email está sendo alterado, verificar se já existe
    if (updateClienteDto.email && updateClienteDto.email !== cliente.email) {
      const existingCliente = await this.clienteRepository.findOne({
        where: { email: updateClienteDto.email }
      });

      if (existingCliente) {
        throw new ConflictException('Já existe um cliente com este email');
      }
    }

    const previousData = { ...cliente };
    
    Object.assign(cliente, updateClienteDto);
    const updatedCliente = await this.clienteRepository.save(cliente);

    // Enviar evento para Kafka
    await this.kafkaProducer.sendClienteUpdated(updatedCliente);

    return updatedCliente;
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findById(id);
    
    await this.clienteRepository.remove(cliente);

    // Enviar evento para Kafka
    await this.kafkaProducer.sendClienteDeleted(cliente.id);
  }
} 