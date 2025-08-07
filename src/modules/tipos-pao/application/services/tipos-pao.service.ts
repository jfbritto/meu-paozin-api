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

    const tipoPao = this.tipoPaoRepository.create(createTipoPaoDto);
    const savedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    // Enviar evento para Kafka
    await this.kafkaProducer.sendTipoPaoCreated({
      id: savedTipoPao.id,
      nome: savedTipoPao.nome,
      descricao: savedTipoPao.descricao,
      preco_base: savedTipoPao.preco_base,
      ativo: savedTipoPao.ativo,
      data_criacao: savedTipoPao.data_criacao,
    });

    return savedTipoPao;
  }

  async findAll(): Promise<TipoPao[]> {
    return this.tipoPaoRepository.find({
      order: { data_criacao: 'DESC' }
    });
  }

  async findActive(): Promise<TipoPao[]> {
    return this.tipoPaoRepository.find({
      where: { ativo: true },
      order: { data_criacao: 'DESC' }
    });
  }

  async findById(id: number): Promise<TipoPao> {
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
    const tipoPao = await this.findById(id);
    
    // Se o nome está sendo alterado, verificar se já existe
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

    // Enviar evento para Kafka
    await this.kafkaProducer.sendTipoPaoUpdated({
      id: updatedTipoPao.id,
      nome: updatedTipoPao.nome,
      descricao: updatedTipoPao.descricao,
      previousPrecoBase: previousData.preco_base,
      newPrecoBase: updatedTipoPao.preco_base,
      ativo: updatedTipoPao.ativo,
      data_atualizacao: updatedTipoPao.data_atualizacao,
    });

    return updatedTipoPao;
  }

  async toggleActive(id: number): Promise<TipoPao> {
    const tipoPao = await this.findById(id);
    
    tipoPao.ativo = !tipoPao.ativo;
    const updatedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    // Enviar evento para Kafka
    await this.kafkaProducer.sendTipoPaoUpdated({
      id: updatedTipoPao.id,
      nome: updatedTipoPao.nome,
      descricao: updatedTipoPao.descricao,
      ativo: updatedTipoPao.ativo,
      data_atualizacao: updatedTipoPao.data_atualizacao,
    });

    return updatedTipoPao;
  }

  async remove(id: number): Promise<void> {
    const tipoPao = await this.findById(id);
    
    await this.tipoPaoRepository.remove(tipoPao);

    // Enviar evento para Kafka
    await this.kafkaProducer.sendTipoPaoDeleted(tipoPao.id);
  }

  async getTipoPaoStats(): Promise<any> {
    const total = await this.tipoPaoRepository.count();
    const ativos = await this.tipoPaoRepository.count({ where: { ativo: true } });
    const inativos = total - ativos;

    return {
      total,
      ativos,
      inativos,
    };
  }
} 