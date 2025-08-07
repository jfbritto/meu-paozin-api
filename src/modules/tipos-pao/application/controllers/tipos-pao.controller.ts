import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TiposPaoService } from '../services/tipos-pao.service';
import { CreateTipoPaoDto } from '../dto/create-tipo-pao.dto';
import { UpdateTipoPaoDto } from '../dto/update-tipo-pao.dto';
import { TipoPao } from '../../../../infrastructure/database/entities/tipo-pao.entity';
import { LoggingInterceptor } from '../../../../common/interceptors/logging.interceptor';

@ApiTags('Tipos de Pão')
@Controller('tipos-pao')
@UseInterceptors(LoggingInterceptor)
export class TiposPaoController {
  constructor(private readonly tiposPaoService: TiposPaoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo tipo de pão' })
  @ApiResponse({ status: 201, description: 'Tipo de pão criado com sucesso', type: TipoPao })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Nome já existe' })
  async create(@Body() createTipoPaoDto: CreateTipoPaoDto): Promise<TipoPao> {
    return this.tiposPaoService.create(createTipoPaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tipos de pão' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de pão retornada', type: [TipoPao] })
  async findAll(): Promise<TipoPao[]> {
    return this.tiposPaoService.findAll();
  }

  @Get('ativos')
  @ApiOperation({ summary: 'Listar tipos de pão ativos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de pão ativos retornada', type: [TipoPao] })
  async findAtivos(): Promise<TipoPao[]> {
    return this.tiposPaoService.findAtivos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de pão por ID' })
  @ApiParam({ name: 'id', description: 'ID do tipo de pão' })
  @ApiResponse({ status: 200, description: 'Tipo de pão encontrado', type: TipoPao })
  @ApiResponse({ status: 404, description: 'Tipo de pão não encontrado' })
  async findOne(@Param('id') id: string): Promise<TipoPao> {
    return this.tiposPaoService.findOne(+id);
  }

  @Get('nome/:nome')
  @ApiOperation({ summary: 'Buscar tipo de pão por nome' })
  @ApiParam({ name: 'nome', description: 'Nome do tipo de pão' })
  @ApiResponse({ status: 200, description: 'Tipo de pão encontrado', type: TipoPao })
  @ApiResponse({ status: 404, description: 'Tipo de pão não encontrado' })
  async findByNome(@Param('nome') nome: string): Promise<TipoPao> {
    return this.tiposPaoService.findByNome(nome);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tipo de pão' })
  @ApiParam({ name: 'id', description: 'ID do tipo de pão' })
  @ApiResponse({ status: 200, description: 'Tipo de pão atualizado com sucesso', type: TipoPao })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Tipo de pão não encontrado' })
  @ApiResponse({ status: 409, description: 'Nome já existe' })
  async update(@Param('id') id: string, @Body() updateTipoPaoDto: UpdateTipoPaoDto): Promise<TipoPao> {
    return this.tiposPaoService.update(+id, updateTipoPaoDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Alternar status ativo/inativo do tipo de pão' })
  @ApiParam({ name: 'id', description: 'ID do tipo de pão' })
  @ApiResponse({ status: 200, description: 'Status alternado com sucesso', type: TipoPao })
  @ApiResponse({ status: 404, description: 'Tipo de pão não encontrado' })
  async toggleAtivo(@Param('id') id: string): Promise<TipoPao> {
    return this.tiposPaoService.toggleAtivo(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir tipo de pão' })
  @ApiParam({ name: 'id', description: 'ID do tipo de pão' })
  @ApiResponse({ status: 204, description: 'Tipo de pão excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Tipo de pão não encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.tiposPaoService.remove(+id);
  }
} 