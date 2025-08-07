import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PedidosService } from '../services/pedidos.service';
import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { UpdatePedidoDto } from '../dto/update-pedido.dto';
import { GetPedidosRecentesDto } from '../dto/get-pedidos-recentes.dto';
import { Pedido, StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';
import { DatadogMetrics, DatadogEvents, DatadogTrace } from '../../../../infrastructure/observability/datadog/datadog.decorator';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiResponse({ 
    status: 201, 
    description: 'Pedido criado com sucesso',
    type: Pedido 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cliente ou tipo de pão não encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  @DatadogTrace('pedido.create', { operation: 'create_pedido' })
  @DatadogMetrics(
    { name: 'pedido.created', value: 1, tags: { operation: 'create' } }
  )
  @DatadogEvents(
    { name: 'pedido.created', attributes: { operation: 'create_pedido' } }
  )
  async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    return await this.pedidosService.create(createPedidoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pedidos retornada com sucesso',
    type: [Pedido] 
  })
  async findAll(): Promise<Pedido[]> {
    return await this.pedidosService.findAll();
  }

  @Get('status')
  @ApiOperation({ summary: 'Listar todos os status disponíveis' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de status retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(StatusPedido)
      }
    }
  })
  async getStatusOptions(): Promise<StatusPedido[]> {
    return Object.values(StatusPedido);
  }

  @Get('recentes')
  @ApiOperation({ summary: 'Listar pedidos recentes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pedidos recentes retornada com sucesso',
    type: [Pedido] 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parâmetros inválidos' 
  })
  @DatadogTrace('pedido.recentes', { operation: 'get_recent_pedidos' })
  @DatadogMetrics(
    { name: 'pedido.recentes.accessed', value: 1, tags: { operation: 'get_recent' } }
  )
  async findRecent(@Query() query: GetPedidosRecentesDto): Promise<Pedido[]> {
    // Usar valor padrão se não fornecido
    const limit = query.limit || 10;
    
    return await this.pedidosService.getPedidosRecentes(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do pedido',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pedido encontrado com sucesso',
    type: Pedido 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pedido não encontrado' 
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return await this.pedidosService.findOne(id);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Buscar pedidos por status' })
  @ApiParam({ 
    name: 'status', 
    description: 'Status do pedido',
    enum: StatusPedido,
    example: StatusPedido.REALIZADO
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pedidos por status retornada com sucesso',
    type: [Pedido] 
  })
  async findByStatus(@Param('status') status: StatusPedido): Promise<Pedido[]> {
    return await this.pedidosService.findByStatus(status);
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: 'Buscar pedidos por cliente' })
  @ApiParam({ 
    name: 'clienteId', 
    description: 'ID do cliente',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pedidos por cliente retornada com sucesso',
    type: [Pedido] 
  })
  async findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number): Promise<Pedido[]> {
    return await this.pedidosService.findByCliente(clienteId);
  }

  @Get('tipo-pao/:tipoPaoId')
  @ApiOperation({ summary: 'Buscar pedidos por tipo de pão' })
  @ApiParam({ 
    name: 'tipoPaoId', 
    description: 'ID do tipo de pão',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pedidos por tipo de pão retornada com sucesso',
    type: [Pedido] 
  })
  async findByTipoPao(@Param('tipoPaoId', ParseIntPipe) tipoPaoId: number): Promise<Pedido[]> {
    return await this.pedidosService.findByTipoPao(tipoPaoId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do pedido',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pedido atualizado com sucesso',
    type: Pedido 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pedido, cliente ou tipo de pão não encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoDto: UpdatePedidoDto
  ): Promise<Pedido> {
    return await this.pedidosService.update(id, updatePedidoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir pedido' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do pedido',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Pedido excluído com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pedido não encontrado' 
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.pedidosService.remove(id);
  }
}
