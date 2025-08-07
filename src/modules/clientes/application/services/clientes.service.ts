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

    // Enviar evento Kafka para cliente criado
    try {
      await this.kafkaProducer.sendClienteCreated(savedCliente);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'CLIENTE_CREATED_ANALYTICS',
        clienteId: savedCliente.id,
        nome: savedCliente.nome,
        email: savedCliente.email,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
    }

    return savedCliente;
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      order: { dataCriacao: 'DESC' }
    });
  }

  async findActive(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      order: { nome: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['pedidos']
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
    const cliente = await this.findOne(id);
    const previousData = { ...cliente };

    // Se estiver atualizando o email, verificar se já existe outro cliente com o mesmo email
    if (updateClienteDto.email && updateClienteDto.email !== cliente.email) {
      const existingCliente = await this.clienteRepository.findOne({
        where: { email: updateClienteDto.email }
      });

      if (existingCliente) {
        throw new ConflictException('Já existe um cliente com este email');
      }
    }

    Object.assign(cliente, updateClienteDto);
    const updatedCliente = await this.clienteRepository.save(cliente);

    // Enviar evento Kafka para cliente atualizado
    try {
      await this.kafkaProducer.sendClienteUpdated(updatedCliente, previousData);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'CLIENTE_UPDATED_ANALYTICS',
        clienteId: updatedCliente.id,
        nome: updatedCliente.nome,
        email: updatedCliente.email,
        changes: updateClienteDto,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
    }

    return updatedCliente;
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    
    // Enviar evento Kafka para cliente deletado
    try {
      await this.kafkaProducer.sendClienteDeleted(cliente);
      
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'CLIENTE_DELETED_ANALYTICS',
        clienteId: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        pedidosCount: cliente.pedidos?.length || 0,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
    }

    await this.clienteRepository.remove(cliente);
  }
} 