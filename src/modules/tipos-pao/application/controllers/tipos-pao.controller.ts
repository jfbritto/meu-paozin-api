import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TiposPaoService } from '../services/tipos-pao.service';
import { CreateTipoPaoDto } from '../dto/create-tipo-pao.dto';
import { UpdateTipoPaoDto } from '../dto/update-tipo-pao.dto';
import { TipoPao } from '../../../../infrastructure/database/entities/tipo-pao.entity';

@ApiTags('Tipos de Pão')
@Controller('tipos-pao')
export class TiposPaoController {
  constructor(private readonly tiposPaoService: TiposPaoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo tipo de pão' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tipo de pão criado com sucesso',
    type: TipoPao 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Já existe um tipo de pão com este nome' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  async create(@Body() createTipoPaoDto: CreateTipoPaoDto): Promise<TipoPao> {
    return await this.tiposPaoService.create(createTipoPaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tipos de pão' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tipos de pão retornada com sucesso',
    type: [TipoPao] 
  })
  async findAll(): Promise<TipoPao[]> {
    return await this.tiposPaoService.findAll();
  }

  @Get('ativos')
  @ApiOperation({ summary: 'Listar apenas tipos de pão ativos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tipos de pão ativos retornada com sucesso',
    type: [TipoPao] 
  })
  async findActive(): Promise<TipoPao[]> {
    return await this.tiposPaoService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de pão por ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do tipo de pão',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tipo de pão encontrado com sucesso',
    type: TipoPao 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tipo de pão não encontrado' 
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TipoPao> {
    return await this.tiposPaoService.findOne(id);
  }

  @Get('nome/:nome')
  @ApiOperation({ summary: 'Buscar tipo de pão por nome' })
  @ApiParam({ 
    name: 'nome', 
    description: 'Nome do tipo de pão',
    example: 'Pão de Queijo'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tipo de pão encontrado com sucesso',
    type: TipoPao 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tipo de pão não encontrado' 
  })
  async findByName(@Param('nome') nome: string): Promise<TipoPao> {
    return await this.tiposPaoService.findByName(nome);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tipo de pão' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do tipo de pão',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tipo de pão atualizado com sucesso',
    type: TipoPao 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tipo de pão não encontrado' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Já existe um tipo de pão com este nome' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoPaoDto: UpdateTipoPaoDto
  ): Promise<TipoPao> {
    return await this.tiposPaoService.update(id, updateTipoPaoDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Alternar status ativo/inativo do tipo de pão' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do tipo de pão',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status alternado com sucesso',
    type: TipoPao 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tipo de pão não encontrado' 
  })
  async toggleActive(@Param('id', ParseIntPipe) id: number): Promise<TipoPao> {
    return await this.tiposPaoService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir tipo de pão' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do tipo de pão',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Tipo de pão excluído com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tipo de pão não encontrado' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Não é possível excluir um tipo de pão que possui pedidos associados' 
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.tiposPaoService.remove(id);
  }
} 