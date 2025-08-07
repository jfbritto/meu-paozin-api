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
      throw new ConflictException('Já existe um tipo de pão com este nome');
    }

    const tipoPao = this.tipoPaoRepository.create({
      ...createTipoPaoDto,
      ativo: createTipoPaoDto.ativo ?? true
    });
    
    const savedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    // Enviar evento Kafka para tipo de pão criado
    try {
      await this.kafkaProducer.sendTipoPaoCreated(savedTipoPao);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'TIPO_PAO_CREATED_ANALYTICS',
        tipoPaoId: savedTipoPao.id,
        nome: savedTipoPao.nome,
        precoBase: savedTipoPao.precoBase,
        ativo: savedTipoPao.ativo,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
    }

    return savedTipoPao;
  }

  async findAll(): Promise<TipoPao[]> {
    return await this.tipoPaoRepository.find({
      order: { nome: 'ASC' }
    });
  }

  async findActive(): Promise<TipoPao[]> {
    return await this.tipoPaoRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' }
    });
  }

  async findOne(id: number): Promise<TipoPao> {
    const tipoPao = await this.tipoPaoRepository.findOne({
      where: { id },
      relations: ['pedidos']
    });

    if (!tipoPao) {
      throw new NotFoundException(`Tipo de pão com ID ${id} não encontrado`);
    }

    return tipoPao;
  }

  async findByName(nome: string): Promise<TipoPao> {
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

    // Se estiver atualizando o nome, verificar se já existe outro tipo de pão com o mesmo nome
    if (updateTipoPaoDto.nome && updateTipoPaoDto.nome !== tipoPao.nome) {
      const existingTipoPao = await this.tipoPaoRepository.findOne({
        where: { nome: updateTipoPaoDto.nome }
      });

      if (existingTipoPao) {
        throw new ConflictException('Já existe um tipo de pão com este nome');
      }
    }

    const previousData = { ...tipoPao };
    
    Object.assign(tipoPao, updateTipoPaoDto);
    const updatedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    // Enviar evento Kafka se houve mudanças significativas
    try {
      if (updateTipoPaoDto.precoBase !== undefined || updateTipoPaoDto.ativo !== undefined) {
        await this.kafkaProducer.sendTipoPaoUpdated(updatedTipoPao);
        
        // Enviar evento de analytics
        await this.kafkaProducer.sendAnalyticsEvent({
          eventType: 'TIPO_PAO_UPDATED_ANALYTICS',
          tipoPaoId: updatedTipoPao.id,
          nome: updatedTipoPao.nome,
          previousPrecoBase: previousData.precoBase,
          newPrecoBase: updatedTipoPao.precoBase,
          previousAtivo: previousData.ativo,
          newAtivo: updatedTipoPao.ativo,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
    }

    return updatedTipoPao;
  }

  async toggleActive(id: number): Promise<TipoPao> {
    const tipoPao = await this.findOne(id);
    tipoPao.ativo = !tipoPao.ativo;
    return await this.tipoPaoRepository.save(tipoPao);
  }

  async remove(id: number): Promise<void> {
    const tipoPao = await this.findOne(id);
    
    // Verificar se há pedidos associados
    if (tipoPao.pedidos && tipoPao.pedidos.length > 0) {
      throw new ConflictException('Não é possível excluir um tipo de pão que possui pedidos associados');
    }

    // Enviar evento Kafka para tipo de pão deletado
    try {
      await this.kafkaProducer.sendTipoPaoDeleted(tipoPao);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'TIPO_PAO_DELETED_ANALYTICS',
        tipoPaoId: tipoPao.id,
        nome: tipoPao.nome,
        precoBase: tipoPao.precoBase,
        ativo: tipoPao.ativo,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
    }

    await this.tipoPaoRepository.remove(tipoPao);
  }
} 