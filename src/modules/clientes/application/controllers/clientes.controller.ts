import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClientesService } from '../services/clientes.service';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';
import { Cliente } from '../../../../infrastructure/database/entities/cliente.entity';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ 
    status: 201, 
    description: 'Cliente criado com sucesso',
    type: Cliente 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Já existe um cliente com este email' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  async create(@Body() createClienteDto: CreateClienteDto): Promise<Cliente> {
    return await this.clientesService.create(createClienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de clientes retornada com sucesso',
    type: [Cliente] 
  })
  async findAll(): Promise<Cliente[]> {
    return await this.clientesService.findAll();
  }

  @Get('ativos')
  @ApiOperation({ summary: 'Listar apenas clientes ativos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de clientes ativos retornada com sucesso',
    type: [Cliente] 
  })
  async findActive(): Promise<Cliente[]> {
    return await this.clientesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do cliente',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cliente encontrado com sucesso',
    type: Cliente 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cliente não encontrado' 
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Cliente> {
    return await this.clientesService.findOne(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Buscar cliente por email' })
  @ApiParam({ 
    name: 'email', 
    description: 'Email do cliente',
    example: 'joao.silva@email.com'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cliente encontrado com sucesso',
    type: Cliente 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cliente não encontrado' 
  })
  async findByEmail(@Param('email') email: string): Promise<Cliente> {
    return await this.clientesService.findByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do cliente',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cliente atualizado com sucesso',
    type: Cliente 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cliente não encontrado' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Já existe um cliente com este email' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto
  ): Promise<Cliente> {
    return await this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir cliente' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do cliente',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Cliente excluído com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cliente não encontrado' 
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.clientesService.remove(id);
  }
} 