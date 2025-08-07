import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoPao } from '../../../../infrastructure/database/entities/tipo-pao.entity';
import { CreateTipoPaoDto } from '../dto/create-tipo-pao.dto';
import { UpdateTipoPaoDto } from '../dto/update-tipo-pao.dto';
import { KafkaProducerService } from '../../../../infrastructure/messaging/kafka/kafka-producer.service';

@Injectable()
export class TiposPaoService {
  constructor(
    @InjectRepository(TipoPao)
    private readonly tipoPaoRepository: Repository<TipoPao>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(createTipoPaoDto: CreateTipoPaoDto): Promise<TipoPao> {
    // Verificar se já existe um tipo de pão com o mesmo nome
    const existingTipoPao = await this.tipoPaoRepository.findOne({
      where: { nome: createTipoPaoDto.nome }
    });

    if (existingTipoPao) {
      throw new ConflictException(`Tipo de pão com nome ${createTipoPaoDto.nome} já existe`);
    }

    const tipoPao = this.tipoPaoRepository.create(createTipoPaoDto);
    const savedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    // Enviar evento Kafka para tipo de pão criado
    try {
      await this.kafkaProducer.sendTipoPaoCreated(savedTipoPao);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'TIPO_PAO_CREATED_ANALYTICS',
        tipoPaoId: savedTipoPao.id,
        nome: savedTipoPao.nome,
        precoBase: savedTipoPao.preco_base,
        ativo: savedTipoPao.ativo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

    return savedTipoPao;
  }

  async findAll(): Promise<TipoPao[]> {
    return await this.tipoPaoRepository.find({
      order: { nome: 'ASC' }
    });
  }

  async findAtivos(): Promise<TipoPao[]> {
    return await this.tipoPaoRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' }
    });
  }

  async findOne(id: number): Promise<TipoPao> {
    const tipoPao = await this.tipoPaoRepository.findOne({
      where: { id }
    });
    
    if (!tipoPao) {
      throw new NotFoundException(`Tipo de pão com ID ${id} não encontrado`);
    }
    
    return tipoPao;
  }

  async findByNome(nome: string): Promise<TipoPao> {
    const tipoPao = await this.tipoPaoRepository.findOne({
      where: { nome }
    });
    
    if (!tipoPao) {
      throw new NotFoundException(`Tipo de pão com nome ${nome} não encontrado`);
    }
    
    return tipoPao;
  }

  async update(id: number, updateTipoPaoDto: UpdateTipoPaoDto): Promise<TipoPao> {
    const tipoPao = await this.findOne(id);

    // Se o nome está sendo atualizado, verificar se já existe
    if (updateTipoPaoDto.nome && updateTipoPaoDto.nome !== tipoPao.nome) {
      const existingTipoPao = await this.tipoPaoRepository.findOne({
        where: { nome: updateTipoPaoDto.nome }
      });

      if (existingTipoPao) {
        throw new ConflictException(`Tipo de pão com nome ${updateTipoPaoDto.nome} já existe`);
      }
    }

    Object.assign(tipoPao, updateTipoPaoDto);
    const updatedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    // Enviar evento Kafka para tipo de pão atualizado
    try {
      await this.kafkaProducer.sendTipoPaoUpdated(updatedTipoPao);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'TIPO_PAO_UPDATED_ANALYTICS',
        tipoPaoId: updatedTipoPao.id,
        nome: updatedTipoPao.nome,
        precoBase: updatedTipoPao.preco_base,
        ativo: updatedTipoPao.ativo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

    return updatedTipoPao;
  }

  async toggleAtivo(id: number): Promise<TipoPao> {
    const tipoPao = await this.findOne(id);
    tipoPao.ativo = !tipoPao.ativo;
    
    const updatedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    // Enviar evento Kafka para tipo de pão atualizado
    try {
      await this.kafkaProducer.sendTipoPaoUpdated(updatedTipoPao);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'TIPO_PAO_TOGGLE_ANALYTICS',
        tipoPaoId: updatedTipoPao.id,
        nome: updatedTipoPao.nome,
        ativo: updatedTipoPao.ativo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

    return updatedTipoPao;
  }

  async remove(id: number): Promise<void> {
    const tipoPao = await this.findOne(id);
    
    // Enviar evento Kafka para tipo de pão removido
    try {
      await this.kafkaProducer.sendTipoPaoDeleted(id);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'TIPO_PAO_DELETED_ANALYTICS',
        tipoPaoId: tipoPao.id,
        nome: tipoPao.nome,
        precoBase: tipoPao.preco_base,
        ativo: tipoPao.ativo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

    await this.tipoPaoRepository.remove(tipoPao);
  }
} 