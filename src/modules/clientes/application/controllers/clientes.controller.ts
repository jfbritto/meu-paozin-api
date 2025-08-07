import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClientesService } from '../services/clientes.service';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';
import { Cliente } from '../../../../infrastructure/database/entities/cliente.entity';
import { LoggingInterceptor } from '../../../../common/interceptors/logging.interceptor';

@ApiTags('Clientes')
@Controller('clientes')
@UseInterceptors(LoggingInterceptor)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso', type: Cliente })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já existe' })
  async create(@Body() createClienteDto: CreateClienteDto): Promise<Cliente> {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada', type: [Cliente] })
  async findAll(): Promise<Cliente[]> {
    return this.clientesService.findAll();
  }

  @Get('ativos')
  @ApiOperation({ summary: 'Listar clientes ativos' })
  @ApiResponse({ status: 200, description: 'Lista de clientes ativos retornada', type: [Cliente] })
  async findAtivos(): Promise<Cliente[]> {
    return this.clientesService.findAtivos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: Cliente })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Param('id') id: string): Promise<Cliente> {
    return this.clientesService.findOne(+id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Buscar cliente por email' })
  @ApiParam({ name: 'email', description: 'Email do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: Cliente })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findByEmail(@Param('email') email: string): Promise<Cliente> {
    return this.clientesService.findByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso', type: Cliente })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já existe' })
  async update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    return this.clientesService.update(+id, updateClienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 204, description: 'Cliente excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.clientesService.remove(+id);
  }
} 