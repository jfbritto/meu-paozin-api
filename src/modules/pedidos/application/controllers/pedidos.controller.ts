import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PedidosService } from '../services/pedidos.service';
import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { UpdatePedidoDto } from '../dto/update-pedido.dto';
import { Pedido, StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';
import { LoggingInterceptor } from '../../../../common/interceptors/logging.interceptor';

@ApiTags('Pedidos')
@Controller('pedidos')
@UseInterceptors(LoggingInterceptor)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso', type: Pedido })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Cliente ou tipo de pão não encontrado' })
  async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada', type: [Pedido] })
  async findAll(): Promise<Pedido[]> {
    return this.pedidosService.findAll();
  }

  @Get('status')
  @ApiOperation({ summary: 'Listar status disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de status retornada' })
  getStatusDisponiveis(): StatusPedido[] {
    return this.pedidosService.getStatusDisponiveis();
  }

  @Get('recentes')
  @ApiOperation({ summary: 'Listar pedidos recentes' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de pedidos (padrão: 10)' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos recentes retornada', type: [Pedido] })
  async getPedidosRecentes(@Query('limit') limit?: number): Promise<Pedido[]> {
    return this.pedidosService.getPedidosRecentes(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado', type: Pedido })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async findOne(@Param('id') id: string): Promise<Pedido> {
    return this.pedidosService.findOne(+id);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Buscar pedidos por status' })
  @ApiParam({ name: 'status', description: 'Status dos pedidos', enum: StatusPedido })
  @ApiResponse({ status: 200, description: 'Lista de pedidos por status retornada', type: [Pedido] })
  async findByStatus(@Param('status') status: StatusPedido): Promise<Pedido[]> {
    return this.pedidosService.findByStatus(status);
  }

  @Get('cliente/:cliente_id')
  @ApiOperation({ summary: 'Buscar pedidos por cliente' })
  @ApiParam({ name: 'cliente_id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos do cliente retornada', type: [Pedido] })
  async findByCliente(@Param('cliente_id') cliente_id: string): Promise<Pedido[]> {
    return this.pedidosService.findByCliente(+cliente_id);
  }

  @Get('tipo-pao/:tipo_pao_id')
  @ApiOperation({ summary: 'Buscar pedidos por tipo de pão' })
  @ApiParam({ name: 'tipo_pao_id', description: 'ID do tipo de pão' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos do tipo de pão retornada', type: [Pedido] })
  async findByTipoPao(@Param('tipo_pao_id') tipo_pao_id: string): Promise<Pedido[]> {
    return this.pedidosService.findByTipoPao(+tipo_pao_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido atualizado com sucesso', type: Pedido })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
    return this.pedidosService.update(+id, updatePedidoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 204, description: 'Pedido excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.pedidosService.remove(+id);
  }
}
