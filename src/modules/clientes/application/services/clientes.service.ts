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
      throw new ConflictException(`Cliente com email ${createClienteDto.email} já existe`);
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
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

    return savedCliente;
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      order: { data_criacao: 'DESC' }
    });
  }

  async findAtivos(): Promise<Cliente[]> {
    // Como não temos campo 'ativo' na entidade Cliente, retornamos todos
    // Em uma implementação futura, podemos adicionar esse campo
    return await this.clienteRepository.find({
      order: { data_criacao: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Cliente> {
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
    const cliente = await this.findOne(id);

    // Se o email está sendo atualizado, verificar se já existe
    if (updateClienteDto.email && updateClienteDto.email !== cliente.email) {
      const existingCliente = await this.clienteRepository.findOne({
        where: { email: updateClienteDto.email }
      });

      if (existingCliente) {
        throw new ConflictException(`Cliente com email ${updateClienteDto.email} já existe`);
      }
    }

    Object.assign(cliente, updateClienteDto);
    const updatedCliente = await this.clienteRepository.save(cliente);

    // Enviar evento Kafka para cliente atualizado
    try {
      await this.kafkaProducer.sendClienteUpdated(updatedCliente);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'CLIENTE_UPDATED_ANALYTICS',
        clienteId: updatedCliente.id,
        nome: updatedCliente.nome,
        email: updatedCliente.email,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

    return updatedCliente;
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    
    // Enviar evento Kafka para cliente removido
    try {
      await this.kafkaProducer.sendClienteDeleted(id);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'CLIENTE_DELETED_ANALYTICS',
        clienteId: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

    await this.clienteRepository.remove(cliente);
  }
} 