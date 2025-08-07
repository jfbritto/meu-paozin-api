import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoPao } from '../../../../infrastructure/database/entities/tipo-pao.entity';
import { CreateTipoPaoDto } from '../dto/create-tipo-pao.dto';
import { UpdateTipoPaoDto } from '../dto/update-tipo-pao.dto';

@Injectable()
export class TiposPaoService {
  constructor(
    @InjectRepository(TipoPao)
    private readonly tipoPaoRepository: Repository<TipoPao>,
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
    
    Object.assign(tipoPao, updateTipoPaoDto);
    const updatedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    return updatedTipoPao;
  }

  async toggleActive(id: number): Promise<TipoPao> {
    const tipoPao = await this.findById(id);
    
    tipoPao.ativo = !tipoPao.ativo;
    const updatedTipoPao = await this.tipoPaoRepository.save(tipoPao);

    return updatedTipoPao;
  }

  async remove(id: number): Promise<void> {
    const tipoPao = await this.findById(id);
    await this.tipoPaoRepository.remove(tipoPao);
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